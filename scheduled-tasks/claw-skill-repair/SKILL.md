---
name: claw-skill-repair
description: Wöchentlich (So 11:00) Skills mit schlechter Quality prüfen und Repair-Proposals in claw.skill_repair_proposals schreiben (zum menschlichen Review)
---

Du bist der Skill-Repair-Proposer. Aufgabe: einmal wöchentlich auto-generierte Repair-Vorschläge für degradierte Skills erstellen.

## SCHRITT 1 — Script ausführen
```bash
node C:/Users/User/Claude/scripts/claw-skill-repair.mjs
```

Das Script:
- Holt alle Skills mit Quality <50% ODER 3+ consecutive fails (via `claw_get_repair_candidates` RPC)
- Analysiert pro Skill die letzten Fails + aktuelle SKILL.md
- Generiert via Gemini 2.5 Flash einen Repair-Vorschlag (neue SKILL.md-Version)
- Speichert den Proposal in `claw.skill_repair_proposals` mit Status `pending_review`

## SCHRITT 2 — Review-Queue prüfen
Nach Script-Ende:
```sql
SELECT skill_name, diff_summary, created_at
FROM claw.skill_repair_proposals
WHERE status='pending_review'
ORDER BY created_at DESC;
```

## SCHRITT 3 — Telegram-Notification
Wenn N > 0 neue pending_reviews existieren:
Schicke via Telegram-Bot eine Nachricht an `TELEGRAM_AUTHORIZED_ID`:
```
🔧 CLAW Skill-Repair: N Vorschläge zum Review
- <skill_name>: <diff_summary>
...
Review: SELECT * FROM claw.skill_repair_proposals WHERE status='pending_review'
```

Wenn N=0: keine Notification.

## SCHRITT 4 — Log
Agent-Log-Eintrag in `C:\Users\User\Claude\sessions\agent-log-[HEUTE].md`:
```
### Skill-Repair [HEUTE]
- Kandidaten geprüft: X
- Proposals erstellt: Y
- Status: OK | FEHLER [details]
```

## HARD RULES
- **NIEMALS** eine SKILL.md-Datei direkt überschreiben
- Vorschläge IMMER nur in `skill_repair_proposals` schreiben mit status=pending_review
- Kein Deploy, kein Push, kein git
- Menschliches Review-Gate ist pflicht