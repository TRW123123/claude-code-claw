#!/usr/bin/env node
/**
 * CLAW Auto-Research Script
 * Läuft bei jedem UserPromptSubmit Hook
 * → Generiert Embedding → Supabase Memory abfragen → Context injizieren
 *
 * Env: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
 */

const GEMINI_KEY    = process.env.GEMINI_API_KEY;
const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

// ─── Stdin lesen (Hook Payload) ──────────────────────────────
// Windows-Fix: stdin sofort nach dem Lesen destroyen um UV_HANDLE_CLOSING zu vermeiden
let raw = '';
try {
    for await (const chunk of process.stdin) raw += chunk;
} catch { /* kein stdin */ }
// Sofort schließen — Handle darf nicht offen bleiben
try { process.stdin.destroy(); } catch {}
try { process.stdin.unref(); } catch {}

function safeExit(code = 0) {
    process.exit(code);
}

let payload = {};
try { payload = JSON.parse(raw); } catch { /* kein JSON */ }

const prompt = payload?.prompt || payload?.message || '';

// ─── Filter: Nur sinnvolle Prompts ──────────────────────────
const SKIP_PATTERNS = ['ok', 'ja', 'nein', 'danke', 'weiter', 'yes', 'no', 'k', 'gut'];
const isSkippable = prompt.trim().length < 40
    || SKIP_PATTERNS.includes(prompt.trim().toLowerCase())
    || !GEMINI_KEY || !SUPABASE_URL || !SUPABASE_ANON;

if (isSkippable) {
    console.log(JSON.stringify({ continue: true }));
    safeExit(0);
}

// ─── 1. Context Detection ─────────────────────────────────────
let activeScope = 'global';
try {
    const ctxRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/claw_detect_context`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`
        },
        body: JSON.stringify({ p_text: prompt })
    });
    if (ctxRes.ok) {
        const ctx = await ctxRes.json();
        if (ctx?.[0]?.project_scope) activeScope = ctx[0].project_scope;
    }
} catch { /* Context Detection fehlgeschlagen — global nutzen */ }

// ─── 2. Embedding generieren ──────────────────────────────────
let embedding;
try {
    const embedRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/gemini-embedding-001',
                content: { parts: [{ text: prompt.trim() }] },
                taskType: 'RETRIEVAL_QUERY',
                outputDimensionality: 768
            })
        }
    );
    if (!embedRes.ok) throw new Error('Gemini failed');
    const data = await embedRes.json();
    embedding = data.embedding.values;
} catch {
    // Kein Embedding → kein Research, trotzdem weitermachen
    console.log(JSON.stringify({ continue: true }));
    safeExit(0);
}

// ─── 3. Memory Search ─────────────────────────────────────────
let memories = [];
try {
    const searchRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/claw_search_memories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`
        },
        body: JSON.stringify({
            query_embedding: embedding,
            query_text: prompt.trim(),
            active_scope: activeScope,
            match_count: 5,
            scope: 'both'
        })
    });
    if (searchRes.ok) memories = await searchRes.json();
} catch { /* Search fehlgeschlagen */ }

// ─── 4. Output ────────────────────────────────────────────────
if (!memories || memories.length === 0) {
    console.log(JSON.stringify({ continue: true }));
    safeExit(0);
}

const memoryBlock = memories
    .filter(m => m.similarity > 0.4)
    .map(m => `[${m.memory_scope || m.scope_type}/${m.namespace}] ${m.content}`)
    .join('\n');

if (!memoryBlock) {
    console.log(JSON.stringify({ continue: true }));
    safeExit(0);
}

console.log(JSON.stringify({
    continue: true,
    hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: `CLAW MEMORY (scope: ${activeScope}):\n${memoryBlock}\n\nDiese Memories vor der Antwort berücksichtigen. Hard Rules sind bindend.`
    }
}));
