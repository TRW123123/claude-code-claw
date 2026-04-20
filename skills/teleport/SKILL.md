---
name: teleport
description: Manueller Session-Handoff-Trigger. Schreibt strukturierte Zusammenfassung des aktuellen Chat-Stands nach sessions/teleport-*.md UND last-handoff.md, damit die nächste Session nahtlos weitermachen kann. Nutzen bei "teleport", "handoff", "session übergeben", "/teleport", oder wenn Context nahe 80%+ ist.
---

# SKILL: Teleport — Manueller Session-Handoff

> **Zweck:** Auto-Handoff via Stop-Hook (claw-session-processor) läuft erst *nach* Session-Ende. Dieser Skill triggert **mitten in der Session** einen sauberen Handoff, bevor der Context voll wird.

---

## WANN NUTZEN

- User sagt "teleport", "handoff", "übergib die Session", "/teleport"
- User sagt "neue Session starten, aber Stand merken"
- Proaktiv: Wenn dieser Skill läuft und Context > 80% geschätzt → Empfehlung einen Teleport zu machen
- Vor riskanten Operationen (deploy, migration) als Safety-Snapshot

---

## WORKFLOW

### 1. Kontext sammeln

Aus der aktuellen Conversation extrahieren:

- **Aktive Domain(s)** — welches Projekt wurde bearbeitet? (ki-automatisieren, profilfoto-ki, st-automatisierung, open-claw, etc.)
- **Scope** — ein-Satz-Beschreibung der Session-Aufgabe
- **Was wurde gemacht** — faktische Liste (Dateien, Migrations, Commits, Deploys)
- **Entscheidungen** — Hard Rules, Architektur-Wahlen, Abgelehntes
- **Offene Items** — explizite TODOs, ungefixte Bugs, wartende User-Entscheidungen
- **Blocker** — was hindert Fortschritt?
- **Context-Size-Schätzung** — grob: "niedrig/mittel/hoch", geschätzt aus Anzahl Tool-Calls + Messages

### 2. Kurztitel generieren

Max 40 Zeichen, kebab-case, domain-scoped:
- `open-claw-gap-closure`
- `profilfoto-pseo-fix`
- `st-auto-gsc-review`

### 3. Files schreiben

**Primary:** `C:/Users/User/Claude/sessions/teleport-<YYYY-MM-DD>-<kurztitel>.md`

**Mirror:** `C:/Users/User/Claude/sessions/last-handoff.md` (überschreibt auto-Version)

**Template:**

```markdown
# Teleport Handoff — <Kurztitel>
> Erstellt: <ISO-timestamp>
> Typ: Manueller Teleport (nicht via Stop-Hook)
> Context-Size-Estimate: <niedrig|mittel|hoch>

## Scope
<1-2 Sätze was diese Session machen sollte>

## Aktive Domain(s)
- <domain-1>
- <domain-2>

## Was wurde gemacht
- <faktisch, mit Pfaden / IDs>
- ...

## Entscheidungen
- <Hard Rule X>
- ...

## Offene Punkte
- [ ] <TODO-1>
- [ ] <TODO-2>

## Blocker
<was hindert Fortschritt, oder "keine">

## Nächste Session — Einstieg
<Exakte erste 1-3 Schritte für Nachfolge-Session. Konkret, nicht vage.>

## Referenzen
- Topic-Datei: `C:/Users/User/Claude/topics/<relevant>.md`
- Relevante Skills: <Liste>
- Agent-Log: `C:/Users/User/Claude/sessions/agent-log-<datum>.md`
```

### 4. User informieren

Exakt ausgeben (keine Prosa drum herum):

```
Teleport gespeichert:
- C:/Users/User/Claude/sessions/teleport-<datum>-<titel>.md
- C:/Users/User/Claude/sessions/last-handoff.md (mirror)

Neue Session starten → SessionStart-Hook lädt last-handoff.md automatisch.
```

---

## HARD RULES

- **Niemals** in Topic-Dateien schreiben — die macht der Session-Processor am Ende
- **Niemals** nach Pinecone schreiben — nur lokales File
- **Niemals** Inhalte aus früheren Sessions einmischen — nur aktueller Chat
- Falls Context-Estimate **hoch** ist: zusätzlich warnen "Session besser jetzt beenden statt weiter — Risiko dass wichtige Details vergessen werden"

---

## INTEGRATION MIT AUTO-HANDOFF

Der Stop-Hook (`claw-session-processor.mjs → writeHandoff()`) schreibt automatisch `last-handoff.md` beim Session-Ende. Dieser Skill ist der **manuelle Überschreib-Trigger** — nützlich wenn:
- Auto-Handoff hatte weniger Kontext (Session beendet durch Crash)
- Mid-Session Snapshot gewollt ist
- Extra-Metadaten (Blocker, Context-Size) rein sollen, die der Auto-Handoff nicht erfasst

Bei Konflikt: manueller Teleport > Auto-Handoff (letzter Schreiber gewinnt, und manuelles Commit ist präziser).

---

## ANTI-PATTERNS

- ❌ Teleport ohne konkrete "Nächste Session — Einstieg"-Zeile → unbrauchbar
- ❌ Vage Formulierungen ("wir haben an SEO gearbeitet") statt Fakten ("3 Pages in st-automatisierung.de/aios/ optimiert, Commit abc123")
- ❌ Offene Punkte die schon erledigt wurden rein schreiben
