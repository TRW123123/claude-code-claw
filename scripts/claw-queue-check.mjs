#!/usr/bin/env node
/**
 * CLAW Webhook Queue Check
 * Läuft beim Start via SessionStart Hook
 * → Prüft pending Webhooks in Supabase → gibt sie als Kontext aus
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY
 */

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

// Windows-Fix: stdin sofort schließen + unref um UV_HANDLE_CLOSING zu vermeiden
try { process.stdin.destroy(); } catch {}
try { process.stdin.unref(); } catch {}

if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.log(JSON.stringify({ continue: true }));
    process.exit(0);
}

// ─── 1. Pending Webhooks holen ──────────────────────────────
let webhooks = [];
try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/claw_get_pending_webhooks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`
        },
        body: JSON.stringify({ p_limit: 10 })
    });
    if (res.ok) webhooks = await res.json();
} catch {}

// ─── 2. Letzte Aktivitäten laden (7 Tage) ───────────────────
let activities = [];
try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const actRes = await fetch(
        `${SUPABASE_URL}/rest/v1/claw_activity_log?date=gte.${sevenDaysAgo}&order=date.desc,created_at.desc&limit=15`,
        {
            headers: {
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${SUPABASE_ANON}`
            }
        }
    );
    if (actRes.ok) activities = await actRes.json();
} catch {}

// ─── 2b. Stale Open-Items pro Domain (Ralph-Loop-Back Light) ──
// Zeigt Top 3 pro Domain die älter als 3 Tage sind und nicht re-addressed
let staleOpens = [];
try {
    const openRes = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/claw_get_stale_opens`,
        {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${SUPABASE_ANON}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ p_limit: 40 })
        }
    );
    if (openRes.ok) {
        const all = await openRes.json();
        // Pro Domain max 3 Items, Gesamt-Cap 20
        const perDomain = new Map();
        for (const row of all) {
            const list = perDomain.get(row.domain) || [];
            if (list.length < 3) list.push(row);
            perDomain.set(row.domain, list);
        }
        staleOpens = [...perDomain.values()].flat().slice(0, 20);
    }
} catch {}

// ─── 2b5. Cross-Domain Learnings (Pattern-Transfer) ─────────
// Lädt applicable Learnings aus claw.cross_domain_learnings für domain-spezifische Sessions.
// Topic-Detection ist Sache des Processors; hier laden wir initial nur global-taggte + top confidence.
let crossDomainLearnings = [];
try {
    const cdlRes = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/claw_get_cross_domain_learnings`,
        {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${SUPABASE_ANON}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ p_target_domain: '__global__', p_limit: 8 })
        }
    );
    if (cdlRes.ok) crossDomainLearnings = await cdlRes.json();
} catch {}

// ─── 2b6. Task-Patterns (Pattern-Learning Layer) ────────────
// Lädt die Top-3 häufigsten task_types der letzten 30 Tage inkl. Erfolgsquote
// und häufigster Skill-Sequenz. Gibt Safak Inspiration, welche Pattern erprobt sind.
let taskPatterns = [];
try {
    const tpRes = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/claw_get_recent_task_types`,
        {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${SUPABASE_ANON}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ p_days: 30, p_limit: 3 })
        }
    );
    if (tpRes.ok) taskPatterns = await tpRes.json();
} catch {}

// ─── 2c. Letzter Handoff (Gap #12) ──────────────────────────
let handoffText = null;
try {
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');
    const handoffPath = path.join(os.homedir(), 'Claude', 'sessions', 'last-handoff.md');
    if (fs.existsSync(handoffPath)) {
        const stat = fs.statSync(handoffPath);
        const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
        if (ageHours < 48) {
            handoffText = fs.readFileSync(handoffPath, 'utf-8');
        }
    }
} catch {}

// ─── 3. Output zusammenbauen ────────────────────────────────
const parts = [];

if (handoffText) {
    parts.push(`📋 LETZTER SESSION-HANDOFF (prüfen bevor neue Arbeit):\n\n${handoffText}`);
}

if (crossDomainLearnings && crossDomainLearnings.length > 0) {
    const lines = crossDomainLearnings.map(l =>
        `  [${l.category}] ${l.source_domain} (conf:${l.confidence}): ${l.learning_text}${l.evidence ? '\n      Evidenz: ' + l.evidence : ''}`
    ).join('\n');
    parts.push(`🔄 CROSS-DOMAIN LEARNINGS (transferierbar aus anderen Projekten):\n${lines}\n\nNutzen wenn Muster/Pattern aus einem Bereich auf die aktuelle Domain anwendbar ist. Jeder Agent bleibt Domain-scoped, aber Wissen fließt.`);
}

if (taskPatterns && taskPatterns.length > 0) {
    const lines = taskPatterns.map(p => {
        const seq = Array.isArray(p.top_skills_sequence) && p.top_skills_sequence.length > 0
            ? p.top_skills_sequence.join(' → ')
            : '(keine erfolgreiche Sequenz erfasst)';
        const dom = p.domain ? ` @${p.domain}` : '';
        return `  • ${p.task_type}${dom} — ${p.total_runs}x, ${p.success_rate ?? '?'}% success\n      Skills: ${seq}`;
    }).join('\n');
    parts.push(`🧠 TASK-PATTERNS (häufigste strukturierte Tasks der letzten 30 Tage):\n${lines}\n\nWenn der aktuelle Task einem dieser Patterns ähnelt: erprobte Skill-Sequenz als Startpunkt nutzen. Bei Abweichung bewusst entscheiden, nicht zufällig.`);
}

if (activities && activities.length > 0) {
    const actLines = activities.map(a => {
        const acts = (a.activities || []).join(', ');
        const decs = (a.decisions || []).join(', ');
        const opens = (a.open_items || []).join(', ');
        let line = `[${a.date}] ${a.domain || 'global'}:`;
        if (acts) line += ` Getan: ${acts}.`;
        if (decs) line += ` Entschieden: ${decs}.`;
        if (opens) line += ` Offen: ${opens}.`;
        return line;
    }).join('\n');
    parts.push(`LETZTE AKTIVITÄTEN (7 Tage):\n${actLines}`);
}

if (staleOpens && staleOpens.length > 0) {
    const byDomain = staleOpens.reduce((acc, r) => {
        (acc[r.domain] = acc[r.domain] || []).push(r);
        return acc;
    }, {});
    const lines = Object.entries(byDomain).map(([dom, items]) => {
        const bullets = items.map(i => `  - [${i.days_old}d alt] ${i.open_item}`).join('\n');
        return `${dom}:\n${bullets}`;
    }).join('\n');
    parts.push(`⚠ OFFENE PUNKTE (älter als 3 Tage, nicht re-addressed — max 3 je Domain):\n${lines}\n\nWenn der aktuelle Chat eine dieser Domains betrifft: offene Punkte prüfen und entweder angehen ODER explizit als "nicht mehr relevant" markieren (neuer Activity-Log-Eintrag).`);
}

if (webhooks && webhooks.length > 0) {
    const whLines = webhooks.map((w, i) =>
        `[${i + 1}] ID:${w.id} | Quelle:${w.source} | Typ:${w.task_type} | Priorität:${w.priority}\n    Payload: ${JSON.stringify(w.payload)}`
    ).join('\n');
    parts.push(`CLAW WEBHOOK QUEUE — ${webhooks.length} ausstehende Tasks:\n\n${whLines}\n\nPFLICHT: Diese Tasks jetzt abarbeiten. Nach Abschluss: claw_update_webhook_status aufrufen mit status='done'.`);
}

if (parts.length === 0) {
    console.log(JSON.stringify({ continue: true }));
    process.exit(0);
}

console.log(JSON.stringify({
    continue: true,
    hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: parts.join('\n\n')
    }
}));
