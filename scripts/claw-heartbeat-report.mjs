#!/usr/bin/env node
/**
 * CLAW Heartbeat Report — täglicher Status-Überblick via Telegram
 *
 * Liest claw_heartbeat_dashboard (Supabase View) + kombiniert mit
 * list_scheduled_tasks (Erwartungen) und sendet Morgen-Report nach Telegram.
 *
 * Gibt Überblick:
 * - 🟢 Healthy (ok, <25h her)
 * - 🟡 Warning (status=warning)
 * - 🔴 Error (status=error)
 * - ⚪ Stale (kein run <25h, aber irgendwann mal gelaufen)
 * - ⚫ Dormant (>7 Tage tot)
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_AUTHORIZED_ID
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT = process.env.TELEGRAM_AUTHORIZED_ID;

if (!SUPABASE_URL || !SUPABASE_ANON || !TG_TOKEN || !TG_CHAT) {
    console.error('Missing env vars');
    process.exit(1);
}

async function main() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/claw_heartbeat_dashboard?order=health,last_run_at.desc`,
        { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    );
    const rows = await res.json();

    const today = new Date().toISOString().slice(0, 10);
    const byHealth = rows.reduce((acc, r) => {
        (acc[r.health] = acc[r.health] || []).push(r);
        return acc;
    }, {});

    const totals = Object.entries(byHealth)
        .map(([h, arr]) => `${h} ${arr.length}`)
        .join(' · ');

    let msg = `*CLAW Daily Heartbeat* — ${today}\n`;
    msg += `${totals}\n\n`;

    const order = ['🔴 error', '🟡 warning', '⚪ stale', '⚫ dormant', '🟢 healthy'];
    for (const health of order) {
        const arr = byHealth[health];
        if (!arr || arr.length === 0) continue;
        msg += `*${health}*\n`;
        for (const r of arr.slice(0, 8)) {
            const hoursAgo = r.hours_since_run ? Math.round(r.hours_since_run) + 'h' : '?';
            const summary = r.summary_preview ? ` — ${r.summary_preview.slice(0, 80)}` : '';
            msg += `  • ${r.agent_name} (${hoursAgo} ago)${summary}\n`;
        }
        msg += '\n';
    }

    if (rows.length === 0) {
        msg += '_Keine Heartbeats registriert. Agents müssen `claw_heartbeat(name,status,summary)` RPC aufrufen._';
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TG_CHAT,
            text: msg,
            parse_mode: 'Markdown'
        })
    });

    if (!tgRes.ok) {
        console.error('Telegram send failed:', await tgRes.text());
        process.exit(1);
    }
    console.log(`Heartbeat report sent (${rows.length} agents)`);
}

main().catch(e => { console.error(e); process.exit(1); });
