---
name: claw-heartbeat-report
description: Täglicher Status-Report aller CLAW-Agents via Telegram (Health-Dashboard)
---

Führe aus:
```bash
node C:/Users/User/Claude/scripts/claw-heartbeat-report.mjs
```

Das Script:
- Liest public.claw_heartbeat_dashboard (Supabase View)
- Gruppiert Agents nach Health (🟢 🟡 🔴 ⚪ ⚫)
- Sendet strukturierten Markdown-Report an Telegram (chat_id aus TELEGRAM_AUTHORIZED_ID env)

Bei Erfolg: Ausgabe "Heartbeat report sent (N agents)".
Bei Fehler: Details in Log.

HARD RULES
- Nur lesen + Telegram senden, kein DB-Write
- Keine anderen Projekte berühren
- Kein Deploy