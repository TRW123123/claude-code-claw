# Internal Linker — profilfoto-ki.de

**Zweck:** Identifiziert Link-Chancen pro Seite und schlägt 3-5 konkrete interne Links mit Platzierung, Anchor-Text und User-Journey-Mapping vor.

**Wann aktivieren:** Bei neuen Seiten, bei Content-Updates, bei Orphan-Detection, bei Cannibalisierungs-Fixes, im Weekly Agent als Link-Equity-Rebalancing.

## Input

- **Target Page Path** (die Seite die Links bekommen soll)
- **Page Content** (aktueller HTML-Text)
- **Site Graph** (alle existierenden Seiten + ihre Cluster)
- **GSC-Daten** der Target Page (Position, Impressions, Keywords)

## Link-Chancen-Typen

### Typ 1: Incoming Link (Target bekommt neue Links)
**Wann:** Target-Seite ist Orphan, oder soll in Rankings gepusht werden, oder ist neuer Spoke der in Hub integriert werden muss.

**Workflow:**
1. Identifiziere 3-5 bestehende Seiten im gleichen Cluster oder semantisch verwandt
2. Für jede Quelle: Finde einen natürlichen Satz wo das Target-Keyword erwähnt werden kann
3. Schlage Anchor-Text = Target-Keyword vor
4. Schlage genaue Platzierung vor (Sektion, Absatz)

### Typ 2: Outgoing Link (Target verlinkt auf andere)
**Wann:** Target ist neu, soll in Hub & Spoke integriert werden, hat aktuell < 2 interne Links.

**Workflow:**
1. Identifiziere den Hub des Target-Clusters aus `internal-links-map.md`
2. Identifiziere 2-3 verwandte Spokes
3. Falls Target = Ratgeber: mindestens 1 Link auf Money Page (Bewerbungsfoto-Hub oder LinkedIn-Hub)
4. Schlage natürliche Satz-Platzierung vor

### Typ 3: Cross-Cluster-Link
**Wann:** Weekly Rebalancing, wenn zwei Cluster zu isoliert sind.

**Workflow:**
1. Identifiziere schwächere Cluster-Bridges
2. Suche thematische Brücken-Sätze (z.B. "Das gleiche gilt übrigens auch für dein LinkedIn-Profil")
3. Anchor-Text = Ziel-Keyword des verlinkten Clusters

### Typ 4: Link Equity Boost
**Wann:** Striking-Distance-Keyword (Pos 8-20) soll gepusht werden.

**Workflow:**
1. Identifiziere Top-Seiten der Domain (höchste Impressions) die thematisch passen
2. Füge 1-2 neue Links von diesen Top-Seiten zur Striking-Distance-Seite hinzu
3. Effekt: Link Equity fließt auf schwächere Seite

## Anchor-Text-Regeln (Hard Rule)

| Gut | Schlecht |
|---|---|
| "KI Bewerbungsfoto erstellen" (= Target-Keyword) | "hier klicken" |
| "Tipps für coole Profilbilder" (= Topic) | "mehr erfahren" |
| "LinkedIn-Profilbild mit KI" (= variant des Targets) | "diesen Artikel" |
| "unser Ratgeber zu Profilbildern" (= beschreibend) | "Klick mich!" |

**Regel:** Anchor-Text soll entweder = Primary Keyword der Ziel-Seite sein ODER eine natürliche Variante, die den Inhalt der Ziel-Seite beschreibt.

**Anti-Pattern:** Dasselbe Anchor-Text 5x auf einer Seite → Penalty-Risiko. Immer variieren.

## Platzierungs-Regeln

### Priorität nach Ort auf der Seite (Google gewichtet so)
1. **Erster Content-Absatz** (höchste Gewichtung)
2. **Mittlere Content-Sektion**
3. **FAQ-Sektion**
4. **Schluss-Absatz / CTA-Block**
5. **Footer-Link** (niedrigste Gewichtung, aber gut als Safety Net für Orphans)

### Hard Rules
- **Max 8 interne Links pro Seite** (Content-Bereich, ohne Nav/Footer)
- **Mindestens 1 Link pro 300 Wörter** (sonst zu link-arm)
- **Keine 2 Links mit gleichem Anchor in gleichem Absatz**
- **Trailing Slash PFLICHT** in allen Link-URLs

## Workflow

### 1. Site Graph laden
```sql
-- Alle Seiten pro Cluster aus Topic-File + Analyse
SELECT DISTINCT page FROM gsc_history WHERE domain = 'profilfoto-ki.de';
```

### 2. Cluster-Mapping
Für jede Seite: Zu welchem Cluster gehört sie? (aus `target-keywords.md`)

### 3. Orphan-Check
```sql
-- Welche Seiten haben < 3 eingehende interne Links?
-- Da wir keine Link-Graph-Table haben: HTML parsen, Occurrence zählen
```

### 4. Link-Chancen identifizieren
Für die Target-Seite:
- Typ 1: Welche Seiten sollten auf Target verlinken?
- Typ 2: Welche Seiten sollte Target verlinken?
- Typ 3: Cross-Cluster-Brücken sinnvoll?
- Typ 4: Ist Target in Striking Distance (Pos 8-20)?

### 5. Satz-Platzierung vorschlagen
Für jeden Link-Vorschlag:
- Quell-Seite
- Ziel-Seite
- Anchor-Text (= Ziel-Keyword oder natürliche Variante)
- Platzierung (Sektion, Absatz)
- Kontext-Satz (so wie der Link natürlich in Text eingewoben wird)

### 6. Prioritize
Jeder Vorschlag bekommt Priority 1-3:
- **P1:** Muss passieren (Orphan, neue Seite ohne Links, Money-Link fehlt)
- **P2:** Sollte passieren (Link Equity, Cluster-Integration)
- **P3:** Nice-to-have (Cross-Cluster-Brücke)

## Output

```markdown
## Internal Linker Report — /ratgeber/coole-profilbilder/

**Cluster:** 4 (Ratgeber / Top-of-Funnel)
**Current State:** Position 8.4, 1233 Impr, 2 internal incoming links (aus Footer + /ratgeber/profilbild/)
**Goal:** Link Equity boosten, Money-Link fehlt

### Vorschläge

#### P1 — Outgoing: Money-Link fehlt
- **Von:** /ratgeber/coole-profilbilder/
- **Auf:** /linkedin-profilfoto-ki/
- **Anchor:** "KI-Profilbild für LinkedIn erstellen"
- **Platzierung:** FAQ-Sektion, Antwort zu "Kann ich das auch für LinkedIn nutzen?"
- **Kontext-Satz:** "Ja — viele unserer Nutzer verwenden die Bilder zusätzlich für ihr LinkedIn-Profilbild."

#### P1 — Incoming: Von Hub
- **Von:** /ratgeber/profilbild/ (Hub 2)
- **Auf:** /ratgeber/coole-profilbilder/
- **Anchor:** "coole Profilbild-Ideen"
- **Platzierung:** Sektion "Ideen & Beispiele", zweiter Absatz
- **Status:** Check ob bereits vorhanden

#### P2 — Incoming: Von /bewerbungsfoto-ki/
- **Von:** /bewerbungsfoto-ki/
- **Auf:** /ratgeber/coole-profilbilder/
- **Anchor:** "Tipps für coole Profilbilder"
- **Platzierung:** "Weiterführend"-Block am Ende
- **Begründung:** Link Equity Transfer von starker Money Page zum Ratgeber

#### P2 — Incoming: Cross-Cluster von Social
- **Von:** /linkedin-profilfoto-ki/
- **Auf:** /ratgeber/coole-profilbilder/
- **Anchor:** "was ein cooles Profilbild ausmacht"
- **Platzierung:** Tips-Sektion, Absatz 3
- **Kontext-Satz:** "Wer mehr darüber erfahren will, was ein cooles Profilbild ausmacht, findet Ideen im Ratgeber."

#### P3 — Outgoing: Cross-Cluster zu Bewerbung
- **Von:** /ratgeber/coole-profilbilder/
- **Auf:** /bewerbungsfoto-ki/
- **Anchor:** "seriöses Bewerbungsfoto mit KI"
- **Platzierung:** Schluss-Absatz
- **Begründung:** Commercial-Bridge für ältere User-Gruppe

### Stats
- Aktuelle interne Links auf Seite: 2 incoming, 1 outgoing
- Nach Umsetzung: 4 incoming, 2 outgoing
- Link Equity Change: +2 von Top-Seiten (Hub 2, Bewerbungsfoto Hub)

### Deploy-Checklist
- [ ] Alle Links mit Trailing Slash
- [ ] Anchor-Texte abweichend (keine Duplikate)
- [ ] Humanity Editor über Kontext-Sätze laufen lassen (Score ≥ 75)
- [ ] Changelog-Einträge pro Änderung (change_type = 'internal_link')
```

## Hard Rules

1. **Kein Link ohne Trailing Slash**
2. **Kein Link ohne Kontext-Satz** (nicht einfach Anchor in Text einschieben)
3. **Kein Anchor = "hier" oder "klicken"**
4. **Max 8 Content-Links pro Seite**
5. **Humanity Editor über alle neu geschriebenen Kontext-Sätze**
6. **Changelog pro Link-Änderung** (change_type = 'internal_link')
