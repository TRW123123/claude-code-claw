# SKILL: Instagram DM Outreach via Chrome MCP

## Workflow (pro DM)
1. Erst DM-Chatfenster schließen (falls offen von vorher)
2. Suche öffnen → Firmenname/Handle eingeben → 2s warten
3. Passendes Profil auswählen (erstes Ergebnis prüfen! Name + Beschreibung matchen)
4. "Nachricht senden" klicken → neues DM-Fenster öffnet
5. Warten bis Panel-Header den Account-Namen zeigt (NICHT "Instagram-Nutzer") — erst dann tippen
6. Text eingeben: Absätze mit shift+Return shift+Return
7. Senden via Enter-Taste (zuverlässiger als Send-Button-Klick)
8. Sheet: Namensbox klicken (38,103) → "F{row}" → Enter → "gesendet" → Enter → Datum + Variante eintragen
9. 30-90s Pause → Nächste Zeile

## Setup — AUTOMOTIVE KAMPAGNE
- Chrome Profil: Dein Chrome-Profil für den Outreach-Account
- Insta Account: `@[your-outreach-handle]`
- Sheet: `[your-google-sheet-id]` / Tab **"automotive"** (eigene gid)
- Sheet-Spalten: A=Handle, B=Name, C=Follower, D=Stadt, E=x, F=Status, G=Datum, H=Variante, **I=variant (NEU 2026-05-12)**, **J=slot_data (NEU 2026-05-12)**
- CSV-Export via: `fetch('https://docs.google.com/spreadsheets/d/[your-google-sheet-id]/gviz/tq?tqx=out:csv&gid=YOUR_GID').then(r=>r.text()).then(t=>window.__sheetData=t)`
- **ACHTUNG**: CSV-Export kann Tab-separated sein → alternativ Sheet direkt im Browser lesen und Zellen navigieren

## TEMPLATE-POOL V9.5 (NEU 2026-05-12 — Apify-Pre-Check-getrieben)

> **PFLICHT vor jedem DM-Send:** Pre-Check via `apify-pre-check.mjs` → liefert `variant` + `slots`. Damit wird das passende Template gefüllt. Fallback wenn Pre-Check fehlschlägt: V9.4/A unverändert.

### Pre-Check Pipeline
```bash
node ~/.claude/skills/insta-dm/scripts/apify-pre-check.mjs handle1 handle2 ... > /tmp/precheck.json
```
- Apify-Call pro Lead (`shu8hvrXbJbY3Eb9W`, $0.0025/Profil)
- Routing-Logic wählt 1 von 5 Varianten (siehe unten)
- Slot-Daten werden für Template-Fill extrahiert
- Output: JSON `{results: [{handle, variant, slots, ...}], summary: {...}}`
- Kosten 30 Leads: ~$0.08/Session

### Routing-Logic (in dieser Reihenfolge auswerten)
```
1. IF latestPosts[0] ist Video/Reel UND videoViewCount ≥ 50:
   → V9.5-REEL-PERFORMANCE
2. ELIF Marken+Modell extrahierbar aus latestPosts[0].caption:
   → V9.5-MODELL
3. ELIF biography matched Spezialisierungs-Pattern:
   → V9.5-SPEZIALIST
4. ELIF biography enthält "Seit YYYY" oder "Familienunternehmen":
   → V9.5-HERITAGE
5. ELSE:
   → V9.4/A (Fallback)
```

---

### V9.5-MODELL (Erwartung: ~30-40% der Leads)

**Slots:** `{LETZTES_MODELL}` (z.B. "BMW M3 Competition"), `{DATUM}` (z.B. "vom 7. Mai", "vor 3 Tagen")

```
Hallo Herr [Name],

Ihr {LETZTES_MODELL}-Post {DATUM} ist mir aufgefallen. Aus dem gleichen Foto-Material plus 20 Sekunden Bewegt-Bild lassen sich auch andere Inserate auf Instagram-tauglich machen, ohne neuen Dreh.

Ein Wagen zum Testen, kostenlos. Haben Sie einen Link für uns?
```

### V9.5-REEL-PERFORMANCE (Erwartung: ~5-10% der Leads — wenn matched, sehr stark)

**Slots:** `{LETZTES_MODELL}`, `{DATUM}`, `{VIEWS}` (Zahl aus videoViewCount)

```
Hallo Herr [Name],

Ihr Reel zum {LETZTES_MODELL} {DATUM} ist gut gegangen. Mit dem gleichen Format aus reinen Inseratsfotos lassen sich auch die übrigen Fahrzeuge ohne neuen Dreh auf Instagram bringen.

Ein Wagen zum Testen, kostenlos. Haben Sie einen Link für uns?
```

### V9.5-SPEZIALIST (Erwartung: ~20-30% der Leads)

**Slots:** `{SPEZIALISIERUNG}` (z.B. "BMW-Vertragshändler", "Sportwagen-Specialist"), `{STADT}` (aus Sheet Spalte D)

```
Hallo Herr [Name],

{SPEZIALISIERUNG} in {STADT} — passt sehr gut zu unserem Format. Wir machen aus Inseratsfotos 20-Sekunden-Videos für Instagram und TikTok, ohne Dreh.

Ein Wagen zum Testen, kostenlos. Haben Sie einen Link für uns?
```

### V9.5-HERITAGE (Erwartung: ~10-15% der Leads)

**Slots:** `{TRADITIONS_HINWEIS}` (z.B. "Seit 1989 (37 Jahre)", "Familienunternehmen in 3. Generation")

```
Hallo Herr [Name],

{TRADITIONS_HINWEIS} in der Branche — die Erfahrung zeigt sich in den Inseraten. Für die Instagram-Reichweite machen wir aus dem Foto-Material 20-Sekunden-Videos, ohne Dreh.

Ein Wagen zum Testen, kostenlos. Haben Sie einen Link für uns?
```

### V9.4/A — FALLBACK (Erwartung: ~10-20% der Leads)
Unverändert, wird genutzt wenn keine V9.5-Routing-Bedingung greift ODER Apify-Pre-Check fehlschlägt.

```
Hallo Herr [Name],

auf Mobile.de stehen Ihre Fahrzeuge neben vergleichbaren Inseraten. Entschieden wird dort über den Preis.

Wir machen aus den Fotos eines Ihrer Inserate ein 20-Sekunden-Video für Instagram und TikTok. Ohne Dreh, ohne dass jemand vor die Kamera muss. Sie schicken den Link, wir liefern das fertige Video zurück.

Ein Fahrzeug zum Testen, kostenlos. Haben Sie einen Link für uns?
```

---

**Harte Regeln (alle Varianten):**
- Anrede: "Hallo Herr/Frau [Name]," — Sie-Form, kein "Moin", kein "Team X"
- Produkt-Klarheit: 20-Sekunden-Video, Instagram + TikTok, ohne Dreh, aus Inserats-Fotos
- Keine Agentur-Wörter: kein Funnel, Performance, Skalierung, Strategie
- Ziel: unter 80 Wörter, drei Blöcke: Anker / Offer / CTA
- Variante + Slots in Sheet Spalte I + J vermerken (für Performance-Tracking)

**Slot-Extraction (im Script implementiert):**
- `LETZTES_MODELL`: Regex auf 50-Marken-Whitelist (BMW, Mercedes, Audi, Porsche, VW, ...) + Modell-Token aus `latestPosts[0].caption`
- `DATUM`: aus `latestPosts[0].timestamp` → "vor X Tagen" (≤7d) oder "vom DD. Monat" (>7d)
- `SPEZIALISIERUNG`: Pattern-Match in `biography` (Marke+Rolle, Premium-Nischen, Geschäftsmodell)
- `TRADITIONS_HINWEIS`: Regex `[Ss]eit (\d{4})` oder Keywords "Familienunternehmen", "X. Generation"

## ⚠️ Template V9.4/B — DEPRECATED (2026-04-28)
Variante B (mit 1-Satz-Icebreaker) hat **schlechtere Performance** als A gezeigt.
A/B-Test abgeschlossen — V9.5-Pool ersetzt B als Personalisierungs-Pfad.

## Qualifikations-Kriterien (geändert 2026-05-06)
- Follower: **100+** (unter 100 → überspringen) — gesenkt von 400, da DACH-Autohäuser auf IG kleine Reichweite haben
- Aktivitäts-Filter: **mindestens 1 Beitrag in den letzten 60 Tagen** (sonst toter Account → skip-inactive)
- Website im Profil (Business-Signal — keine Website + niedrige Follower = skip)
- Konto: öffentlich, aktiv, deutsches Autohaus
- Nicht bereits kontaktiert (Sheet prüfen + Compact-DM-Panel-Check!)

## Lead Discovery — DataForSEO SERP-Pattern (NEU 2026-05-06, bevorzugt)
**Massiv schneller + besser als Instagram-Search-Panel.** Ein DataForSEO-SERP-Call mit Query `site:instagram.com autohaus {stadt}` liefert pro Stadt 30-50 Treffer mit Handle UND Follower-Zahl direkt aus dem breadcrumb (`Ca. 38.740 Follower`). Pre-Filter auf Follower ≥ 200 vor Profil-Visit → Qualifikationsrate 80% statt 25%.

**Helper-Script:** `~/.claude/skills\insta-dm\scripts\dataforseo-discovery.mjs`

```powershell
# Voraussetzung: DataForSEO Creds in env (einmalig setzen)
$env:DATAFORSEO_LOGIN="..."
$env:DATAFORSEO_PASSWORD="..."

# Standard-Lauf über 14 DACH-Großstädte → TSV auf stdout
node ~/.claude/skills/insta-dm/scripts/dataforseo-discovery.mjs

# Custom Städte
node ~/.claude/skills/insta-dm/scripts/dataforseo-discovery.mjs köln düsseldorf münster

# In Clipboard für direkten Paste ins Sheet
node ~/.claude/skills/insta-dm/scripts/dataforseo-discovery.mjs | clip
# Dann im Sheet: Ctrl+J → A{nextRow} → Enter → Ctrl+V
```

**Was das Script macht:**
1. Lädt existierende Handles aus dem Live-Sheet (gviz CSV) → Set für Dedup
2. Pro Stadt: SERP-Call `site:instagram.com autohaus {stadt}` (depth=50)
3. Parst Handle aus URL, Name aus title, Follower aus breadcrumb
4. Filtert: <200 Follower und Duplikate raus
5. Ausgabe: TSV `handle\tname\t\tstadt` direkt für Sheet-Paste

**Erwartung pro Lauf:** 100-300 vorqualifizierte Leads für ~$0.05 in <2 Minuten.

## Lead Discovery — Fallback via Instagram-Search-Panel
Falls DataForSEO nicht verfügbar:
1. Existing Handles aus `window.__sheetData` per Regex extrahieren
2. Instagram-Suchfeld öffnen (Sidebar Suche-Icon)
3. JS-Helper im Browser: `window.__doSearchV3 = async query => { … }` mit nativem Setter für React-Inputs
4. Mehrere Stadt-Queries durchgehen, Treffer aus Suchpanel sammeln (Text enthält Handle direkt)
5. Filter + TSV-Paste wie oben
6. **Ziel:** 20-30 neue Leads pro Discovery-Session

⚠️ Clipboard-Write erfordert focused Tab → erst auf Sheet klicken, dann JS ausführen, dann paste.

## Compact-DM-Panel-Pattern (PFLICHT seit 2026-05-05)
Nach Klick auf "Nachricht senden" öffnet sich rechts ein Compact-Panel. **NICHT auf Expand-Icon klicken** (löst Tab-Freeze aus). Stattdessen:
1. Klick ins Compact-Textfeld bei `(1370, 596)` (rechts unten)
2. DM tippen mit `shift+Return shift+Return` zwischen Absätzen
3. `Return` zum Senden
4. Bei "Dieses Konto kann deine Nachricht nicht erhalten…" → Sheet auf `skip-no-dm` setzen
5. Mobile.de-Erwähnung im Text triggert automatische Link-Vorschau (gut für Engagement)


## Session Logs (private)

Daily session notes, sent-DM logs, reply tracking, and KVP iterations live outside this public skill in private session files. The patterns above (template pool, qualification criteria, discovery workflow, compact-panel handling) are the reusable substance.

If you adopt this skill: keep your own daily log somewhere private (a journal markdown, a Notion page, your CRM). Never paste real prospect handles, surnames, or follower counts into the SKILL.md itself.

## Volume guidance

Sustainable daily DM volume per Instagram account: 20-30 DMs. Above 50/day risks shadowban or "Action Blocked" notice. Use multiple accounts if you need higher daily throughput, and rotate between them with realistic gaps (30-90 seconds between sends).
