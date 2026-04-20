---
name: preflight
description: Listet verfuegbare Skills auf, matched sie zum aktuellen Task und verhindert dass Claude bestehende Workflows ignoriert. Nutzen am Anfang komplexer Tasks oder wenn unklar ist welcher Skill passt.
allowed-tools: [Read, Glob, Grep]
---

# SKILL: Preflight Check

## Wann aktivieren
- User tippt `/preflight`
- Vor einem komplexen Task wenn unklar ist welcher Skill passt
- Wenn Claude unsicher ist ob ein bestehender Workflow existiert

## Ablauf

### Schritt 1: Alle Skills inventarisieren
Scanne diese Verzeichnisse:
- `C:\Users\User\.claude\skills\*\SKILL.md` (globale Skills)
- `C:\Users\User\.claude\scheduled-tasks\*\SKILL.md` (Scheduled Tasks)

Fuer jeden Skill auslesen:
- `name` aus Frontmatter
- `description` aus Frontmatter
- Erste 5 Zeilen nach Frontmatter fuer Kontext

### Schritt 2: Kompakte Uebersicht ausgeben

Format:
```
## Verfuegbare Skills
| # | Skill | Beschreibung |
|---|---|---|
| 1 | pseo | pSEO Workflow fuer DACH-Projekte |
| 2 | linkedin-content | LinkedIn Content Agent |
| ... | ... | ... |

## Scheduled Tasks
| # | Task | Cron | Beschreibung |
|---|---|---|---|
| 1 | ki-auto-daily-execution | Mo-Fr 09:05 | Taegliche GSC-Analyse |
| ... | ... | ... | ... |
```

### Schritt 3: Match vorschlagen
Basierend auf dem aktuellen Task-Kontext (letzte User-Nachricht oder Chat-Thema):
- Relevante Skills markieren mit `>>> MATCH`
- Kurz begruenden warum (1 Satz)
- Bei Konflikten (mehrere Skills passen): User fragen welcher

### Schritt 4: Bestaetigung
- User waehlt Skill oder sagt "keiner passt"
- Bei Match: Skill-Datei laden und Workflow folgen
- Bei keinem Match: normal weiterarbeiten, aber NICHT improvisieren wenn ein Skill existiert

---

## KEYWORD-TRIGGER-TABELLE (Hard Matches)

Diese User-Phrasen müssen IMMER den genannten Skill auslösen — kein freihändiges Arbeiten:

| User sagt | Trigger-Skill | Begründung |
|---|---|---|
| "auf 95 bringen", "auf XX/100", "Premium-Feel", "Linear/Stripe/Vercel-Liga" | **elite-ui-ux** | Premium-UI/UX ist explizit im Skill-Scope |
| "mach das besser/schöner", "kein generisches Design" | **elite-ui-ux** | Eradication-Clause-Territory |
| "WebGL", "shader", "GSAP", "Framer Motion" | **elite-ui-ux** | Advanced-Motion-Skill |
| "dark mode dashboard", "elite UI" | **elite-ui-ux** | Aesthetic-Concept-Skill |
| "UX-Audit", "Site-Review", "scroll-through", "auf Mobile checken" | **site-review** | Visual-Reviewer-Skill |
| "deploy", "push", "git push", "Netlify deploy" | **deployment** | Release-Gate-Skill |
| "Video erstellen", "Reel", "TikTok-Video", "UGC" | **ai-ugc** | Video-Pipeline-Skill |
| "Kling", "Kling 3", "Kling-Prompt" | **kling** | Modell-spezifisch |
| "Seedance", "Doubao-Video" | **seedance** | Modell-spezifisch |
| "LinkedIn-Post", "LinkedIn-Content" | **linkedin-content** | Content-Skill |
| "Cold-Mail", "Outreach", "Instantly" | **outreach** | DACH+TR-Outreach |
| "pSEO", "programmatic SEO", "Seiten-Varianten" | **pseo** | SEO-Workflow |
| "profilfoto-ki SEO", "GSC-Analyse profilfoto" | **profilfoto-seo** | Domain-spezifisch |
| "st-automatisierung SEO", "BAFA-Content" | **st-auto-seo** | Domain-spezifisch |
| "Thumbnail", "YouTube-Thumbnail" | **youtube-thumbnail** | Spezifischer Generator |
| "Instagram-DM", "DM-Outreach" | **insta-dm** | Chrome-MCP-Skill |
| "Telegram", "Telegram-Bot" | **telegram-gateway** | Messaging-Gateway |
| "Code-Qualität", "clean up", "refactor" | **simplify** | Review-Skill |
| "neue Domain", "Domain onboarden" | **site-bootstrap** | Setup-Skill |
| "schedule", "Cron-Job", "scheduled task" | **schedule** | Task-Manager |

**Regel:** Wenn ein Keyword aus dieser Liste auftaucht, aktiviere den Skill AUTOMATISCH ohne Rückfrage. Das ist der Unterschied zu "vielleicht matched". Hard-Matches ignorieren = Hard-Rule-Verletzung.

---

## Hard Rules
- NIEMALS einen Task starten wenn ein passender Skill existiert aber ignoriert wird
- Lieber einmal zu viel fragen als einen dokumentierten Workflow zu uebergehen
- Scheduled Task Skills sind READ-ONLY Referenz — nicht manuell ausfuehren
- Bei Keyword-Trigger aus obiger Tabelle: Skill AUTOMATISCH aktivieren, nicht „vielleicht ignorieren"
