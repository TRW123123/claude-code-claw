# KI-Deutsch Marker — Destillat aus Claude-Research

> **Quelle:** [~/wiki/topics/humanizer-anti-ai-writing/raw/claude-web-research-2026-04-21.md](file:///~/wiki/topics/humanizer-anti-ai-writing/raw/claude-web-research-2026-04-21.md)
> **Zusatz-Quellen:** Wortliga, Contentconsultants, KI-im-Marketing, eology

---

## Der sprachübergreifende Common Denominator

> "Abstraktion über Spezifität — AI beschreibt, Menschen bezeugen."

Das ist **der** wichtigste KI-Tell, unabhängig von Sprache. Ein DE-Text der 0 Blacklist-Wörter hat aber keine Eigennamen, Zahlen oder konkrete Szenen enthält, klingt trotzdem nach KI. Deshalb: Dimension 4 (Konkretheit) hat das höchste Gewicht.

---

## Die klassischen DE-Opener (alle flaggen)

**Zeitbezug:**
- "In der heutigen digitalen Welt"
- "In der heutigen schnelllebigen Zeit"
- "Im heutigen digitalen Zeitalter"
- "In einer Zeit von [X]"
- "In einer Welt, in der [X]"

**Landschaft / Reich:**
- "In der sich ständig wandelnden Landschaft"
- "In der sich rasant entwickelnden Welt"
- "Im Bereich der/des"
- "Im Reich der/des"

**Rhetorische Hinführung:**
- "Es ist wichtig anzumerken, dass"
- "Es sei erwähnt, dass"
- "Lassen Sie uns eintauchen"
- "Stellen Sie sich eine Welt vor, in der"

**Rule-of-Three-Opener:**
- "Ob Sie ein [X], [Y] oder [Z] sind"
- "Wenn es um [X], [Y] und [Z] geht"

---

## Die klassischen DE-Closer (alle flaggen)

**Zusammenfassung:**
- "Insgesamt"
- "Zusammenfassend"
- "Abschließend lässt sich sagen"
- "Um es zusammenzufassen"

**Finale:**
- "Letztendlich"
- "Letzten Endes"
- "Am Ende des Tages"
- "Im Endeffekt"
- "Alles in allem"

---

## Rhythmus und Satzbau (strukturell)

### Was auffällt
- **Gleichförmig mittellange Sätze** (15-22 Wörter) über ganzen Text
- **Gestapelte Gedankenstriche** (Em-Dash-Rate 10x über Mensch-Baseline)
- **Drei-Teil-Listen** als Rhythmus-Default
- **Nominalisierungen** statt Verb-Konstruktionen ("die Durchführung von" statt "machen")
- **Hedge-Stapel:** "könnte möglicherweise unter Umständen..."

### Was ein menschlicher DE-Text hat
- **Varianz:** 6-Wort-Sätze neben 30-Wort-Sätzen
- **Direkte Verben** statt Nominalisierungen
- **Konkrete Subjekte:** "Meyer-Werft hat..." statt "Das Unternehmen ist in der Lage..."
- **Weglassungen:** menschliche Autoren kürzen, KI füllt auf

---

## Promotional Register (Wikipedia-Vergleich: "Tourismus-Website")

**Alarmzeichen:**
- Superlative ohne Beleg ("die beste", "die ultimative", "einzigartig")
- Selbstaussagen statt Beweise ("Wir sind innovativ" statt "2024 haben wir X gelauncht")
- Wir-Form ohne konkrete Handlung
- Appeals ohne Daten ("Vertrauen Sie uns")

---

## DACH-spezifische Besonderheit (aus Grok-Research)

Aus der deutschen X-Community kommt ein zusätzlicher Marker, der **nicht** aus Wortlisten fällt aber von Lesern sofort erkannt wird:

> "Leere Phrasen, fehlende Richtung, keine Verantwortungsübernahme — das ist das KI-Tell der deutschen Bürokratiesprache."
> — Boeminghaus zur Bundesregierungs-Wachstumsstrategie

**Operational:** Wenn ein Text 200+ Wörter hat und kein einziges Subjekt eine **klare Handlung** zeigt (sondern nur Eigenschaften, Absichten, Möglichkeiten), Hollowness-Flag setzen.

---

## Translationese als DE-Spezifikum

Siehe [data/translationese-en-de.json](../data/translationese-en-de.json).

Claude/GPT denken teilweise in englischer Latent Language (Wendler et al. 2024) und projizieren in DE. Die häufigsten Calques:
- "Herausforderungen navigieren" (← navigate challenges)
- "Potenzial entfesseln" (← unlock potential)
- "nahtlose Erfahrung" (← seamless experience)
- "maßgeschneidert auf Ihre Bedürfnisse" (← tailored to your needs)

Diese fangen Wortlisten meist nicht, weil sie aus erlaubten Einzelwörtern bestehen. Deshalb hat `translationese-en-de.json` eigene Pattern-Einträge.

---

## Plattform-spezifische DACH-Beobachtungen

**LinkedIn DE:**
- "Disruption" + "Mehrwert" + "Stakeholder" in einem Post = sofort KI-Verdacht
- "Ich freue mich, [X] zu teilen" als Opener = generisch-KI
- Emoji-Headers (🚀 / ⚡️ / 💡) in Fließtext = Chat-UI-Import

**Cold Email DE:**
- "Ich hoffe, diese Nachricht erreicht Sie gut" = Todesstoß für Deliverability
- Anrede mit vollem Vor+Nachname = AI-Merge-Field-Verdacht
- Drei-Absatz-Struktur (Intro / Problem / CTA) in exakt gleicher Länge

**DE-Blog:**
- H2-Überschriften im Fragesatz ("Was ist [X]?") + sofortige Antwort im Copywriting-Stil
- FAQ-Block unten mit exakt 5 Fragen
- Listicles mit bold Lead-ins ("1. **Skalierbarkeit:** Das System ist...")

---

## Was NICHT als KI-Marker zählt (entgegen Populärmeinung)

- **"Sie" statt "Du":** manche behaupten Siezen ist KI-Tell. Falsch — B2B-Kontext nutzt Sie nativ.
- **Kommasetzung nach Duden:** richtig gesetzte Kommata sind kein Tell (Menschen schreiben auch korrekt).
- **Komplexe Sätze:** nur wenn sie gleichförmig sind. Ein einziger 40-Wort-Satz ist OK.
- **Fachbegriffe:** in technischer Doku kein Tell (Kontext erlaubt).
