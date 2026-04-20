#!/usr/bin/env node
/**
 * CLAW Session Processor v2
 *
 * Änderungen vs v1:
 * - 1 API Call pro Session statt 3 (Learnings + Aktivitäten + Topic-Deltas kombiniert)
 * - Gemini 2.5 Flash statt Pro, Thinking deaktiviert
 * - Topic-Updates als Deltas (append) statt Full-Rewrite
 * - Embeddings weiterhin via gemini-embedding-001 (Free Tier)
 *
 * Env: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

// Windows-Fix: stdin sofort schließen um UV_HANDLE_CLOSING zu vermeiden
try { process.stdin.destroy(); } catch {}
try { process.stdin.unref(); } catch {}

const GEMINI_KEY    = process.env.GEMINI_API_KEY;
const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

const CLAUDE_PROJECTS = path.join(os.homedir(), '.claude', 'projects');
const TOPICS_DIR = 'C:/Users/User/Claude/topics';
const LOG_PATH = path.join(os.homedir(), 'Claude', 'scripts', 'claw-processor.log');

const TOPIC_FILES = {
    'claw':            'claw-architecture.md',
    'openclaw':        'claw-architecture.md',
    'memory':          'claw-architecture.md',
    'supabase':        'claw-architecture.md',
    'hook':            'claw-architecture.md',
    'telegram':        'claw-architecture.md',
    'ai-ugc':          'ai-ugc-pipeline.md',
    'ugc':             'ai-ugc-pipeline.md',
    'veo':             'ai-ugc-pipeline.md',
    'remotion':        'ai-ugc-pipeline.md',
    'omnihuman':       'ai-ugc-pipeline.md',
    'elevenlabs':      'ai-ugc-pipeline.md',
    'nano banana':     'ai-ugc-pipeline.md',
    'ki-automatisieren': 'ki-automatisieren.md',
    'pseo':            'ki-automatisieren.md',
    'pSEO':            'ki-automatisieren.md',
    'profilfoto':      'profilfoto-ki.md',
    'profilfoto-ki':   'profilfoto-ki.md',
    'apexx':           '<BUSINESS_EXAMPLE>.md',
    '<BUSINESS_EXAMPLE>':       '<BUSINESS_EXAMPLE>.md',
    'bauelemente':     '<BUSINESS_EXAMPLE>.md',
    'st-automatisierung': 'st-automatisierung.md',
    'bafa':            'st-automatisierung.md',
    'beratung':        'st-automatisierung.md',
    'street view':     'st-automatisierung.md',
    'google maps':     'st-automatisierung.md',
    'maps':            'st-automatisierung.md',
    'google business': 'st-automatisierung.md',
    'gmb':             'st-automatisierung.md',
};

// ─── Logging ────────────────────────────────────────────────

function log(msg) {
    const line = `${msg}\n`;
    process.stdout.write(line);
    try { fs.appendFileSync(LOG_PATH, line); } catch {}
}

// ─── Validierung ─────────────────────────────────────────────

if (!GEMINI_KEY || !SUPABASE_URL || !SUPABASE_ANON) {
    log('[CLAW] Fehlende Env-Variablen: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY');
    process.exit(1);
}

// ─── Hilfsfunktionen ─────────────────────────────────────────

function getProjectDirs() {
    try {
        return fs.readdirSync(CLAUDE_PROJECTS, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);
    } catch (err) {
        log(`[CLAW] Kann Projektverzeichnis nicht lesen: ${err.message}`);
        return [];
    }
}

function extractMessages(jsonlPath) {
    const lines = fs.readFileSync(jsonlPath, 'utf-8').trim().split('\n');
    const messages = [];

    for (const line of lines) {
        if (!line.trim()) continue;
        let entry;
        try { entry = JSON.parse(line); } catch { continue; }

        if (entry.type !== 'user' && entry.type !== 'assistant') continue;
        if (!entry.message?.content) continue;

        const role = entry.message.role;
        let text = '';

        const content = entry.message.content;
        if (typeof content === 'string') {
            text = content;
        } else if (Array.isArray(content)) {
            for (const block of content) {
                if (block.type === 'text' && block.text) {
                    text += block.text + '\n';
                }
            }
        }

        text = text.trim();
        if (text.length < 10) continue;
        if (role === 'assistant' && text.length > 800) {
            text = text.slice(0, 800) + '…';
        }

        messages.push({ role, text });
    }

    return messages;
}

function detectTopics(messages) {
    const fullText = messages.map(m => m.text).join(' ').toLowerCase();
    const touched = new Set();
    for (const [keyword, file] of Object.entries(TOPIC_FILES)) {
        if (fullText.includes(keyword.toLowerCase())) {
            touched.add(file);
        }
    }
    return [...touched];
}

// ─── Supabase Helpers ───────────────────────────────────────

async function isAlreadyProcessed(sessionId) {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/claw_processed_sessions?session_id=eq.${sessionId}&select=id`,
        { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return data.length > 0;
}

async function markAsProcessed(sessionId, filePath, messageCount, memoriesSaved, summary, projectDir) {
    await fetch(`${SUPABASE_URL}/rest/v1/claw_processed_sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`,
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            session_id: sessionId, file_path: filePath,
            message_count: messageCount, memories_saved: memoriesSaved,
            summary, project_dir: projectDir
        })
    });
}

async function saveActivities(activities, sessionId, projectDir) {
    for (const entry of activities) {
        if (!entry.activities?.length && !entry.decisions?.length) continue;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/claw_activity_log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${SUPABASE_ANON}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                session_id: sessionId,
                domain: entry.domain || null,
                date: new Date().toISOString().slice(0, 10),
                activities: entry.activities || [],
                decisions: entry.decisions || [],
                open_items: entry.open_items || [],
                summary: entry.summary || null,
                project_dir: projectDir
            })
        });
        if (!res.ok) {
            log(`[CLAW] Activity Log Fehler: ${await res.text()}`);
        } else {
            log(`[CLAW] ✓ Activity Log: ${entry.domain || 'global'} — ${(entry.activities || []).length} Aktivitäten`);
        }
    }
}

// ─── Gemini: 1 kombinierter Call (Flash, kein Thinking) ─────

async function analyzeSession(messages, touchedTopics) {
    const conversationText = messages
        .map(m => `${m.role === 'user' ? 'Safak Tepecik' : 'CLAW'}: ${m.text}`)
        .join('\n\n');

    const topicList = touchedTopics.length > 0
        ? `\nBerührte Topics: ${touchedTopics.join(', ')}`
        : '\nKeine bekannten Topics erkannt.';

    const systemPrompt = `Du bist CLAW Session Analyzer. Analysiere diese Claude Code Session und extrahiere ALLES in einem Durchgang.

EXTRAHIERE 3 DINGE:

═══ 1. LEARNINGS ═══
Korrekturen: Safak Tepecik korrigiert CLAW explizit ("nein", "falsch", "nicht so", "stopp").
Hard Rules: Verbindliche Regeln ("immer", "niemals", "Hard Rule") oder 2x wiederholte Korrektur.
Nur echte Korrekturen und Regeln — keine allgemeinen Infos.

═══ 2. AKTIVITÄTEN ═══
Was wurde KONKRET GETAN (nicht nur diskutiert)?
- domain: Welches Projekt? (z.B. "ki-automatisieren.de", "claw-system", null)
- activities: Konkrete Tätigkeiten ("14 CSS-Fixes deployed", "pSEO Audit durchgeführt")
- decisions: Getroffene Entscheidungen
- open_items: Offene Punkte
- summary: Ein Satz Zusammenfassung
Wenn mehrere Domains betroffen: ein Objekt pro Domain.

═══ 3. TOPIC-DELTAS ═══${topicList}
Für jedes berührte Topic: Was ist NEU? Kurze Bullet Points die zum Projektstatus hinzugefügt werden sollten.
Nur wirklich neue, relevante Informationen — keine Wiederholungen.

FORMAT — Gib exakt dieses JSON zurück:
{
  "learnings": [{"content": "Regel in max 2 Sätzen", "signal_type": "correction|hard-rules", "namespace": "corrections|hard-rules", "scope": "global|project:name"}],
  "activities": [{"domain": "...", "activities": [], "decisions": [], "open_items": [], "summary": "..."}],
  "topic_updates": {"dateiname.md": "- Bullet 1\\n- Bullet 2"}
}
Wenn ein Bereich leer: leeres Array/Objekt. Kein Markdown, nur JSON.`;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{
                    role: 'user',
                    parts: [{ text: `Analysiere diese Session:\n\n${conversationText}` }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: 'application/json',
                    thinkingConfig: { thinkingBudget: 0 }
                }
            })
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API Fehler ${res.status}: ${err}`);
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    try {
        return JSON.parse(raw);
    } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        return { learnings: [], activities: [], topic_updates: {} };
    }
}

// ─── Embeddings (gemini-embedding-001, Free Tier) ───────────

async function generateEmbedding(text) {
    const res = await fetch(
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
    if (!res.ok) throw new Error(`Embedding fehlgeschlagen: ${res.status}`);
    const data = await res.json();
    return data.embedding.values;
}

async function saveToSupabase(item) {
    const embedding = await generateEmbedding(item.content);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/claw_upsert_memory`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`
        },
        body: JSON.stringify({
            p_content: item.content, p_embedding: embedding,
            p_namespace: item.namespace || 'general',
            p_source: 'claw-session-processor',
            p_signal_type: item.signal_type || 'general',
            p_scope: item.scope || 'global'
        })
    });
    if (!res.ok) throw new Error(`Supabase upsert fehlgeschlagen: ${await res.text()}`);
    return await res.json();
}

// ─── Topic-Dateien: Deltas anhängen ─────────────────────────

function applyTopicDeltas(topicUpdates) {
    const today = new Date().toISOString().slice(0, 10);
    for (const [filename, deltas] of Object.entries(topicUpdates)) {
        if (!deltas || deltas.trim().length === 0) continue;

        const topicPath = path.join(TOPICS_DIR, filename);
        if (!fs.existsSync(topicPath)) continue;

        const current = fs.readFileSync(topicPath, 'utf-8');

        // Update-Datum aktualisieren
        let updated = current.replace(
            /^> Letztes Update: .*/m,
            `> Letztes Update: ${today}`
        );

        // Deltas am Ende der "Offene Punkte" oder am Dateiende anhängen
        const deltaBlock = `\n\n### Session Update (${today})\n${deltas}\n`;

        if (updated.includes('### Offene Punkte')) {
            updated = updated.replace(
                /(### Offene Punkte.*?)(\n###|\n$|$)/s,
                `$1${deltaBlock}$2`
            );
        } else {
            updated += deltaBlock;
        }

        fs.writeFileSync(topicPath, updated, 'utf-8');
        log(`[CLAW] ✓ Topic aktualisiert: ${filename}`);
    }
}

// ─── Hauptloop ───────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_TRACKER_PATH = path.join(os.homedir(), '.claude', 'processor-retries.json');

function loadRetries() {
    try {
        if (fs.existsSync(RETRY_TRACKER_PATH)) return JSON.parse(fs.readFileSync(RETRY_TRACKER_PATH, 'utf-8'));
    } catch {}
    return {};
}
function saveRetries(retries) {
    fs.writeFileSync(RETRY_TRACKER_PATH, JSON.stringify(retries), 'utf-8');
}

function isActiveSession(jsonlPath) {
    try {
        const stat = fs.statSync(jsonlPath);
        return (Date.now() - stat.mtimeMs) < 30 * 60 * 1000;
    } catch { return false; }
}

async function processSession(jsonlPath, projectDir) {
    const sessionId = path.basename(jsonlPath, '.jsonl');

    if (jsonlPath.includes('subagents')) return;
    if (isActiveSession(jsonlPath)) return;
    if (await isAlreadyProcessed(sessionId)) return;

    const retries = loadRetries();
    if ((retries[sessionId] || 0) >= MAX_RETRIES) {
        log(`[CLAW] Session ${sessionId} nach ${MAX_RETRIES} Versuchen übersprungen`);
        await markAsProcessed(sessionId, jsonlPath, 0, 0, `failed:max_retries_${MAX_RETRIES}`, projectDir);
        delete retries[sessionId];
        saveRetries(retries);
        return;
    }

    const messages = extractMessages(jsonlPath);
    if (messages.length < 3) {
        await markAsProcessed(sessionId, jsonlPath, messages.length, 0, 'skipped:too_short', projectDir);
        return;
    }

    const attempt = (retries[sessionId] || 0) + 1;
    log(`[CLAW] Verarbeite Session ${sessionId} (${messages.length} Messages, Versuch ${attempt}/${MAX_RETRIES})...`);

    // ─── 1 kombinierter Gemini Call ──────────────────────────
    const touchedTopics = detectTopics(messages);
    let result;
    try {
        result = await analyzeSession(messages, touchedTopics);
    } catch (err) {
        log(`[CLAW] Gemini Fehler für ${sessionId}: ${err.message}`);
        retries[sessionId] = attempt;
        saveRetries(retries);
        return;
    }

    // Success → clear retry counter
    if (retries[sessionId]) { delete retries[sessionId]; saveRetries(retries); }

    // ─── Learnings speichern ────────────────────────────────
    const learnings = result.learnings || [];
    let saved = 0;
    for (const item of learnings) {
        if (!item.content || item.content.trim().length < 30) continue;
        try {
            await saveToSupabase(item);
            log(`[CLAW] ✓ Gespeichert: ${item.content.slice(0, 80)}...`);
            saved++;
            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            log(`[CLAW] Speichern fehlgeschlagen: ${err.message}`);
        }
    }

    // ─── Aktivitäten speichern ──────────────────────────────
    const activities = result.activities || [];
    if (activities.length > 0) {
        try {
            await saveActivities(activities, sessionId, projectDir);
        } catch (err) {
            log(`[CLAW] Activity-Speicherung Fehler: ${err.message}`);
        }
    }

    // ─── Topic-Deltas anwenden ──────────────────────────────
    const topicUpdates = result.topic_updates || {};
    try {
        applyTopicDeltas(topicUpdates);
    } catch (err) {
        log(`[CLAW] Topic-Update Fehler: ${err.message}`);
    }

    const topicNames = Object.keys(topicUpdates).filter(k => topicUpdates[k]?.trim());
    const summary = `${learnings.length} Learnings, ${saved} gespeichert, ${activities.length} Activities${topicNames.length > 0 ? ', Topics: ' + topicNames.join(', ') : ''}`;
    await markAsProcessed(sessionId, jsonlPath, messages.length, saved, summary, projectDir);
    log(`[CLAW] Session ${sessionId}: ${summary}`);

    // ─── Handoff-Doc schreiben (Gap #12) ─────────────────────
    try {
        writeHandoff(sessionId, projectDir, result);
    } catch (err) {
        log(`[CLAW] Handoff-Doc Fehler: ${err.message}`);
    }
}

// ─── Handoff-Doc (Gap #12 Auto-Handoff) ─────────────────────
function writeHandoff(sessionId, projectDir, result) {
    const handoffDir = path.join(os.homedir(), 'Claude', 'sessions');
    if (!fs.existsSync(handoffDir)) fs.mkdirSync(handoffDir, { recursive: true });
    const handoffPath = path.join(handoffDir, 'last-handoff.md');

    const ts = new Date().toISOString();
    const activities = result.activities || [];
    const acts = activities.flatMap(a => a.activities || []);
    const decs = activities.flatMap(a => a.decisions || []);
    const opens = activities.flatMap(a => a.open_items || []);
    const domains = [...new Set(activities.map(a => a.domain).filter(Boolean))];

    const md = `# CLAW Session Handoff
> Letzter Stop: ${ts}
> Session-ID: ${sessionId}
> Projekt-Dir: ${projectDir}
> Domains: ${domains.join(', ') || '(global)'}

## Was wurde gemacht
${acts.length > 0 ? acts.map(a => `- ${a}`).join('\n') : '_(keine Aktivitäten erfasst)_'}

## Entscheidungen
${decs.length > 0 ? decs.map(d => `- ${d}`).join('\n') : '_(keine)_'}

## Offene Punkte
${opens.length > 0 ? opens.map(o => `- [ ] ${o}`).join('\n') : '_(keine)_'}

## Nächste Schritte (vorgeschlagen)
${opens.length > 0
    ? 'Nächste Session: offene Punkte addressieren oder als "nicht mehr relevant" markieren.'
    : 'Keine offenen Punkte — frischer Start möglich.'}
`;
    fs.writeFileSync(handoffPath, md, 'utf-8');
    log(`[CLAW] Handoff geschrieben: ${handoffPath}`);
}

async function main() {
    log(`[CLAW Session Processor v2] Start — ${new Date().toISOString()}`);

    let totalProcessed = 0;
    let totalSessions = 0;

    const PROJECT_DIRS = getProjectDirs();
    log(`[CLAW] Scanne ${PROJECT_DIRS.length} Projekt-Verzeichnisse (Flash, kein Thinking)`);

    for (const projectDir of PROJECT_DIRS) {
        const projectPath = path.join(CLAUDE_PROJECTS, projectDir);
        if (!fs.existsSync(projectPath)) continue;

        const files = fs.readdirSync(projectPath)
            .filter(f => f.endsWith('.jsonl'))
            .map(f => path.join(projectPath, f));

        for (const file of files) {
            totalSessions++;
            try {
                await processSession(file, projectDir);
                totalProcessed++;
            } catch (err) {
                log(`[CLAW] Fehler bei ${file}: ${err.message}`);
            }
        }
    }

    log(`[CLAW] Fertig. ${totalProcessed}/${totalSessions} Sessions geprüft.`);

    // Handoff aus Supabase-activity_log (Gap #12) — läuft IMMER, auch wenn
    // keine neuen Sessions processed wurden. Quelle: letzte 24h activity_log.
    try {
        await writeHandoffFromSupabase();
    } catch (err) {
        log(`[CLAW] writeHandoffFromSupabase Fehler: ${err.message}`);
    }
}

async function writeHandoffFromSupabase() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/claw_activity_log?created_at=gte.${since}&order=created_at.desc&limit=10`,
        { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    );
    if (!res.ok) return;
    const rows = await res.json();
    if (!rows || rows.length === 0) return;

    const acts = rows.flatMap(r => r.activities || []);
    const decs = rows.flatMap(r => r.decisions || []);
    const opens = rows.flatMap(r => r.open_items || []);
    const domainsRaw = rows.map(r => r.domain).filter(Boolean);
    const domains = [...new Set(domainsRaw.flatMap(d =>
        typeof d === 'string' && d.startsWith('[')
            ? (() => { try { return JSON.parse(d); } catch { return [d]; } })()
            : [d]
    ))];
    const sessionIds = [...new Set(rows.map(r => r.session_id).filter(Boolean))];

    const handoffDir = path.join(os.homedir(), 'Claude', 'sessions');
    if (!fs.existsSync(handoffDir)) fs.mkdirSync(handoffDir, { recursive: true });
    const handoffPath = path.join(handoffDir, 'last-handoff.md');

    const md = `# CLAW Session Handoff
> Generiert: ${new Date().toISOString()}
> Quelle: claw.activity_log (letzte 24h)
> Aktive Sessions: ${sessionIds.length}
> Domains: ${domains.join(', ') || '(global)'}

## Was wurde gemacht (letzte 24h)
${acts.length > 0 ? acts.slice(0, 20).map(a => `- ${a}`).join('\n') : '_(keine Aktivitäten)_'}

## Entscheidungen
${decs.length > 0 ? decs.slice(0, 15).map(d => `- ${d}`).join('\n') : '_(keine)_'}

## Offene Punkte
${opens.length > 0 ? opens.slice(0, 15).map(o => `- [ ] ${o}`).join('\n') : '_(keine)_'}

## Nächste Schritte
${opens.length > 0
    ? 'Offene Punkte addressieren oder als "nicht mehr relevant" markieren.'
    : 'Keine offenen Punkte — frischer Start möglich.'}
`;
    fs.writeFileSync(handoffPath, md, 'utf-8');
    log(`[CLAW] Handoff (aus Supabase) geschrieben: ${handoffPath}`);
}

main().catch(err => {
    log('[CLAW] Kritischer Fehler: ' + err.message);
    process.exit(1);
});
