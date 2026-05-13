# Internal Links Map — profilfoto-ki.de

## Hub & Spoke Architektur (live)

### Hub 1: /bewerbungsfoto-ki/
**Rolle:** Main Money Page für Bewerbungsfoto-Cluster. Commercial Intent.

**Spokes (Ratgeber-Satelliten, linken ALLE zurück auf Hub):**
- `/ratgeber/bewerbungsfoto-kosten/`
- `/ratgeber/ki-bewerbungsfoto-test/`
- `/ratgeber/bewerbungsfoto-selber-machen/` (falls existiert)
- `/ratgeber/bewerbungsfoto-kleidung/` (falls existiert)
- `/ratgeber/bewerbungsfoto-hintergrund/` (falls existiert)

**Link-Muster:**
- Jeder Spoke linkt 2x auf den Hub (einmal im Text, einmal im Schluss-CTA)
- Anchor-Text: "Bewerbungsfoto mit KI erstellen" oder "KI-Bewerbungsfoto"

### Hub 2: /ratgeber/profilbild/
**Rolle:** Informations-Hub für Profilbild-allgemein (Top-of-Funnel).

**Spokes:**
- `/ratgeber/coole-profilbilder/` ← #1 CTR-Baustelle (Pos 8.4, 1233 Impr, 0.16%)
- `/ratgeber/profilbild-sprueche/` (falls existiert)
- `/ratgeber/profilbild-ideen/` (falls existiert)

**Money-Link:** Jeder Spoke linkt auf `/linkedin-profilfoto-ki/` oder `/bewerbungsfoto-ki/` als Conversion-Ziel.

### Hub 3 (implizit): /linkedin-profilfoto-ki/
**Rolle:** Zweite Money Page. Erweitert um Content-Module (Größe/Format, Tipps, FAQ).

**Incoming Links von:**
- Home
- /ratgeber/profilbild/ (Hub 2)
- Alle Ratgeber-Spokes (als Money-CTA)

## Linking-Regeln (Hard Rules)

1. **Jeder Ratgeber linkt auf mindestens 1 Money Page** (`/bewerbungsfoto-ki/` oder `/linkedin-profilfoto-ki/`)
2. **Jede Money Page linkt auf 3-5 thematisch verwandte Ratgeber** (Authority-Verteilung)
3. **Kein Link-Overload:** max 8 interne Links pro Seite
4. **Anchor-Text = Ziel-Keyword der verlinkten Seite** (nicht "hier klicken")
5. **Trailing Slash PFLICHT** auf allen internen Links und Canonicals
6. **Orphan-Vermeidung:** Keine Seite darf 0 eingehende interne Links haben (Homepage-Footer als Notanker)

## Cross-Cluster Verlinkung

| Von | Auf | Wann |
|---|---|---|
| Bewerbungsfoto-Cluster | LinkedIn-Cluster | "Auch für LinkedIn nutzbar" |
| LinkedIn-Cluster | Bewerbungsfoto-Cluster | "Auch für Bewerbungen geeignet" |
| Ratgeber profilbild | Money Pages | Conversion-CTA im Schluss |
| Branchen-Seiten (Arzt, Anwalt etc.) | Bewerbungsfoto-Hub | "Für alle Berufsgruppen" |
| Coole-profilbilder Ratgeber | LinkedIn-Cluster | Karriere-Anker im Schluss |

## Branchenseiten (Orphan-Risiko hoch)

Diese Seiten existieren, sind aber oft schwach verlinkt:
- `/arzt-profilbild/`
- `/anwalt-profilbild/`
- `/coach-profilbild/`
- `/lehrer-profilbild/`
- (und weitere Berufe)

**Pflicht-Eingangs-Links:**
- Homepage-Footer (bereits umgesetzt, 18 Orphans gefangen)
- Relevante Ratgeber-Artikel (Kontext-Match)
- Bewerbungsfoto-Hub (als "für deine Branche" Block)

## Footer-Navigation (Safety Net)

Homepage-Footer enthält Link-Liste aller 18+ Branchen-/Orphan-Seiten — aktuell der Hauptanker für sonst unverlinkte Seiten.

**Regel:** Neue Seiten immer gleichzeitig im Footer verlinken.

## Social-Media-Seiten

- `/linkedin-profilfoto-ki/` (Hub 3)
- `/facebook-profilbild/` (Indexierungs-Problem: "Gefunden - zurzeit nicht indexiert")
- `/instagram-profilbild/` (falls existiert)
- `/dating-profilbild/` (falls existiert)

Diese linken alle zurück auf `/ratgeber/profilbild/` als Hub 2.

## Link-Chancen die der Agent automatisch identifizieren soll

1. **Neuer Ratgeber erscheint** → automatisch auf passenden Hub verlinken
2. **Hub-Page fehlt Link auf neuen Spoke** → Hub updaten
3. **Branchenseite hat < 3 eingehende Links** → Query: welche Ratgeber passen thematisch?
4. **Neue Striking-Distance-Keywords auf Pos 8-20** → von bestehenden Top-Seiten verlinken (Link Equity Boost)
