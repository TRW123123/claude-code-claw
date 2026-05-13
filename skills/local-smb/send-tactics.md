# Send-Tactics — Instagram DM via Chrome MCP

> Taktische Details für Phase 4 (Senden). Pixel-Koordinaten, Race-Conditions, Workarounds.

## Standard-Ablauf pro Lead

1. **DM-Compose über Inbox** (NICHT vom Profil-Compact-Panel)
   - Navigate `https://www.instagram.com/direct/inbox/`
   - Click Bleistift-Icon bei `(372, 36)` — Compose-Modal öffnet
   - URL `/direct/new/` funktioniert NICHT (redirect zur Inbox)
2. **Suche + Auswahl**
   - Click Search-Feld `(780, 196)` (alternative `(780, 188)` bei kompaktem Layout)
   - Type Handle exakt
   - Wait 3s für Suche
   - Click Radio-Button erster Treffer `(945, 232)` oder `(945, 224)`
   - Click „Chatten" `(777, 586)` oder `(777, 548)`
3. **Chat öffnen → Wait 6-8s**
4. **Text einfügen** (Copy-Paste, NICHT tippen)
   - DM aus Spalte K mit `||` als Trenner
   - Vor Paste: PowerShell `Set-Clipboard` mit `||` durch echte Newlines (`\r\n\r\n`) ersetzt
   - Click Textfeld `(900, 716)` oder `(900, 670)` (Layout-abhängig)
   - `Ctrl+V`
5. **Senden-Button** `(1521, 715)` oder `(1521, 670)` — NICHT Return drücken
6. **Sheet updaten**: F=`gesendet`, G=`YYYY-MM-DD`, H=`local-v6`
7. **30-90 Sekunden Pause** zum nächsten Lead (Anti-Ban)

## Race-Conditions & Workarounds

### Problem 1: Erstes Paste landet nicht im Textfeld
**Symptom:** Nach Ctrl+V ist Chat noch leer.
**Ursache:** Insta-DOM noch nicht ready nach Chatten-Click.
**Workaround:** **2-Cycle-Paste-Pattern**
- Batch 1: Compose+Search+Select+Chatten in einem Schwung
- Batch 2 (separater Browser-Batch): Click Textfeld + Wait 2s + Ctrl+V + Wait 3s + Send

Wenn erster Cycle fehlschlägt → einfach Click+Paste+Send wiederholen.

### Problem 2: Doppel-Send-Gefahr nach Re-Paste
**Symptom:** Wenn erster Send schon geklappt hat (sichtbare DM-Bubble) und ich Re-Paste mache, wird identische DM ein 2. Mal abgesendet.
**Mitigation:** Nach Send immer Screenshot prüfen:
- DM-Bubble sichtbar + Textfeld leer → ✅ gesendet, NICHT Re-Paste
- Textfeld leer + keine Bubble → ❌ Re-Paste nötig
- Textfeld voll + keine Bubble → Send-Click hat versagt, nur Senden-Button klicken
- DM-Bubble + Textfeld voll → Doppel-Paste-Risiko, Ctrl+A + Delete vor weiter

### Problem 3: Compose-Modal öffnet sich nicht
**Symptom:** Click auf Bleistift-Icon (372, 36) → kein Modal.
**Ursache:** Page noch im Lade-Zustand.
**Workaround:** 5s Wait nach Navigation, dann 2-3s zwischen Click und Screenshot. Wenn Modal nicht öffnet → nochmal Click.

### Problem 4: Compose-Click landet beim falschen Chat (Doppel-Send-Risiko!)
**Symptom:** Compose-Search-Type-Sequenz läuft, aber Modal hat sich nicht geöffnet → Text landet im aktuell offenen Chat-Textfeld → Ctrl+V → fast-Send an FALSCHEN Lead.
**Mitigation:** Vor neuem Lead **immer prüfen:**
- Screenshot nach Compose-Click → Modal sichtbar?
- Wenn kein Modal → Esc + Ctrl+A + Delete + Compose-Click wiederholen
- Niemals Type ins Suchfeld bevor Modal verifiziert

## Verifikation per Inbox-Sidebar

Nach Send-Click:
- Links Inbox-Liste prüfen
- Empfänger sollte oben erscheinen mit „Du: …" Preview und „1 Min."
- Wenn nicht in Liste → DM nicht angekommen, Re-Paste

## Layout-Drift

Insta passt Layout an Browser-Width an. Beobachtete Koordinaten (Profile 7, Standard Window):

| Element | Y voll-Layout | Y kompakt-Layout |
|---------|---------------|-------------------|
| Compose-Icon | 36 | 36 |
| Search-Feld | 196 | 188 |
| Radio-Button | 232 | 224 |
| Chatten-Button | 586 | 548 |
| Textfeld | 716 | 670 |
| Senden-Button | 715 | 670 |

Wenn Senden-Button nicht funktioniert auf Y=715 → versuche Y=670.

## Anti-Ban-Regeln

- Max 25 DMs pro Tag pro Account
- Min 30s Pause zwischen DMs, Standard 45-60s, Bei Compose-Fehler 90s
- Keine Bursts: nicht 10 DMs in 2 Minuten
- Bei Insta-Warning → sofort stoppen, 24h Pause
