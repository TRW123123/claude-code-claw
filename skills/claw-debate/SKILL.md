---
name: claw-debate
description: Multi-Agent Red Team Debate Loop fuer CLAW. Equivalent zum Antigravity prograde-planetary Autoresearch-System. Nutzen wenn ein Thema durch 3 Agenten (Visionaer, Red Team, Synthese) gruendlich erforscht werden soll. Output ist ein validiertes Regelwerk als Markdown + JSON. Trigger-Woerter: "debate", "autoresearch", "red team", "analyse gruendlich", "3-agenten-loop".
allowed-tools: [Read, Write, WebSearch, Bash]
---

# CLAW Debate Loop — Multi-Agent Autoresearch Protocol

Equivalent zu: `C:\Users\User\.gemini\antigravity\playground\prograde-planetary\run_fundamental_pseo.py`
CLAW-Version: Laeuft vollstaendig in Claude Code, kein externes Python/Gemini noetig.

---

## Aktivierung

Wenn der User sagt:
- "starte debate loop ueber [Thema]"
- "autoresearch [Thema]"
- "analysiere [Thema] mit red team"
- "fuehre debate durch"

→ Diesen Skill aktivieren und Protocol ausfuehren.

---

## Das Protocol (3 Runden × 3 Agenten)

### Setup
1. **Thema** vom User entgegennehmen
2. **Output-Verzeichnis** anlegen: `C:\Users\User\Claude\debates\[thema-slug]\`
3. **3 Runden** durchfuehren, jede Runde mit allen 3 Agenten

---

### Agent 1: Der Visionaer
**Rolle:** Radikale, mutige Thesen. Kein Consensus-Denken.
**Auftrag:**
- Was ist die BESTE moegliche Loesung fuer [Thema] in 2026?
- Welche Architekturen, Strategien oder Taktiken haben Marktfuehrer genutzt?
- Denke 2-3 Jahre voraus. Ignore Konventionen.
- Nutze WebSearch fuer Live-Benchmarks und aktuelle Innovationen.

**WebSearch-Queries (Beispiele):**
- `[Thema] best architecture 2026 site:github.com OR site:hnsearch.com`
- `[Thema] case study success enterprise`
- `[Thema] future trends expert opinion`

**Output-Format:**
```
## Visionaer — Runde [N]
### These: [Hauptthese in 1 Satz]
### Begruendung: [3-5 Argumente mit Quellen]
### Empfohlene Architektur: [Konkrete Massnahmen]
```

---

### Agent 2: Das Red Team
**Rolle:** Zerstoerer. Findet Schwachstellen, Case Studies des Scheiterns.
**Auftrag:**
- Warum ist die These des Visionaers FALSCH oder naiv?
- Welche realen Faelle zeigen, dass dieser Ansatz scheitert?
- Welche Algorithmus-Updates, Marktveraenderungen oder technischen Grenzen machen die These ungueltig?
- Nutze WebSearch fuer Gegenbeweise: Abstrafen, Failures, Kritik.

**WebSearch-Queries (Beispiele):**
- `[Thema] [Visionaers-Ansatz] failure penalty case study`
- `[Thema] problems pitfalls 2024 2025`
- `[Visionaers-Kernkonzept] why it fails`

**Output-Format:**
```
## Red Team — Runde [N]
### Angriff auf: [Visionaers These]
### Beweis 1: [Konkreter Fall/Studie]
### Beweis 2: [Konkreter Fall/Studie]
### Fazit: [Warum die These nicht haltbar ist]
```

---

### Agent 3: Der Wahrheitsfinder (Synthese)
**Rolle:** Unparteiischer Judge. Destilliert die Wahrheit aus dem Konflikt.
**Auftrag:**
- Was vom Visionaer UEBERLEBT den Red-Team-Angriff?
- Was muss verworfen werden?
- Welche praezisen, kugelsicheren Regeln entstehen aus dieser Debatte?
- Nutze WebSearch um Grenzfaelle zu klaeren.

**Output-Format:**
```
## Synthese — Runde [N]
### Was bleibt: [Verifizierte Kernaussagen]
### Was faellt weg: [Widerlegte Thesen]
### Neue Regel [N]: [Prazise, umsetzbare Architektur-Regel]
```

---

## Ablauf (Schritt fuer Schritt)

```
RUNDE 1:
  1. Visionaer → These entwickeln (WebSearch nutzen)
  2. Red Team → These angreifen (WebSearch nutzen)
  3. Synthese → Erste Regeln destillieren

RUNDE 2:
  4. Visionaer → These verfeinern oder verteidigen
  5. Red Team → Neue Angriffspunkte finden
  6. Synthese → Regeln haerten

RUNDE 3:
  7. Visionaer → Finale Position
  8. Red Team → Letzter Angriff
  9. Synthese → FINALES REGELWERK

JUDGE (nach Runde 3):
  10. Alle Synthesen zusammenfassen
  11. Master-Ruleset als Markdown schreiben
  12. JSON-Verdict ausgeben
```

---

## Output-Dateien (werden automatisch gespeichert)

```
C:\Users\User\Claude\debates\[thema-slug]\
├── debate_transcript.md      ← Vollstaendiges Transkript aller Runden
├── master_ruleset.md         ← Finales Regelwerk (menschenlesbar)
└── architecture_rules.json   ← Maschinenlesbare Regeln fuer Build-Prozesse
```

---

## JSON-Verdict Format (analog zu Antigravity)

```json
{
  "status": "APPROVED | REJECTED",
  "score": 1-10,
  "topic": "[Thema]",
  "date": "[ISO-Datum]",
  "core_strategy": "...",
  "hard_rules": ["Regel 1", "Regel 2", "..."],
  "toxic_anti_patterns": ["Anti-Pattern 1", "..."],
  "open_questions": ["Was noch unklar ist"],
  "final_verdict": "..."
}
```

Score < 8 = "REJECTED" → Debate wiederholen mit neuem Fokus.
Score >= 8 = "APPROVED" → Regeln in relevantes SKILL.md integrieren.

---

## Qualitaets-Standards

- Jeder Agent MUSS mindestens 2 WebSearch-Queries pro Runde ausfuehren
- Keine Meinungen ohne Belege (URL oder Daten)
- Kein Consensus-Bias: Red Team MUSS aktiv Gegenbeweise suchen
- Synthese DARF nicht beiden Seiten recht geben — sie muss entscheiden
- Finale Regeln muessen umsetzbar sein ("DO X" oder "DON'T Y"), keine Theorie

---

## Integration mit CLAW Memory

Nach Abschluss einer Debate:
```bash
node C:/Users/User/Claude/scripts/claw-flush.mjs \
  "[Thema]: [Kern-Erkenntnis]" \
  "explicit-remember" \
  "autoresearch-logs" \
  "claw-debate" \
  "global"
```

Wichtige Erkenntnisse landen automatisch im Supabase Memory.
