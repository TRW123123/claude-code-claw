# SKILL: CLAW Memory
> Hippocampus-Style Memory System — basiert auf OpenClaw Skills v3.8.6
> Supabase pgvector + Gemini Embedding 001 + pg_cron Decay

## INFRASTRUKTUR

- **Supabase Projekt:** NanoBanana (`<SUPABASE_PROJECT_ID>`)
- **Schema:** `claw`
- **Tabellen:** `claw.memories_user` (permanent) | `claw.memories_session` (temporär)
- **Embedding:** Google `gemini-embedding-001` (768 Dims via outputDimensionality, Free Tier: 1.000 req/Tag)
- **Dedup:** Jaccard Similarity > 0.6 (exakt wie OpenClaw)
- **Decay:** `importance * (0.99 ^ days)` täglich 3 Uhr via pg_cron
- **Hybrid Search:** 70% Vector (cosine) + 30% Keyword (pg_trgm)

## PINECONE REGEL (KRITISCH)
- ✅ Pinecone LESEN erlaubt
- ❌ Pinecone SCHREIBEN verboten — nur Safak Tepecik manuell

---

## SIGNAL TYPES & IMPORTANCE SCORES

| signal_type | Score | Wann |
|-------------|-------|------|
| `explicit-remember` | 0.92 | Safak Tepecik sagt "speicher das / remember" |
| `deadline-critical` | 0.90 | Deadline + Dringlichkeit |
| `emotional` | 0.85 | Persönliche Aussagen, Präferenzen mit Emotion |
| `relationship` | 0.82 | Feedback zur Zusammenarbeit |
| `preference` | 0.80 | "ich bevorzuge", "ich will immer" |
| `decision` | 0.75 | "wir haben entschieden", "let's do" |
| `substantial-input` | 0.70 | Langer wichtiger Input (>200 Zeichen) |
| `project-context` | 0.65 | "wir arbeiten an", "aktuelles Projekt" |
| `general` | 0.55 | Alles andere |
| — | < 0.5 | Wird verworfen |

**Skip-Patterns (niemals speichern):** ok, yes, no, thanks, sure, heartbeat, no_reply, < 30 Zeichen

---

## WANN MEMORY SCHREIBEN

**Automatisch (user-scope):**
- Neue Korrektur oder Hard Rule von Safak Tepecik → `corrections` / `hard-rules`
- Entscheidung getroffen → `decision` signal_type
- Explizit: "speicher das", "remember this" → `explicit-remember`
- Workflow abgeschlossen → `workflows`

**Automatisch (session-scope):**
- Langer Multi-Step Task → Stand festhalten
- Session beendet → `DELETE FROM claw.memories_session WHERE session_id = '[id]'`

**NICHT speichern:**
- Normale Fragen & Antworten
- Dinge bereits in MASTER.md / SOUL.md
- Ephemere Task-Details ohne Dauerwert

---

## EMBEDDING GENERIEREN (Google API)

```javascript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent

// Body
{
  "model": "models/gemini-embedding-001",
  "content": { "parts": [{ "text": "text hier" }] },
  "taskType": "RETRIEVAL_DOCUMENT",  // beim Schreiben
  "outputDimensionality": 768        // PFLICHT — Modell gibt sonst 3072 zurück
  // "taskType": "RETRIEVAL_QUERY"   // beim Suchen
}

// Response → 768 floats
{ "embedding": { "values": [0.123, -0.456, ...] } }
```

---

## MEMORY SCHREIBEN — Smart Upsert (Hippocampus)

```sql
-- Automatisch: Jaccard-Check → reinforce ODER insert
SELECT claw.upsert_memory(
    p_content     => 'Tailwind v3 — kein Upgrade auf v4',
    p_embedding   => '[768-dim vector]'::vector,
    p_namespace   => 'hard-rules',
    p_source      => 'user-correction',
    p_signal_type => 'preference'
);

-- Response bei neuem Eintrag:
-- { "action": "inserted", "id": "...", "importance": 0.80 }

-- Response bei Duplikat:
-- { "action": "reinforced", "id": "...", "old_importance": 0.80, "new_importance": 0.88 }
```

## MEMORY SUCHEN

```sql
SELECT * FROM claw.search_memories(
    '[query-embedding]'::vector,
    '[query-text]',
    match_namespace => 'hard-rules',  -- optional
    match_count     => 5,
    scope           => 'user'         -- 'user' | 'session' | 'both'
);

-- Nach Abfrage: touch_memory aufrufen damit last_accessed aktuell bleibt
SELECT claw.touch_memory('[uuid]');
```

---

## DECAY (läuft automatisch)

```
Täglich 3:00 Uhr via pg_cron:
  importance = importance * (0.99 ^ days_since_accessed)
  archived = TRUE wenn importance < 0.2

Reinforcement Formel:
  new = old + (1 - old) * 0.1
  Beispiel: 0.65 → 0.715 → 0.764 → 0.807 ...
```

---

## NAMESPACES (user-scope)

| Namespace | Inhalt |
|-----------|--------|
| `hard-rules` | Hard Rules die CLAW gelernt hat |
| `workflows` | Abgeschlossene Workflows + Lösungen |
| `technical` | Tech-spezifische Learnings |
| `sales` | Sales/Outreach Learnings |
| `corrections` | Korrekturen von Safak Tepecik |
| `general` | Default |

## AUTO-LEARNING LOOP — Correction Detection

CLAW erkennt Korrekturen automatisch. Signale:

| Signal | Beispiel | Aktion |
|--------|---------|--------|
| Explizite Ablehnung | "nein", "falsch", "nicht so" | correction speichern |
| Frustration | "das ist nicht was ich meinte", "hör auf" | correction + preference |
| Explizites Lernen | "speicher das", "remember", "merke dir" | explicit-remember |
| Entscheidung | "wir machen X", "let's go with", "entschieden" | decision speichern |
| Wiederholte Korrektur | gleiche Korrektur 2x+ | signal_type auf hard-rules hochsetzen |

**Abstraktions-Regel:**
Niemals das rohe Gespräch speichern — immer das destillierte Prinzip.
```
Raw:  "nein nicht so, der Button soll dunkler"
✅    "CTAs bevorzugt dunkel — [scope: project:zahnarzt-mueller]"
```

**Repetition → Hard Rule:**
```
1x Korrektur → corrections (0.75)
2x gleich    → preference (0.80)
3x gleich    → hard-rules (0.92) — nie mehr durch Decay gelöscht
```

---

## SESSION-ID FORMAT

```
claw-[datum]-[kurzbeschreibung]
Beispiel: claw-2026-03-23-supabase-setup
```
