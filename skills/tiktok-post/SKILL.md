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

**Auth-Server (einmalig pro User):**
- `C:/Users/User/Projects/profilfoto-ki-static/tiktok-auth-server.mjs` (veraltet — nutzt localhost, funktioniert nicht mehr)
- Stattdessen: Auth-URL manuell aufrufen, Code aus Callback-Seite holen, per `tiktok-post.mjs auth <code>` tauschen

**Post-Script:**
- `C:/Users/User/Projects/profilfoto-ki-static/tiktok-post.mjs` — enthält auth/post/status. Nutzt aktuell noch den falschen Endpoint für `video.upload` Scope, muss für Inbox-Upload inline gepatcht werden (siehe unten).

**Token-Datei:**
- `C:/Users/User/Projects/profilfoto-ki-static/.tiktok-token.json`

**Telegram:**
- Credentials in `C:/Users/User/Projects/AI UGC/remotion-app/.env` (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)

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
cd "C:/Users/User/Projects/profilfoto-ki-static" && node -e "
const fs = require('fs');
const path = 'PFAD/ZUM/REEL.mp4';
const t = JSON.parse(fs.readFileSync('.tiktok-token.json','utf-8'));
const size = fs.statSync(path).size;
const initBody = { source_info: { source: 'FILE_UPLOAD', video_size: size, chunk_size: size, total_chunk_count: 1 } };
fetch('https://open.tiktokapis.com/v2/post/publish/inbox/video/init/', {
  method:'POST',
  headers:{'Authorization':'Bearer '+t.access_token,'Content-Type':'application/json; charset=UTF-8'},
  body: JSON.stringify(initBody)
}).then(r=>r.json()).then(d=>{
  if (!d.data?.upload_url) { console.error(d); process.exit(1); }
  const buf = fs.readFileSync(path);
  return fetch(d.data.upload_url, {
    method:'PUT',
    headers:{'Content-Type':'video/mp4','Content-Length':size.toString(),'Content-Range':'bytes 0-'+(size-1)+'/'+size},
    body: buf
  }).then(()=>console.log('UPLOAD OK publish_id='+d.data.publish_id));
});
"

# 2. Caption via Telegram — NUR copy-paste-ready Text
# WICHTIG: curl hat UTF-8-Probleme mit Sonderzeichen (em-dash, ß, Umlaute je nach Shell).
# IMMER über Node.js + JSON-POST senden. Caption in Temp-Datei schreiben, dann:
node -e "
const env = require('fs').readFileSync('C:/Users/User/Projects/AI UGC/remotion-app/.env','utf-8');
const get = k => env.match(new RegExp('^'+k+'=(.*)','m'))[1].trim();
const text = require('fs').readFileSync('C:/Users/User/AppData/Local/Temp/tg-caption.txt','utf-8');
fetch('https://api.telegram.org/bot'+get('TELEGRAM_BOT_TOKEN')+'/sendMessage', {
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body: JSON.stringify({chat_id: get('TELEGRAM_CHAT_ID'), text})
}).then(r=>r.json()).then(d=>console.log(d.ok ? 'OK '+d.result.message_id : JSON.stringify(d)));
"
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
