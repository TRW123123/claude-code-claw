#!/usr/bin/env node
/**
 * CLAW Wiki → Supabase Sync
 *
 * Liest alle .md Files aus dem Obsidian Vault, chunked sie per H2-Section,
 * generiert Embeddings via Gemini und upserted sie in Supabase claw.memories.
 *
 * Timestamp-basiert: Synced nur Files die seit dem letzten erfolgreichen Lauf
 * geändert wurden. Wenn der letzte Lauf verpasst wurde (Laptop aus), holt er
 * automatisch alles nach.
 *
 * Usage:
 *   node claw-wiki-sync.mjs                    # Sync geänderte Wiki-Files
 *   node claw-wiki-sync.mjs --full             # Force: sync ALLES
 *   node claw-wiki-sync.mjs --dry-run          # Zeigt was passieren würde
 *   node claw-wiki-sync.mjs --file "path.md"   # Sync einzelnes File
 *
 * Env vars: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
 * (aus Claude Code settings.json oder Windows Environment)
 */

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs';
import { join, relative, basename, dirname } from 'path';
import { createHash } from 'crypto';

// ─── Config ─────────────────────────────────────────────────
// Kuratierte Wissensquellen (ausschließen: chatgpt/, sessions/, antigravity/, projects/ — Raw-Dumps)
const VAULT_ROOT = 'C:\\Users\\User\\obsidian-claw-vault';
const VAULT_SUBDIRS = ['wikis', 'concepts', 'kling-3.0', 'seedance-2.0'];
const VAULT_PATH = VAULT_ROOT; // für Pfad-relative Logs
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

const SIGNAL_TYPE = 'wiki-knowledge';
const SOURCE = 'obsidian-vault-sync';
const NAMESPACE = 'wiki';
const EMBEDDING_MODEL = 'models/gemini-embedding-001';
const EMBEDDING_DIM = 768;
const MAX_CHUNK_CHARS = 4000;  // ~1000 tokens, good retrieval unit
const RATE_LIMIT_MS = 1200;    // 1.2s between Gemini calls (safe for free tier)
const TIMESTAMP_FILE = join(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), 'wiki-sync-last-run.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FULL_SYNC = args.includes('--full');
const SINGLE_FILE = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;

// ─── Timestamp Management ───────────────────────────────────
function getLastSyncTime() {
    try {
        if (existsSync(TIMESTAMP_FILE)) {
            const data = JSON.parse(readFileSync(TIMESTAMP_FILE, 'utf-8'));
            return new Date(data.lastSync);
        }
    } catch { /* first run */ }
    return new Date(0);  // epoch = sync everything
}

function saveLastSyncTime() {
    writeFileSync(TIMESTAMP_FILE, JSON.stringify({
        lastSync: new Date().toISOString(),
        filesProcessed: 0  // updated later
    }, null, 2));
}

// ─── Validation ─────────────────────────────────────────────
if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_ANON) {
    console.error('Missing env vars: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY');
    process.exit(1);
}

// ─── Helper: Content Hash ───────────────────────────────────
function contentHash(text) {
    return createHash('sha256').update(text.trim()).digest('hex').slice(0, 16);
}

// ─── Helper: Sleep ──────────────────────────────────────────
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ─── Helper: Domain from path ───────────────────────────────
function domainFromPath(filePath) {
    const rel = relative(VAULT_PATH, filePath).replace(/\\/g, '/');
    const parts = rel.split('/');
    return parts[0] || 'saas-main';  // First directory = domain
}

// ─── Helper: Scope from domain ──────────────────────────────
function scopeFromDomain(domain) {
    const domainMap = {
        'saas-main': 'global',
        'st-automatisierung': 'domain:st-automatisierung',
        'ki-automatisieren': 'domain:ki-automatisieren',
        'profilfoto-ki': 'domain:profilfoto-ki',
        'apexx-bau': 'domain:apexx-bau',
    };
    return domainMap[domain] || 'global';
}

// ─── Chunk a markdown file by H2 sections ───────────────────
function chunkByH2(content, filePath) {
    const fileName = basename(filePath, '.md');
    const domain = domainFromPath(filePath);

    // Extract YAML frontmatter title if present
    let title = fileName;
    const fmMatch = content.match(/^---\n[\s\S]*?title:\s*"?([^"\n]+)"?\n[\s\S]*?---/);
    if (fmMatch) title = fmMatch[1];

    // Remove YAML frontmatter for chunking
    const body = content.replace(/^---\n[\s\S]*?---\n/, '');

    // Split by H2 (## )
    const sections = body.split(/\n(?=## )/);
    const chunks = [];

    for (const section of sections) {
        const trimmed = section.trim();
        if (!trimmed || trimmed.length < 50) continue;  // Skip tiny sections

        // Extract H2 title
        const h2Match = trimmed.match(/^## (.+)/);
        const sectionTitle = h2Match ? h2Match[1].trim() : 'Intro';

        // If section is too large, split by H3
        if (trimmed.length > MAX_CHUNK_CHARS) {
            const subSections = trimmed.split(/\n(?=### )/);
            for (const sub of subSections) {
                if (sub.trim().length < 50) continue;
                const h3Match = sub.trim().match(/^### (.+)/);
                const subTitle = h3Match ? h3Match[1].trim() : sectionTitle;

                chunks.push({
                    id: `wiki-${domain}-${fileName}-${contentHash(sub)}`,
                    text: `[${title}] ${subTitle}\n\n${sub.trim()}`.slice(0, MAX_CHUNK_CHARS),
                    domain,
                    scope: scopeFromDomain(domain),
                    sectionTitle: subTitle,
                    sourceFile: fileName,
                });
            }
        } else {
            chunks.push({
                id: `wiki-${domain}-${fileName}-${contentHash(trimmed)}`,
                text: `[${title}] ${sectionTitle}\n\n${trimmed}`.slice(0, MAX_CHUNK_CHARS),
                domain,
                scope: scopeFromDomain(domain),
                sectionTitle,
                sourceFile: fileName,
            });
        }
    }

    return chunks;
}

// ─── Collect all .md files from vault ───────────────────────
function collectFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
            files.push(...collectFiles(full));
        } else if (entry.endsWith('.md') && !entry.startsWith('_')) {
            files.push(full);
        }
    }
    return files;
}

// ─── Generate embedding via Gemini ──────────────────────────
async function generateEmbedding(text) {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: EMBEDDING_MODEL,
                content: { parts: [{ text: text.trim() }] },
                taskType: 'RETRIEVAL_DOCUMENT',
                outputDimensionality: EMBEDDING_DIM
            })
        }
    );
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini embedding failed (${res.status}): ${err}`);
    }
    const data = await res.json();
    return data.embedding.values;
}

// ─── Upsert to Supabase ────────────────────────────────────
async function upsertMemory(chunk, embedding) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/claw_upsert_memory`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`
        },
        body: JSON.stringify({
            p_content: chunk.text,
            p_embedding: embedding,
            p_namespace: NAMESPACE,
            p_source: `${SOURCE}:${chunk.sourceFile}`,
            p_signal_type: SIGNAL_TYPE,
            p_scope: chunk.scope
        })
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Supabase upsert failed (${res.status}): ${err}`);
    }
    return await res.json();
}

// ─── Check if chunk already exists (by content hash in source) ──
async function getExistingWikiHashes() {
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/claw_memories?signal_type=eq.${SIGNAL_TYPE}&source=like.${SOURCE}*&select=source`,
            {
                headers: {
                    'apikey': SUPABASE_ANON,
                    'Authorization': `Bearer ${SUPABASE_ANON}`
                }
            }
        );
        if (res.ok) {
            const rows = await res.json();
            return new Set(rows.map(r => r.source));
        }
    } catch { /* ignore */ }
    return new Set();
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
    const lastSync = FULL_SYNC ? new Date(0) : getLastSyncTime();
    const mode = FULL_SYNC ? 'FULL' : SINGLE_FILE ? 'SINGLE' : 'INCREMENTAL';

    console.log(`\n📚 CLAW Wiki → Supabase Sync${DRY_RUN ? ' (DRY RUN)' : ''} [${mode}]`);
    console.log(`   Vault: ${VAULT_PATH}`);
    if (mode === 'INCREMENTAL') {
        console.log(`   Last sync: ${lastSync.toISOString()}`);
    }
    console.log('');

    // Collect files
    let files;
    if (SINGLE_FILE) {
        if (!existsSync(SINGLE_FILE)) {
            console.error(`File not found: ${SINGLE_FILE}`);
            process.exit(1);
        }
        files = [SINGLE_FILE];
    } else {
        // Mehrere kuratierte Subdirs sammeln
        const allFiles = [];
        for (const subdir of VAULT_SUBDIRS) {
            const fullDir = join(VAULT_ROOT, subdir);
            if (existsSync(fullDir)) {
                allFiles.push(...collectFiles(fullDir));
            }
        }
        // Filter by modification time (incremental sync)
        files = allFiles.filter(f => {
            const mtime = statSync(f).mtime;
            return mtime > lastSync;
        });
        console.log(`   Scanned ${VAULT_SUBDIRS.join(', ')} — ${allFiles.length} total files, ${files.length} modified since last sync`);

        if (files.length === 0 && !FULL_SYNC) {
            console.log('   ✅ No changes detected. Nothing to sync.');
            process.exit(0);
        }
    }

    // Chunk all files
    const allChunks = [];
    for (const file of files) {
        const content = readFileSync(file, 'utf-8');
        const chunks = chunkByH2(content, file);
        allChunks.push(...chunks);
    }
    console.log(`   Chunked into ${allChunks.length} sections\n`);

    if (DRY_RUN) {
        // Show what would be synced
        const byDomain = {};
        for (const c of allChunks) {
            byDomain[c.domain] = (byDomain[c.domain] || 0) + 1;
        }
        console.log('   Chunks per domain:');
        for (const [d, n] of Object.entries(byDomain).sort()) {
            console.log(`     ${d}: ${n} chunks`);
        }
        console.log(`\n   Total Gemini API calls needed: ${allChunks.length}`);
        console.log(`   Estimated time: ~${Math.ceil(allChunks.length * RATE_LIMIT_MS / 60000)} minutes`);
        console.log(`   Estimated Gemini cost: ~$${(allChunks.length * 0.00001).toFixed(4)}`);
        process.exit(0);
    }

    // Check existing records for dedup
    console.log('   Checking existing records...');
    const existing = await getExistingWikiHashes();
    console.log(`   Found ${existing.size} existing wiki records in Supabase\n`);

    // Filter out already-synced chunks
    const newChunks = allChunks.filter(c => !existing.has(`${SOURCE}:${c.sourceFile}`));
    const skipCount = allChunks.length - newChunks.length;

    if (skipCount > 0) {
        console.log(`   Skipping ${skipCount} already-synced chunks`);
    }

    if (newChunks.length === 0) {
        console.log('   ✅ Everything already synced. Nothing to do.');
        process.exit(0);
    }

    console.log(`   Syncing ${newChunks.length} new chunks...\n`);

    // Process chunks with rate limiting
    let success = 0;
    let errors = 0;

    for (let i = 0; i < newChunks.length; i++) {
        const chunk = newChunks[i];
        const progress = `[${i + 1}/${newChunks.length}]`;

        try {
            const embedding = await generateEmbedding(chunk.text);
            await upsertMemory(chunk, embedding);
            success++;
            console.log(`   ${progress} ✅ ${chunk.domain}/${chunk.sourceFile} → ${chunk.sectionTitle.slice(0, 50)}`);
        } catch (err) {
            errors++;
            console.error(`   ${progress} ❌ ${chunk.domain}/${chunk.sourceFile}: ${err.message.slice(0, 100)}`);
        }

        // Rate limiting
        if (i < newChunks.length - 1) {
            await sleep(RATE_LIMIT_MS);
        }
    }

    console.log(`\n   ────────────────────────────────`);
    console.log(`   ✅ Synced: ${success}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   ⏭  Skipped: ${skipCount}`);
    console.log(`   📊 Total in vault: ${allChunks.length} chunks from ${files.length} files`);

    // Save timestamp on success
    if (!DRY_RUN && errors === 0) {
        writeFileSync(TIMESTAMP_FILE, JSON.stringify({
            lastSync: new Date().toISOString(),
            filesProcessed: files.length,
            chunksProcessed: success
        }, null, 2));
        console.log(`   🕐 Timestamp saved: ${new Date().toISOString()}`);
    }
}

main().catch(err => {
    console.error(`Fatal: ${err.message}`);
    process.exit(1);
});
