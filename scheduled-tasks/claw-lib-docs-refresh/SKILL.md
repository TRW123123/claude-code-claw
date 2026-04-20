---
name: claw-lib-docs-refresh
description: Wöchentlich Scripts-Übersicht CLAW_SCRIPTS.md neu generieren (Halluzinations-Schutz)
---

Führe aus:
```bash
node C:/Users/User/Claude/scripts/claw-generate-lib-docs.mjs
```

Dies regeneriert C:\Users\User\Claude\CLAW_SCRIPTS.md aus den Header-Kommentaren aller Scripts in ~/Claude/scripts/.

Nach erfolgreichem Run: kurzen Log-Eintrag in C:\Users\User\Claude\sessions\agent-log-[HEUTE].md mit der Anzahl dokumentierter Scripts.

Wenn das Script meldet "⚠ X Scripts ohne Body-Kommentar": **nichts tun**, nur im Log vermerken. Es ist nicht Aufgabe dieses Task die Headers zu ergänzen — das ist manuelle Arbeit wenn die Zeit passt.

## HARD RULES
- Nur das Script ausführen, keine anderen Dateien ändern
- Keine Commits, kein Push
- Kein Deploy