---
name: business-launch
description: Master-Orchestrator für den kompletten Aufbau eines neuen Web-Business von null bis live. Phasenbasiert — lädt nur die aktive Phase. Nutzen wenn ein neues Projekt gestartet wird (Domain, Website, SEO, Social, Growth).
allowed-tools: [Read, Write, Edit, Bash, Skill]
---

# SKILL: Business Launch — Von null bis live

## Wann aktivieren
- "Starte Business Launch für [domain]"
- "Neues Projekt aufbauen: [domain]"
- "Launch [projektname]"
- "Weiter mit Phase [N] für [domain]"

---

## ⚡ Pre-Flight Questions (PFLICHT vor Phase 1)

Diese Fragen müssen am Anfang JEDER Business-Launch-Session beantwortet sein. Antworten in Handoff-Datei dokumentieren — sie steuern Tech-Stack, Pflicht-Pages und Verifikation.

### Q1 — Stack-Type
**Welche Architektur?**
- **A) Static Landing-Page** — HTML + Tailwind, kein Backend (Skill: `phase-2a-static`)
  - Use-Case: Trafic-Sammler, Lead-Funnel, Pre-Launch
  - Beispiele: profilfoto-ki-static, autohaus-video-static
  - Vorteil: Lighthouse 100/100, ms-Builds, simpel
- **B) Full Web-App** — Next.js + Supabase Auth + DB (Skill: `phase-2b-nextjs`)
  - Use-Case: Login, User-Accounts, Dashboard, App-Funktionalität
  - Beispiele: profilfoto-ki-app-v2
- **C) Microservice-Split** — Beide getrennt (2 Repos, 2 Netlify-Sites)
  - Use-Case: SEO-Landing + App auf eigenen Subdomains
  - Beispiele: `profilfoto-ki.de` (static) + `app.profilfoto-ki.de` (Next.js)

### Q2 — Förderung-Target
**Plant ihr eine Förderung oder Programm-Bewerbung?**
- Google AI Startup Programm
- EU Innovation Fund / Horizon
- KfW / Bafa Innovationsförderung
- Y Combinator / Antler / Andere Accelerator
- **Keine** Förderung geplant

→ Wenn JA: **Tech-Stack-Wahl bewusst auf Förderkriterien ausrichten** (Google → Vertex AI Frankfurt; EU → EU-only Subprocessors).
→ Wenn JA: **Über-uns-Page mit Founder-Story + Tech-Stack-Sektion + JSON-LD Organization** wird Pflicht in Phase 4.
→ **Tech-Stack-Behauptungen müssen mit User explizit VERIFIZIERT werden** vor Publication (Pitfall P-14).

### Q3 — Lead-Capture-Flow
**Wie kommen Leads ins System?**
- **A) Form → DB only** — Klassisches Kontaktformular, Daten in Tabelle
- **B) Form → DB → Storage** — Form mit Datei-Upload (Fotos, PDFs, Voice-Memos)
- **C) Form → DB → Storage → Edge-Processing** — Bei Upload werden Files konvertiert/verarbeitet (z.B. WebP→JPEG, Image-Resize, OCR, Voice-Transkription)
- **D) Form → DB → Workflow** — Lead triggert Email/SMS/Slack/Telegram-Notification, ggf n8n-Workflow

→ Treibt Phase 1 Schema-Design + Phase 2.5 Edge-Function-Architektur.

### Q4 — Browser-MCP verfügbar?
**Steht Browser-MCP in der Session zur Verfügung?**
- Test: `list_connected_browsers` — gibt es ≥1 verbundenen Browser?
- Test: `curl https://example.com` — DNS funktioniert?

→ Wenn JA: Hard Rule "Browser-Verifikation nach jedem Deploy" aktiv.
→ Wenn NEIN: **User-Verify-Mode** aktivieren — User wird nach jedem Deploy explizit gefragt: "Kannst du `https://...` öffnen und prüfen?". Niemals halluzinieren.

### Q5 — Humanizer-DE Auto-Chain?
**Soll Humanizer-DE automatisch vor jedem HTML-Edit mit Visible-Copy laufen?**
- Default: JA (entspricht CLAUDE.md Hard Rule)
- Wenn aktiv: Em-Dash-Check, AI-Words-Check, Sentence-Rhythm-Check vor jedem Commit
- Bei Score < Threshold: Rewrite-Loop bis Pass

---

## Phasen-Übersicht

| Phase | Inhalt | Skill | Pflicht für |
|---|---|---|---|
| **1** | Domain ✅, Zoho Mail, Supabase, GitHub Repo, Lead-Schema | `phase-1-infra` | Alle |
| **2A** | Static HTML+Tailwind Landing-Page, Netlify Deploy | `phase-2a-static` | Q1=A oder C |
| **2B** | Next.js App, Auth, Dashboard, Netlify Deploy | `phase-2b-nextjs` | Q1=B oder C |
| **2.5** | Lead-Pipeline (Form, Edge Functions, Storage, Result-Page) | `phase-2.5-lead-pipeline` | Q3=B/C/D |
| **3** | 5–10 SEO Landing Pages (DataForSEO) | `phase-3-pages` | Wenn SEO-Strategie |
| **4** | GSC, Schema, Sitemap, Über-uns, Impressum, DSGVO | `phase-4-seo` | Alle |
| **5** | TikTok, Instagram, YouTube, LinkedIn, X | `phase-5-social` | Wenn Social-Strategie |
| **6** | Google for Startups, Outreach, CRM | `phase-6-growth` | Wenn Q2 ≠ "Keine" |

---

## Ablauf

1. **Pre-Flight-Questions Q1–Q5 beantworten** (User explicit, nicht raten)
2. Antworten in Handoff-Datei dokumentieren
3. Frage welche Phase als nächstes dran ist
4. Lade den entsprechenden Sub-Skill
5. Führe Phase vollständig aus
6. Schreibe Handoff-Datei mit aktuellem Status
7. Warte auf User-Bestätigung bevor nächste Phase

---

## Handoff-Datei

Pfad: `~/Claude/sessions\business-launch-{projektName}-handoff.md`

Format:
```markdown
# Business Launch Handoff: {projektName}

## Pre-Flight Answers
- Q1 Stack: A (Static) | B (Next.js) | C (Split)
- Q2 Förderung: Google AI Startup | EU | None
- Q3 Lead-Flow: A (DB) | B (DB+Storage) | C (Edge-Processing) | D (Workflow)
- Q4 Browser-MCP: available | blocked
- Q5 Humanizer-Auto: yes | no

## Project
- Domain: {domain}
- Repo: {pfad}
- Supabase: {project-id}
- Netlify: {netlify-url}
- Deploy-Mode: cli | git-auto

## Tech-Stack (verifiziert mit User)
- Frontend: ...
- Backend: ...
- AI/ML: ...   ← critical für Förderung-Claims

## Phase Status
Phase 1: ✅ done — {date}
Phase 2A: 🔄 in progress
Phase 2.5: ⏳ pending
Phase 3–6: ⏳ pending

## Common Pitfalls Hit
- [P-01] Cachebust+Font: gefixt durch Skip in cachebust.mjs
- [P-04] mono-caps utility hardcoded color: bekannt, vermieden
```

---

## Hard Rules

1. **Pre-Flight-Questions vor Phase 1** — keine Annahmen über Stack/Förderung/Lead-Flow.
2. **Jede Phase braucht User-Bestätigung** vor dem Start.
3. **Kein Deploy ohne explizite Freigabe**.
4. **Humanizer-DE läuft über JEDEN Text der nach außen geht** (Q5=ja default).
5. **Browser-Kontrolle** an vielen Stellen eingeplant — nicht überspringen, oder User-Verify-Mode aktivieren.
6. **Tech-Stack-Behauptungen für Förderung** müssen explizit mit User verifiziert sein.
7. **Migrations + Edge Functions in Repo** — niemals nur auf Supabase-Server (Pitfall P-12).
8. **Common Pitfalls vor Deploy prüfen** — siehe `COMMON_PITFALLS.md`.

---

## Common Pitfalls Reference

Vor jeder Phase: kurzer Blick in `~/.claude/skills\business-launch\COMMON_PITFALLS.md` ob bekannte Bugs vermieden werden.

Wenn neuer Bug auftritt: **dokumentieren** in `COMMON_PITFALLS.md` für nächstes Projekt.

---

## Anti-Pattern: "Premium Look" Iteration-Loop

**Don't:** Default-Theme bauen → User sagt "nein" → komplett neu bauen → "auch nein" → ...

**Do:** Vor erstem Hero-Code 2–3 **Mood-Board-Optionen** als Beschreibung skizzieren:
- **Option A — Industrial/Garage:** Cream + Ink + Werkzeug-Orange, Space Grotesk + JetBrains Mono, scharf, technisch
- **Option B — Premium/Editorial:** Schwarz + Weiß + Gold, Serif-Display, weite Abstände, edel
- **Option C — Tech/Cyber:** Dark + Neon, Mono-only Typography, Grid-Texturen, futuristisch

User wählt EINE Direction. Innerhalb der gewählten Direction: max 2 Iterations. Wenn dann nicht passt, NICHT pivot — Direction wechseln und neu Mood-Boarden.
