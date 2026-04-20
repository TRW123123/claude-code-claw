# SKILL: Instagram DM Outreach via Chrome MCP

## Workflow (pro DM)
1. Erst DM-Chatfenster schließen (falls offen von vorher)
2. Suche öffnen → Firmenname eingeben → 2s warten
3. Passendes Profil auswählen (erstes Ergebnis prüfen!)
4. "Nachricht senden" klicken → neues DM-Fenster öffnet
5. Text eingeben: Absätze mit shift+Return shift+Return
6. "Senden" klicken
7. Sheet: Namensbox klicken (38,103) → "C{row}" → Enter → "x" → Enter
8. Nächste Zeile

## Setup
- Chrome Profil: Profile 7 (ST-Automatisierung)
- Sheet: `1vxpDPBuVwwaeBZvUDLI-_cLt_pxcXXZpbp-aSWpTlGA` / Tab "Tabellenblatt4"
- Spalten: A=page_name, B=DM, C=Kontakt aufgenommen?
- Insta Account: @ki_automatisieren
- CSV-Export via: `fetch('...gviz/tq?tqx=out:csv&gid=1358644708').then(r=>r.text()).then(t=>window.__sheetData=t)`

## Learnings (KVP)
1. **DM-Popup bleibt offen** — nach jedem Send erst Chat schließen (X-Button), bevor nächstes Profil. Sonst landet Text im falschen Chat.
2. **Screenshot-Timeouts** — passieren bei schwerer Seite. 3s wait + retry löst es.
3. **Namensbox für Sheet-Navigation** — Klick auf (38,103), tippe "C{row}", Enter → zuverlässigste Methode.
4. **Suchfeld** — `find "search input field"` liefert ref, kein Pixel-Klick nötig.
5. **CSV-Daten cachen** — `window.__sheetData` bleibt im Tab erhalten, kein Re-Fetch nötig solange Tab offen.
6. **Firmennamen ≠ Insta-Handle** — Suche zeigt Vorschläge, erstes Ergebnis IMMER verifizieren (Name + Beschreibung matchen).
7. **Text-Eingabe** — 3 type-Calls + 2 shift+Return-Calls. Nicht alles in einem type (Enter sendet sofort).

## Fehler-Handling
- Profil nicht gefunden → ERST mindestens 2 alternative Suchbegriffe testen (z.B. nur Nachname, ohne GmbH, mit Branche). Erst nach 2 fehlgeschlagenen Alternativen: C{row} = "not found", weiter
- Privates Profil → C{row} = "skip-private", weiter  
- Action Block Popup → SOFORT STOPP
- Selektor-Fehler 3x → STOPP
- Weißer Screen nach Klick → Seite neu laden (navigate nochmal), dann retry
- WICHTIG: Nicht zu schnell als "not found" markieren. Firmennamen auf Instagram weichen oft stark ab. Immer Varianten probieren (Kurzform, ohne Rechtsform, Ortsname, Branche).

## Volumen
- 30-40 DMs/Tag, Pausen 30-90s zwischen DMs

## Optimierungen (KVP)
8. **"Nachricht senden" braucht manchmal 2 Klicks** — nach erstem Klick prüfen ob Textbox da ist, sonst nochmal klicken
9. **Send-Button per Koordinate (1494, 649)** — zuverlässiger als find "Senden" (Button taucht manchmal nicht im Accessibility Tree auf)
10. **Triple-click zum Suchfeld leeren** — bei Suche im selben Panel: triple_click auf Suchfeld überschreibt alten Text
11. **Tab-Gruppen können crashen** — wenn Tabs weg: tabs_context_mcp neu aufrufen, URLs neu öffnen. Login bleibt erhalten im Profil.
12. **Batch DM-Texte vorab laden** — window.__dm1 bis __dm16 cachen, spart JS-Calls pro DM
13. **Shortcuts-Dialog blockt Senden** — Instagram zeigt manchmal "Passende Tastenkombinationen" Dialog beim Tippen. Fängt Keyboard-Input ab und verhindert Senden. Fix: Nach dem Senden immer Screenshot machen. Wenn Dialog erscheint: X klicken oder Escape, dann DM-Text komplett neu eingeben.
14. **Sheet-Markierung verifizieren** — Namensbox-Navigation (Klick auf (38,103) → "C{row}" → Enter) kann fehlschlagen wenn vorher ein Bereich selektiert war. Nach Enter immer prüfen ob die richtige Zelle aktiv ist (Screenshot oder Namensbox-Anzeige checken).
15. **Tool-Schemas nach Context-Compression neu laden** — Chrome MCP Tools verlieren nach langer Session ihre Schemas. Fix: ToolSearch mit "select:tool_name" aufrufen um Schema neu zu laden.
16. **Direktnavigation statt Suche bei bekanntem Handle** — Wenn ein Profil bereits identifiziert wurde aber DM fehlschlug: navigate direkt zu instagram.com/{handle}/ statt erneut zu suchen. Spart Zeit.

## Session-Status (zuletzt: 2026-04-11)
- Bearbeitet: 20 Rows (Row 75-94)
- Gesendet: 10 DMs erfolgreich
- Not found: 5 (Row 76, 78, 80, 85, 87)
- Nicht bearbeitet: Row 89-94 (Session beendet auf User-Wunsch)
- Nächste: Row 89 (Karl Stahl Bedachungen)
- Ziel: 20 DMs pro Session, 30-40 pro Tag
- Tab-IDs ändern sich pro Session (neu laden mit tabs_context_mcp)
- CSV muss pro Session neu gefetcht werden (window.__sheetData)

## Erledigte DMs (Log)
| Row | Page | Handle | Status |
|-----|------|--------|--------|
| 62 | derProsch GmbH | @derprosch.de | ✅ gesendet |
| 63 | Handly | @handly.de | ✅ gesendet |
| 64 | Zimmerei Timmermann | @zimmerei_timmermann | ✅ gesendet |
| 65 | Eternit Deutschland | @eternit.deutschland | ✅ gesendet |
| 68 | Zetzsche Tiefbau GmbH | @zetzschetiefbau | ✅ gesendet |
| 69 | Wels Bedachungen | @welsbedachungen | ✅ gesendet |
| 70 | Holzbau von Geyso | @holzbau_von_geyso | ✅ gesendet |
| 71 | _planform_ | @_planform_ | ✅ gesendet |
| 72 | Harald Rusch Dachdecker | @ruschharald | ✅ gesendet |
| 73 | Klaas Ascheberg | — | ❌ not found |
| 74 | Zimmerei Claaßen | @zimmerei.claassen | ✅ gesendet |
| 75 | Persox Jobs | @persox.jobs | ✅ gesendet |
| 76 | Loës Holzbau | — | ❌ not found |
| 77 | Sillak und Geier | @zimmerei_sillakundgeier | ✅ gesendet |
| 78 | Car-l.de | — | ❌ not found |
| 79 | Jordan Dachdecker GmbH | @jordan.dachdecker | ✅ gesendet |
| 80 | Dämmung Nord | — | ❌ not found |
| 81 | Oliver Rasche Holzbau | @holzbau_oliver_rasche_ | ✅ gesendet |
| 82 | Roof-Tec | @rooftec_de | ✅ gesendet |
| 83 | Wierig Gruppe | @wierig_gmbh | ✅ gesendet |
| 84 | Tönjes & Meichsner | @toenjes_meichsner | ✅ gesendet |
| 85 | Jacobs GmbH | — | ❌ not found |
| 86 | Knallorange GmbH | @knallorange_gmbh | ✅ gesendet |
| 87 | Dachverbund | — | ❌ not found |
| 88 | Ernst Neger Bedachungs GmbH | @ernst_neger_mainz | ✅ gesendet |
