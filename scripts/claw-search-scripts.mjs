#!/usr/bin/env node
/**
 * CLAW Script-Search — RAG für Private Libs (Gap #23)
 *
 * Durchsucht alle Custom-Scripts in ~/Claude/scripts/ inkl. ihrer Header-Kommentare
 * und liefert die relevantesten Matches für einen Suchbegriff. Verhindert
 * Halluzinationen: Statt zu raten was ein Script tut, greift Claude direkt auf
 * die Header + Source-Snippets zu.
 *
 * Ansatz: Simple Text-Scoring (keine Embeddings nötig).
 *   - Dateiname-Match = +5 pro Token
 *   - Header-Match    = +3 pro Token
 *   - Body-Match      = +1 pro Token (nur erste 200 Zeilen)
 *
 * Usage:
 *   node claw-search-scripts.mjs "wiki sync"
 *   node claw-search-scripts.mjs "gsc submit" --top 3
 *   node claw-search-scripts.mjs "embedding" --json
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const SCRIPTS_DIR = 'C:/Users/User/Claude/scripts';
const INDEX_MD = 'C:/Users/User/Claude/CLAW_SCRIPTS.md';
const RELEVANT_EXT = new Set(['.mjs', '.js', '.py', '.ps1', '.cmd', '.bat']);

function parseArgs(argv) {
    const args = { query: '', top: 5, json: false };
    const rest = [];
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--top') { args.top = parseInt(argv[++i], 10) || 5; }
        else if (a === '--json') { args.json = true; }
        else { rest.push(a); }
    }
    args.query = rest.join(' ').trim();
    return args;
}

function extractHeader(content, ext) {
    if (ext === '.py') {
        const m = content.match(/^(?:#![^\n]*\n)?\s*(?:"""|''')([\s\S]*?)(?:"""|''')/);
        if (m) return m[1].trim();
        return '';
    }
    const m = content.match(/^(?:#![^\n]*\n)?\s*\/\*\*?([\s\S]*?)\*\//);
    if (m) {
        return m[1].split('\n').map(l => l.replace(/^\s*\*\s?/, '')).join('\n').trim();
    }
    return '';
}

function tokenize(q) {
    return q.toLowerCase()
        .split(/[\s\-_,.;:/\\"']+/)
        .filter(t => t.length >= 2);
}

function countMatches(text, tokens) {
    const lower = text.toLowerCase();
    let total = 0;
    const hits = {};
    for (const t of tokens) {
        const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const c = (lower.match(re) || []).length;
        if (c > 0) { total += c; hits[t] = c; }
    }
    return { total, hits };
}

function bodySnippet(body, tokens, maxLen = 400) {
    const lines = body.split('\n');
    const lower = body.toLowerCase();
    // Find first line containing any token
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
        for (const t of tokens) {
            if (lines[i].toLowerCase().includes(t)) { idx = i; break; }
        }
        if (idx >= 0) break;
    }
    if (idx < 0) return lines.slice(0, 6).join('\n').slice(0, maxLen);
    const start = Math.max(0, idx - 2);
    const end = Math.min(lines.length, idx + 8);
    return lines.slice(start, end).join('\n').slice(0, maxLen);
}

function main() {
    const { query, top, json } = parseArgs(process.argv);
    if (!query) {
        console.error('Usage: node claw-search-scripts.mjs "<query>" [--top N] [--json]');
        process.exit(1);
    }
    const tokens = tokenize(query);
    if (tokens.length === 0) {
        console.error('Query zu kurz.'); process.exit(1);
    }

    const files = readdirSync(SCRIPTS_DIR)
        .filter(f => RELEVANT_EXT.has(extname(f)))
        .filter(f => !f.endsWith('.log'));

    const results = [];
    for (const file of files) {
        const path = join(SCRIPTS_DIR, file);
        try {
            if (!statSync(path).isFile()) continue;
        } catch { continue; }
        let content = '';
        try { content = readFileSync(path, 'utf-8'); } catch { continue; }

        const ext = extname(file);
        const header = extractHeader(content, ext);
        // Body = rest nach Header, auf 200 Zeilen begrenzt
        const body = content.split('\n').slice(0, 200).join('\n');

        const fileScore = countMatches(file, tokens);
        const headerScore = countMatches(header, tokens);
        const bodyScore = countMatches(body, tokens);

        const score = fileScore.total * 5 + headerScore.total * 3 + bodyScore.total;
        if (score === 0) continue;

        results.push({
            file,
            path,
            score,
            hits: {
                filename: fileScore.hits,
                header: headerScore.hits,
                body: bodyScore.hits,
            },
            header_excerpt: header.slice(0, 400),
            body_snippet: bodySnippet(body, tokens),
        });
    }

    results.sort((a, b) => b.score - a.score);
    const topN = results.slice(0, top);

    if (json) {
        console.log(JSON.stringify({ query, tokens, total_matches: results.length, results: topN }, null, 2));
        return;
    }

    console.log(`\n=== CLAW Script Search ===`);
    console.log(`Query:   "${query}"`);
    console.log(`Tokens:  [${tokens.join(', ')}]`);
    console.log(`Matches: ${results.length} Scripts (zeige Top ${topN.length})`);
    console.log(`Index:   ${INDEX_MD}\n`);

    if (topN.length === 0) {
        console.log('Keine Treffer. Versuche andere Keywords.');
        return;
    }

    topN.forEach((r, i) => {
        console.log(`[${i + 1}] ${r.file}  (score: ${r.score})`);
        console.log(`    path: ${r.path}`);
        const h = Object.entries(r.hits.filename).map(([t, c]) => `${t}:${c}`).join(' ');
        const h2 = Object.entries(r.hits.header).map(([t, c]) => `${t}:${c}`).join(' ');
        const h3 = Object.entries(r.hits.body).map(([t, c]) => `${t}:${c}`).join(' ');
        console.log(`    hits: filename=[${h}] header=[${h2}] body=[${h3}]`);
        if (r.header_excerpt) {
            const shortH = r.header_excerpt.split('\n').slice(0, 4).join(' | ').slice(0, 180);
            console.log(`    header: ${shortH}`);
        }
        const snip = r.body_snippet.split('\n').map(l => `      ${l}`).join('\n');
        console.log(`    snippet:\n${snip}`);
        console.log('');
    });
}

main();
