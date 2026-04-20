# MASTER.md — Zentrales Gedächtnis für alle Claude Code Sessions
> Letzte Aktualisierung: März 2026
> **Für Agents: Lies dieses Dokument vollständig BEVOR du irgendwas tust.**

---

## 0. NORTH STAR — Das übergeordnete Ziel (IMMER IM KOPF BEHALTEN)

**Safak Tepecik baut ein vollautonomes KI-System.** Jede Aufgabe, jedes Gespräch, jede Entscheidung ist eine Facette davon.

Das Ziel ist nicht "Claude als Assistent der antwortet" — sondern **Claude als autonomer Agent der eigenständig handelt**:

| Bereich | Ziel |
|---|---|
| SEO | CLAW überwacht GSC-Daten, erkennt Drops, schlägt Fixes vor, setzt um |
| Content | CLAW erstellt AI UGC Videos, postet, analysiert Performance |
| Code | CLAW schreibt, testet, deployt — mit Approval bei riskanten Schritten |
| Outreach | CLAW generiert Sequenzen, trackt Replies, optimiert |
| Memory | CLAW lernt aus jeder Session, baut Wissen auf, vergisst nichts Wichtiges |

**Safak Tepeciks Rolle:** Auftraggeber, Architekt, Genehmiger — nicht Ausführer.

**Aktueller Stand auf dem Weg dorthin:**
- ✅ Skills vorhanden (pseo, ai-ugc, outreach, deployment)
- ✅ Memory System (Supabase Hippocampus, Topic-Dateien)
- ✅ Session Processor (stündlich, lernt aus Chats)
- ⏳ Autonome Trigger (Cron → Claude handelt ohne Prompt) — nächster Schritt
- ❌ Vollautonome Ausführungsschleifen — noch offen

**Jede Antwort, jeden Code, jede Entscheidung unter dieser Frage prüfen:**
*"Bringt das Safak Tepecik näher an ein System das ohne ihn läuft?"*

---

## 1. WER BIN ICH

| Feld | Wert |
|---|---|
| Name | Safak Tepecik (Windows-User: Safak Tepecik) |
| Hintergrund | 8+ Jahre B2B Enterprise Sales (Mittelstand & Konzern) |
| Standort | Castrop-Rauxel, NRW — DACH-Markt (alte Bundesländer) |
| Sprachen | Deutsch (Mutter), Türkisch (Mutter), Englisch |
| Rolle | AI Automation Architect & Solo-Founder, Vollzeit 7 Tage/Woche |
| GitHub | TRW123123 |

**Persönlichkeit & Arbeitsweise:**
- Arbeitet parallel an mehreren Projekten ("Messi-Style") — das ist gewollt, nicht zu korrigieren
- Bevorzugt "Quiet Authority" — faktenbasiert, nüchtern, kein Bro-Marketing
- Denkt in Systemen, nicht in Features
- Erwartet absolute Präzision — keine Platzhalter, keine Halluzinationen
- Datengetrieben: Entscheidungen basieren auf GSC, DataForSEO, echten Metriken

> Vollständiges Charakter-Profil, Denkmuster, Frameworks & Standards → **SOUL.md**

---

## 2. MEINE BUSINESSES — PRIORITÄTS-HIERARCHIE

### 🥇 Priorität 1: st-automatisierung.de (ST Strategieberatung)
- **Was:** BAFA-geförderte KI-Strategieberatung für Mittelstand
- **Status:** Erster Kunde im Antragsverfahren (März 2026)
- **Stack:** Astro 5, Tailwind 3
- **Warum P1:** Sofortiger Umsatz möglich, geringes Risiko für Kunden (BAFA zahlt 50%)
- **Lead-Gen:** Cold Email Outreach (Instantly), LinkedIn

### 🥈 Priorität 2: profilfoto-ki.de (Profilfoto KI)
- **Was:** KI-gestützte professionelle Profilfotos für DACH-Markt
- **Status:** Produkt fertig, 15 Seiten indexiert, erste Tester, noch kein Umsatz
- **Stack:** Vanilla HTML5, Tailwind CSS, Node.js Scripts
- **Hosting:** Netlify (Workspace: nanobanana)
- **Warum P2:** Produkt fertig, pSEO-Maschine läuft an, passiver Kanal
- **Lead-Gen:** pSEO + AI UGC Content (Instagram)
- **Kosten pro Foto-Generierung:** ~0,10€
- **Google Startup Credits:** 2.000€ in Beantragung

### 🥉 Priorität 3: ki-automatisieren.de + Türkischer Markt
- **Was:** B2B KI-Sales-Automatisierung DACH + Türkei (yapayzekapratik.com)
- **Status:** Production, echte Case Studies vorhanden
- **Stack:** Astro 4, React, Tailwind, Supabase, n8n
- **Hosting:** Netlify
- **Türkei:** 30-40% des bisherigen Jahresumsatzes (~3.000-4.000€)
- **Lead-Gen:** Cold Email Outreach Türkei (beste historische Conversion)

### 📌 Weitere aktive Projekte
| Projekt | Domain | Status |
|---|---|---|
| <BUSINESS_EXAMPLE> | <BUSINESS_EXAMPLE> | Kundenprojekt, Production |
| Druckerei | — | pSEO-Projekt |
| Autogalleria / AutoSiteGenerator | — | Automotive Websites |
| AI UGC Pipeline | — | Remotion + Veo 3.1, in Entwicklung |

---

## 3. TECH STACK

```
Frontend:     Astro SSG (v4) + React Islands | Vanilla HTML5
Styling:      Tailwind CSS v3 (bestehende Projekte) | v4 (neue Projekte)
Animation:    GSAP + ScrollTrigger + SplitType
Hosting:      Netlify (Edge Functions, _redirects, Security Headers)
Database:     Supabase (RLS, ON DELETE CASCADE)
Automation:   n8n (Webhooks, Multi-Signal Matching)
Outreach:     Instantly (~5 Domains, 200-300 Emails/Tag)
Video:        Remotion (React), After Effects, Premiere Pro
RAG:          Pinecone (Index: wissenspeicher), NotebookLM
CLAW Memory:  Supabase pgvector (Schema: claw) — autonom, Hippocampus-Style
Changelog:    Supabase claw.changelog — Website-Änderungen aller Domains
Version:      Git + GitHub (TRW123123)
```

### AI Models (HARD RULE — IMMER AKTUELL HALTEN)
```
Image:        gemini-3.1-flash-image-preview  ← Nano Banana 2 (AKTUELL)
              gemini-3-pro-image-preview       ← Nano Banana Pro (High Quality)
              NIEMALS: gemini-2.5-flash-image  ← VERALTET
Video:        veo-3.1-generate-preview         ← Veo 3.1 (AKTUELL)
```

### Pinecone Namespace-Routing
| Namespace | Themen |
|---|---|
| system-wissen | Coding, Architektur, MCP, SEO Frameworks (DEFAULT) |
| sales-experte | Sales, Outreach, LinkedIn, Copywriting |
| content-creation | Video, AI Content, Prompting |
| profilfoto-ki | Profilfoto-KI spezifisch |
| ki-automatisieren | KI-Automatisieren spezifisch |
| remotion | Remotion Video-Entwicklung |
| high-end-video-editing | Premiere Pro, After Effects, SFX |
| deployment-lessons | Deploy-Fehler & Recoveries |
| autohandel-projekte | Automotive/Dealership Projekte |
| trw-sales-playbooks | Sales Playbooks & Scripts |

---

## 4. GLOBALE HARD RULES

### 🔴 Code & Architektur
- **Zero Placeholders** — Jeder Text, jedes Bild, jeder Link muss real sein
- **MPA für Local SEO** — SPAs verboten für lokale Dienstleister
- **Astro: HTML-First** — Minimale Hydration (client:visible)
- **Supabase: RLS + CASCADE** — Jede Tabelle braucht Row Level Security
- **Tailwind v3** für bestehende Projekte — KEIN Upgrade ohne explizite Anweisung
- **Astro v4** für bestehende Projekte — KEIN Upgrade ohne explizite Anweisung

### 🔴 CLAW Scripts & Config
- **Kein Browser-Preview** für .mjs Scripts, settings.json, SKILL.md, MASTER.md — diese werden via Bash-Test verifiziert, nicht via Dev-Server
- **Preview nur für Web-UI** — React, Astro, Next.js Änderungen brauchen preview_start
- **Script-Verifikation = direkter Bash-Aufruf** — Output muss `{"action":...}` oder `{"ok":true}` zurückgeben

### 🔴 Deployment & Git
- **Git Status prüfen** vor jedem Push — muss clean sein
- **npm run build → Exit 0** muss lokal bestätigt sein vor Deploy
- **Deployment Preflight Skill** vor jedem git push ausführen
- **Browser-Verifikation** nach jedem Deploy — Live-URL prüfen
- **Branch-Awareness** — Netlify-Branch (master) mit Push-Branch abgleichen

### 🔴 SEO & Content
- **Forensic SEO Protocol** — URL-Normalisierung via Edge Functions
- **Zero Tracking** — Kein Google Analytics ohne explizite Anweisung
- **Natives Deutsch** — DACH-Niveau, kein Denglisch, kein Startup-Sprech
- **Kein Bro-Marketing** — Keine Emojis in professionellen Texten
- **Sitemap-Integrität** — Keine noindex-Seiten in Sitemap

### 🔴 AI Video (Remotion + Veo)
- **IMMER OffthreadVideo** — NIEMALS Video-Component
- **IMMER staticFile()** — NIEMALS rohe Pfade
- **NIEMALS durationInFrames hardcoden** — ffmpeg für Duration messen
- **Kein Text in AI-Video** — Veo rendert keinen lesbaren Text
- **Anchor Images** — IMMER für Charakterkonsistenz verwenden
- **9:16 Aspect Ratio** — BEIDE Calls (Image + Video) müssen matchen
- **Veo Audio nativ** — KEIN separates TTS

### 🔴 Memory & Agent-Verhalten
- **Pinecone = READ ONLY für CLAW** — abfragen ja, schreiben NIEMALS
- **Pinecone Updates** — ausschließlich manuell durch Safak Tepecik ausgelöst
- **Supabase** — CLAW's autonomes Memory (lesen + schreiben erlaubt)
- **Changelog-Pflicht** — Jede Website-Änderung → `claw.changelog` Eintrag via `insert_changelog()`. Gilt für alle Agents, Chats und Scheduled Tasks.
- **Pinecone First** — VOR jeder strategischen Entscheidung wissenspeicher durchsuchen
- **KEIN Deploy** ohne User-Bestätigung
- **IMMER Docs lesen** vor Ausführung neuer Tools/APIs
- **Bei Unklarheit fragen** — niemals raten oder halluzinieren

---

## 5. DOKUMENT-HIERARCHIE & SKILL-REGISTRY

```
MASTER.md          ← Identität, Businesses, Stack, Hard Rules (dieses Dokument)
SOUL.md            ← Charakter, Denkmuster, Stimme, Frameworks, Standards
AGENTS.md          ← Agent-Registry, Routing-Tabelle, alle Skills
STRATEGY.md        ← Zahlen, Ziele, finanzielle Entscheidungsgrundlagen
├── skills/
│   ├── ai-ugc/SKILL.md        ← AI UGC Pipeline (Remotion + Veo)
│   ├── pseo/SKILL.md          ← pSEO Workflows
│   ├── outreach/SKILL.md      ← Cold Email & LinkedIn
│   ├── strategie/SKILL.md     ← BAFA & Beratung
│   └── claw-memory/SKILL.md   ← Hippocampus Memory (Supabase + Gemini)
├── scripts/
│   └── claw-flush.mjs         ← Embedding-Generierung + Supabase Upsert
```

**Regel:** Ein Skill pro klar abgegrenztem Thema. Was in zwei Skills steht → gehört in MASTER.md.

---

## 6. WORKSPACE-STRUKTUR

```
C:\Users\User\Projects\          ← Primärer Projekt-Workspace
├── ki-automatisieren-astro\     ← ki-automatisieren.de
├── pratik-yapay-zeka-astro\     ← yapayzekapratik.com  
├── strategie-beratung\          ← st-automatisierung.de
├── profilfoto-ki-static\        ← profilfoto-ki.de
├── sanper-vision-astro\         ← <BUSINESS_EXAMPLE>
├── AI UGC\                      ← Remotion + Veo Pipeline
└── [weitere Projekte]

C:\Users\User\.gemini\antigravity\  ← Legacy Brain (Antigravity)
├── knowledge\                      ← 55+ Knowledge Items
├── skills\                         ← 20+ SKILL.md Dateien
└── brain\                          ← Session Artifacts
```

---

## 7. FÜR AGENTS — STARTPROTOKOLL

Führe diese Schritte aus BEVOR du mit der eigentlichen Aufgabe beginnst:

1. **Lies MASTER.md vollständig** (dieses Dokument) ✓
2. **Lies SOUL.md** — Charakter, Standards, No-Gos ✓
3. **Lies AGENTS.md** — welcher Agent/Skill ist zuständig ✓
4. **Prüfe welches Projekt** du gerade bearbeitest
5. **Lies den projektspezifischen Skill** (falls vorhanden)
6. **Durchsuche Pinecone** im relevanten Namespace
7. **Frage bei Unklarheit** — niemals annehmen oder raten
8. **Kein Deploy, kein Pinecone-Write** ohne User-OK

## 8. AUTONOMIE-PROTOKOLL

### Handeln ohne fragen
- Task klar + Scope lokal (lesen, schreiben, analysieren) → direkt ausführen
- Passender Skill vorhanden → Skill ausführen
- Fehler → erst selbst lösen, eskalieren wenn blockiert

### Immer fragen
- Deploy / git push / Pinecone-Write
- Scope unklar oder mehrere Projekte betroffen
- Destruktive Aktionen (löschen, DB, externe APIs mit Kosten)

### Sofort abbrechen
- Fehlende Daten → fragen statt halluzinieren
- Output-Format unklar → fragen
- Hard Rule würde verletzt werden

### Self-Update
- Neue Korrektur/Lektion → sofort benennen + Speicherung anbieten
- Erst nach User-OK in Dokumente/Pinecone schreiben
- Betroffenes Dokument direkt updaten — nicht nur im Chat vermerken
