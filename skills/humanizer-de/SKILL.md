---
name: humanizer-de
description: >
 MANDATORY Pre-Publish Quality Gate. Activate BEFORE any text is generated or
 finalized that other humans will see externally — LinkedIn posts and comments,
 LinkedIn DMs, X/Twitter posts and replies, Instagram captions and DMs, TikTok
 captions and DMs, cold emails, blog articles, SEO pages (pSEO), UGC video
 scripts and voiceovers, landing page copy, product descriptions, newsletter
 drafts, thumbnail text, UI microcopy that ships to production. Scores text
 0-100 across five dimensions (blacklist words, sentence rhythm, AI
 punctuation, concreteness, passive voice) and enforces platform-specific
 thresholds. Handles German (primary) and English. Does NOT trigger for:
 internal code comments, technical documentation, terminal output, debug logs,
 chat responses to the user, commit messages, or any internal tooling text.
 Trigger keywords: post, caption, DM, email, article, copy, script, thread,
 tweet, reply, draft publish.
---

# Humanizer-DE — Pre-Publish Quality Gate

> **Framing:** Dieser Skill ist **kein "AI Humanizer" und kein "Detector Bypass Tool"**. Er ist ein Qualitäts-Gate, das prüft ob Text **Substanz, Voice und Spezifität** hat — Eigenschaften, die AI-Slop fehlen und die Menschen erkennen. Detektor-Scores werden bewusst NICHT gemessen (Arms Race verliert langfristig).
>
> **Evidenz-Basis:** [~/wiki/topics/humanizer-anti-ai-writing/wiki/synthesis-2026-04-21.md](file:///~/wiki/topics/humanizer-anti-ai-writing/wiki/synthesis-2026-04-21.md)

---

## Wann aktivieren (Pflicht)

**IMMER wenn Claude Text produziert, den Externe sehen werden:**
- Social Content: LinkedIn, X/Twitter, Instagram, TikTok — Posts, Captions, Comments, Replies, DMs
- Blog-Artikel und SEO-Seiten (pSEO, Ratgeber)
- Cold Emails und Email-Sequenzen (Outreach)
- UGC-Video-Scripts, Voiceover-Text, Caption-Overlays
- Landing-Page-Copy, Hero-Headlines, Produktbeschreibungen
- Newsletter, Ankündigungen
- Thumbnail-Text, Ad-Copy, Microcopy die in Production geht

**NIEMALS aktivieren für:**
- Chat-Antworten an den User (dieser Skill-Trigger gilt nicht für die Claude-Interaktion selbst)
- Code-Kommentare, technische Dokumentation, README-Internals
- Terminal-Output, Debug-Logs, Fehlermeldungen
- Commit-Messages, internes Tooling
- Wiki-Einträge nur für den User
- Akademisches Schreiben (eigene Disclosure-Regeln)

**Wichtiger Hinweis:** Auch wenn ein anderer Skill (z.B. `linkedin-content`, `outreach`) den Text generiert, **muss** dieser Skill vor Publikation durchlaufen. Der aufrufende Skill delegiert nicht — der Humanizer-Gate ist Pflicht-Zwischenschritt.

---

## 3-Pass-Workflow

### Pass 1: Deterministischer Check (kein LLM)
```bash
node scripts/check.mjs --text "<INPUT>" --profile <linkedin|x|dm|coldmail|blog|seo-page|ugc-script|short-caption|headline|ui-microcopy>
```

Output: JSON mit Score 0-100, Dimensions-Breakdown, Flags mit Positionen, Platform-Pass-Status.

**Warum deterministisch:** Regex, Wort-Zählung, Satz-Std-Dev, Passiv-Pattern-Match — keine LLM-Verschwendung für mechanische Arbeit (Hard Rule: eigene Fähigkeiten vor Delegation).

### Pass 2: Targeted LLM-Rewrite (nur flagged sections)
Wenn Score < Profil-Threshold:
- Claude liest `prompts/rewrite-flagged.md`
- Erhält nur die markierten Stellen + Kontext-Fenster + Alternativen aus `plain-german-alternatives.md`
- Schreibt Ersetzungen, **nicht** Gesamttext-Rewrite

### Pass 3: Re-Check
`check.mjs` erneut. Wenn Pass → publish-ready. Wenn Fail → Loop (max 3x). Nach 3 Fails: manuell prüfen, nicht autonom posten.

---

## 5-Dimensionen-Scoring

Details: siehe [score-rubric.md](score-rubric.md)

| # | Dimension | Punkte | Kern-Check |
|---|---|---|---|
| 1 | Blacklist-Wort-Freiheit | 0-20 | DE + EN + Translationese-Hits zählen |
| 2 | Satz-Rhythmus | 0-20 | Std-Dev Satzlänge ≥ 6 Wörter |
| 3 | Interpunktion & Formatierung | 0-20 | Em-Dash-Rate, Bulleted Lists, KI-Opener/Closer |
| 4 | Konkretheit (Anti-Hollowness) | 0-20 | Eigennamen + Zahlen + Daten + Orte pro 150 Wörter |
| 5 | Passiv-Quote | 0-20 | < 10% Passiv-Sätze |

**Dimension 4 ist die wichtigste** — Narayanan-Hollowness-These + Claude-Research "Abstraktion vs. Spezifität" konvergieren darauf. Ein Text der diese Dimension verkackt, wird auch mit perfekter Blacklist-Hygiene als AI erkannt.

---

## Plattform-Profile

Siehe [data/platform-profiles.json](data/platform-profiles.json).

| Profil | Min-Score | Max Em-Dash / 500w | Min Entities / 150w | Max Words |
|---|---|---|---|---|
| `linkedin` | 80 | 1 | 3 | – |
| `x` | 75 | 2 | 2 | 280 |
| `dm` | 70 | 0 | 1 | 100 |
| `coldmail` | 85 | 0 | 2 | 150 |
| `blog` | 80 | 2 | 4 | – |
| `seo-page` | 82 | 1 | 4 | – |
| `ugc-script` | 75 | 0 | 2 | – |
| `short-caption` | 70 | 1 | 1 | 200 |
| `headline` | 75 | 0 | 0 | 12 |
| `ui-microcopy` | 70 | 0 | 0 | 8 |

---

## Datenquellen

- [data/blacklist-de.json](data/blacklist-de.json) — DE Blacklist (Verben, Adjektive, Floskeln, Opener, Closer)
- [data/blacklist-en.json](data/blacklist-en.json) — EN Kobak-Liste (delve, leverage, etc.)
- [data/translationese-en-de.json](data/translationese-en-de.json) — EN→DE Calque-Patterns
- [data/platform-profiles.json](data/platform-profiles.json) — Thresholds pro Plattform
- [references/anti-ai-writing-de.md](references/anti-ai-writing-de.md) — Vollständige Referenz DE
- [references/plain-german-alternatives.md](references/plain-german-alternatives.md) — Wort-Ersetzungs-Liste
- [references/ki-deutsch-markers.md](references/ki-deutsch-markers.md) — DE-spezifische AI-Fingerprints (Claude-Research-Destillat)

---

## Aufruf-Pattern für andere Skills

Andere Skills müssen **nicht** geändert werden. Dieser Skill aktiviert sich automatisch über Description-Matching wenn Outward-Facing-Content geschrieben wird. Redundant dazu: globaler Publish-Gate-Hinweis in `~/.claude/CLAUDE.md`.

Manuelle Invocation (falls nötig):
```
Bitte humanizer-de gate mit Profil <x> über diesen Text laufen lassen:
<TEXT>
```

---

## Was NICHT in v0.1

- Detector-Testing (bewusst — Arms Race)
- EN-Profil separat (aktuell EN über kombinierte Blacklist, eigener EN-Layer v0.2)
- TR-Layer (v0.3 für yapayzekapratik.com)
- Fine-tuning / RAG-over-own-posts
- Automatische Blacklist-Updates (statisch in v0.1)

---

## Failure-Modes und Rollback

**Wenn Gate zu strikt:** `data/platform-profiles.json` editieren, `min_score` senken. Kein Code-Change nötig.

**Wenn Gate durchrutscht bei echtem AI-Slop:** Blacklist erweitern in `data/blacklist-de.json`, Flag als Issue in [~/wiki/topics/humanizer-anti-ai-writing/inbox/](file:///~/wiki/topics/humanizer-anti-ai-writing/inbox/).

**Wenn Gate nicht auto-triggert:** Manueller Aufruf (siehe oben) oder CLAUDE.md-Reminder prüfen.
