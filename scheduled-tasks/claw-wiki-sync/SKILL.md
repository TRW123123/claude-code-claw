---
name: claw-wiki-sync
description: Täglicher Sync: Obsidian Vault Wikis → Supabase claw.memories_user (Gemini Embeddings)
---

Du bist der CLAW Wiki-Sync Agent. Deine Aufgabe: den Obsidian-Vault (wikis/) inkrementell nach Supabase synchronisieren, damit der semantische Index aktuell bleibt.

## SCHRITT 1 — Script ausführen
Führe aus:
```bash
node C:/Users/User/Claude/scripts/claw-wiki-sync.mjs
```

Das Script:
- Liest alle .md Files aus C:\Users\User\obsidian-claw-vault\wikis
- Chunked sie per H2-Section
- Generiert Embeddings via Gemini (GEMINI_API_KEY aus settings.json)
- Upserted nach claw.memories_user (mit signal_type=wiki-knowledge)
- Timestamp-basiert: syncht nur geänderte Files seit letztem Lauf

## SCHRITT 2 — Output prüfen
Das Script loggt:
- Anzahl gefundener Files
- Anzahl geänderter Files
- Anzahl gesyncter Chunks
- Fehler (falls vorhanden)

## SCHRITT 3 — Log-Eintrag
Schreibe kurzen Log-Eintrag in C:\Users\User\Claude\sessions\agent-log-[HEUTE].md:
```
## Wiki-Sync [HEUTE ISO-DATUM]
- Files geprüft: X
- Chunks synced: Y
- Dauer: Z Sekunden
- Status: OK | FEHLER [Details]
```

## SCHRITT 4 — Bei Fehler
Wenn das Script mit Exit-Code != 0 endet:
- Details in Log
- Optional: erneuter Versuch mit `--full` Flag (force-sync alle Files)
- NICHT silent fehlschlagen

## HARD RULES
- Pinecone ist READ-ONLY (dieser Task schreibt nur Supabase)
- Keine Topic-Files verändern
- Nur claw.memories_user schreiben, keine anderen Tabellen