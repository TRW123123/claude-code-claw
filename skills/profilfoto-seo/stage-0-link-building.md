# Stage 0b: Authority Building (Link Building / Directory Submissions)

## Status: INAKTIV

Diese Stage ist fuer profilfoto-ki.de **noch nicht aktiv**. Aktivierung erfordert:

## Aktivierungs-Kriterien

1. **NAP-Audit durchfuehren** — Pruefen welche Verzeichnisse die dahinterstehende Firma bereits kennen (ohne aktiven Link)
2. **Login-Liste vom User einholen** — Welche Verzeichnis-Accounts existieren bereits? (Google Business Profile, Gelbe Seiten, etc.)
3. **NAP-Daten konsolidieren** — Firmenname, Adresse, Telefon, Website, Beschreibung
4. **Branchen-Relevanz pruefen** — Welche Verzeichnisse machen fuer ein **B2C KI-Tool** ueberhaupt Sinn?
5. **Initial Queue befuellen** in `claw.link_building_queue`

## Warum noch nicht aktiv

- Profilfoto-KI ist ein **digitales B2C-Produkt**, kein lokales Geschaeft. Klassische Branchenbuecher (Gelbe Seiten, Cylex, 11880) bringen wenig.
- Relevant waeren stattdessen: **Tool-Verzeichnisse** (Product Hunt, Futurepedia, There's An AI For That, Future Tools, AI Scout), **Software-Listings** (Capterra, G2, Trustpilot), **DACH-spezifische KI-Listings**.
- Diese Listings haben andere Submission-Prozesse als klassische NAP-Verzeichnisse → eigenes Pattern noetig.

## Wenn aktiviert: Empfohlene Reihenfolge fuer profilfoto-ki

### Tier 1: AI Tool Directories (kostenlos, hoher DA)
1. **There's An AI For That** (theresanaiforthat.com) — Submission Form
2. **Futurepedia** (futurepedia.io) — Submission Form
3. **Future Tools** (futuretools.io) — Submission Form
4. **AI Scout** (aiscout.net) — Submission Form
5. **AI Tools Directory** (aitoolsdirectory.com)

### Tier 2: Product Listings
6. **Product Hunt** — Launch (einmalig, hoher Initial-Traffic)
7. **Capterra** — Software-Verzeichnis (Account noetig)
8. **G2** — Software-Reviews (Account noetig)
9. **Trustpilot** — Reviews-Plattform (Account noetig)

### Tier 3: DACH-Spezifisch
10. **DACH AI Directory** (falls existent — recherchieren)
11. **Heise Software-Verzeichnis** — heise.de/download
12. **Chip.de Software-Liste**

### Tier 4: Klassisch (geringer Mehrwert fuer digitales Produkt)
13. Google Business Profile (nur wenn Firma physisch erreichbar)
14. Gelbe Seiten / 11880 / Cylex (Skip wenn rein online)

## Manueller Hand-Off Prozess

Wenn Stage 0b aktiviert wird:
1. Agent erstellt Submission-Plan und stellt in `claw.link_building_queue`
2. Agent oeffnet Submission-Form via Anweisung an Safak (KEIN Browser-Automation)
3. Safak fuellt aus, bestaetigt Captcha, sendet
4. Agent updated `claw.link_building_queue.status` auf `submitted` mit `submitted_at`
5. Nach 1-4 Wochen: Stage 0a prueft GSC/Ahrefs ob Link sichtbar

## Schema (gemeinsam mit anderen Domains)

```sql
INSERT INTO claw.link_building_queue (
  domain, directory_name, directory_url, category, status, nap_data
) VALUES (
  'profilfoto-ki.de',
  'There''s An AI For That',
  'https://theresanaiforthat.com/submit',
  'ai-directory',
  'pending',
  '{"name": "Profilfoto KI", "url": "https://www.profilfoto-ki.de", "description": "...", "category": "AI Photo Generator"}'::jsonb
);
```

## Hard Rules

1. **Keine Browser-Automation** — alle Submissions sind manuelle Hand-Offs
2. **Kein Account-Erstellen autonom** — User macht das
3. **Captchas = Hand-Off** — Agent uebergibt sofort an User
4. **NAP-Daten konsistent** — Gleicher Firmenname, gleiche URL, gleiche Beschreibung ueberall
5. **Keine Spam-Verzeichnisse** — nur Tier 1-3, Tier 4 nur wenn relevant
