# SKILL: Telegram Gateway
> CLAW's Messaging-Kanal — Telegram → Claude Code → Telegram
> Läuft lokal, Laptop muss an sein

## INFRASTRUKTUR

- **Bot:** grammY (Node.js) — `C:\Users\User\Claude\telegram\`
- **History:** Supabase `claw.conversations` (letzte 20 Messages als Kontext)
- **Security:** Nur TELEGRAM_AUTHORIZED_ID kann interagieren
- **Claude-Aufruf:** `claude -p "..."` (non-interactive mode)

## STARTEN

```bash
cd C:\Users\User\Claude\telegram
npm install       # einmalig
npm start         # Bot läuft, wartet auf Nachrichten
```

## WAS DER BOT KANN

| Input | Verarbeitung |
|-------|-------------|
| Text | direkt an Claude |
| Foto | URL + Caption an Claude (Vision) |
| Dokument | URL + Filename an Claude |
| Voice Note | Transkription via Claude → dann verarbeiten |
| /clear | Chat-History löschen |

## CONVERSATION HISTORY

Letzte 20 Nachrichten werden als Kontext injiziert:
```
Safak Tepecik: erste Nachricht
CLAW: erste Antwort
Safak Tepecik: zweite Nachricht
...
Safak Tepecik: [aktuelle Nachricht]
```

## STARTUP-POLLER

grammY long polling holt automatisch alle ungelesenen Nachrichten
beim Start ab — keine extra Logik nötig.

## ENV VARS (in settings.json)

```
TELEGRAM_BOT_TOKEN      — von BotFather
TELEGRAM_AUTHORIZED_ID  — deine Telegram User-ID
SUPABASE_URL            — bereits gesetzt ✅
SUPABASE_ANON_KEY       — bereits gesetzt ✅
```

## TELEGRAM USER-ID HERAUSFINDEN

Schreib @userinfobot auf Telegram — gibt deine ID zurück.

## AGENTS.md STATUS

Phase 4 ✅ fertig
