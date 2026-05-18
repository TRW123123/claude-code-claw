# AEO + GEO Patterns — Antwort-/Generative-Engine Optimierung

> Adaptiert von github.com/TheCraigHewitt/seomachine `seo-audit/references/aeo-geo-patterns.md`
> Diese Datei MUSS gelesen werden bevor neue pSEO-Seiten oder Content-Updates fuer st-automatisierung.de erstellt werden.
>
> **Warum:** Google AI Overviews, Perplexity, ChatGPT Search und Bing Copilot zitieren Content basierend auf strukturierten, klar abgrenzbaren Antwort-Bloecken. Wer diese Bloecke nicht hat, wird nicht zitiert — egal wie gut der Long-Form-Content ist.

---

## Teil 1: Answer Engine Optimization (AEO)

### Definition Block

Ein klar abgrenzbarer Definitions-Block direkt nach der H1, der die Frage "Was ist X?" in 1-2 Saetzen beantwortet.

```markdown
## Was ist [Begriff]?

[Begriff] ist [eine 1-Satz-Definition mit dem Hauptkeyword]. Dabei [zweiter Satz mit konkretem Detail oder Beispiel].
```

**Beispiel st-auto:**
```markdown
## Was ist BAFA-Foerderung fuer KI-Beratung?

Die BAFA-Foerderung "Unternehmerisches Know-how" uebernimmt bis zu 80% der Beratungskosten fuer KI-Strategie und Prozessautomatisierung im Mittelstand. Foerderfaehig sind kleine und mittlere Unternehmen mit Sitz in Deutschland, die einen zugelassenen Berater wie ST-Strategieberatung beauftragen.
```

### Step-by-Step Block

Nummerierte Liste mit konkreten, durchfuehrbaren Schritten. **Ideal fuer "Wie mache ich X?" Queries.**

```markdown
## Wie [Aktion durchfuehren]?

1. **[Schritt 1 Headline]** — [1-2 Saetze konkrete Anleitung]
2. **[Schritt 2 Headline]** — [1-2 Saetze konkrete Anleitung]
3. **[Schritt 3 Headline]** — [1-2 Saetze konkrete Anleitung]
```

**Beispiel:**
```markdown
## Wie beantragen Sie BAFA-Foerderung fuer KI-Beratung?

1. **Beratungsbedarf definieren** — Halten Sie fest, welches Problem die KI-Beratung loesen soll (z.B. Prozessautomatisierung, Datenstrategie).
2. **Zugelassenen Berater finden** — Pruefen Sie die offizielle BAFA-Beraterliste oder beauftragen Sie einen autorisierten Berater wie ST-Strategieberatung.
3. **Antrag online stellen** — Reichen Sie den Antrag vor Beratungsbeginn ueber das BAFA-Portal ein. Bewilligung erfolgt typisch in 4-8 Wochen.
4. **Beratung durchfuehren** — Nach Bewilligung startet die geforderte Beratung mit Berichtspflicht.
5. **Verwendungsnachweis einreichen** — Nach Abschluss reichen Sie Nachweise ein, die Foerderung wird als Zuschuss ausgezahlt.
```

### Comparison Table Block

Tabellenform fuer "X vs Y" Queries. Wird oft direkt in AI Overviews uebernommen.

```markdown
## [X] vs [Y] — Vergleich

| Kriterium | [X] | [Y] |
|---|---|---|
| [Kriterium 1] | [Wert X] | [Wert Y] |
| [Kriterium 2] | [Wert X] | [Wert Y] |
| [Kriterium 3] | [Wert X] | [Wert Y] |
```

### Pros/Cons Block

Klare Vorteile/Nachteile-Liste fuer Entscheidungs-Queries.

```markdown
## Vor- und Nachteile von [X]

### Vorteile
- [Vorteil 1 mit kurzer Begruendung]
- [Vorteil 2 mit kurzer Begruendung]
- [Vorteil 3 mit kurzer Begruendung]

### Nachteile
- [Nachteil 1 mit kurzer Begruendung]
- [Nachteil 2 mit kurzer Begruendung]
```

### FAQ Block (kritisch fuer st-auto Quality Gate)

```markdown
## Haeufige Fragen

### [Frage 1]?
[1-3 Saetze direkte Antwort]

### [Frage 2]?
[1-3 Saetze direkte Antwort]

### [Frage 3]?
[1-3 Saetze direkte Antwort]
```

**Pflicht fuer st-auto:** Mindestens 5 FAQs pro Seite + JSON-LD `FAQPage` Schema.

### Listicle Block

```markdown
## [N] [Substantive] fuer [Zielgruppe/Zweck]

1. **[Item 1]** — [Beschreibung 1-2 Saetze]
2. **[Item 2]** — [Beschreibung 1-2 Saetze]
...
```

---

## Teil 2: Generative Engine Optimization (GEO)

### Statistik-Zitations-Block

LLMs zitieren bevorzugt **konkrete Zahlen mit Quelle**. Inkludiere mindestens 3 davon pro Artikel.

```markdown
[Spezifische Zahl] Prozent der [Subjekt] [Verb], laut [Quelle, Jahr].
```

**Beispiel:**
```markdown
Bis zu 80 Prozent der Beratungskosten werden uebernommen, laut BAFA-Richtlinie 2026.

Mehr als 60 Prozent der mittelstaendischen Unternehmen in Deutschland sehen KI als wichtig fuer ihre Wettbewerbsfaehigkeit, laut Bitkom-Studie 2025.
```

### Expert Quote Block

```markdown
> "[Konkrete Aussage zum Thema]"
> — [Name], [Titel], [Organisation]
```

Auch ohne externes Zitat: Eigene Expertise als "Aussage des Beraters" markieren.

### Authoritative Claim Block

Behauptungen mit Begruendung, klar formatiert.

```markdown
**[Behauptung in einem Satz].** [Begruendung in 1-2 Saetzen mit Beleg/Logik].
```

**Beispiel:**
```markdown
**Die BAFA-Foerderung fuer Unternehmerisches Know-how laeuft 2026 in der aktuellen Form aus.** Die Bundesregierung hat angekuendigt, das Programm ab 2027 zu reformieren — wer noch unter den aktuellen Konditionen profitieren will, sollte den Antrag bis Mitte 2026 stellen.
```

### Self-Contained Answer Block

Ein in sich vollstaendiger Absatz, der eine Frage komplett beantwortet — ohne Vorwissen.

```markdown
[Frage als Aussage formuliert]: [Vollstaendige Antwort in 2-4 Saetzen, die alle noetigen Begriffe definiert und keine externen Verweise braucht].
```

### Evidence Sandwich Block

Behauptung → Beleg → Implikation. LLMs lieben dieses Muster.

```markdown
**Behauptung:** [Klare Aussage]
**Beleg:** [Statistik, Studie, Beispiel mit Quelle]
**Implikation:** [Was bedeutet das fuer den Leser]
```

---

## Teil 3: B2B Beratungs-Spezifika fuer st-automatisierung.de

### Trust-Signale die in jeden Artikel gehoeren

- **BAFA-Zulassung erwaehnen** (wenn relevant) — wirkt als Authority-Signal
- **Konkrete Foerdersummen** statt "bis zu" Floskeln
- **Branchen-Beispiele** statt generischer KMU-Floskeln
- **NRW/Schwerte/Standort** (Local SEO Signal)
- **Berater-Name + LinkedIn** als Author-Bio

### Schema Markup (Pflicht)

Jede neue pSEO-Seite muss mindestens diese JSON-LD Bloecke haben:

1. **Service** Schema (was wird angeboten)
2. **FAQPage** Schema (mit allen FAQs der Seite)
3. **BreadcrumbList** Schema
4. **LocalBusiness** Schema (auf Homepage und Contact-Seite)
5. **Person** Schema fuer Author (Safak)

### Voice Search Optimierung

Voice Queries sind Frage-orientiert und konversationell. Inkludiere:
- "Wie viel kostet eine BAFA-gefoerderte KI-Beratung?"
- "Wer darf BAFA-Beratung in NRW anbieten?"
- "Was muss ich vor der KI-Einfuehrung beachten?"
- "Wie lange dauert eine BAFA-Antragstellung?"

Diese Fragen sollten als H2/H3 in der Seite auftauchen mit direkten Antworten.

---

## Teil 4: Cluster-spezifische Anwendung

### BAFA Cluster
- AEO Pflicht: Step-by-Step Block (Antragstellung), FAQ Block, Statistik-Block (Foerdersummen)
- GEO Pflicht: Authoritative Claim ueber Programmreform 2027

### AI Act Cluster
- AEO Pflicht: Definition Block (was ist AI Act), Pros/Cons Block (Compliance-Aufwand), Step-by-Step (Risikoklassen pruefen)
- GEO Pflicht: Statistik-Block (Strafrahmen), Self-Contained Answer (Wer ist betroffen)

### KI-Beratung Cluster
- AEO Pflicht: Comparison Table (Inhouse vs Beratung), Step-by-Step (Beratungsablauf)
- GEO Pflicht: Expert Quote, Evidence Sandwich (Mittelstand-Studie)

### Strategieberatung Cluster
- AEO Pflicht: Definition Block, Listicle Block ("5 Fragen die Sie sich stellen sollten")
- GEO Pflicht: Statistik-Block (Mittelstand-Marktdaten)

### Schulung Cluster
- AEO Pflicht: Listicle Block (Kursinhalte), Pros/Cons (verschiedene Formate)
- GEO Pflicht: Expert Quote (Trainer-Background)

---

## Anwendung

Vor jedem `/article` oder `/write` Run:
1. **Cluster identifizieren** → Pflicht-Bloecke aus Teil 4 nachschlagen
2. **Pflicht-Bloecke einbauen** in den Artikel-Plan
3. **Quality Gate** vor Publish: Sind alle Pflicht-Bloecke vorhanden?

Wenn ein Pflicht-Block fehlt → Artikel zurueck in `review-required/`.
