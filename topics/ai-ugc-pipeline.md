> Letztes Update: 2026-04-19
# AI UGC Pipeline
> Wird automatisch vom Session Processor aktualisiert

## 🎬 Reel-Pipeline Status (Stand 2026-04-14)

**Letzte drei Reels produziert:**
- **Reel 025** (Shatter "KEIN GELD", Talking Head Auto): Score 30.02, WT 14.3% (höchste der Serie), Skip 88.5%
- **Reel 026** (Straßeninterview 9:16 mit Influencerin): Score 19.63 — Format 9:16 hat Reel 016 Erfolg nicht repliziert
- **Reel 027** (Straßeninterview 16:9 letterboxed + Remotion Education Layer mit Breakdown + Reveal 505x): Heute live, Daten in 24h

**Key-Erkenntnis:** YouTube ↔ Instagram Korrelation = NULL. Reel 021 ist IG-Flop aber YT-Top mit 1578 Views und 76.8% Retention. YouTube = Evergreen, IG = Flash. Strategien müssen separat optimiert werden.

**Benchmark für Format-Entscheidungen:** Reel 016 (16:9 Straßeninterview, Score 56.39, WT 27.4%) bleibt Top-Performer der Serie. Reel 027 testet die Reproduktion dieses Formats.

**Neue Remotion-Komponenten (2026-04-14):**
- `src/components/ShatterText.tsx` — Text zerbricht mit Gravity/Rotation
- `src/components/ProfilePhotoFlash.tsx` — Foto kurz fullscreen einblenden
- `src/components/ProfileViewsBreakdown.tsx` — Plattform-Breakdown mit Count-Up + Big Reveal
- `src/StreetInterviewReel.tsx` — 16:9 Letterbox + Education Layer Template

**Installierte Packages (neu):** @remotion/three, @remotion/lottie, @remotion/paths

## Aktueller Stand
Das System hat den Paradigmenwechsel von isolierten Agenten hin zu einer **Karpathy-style "LLM-maintained knowledge base"** erfolgreich vollzogen. Die Kernidee, klassisches RAG durch ein System zu ersetzen, in dem das LLM aktiv eine strukturierte Wissensbasis aufbaut und pflegt, wurde umgesetzt.

Als Fundament wurde ein **zentraler Obsidian Knowledge Vault** (`C:\Users\User\obsidian-claw-vault\`) erstellt und mit Wissen aus allen verfügbaren Quellen befüllt. Dieser Vault integriert:
1.  **Claude Code Sessions** (`.jsonl`)
2.  **Antigravity Conversations** (dekodiert aus proprietären `.pb`-Dateien)
3.  **ChatGPT Exporte** (aus bestehenden Text-Dateien)
4.  **Projekt-Dokumentation** (alle `.md`-Dateien aus `C:\Users\User\Projects\`)
5.  **Zusätzliche Wissensquellen** (Lokale PDFs, Google Drive Dokumente, Pinecone-Exporte, Gemini-Chats)

Ein benutzerdefiniertes Python-Skript hat über 300 MB an rohen, fragmentierten Daten in einen 32 MB großen, vollständig durchsuchbaren und vernetzten Wissensgraphen mit über 2.100 Notizen transformiert. Dies löst das kritische Problem der **Workspace-Fragmentierung**, das durch eine Analyse aufgedeckt wurde (z.B. 5 verschiedene Workspaces für das Projekt `st-automatisierung`).

Um die Brücke zwischen dem menschenlesbaren Vault und der KI-Nutzung zu schlagen, wurde eine **Synchronisations-Pipeline zu Supabase** gebaut. Ein täglicher, geplanter Task (`CLAW-Wiki-Sync`) liest alle neuen oder geänderten Wiki-Dateien, zerlegt sie in semantische Chunks, generiert Embeddings und speichert diese in einer Vektor-Datenbank. Dadurch kann das CLAW-System bei jeder Anfrage relevantes Wissen aus dem Vault per semantischer Suche finden und als Kontext nutzen. **Pinecone wurde in diesem Zuge als veraltet deklariert**; das gesamte Wissen wurde extrahiert und in den Vault überführt.

Die Analyse des `st-auto-seo` Agenten offenbarte zudem eine Diskrepanz zwischen dem ursprünglichen 3-Stufen-Funnel-Design des Users und einer vom Assistant hinzugefügten "Stage 0" (Authority Tracking). Dies wurde als bewusst geparktes **"Zukunftsthema"** geklärt und nicht als fehlerhafter Scope Creep.

Für die aktive Bewirtschaftung des Vaults wurde das Open-Source-Framework **`nvk/llm-wiki`** als überlegenes Werkzeug identifiziert und installiert. Es wird das Herzstück des neuen Wissensmanagements bilden und verfügt über eingebaute Deep-Research-Funktionen. Die Automatisierung von Perplexity.ai wurde als Alternative verworfen, da sie einen direkten **Verstoß gegen die Nutzungsbedingungen** darstellt.

### Kern-Modelle (Architektur)
- **Antigravity (Gemini CLI):** Nutzt Google-Modelle (Gemini Pro/Flash). Primär für Coding-Aufgaben, Recherche und Aufgaben innerhalb des Google-Ökosystems. Läuft im Terminal/Cursor.
- **CLAW (Claude Code CLI):** Nutzt Anthropic-Modelle (Claude Sonnet/Opus). Primär für Reasoning, Planung, Orchestrierung von MCPs und kreative Aufgaben. Hat vollen Zugriff auf Dateisystem, Terminal und Browser Control und bildet den Kern des autonomen Agenten.
    - **Design Skills:** Eine Sammlung von 7 Skills für Design-Aufgaben (`design:design-critique`, `design:design-handoff`, `design:ux-copy`, `design:user-research`, `design:accessibility-review` etc.) ist verfügbar.
- **Claude Cowork (Desktop App):** Nutzt Anthropic-Modelle. Vereinfachte Version von Claude Code für Non-Coder und Business-User mit einem "Step-away"-Workflow (Aufgabe abgeben, später Ergebnis abholen). Kein direkter Terminal-Zugriff.
    - **Plugins:** Das `Marketing Plugin v1.2.0` ist als persönliches Plugin installiert und wird für strategische Aufgaben wie Kampagnenplanung (`/campaign-plan`) und SEO-Audits (`/seo-audit`) genutzt.
- **Knowledge Graph (Obsidian Vault):** Eine zentrale, multi-source Wissensbasis (`obsidian-claw-vault`), die Claude Code, Antigravity, ChatGPT, Projekt-Markdown-Dateien und weitere Quellen integriert. Dient als "Source of Truth" für menschliche Nutzer und wird über das `nvk/llm-wiki` Framework verwaltet.
- **Supabase Embeddings (Wiki RAG):** Ein Vektor-Index über den gesamten Obsidian Vault. Ein täglicher Sync-Task hält die Embeddings aktuell. Dient als "Search Index" für die KI, um bei jeder Anfrage relevantes Wissen aus dem Vault per semantischer Suche zu finden.
- **LLM-Wiki Framework (`nvk/llm-wiki`):** Ein als Claude Code Plugin installiertes Open-Source-Framework zur aktiven Bewirtschaftung des Obsidian Vaults. Bietet Befehle für Deep Research (`/wiki:research`), Wissens-Ingestion (`/wiki:ingest`) und Qualitäts-Checks (`/wiki:lint`).
- **PATH A (Veo Pipeline):** Nutzt `gemini-3.1-flash-image-preview` (Nano Banana 2) für Anchor-Frames und `veo-3.1-generate-preview` für filmische Videoclips.
- **PATH B (Talking Head Pipeline):** Nutzt `gemini-3.1-flash-image-preview` für Anchor-Frames, `ElevenLabs` für Voiceover und `OmniHuman 1.5` für die Video-Generierung.

### Modelle (Hard Rules)
- **Hard Rule:** Der Autor/Inhaber ist immer "<USER_NAME>", niemals "Savaş Topçu".
- **Hard Rule:** Der Standard-Booking-Link ist `https://calendly.com/st-automatisierung-info/30min`, niemals `cal.com`.
- **Hard Rule (Marketing-Sprache):** Jede Marketing-Kommunikation muss extrem einfach, direkt und nutzenorientiert sein (z.B. "Wir bauen Websites, die Kunden bringen."). Marketing-Jargon ("konversionsstark", "strategisch konzipiert") und zu komplexe Formulierungen sind verboten. Der "Grundschüler-Test" gilt.
- **Hard Rule (Prompt-Interpretation):** Wenn ein Beispiel zur Veranschaulichung einer Zielgruppe gegeben wird (z.B. "Handwerker"), muss das zugrundeliegende Prinzip (z.B. einfache Sprache) verstanden werden, anstatt das Beispiel wörtlich in den Output zu übernehmen.
- **Hard Rule (CLAW-Antwortstil):** Kurze, roboterhafte Zwei-Wort-Sätze (z.B. "Verstanden. Korrigiert.") sind zu vermeiden. Antworten sollen natürlich und im Kontext formuliert sein.
- **Hard Rule (Perplexity Automation Verbot):** Die Automatisierung von Perplexity.ai (sowohl via API als auch Browser-Steuerung) ist aufgrund von expliziten ToS-Verletzungen strengstens verboten. Das Risiko eines Account-Bans ist zu hoch. Deep Research wird stattdessen über das `nvk/llm-wiki` Framework oder die native Claude.ai-Webseite abgewickelt.
- Bilder: `gemini-3.1-flash-image-preview` (Nano Banana 2), `gemini-3-pro-image-preview` (Nano Banana Pro) — NIEMALS gemini-2.5-flash-image
- Video (filmisch): `veo-3.1-generate-preview` (Produktion), `veo-3.1-fast-generate-preview` (Prototyping) — NIEMALS andere Veo-Versionen
- Video (Talking Head): `OmniHuman 1.5` (via Replicate)
- Video-Analyse: `gemini-3-flash-preview`
- Voice: ElevenLabs — männlich: `bIHbv24MWmeRgasZH58o`, weiblich: `XFigb6fqZPxl2Q2dFOXN`
- Embeddings (Supabase für CLAW): `gemini-embedding-001` (768 Dims, Cosine, Dense). **Hard Rule:** Dieses Modell ist das einzig zulässige für das CLAW-Gedächtnis. `gemini-embedding-2-preview` ist **inkompatibel** mit dem bestehenden Vektorraum und darf nicht verwendet werden.
- Audio: Veo generiert Audio nativ mit. Mit präzisem Prompting (Dialog in Anführungszeichen, Stimmbeschreibung) kann der exakte Skripttext erzeugt werden. Separates TTS (z.B. ElevenLabs) ist ein Fallback, nicht der Standard-Workflow.

### Technische Eigenheiten
- **Zustandsloser Chat-Client:** Claude Code speichert keine Chat-Historie zwischen den Sessions. Der Kontext wird ausschließlich durch das CLAW-System aufrechterhalten.
- **`/insights`-Report:** Eine interne Claude-Code-Funktion (`/insights`), die alle Sessions der letzten 30 Tage analysiert und einen HTML-Report über Nutzungsmuster, Reibungspunkte und Optimierungspotenziale generiert.
- **Kern-Reibungspunkte (laut `/insights`):**
    - **Projekt-Kontext-Verwechslung:** Claude mischt häufig Kontexte und Aufgaben verschiedener Projekte.
    - **Workspace-Fragmentierung:** Für ein einzelnes Projekt (`st-automatisierung`) existierten 5 verschiedene, isolierte Workspaces, was zu inkonsistentem Kontext führte. **(Gelöst durch zentralen Obsidian Vault)**
    - **Ignorieren von Workflows:** Bestehende, dokumentierte Skills und Prozesse werden ignoriert, stattdessen werden ineffiziente neue Lösungswege "erfunden".
    - **Fehleranfällige Browser-Automatisierung:** UI-Interaktionen, insbesondere in der Google Search Console, sind instabil und führen oft zu Fehlern, wie beim Versuch, vollständige Screenshots von Seiten mit Lazy-Loading zu erstellen.
- **UI-Eigenheiten (Claude Desktop App):** Archivierte Chats können aus der Seitenleiste und der Suche verschwinden, was sie unauffindbar macht. Die zugrundeliegenden Session-Daten (`.jsonl`-Dateien bleiben jedoch erhalten und können manuell in eine neue Session geladen werden.
- **Drei-Ebenen-Gedächtnis (Topics, Memories, Activities):**
    - **Topic-Dateien (`/topics/*.md`):** Das primäre, menschenlesbare Gedächtnis für den Projektstatus. Wird vom `claw-session-processor.mjs` automatisch aktualisiert.
    - **Supabase (`claw.memories_user`):** Das semantische, autonome Gedächtnis für atomare, dauerhafte Fakten (`Hard Rules`, `Corrections`). Nutzt ein "Hippocampus"-System mit Importance Scoring und Jaccard-Deduplizierung. Die Deduplizierung wurde gefixt und agiert nun **scope-übergreifend**, um Duplikate zu vermeiden.
    - **Supabase (`claw.activity_log`):** Das neue, chronologische Gedächtnis für konkrete Aktionen. Speichert "Was wurde getan?", "Was wurde entschieden?" und "Was sind offene Punkte?". Wird bei jedem Session-Start geladen, um nahtlose Kontinuität zu gewährleisten.
- **Zentraler Obsidian Knowledge Vault:**
    - **Architektur:** Ein zentraler Wissensspeicher (`C:\Users\User\obsidian-claw-vault\`), der als Grundlage für das neue Karpathy-Style Wissensmanagement dient.
    - **Quellen-Integration:** Der Vault vereint heterogene Datenquellen: Claude Code Sessions (`.jsonl`), Antigravity Conversations (`.pb`), ChatGPT-Exporte (`.txt`), Projekt-Markdown-Dateien, lokale PDFs, Google Drive Docs und Pinecone-Exporte.
    - **Konvertierungs-Skript:** Ein benutzerdefiniertes Python-Skript (`jsonl-to-obsidian.py`) verarbeitet die Rohdaten, bereinigt sie, extrahiert Konzepte und erstellt automatisch `[[Wiki-Links]]` für die Vernetzung.
    - **Antigravity-Dekodierung:** Für die Antigravity-Chats wird das `antigravity-history` Python-Paket verwendet, das über den lokalen LanguageServer der laufenden Antigravity-Anwendung die verschlüsselten `.pb`-Dateien dekodiert.
    - **Problem-Lösung:** Der Vault löst das Problem der **Workspace-Fragmentierung** (z.B. 5 Workspaces für ein Projekt), indem er eine einzige, durchsuchbare Wahrheit für alle Konversationen und Dokumente schafft.
- **Wiki-Supabase-Sync (Wissensbrücke):**
    - **Rollenverteilung:** Der Obsidian Vault ist die "Source of Truth" (für Menschen), während Supabase als "Search Index" (für die KI) dient.
    - **Mechanismus:** Ein täglicher Windows Scheduled Task (`CLAW-Wiki-Sync`) läuft um 13:00 Uhr.
    - **Logik:** Das Skript `claw-wiki-sync.mjs` prüft einen Timestamp des letzten erfolgreichen Laufs und verarbeitet nur Dateien, die seitdem geändert wurden.
    - **Prozess:** Die geänderten Dateien werden nach H2-Überschriften zerlegt (gechunkt), mit Gemini eingebettet und in die `claw.memories_user`-Tabelle in Supabase mit dem `signal_type: 'wiki-knowledge'` geschrieben.
- **Wissens-Typen:** Es wird klar zwischen zwei Arten von Wissen unterschieden:
    - **Research-Wissen:** Nachrecherchierbare Fakten (z.B. EU AI Act, BAFA-Richtlinien). Nützlich, aber nicht einzigartig.
    - **Projekt-Wissen:** Nicht-reproduzierbares, akkumuliertes Erfahrungswissen (z.B. Sales-Playbooks, Architektur-Entscheidungen, fehlgeschlagene Experimente). Dies ist das wertvollste Wissen im System.
- **Autonome Agenten (Native Scheduled Tasks):**
    - **Architektur-Shift:** Das System migriert von externen `.mjs`-Skripten zu nativen **Claude Code Scheduled Tasks**.
    - **SKILL.md als Herzstück:** Jeder autonome Agent wird durch eine `SKILL.md`-Datei definiert. **Status:** Die `SKILL.md`-Dateien für die SEO-Agenten des Projekts `st-automatisierung` wurden erfolgreich befüllt. 8 weitere Kern-Tasks (LinkedIn, andere SEO-Projekte) sind registriert, aber ihre `SKILL.md`-Dateien sind noch leere Platzhalter.
    - **Strikte Kontext-Trennung (Hard Rule):** Projekt-spezifische Agenten (SEO, LinkedIn, etc.) *müssen* aus dem jeweiligen Projekt-Workspace heraus erstellt und verwaltet werden. Der `Open Claw`-Workspace ist *ausschließlich* für die übergeordnete Orchestrierung und projektübergreifende Tasks (z.B. `morning-catchup`) zuständig.
- **Claude Code Hooks (in `settings.json`):**
    - **`SessionStart`:** Führt `claw-queue-check.mjs` aus. Zeigt offene Tasks an und lädt die letzten 7 Tage an Aktivitäten aus dem `claw.activity_log` in den Start-Kontext.
    - **`UserPromptSubmit`:** Führt `claw-research.mjs` aus, um vor jeder Antwort automatisch relevante Memories aus Supabase abzurufen und als Kontext zu injizieren. Dies schließt jetzt auch das Wissen aus dem Obsidian Vault ein.
    - **`Stop`:** Führt `claw-session-processor.mjs` aus. Dieser verarbeitet die abgeschlossene Session: Er scannt dynamisch alle Projektverzeichnisse, extrahiert Learnings (für `memories_user`) und Aktivitäten (für `activity_log`), aktualisiert Topic-Dateien und ignoriert Sessions, die weniger als 30 Minuten alt sind.
- **Claude Code Session-Speicher:** Claude Code legt bei der Ausführung in einem Workspace automatisch einen internen Speicherordner an (z.B. `C--Users-User--claude-projects-Open-Claw`), in dem Session-Logs (`.jsonl`) und Subagenten-Aktivitäten gespeichert werden. **Wichtig:** Der Chat-Verlauf ist an den exakten Pfad des Workspaces gebunden. Eine Umbenennung des Projektordners (z.B. von `Strategieberatung` zu `strategie-beratung`) führt dazu, dass der alte Chat im neuen Pfad nicht mehr sichtbar ist, obwohl die Daten noch existieren.
- **n8n GSC Pipeline (täglich 06:00):**
    - Ein n8n-Workflow (`CLAW – GSC Daily Data Collector v3`) sammelt täglich GSC-Daten für alle Projekte.
    - Holt immer die letzten 7 Tage mit `dataState: 'all'`, um API-Lags auszugleichen.
    - Schreibt via `UPSERT` in drei Supabase-Tabellen: `gsc_history` (pro Seite/Tag), `gsc_daily_summary` (pro Domain/Tag) und `gsc_queries` (pro Seite/Keyword/Tag).
- **Lead Capture Pipeline (Standard-Stack):**
    - **Frontend:** Eine Astro-Formular-Komponente sammelt die Daten.
    - **Backend:** Eine Supabase Edge Function (`st-lead-submit`) empfängt die Formulardaten, validiert sie und schreibt sie in eine zentrale `st_leads`-Tabelle.
    - **Notification:** Ein Supabase-Webhook auf `INSERT` in der `st_leads`-Tabelle triggert einen n8n-Workflow, der eine sofortige Benachrichtigung via Telegram an den User sendet.
- **Deployment Preflight Skill (Release-Gate):** Vor jedem `git push` wird ein dedizierter `/deployment` Skill ausgeführt. Dieser agiert als Release-Gate und führt eine standardisierte Checkliste aus (z.B. `git status`, `npm run build`, Netlify-spezifische Header- und Redirect-Prüfungen). Ein Deploy darf nur erfolgen, wenn dieser Preflight-Check erfolgreich ist.
- **Wiederverwendbare Build-Skripte:** Für skalierbare Content-Erstellung (z.B. pSEO-Seiten) wird ein Muster aus wiederverwendbaren Node.js-Skripten (`build_pages.mjs`) etabliert. Diese Skripte nehmen rohe Content-Dateien als Input und generieren vollständige, deploybare HTML-Seiten, indem sie diese mit Templates (Nav, Footer, JSON-LD etc.) wrappen.
- **AI UGC Reel-Workflow (profilfoto-ki):**
    - Der gesamte Prozess ist im globalen, produktionsbereiten **`ai-ugc` Skill** gekapselt.
    - **7-Phasen-Workflow:** RAG Boot → Ideation → Nano Banana (Frames) → Veo / OmniHuman (Video) → Whisper (Captions) → Remotion (Compositing) → Metrics (Feedback Loop).
- **Veo Prompting-Struktur (JSON):** Für maximale Kontrolle wird ein strukturiertes JSON-Format für den Prompt verwendet. Dialog-Text wird ohne Satzzeichen (insbesondere ohne Punkte am Ende) übergeben, um ein abruptes Ende der Sprachausgabe zu vermeiden.
- **Nano Banana Prompting-Struktur (JSON):** Für maximale Kontrolle und zur Vermeidung von Fehlern (z.B. ungewolltes Lächeln) wird ein striktes JSON-Format für den Prompt verwendet. Ein `Facial_Expression`-Block mit einem `Restrictions`-Array (z.B. `["NO smile", "NO smirk"]`) ist Pflicht.

### Infrastruktur & Setup
- **Claude Code Engine (`C:\Users\User\.claude\`):** Der System-Ordner, der die Claude-Installation, `settings.json`, globale Skills, Plugins und Sessions enthält. Dieser Bereich wird von Claude Code verwaltet und sollte nicht manuell verändert werden.
- **CLAW Brain (`C:\Users\User\Claude\`):** Das Steuerungs-Zentrum. Enthält globale Anweisungen (`MASTER.md`, `SOUL.md`), das Gedächtnis (`/topics`), zentrale Skripte (`/scripts`) und die Projekt-Workspaces.
- **Knowledge Vault (`C:\Users\User\obsidian-claw-vault\`):** Der zentrale, menschenlesbare Wissensspeicher, der als "Source of Truth" für das gesamte System dient.
- **Projekt-Workspaces (in `C:\Users\User\Claude\`):** Projekt-spezifische Verzeichnisse (`C:\Users\User\Claude\[projekt-name]\`). Jeder Ordner enthält eine eigene `CLAUDE.md`, die den spezifischen Kontext (Repo, Topic-Datei, Skills) für den Chat lädt. Der `Open Claw`-Workspace ist ein spezieller Workspace *ausschließlich* für die projektübergreifende Orchestrierung.
- **Code Repositories (`C:\Users\User\Projects\`):** Der Antigravity-Workspace, der die eigentlichen Git-Repositories der Projekte enthält.
- **Datenbanken (Supabase - Projekt "NanoBanana"):**
    - **n8n GSC Pipeline (Schema `public`):** Sammelt GSC-Daten für SEO-Analysen. Enthält `gsc_history`, `gsc_daily_summary` und `gsc_queries`.
    - **CLAW System (Schema `claw` & `public`):** Beherbergt das Systemgedächtnis (`claw.memories_user`), das jetzt auch die Wiki-Embeddings enthält, das Aktivitäten-Log (`claw.activity_log`), die Task-Queue (`public.claw_webhook_queue`), Projekt-Registry (`claw.projects`) und Tracking-Tabellen (`public.claw_processed_sessions`).
    - **LinkedIn Content (Schema `claw`):** `claw.linkedin_posts` speichert alle vom Agenten veröffentlichten Posts für zukünftige Stil-Referenzen.
    - **Lead Capture (Schema `public`):** `st_leads` speichert zentral alle Anfragen von `st-automatisierung.de`.

### Content-Strategie profilfoto-ki
- **Zielplattformen:** Instagram Reels + TikTok (15-30 Sekunden)
- **Themen:** Dating, Karriere, Social Media (z.B. Follower-Wachstum), Online 1. Eindruck — NICHT nur Bewerbungsfotos. Kern-Thema: "Wie andere Menschen dich online wahrnehmen — bevor du ein Wort sagst."
- **Psychologie:** Nutzt gezielt psychologische Trigger wie "Loss Aversion" oder "Identitäts-Trigger".
- **Charakter-Konsistenz:** Eine "Character Bible" (Referenzbild + Beschreibung) stellt sicher, dass der Host über alle Reels hinweg wiedererkennbar bleibt.
- **Hook-Regel:** Darf die implizite Frage nicht selbst beantworten (Curiosity Gap). Ein "Vergiss X, hier ist Y"-Hook ist eine Werbeformel und führt zum sofortigen Abbruch.
- **Overlay-Regel:** Kein Fullscreen-Overlay in den ersten 3 Sekunden. Die Person muss ab Frame 0 voll sichtbar sein.
- **Sprachniveau:** Skripte müssen maximal einfach und verständlich sein ("Grundschüler-Test").
- **Hard Rule:** Wenn Safak Tepecik exakte Formulierung vorgibt → 1:1 übernehmen, nicht umschreiben.
- **Hard Rule:** LinkedIn-Content wird vermieden (passt nicht zur Reel-Energie).
- **Content-Fokus:** Themen-Content, nicht Produkt-Content.

### Offene Punkte
- **[System-Architektur]** Die `/wiki:*` Skills (query, ingest, research) des `nvk/llm-wiki` Frameworks aktiv nutzen und testen, um den Wissens-Workflow (z.B. für Deep Research) zu etablieren.
- **[System-Architektur]** Den Obsidian Graph-View und `/wiki:lint` nutzen, um die Qualität des Wissensgraphen zu verbessern (verwaiste Notizen, defekte Links finden).
- **[System-Optimierung]** OCR-Funktionalität (z.B. via tesseract) implementieren, um gescannte, bildbasierte PDFs (z.B. `Strategic_Agriculture_Intelligence.pdf`) für das Wiki lesbar zu machen.
- **[st-auto-seo]** Den "Stage 0" (Authority Tracking) im Skill explizit als "ruhend / Zukunftsthema" markieren, um Fehlinterpretationen durch den Agenten zu vermeiden.
- **[st-automatisierung]** Beheben der Keyword-Kannibalisierung (4 nicht-indexierte Seiten im AI Act & BAFA Cluster durch gezielte Content-Schärfung und ggf. 301-Redirects).
- **[st-automatisierung]** Backlink-Strategien (Recherchescout, AI Stock Photo Hack) umsetzen.
- **Befüllen der 8 verbleibenden leeren `SKILL.md`-Dateien** für die registrierten Scheduled Tasks (LinkedIn, SEO-Loops).
- Erstellen der fehlenden Scheduled Tasks (`seo-loop-profilfoto-ki`, `seo-loop-<BUSINESS_EXAMPLE>`, `ai-ugc-pipeline`).
- Manueller Test und Aktivierung des `morning-catchup` Agenten im `Open Claw` Workspace.
- **[profilfoto-ki]** Echte AGB-Seite (`/agb`) erstellen und veröffentlichen (Voraussetzung für TikTok Production-Review).
- **[profilfoto-ki]** 11 fehlende, spezialisierte Hero-Bilder für pSEO-Seiten generieren (Prompts sind in `hero-image-prompts.md` vorbereitet) und im Code einbinden.
- **[profilfoto-ki]** Den abgebrochenen, vollumfänglichen Design- und Accessibility-Audit (alle 64 Seiten) wieder aufnehmen und abschließen.
- **[profilfoto-ki]** 20+ Beispielbilder auf `/ratgeber/coole-profilbilder/` einfügen, um den Image-Intent zu bedienen.
- **[profilfoto-ki]** Striking-Distance Keywords pushen: "bewerbungsfoto 2026" (Pos 11.5), "ki profilbilder" (Pos 11.9), "profilfoto" (Pos 14.9).
- **[profilfoto-ki]** `aggregateRating` Schema.org Markup implementieren.
- **[profilfoto-ki]** Image SEO umsetzen (Alt-Tags, Image Sitemap, WebP).
- **[profilfoto-ki]** Systematische interne Verlinkung nach Hub & Spoke Modell aufbauen.
- **[profilfoto-ki]** UTF-8 Encoding Bug prüfen.
- Automatisierung des Performance-Feedback-Loops (Instagram API → n8n → Supabase; GSC-Impact-Analyse nach 2 Wochen).
- Implementierung des LinkedIn-Performance-Feedback-Loops (benötigt `r_member_social` Scope für Analytics).
- Aktivierung des Telegram Gateways (Token und User-ID sind konfiguriert, Bot muss nur gestartet werden).











### Session Update (2026-04-19)
- Implementierung einer Remotion Master-Demo-Video-Pipeline, die 37 Remotion-Regeln in 8 Szenen demonstriert.
- Integration von 3D (Three.js), Spring-Animationen, Typografie, Light Leaks, verschiedenen Asset-Typen (Images, Videos, GIFs, Lottie, Shapes, Transparent), Audio-Visualisierung (Spectrum Bars, Waveform, SFX/Voiceover/Silence/FFmpeg Labels), Captions (Word-by-word Reveal), Data-Visualisierung (Bar/Line/Pie Chart + Map), Video-Analyse (Mediabunny), Composition (Zod Schema + Live Preview Split-Screen) und globalen Elementen (Progress-Bar, Brand-Badge).
- Nutzung von ElevenLabs für Voiceover-Integration (als Placeholder).

### Session Update (2026-04-19)
- Claude Design kann zur Generierung von Motion-Graphics-Komponenten (z.B. Loading-Spinner, Metric-Cards) als React-Code genutzt werden, die dann als Remotion-<Sequence> in den AI-UGC-Stack integriert werden können.
- CLAW kann diese Motion-Graphics-Komponenten direkt im Chat als Remotion-Code erstellen, ohne die Claude Design Web-UI zu benötigen.
- Es ist geplant, eine `src/motion-graphics/` Bibliothek mit wiederverwendbaren, parametrisierbaren Remotion-Komponenten (z.B. NumberCount, MetricCard, StackedPillReveal, LoadingSpinner (Globe), TypewriterText, KenBurns, LogoStinger) zu erstellen.
- Die neue Motion-Graphics-Bibliothek wird im `ai-ugc` Skill registriert, um deren Nutzung durch den Daily Agent zu ermöglichen.

### Session Update (2026-04-19)
- TikTok Content Posting API: FILE_UPLOAD funktioniert für beliebige lokale Dateien.
- TikTok Content Posting API: PULL_FROM_URL nur von verifizierten Domains (`profilfoto-ki.de`), nicht von Supabase.
- TikTok Content Posting API: Scope `video.upload` nutzt Endpoint `/v2/post/publish/inbox/video/init/` (für Drafts/Inbox).
- TikTok Content Posting API: Scope `video.publish` nutzt Endpoint `/v2/post/publish/video/init/` (für Direct Post, erfordert Production Review).
- TikTok Sandbox Content Posting API liefert echte Videos an Target-User-Inboxes.

### Session Update (2026-04-18)
- Nano Banana wurde erfolgreich für die Generierung eines photorealistischen Makro-Assets (Kupfer-Stecker) eingesetzt und in ein Webseiten-Hero integriert.

### Session Update (2026-04-17)
- Die Integration von 'Granola' (Meeting-Transkripte), Gmail/Calendar und NotebookLM als kontextuelle Recherche-Quellen für Präsentationen und Outreach-Skills wurde als Möglichkeit identifiziert.
- Prompt-Methodiken wie 'Spin up sub-agents and fact-check the research', 'Text download on all sources' und 'Lead with metaphors when designed' können direkt in die 'Generate'-Phase von Design-Skills integriert werden, um Qualität und Transparenz zu erhöhen.

### Session Update (2026-04-17)
- Die Integration von `Granola` (Meeting-Transkripte), `Gmail/Calendar` und `NotebookLM` als kontextuelle Recherche-Quellen wurde als Erweiterung für `linkedin-content` und Outreach-Skills identifiziert, um relevantere und personalisierte Inhalte zu generieren.

### Session Update (2026-04-16)
- Die Nutzung von Google Maps/Street View-Bildern für KI-Generierung oder -Bearbeitung ist durch die Google Maps Platform Terms untersagt.
- Legale Alternativen für KI-Bildbearbeitung sind Kunden-Uploads eigener Fotos oder lizenzierte Satellitenbilder von Drittanbietern (Mapbox, Maxar, Nearmap).

### Session Update (2026-04-14)
- Die `ai-ugc-pipeline` ist als fehlender Task identifiziert, der noch erstellt werden muss (aus dem jeweiligen Projekt-Chat).

### Session Update (2026-04-14)
- Remotion kann komplette Projekte aufsetzen, Motion Graphics, Text-Animationen, Transitions, Overlays als React-Code schreiben, Assets einbinden, parametrisierbare Templates mit Zod-Schema bauen und den Render-Befehl ausführen.
- Remotion kann keine AI-generierten Videoclips erstellen (hierfür sind separate Tools wie Veo, Kling, Seedance nötig).
- Remotion hat eine eingebaute ElevenLabs-Integration, um Voiceover zu generieren und die Videolänge dynamisch an die Audiolänge anzupassen.

### Session Update (2026-04-12)
- Kling 3.0 ist die bevorzugte Wahl für Multi-Character Dialog (3+ Personen), Product Shots/B-Roll/Orbit, Rapid Prototyping, Multilingual/Dialekte, Custom Multi-Shot (bis 6 Shots) und First Frame + Last Frame Interpolation.
- Seedance 2.0 ist die bevorzugte Wahl für Template-basiertes Arbeiten, Multimodale Referenzen (Bilder, Videos, Audio), Broadcast-Qualität, komplexere Szenen und längere Dauer (bis 30s).
- Seedance 2.0 Omni-Modus unterstützt `@Audio1` für Lip-Sync mit hochgeladenen MP3-Dateien (max 15s, max 15MB) für präzise deutsche Voiceover-Synchronisation.
- Runway bietet keinen Audio-Upload als Referenz für Lip-Sync an.
- Workflows für deutschen Talking Head ohne native Audio-Referenz in Runway: 1. Dialog direkt in Quotes (Qualität variiert), 2. Post-Production Lip-Sync mit externen Tools wie Sync Labs oder Hedra.

### Session Update (2026-04-12)
- Die Pipeline `Nano Banana → Startframe → Seedance I2V` wird als bewährter Prozess für die Erstellung fotorealistischer Startbilder für Seedance-Videos bestätigt und angewendet.
