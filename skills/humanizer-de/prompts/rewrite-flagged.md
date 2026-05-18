# Pass 2 — Targeted Rewrite Prompt

> **Aufruf:** Nach `check.mjs`-Fail. Nur für flagged sections, nicht Gesamttext-Rewrite.

---

## Input

Du bekommst:
1. **Original-Text** (kompletter Absatz/Post für Kontext)
2. **Flags-Array** aus `check.mjs` — jede Flag mit Typ, Position, Match-String
3. **Platform-Profil** (z.B. `linkedin`, `coldmail`) mit Voice-Definition
4. **Alternativen-Liste** aus `references/plain-german-alternatives.md`
5. **Translationese-Map** aus `data/translationese-en-de.json`

---

## Aufgabe

Behebe die Flags mit minimalen Änderungen. Prioritätsreihenfolge:

### Priorität 1: Hollowness (wenn Dim 4 < 14)
Fehlende Konkretheit — aber **NICHT** neue Fakten erfinden.

Erlaubt:
- Kürzen des Texts (weniger Wörter → relativ mehr Entitäten-Dichte)
- Einfügung von Entitäten die im Kontext bereits vorhanden sind (z.B. aus CLAUDE.md-Projektkontext, Handle-Namen, Zahlen aus vorherigen Abschnitten)

Nicht erlaubt:
- Erfinden von Firmennamen, Zahlen, Zitaten, Daten
- Halluzinieren von Quellen

Wenn im Kontext nicht genug Entitäten vorhanden: **Flag zurückgeben mit Notiz "needs human input — no concrete entities available"**.

### Priorität 2: Blacklist-Hits (Dim 1)
Für jedes Blacklist-Wort:
1. In `plain-german-alternatives.md` nachsehen
2. Passende Alternative wählen (Kontext-sensitiv)
3. Ersetzen

Beispiele:
- "demonstrieren" → "zeigen"
- "implementieren" → "einbauen"
- "nahtlos" → weglassen oder "reibungslos"
- "Herausforderungen navigieren" → "Herausforderungen meistern" (Translationese-Fix)

### Priorität 3: Em-Dashes (Dim 3)
Kontextsensitiv ersetzen:
- Attribution/Erläuterung → Komma
- Zwischen unabhängigen Sätzen → Punkt (+ Großbuchstabe)
- Abrupte Pause → Klammer oder Punkt
- Vor "jedoch", "deshalb", "außerdem" → Semikolon

### Priorität 4: Rhythmus (Dim 2)
Wenn Std-Dev < 4:
- Einen der mittellangen Sätze in zwei kurze teilen
- ODER zwei kurze zu einem längeren verschmelzen
- Ziel: mindestens 1 Satz <10 Wörter und 1 Satz >20 Wörter pro 150 Wörter

### Priorität 5: Passiv→Aktiv (Dim 5)
"Das System wird optimiert" → "Wir optimieren das System" (wenn Subjekt klar)
Wenn Subjekt nicht bekannt: Passiv behalten, nicht raten.

---

## Voice-Guidance pro Profil

| Profil | Ton | Erlaubte Stilmittel |
|---|---|---|
| `linkedin` | professional-confident | Ich-Form, konkrete Cases, Zahlen |
| `x` | direct-punchy | Short sentences, one punchline, no hedges |
| `dm` | casual-personal | Lockerer Ton, Name-Drop, Profil-Referenz |
| `coldmail` | direct-plain | Grade 5-6 Level, <150 Wörter, kein Smalltalk |
| `blog` | authoritative-specific | Quellen, Listen OK, Experten-Ton |
| `seo-page` | expert-concrete | H2-Varianz, Fakten-Dichte, FAQ am Ende |
| `ugc-script` | spoken-conversational | Wie gesprochen, kurze Sätze |
| `short-caption` | hook-driven | Erste Zeile = Hook |
| `headline` | sharp-specific | max 12 Wörter, kein Passiv |
| `ui-microcopy` | imperative-brief | Aktionsverb zuerst |

---

## Output-Format

```json
{
 "rewritten_text": "...",
 "changes": [
 { "type": "blacklist", "original": "nahtlos", "replaced_with": "reibungslos", "position": 142 },
 { "type": "em-dash", "original": "— der Punkt", "replaced_with": ". Der Punkt", "position": 287 },
 { "type": "translationese", "original": "Potenzial entfesseln", "replaced_with": "ermöglichen", "position": 401 }
 ],
 "unresolved_flags": [
 { "type": "hollowness", "note": "needs human input — no concrete entities available in context" }
 ],
 "ready_for_recheck": true
}
```

`ready_for_recheck: true` → Pass 3 ausführen.
`ready_for_recheck: false` → an menschliche Review eskalieren.

---

## Harte Regeln für den Rewrite

1. **Keine neuen Blacklist-Wörter einführen** (sonst Loop)
2. **Keine erfundenen Fakten** — wenn Entität fehlt und Kontext keine hergibt, Flag unresolved lassen
3. **Voice des Profils einhalten** — coldmail bleibt Grade 5, LinkedIn bleibt professional
4. **Keine Länge aufblähen** — Kürzen ist fast immer besser als Verlängern
5. **Keine Rule-of-Three hinzufügen** beim Umschreiben
6. **Original-Semantik bewahren** — die Aussage soll dieselbe bleiben, nur der Ausdruck wechselt
