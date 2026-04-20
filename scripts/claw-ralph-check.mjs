#!/usr/bin/env node
/**
 * CLAW Ralph-Loop-Back — Stop-Hook
 *
 * Läuft NACH claw-session-processor beim Stop-Event. Prüft ob in der aktuellen
 * Session offene Punkte (open_items) in die activity_log geschrieben wurden
 * die noch nicht adressiert sind.
 *
 * Wenn >=3 unadressierte open_items aus letzter Stunde: signalisiert Claude
 * via exit 2 + decision:"block" zurück, damit Claude die offenen Punkte sieht
 * und entscheiden kann ob er sie noch angeht oder explizit als "verschoben"
 * markiert.
 *
 * Sanfter Loop-Back: nicht bei 1-2 Items (normaler Workflow), nur bei Massen
 * unadressierter Punkte (= echtes "ich vergesse Dinge"-Signal).
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;
const LOG_PATH = path.join(os.homedir(), 'Claude', 'scripts', 'claw-ralph.log');
const THRESHOLD = 3; // Ab wie vielen unadressierten open_items wird geblockt
const WINDOW_MINUTES = 15; // Enges Zeitfenster: nur Items die vom Session-Processor GERADE geschrieben wurden
                            // (läuft direkt vor uns). Verhindert False-Positives aus früheren Sessions desselben Tages.

function log(msg) {
    try { fs.appendFileSync(LOG_PATH, `[${new Date().toISOString()}] ${msg}\n`); } catch {}
}

// stdin einmalig lesen + cachen (stdin kann nur 1x gelesen werden)
function readHookPayload() {
    try {
        const payload = fs.readFileSync(0, 'utf-8').trim();
        if (!payload) return null;
        return JSON.parse(payload);
    } catch { return null; }
}

async function getActivePromise(sessionId) {
    if (!sessionId) return null;
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/claw_get_active_promise`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${SUPABASE_ANON}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ p_session_id: sessionId })
        });
        if (!res.ok) return null;
        const rows = await res.json();
        return rows.length > 0 ? rows[0] : null;
    } catch { return null; }
}

async function main() {
    if (!SUPABASE_URL || !SUPABASE_ANON) { process.exit(0); return; }

    const hookPayload = readHookPayload();
    const currentSessionId = hookPayload?.session_id || hookPayload?.sessionId || null;

    // ─── Completion-Promise Check (Ralph-Wiggum-Pattern) ───
    // Hat diese Session eine aktive Promise? Wenn ja UND nicht erfüllt → block mit Fortschritts-Message
    const promise = await getActivePromise(currentSessionId);
    if (promise && promise.remaining > 0 && promise.iterations_used < promise.max_iterations) {
        const reason = [
            `🔄 Completion-Promise aktiv — noch ${promise.remaining} von ${promise.target} offen.`,
            ``,
            `Task: ${promise.task_description}`,
            `Fortschritt: ${promise.progress}/${promise.target} (Iteration ${promise.iterations_used}/${promise.max_iterations})`,
            ``,
            `Mach weiter bis die Promise erfüllt ist. Nutze die RPCs um Fortschritt zu melden:`,
            `  • SELECT claw_update_promise_progress('${promise.id}', 1)  → +1 Item fertig`,
            `  • SELECT claw_close_promise('${promise.id}', 'Grund')     → Promise manuell schließen wenn Blocker`,
            ``,
            `Wenn Blocker/Unklarheit: Promise explizit schließen mit Begründung statt still auszusteigen.`
        ].join('\n');
        log(`BLOCK (promise): ${promise.task_description} ${promise.progress}/${promise.target}`);
        process.stdout.write(JSON.stringify({ decision: 'block', reason }));
        process.exit(2);
    }

    // ─── Open-Items-Check DEAKTIVIERT (2026-04-20) ───
    // Historisch: Hook blockte bei >=3 unadressierten open_items. In der Praxis:
    // - Jede Session produziert "offene Punkte" (Routine-Weekly-Reviews, Outreach, etc.)
    // - User musste jedes Mal "verschoben" markieren → Nagging ohne Wert
    // - SessionStart-Hook zeigt eh stale opens (v_open_work View, >3 Tage alt)
    // - Weekly-Reviews aggregieren ohnehin pro Domain
    // → Deaktiviert. Nur Completion-Promise-Block bleibt (opt-in vom Agent).
    process.exit(0);
    return;

    /* LEGACY — falls wieder nötig, un-commenten:
    const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/claw_activity_log?session_id=eq.${currentSessionId}&created_at=gte.${since}&order=created_at.desc&limit=20`,
            { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
        );
        if (!res.ok) { log('activity_log fetch failed'); process.exit(0); return; }
        const rows = await res.json();

        // Filter: Items mit explizitem Status-Marker gelten als bereits adressiert.
        // Akzeptiert BEIDE Formate:
        //   Prefix eckig: "[VERSCHOBEN → Daily Loop] GSC-Check"
        //   Suffix rund:  "GSC-Check (verschoben auf Daily Loop)"
        // Status-Wörter (de/en, case-insensitive):
        //   verschoben/deferred/postponed, user action/user-action, spawned/spawned task,
        //   archiviert/archived, gelöst/resolved, nicht mehr relevant/obsolete,
        //   blockiert/blocked, delegiert/delegated, daily loop
        const ADDRESSED_PATTERN = new RegExp(
            '(' +
              // Prefix-Variante: [WORT ...] am Anfang
              '^\\s*\\[(verschoben|deferred|postponed|user[\\s_-]*action|spawned|archiviert|archived|' +
                'gel(ö|oe)st|resolved|obsolete|nicht\\s+mehr\\s+relevant|blockiert|blocked|' +
                'delegiert|delegated|daily\\s+loop)\\b' +
              '|' +
              // Suffix-Variante: (WORT ...) oder — WORT ... oder "status: WORT" irgendwo im Item
              '\\((verschoben|deferred|postponed|user[\\s_-]*action|spawned|archiviert|archived|' +
                'gel(ö|oe)st|resolved|obsolete|nicht\\s+mehr\\s+relevant|blockiert|blocked|' +
                'delegiert|delegated|daily\\s+loop)[^)]*\\)[\\s.!?;,]*$' +
            ')', 'i'
        );
        const openItems = rows.flatMap(r => (r.open_items || [])
            .filter(item => !ADDRESSED_PATTERN.test(item))
            .map(item => ({
                item,
                domain: r.domain,
                date: r.date,
                session: r.session_id
            })));

        log(`Session window scan: ${rows.length} recent activities, ${openItems.length} open_items`);

        if (openItems.length < THRESHOLD) { process.exit(0); return; }

        // Block mit strukturierter Message
        const uniqueItems = [...new Set(openItems.map(o => o.item))].slice(0, 10);
        const byDomain = openItems.reduce((acc, o) => {
            (acc[o.domain || 'global'] = acc[o.domain || 'global'] || []).push(o.item);
            return acc;
        }, {});
        const domainSummary = Object.entries(byDomain)
            .map(([d, items]) => `${d} (${items.length})`)
            .join(', ');

        const reason = [
            `Es wurden in dieser Session ${openItems.length} offene Punkte in activity_log geschrieben — nach Domains: ${domainSummary}.`,
            ``,
            `Top unadressierte Punkte:`,
            ...uniqueItems.map((i, idx) => `  ${idx + 1}. ${i}`),
            ``,
            `Entscheide: (a) jetzt noch adressieren, (b) explizit als "verschoben auf später" markieren, oder (c) als "nicht mehr relevant" archivieren. Kein stummes Session-Ende bei so vielen offenen Punkten.`
        ].join('\n');

        log(`BLOCK: ${openItems.length} open_items, domains: ${domainSummary}`);

        const out = { decision: 'block', reason };
        process.stdout.write(JSON.stringify(out));
        process.exit(2);
    } catch (err) {
        log(`Error: ${err.message}`);
        process.exit(0);
    }
    */
}

main();
