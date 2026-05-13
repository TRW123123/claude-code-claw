---
name: tiktok-post
description: TikTok Content Posting Pipeline für profilfoto-ki. Sandbox-Upload via FILE_UPLOAD an Inbox plus Telegram-Caption-Nachricht. Nutzen wenn ein Reel auf TikTok gepostet werden soll.
allowed-tools: [Read, Write, Bash]
---

# TikTok Post Skill

## Zweck
Fertige Reels (MP4) landen in deiner TikTok-Mobile-App-Inbox. Parallel bekommst du auf Telegram den Caption-Text copy-paste-ready für die App.

## Hard Rules

1. **Sandbox-Endpoint:** `/v2/post/publish/inbox/video/init/` — NICHT `/video/init/` (das wäre Direct Post, braucht Scope `video.publish` und Production-Approval).
2. **Scope:** `video.upload,user.info.basic` — Scope `video.publish` funktioniert NUR in Production.
3. **Upload-Methode:** FILE_UPLOAD (chunked PUT an die upload_url). PULL_FROM_URL geht nur von verifizierten Domains (nicht Supabase, nicht S3, nicht andere CDNs).
4. **Redirect URI:** Nur HTTPS auf der verifizierten Domain (`https://www.profilfoto-ki.de/auth/tiktok/callback/`). Localhost wird vom TikTok Dev Portal abgelehnt.
5. **Token-Gültigkeit:** Access Token 24h, Refresh Token 365 Tage. Auth-Code NICHT nur 1 Minute — deutlich länger (getestet >30 Sek OK).
6. **Target-User:** Muss im Sandbox-Dev-Portal unter Sandbox-Settings eingetragen sein, sonst kommt kein Video in der Inbox an.
7. **Caption-Delivery via Telegram: NUR der copy-paste-ready Text. Keine Meta-Info, keine Präambeln, keine Trennlinien, keine Überschrift. Nur Caption + Hashtags.** User will direkt in TikTok einfügen ohne etwas wegkürzen zu müssen.
8. **Caption-Regeln:** Keine Anführungszeichen. Standard-Deutsch. Einfach, emotional, visuell. Hook in erster Zeile.

## Dateien und Scripts

**Upload-Script (PFLICHT — das nehmen):**
- `~/Projects/profilfoto-ki-static/tiktok-upload.mjs` — funktionierendes FILE_UPLOAD an Inbox-Endpoint. Refresht Token automatisch. **Das ist das Script für jeden Reel-Upload.**

**Auth-Helper (nur einmalig bei Token-Regeneration):**
- `~/Projects/profilfoto-ki-static/tiktok-post.mjs` — enthält Auth-Code-Tausch. NIEMALS für Upload nutzen (alter `video.publish` Endpoint).
- Auth-URL manuell aufrufen, Code aus Callback-Seite holen, dann `node tiktok-post.mjs auth <code>` zum Token-Tausch.

**Token-Datei:**
- `~/Projects/profilfoto-ki-static/.tiktok-token.json`

**Telegram:**
- Credentials in `~/Projects/AI UGC/remotion-app/.env` (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)

## Referenz-Werte

- **App-Name:** Claude
- **App-ID:** 7627098032631269384
- **Client Key (Sandbox):** `sbawppk33v21d354y7`
- **Redirect URI:** `https://www.profilfoto-ki.de/auth/tiktok/callback/`
- **Verifizierte Domain:** `profilfoto-ki.de`
- **TikTok-User:** profilfoto_ki (Open ID: `-0005MWwvTtgH2WqMB5d9ft9VywLQAG1KiPC`)

## Flow pro Reel (Copy-Paste-Block)

```bash
# 1. Upload via FILE_UPLOAD an Inbox
node "~/Projects/profilfoto-ki-static/tiktok-upload.mjs" "<video-path>" "<caption-text>"

# 2. Caption via Telegram (parallel — Şafak postet manuell in TikTok-App)
# Üblicher Pfad: tg_caption_0XX.mjs im remotion-app Ordner anlegen, basierend auf tg_caption_041.mjs
cd "~/Projects/AI UGC/remotion-app" && node tg_caption_0XX.mjs
```

## Caption-Schema

```
[Hook-Antwort in 1 Zeile, knackig]
[Body: 2-3 kurze Zeilen, rhythmisch]
[Optional: 1 Zeile Payoff / CTA]

#primary #secondary #niche #broad #fy #foryoupage
```

- **Maximal 5 Hashtags** (Hard Rule TikTok). Lieber 3-5 gezielte als viele breite.
- Keine Anführungszeichen
- Emojis sparsam (0-1 pro Zeile)
- Erste Zeile muss auch ohne Kontext funktionieren (Feed-Scroll-Stop)

## Was NICHT tun

- Niemals "Caption für ReelXXX:" oder ähnliche Meta-Info in die Telegram-Nachricht
- Niemals Publish-ID oder Status in die Caption-Message mischen (separate Message wenn nötig)
- Niemals PULL_FROM_URL ausprobieren mit Supabase-URL — kostet 10 Minuten Debugging
- Niemals Scope `video.publish` probieren ohne Production-Approval — scope_not_authorized
