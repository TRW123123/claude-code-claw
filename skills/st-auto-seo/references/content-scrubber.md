# Content Scrubber — Watermark + Em-Dash Cleanup

> Adaptiert von github.com/TheCraigHewitt/seomachine `data_sources/modules/content_scrubber.py`
>
> **Pflicht: Vor jedem Content-Output (Title, Meta, Content) ausfuehren.**

---

## Teil 1: Unsichtbare Unicode Watermarks (KI-Detector-Killer)

LLMs setzen unsichtbare Unicode-Zeichen ein die KI-Detektoren erkennen. Diese MUESSEN entfernt werden.

### Watermark-Liste (exakt)

```
U+200B Zero-Width Space
U+FEFF Byte Order Mark (BOM)
U+200C Zero-Width Non-Joiner
U+2060 Word Joiner
U+00AD Soft Hyphen
U+202F Narrow No-Break Space
```

Plus ALLE Unicode-Zeichen der Kategorie **Cf** (Format Characters).

### Python Implementation (zur Referenz)

```python
import unicodedata

WATERMARK_CHARS = [
 '\u200B', # Zero-width space
 '\uFEFF', # BOM
 '\u200C', # Zero-width non-joiner
 '\u2060', # Word joiner
 '\u00AD', # Soft hyphen
 '\u202F', # Narrow no-break space
]

def scrub_watermarks(text: str) -> str:
 # Entferne explizite Watermark-Zeichen
 for char in WATERMARK_CHARS:
 text = text.replace(char, '')
 # Entferne alle Cf-Kategorie-Zeichen (Format Characters)
 text = ''.join(c for c in text if unicodedata.category(c) != 'Cf')
 return text
```

### Manuelle Pruefung in Markdown/HTML

Wenn das Python-Script nicht laeuft: Im Editor "Show Invisibles" einschalten und die obigen Zeichen suchen + ersetzen.

---

## Teil 2: Em-Dash Replacement (kontextsensitiv)

**Em-Dash (—) ist die Nummer 1 KI-Erkennung.** Maximal 1 pro Seite, fuer st-auto: **0 erlaubt**.

### Replacement-Regeln (50-Zeichen Window vor/nach)

1. **Em-Dash zwischen zwei unabhaengigen Saetzen** (zweiter Teil beginnt mit Großbuchstabe)
 → Ersetzen mit `. ` (Punkt + Leerzeichen + Großbuchstabe)

2. **Em-Dash bei Attribution / Erlaeuterung** (zweiter Teil ist Erklaerung)
 → Ersetzen mit `, ` (Komma)

3. **Em-Dash vor "however", "therefore", "moreover", "jedoch", "allerdings"**
 → Ersetzen mit `; ` (Semikolon)

4. **Em-Dash bei abrupter Pause / Einschub**
 → Ersetzen mit `(` und `)` (Klammer-Paar)
 → ODER `, ` (Komma) wenn Einschub eindeutig

5. **Em-Dash am Satz-Ende**
 → Komplett entfernen

### Beispiele

| Original (mit Em-Dash) | Korrigiert |
|---|---|
| Die Beratung dauert 6 Wochen — danach folgt die Umsetzung. | Die Beratung dauert 6 Wochen. Danach folgt die Umsetzung. |
| BAFA-Foerderung — bis zu 80% Zuschuss — fuer KMU. | BAFA-Foerderung (bis zu 80% Zuschuss) fuer KMU. |
| Wir analysieren Ihre Prozesse — jedoch nur die kritischen. | Wir analysieren Ihre Prozesse; jedoch nur die kritischen. |
| Das Programm laeuft 2026 aus — ein Update folgt. | Das Programm laeuft 2026 aus. Ein Update folgt. |

### Was NICHT als Em-Dash gilt

- En-Dash (–) bei Datums-/Zahlenbereichen ist OK: "2026–2027", "Seite 12–15"
- Hyphen (-) in zusammengesetzten Wörtern ist OK: "BAFA-Foerderung"

---

## Teil 3: Weitere Cleanup-Schritte

### Zero-Width-Joiner Sequences in Emojis

Entferne Joiner aus Emoji-Sequenzen wenn nicht explizit gewuenscht:
```
\u200D Zero-width joiner
```

### Mehrfache Leerzeichen
- Doppelte/dreifache Leerzeichen → einfaches Leerzeichen
- Tabs am Zeilenanfang in Markdown beibehalten (Listen-Einrueckung)

### Smart Quotes
Optional: Smart Quotes ("" '') koennen KI-Erkennung triggern. Bei B2B Beratungs-Content auf normale `"` ASCII-Quotes umstellen.

### Bullet-Symbole
- Statt `•` (U+2022) → `-` oder `*` in Markdown
- Statt `·` (U+00B7) → `-`

---

## Teil 4: Idempotenz

Der Scrubber muss **idempotent** sein — mehrfaches Ausfuehren darf das Ergebnis nicht aendern (außer beim ersten Lauf).

Test:
```
result_1 = scrub(text)
result_2 = scrub(result_1)
assert result_1 == result_2
```

---

## Teil 5: Anwendung im st-auto Workflow

### Stage 1 (neue Seiten)
1. Content-Datei schreiben
2. Scrubber laufen lassen (Watermarks + Em-Dash)
3. Quality Gate (`quality-gates.md`) ausfuehren
4. Wenn Em-Dash > 0 → Score humanity = 0 → revise

### Stage 2 (CTR-Fixes)
1. Neuen Title + Meta generieren
2. Scrubber direkt im JSON Output-Block ausfuehren
3. Wenn Title oder Meta einen Em-Dash enthalten → automatisch ersetzen
4. Erst dann in Frontmatter schreiben + changelog

### Stage 0b (Directory Submissions)
1. Beschreibungs-Texte vor Submission durch Scrubber
2. Insbesondere bei Auto-Crawl-Verzeichnissen (wie Cylex) — die crawlen die Website-Texte und uebernehmen evtl. Watermarks

---

## Teil 6: Quality-Check-Query (SQL fuer Supabase)

Pruefen ob Changelog-Eintraege fuer st-auto Em-Dashes enthalten:

```sql
SELECT
 id,
 page_path,
 change_type,
 new_value,
 array_length(string_to_array(new_value, '—'), 1) - 1 AS em_dash_count
FROM claw.changelog
WHERE domain = 'st-automatisierung.de'
 AND new_value LIKE '%—%'
ORDER BY em_dash_count DESC;
```

Wenn diese Query Treffer liefert → Content wurde nicht durch den Scrubber gelaufen → manueller Cleanup noetig.

---

## Teil 7: Vor jedem git push

**Pflicht:** Bei JEDER Aenderung an `.astro` oder `.html` Dateien fuer st-auto:

1. Geaenderten File-Inhalt durch Scrubber
2. Em-Dash Count pruefen (muss 0 sein)
3. Watermark-Cleanup
4. Erst dann commit/push

Wenn der Scrubber etwas geaendert hat → der Commit-Message Suffix `[scrub]` anhaengen.
