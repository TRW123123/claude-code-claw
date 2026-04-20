---
name: agent-mesh
description: Inter-Agent-Messaging + Task-Kanban (ClawTeam-Pattern). Aktivieren wenn ein Scheduled Task oder Sub-Agent einem anderen Agent eine Info/Task hinterlassen will ohne Kontext-Vermischung. Trigger-Wörter "sag X bescheid", "delegiere an Y", "benachrichtige Z", "/agent-mesh", "inbox check". NICHT für direktive Befehle — nur Hinweise zwischen Domain-scoped Agents.
---

# Agent-Mesh Skill

## Zweck
Safaks Scheduled Tasks und Sub-Agents bleiben strikt Domain-scoped (Hard Rule). Aber sie können via Supabase einander **informative Nachrichten** hinterlassen ODER **Follow-up-Tasks** in einem gemeinsamen Kanban einstellen — ohne Direktiven zu geben.

Beispiel: `seo-weekly-profilfoto-ki` findet einen Pattern-Win ("Title mit Zahlen + Power-Word hat 47% CTR-Boost"). Der Task schickt Nachricht an `seo-weekly-st-automatisierung`: "Hinweis: Pattern X hat bei mir funktioniert, check ob's bei dir passt".

## Architektur (Supabase)
- `claw.agent_messages` — Inbox pro Agent-Name. Severity: info/hint/warning/urgent. Status: unread/read/acted/dismissed.
- `claw.agent_tasks` — Kanban mit `blocked_by`-Array. Task-Completion unblockt abhängige Tasks automatisch.

## Workflow: Nachricht senden
```sql
SELECT claw_send_agent_message(
    p_from_agent := 'seo-weekly-profilfoto-ki',
    p_to_agent := 'seo-weekly-st-automatisierung',
    p_subject := 'Pattern-Win: Zahlen+Power-Words in Title',
    p_body := 'Bei 3 pSEO-Seiten CTR von 1.2% auf 3.8% — Vorher/Nachher-Evidence siehe changelog-Id <xyz>',
    p_severity := 'hint',
    p_related_task_id := NULL
);
```

Für Broadcast an alle: `p_to_agent := '*'`

## Workflow: Inbox prüfen (Agent-Start)
Jeder Scheduled Task SOLL zu Beginn checken:
```sql
SELECT * FROM claw_get_agent_inbox(p_agent_name := '<dein-task-name>', p_limit := 10);
```

Pro Message: entscheiden ob relevant. Wenn ja:
```sql
SELECT claw_ack_agent_message('<msg_id>', 'acted');  -- wurde berücksichtigt
```
Wenn nicht: `'dismissed'`.

## Workflow: Task erstellen mit Dependency
```sql
SELECT claw_create_task(
    p_owner_agent := 'ki-auto-daily-execution',
    p_title := 'Prüfe Pattern-Transfer von profilfoto',
    p_description := 'Title-Pattern mit Zahlen+Power-Words bei 3 pSEO-Seiten anwenden',
    p_domain := 'ki-automatisieren.de',
    p_priority := 2,
    p_blocked_by := ARRAY['<parent-task-id>']::UUID[]
);
```

## Workflow: Task completen
```sql
SELECT claw_complete_task('<task_id>', 'Ergebnis-Summary in 1 Satz');
```
→ Gibt Anzahl auto-unblocked dependent Tasks zurück.

## Workflow: Eigenes Kanban sehen
```sql
SELECT * FROM claw_get_agent_kanban('<dein-agent-name>');
```

## Hard Rules
- **Keine Direktiven**: Nachrichten sind informativ ("Hinweis", "Pattern gefunden", "Evidence"). Kein "mach X". Empfänger entscheidet selbst.
- **Domain-Boundary respektieren**: `profilfoto-weekly` darf `st-weekly` Hinweise geben, aber nicht direkt Code/Changes in st-automatisierung pushen.
- **Severity ehrlich setzen**: `urgent` nur bei Production-Impact. `hint` für Patterns. `info` für Routine.
- **Ack Pflicht**: Wer eine Nachricht liest, markiert sie mindestens `read`. Sonst wird die Inbox unübersichtlich.

## Wann NICHT triggern
- Wenn ein Task ganz normale eigene Arbeit macht (kein Cross-Agent-Bezug)
- Reine Debug-Diskussionen innerhalb einer Session
- Alles was in einem SKILL.md schon beschrieben ist (keine Duplizierung per Message)

## Integration in Weekly-Reviews
Die 3 Weekly-Strategy-Tasks (`ki-auto-weekly-strategy`, `seo-gsc-weekly-review-st`, `seo-weekly-profilfoto-ki`) sollen am ENDE ihrer Analyse-Phase prüfen:
1. Habe ich ein übertragbares Pattern gefunden? → send_agent_message an die anderen 2 Weekly-Agents (severity: hint)
2. Habe ich einen Bug gesehen der andere Domain betrifft? → send_agent_message an Daily-Executor (severity: warning)
