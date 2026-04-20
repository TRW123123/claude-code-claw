#!/usr/bin/env node
/**
 * CLAW Memory Flush Script
 * Generiert Embedding via Gemini + schreibt in Supabase via claw_upsert
 *
 * Usage:
 *   node claw-flush.mjs "text content" "signal_type" "namespace" "source"
 *
 * Signal Types: explicit-remember | decision | preference | project-context |
 *               substantial-input | emotional | relationship | deadline-critical | general
 * Namespaces:   hard-rules | workflows | technical | sales | corrections | general
 *
 * Env vars required (in settings.json):
 *   GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
 */

const text        = process.argv[2];
const signalType  = process.argv[3] || 'general';
const namespace   = process.argv[4] || 'general';
const source      = process.argv[5] || 'claw-session';
const scope       = process.argv[6] || 'global';  // 'global' | 'domain:X' | 'project:X'

const GEMINI_KEY      = process.env.GEMINI_API_KEY;
const SUPABASE_URL    = process.env.SUPABASE_URL;
const SUPABASE_ANON   = process.env.SUPABASE_ANON_KEY;

// ─── Validierung ────────────────────────────────────────────
if (!text || text.trim().length < 30) {
    console.error(JSON.stringify({ error: 'skipped', reason: 'text_too_short' }));
    process.exit(0);
}

if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_ANON) {
    console.error(JSON.stringify({ error: 'missing_env', required: ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'] }));
    process.exit(1);
}

// ─── 1. Embedding generieren (Gemini) ────────────────────────
const embedRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_KEY}`,
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'models/gemini-embedding-001',
            content: { parts: [{ text: text.trim() }] },
            taskType: 'RETRIEVAL_DOCUMENT',
            outputDimensionality: 768
        })
    }
);

if (!embedRes.ok) {
    const err = await embedRes.text();
    console.error(JSON.stringify({ error: 'gemini_failed', status: embedRes.status, detail: err }));
    process.exit(1);
}

const embedData = await embedRes.json();
const embedding = embedData.embedding.values;

// ─── 2. Supabase upsert ──────────────────────────────────────
const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/claw_upsert_memory`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`
    },
    body: JSON.stringify({
        p_content:     text.trim(),
        p_embedding:   embedding,
        p_namespace:   namespace,
        p_source:      source,
        p_signal_type: signalType,
        p_scope:       scope
    })
});

if (!upsertRes.ok) {
    const err = await upsertRes.text();
    console.error(JSON.stringify({ error: 'supabase_failed', status: upsertRes.status, detail: err }));
    process.exit(1);
}

const result = await upsertRes.json();
console.log(JSON.stringify(result));
