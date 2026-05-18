# SKILL: Local SMB Instagram DM Outreach

Kampagne für lokale Kleinunternehmen (Friseure, Barbiere, Nagelstudios, Restaurants, Bäckereien, Cafés) im DACH-Raum. Ziel: personalisierte Instagram-DMs, die auf einem **echten beobachteten Pain-Point** basieren — niemals auf generischen Annahmen.

**Aktueller Stand:** [`sessions/local-smb-campaign-status.md`](../../../Claude/sessions/local-smb-campaign-status.md)
**Send-Taktik mit Pixel-Details:** [`send-tactics.md`](./send-tactics.md)
**Daily-Agent:** Task `local-smb-daily-outreach`, läuft Mo-Fr 10:03 lokal

---

## Geschäftsmodell-Frame (PFLICHT verstehen vor DM-Schreiben)

Wir verkaufen: **Eigene Website + eigene Buchungs-/Bestell-Lösung im Look des Kunden**, kostenlose Erstellung, **monatliche Gebühr** als Recurring Revenue.

DMs verkaufen das nie direkt. Sie öffnen das Gespräch mit einer beobachteten Lücke und bieten eine **kostenlose Demo** an. Die Demo ist die Brücke ins Verkaufsgespräch.

---

## Hard Rules — Zero-Cognitive-Load DMs

Empfänger ist 40-60 Jahre alt, Inhaber/Operator, kein Marketing-Background. **Jeder Satz muss in unter 1 Sekunde sitzen.**

### Verbotene Wörter im DM-Text (absolut, keine Ausnahmen)

`Branding`, `Marge`, `Funnel`, `Conversion`, `konvertieren`, `optimieren`, `skalieren`, `Performance`, `Visibility`, `Sichtbarkeit` (im Marketing-Sinn), `Engagement`, `Engagement-Rate`, `Reichweite`, `Lead`, `Touchpoint`, `USP`, `Positionierung`, `Pipeline`, `Plattform-Lock-in`, `konsolidieren`, `einsammeln` (im Marketing-Sinn), `ROI`, `Strategie`, `Synergien`, `holistisch`, `Storytelling`.

### Tausch-Tabelle

| Schwamm | Tausche gegen |
|---------|---------------|
| Branding | „so wie ihr aussehen" / „wie [Salon-Name], nicht wie Studiobookr" / „im Look von euch" |
| Marge | „ein Teil vom Preis geht an…" / „die Seite nimmt ein paar Prozent" |
| Plattform-Lock | „ihr seid abhängig von der Plattform" |
| konsolidieren / einsammeln | „zu euch holen" / „auf eine Stelle bringen" |
| Engagement | „wie viele reagieren" / „Likes" |
| Visibility / Sichtbarkeit | „wer euch findet" / „wer euch sieht" |
| Reichweite | „wie viele Leute sehen euch" / „wie viele Follower" |
| Conversion / konvertieren | „buchen" / „Termin machen" / „kaufen" |
| Funnel | komplett raus, umschreiben |
| optimieren | „besser machen" |

### Weitere Hard Rules

1. **Anrede:** „Hallo," + ihr-Form (lokale KMUs sind informal); bei Premium-Profilen „Hallo Herr/Frau X" wenn Name aus Bio erkennbar
2. **Maximal 75 Wörter** im gesamten DM. Toleranz bis 85 nur bei datenreichen Lifecycle-Hooks.
3. **Drei Blöcke**, getrennt durch `||`: Hook / Pain + Frame / CTA
4. **Standard-CTA**: *„Wäre es okay, wenn ich euch kostenlos zeige, wie das für [Name] aussehen würde?"*
5. **Kein Em-Dash** (`–`, `—`). Stattdessen Punkt, Komma oder ganzer Satz.
6. **Keine Stakkato-Sätze** — jeder Satz hat Subjekt + Verb.
7. **Kein Bindestrich** in zusammengesetzten Wörtern wo es einfacher geht („Beauty Studio" statt „Beauty-Studio")
8. **Hooks immer auf echten Daten** (Apify-Bio, letzte Post-Caption, DataForSEO-Rating, sichtbare Booking-Plattform) — niemals erfundene Behauptungen
9. **Lifecycle-Event hat absolute Priorität** im Hook (Umzug, Eröffnung, Auszeichnung) — überschreibt alle anderen Pain-Patterns
10. **Skip-Logik**: Wenn Lead gut aufgestellt ist (eigene Website + eigene Buchung + aktive Posts + >1% Reaktionen) → DM SKIPPEN als `skip-good-shape`. Niemals generischen Hook erfinden.

---

## Setup

- **Chrome Profil**: Dein Chrome-Profil für den Outreach-Account
- **Insta Account**: `@[your-outreach-handle]` (separater Account, nicht der Hauptaccount)
- **Sheet**: `[your-google-sheet-id]` / Tab **„local-smb"** (eigene gid)
- **Apify Token**: `~/.claude/.mcp.json` → `mcpServers.apify.env.APIFY_TOKEN`
- **DataForSEO**: via MCP-Server (`mcp__dataforseo__*`) ODER direkt mit Basic Auth aus `.mcp.json` → `mcpServers.dataforseo.env.DATAFORSEO_USERNAME` + `DATAFORSEO_PASSWORD`

### Sheet-Spalten (16)

| Spalte | Feld | Beschreibung |
|--------|------|--------------|
| A | handle | Instagram-Handle |
| B | name | Business-Name |
| C | follower | Follower-Zahl aus Discovery |
| D | stadt | Standort-Stadt |
| E | branche | Friseur, Barbier, Nagelstudio, Restaurant, Cafe, Bäckerei |
| F | status | siehe Status-Werte unten |
| G | datum | Senden-Datum YYYY-MM-DD |
| H | variante | local-v1 / local-v6 etc. |
| I | telefon | aus Maps |
| J | adresse | aus Maps |
| K | dm_text | DM mit `\|\|` als Absatztrenner |
| L | profil_notiz | 3-5 Bullets aus Apify-Scrape |
| M | rating | aus DataForSEO Local Pack |
| N | reviews | Anzahl Reviews aus DataForSEO |
| O | booking_platforms | Komma-Liste: Studiobookr, Planity, Fresha, Salonkee, ... |
| P | lifecycle_event | Umzug / Eröffnung / Auszeichnung / Renovierung — sonst leer |

### Status-Werte (Spalte F)

| Status | Bedeutung |
|--------|-----------|
| `offen` | Noch nicht kontaktiert |
| `gesendet` | DM gesendet |
| `skip-no-dm` | DM-Button nicht vorhanden ODER Bio sagt explizit „keine DM-Anfragen" |
| `skip-low-follower` | <100 Follower |
| `skip-private` | Privates Profil |
| `skip-not-found` | Handle nicht gefunden |
| `skip-already-dm` | Bereits kontaktiert (Chat-History sichtbar) |
| `skip-good-shape` | Lead gut aufgestellt, kein klarer Pain → kein DM |
| `no-insta` | Kein Instagram, nur Telefon/Adresse |

**`skip-inactive` existiert NICHT mehr.** Inaktivität (letzter Post >60 Tage) wird stattdessen zum positiven Hook: *„auf Insta wurde es ruhiger / eine eigene Seite arbeitet weiter, auch wenn Insta pausiert"*.

---

## PHASE 1 — Lead Discovery

### IG-Leads via DataForSEO SERP
```
Tool: mcp__dataforseo__serp_organic_live_advanced
keyword: "site:instagram.com {branche} {stadt}"
language_code: de
location_name: Germany
depth: 30
```
Filter: ≥100 Follower (aus breadcrumb), öffentliches Profil.

### No-Insta-Leads via Google Maps
```
Tool: mcp__dataforseo__business_data_business_listings_search
categories: ["hair_salon", "barber_shop", "nail_salon", "restaurant", "cafe", "bakery"]
location_coordinate: "{lat},{lon},{radius_km}"
is_claimed: true
order_by: ["rating.votes_count,desc"]
```

### Adaptive Strategie (durch Daily-Agent)

Statt starrer Wochentags-Rotation entscheidet der Daily-Agent datenbasiert. Pro (Stadt × Branche) klassifiziert er:

| Klasse | Bedingung | Aktion |
|--------|-----------|--------|
| **HOT** | reply_rate > 5% UND sent ≥ 5 | Vertiefen, nächste SERP-Page |
| **WARM** | sent 1-4, reply_rate noch unklar | Fortsetzen, SERP+1 |
| **COLD** | sent ≥ 10 und reply_rate < 2% | Vermeiden |
| **UNTESTED** | discovered=0 oder sent=0 | Discovery starten |
| **FULL** | discovered ≥ 50 + Page-Tiefe ≥ 5 | Wechseln |

Quellen werden auch adaptiv gewählt:
1. DataForSEO SERP (Default)
2. DataForSEO Maps-Listings (wenn SERP ausgeschöpft)
3. Apify Hashtag-Scraper (für Niche-Branchen)
4. Apify Konkurrenz-Follower-Analyse (wenn HOT-Profile bekannt — deren Follower sind ähnliche Businesses)

Performance-Log: `~/Claude/sessions/local-smb-daily-log.tsv`.

---

## PHASE 2 — Profil-Analyse (PFLICHT vor DM-Schreiben)

**Hard Rule: DM darf erst geschrieben werden, wenn L, M, N, O im Sheet befüllt sind. Keine Ausnahme.**

### 2A. Apify Instagram Scraper
```
POST https://api.apify.com/v2/acts/[apify-actor-id]/run-sync-get-dataset-items
 ?token=$APIFY_TOKEN&timeout=120&format=json

Body:
{
 "directUrls": ["https://instagram.com/{handle}/"],
 "resultsType": "details",
 "resultsLimit": 5,
 "addParentData": false
}
```
Kosten: ~$0,0025 pro Profil.

Aus dem Response extrahieren:
- `biography` → Spalte L Bullet 1
- `externalUrl` → Spalte L Bullet 2 (Linktree- oder Website-Link)
- `followersCount` / `postsCount` → Bullet 3
- `businessCategoryName` → für Decision-Tree
- `latestPosts[0..2].caption` + `timestamp` → Bullet 4+5 + Lifecycle-Erkennung
- `latestPosts[0].likesCount` / `followersCount` → Engagement-Rate (für skip-good-shape Check)

### 2B. DataForSEO SERP
```
Tool: mcp__dataforseo__serp_organic_live_advanced
keyword: "{name} {stadt}"
language_code: de, location_name: Germany, depth: 10
```
Aus dem Response extrahieren:
- `items[type=local_pack].rating.value` → Spalte M
- `items[type=local_pack].rating.votes_count` → Spalte N
- Buchungs-Plattformen in Top-10: `studiobookr.com`, `planity.com`, `fresha.com`, `salonkee.de`, `treatwell.de`, `booksy.com`, `eatbu.com` → Spalte O als Komma-Liste

### 2C. Lifecycle-Event-Detection

Aus den letzten 3 Post-Captions, **nur diese 4 Kategorien als zuverlässig:**

- `Umzug` — Trigger: „umzug", „ziehen um", „neue adresse", „neuer standort", „ab sofort in"
- `Eröffnung` — Trigger: „eröffnung", „neu eröffnet", „soft opening", „wir sind da", „grand opening"
- `Auszeichnung` — Trigger: „ausgezeichnet", „WAZ", „preis gewonnen", „best of", konkrete Auszeichnungs-Nennung
- `Renovierung` — Trigger: „umbau", „renovierung", „frisch renoviert"

**NIE als Auto-Trigger nutzen:** `Jubiläum` mit „jahre" oder „feiern wir" — zu viele False Positives („10 Jahre jünger", „Wir feiern Muttertag"). Bei Jubiläum-Hook: manuell aus Bio prüfen („Seit YYYY") und nur dann setzen.

---

## PHASE 3 — DM-Schreiben nach Decision-Tree

### Pain-Pattern-Decision-Tree

```
Aus den Spalten L/M/N/O/P den passenden Hook wählen:

E) Lifecycle-Event (Spalte P gefüllt)
 → ABSOLUTE PRIORITÄT. Hook = der Event.
 → Beispiel: "Glückwunsch zum neuen Standort in der [Straße]."

D) Website ✓ + 1+ Buchungs-Plattformen
 → Hook = Plattform-Abhängigkeit + Wunsch auf eigene Buchung
 → Beispiel: "Mir ist aufgefallen, dass eure Website da ist, aber Termine über Studiobookr und Planity laufen."

C) Keine Website + 1+ Buchungs-Plattformen
 → Hook = Plattform-Abhängigkeit, eigenes Standbein fehlt
 → Beispiel: "Wer euch googelt, landet bei Studiobookr und nicht bei euch."

B) Website ✓ + keine Buchungs-Plattformen
 → Hook = Website da, aber Buchung nicht eingebaut
 → Beispiel: "Eure Website ist da, aber buchen geht nur über Anruf."

A) Keine Website + keine Buchungs-Plattformen
 → Hook = ihr existiert online nur auf Instagram
 → Beispiel: "Wer euch googelt, landet nur auf eurem Insta-Profil."

F) Niedrige Reaktionen (< 1% Likes/Follower) ohne andere Lücke
 → Sekundär-Hook: "Ihr postet regelmäßig, aber die Reaktionen bleiben klein."

X) Lead ist gut aufgestellt
 → SKIPPEN, Status = `skip-good-shape`. Kein DM.
```

### DM-Struktur (≤ 75 Wörter, 3 Blöcke, `||` als Trenner)

```
[BLOCK 1 — Hook]
Persönlicher Aufhänger, datenbasiert.
Lifecycle-Event > Profil-Beobachtung > generische Lob.
1-2 Sätze.

[BLOCK 2 — Pain + Frame]
"Mir ist aufgefallen, dass…" (konkrete Lücke aus Phase 2)
+ Konsequenz für den Inhaber
+ "Ich helfe gerade [Branche] in [Stadt] genau dabei."
2-3 Sätze.

[BLOCK 3 — CTA]
"Wäre es okay, wenn ich euch kostenlos zeige,
 wie das für [Name] aussehen würde?"
1 Satz, immer Frage-Form.
```

### Gold-Beispiel (fiktives Beispiel — Pattern E + D)

```
Glückwunsch zum neuen Standort in der Hauptstraße.
Euren Umzugs-Beitrag habe ich gerade gesehen.
||
Mir ist aufgefallen, dass eure Website zwar da ist,
aber Termine über Studiobookr, Planity und Fresha laufen.
Das funktioniert, nur sieht jede Buchung dann
wie Studiobookr aus, nicht wie [Salon-Name].
Bei dem Umzug wäre der perfekte Moment,
das wieder zu euch zu holen.
Ich helfe gerade Salons in [Stadt] genau dabei.
||
Wäre es okay, wenn ich euch kostenlos zeige,
wie das für [Salon-Name] aussehen würde?
```

70 Wörter. Drei Blöcke. Kein Em-Dash. Kein Stakkato. Keine Schwamm-Wörter.

---

## PHASE 4 — DM Senden

**Taktische Details (Pixel-Koordinaten, Race-Conditions, Workarounds):** siehe [`send-tactics.md`](./send-tactics.md).

Kurzfassung:
1. Compose über Inbox (`/direct/inbox/` → Bleistift-Icon)
2. Handle suchen, Profil wählen, Chatten
3. Copy-Paste DM aus Spalte K (vorher `||` → `\r\n\r\n` ersetzen via PowerShell `Set-Clipboard`)
4. 2-Cycle-Paste-Pattern wenn nötig (erstes Paste landet manchmal nicht)
5. Senden-Button klicken (nicht Return)
6. Verifikation per Inbox-Sidebar (Empfänger oben mit „Du: …")
7. Sheet updaten: F=`gesendet`, G=`YYYY-MM-DD`, H=`local-v6`
8. 30-90s Pause (Anti-Ban, max 25 DMs/Tag/Account)

---

## PHASE 5 — Sheet Navigation

**PFLICHT-METHODE:** Cell-Navigation via **URL-Parameter** statt Name-Box-Click.

```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit?gid={TAB_GID}&range={CELL}
```

Nach Navigation ist die Cell automatisch selektiert. Dann direkt `Ctrl+V` für Bulk-Paste.

**Warum:** Name-Box-Click bei `(40, 103)` oder `(40, 130)` ist Layout-abhängig und kann zwischen Sessions verschieben. Falscher Click landet in einer Cell und überschreibt deren Inhalt mit dem getippten Range-Namen (z.B. „F35" landet in A1).

**Bulk-Update Workflow:**
1. PowerShell: `Set-Clipboard -Value (Get-Content -Path "C:/path/file.txt" -Raw -Encoding UTF8)` (`-Encoding UTF8` Pflicht für Em-Dashes/Umlaute)
2. Browser: Navigate to `?gid=...&range=K32`
3. Wait 3-5s für Sheet-Load
4. `Ctrl+V`

**Anti-Drift:** Clipboard kann zwischen `Set-Clipboard` und `Ctrl+V` von anderen Prozessen überschrieben werden. Max 5 Sekunden auseinander, sonst neu setzen.

**Status-Update Hard Rule:** Vor jedem F-Spalten-Paste IMMER aktuellen Status via gviz CSV refetchen und mergen. Manuelle Edits dürfen nicht überschrieben werden.

---

## Helper-Script

### `pre-check-leads.mjs`

Macht Phase 2 (Apify + DataForSEO) für alle Leads. Aktuell hart-kodiert auf `local-smb-rows-32-61.json`, wird nach Bedarf umgebaut wenn Daily-Agent es nutzt.

```
node ~/Downloads/pre-check-leads.mjs
```

Output: `~/Downloads/profile-notes.json` mit Bio, externalUrl, latestPosts, lifecycle_event, rating, reviews, booking_platforms pro Lead.

TODO (offen): Script auf CLI-Args umbauen (`--leads`, `--output`, `--concurrency`) für Wiederverwendung im Daily-Agent.

---

## Lehren aus den Iterationen

| Version | Was | Lehre |
|---------|-----|-------|
| V1 (1. Durchlauf, 14 DMs) | Profil-Analyse + Berater-Frame + Soft-CTA | Funktioniert (1 Reply: C&D WashParc) — der Gold-Standard |
| V2-V5 | Reel-Pitch ohne Profil-Check, dann Stakkato, dann Em-Dash, dann zu lang | Alle Stufen vom User zurückgerufen — Pain-Points OHNE Daten sind generisch |
| V6 (Apify + DataForSEO) | Echte Daten, Zero-Cognitive-Load, Free-Demo-CTA | **Gold-Standard ab 2026-05-11** |

---

## Daily-Agent

Task `local-smb-daily-outreach`, Mo-Fr 10:03 lokal, läuft adaptiv durch Phasen 0-5 (Discovery → Pre-Check → DM-Gen → Sheet-Update → Performance-Log).

- **Kein Auto-Send.** Senden bleibt manuell auf Şafak-Trigger.
- **Kein Push.** Daily-Summary als Markdown-File in `sessions/local-smb-daily-{DATUM}.md`.
- **Pausieren/Editieren:** https://claude.ai/code/routines
