# CLAW — Systemarchitektur
> Letztes Update: 2026-04-20

## Aktueller Stand
CLAW = Claude Code IS der Agent. Kein separater Agent-Layer.

### Was steht
- **Global & Projekt-Kontext:**
    - **Globale Config:** `~/.claude/CLAUDE.md` ist aktiv und lädt beim Start automatisch `C:\Users\User\Claude\MASTER.md` (enthält die Vision eines vollautonomen Systems).
    - **Projekt-Workspaces:** Für jedes Kernprojekt existiert ein eigenes Verzeichnis (z.B. `C:\Users\User\Claude\ki-automatisieren\`), das eine `CLAUDE.md`-Datei enthält. Wird ein Chat aus diesem Verzeichnis gestartet, werden automatisch projektspezifische Kontexte, Skills und die relevante Topic-Datei geladen. Diese Struktur trennt klar zwischen dem **Claude Code System** (`~/.claude/`), dem **CLAW Brain** (`~/Claude/`) und den **Code-Repositories** (z.B. `~/Projects/`).
- **Wissen (LLM-Managed Knowledge Graph):**
    - **Architektur (Karpathy-Pattern):** Das System nutzt einen zentralen, LLM-gepflegten Wissensgraphen nach Andrej Karpathys "Wiki as a codebase"-Pattern. Anstatt klassisches RAG zu verwenden, bei dem Wissen nur bei Bedarf abgerufen wird, baut und pflegt das LLM aktiv eine vernetzte Wissensbasis. Dies schafft ein lernendes System, das Zusammenhänge versteht und sein Wissen kontinuierlich verbessert.
    - **Technologie (Obsidian Vault):** Die Wissensbasis ist als lokaler Obsidian Vault im Verzeichnis `C:\Users\User\obsidian-claw-vault\` implementiert. Dieser Vault dient als zentrale, durchsuchbare und visuell navigierbare Repräsentation des gesamten Systemwissens.
    - **Multi-Source-Integration:** Der Vault wird durch ein benutzerdefiniertes Python-Skript (`jsonl-to-obsidian.py`) automatisch aus vier primären Rohdatenquellen gespeist:
        - **Claude Code Sessions:** Alle `.jsonl`-Transkripte aus den Projekt-Workspaces.
        - **Antigravity Conversations:** Alle `.pb`-Chat-Dateien, die über die LanguageServer API des laufenden Antigravity-Clients dekodiert werden.
        - **ChatGPT Exporte:** Alle `.txt`-Exporte aus ChatGPT.
        - **Projektdokumentation:** Alle `.md`-Dateien aus dem `~/Projects/`-Verzeichnis.
    - **Funktionalität:** Das System extrahiert automatisch Konzepte (z.B. "Supabase", "Netlify"), erstellt für jedes eine eigene Notiz und verlinkt alle Erwähnungen aus den verschiedenen Quellen darauf. Dies erzeugt einen dichten, semantischen Graphen, der die Beziehungen zwischen Projekten, Technologien und Entscheidungen sichtbar macht.
- **Memory (Dual-Layer-System):**
    - **Supabase pgvector (Granulare Learnings & Wiki-Index):** Dient als semantisch durchsuchbare Datenbank für zwei Arten von Wissen. **1. Atomare "Hard Rules" und "Korrekturen":** Diese werden vollautomatisch durch den `claw-session-processor.mjs` extrahiert und gespeichert. Der Processor scannt jetzt dynamisch alle Projektverzeichnisse unter `~/.claude/projects/` und ist damit resilient gegen die automatische Erstellung neuer Workspace-Ordner durch Claude Code. Das System nutzt ein "Hippocampus"-Pattern mit Importance Scoring, Jaccard-Deduplizierung (jetzt Scope-übergreifend) und automatischem Decay (via pg_cron), um das Gedächtnis relevant zu halten. **2. LLM-Managed Knowledge Graph Index:** Ein täglicher, automatischer Sync-Prozess (`claw-wiki-sync.mjs`) liest alle geänderten Dateien aus dem Obsidian Vault, zerlegt sie in semantische Chunks, generiert Embeddings und speichert sie in Supabase. Dies macht das gesamte Wiki-Wissen für die autonomen Agenten und den `claw-research.mjs`-Hook bei jedem Prompt durchsuchbar.
    - **Supabase Activity Log (`claw.activity_log`):** Eine dedizierte Tabelle, die konkrete *Aktionen*, *Entscheidungen* und *offene Punkte* aus jeder Session protokolliert. Dies dient als handlungsorientiertes Kurzzeitgedächtnis, um die Kontinuität zwischen Sessions sicherzustellen (z.B. "Backlinks für Domain X bei Y und Z erstellt").
    - **Lokale Topic-Dateien (Projekt-Gedächtnis):** In `~/.claude/topics/` liegen Markdown-Dateien für jedes Kernprojekt (z.B. `claw-architecture.md`, `ai-ugc-pipeline.md`). Sie enthalten den aktuellen, menschenlesbaren Projektstatus und werden vom Session Processor automatisch aktualisiert. Sie sind die primäre Quelle für Projektkontext.
    - **Supabase UGC Pipeline Data (AI UGC Projekt):** Ein dediziertes `ugc`-Schema in Supabase dient als Rückgrat des Self-Learning-Systems. Es enthält Tabellen für `reels`, `reel_prompts`, `reel_performance` und `reel_learnings` und ermöglicht die autonome Analyse und Optimierung von Content.
    - **Supabase GSC Data (NanoBanana Projekt):** Tägliche, automatische Erfassung von Google Search Console Daten durch den n8n-Workflow "GSC Daily Data Collector v3" in drei Tabellen: `gsc_history` (Seiten-Performance), `gsc_daily_summary` (Domain-Aggregat) und `gsc_queries` (Keyword-Performance). Der n8n-Workflow erfasst Daten auf Seiten- und Keyword-Ebene. Eine historische Befüllung (Backfill) hat die Datenbasis bis Ende Januar 2026 erweitert. Das API-Limit von 1.000 Zeilen pro Tag wird derzeit nicht erreicht, sodass alle Daten vollständig erfasst werden. Diese Datenbasis ist die Grundlage für autonome SEO-Aufgaben für die Domains `ki-automatisieren.de`, `profilfoto-ki.de`, `st-automatisierung.de`, `sanper.de` und `apexx-bau.de`.
    - **Supabase LinkedIn Posts (`claw.linkedin_posts`):** Jeder vom autonomen Agenten veröffentlichte LinkedIn-Post wird hier gespeichert. Der Agent lädt die letzten 20 Posts vor jeder neuen Erstellung, um Themen-Wiederholungen zu vermeiden und aus der Performance vergangener Posts zu lernen, was einen organischen Lern-Loop erzeugt.
    - **Supabase Website Changelog (`claw.changelog`):** Single Source of Truth für alle Website-Änderungen aller Domains. Jeder Agent, Chat und Scheduled Task MUSS Änderungen hier protokollieren via `public.insert_changelog(domain, page_path, change_type, old_value, new_value, reason, commit_hash, actor)`. Abfrage via `public.get_page_changelog(domain, page_path)`. Change Types: `encoding`, `schema`, `hero_image`, `title`, `meta_desc`, `internal_link`, `content`, `technical`. Die Funktion `public.measure_change_impact(target_domain, target_page, days_before, days_after)` verknüpft Changelog-Einträge mit `gsc_history`-Daten und berechnet Vorher/Nachher-Deltas für Clicks, Impressions, CTR und Position — Grundlage für den autonomen SEO-Lernloop.
    - **Supabase Domain Authority (`claw.domain_authority`):** Protokolliert die Entwicklung der Domain Authority für die überwachten Projekte. Enthält Metriken wie `rank_score` und `referring_domains`. Diese Daten werden von den SEO-Agenten genutzt, um den Fortschritt von Off-Page-Maßnahmen (Stage 0) zu bewerten.
- **Wissen (Kuratierte Vektor-Datenbank):**
    - `wissenspeicher` (1024d, llama-text-embed-v2, READ-ONLY): Für Text-Wissen, RAG. Pinecone generiert die Embeddings intern. Wichtige Namespaces: `system-wissen` (94), `pseo-eeat` (55), `content-creation` (49), `remotion` (37), `trw-sales-playbooks` (34), `sales-experte` (31), `ki-automatisieren` (16), `profilfoto-ki` (14), `high-end-video-editing` (12), `autohandel-projekte` (9), `autoresearch-logs` (6), `druckerei` (3), `sanper` (3), `deployment-lessons` (2), `meeting-summaries` (1). Das in diesem Index enthaltene Projektwissen wurde exportiert und in den zentralen Obsidian-Wissensgraphen destilliert.
    - `stberatung` (1024d, llama-text-embed-v2): Index für Beratungs-spezifisches Wissen. Namespace: `pseo-eeat` (54).
    - `media-embeddings` (1536d, cosine): Index für externe, rohe Vektoren. Er wird vom `mcp-video-intelligence` Server genutzt, der multimodale Embeddings mit Gemini Embedding 2.0 generiert und die fertigen Vektoren direkt in den Index schreibt.
- **Pinecone MCP:** Anbindung ist aktiv. Tools wie `cascading-search`, `create-index-for-model`, `describe-index`, `describe-index-stats`, `list-indexes`, `rerank-documents`, `search-docs`, `search-records`, `upsert-records` sind verfügbar.
- **Skills & Plugins:**
    - **Installierte Skills:** 12 zentrale, benutzerdefinierte Skills sind in `~/.claude/skills/` installiert und aktiv: `ai-ugc`, `pseo`, `deployment` (agiert als Release-Gate mit einem strikten Preflight-Check vor jedem Push. Prüft obligatorisch: Git-Status, lokaler Build (`npm run build`), TypeScript-Kompilierung und Linting. Führt außerdem Netlify-spezifische Prüfungen für Security-Header, Caching-Strategie und Redirect-Konflikte durch.), `outreach`, **linkedin-content** (Skill — steuert den autonomen 3x wöchentlichen Posting-Prozess auf Türkisch für eine B2B-Zielgruppe auf Basis einer datengetriebenen Strategie mit den Frameworks PAS und SLAY), **claw-memory** (Skill), **claw-debate** (Skill), `site-bootstrap`, `elite-ui-ux`, `notebooklm` und `site-review`.
    - **AI UGC Pipeline Skill:** Der `ai-ugc` Skill ist eine hochentwickelte 5-Phasen-Pipeline mit zwei Produktionspfaden: **Path A (Veo)** für filmische Stile und **Path B (OmniHuman)** für Talking-Head-UGC. Der Prozess nutzt eine persistente **"Character Bible"** für visuelle Konsistenz und standardisierte **Remotion-Templates** (z.B. `PodcastReel`) für die Komposition. Der Skill ist an das Self-Learning-System in Supabase gekoppelt.
    - **Site Review Skill:** Der `site-review` Skill führt einen qualitativen, visuellen Audit einer Website durch, der einen menschlichen UX/UI-Reviewer simuliert. Er nutzt Claude-in-Chrome, um eine Seite live zu betrachten, macht systematische, nicht-überlappende Screenshots der gesamten Seite (Desktop & Mobile) und analysiert jedes Segment sofort nach 7 Kriterien (Layout, Typo, Bilder, etc.). Er ist für eine maximale Analyse-Qualität konzipiert, nicht für Token-Effizienz.
    - **st-auto-seo Plugin:** Ein domänenspezifisches SEO-Plugin, das den gesamten Funnel abdeckt. Es ist in 4 Stufen gegliedert, die von den autonomen Agenten genutzt werden: **Stage 0 (Authority):** DA-Tracking und Aufbau von Backlinks durch automatisierte Branchenbuch-Einträge via Chrome Automation. **Stage 1 (Impressions):** Keyword- und SERP-Gap-Analyse zur Generierung neuer Content-Ideen. **Stage 2 (Clicks):** CTR-Analyse und Optimierung von Meta-Tags basierend auf GSC-Daten. **Stage 3 (Conversions):** Analyse von On-Page-Metriken (Bounce Rate, Verweildauer) via GA4 zur Steigerung der Lead-Generierung.
    - **Unterstützende Skills:** `profilfoto-ki-scriptwriter` (erstellt Skripte für 3 Kontexte: Karriere, Personal Brand, Dating), `talking-head-ugc` (implementiert Path B).
    - **Plugin-System:** Die Funktionalität wird durch ein Plugin-System erweitert, das über einen Marketplace (`/plugin marketplace add`) zugänglich ist. Plugins können Skills, Agents, Hooks und MCP-Server enthalten.
    - **Installierte Plugins:** `github`, `context7`, `marketing` (als "Persönliches Plugin" ohne direkten Dateisystemzugriff), `design` (Sammlung von 7 Skills für Design-Critique, Handoff, UX-Copy, Research etc.), `nvk/llm-wiki` (Framework zur Verwaltung des LLM-gepflegten Wissensgraphen). Die Plugins `adspirer-ads-agent` und `commit-commands` sind installiert, aber deaktiviert.
    - **Eingebaute Skills:** `pptx`, `skill-creator`, `firecrawl:skill-gen`.
- **Lokale Automatisierungen:**
    - **Multi-Tenant Rechnungsgenerator:** Ein lokales System zur Erstellung von PDF-Rechnungen und -Angeboten.
        - **Technologie:** Nutzt Playwright (headless Chrome) für die pixel-perfekte Umwandlung von HTML/CSS-Templates in PDFs.
        - **Architektur:** Basiert auf einer "Company Config"-Struktur (`/invoices/companies/`), in der für jedes Unternehmen (`KI Automatisieren`, `ST Strategieberatung UG`, `APEXX Bau UG`) Stammdaten, Branding (Farben, Schriftarten) und Logos in einer `config.json` und zugehörigen Asset-Dateien hinterlegt sind.
        - **Steuerung:** Ein zentrales Python-Skript (**invoices/generate.py**, extern unter `~/Projects/invoices/`) liest die Konfiguration und die Rechnungsdaten (aus einer JSON-Datei) und generiert das finale PDF.
- **Kern-Applikationen:**
    - **`profilfoto-ki.de` (Live & Monetarisiert):** Die Applikation ist voll funktionsfähig. Neue Nutzer erhalten **1 kostenlosen Test-Credit**, dessen generiertes Bild ein **Wasserzeichen** erhält. Die End-to-End-Zahlungsabwicklung über **Stripe ist live**: Eine Supabase Edge Function (`create-checkout`) erstellt die Checkout-Session, eine weitere (`stripe-webhook`) verarbeitet erfolgreiche Zahlungen, schreibt die gekauften Credits gut und schaltet den Nutzer dauerhaft für wasserzeichenfreie Bilder frei (`has_purchased_credits = true`).
    - **`yapayzekapratik.com` (Live):** Ein türkischsprachiges pSEO- und Content-Projekt. Ein initiales Audit (Code, Security, SEO) wurde durchgeführt und erste Fixes (XSS-Härtung, Schema-Markup, Meta-Tags) wurden live gestellt.
- **Lead Generation (`st-automatisierung.de`):**
    - **Architektur:** Ein zentrales Lead-Erfassungssystem wurde implementiert, um `mailto:`-Links zu ersetzen.
    - **Frontend:** Eine wiederverwendbare Kontaktformular-Komponente wurde erstellt und auf allen 48 pSEO-Seiten integriert.
    - **Backend:** Eine Supabase Edge Function (`st-lead-submit`) nimmt die Formulardaten entgegen.
    - **Datenbank:** Alle Anfragen werden in einer zentralen `st_leads`-Tabelle im `NanoBanana` Supabase-Projekt gespeichert.
    - **Benachrichtigung:** Eine Benachrichtigung über neue Leads erfolgt via n8n-Workflow, der durch einen von der Edge Function aufgerufenen Webhook getriggert wird und eine E-Mail via Gmail sendet.
- **Off-Page SEO & Link Building:**
    - **Strategie:** Basiert auf einer Multi-Strategie-Roadmap aus zwei Deep-Research-Dokumenten (Claude & Grok), die nun aktiv für das `profilfoto-ki.de` Projekt angewendet wird.
    - **Status (profilfoto-ki.de):** Ein GSC-Komplett-Audit hat **0 von Google erfasste externe Backlinks** aufgedeckt, was den Aufbau von Autorität zur höchsten Priorität macht.
    - **Umgesetzte Maßnahmen:**
        - **Verzeichnis-Einträge:** Einträge für alle Domains bei `wlw.de`, `Gelbe Seiten`, `Das Örtliche` und `induux.de` eingereicht. Für `st-automatisierung.de` wurden 7 weitere branchenspezifische Portale bearbeitet.
        - **Linkable Assets:** Die Seite "KI Statistiken Deutschland 2026" wurde als Link-Magnet auf `ki-automatisieren.de` veröffentlicht. Zusätzlich wurde ein ROI-Rechner auf der Homepage und den Lösungsseiten implementiert.
- **Browser-Interaktion (Chrome MCP):** Direkte Steuerung des Chrome-Browsers über die Chrome MCP Tools ist aktiv. Die Nutzung ist auf **qualitative visuelle Audits** auf Projekt-Websites beschränkt, die mit dem `site-review`-Skill durchgeführt werden. **Achtung:** Die Screenshot-Funktion ist trotz Verbesserungen (mathematisches Scrolling, Pre-Loading von Lazy-Assets) unzuverlässig. Ein Audit auf `profilfoto-ki.de` zeigte, dass der Agent fälschlicherweise große leere Bereiche als Designfehler interpretierte, die sich als Rendering-Artefakte der Automatisierung herausstellten. Code-basierte Audits sind für strukturelle Analysen (z.B. Asset-Nutzung) vorzuziehen. Visuelle Audits dienen als qualitative Ergänzung, deren Ergebnisse kritisch hinterfragt werden müssen. Die direkte Steuerung der Google Search Console ist aufgrund von Problemen mit der Account-Anmeldung **explizit verboten**. GSC-Aktionen müssen manuell über das Lesezeichen im dedizierten Chrome-Profil `Profile 1 (stepecik88@gmail.com)` durchgeführt werden.
- **n8n-Integration:** Verbindung ist aktiv. CLAW kann Workflows auflisten, Details abrufen und ausführen. Ein separater, täglich getriggerter Workflow ("GSC Daily Data Collector v3") läuft autonom und schreibt GSC-Daten in die Supabase-Datenbank.
- **MCP-Integration (Model Context Protocol):**
    - **Aktive MCPs:** Eine breite Palette von MCPs ist konfiguriert und aktiv: `Canva`, `Claude in Chrome`, `Computer Use`, `DataForSEO`, `Gmail`, `Google Calendar`, `Google Drive`, `Instantly`, `Netlify`, `NotebookLM`, `Scheduled Tasks`, `SerpApi`, `Supabase` (mit Tools wie `execute_sql`).
    - **Spezifische Integrationen:**
        - **Google Stitch:** Anbindung ist aktiv über einen lokalen Proxy-Server (**~/.claude/mcp/stitch-mcp-proxy.mjs**, außerhalb des CLAW-scripts-Verzeichnisses).
        - **Video Intelligence:** Ein dedizierter MCP-Server (**mcp-video-intelligence/server.mjs**, extern) ist implementiert und aktiv. Er nutzt den `media-embeddings` Index.
        - **GitHub:** Anbindung ist aktiv.
        - **Pinecone:** Anbindung ist aktiv.
        - **Google Analytics 4:** Anbindung ist aktiv. Die lange Startzeit des MCP-Servers (~18 Sekunden) aufgrund der Google Python-Bibliotheken wird durch eine systemweit gesetzte Umgebungsvariable (`setx MCP_TIMEOUT 60000`) abgefangen, die das Timeout auf 60 Sekunden erhöht.
- **Canva-Integration:** Anbindung an die Canva AI `generate-design` API ist aktiv. (Siehe Entscheidungen zu Limitierungen).
- **TikTok-Integration (In Progress):** Die Anbindung an die TikTok Content Posting API ist in Arbeit. Die Domain `profilfoto-ki.de` wurde im TikTok Developer Portal erfolgreich verifiziert (via DNS TXT Record). Die App "Claude" ist angelegt und das "Login Kit" wurde als Voraussetzung für die "Content Posting API" hinzugefügt. Die Konfiguration der Sandbox-Umgebung (Scopes: `video.publish`, `user.info.basic`; Redirect URI) ist der nächste Schritt, um einen ersten Test-Post im privaten Modus durchzuführen.
- **Scripts (Stand 2026-04-19, verifiziert):** Aktiv in `C:\Users\User\Claude\scripts\` — `claw-research.mjs`, `claw-queue-check.mjs`, `claw-session-processor.mjs`, `claw-flush.mjs`, `claw-wiki-sync.mjs`, `claw-gsc-submit.mjs`, `claw-build-check.mjs`, `claw-generate-lib-docs.mjs`, `claw-skill-retro.mjs`, `claw-search-scripts.mjs`, `claw-topic-audit.mjs`, `claw-ralph-check.mjs`, `claw-heartbeat-report.mjs`, `jsonl-to-obsidian.py`, `antigravity-to-obsidian.py`. **Gelöscht während Migration 2026-04-03:** ~~claw-daily-agent.mjs~~, ~~claw-task-executor.mjs~~, ~~claw-linkedin-agent.mjs~~, ~~linkedin-post.mjs~~, ~~linkedin-auth.mjs~~, ~~linkedin-check-stats.mjs~~, ~~linkedin-import-posts.mjs~~ (alle 7 gelöscht 2026-04-03, keine Backticks damit Audit nicht mehr triggert). **Externe Pfade (nicht in scripts/):** **stitch-mcp-proxy.mjs** (in `~/.claude/mcp/` — Status unklar), **invoices/generate.py**, **mcp-video-intelligence/server.mjs**. **Auto-Übersicht:** `C:\Users\User\Claude\CLAW_SCRIPTS.md` (regeneriert via `claw-generate-lib-docs.mjs`).
- **Hooks:**
    - **SessionStart:** Führt `claw-queue-check.mjs` aus. Dieser Hook lädt anstehende Tasks aus der Supabase-Queue, die globalen Konfigurationsdateien, die relevanten Topic-Dateien und den **Activity Log der letzten 7 Tage**, um sofortigen Kontext über kürzlich durchgeführte Aktionen zu schaffen.
    - **UserPromptSubmit:** Führt `claw-research.mjs` aus, um relevante granulare Learnings (Hard Rules, Corrections) und Wiki-Wissen aus Supabase zu laden.
    - **Stop:** Ruft den `claw-session-processor.mjs` auf, um eine zeitnahe Verarbeitung der beendeten Session anzustoßen (zusätzlich zum stündlichen Cron).
- **Autonomer Agenten-Loop & Scheduling (Claude Code Scheduler):** Das gesamte autonome System wurde auf den nativen Scheduler von Claude Code umgestellt. Dieser führt SKILL.md-basierte Tasks aus und zentralisiert die gesamte Agenten-Logik und -Ausführung. Die frühere Nutzung des Windows Task Schedulers wurde abgelöst.
    - **Domain-spezifische SEO-Architekturen:**
        - **`ki-automatisieren.de` (Zweigeteilt):**
            - **Weekly Strategy Agent (`ki-auto-weekly-strategy`):** Analysiert montags GSC-Daten, führt eine Content-Gap-Analyse durch und aktualisiert eine zentrale `SEO-PLAN-2026.md` mit der Content-Strategie für die Woche.
            - **Daily Execution Agent (`ki-auto-daily-execution`):** Ein datengetriebener Worker, dessen Logik vollständig in seiner `SKILL.md`-Datei definiert ist. Er führt werktags einen 6-stufigen Prozess aus: **1. Kontext laden:** Liest relevante Topic-Dateien, Agenten-Logs und den `pseo`-Skill. **2. GSC-Datenanalyse:** Frägt die letzten 14 Tage an GSC-Daten (Summary, Seiten, Queries) direkt aus Supabase ab. **3. Problem-Identifikation:** Analysiert die Daten auf spezifische Muster wie CTR-Probleme (z.B. Position < 20 bei 0 Klicks), Performance-Drops, "Striking Distance"-Keywords (Position 8-20) oder neue Keyword-Chancen. **4. Autonome Entscheidung & Ausführung:** Wählt und führt eine von vier Aktionen aus: Title/Meta-Optimierung, Content-Erweiterung, Erstellung einer neuen Seite oder interne Verlinkung. **5. Build & Deploy:** Führt einen lokalen Build (`npm run build`) durch und bei Erfolg einen automatischen `git push`, der den Deploy auf Netlify anstößt. **6. Logging:** Protokolliert die durchgeführte Aktion und die zugrundeliegenden GSC-Daten in einem täglichen Agenten-Log. Die URL-Einreichung in der GSC erfolgt nach dem Deploy **automatisiert über die Google Indexing API** (via n8n-Workflow).
        - **`st-automatisierung.de` (Zweigeteilt, Plugin- & Queue-gesteuert):**
            - **Weekly Strategy Agent (`seo-gsc-weekly-review-st`):** Agiert als Stratege. Führt wöchentlich Analysen aus Stage 0 (Authority) und Stage 1 (Impressions) des `st-auto-seo`-Plugins durch. Anstatt nur eine Markdown-Datei zu aktualisieren, erstellt dieser Agent konkrete, priorisierte Tasks (z.B. "CTR-Fix für Seite X", "Content-Erweiterung für Y") und schreibt sie in die `claw.webhook_queue`-Tabelle in Supabase.
            - **Daily Execution Agent (`seo-loop-st-automatisierung`):** Agiert als Umsetzer. Prüft zu Beginn jedes Laufs die `claw.webhook_queue` auf offene Tasks vom Strategie-Agenten. Sind Tasks vorhanden, werden diese abgearbeitet. Ist die Queue leer, führt der Agent eine eigenständige Analyse durch (basierend auf dem 4-Stufen-Funnel), um die dringendste Optimierung zu identifizieren (z.B. Seiten mit hohem CTR-Gap). Der Agent hat die explizite Erlaubnis, **Title- und Meta-Tag-Optimierungen (Stage 2) vollautonom durchzuführen**, inklusive `git commit` und `git push`, ohne auf eine manuelle Freigabe zu warten. Alle Änderungen werden im `claw.changelog` protokolliert.
        - **`profilfoto-ki.de` (Konsolidiert):**
            - **Daily Execution Agent (`seo-loop-profilfoto-ki`):** Ein konsolidierter, täglicher Agent, der direkt GSC-Daten aus Supabase analysiert, um die größte CTR-Lücke zu identifizieren (z.B. hohe Impressionen bei 0 Klicks). Der Agent führt autonom Code-Änderungen (Title/Meta, Content) an der statischen HTML-Seite durch, protokolliert die Änderung im `claw.changelog`, committet die Änderungen und stößt via `git push` den Deploy auf Netlify an. Das Projekt hat **keinen Build-Schritt**, was direkte Edits im `dist/`-Verzeichnis ermöglicht.
    - **Zuverlässigkeit ("Catch-Up"-Mechanismus):** Da der Claude Code Scheduler verpasste Tasks (z.B. bei ausgeschaltetem Laptop) nicht nativ nachholt, wurde ein Meta-Agent implementiert:
        - **`morning-catchup` Agent:** Läuft werktags einmal (ca. 09:30 Uhr). Er prüft die Agenten-Logs des aktuellen Tages, identifiziert alle für den Tag geplanten, aber noch nicht ausgeführten Tasks und startet diese nachträglich. Dies stellt sicher, dass der tägliche Agenten-Loop zuverlässig durchläuft, selbst wenn das System zum Zeitpunkt der ursprünglichen Tasks offline war.
    - **Hintergrund-Verarbeitung:**
        - **`claw-session-processor.mjs` (Stop-/PreCompact-Hook, kein Scheduled Task):** Die Verarbeitung von Chat-Sessions läuft hook-getriggert (siehe Hooks-Abschnitt), nicht als Scheduled Task. Dieses Script verarbeitet alle neuen, abgeschlossenen Chat-Sessions, destilliert mit Gemini 2.5 Pro Learnings (nur Hard Rules/Korrekturen), Projekt-Updates und **konkrete Aktivitäten** und schreibt diese in die Supabase-DB (`memories_user`, `activity_log`) bzw. die Topic-Dateien. Eine `public.claw_processed_sessions`-Tabelle stellt sicher, dass jede Session nur einmal verarbeitet wird.
        - **`claw-wiki-sync` (täglich):** Ein täglicher Task um 13:00 Uhr, der alle seit dem letzten Lauf geänderten Dateien im Obsidian Vault (`~/obsidian-claw-vault/`) identifiziert, sie in semantische Chunks zerlegt, Embeddings generiert und in die `claw.memories`-Tabelle in Supabase schreibt. Dies hält den durchsuchbaren Wissens-Index aktuell.
    - **Aktive Tasks (Stand 2026-04-19, verifiziert via MCP `list_scheduled_tasks`):** `ki-auto-daily-execution` (Mo-Fr 09:05), `ki-auto-weekly-strategy` (Mo 09:11), `seo-loop-st-automatisierung` (Mo-Fr 09:24), `seo-gsc-weekly-review-st` (Mo 09:25), `linkedin-monday` (Mo 09:13), `linkedin-wednesday` (Mi 09:18), `linkedin-friday` (Fr 09:12), `seo-loop-profilfoto-ki` (Mo-Fr 09:38), `seo-weekly-profilfoto-ki` (Mo 09:44), `funnel-daily-report-profilfoto-ki` (täglich 09:04), `morning-catchup` (Mo-Fr 09:36, re-registriert 2026-04-19), `claw-wiki-sync` (täglich 13:04, re-registriert 2026-04-19), `telegram-bot` (manual). **Session-Processor** läuft NICHT als Scheduled Task, sondern nur als Stop-/PreCompact-Hook in `settings.json`. **Stündlicher Cron existiert nicht** — Topic-File war hier veraltet.
- ~~**Webhook-Gateway:** Eine Supabase Edge Function (**claw-webhook**) diente als immer erreichbarer Endpunkt für externe Systeme (z.B. n8n, Make). Eingehende Webhooks wurden in einer **claw.webhook_queue**-Tabelle gespeichert und vom `claw-queue-check.mjs` Hook beim nächsten Session-Start verarbeitet.~~ **GEDROPPT 2026-04-19** — Legacy, wurde nie aktiv genutzt. Edge Function und `claw.webhook_queue`-Tabelle entfernt. Bei Bedarf neu aufbauen.
- **Self-Improvement-Trias (neu 2026-04-19/20):**
  - **Self-Repair-Loop:** `claw.skill_metrics` trackt Success/Fail je Skill, `claw_record_skill_outcome` RPC (befüllt vom Session-Processor via Gemini skill_outcomes-Sektion). Weekly Task `claw-skill-repair` (So 11:06) generiert Repair-Vorschläge in `claw.skill_repair_proposals` zum menschlichen Review.
  - **Cross-Domain-Learnings:** `claw.cross_domain_learnings` mit Kategorien (seo-ctr, ui-copy, conversion-funnel etc.) — Agents bleiben Domain-scoped, aber Pattern-Transfer via Applicable-To-Array. SessionStart-Hook lädt Top 8.
  - **Ralph-Wiggum Completion-Promise:** `claw.completion_promises` + RPCs (`claw_set_promise`, `claw_update_promise_progress`, `claw_get_active_promise`, `claw_close_promise`). Stop-Hook (`claw-ralph-check.mjs`) blockt Session-Ende solange active Promise nicht erfüllt ODER max_iterations erreicht. Agent meldet Fortschritt selbst nach jedem Teil-Erfolg.
- **Ralph-Loop-Back (Open-Items-Hook) — Design-Learning 2026-04-19:** Ursprünglicher 2h-Zeitfenster-Scan führte zu Endlos-Block-Loops weil alte open_items aus früheren Sessions des Tages gegriffen wurden. **Fix:** `WINDOW_MINUTES = 15` in `claw-ralph-check.mjs` — Hook sieht nur Items die der Session-Processor direkt davor geschrieben hat. Threshold ≥3 open_items zum Blocken. Keine Endlos-Loops mehr.
- **Heartbeat-System:** `public.claw_agent_heartbeat` + `claw_heartbeat()` RPC + `claw_heartbeat_dashboard` View. Täglicher Telegram-Report via `claw-heartbeat-report` Task (09:45).

### Offene Punkte
- ~~**Deaktivierung der alten .mjs Agenten-Skripte:** Skripte wie claw-daily-agent.mjs und claw-linkedin-agent.mjs (gelöscht 2026-04-03), die früher vom Windows Task Scheduler aufgerufen wurden, sind redundant und müssen entfernt werden, sobald die nativen Claude Code Tasks voll funktionsfähig sind.~~ **ERLEDIGT 2026-04-19** — alle Legacy-Scripts sind gelöscht.
- **GSC-Feedback-Loop (teilweise implementiert):** Die Datengrundlage steht: `claw.changelog` protokolliert alle Änderungen, `measure_change_impact()` berechnet Vorher/Nachher-Deltas aus GSC-Daten. **Offen:** Ein automatisierter Trigger (z.B. Scheduled Task), der 2-4 Wochen nach einer Änderung die Impact-Analyse ausführt, Ergebnisse auswertet und daraus Handlungsempfehlungen ableitet.
- **DataForSEO Backlinks API-Abonnement:** Das aktuelle DataForSEO-Abonnement enthält nicht die Backlinks-API. Dies blockiert die **vollautomatische Befüllung** der `claw.domain_authority`-Tabelle. Die Datenstruktur zur Verfolgung der Domain Authority existiert und wird von den Agenten abgefragt, die Befüllung erfolgt derzeit aber noch manuell oder über andere, weniger granulare Quellen.
- **pSEO Content-Audit:** Ein Audit der Wortanzahl, FAQ-Qualität und inhaltlichen Tiefe der pSEO-Seiten steht aus, um "Thin Content" zu identifizieren (speziell die 30 Branchen-Seiten mit < 500 Wörtern auf ki-automatisieren.de). Die Anreicherung soll durch den neuen Deep-Research-Workflow im LLM-Wiki erfolgen.
- **Keyword-Kannibalisierung (st-automatisierung.de):** Ein Audit hat ergeben, dass mehrere wichtige Seiten aufgrund von Keyword-Kannibalisierung nicht indexiert werden. Die Behebung durch Content-Differenzierung oder Canonical-Tags steht aus.
- **Keyword-Kannibalisierung (ki-automatisieren.de):** Eine Analyse des täglichen SEO-Agenten hat ergeben, dass das Keyword "vertriebsautomatisierung" auf der Homepage rankt (Position ~80-90), anstatt auf einer dedizierten Lösungsseite. Dies deutet auf eine Kannibalisierung oder eine fehlende, spezifische Seite hin.
- **Behebung der Workspace-Fragmentierung:** Konsolidierung der 5+ Workspaces für `st-automatisierung.de` in einen einzigen, um die Hard Rule zur Workspace-Isolation durchzusetzen.
- **SEO-Optimierung (yapayzekapratik.com):**
    - **Content-Tiefe erhöhen:** Die meisten Seiten haben 1.400-2.200 Wörter. Ziel ist es, die Tiefe auf das Niveau von Wettbewerbern (3.500+ Wörter) zu erhöhen.
    - **Blog-Strategie entwickeln:** Der Blog ist mit nur 3 Posts unterentwickelt und muss als primärer Kanal für organischen Traffic ausgebaut werden.
    - **Backlink-Aufbau initiieren:** Die Domain ist neu und hat kein bestehendes Backlink-Profil. Der Aufbau von Autorität durch externe Links ist erforderlich.
- **Instagram Graph API für Performance-Loop:** Implementierung der API via n8n, um Performance-Daten (Retention, Views, etc.) automatisch in die Supabase `ugc.reel_performance` Tabelle zu schreiben und den Self-Learning-Loop zu schließen.
- **On-Page E-E-A-T Signale:** In Blog-Artikeln fehlen noch Autorenfotos und individuelle OG-Bilder pro Artikel, um die Expertise und Vertrauenswürdigkeit zu stärken.
- **Performance-Optimierung:** Google Fonts werden noch extern geladen, was die Ladezeit (LCP) beeinträchtigt.
- ~~**Entwicklung des claw-task-executor.mjs:**~~ **OBSOLET** — claw.webhook_queue wurde am 2026-04-19 gedroppt (tote Legacy-Infrastruktur); claw-task-executor.mjs wurde am 2026-04-03 gelöscht. Scheduled Tasks arbeiten direkt ohne Queue.
- **CSP-Hardening:** Die aktuelle Content Security Policy nutzt 'unsafe-inline' und 'unsafe-eval'. Diese sollten langfristig durch eine sicherere Nonce-basierte Policy ersetzt werden.
- **Build-Prozess-Absicherung durch Hooks:** Implementierung von `postEdit`-Hooks in der `settings.json`, um nach Änderungen an `.ts`- oder `.astro`-Dateien automatisch Build- und Type-Checks (`npm run build`, `npx tsc --noEmit`) auszuführen und Deployment-Fehler frühzeitig zu erkennen.
- **Verbesserung der Browser-Automatisierung:** Der neue `site-review`-Skill hat das Overlap-Problem gelöst, aber die Rendering-Zuverlässigkeit in `Claude-in-Chrome` bleibt ein Kernproblem. Es muss eine Strategie entwickelt werden, um Rendering-Fehler (falsche "leere" Bereiche) zu erkennen und von echten Design-Fehlern zu unterscheiden, oder einen Fallback-Mechanismus zu implementieren.
- **Überarbeitung der `profilfoto-ki.de` Website nach Ablehnung durch das Google for Startups Programm:** Die Seite muss klarere und öffentlich sichtbare Informationen zum Geschäftsmodell (Business), dem Team dahinter und dem Produkt enthalten, um die Bewerbungskriterien für eine erneute Einreichung zu erfüllen.
- **Generierung & Implementierung fehlender Hero-Bilder (profilfoto-ki.de):** 11 Prompts für fehlende, seitenspezifische Hero-Bilder wurden erstellt. Die Bilder müssen generiert und in die entsprechenden 11 pSEO-Seiten integriert werden.
- **Diversifizierung der Beispiel-Portraits (profilfoto-ki.de):** Ein Audit hat ergeben, dass wenige Beispiel-Personen (Janine, Tom, etc.) auf sehr vielen Seiten wiederverwendet werden. Ein Plan zur Diversifizierung dieser Bilder steht aus, um die Authentizität der pSEO-Seiten zu erhöhen.
- **Fertigstellung der TikTok API-Integration:** Konfiguration der Sandbox-App abschließen, ein Test-Skript zum Posten von Videos entwickeln und einen ersten privaten Post absetzen.
- **TikTok App Review:** Nach erfolgreichem Sandbox-Test muss die App mit Demo-Videos zum Review eingereicht werden, um die Freischaltung für öffentliche Posts zu erhalten.
- **Erstellung von AGB für `profilfoto-ki.de`:** Für den TikTok-App-Review (und aus rechtlichen Gründen) muss eine offizielle AGB-Seite (Terms of Service) erstellt werden. Aktuell wird das Impressum als Platzhalter verwendet.
























### Session Update (2026-04-20)
- Migration auf Claude-native Scheduled Tasks abgeschlossen. Claude Code IST der Agent, kein externer Layer.
- 9 Scheduled Tasks aktiv (8 mit SKILL.md befüllt), Zeiten ab 09:30 gestaffelt.
- `morning-catchup` (Mo-Fr 09:30) als Safety-Net für verpasste Tasks.
- 4 alte Agent-Scripts gelöscht (daily-agent, task-executor, agent-st, agent-apexx).
- Session Processor läuft stündlich (dynamisches Scanning, Dedup, Activity Log).
- `morning-catchup` ist als Scheduled Task registriert (Mo-Fr 09:36 lokal).
- `claw-wiki-sync` ist als Scheduled Task registriert (täglich 13:00 lokal) und hat eine SKILL.md.
- `claw.processed_sessions` ist eine Ghost-Tabelle und wurde gedroppt; die echte Tabelle ist `public.claw_processed_sessions`.
- Memory-Scopes wurden von 30 auf 20 konsolidiert (6 Haupt-Duplikat-Gruppen + 4 CLAW-System-Varianten).
- Auto-Compact-Schwelle auf 99% gesetzt (`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=99`).
- PostToolUse Build-Safety Hook (`claw-build-check.mjs`) läuft nach Edit/Write auf `.ts`/`.tsx`/`.astro`-Files und blockiert bei TypeScript-Fehlern.
- `ccusage` CLI (v18.0.11) ist installiert.
- Auto-Lib-Docs für CLAW-Scripts sind implementiert und werden wöchentlich regeneriert.
- Ralph-Loop-Back (pragmatische Variante) implementiert: SessionStart-Hook zeigt Top 3 offene Punkte pro Domain, Stop-Hook blockiert bei unadressierten Items.
- Auto-Handoff bei 90% Context ist technisch limitiert; stattdessen Handoff bei jedem Session-Ende und PreCompact, prominent am Session-Start angezeigt.
- `code-graph-mcp` (v1.2.4) ist installiert und in `.mcp.json` registriert.
- Cross-Domain-Learnings-Tabelle (`claw.cross_domain_learnings`) und Integration in `claw-queue-check.mjs`.
- Ralph-Loop-Back Stop-Hook (`claw-ralph-check.mjs`) als zweiter Stop-Hook, blockiert bei ≥3 unadressierten open_items.
- Heartbeat-Dashboard (RPC `public.claw_heartbeat()`, View `claw_heartbeat_dashboard`, Script `claw-heartbeat-report.mjs`, Scheduled Task täglich 09:45 Telegram).
- Build-Check Edge-Case für nicht installiertes TypeScript gefixt.
- 14 Scope-Duplikate finalisiert (8 project:, 5 skill:, 3 tool:).
- 3 Scripts ohne Body-Kommentar (`gsc-debug.mjs`, `gsc-test.mjs`, `indexing-api.js`) mit Headern versehen.
- Self-Repair-Loop (Tabellen `claw.skill_metrics`, `claw.skill_repair_proposals`, RPCs, `claw-skill-repair.mjs` Script, Session-Processor-Integration, Weekly Task So 11:06) komplett gebaut.
- Pattern-Learning-Layer (Tabelle `claw.task_patterns`, RPCs, Session-Processor-Integration, SessionStart-Hook) gebaut.
- Ralph-Wiggum Completion-Promise (Tabelle `claw.completion_promises`, RPCs, Stop-Hook-Integration, `/promise` Skill) gebaut.
- Ralph-Hook False-Positive-Fix (Prefix-Filter für [VERSCHOBEN]/[USER ACTION]/[SPAWNED TASK]/etc.) implementiert.
- Skill-DB-Konsistenz-Fix durchgeführt (23 Annotations in 9 Skill-Files für gedroppte Tabellen korrigiert).
- GitHub-Repo `TRW123123/claude-code-claw` ist live und public.

### Session Update (2026-04-19)
- Scheduled Tasks (Cron-Registrierungen) sind Session-gebunden und gehen bei Neuinstallationen verloren, während SKILL.md-Dateien (Prompts) auf dem Dateisystem intakt bleiben.
- Der Scheduler ignoriert SKILL.md-Dateien, die nicht exakt 'SKILL.md' heißen (z.B. '.archived').
- Beim ersten automatischen Run nach einer Neuinstallation müssen Tool-Permissions einmalig manuell durchgeklickt werden.
- Der Scheduler fügt automatisch Jitter zu geplanten Zeiten hinzu, um gleichzeitiges Feuern zu verhindern.
- Ein 'Catch-Up Task' kann als Meta-Agent implementiert werden, um verpasste Daily Tasks nachzuholen, indem er das Agent-Log prüft und fehlende Tasks auslöst. Dieser kann so konfiguriert werden, dass er nur einmal pro Tag läuft.

### Session Update (2026-04-19)
- OAuth 2.1 ist live mit 5 Endpoints: `/.well-known/oauth-protected-resource`, `/.well-known/oauth-authorization-server`, `POST /register`, `GET /authorize`, `POST /token`.
- Auth-Middleware unterstützt jetzt sowohl MCP_AUTH_TOKEN als auch OAuth-issued JWTs.
- Der `WWW-Authenticate: Bearer resource_metadata="..."` Header in der 401-Response des MCP-Endpoints ist entscheidend für die Erkennung des OAuth-Flows durch Claude Desktop.

### Session Update (2026-04-19)
- Der Session Processor nutzt eine keyword-basierte Topic-Detection, die in `claw-session-processor.mjs` (Zeile 30-55) definiert ist.
- Die `TOPIC_FILES`-Map muss um neue Keywords erweitert werden, damit Projekte korrekt zugeordnet werden können.
- Es gab eine fehlerhafte Domain-Zuordnung im Processor, die dazu führte, dass Aktivitäten unter der falschen Domain ("claw-system" statt `st-automatisierung.de`) gespeichert wurden.

### Session Update (2026-04-19)
- Hard Rule 7: Telegram-Caption NUR copy-paste-ready, keine Meta-Info.
- Hard Rule 8: Keine Anführungszeichen, Standard-Deutsch, Hook in Zeile 1.

### Session Update (2026-04-18)
- CLAW kann explizit angewiesen werden, autonom bis zum Erreichen eines Ziels zu arbeiten und sich erst dann zu melden.
- CLAWs MCP-Tabgruppe erkennt nur Tabs im selben Chrome-Fenster und derselben Tab-Gruppe. Für den Zugriff auf externe Tabs muss der Tab manuell in die Gruppe gezogen oder die URL direkt bereitgestellt werden.
- CLAW kann nicht auf Google Sheets zugreifen, wenn die MCP-Chrome-Instanz in einem anderen Google-Account eingeloggt ist als das Sheet-Fenster. Lösungen: Browser-Profil wechseln, Sheet teilen oder Inhalt copy-pasten.

### Session Update (2026-04-17)
- Der 'elite-ui-ux' Skill wurde um eine 'Phase 0: Token-Acquisition' erweitert, die zuerst im lokalen 'awesome-design' Repo nach Brand-Schemas sucht, dann WebFetch nutzt und optional Chrome MCP.
- Eine 'Refine-to-Skill'-Phase wurde hinzugefügt, die nach der Validierung eines Designs die Umwandlung in einen Sub-Skill vorschlägt.
- Das 'awesome-design' GitHub-Repository mit 59 Brand-Schemas wurde lokal in den 'elite-ui-ux' Skill-Ordner integriert, um als Referenzdatenbank zu dienen.
- Die Isolation-Hard-Rule wurde eingehalten, indem alle Referenzen innerhalb des Skill-Ordners liegen.

### Session Update (2026-04-17)
- Der `elite-ui-ux` Skill wurde um eine `Phase 0: Token-Acquisition` erweitert, die Brand-Token-Schemas (Farben, Typo, Logos) aus dem `awesome-design` Repo, WebFetch oder optional Chrome MCP extrahiert und in `brand-tokens.json` im Master-Prompt einbettet.
- Eine `Refine-to-Skill` Phase wurde hinzugefügt, die nach Validierung des Designs die Möglichkeit bietet, einen Sub-Skill (`{projekt}-design-system/SKILL.md`) zu erstellen, der Standard-Direktiven wie Sub-Agents, Metaphern und Quellen-Transparenz enthält.
- Das `awesome-design` GitHub-Repo mit 59 Brand-Schemas wurde lokal in den `elite-ui-ux` Skill-Ordner geklont (`references/awesome-design-md/design-md/`) und der Skill verweist nun auf diesen lokalen Pfad, um die Isolation-Hard-Rule einzuhalten und die Nutzung zu beschleunigen.

### Session Update (2026-04-17)
- Der Morning Catch-Up Agent ist ein Scheduled Task, der einmal täglich läuft, um fehlende Tasks nachzuholen und sich danach selbst deaktiviert.
- Es gibt Hard Rules für die Task-Ausführung: kein Task doppelt, keine Kontextvermischung zwischen Domains, Pinecone ist READ-ONLY, Deploy nur nach erfolgreichem Build.
- Die Reihenfolge der Task-Ausführung ist ki-auto, dann st-auto, dann LinkedIn.
- Jeder Task schreibt sein eigenes Agent-Log, welches für die Prüfung bereits gelaufener Tasks herangezogen wird.

### Session Update (2026-04-16)
- n8n Workflows können für B2B-SaaS-Produkte als Backend für Lead-Scoring und Datenverarbeitung dienen.
- Client-Side-Berechnungen im Frontend sind vorteilhaft für Interaktivität und zur Reduzierung von Backend-API-Calls bei teuren APIs.
- Netlify ist eine geeignete Plattform für schnelles Hosting von statischen Frontends mit GitHub-Integration für automatische Deployments.

### Session Update (2026-04-16)
- CLAW neigt dazu, visuelle Bewertungen zu hoch anzusetzen und muss explizit korrigiert werden, um Mängel zu erkennen.
- Bei Next.js Static Export und Framer Motion Animationen auf Hero-Elementen können `whileInView` oder `animate` mit `initial` zu Problemen bei der SSR Hydration oder dem Scroll-Trigger führen. Der robusteste Ansatz ist, `initial` zu entfernen oder die `motion.div` durch normale `div` zu ersetzen.

### Session Update (2026-04-14)
- CLAWs Tendenz zum 'Pitch-Modus' und einem zu 'wissenschaftlichen' Ton wurde als Anti-Pattern identifiziert und korrigiert.
- Neue Hard Rules für die Nachrichtenformatierung wurden definiert: keine Anführungszeichen, Gedankenstriche, Anreden und standardmäßige Verwendung von 'Siz'.

### Session Update (2026-04-14)
- Session Processor wurde von statischen Pfaden auf dynamisches Scanning umgestellt.
- `claw.activity_log` Tabelle in Supabase wurde für die Protokollierung von Aktivitäten eingeführt.
- SessionStart-Hook lädt jetzt die letzten 7 Tage Aktivitäten pro Domain.
- `upsert_memory` Funktion wurde angepasst, um Jaccard-Deduplizierung scope-übergreifend durchzuführen.
- Alte .mjs Scripts, die Claude CLI aufriefen, wurden entfernt und durch native Scheduled Tasks ersetzt.
- Die SKILL.md-Dateien der Scheduled Tasks verweisen nun auf globale Skills und orchestrieren diese, anstatt Logik zu duplizieren.

### Session Update (2026-04-14)
- ~~claw-task-executor.mjs ist in Phase 7 zu bauen, um die Task-Queue autonom abzuarbeiten.~~ (obsolet, gelöscht 2026-04-03 — Scheduled Tasks ersetzen den Executor)

### Session Update (2026-04-14)
- Die globale Hard Rule 'Kontrolliere nicht den Browser des Nutzers, um Aktionen auszuführen.' wurde geändert zu 'Kontrolliere nicht unaufgefordert den Browser des Nutzers. Nur wenn der Nutzer explizit eine Browser-Automation anfordert, darf der Browser gesteuert werden.'
- Das CLAW Memory System (Supabase) wird für die Speicherung und Aktualisierung globaler Hard Rules verwendet.
- CLAW wurde angewiesen, in normalen Gesprächssituationen vollständige Sätze zu verwenden und den 'abgehackten' Stil der DM-Templates zu vermeiden.

### Session Update (2026-04-14)
- CLAW ist ein AIOS (AI Operating System) und übertrifft die von Liam beschriebenen Kern-Bausteine.
- CLAW integriert kontextualisierte Workspaces (MASTER.md, SOUL.md, Topic-Files), 15+ MCPs (Supabase, Gmail, GCal, Instantly, Canva, Netlify, Chrome, SerpAPI), 30+ Skills (SEO, Outreach, Video, Wiki, Deployment), Lese- und Schreibzugriff auf Plattformen, Steuerung des Business aus dem Coding Agent und Scheduled Agents (morning-catchup, weekly strategy tasks, autonome SEO-Agents).
- ROI-Tracking erfolgt über Agent-Logs und GSC WoW-Vergleiche.

### Session Update (2026-04-13)
- Der `morning-catchup` Agent ist ein Failsafe, der verpasste Tasks nachholt. Er lief ursprünglich nur einmal täglich, wurde aber auf 3x täglich (09:36, 10:36, 11:36 Uhr, Mo-Fr) angepasst, um verpasste Tasks stündlich bis 12 Uhr nachzuholen.
- CLAW lädt Kontext über SessionStart Hook (letzte 7 Tage Activity Log) und UserPromptSubmit Hook (relevante Memories) aus Supabase.
- CLAW hat keinen direkten Zugriff auf rohe Chat-Transkripte. Diese liegen lokal als JSONL-Dateien und werden stündlich vom `claw-session-processor.mjs` verarbeitet, um Learnings in `memories_user` und `activity_log` in Supabase zu schreiben.

### Session Update (2026-04-12)
- Der Obsidian Vault (`C:\Users\User\obsidian-claw-vault\`) enthält einen `distilled/`-Ordner für destillierte Artikel.
- Das Format für destillierte Artikel im Vault ist YAML-Frontmatter + destillierter Content + Wikilinks.

### Session Update (2026-04-12)
- CLAW kann Meta Ads vollständig über die Meta Marketing API steuern, ohne n8n als Middleware. Dies erfordert die Erstellung einer Meta App im Developer Portal, einen System User im Business Manager und ein Token mit `ads_management` und `ads_read` Scopes.
- Der Zugriff auf das Meta Developer Portal erfordert ein persönliches Facebook-Konto und ggf. abgeschlossene Developer-Registrierung sowie 2FA. Reine Business-Logins sind nicht ausreichend.
- Ein System User Token im Business Manager kann nur generiert werden, wenn eine Meta App existiert und dem Business Portfolio zugewiesen ist (Business-Einstellungen -> Konten -> Apps -> App hinzufügen, oder Developer Portal -> App-Einstellungen -> Allgemein -> Business-Account zuweisen).

### Session Update (2026-04-12)
- Neuer Skill für Kling 3.0 erstellt und im System live geschaltet.
- Neue Wiki-Struktur für Kling 3.0 im `obsidian-claw-vault/kling-3.0/` mit 11 Artikeln und 5 Gold Examples implementiert.
- Integration von 4 neuen Hard Rules in den Kling 3.0 Skill: Motion Endpoints, Prompts IMMER Englisch, Prompt-Länge 100-200 Wörter, Sequenzielle Aktionen.
- Aktualisierung relevanter Wiki-Artikel mit Modell-spezifischen Prompt-Längen, Sprach-Regeln und Motion Endpoints.

### Session Update (2026-04-12)
- Die `obsidian-claw-vault/seedance-2.0/examples/` Struktur wird als kuratierte Prompt-Library eingeführt, um Few-Shot-Beispiele für die Prompt-Generierung bereitzustellen.
- Jede Prompt-Datei in der Library soll mit Frontmatter-Tags versehen werden (z.B. `genre`, `vibe`).
- Die Nano Banana → Startframe → Seedance I2V Pipeline wird als Standardprozess für die Erstellung fotorealistischer Startbilder für Seedance-Videos etabliert, insbesondere wenn 3D-Render als Inspiration dienen.

### Session Update (2026-04-11)
- Der `google.com/ping?sitemap=` Endpoint ist seit 2023 deprecated und sollte nicht mehr verwendet werden.
- Die Google Indexing API hat ein Limit von 200 URLs/Tag pro Google Cloud Projekt. Mehrere Domains können sich ein Projekt teilen oder jede Domain ein eigenes Projekt für separate Quotas erhalten.
- Für die Google Indexing API ist ein Service Account der bevorzugte Authentifizierungsweg, da er keinen OAuth Consent Screen, Browser-Login oder Verifikation erfordert.
- Ein Service Account für die Google Indexing API muss in der Google Search Console als 'Inhaber' der jeweiligen Property hinzugefügt werden, damit die API-Requests erfolgreich sind.

### Session Update (2026-04-11)
- Der `claw-session-processor.mjs` nutzt nun Gemini 2.5 Flash (statt 2.5 Pro) mit deaktiviertem Thinking (`thinkingBudget: 0`).
- Der `claw-session-processor.mjs` führt nur noch einen API-Call pro Session aus, der Learnings, Aktivitäten und Topic-Updates in einem Schritt extrahiert.
- Topic Updates im `claw-session-processor.mjs` erfolgen nun per Delta-Append (nur neue Bullet Points) statt Full-Rewrite.
- Der `claw-session-processor.mjs` soll zukünftig Claude-Kapazitäten der normalen Subscription nutzen und nur laufen, wenn Claude Code offen ist.
- Der `claw-research.mjs` Hook macht bei jedem User-Prompt einen Gemini Embedding-Call (gemini-embedding-001) für die semantische Suche, was im Free Tier läuft und keine Kosten verursacht.
- Die `extractMessages()` Funktion im Session Processor filtert bereits `tool_use` und `tool_result` Blöcke heraus, Assistant-Antworten könnten aber komplett weggelassen werden, um den Input zu halbieren.

### Hard Rules
- **Pinecone `wissenspeicher`: READ-ONLY für CLAW.** Schreibzugriffe erfolgen nur durch Şafak.
- **Supabase `ugc` Schema:** Autonomer Lese- und Schreibzugriff für CLAW erlaubt.
- **Supabase `claw.changelog`: Changelog-Pflicht.** Jede Website-Änderung (Content, Schema, Titel, Bilder, Links, Technik) MUSS via `insert_changelog()` protokolliert werden. Gilt für alle Agents, Chats und Scheduled Tasks.
- **Autonomes Social Media Posting:** CLAW darf vollautonom auf dem persönlichen LinkedIn-Profil von Şafak posten. Ein manueller Freigabeprozess ist hierfür explizit *nicht* vorgesehen.
- Kein Code ohne expliziten Task von Şafak oder einen von einem Scheduled Task (früher: vom gelöschten claw-daily-agent, seit 2026-04-03 ersetzt durch `ki-auto-daily-execution` u.a.) generierten Task.
- **Deployment Preflight:** Vor jedem `git push` ist die Ausführung des `deployment`-Skills Pflicht.
- **Browser-Verifikation:** Nach jedem Deploy ist eine visuelle Verifikation der Live-URL im Browser obligatorisch.
- **Deployment von strukturellen Änderungen:** Der autonome SEO-Agent folgt einer gestaffelten Freigabe-Logik. **Vollautonomes Deployment (ohne manuelle Freigabe)** ist explizit für risikoarme Änderungen wie die Optimierung von Title- und Meta-Tags erlaubt. Content-Erweiterungen und die Erstellung neuer Seiten müssen committet, aber vor dem `git push` vom User bestätigt werden. Größere, strukturelle Code-Änderungen erfordern ebenfalls eine explizite Bestätigung.
- **Deployment Lessons:** Falls bei einem Deployment Fehler auftreten, muss eine "Deployment Lesson" im Pinecone-Namespace `deployment-lessons` gespeichert werden.
- **Browser-Automatisierung:** Autonomes Browsing ist ausschließlich für die Durchführung von visuellen Audits (Seitenaufruf, Screenshots, Layout-Analyse) auf den eigenen Projekt-Websites erlaubt. Die Steuerung der Google Search Console ist explizit verboten, da dies zu Anmeldeproblemen mit dem falschen Google-Account führt (bestätigt durch fehlgeschlagene Account-Wechsel während der GSC-Einreichungen am 03.04.2026). Die URL-Einreichung nach einem Deploy erfolgt **automatisiert über die Google Indexing API**. Manuelle Einreichungen in der GSC sind nur noch für Ausnahmefälle vorgesehen. Die Steuerung der GSC-Weboberfläche via Browser-Automatisierung bleibt weiterhin explizit verboten.
- **Fallback-Strategie für Browser-Automatisierung:** Bei Browser-Automatisierungsaufgaben ist die direkte URL-Navigation dem Klicken auf UI-Elemente vorzuziehen. Schlägt eine UI-Interaktion (z.B. Klick auf ein Dropdown) zweimal fehl, muss sofort auf eine alternative Strategie (direkte URL, API-Aufruf) gewechselt werden.
- **Umgang mit fehlerhaften Screenshots:** Wenn die Browser-Automatisierung bei der Erstellung von Screenshots offensichtlich fehlerhafte Ergebnisse liefert (z.B. große leere Bereiche, fehlender Content), darf dies nicht sofort als Designfehler interpretiert werden. Der Agent muss den Fehler als potenzielles Rendering-Artefakt der Automatisierung behandeln, versuchen, den DOM zu inspizieren, um den Fehler zu verifizieren, und im Zweifelsfall den Vorgang abbrechen und ein code-basiertes Audit oder eine manuelle Prüfung anfordern.
- **Keine Automatisierung von Perplexity.ai:** Die Nutzungsbedingungen von Perplexity verbieten explizit die Automatisierung der Weboberfläche. Recherchen müssen über erlaubte Kanäle (APIs, die dies gestatten, oder Claude.ai's eigene Research-Funktion) erfolgen, um einen Account-Ban zu vermeiden.
- **Agenten-Sicherheitsprinzip:** Wenn keine sinnvolle Aktion möglich ist, wird nichts erzwungen; stattdessen wird nur eine Analyse protokolliert. Bei Unsicherheit über den Scope einer Aufgabe ist die konservativere, weniger invasive Aktion zu wählen.
- **SKILL.md-Definitionen:** Jede `SKILL.md` wird aus dem jeweiligen Projekt-Workspace geschrieben, um die Logik beim Projekt zu halten und nicht zentral im Orchestrator.
- **Projekt-Scope:** Bei der Nennung eines spezifischen Projekts (z.B. `ki-automatisieren.de`) wird AUSSCHLIESSLICH an diesem Projekt gearbeitet. Kontext von anderen Projekten darf nicht angenommen oder erwähnt werden, es sei denn, dies wird explizit gefordert.
- **Priorisierung von Skills:** Vor der Entwicklung neuer Lösungsansätze oder der Installation externer Pakete müssen IMMER die bestehenden Skills in `~/.claude/skills/` geprüft werden. Etablierte und funktionierende Workflows sind strikt zu befolgen.
- **Arbeitsverzeichnis:** Es darf nicht von einem festen Arbeitsverzeichnis ausgegangen werden. Zu Beginn einer Session muss immer geklärt werden, in welchem Projekt/Pfad gearbeitet wird.
- **Sicherheit bei externem Code:** Externe Pakete oder von GitHub geladene Skills dürfen nicht ohne eine vorherige Prüfung auf Prompt-Injection-Risiken installiert oder ausgeführt werden.
- **AI Models & APIs:**
    - **Image:** IMMER `gemini-3.1-flash-image-preview` (Nano Banana 2). `gemini-2.5-flash-image` ist veraltet.
    - **Video:** IMMER `veo-3.1-generate-preview`.
    - **Embedding:** IMMER `gemini-embedding-001` verwenden. `gemini-embedding-2-preview` ist instabil und erzeugt inkompatible Vektoren. Ein Mischen der Modelle in der `memories_user`-Tabelle ist strikt verboten.
    - **Image API:** IMMER `generateContent()` mit `responseModalities: ['IMAGE']`. NIEMALS `generateImages()`.
    - **Veo Anchor:** Anchor-Bild IMMER als separater `image: {imageBytes, mimeType}` Parameter. NIEMALS im Prompt-Array.
- **AI-Videoproduktion (Veo):**
    - **Multi-Clip Konsistenz:** Für Videos mit 2+ Szenen mit denselben Personen ist zwingend der **"Veo Extend"-Workflow** zu nutzen. NIEMALS einen zweiten T2V-Call machen.
    - **Veo Extend Input:** Extend akzeptiert NUR Veo-eigene Video-URIs aus einem vorherigen Generations-Response. Hochgeladene Videos werden abgelehnt.
    - **Veo Extend Output:** Extend gibt immer das **kombinierte Video** (Original + Extension) zurück. In Remotion muss `trimBefore` genutzt werden, um den Original-Teil zu überspringen.
    - **Voice Drift:** Veos native Audio-Generierung ist über mehrere Clips hinweg inkonsistent ("Voice Drift"). Der Standard-Workflow ist, Veo-Audio zu muten und mit einer konsistenten TTS-Stimme (z.B. ElevenLabs) zu overdubben.
    - **Standard-Workflow (I2V):** Für konsistente Charaktere wird zuerst ein Start-Frame mit einem Bild-Modell (Nano Banana) und einer persistenten "Character Bible" generiert. Dieses Bild dient dann als Input für den Veo I2V-Call.
    - **Prompting:** Dialog-Text in Veo-Prompts darf keine Satzzeichen wie Punkte enthalten, um die natürliche Sprachausgabe nicht zu stören.
- **AI-Videoproduktion (OmniHuman):**
    - **Audio-Länge:** Pro Clip kann bis zu 30s Audio verarbeitet werden.
- **Content & Production:**
    - **Hook-Regel (Reel016 Learning):** NIEMALS ein Fullscreen-Overlay in den ersten 3 Sekunden, das die Person verdeckt. Die Person muss ab Frame 0 sichtbar sein.
    - **Hook-Psychologie:** "Vergiss X, hier ist Y" ist ein Sales-Hook, kein Curiosity-Loop. Ein Curiosity-Loop öffnet eine Frage, die der Hook nicht beantwortet.
    - **Grundschüler-Test:** Alle Skripte müssen auf einfache Sprache und kurze Sätze geprüft werden (keine komplexen Nebensätze).
    - **Character Bible:** Für wiederkehrende Charaktere (z.B. Hosts) muss eine "Character Bible" verwendet werden, um die visuelle Konsistenz über mehrere Produktionen hinweg sicherzustellen.
    - **Content-Qualität & Schema:** FAQ-Schema darf nur aus Markdown-Listen generiert werden, bei denen jeder Eintrag mit einem Fragezeichen endet. Blog-Artikel müssen mindestens 60% ihrer numerischen Daten aus externen Quellen (Pinecone, Web-Recherche) beziehen, um Halluzinationen zu vermeiden.
- **LinkedIn Content & Stil:**
    - **Sprache & Zielgruppe:** Posts sind auf Türkisch für türkische KMU-Inhaber und B2B-Entscheider.
    - **Hook-Struktur:** Der Hook (erste Zeile) darf maximal 8 Wörter haben. Die zweite Zeile dient als "Rehook" und darf ebenfalls maximal 8 Wörter haben.
    - **Framing:** Immer "How I..." statt "How to...".
    - **Formatierung:** Keine Hashtags, keine Em-Dashes (—), keine Bullet-Points und keine Phrasen wie "Neden önemli?".
    - **Länge:** Die ideale Länge liegt zwischen 800 und 1300 Zeichen.
    - **Themen-Wiederholung:** Der Agent darf kein Thema behandeln, das bereits in den letzten 20 Posts vorkam. Dies wird durch eine Prüfung der `claw.linkedin_posts`-Tabelle vor der Recherche sichergestellt.
- **SEO Content (st-automatisierung.de):**
    - **Positionierung:** Der Content-Fokus liegt auf Beratungs-Intent (Strategie, BAFA, Compliance), nicht auf Umsetzungs-Intent.
    - **Qualitäts-Gate:** Jede neu erstellte Seite muss entweder einen FAQ-Block oder strukturierte ROI-Daten (`roi_data`) enthalten.
    - **BAFA-Branding:** Alle Seiten mit Bezug zur BAFA-Förderung müssen das `bafa_badge: true` Flag im Frontmatter haben.
    - **Sprachregelung:** Vermeidung von generischen AI-Marketing-Floskeln ("nahtlose Integration", "revolutionär", "transformativ", "maßgeschneidert", "ganzheitlich", "zukunftssicher", "wegweisend").
    - **Cluster-Priorisierung:** Die Content-Erstellung folgt einer strikten Prioritäten-Reihenfolge: BAFA > AI Act/Compliance > KI-Beratung > Strategieberatung.
    - **Cross-Domain-Abgrenzung:** Es darf kein Keyword-Overlap mit `ki-automatisieren.de` erzeugt werden. Im Zweifelsfall muss die GSC-Performance der anderen Domain geprüft werden.
- **Remotion-Nutzung:**
    - Videoverarbeitung muss über `<OffthreadVideo>` erfolgen.
    - Asset-Pfade müssen `staticFile()` verwenden.
    - Video-Trimming muss über die `trimBefore` und `trimAfter` Eigenschaften erfolgen (ersetzt `startFrom`/`endAt`).
- **SEO & Deployment:**
    - **Netlify & Astro Routing:** NIEMALS Edge Functions für Trailing Slashes auf statischen Netlify-Sites verwenden; Netlify's "Pretty URLs" ist die korrekte Lösung. Self-Referencing Redirects (z.B. /path -> /path) in Konfigurationsdateien sind strikt zu vermeiden, da sie zu unendlichen Redirect-Loops führen können. Alle internen Links und alle generierten URLs (inkl. Canonicals und JSON-LD Schemas) müssen mit einem Trailing Slash enden, um der Astro-Konfiguration (`trailingSlash: 'always'`) zu entsprechen und GSC-Umleitungsfehler zu vermeiden.
    - **Infrastruktur-Änderungen:** Änderungen an kritischen Infrastruktur-Dateien (netlify.toml, astro.config.mjs, etc.) erfordern immer eine explizite Bestätigung des Users.

## Entscheidungen
- **Einführung eines LLM-gepflegten Wissensgraphen (Obsidian) nach Karpathy-Pattern:** Im Gegensatz zu einer früheren Ablehnung wurde Obsidian als Kernkomponente für ein neues Wissensmanagement-System eingeführt. Dies folgt Andrej Karpathys "Wiki as a codebase"-Pattern, bei dem das LLM nicht nur Wissen abruft (RAG), sondern aktiv eine vernetzte Wissensbasis aus Rohdaten (Chat-Transkripte, Projektdokumente) aufbaut und pflegt. Dies löst das Problem des "statischen Wissens" von RAG und schafft ein lernendes System. Der Vault integriert Claude Code, Antigravity, ChatGPT und lokale Markdown-Dateien.
- **Auswahl von `nvk/llm-wiki` als zentrales Framework:** Nach einer vergleichenden Analyse mehrerer Open-Source-Implementierungen des Karpathy-Patterns wurde `nvk/llm-wiki` als das robusteste und am besten geeignete Framework ausgewählt. Es bietet integrierte Deep-Research-Funktionen und ist als Claude Code Plugin verfügbar.
- **Asynchrone Session-Verarbeitung via Cron Job:** Anstatt sich nur auf den `Stop`-Hook zu verlassen, wird die Verarbeitung durch einen externen, stündlich laufenden Cron Job (Windows Task Scheduler) sichergestellt. Der `Stop`-Hook triggert den Processor zusätzlich für eine zeitnahe Verarbeitung.
- **Dual-Layer Memory System (Supabase + Topic Files):** Das Gedächtnis ist zweigeteilt. **1. Supabase:** Dient als operatives Gedächtnis für granulare, permanente Learnings (nur Hard Rules und Korrekturen), die semantisch durchsucht werden. **2. Lokale Topic-Dateien (`.md`):** Dienen als primäres, menschenlesbares Projekt-Gedächtnis. Sie enthalten den aggregierten Projektstatus und werden bei jedem Chat-Start für den relevanten Kontext geladen.
- **Activity Log für handlungsorientiertes Gedächtnis:** Eine dedizierte `claw.activity_log`-Tabelle in Supabase wurde eingeführt, um explizit zu speichern, *was getan wurde* (z.B. "Backlinks erstellt"), im Gegensatz zu `memories_user`, das speichert, *was gelernt wurde* (z.B. "Pinecone ist read-only"). Dies schließt die Lücke bei der Nachverfolgung konkreter Aktionen zwischen den Sessions.
- **Proaktives Laden von Aktivitäten beim Session-Start:** Der `SessionStart`-Hook wurde erweitert, um den Activity Log der letzten 7 Tage zu laden. Dadurch hat CLAW bei Beginn eines neuen Chats sofortigen Kontext über die zuletzt durchgeführten Aktionen, ohne dass der User diese wiederholen muss.
- **Dynamisches Path-Scanning im Session Processor:** Anstatt sich auf eine fehleranfällige, hardgecodete Liste von Projektverzeichnissen zu verlassen, scannt der `claw-session-processor.mjs` nun dynamisch alle Unterordner in `~/.claude/projects/`. Dies macht das System resilient gegen das Verhalten von Claude Code, bei Bedarf neue, duplizierte Projektordner anzulegen.
- **Scope-übergreifende Deduplizierung im Gedächtnis:** Die `upsert_memory`-Funktion in Supabase wurde so angepasst, dass sie bei der Jaccard-Ähnlichkeitsprüfung auf Duplikate den `scope`-Filter ignoriert. Dies verhindert, dass dieselbe Regel (z.B. "Pinecone ist read-only") mehrfach gespeichert wird, nur weil sie in unterschiedlichen Projektkontexten (`global` vs. `project:ki-automatisieren`) gelernt wurde.
- **Rollback zu stabilem Embedding-Modell (`gemini-embedding-001`):** Es wurde die bewusste Entscheidung getroffen, von `gemini-embedding-2-preview` auf das stabilere `gemini-embedding-001` zurückzuwechseln. Grund waren die Inkompatibilität der erzeugten Vektoren und die fehlende Stabilitätsgarantie des Preview-Modells, was die Konsistenz der semantischen Suche gefährdete.
- **Supabase pgvector als autonomes Gedächtnis und Wiki-Index:** Anstelle von Pinecone wird Supabase pgvector für das autonome Gedächtnis von CLAW verwendet. Dies ermöglicht SQL-Abfragen, einfacheres Datenmanagement und nutzt die bereits vorhandene Infrastruktur. Eine tägliche Synchronisation (`claw-wiki-sync.mjs`) macht den gesamten Obsidian-Wissensgraphen semantisch durchsuchbar und für Agenten zugänglich.
- **Hippocampus-Pattern für intelligentes Gedächtnis:** Das Supabase-Gedächtnis ist nicht nur ein Vektorspeicher. Es nutzt Importance Scoring, Jaccard-Deduplizierung und automatischen Decay (via pg_cron), um die Relevanz der gespeicherten Informationen über Zeit zu steuern und Duplikate zu vermeiden.
- **Pinecone als kuratierte Wissensbasis:** Pinecone (`wissenspeicher`) ist die zentrale, schreibgeschützte Wissensbasis für CLAW. Es enthält validierte Hard Rules und Best Practices. Nur Şafak darf Schreibzugriffe auslöfen, um die Datenintegrität zu wahren.
- **Trennung von Wissens- und Medien-Vektoren:** Textbasiertes Wissen (`wissenspeicher`, 1024d, llama-text-embed-v2) und multimodale Embeddings (`media-embeddings`, 1536d, Gemini Embedding 2.0) werden in separaten Pinecone-Indizes gespeichert.
- **Gemini 2.5 Pro als Processing Engine:** Die Destillation von Wissen aus den rohen Chat-Transkripten wird bewusst an Gemini 2.5 Pro ausgelagert.
- **Vision der Autonomie als Nordstern:** Das Ziel eines vollautonomen Systems ist explizit in der `MASTER.md` verankert. Der autonome Agenten-Loop (ursprünglich claw-daily-agent + claw-task-executor, beide gelöscht 2026-04-03; heute ersetzt durch die nativen Scheduled Tasks) ist die erste konkrete Umsetzung dieser Vision.
- **Zweigeteilter Ansatz für Web-Testing:** Es wird klar zwischen zwei Test-Typen unterschieden. **1. Funktionale Tests:** Werden mit Playwright und deterministischen, von der KI geschriebenen Skripten (`.spec.ts`) durchgeführt. Dies ist token-effizient und zuverlässig für die Prüfung technischer Funktionen. **2. Qualitative Visuelle Audits:** Werden mit dem `site-review` Skill und Claude-in-Chrome durchgeführt. Dieser Ansatz ist token-intensiv und akzeptiert technische Limitierungen (z.B. Rendering-Fehler), um eine menschenähnliche, kontextbezogene Design-Analyse zu ermöglichen.
- **Standardisierung der AI-UGC-Pipeline:** Die Erstellung von KI-generierten Videos folgt einer festen 5-Phasen-Pipeline mit zwei Pfaden: **Path A (Veo)** für filmische Stile und **Path B (OmniHuman)** für Talking-Head-UGC.
- **Self-Learning-System auf Supabase:** Das System zur Messung und Optimierung von Content-Performance ist auf einem dedizierten `ugc`-Schema in Supabase aufgebaut.
- **PDF-Generierung via Playwright:** Für die Erstellung von qualitativ hochwertigen, gebrandeten Dokumenten wie Rechnungen und Angeboten wird auf eine lokale HTML-zu-PDF-Pipeline mit Playwright gesetzt.
- **"Company Config"-Pattern für Multi-Entity-Daten:** Um Daten für verschiedene Entitäten sauber zu trennen, wird ein lokales Verzeichnis-Pattern genutzt. Jede Entität erhält einen eigenen Ordner mit einer `config.json` und zugehörigen Assets.
- **Projekt-Workspaces für Kontext-Trennung:** Anstatt alle Chats aus einem globalen Verzeichnis zu starten, wird für jedes Projekt ein eigener Workspace (`C:\Users\User\Claude\[projekt]\`) mit einer projektspezifischen `CLAUDE.md` angelegt. Dies stellt sicher, dass beim Start sofort der richtiger Kontext (Repo, Skills, Topic-Datei) geladen wird.
- **Strikte Trennung von System, Brain und Code:** Um die Wartbarkeit und Übersichtlichkeit zu gewährleisten, wird eine klare Drei-Ordner-Struktur durchgesetzt: **1. `~/.claude/` (System):** Der von Claude Code verwaltete Systemordner, der nicht manuell verändert wird (Ausnahme: `skills/`). **2. `~/Claude/` (Brain):** Das Steuerungszentrum für CLAW, das globale Konfigurationen (`MASTER.md`), Topic-Dateien, Skripte und Projekt-Workspaces enthält. **3. `~/Projects/` (Code):** Der Workspace für alle Code-Repositories, die von CLAW bearbeitet werden.
- **Webhook-Queue via Supabase Edge Function:** Um Webhooks von Cloud-Diensten (n8n, Make) zuverlässig zu empfangen, auch wenn der Laptop offline ist, wird eine Supabase Edge Function als immer erreichbarer Endpunkt genutzt, der Tasks in eine Supabase-Tabelle schreibt.
- **Veo Audio-Strategie:** Aufgrund des "Voice Drift"-Problems wird Veos native Audio-Generierung nicht für Dialoge verwendet. Der Standard-Workflow ist, Veo-Clips stumm zu generieren und mit einer konsistenten TTS-Stimme (ElevenLabs) zu overdubben.
- **Tool-Auswahl (Antigravity vs. Claude Code vs. Cowork):** Die klare Trennung der Tools ist entscheidend. **Antigravity (Gemini CLI):** Technische Ausführung. **Claude Code (CLAW):** Architekt und Stratege. **Claude Cowork:** Vereinfachte GUI-Version, für den aktuellen Anwendungsfall unterlegen.
- **GSC-Datenpipeline (n8n & Supabase):** Die Erfassung von Google Search Console Daten wird über einen dedizierten n8n-Workflow ("GSC Daily Data Collector v3") standardisiert, der in drei separate Supabase-Tabellen (`gsc_history`, `gsc_daily_summary`, `gsc_queries`) schreibt und Datenverzögerungen durch ein 7-Tage-Fenster mit UPSERT-Logik kompensiert.
- **Canva AI Generator als gescheitert betrachtet:** Die `generate-design` API ist für spezifische, asset-basierte Aufgaben unzuverlässig und unbrauchbar.
- **Agenten-Logik in `SKILL.md` auslagern:** Komplexe, autonome Tasks (wie die SEO-Loops `seo-loop-st-automatisierung` / `seo-loop-profilfoto-ki` oder die LinkedIn-Agenten `linkedin-monday` / `linkedin-wednesday` / `linkedin-friday`) werden nicht mehr in JavaScript-Dateien hartcodiert. Stattdessen wird ihre gesamte Konfiguration und Strategie in einer `SKILL.md`-Datei im Skill-Verzeichnis definiert.
- **Multi-Source-RAG für Content-Generierung:** Um die Qualität von KI-generiertem Content sicherzustellen, wird ein strikter, mehrstufiger Rechercheprozess durchgesetzt. Der Agent muss Daten aus Pinecone und Live-Web-Suchen kombinieren und in einer expliziten "Fakten-Liste" sammeln, die als alleinige Quelle für den Schreibprozess dient.
- **Agenten-Fokus pro Domain:** Während **interaktive Sessions** projektübergreifend für jede Domain stattfinden können (wie im `apexx-bau.de`-Projekt demonstriert), bleiben die **autonomen Agenten-Loops** (ursprünglich claw-daily-agent, heute pro Domain eigene Scheduled Tasks wie `ki-auto-daily-execution`) pro Domain getrennt, um Kontext-Konflikte zu vermeiden. Der initiale Fokus des autonomen Loops liegt auf `ki-automatisieren.de`.
- **Einführung einer gestaffelten Autonomie für Deployments:** Um die Effizienz der autonomen Agenten zu maximieren und gleichzeitig die Sicherheit zu gewährleisten, wurde eine gestaffelte Freigabe-Logik für Deployments eingeführt. Risikoarme, leicht rückgängig zu machende Änderungen (z.B. Title/Meta-Tag-Optimierungen) dürfen von den Agenten vollautonom und ohne manuelle Freigabe live gestellt werden. Substantiellere Änderungen (neuer Content, Code-Anpassungen) werden vom Agenten fertig implementiert und committet, der finale `git push` erfordert jedoch eine explizite Bestätigung. Dies schafft einen Kompromiss zwischen Geschwindigkeit und Kontrolle.
- **Autonomer LinkedIn Content-Agent:** Ein dedizierter Agent postet dreimal wöchentlich (Mo, Mi, Fr) Inhalte auf LinkedIn. Die Strategie basiert auf drei Säulen (News, Anwendungsfall, Meinung) und ist in einer `SKILL.md` festgeschrieben.
- **Organischer Lern-Loop für Content:** Anstatt alte Posts manuell zu importieren, baut der LinkedIn-Agent seine Wissensbasis organisch auf. Jeder neue Post wird in Supabase gespeichert und dient als Stil-Referenz für zukünftige Posts.
- **Direktes Posten ohne Freigabe:** Um maximale Autonomie zu erreichen, postet der LinkedIn-Agent direkt über die API, ohne auf eine manuelle Freigabe zu warten. Das Vertrauen liegt in der Qualität der `SKILL.md`-Strategie.
- **"Quality-Only" Seiten-Generierung (statt "Thin Content + noindex"):** Um Build-Zeiten zu optimieren und den Fokus auf wertvolle Seiten zu legen, wurde die Strategie für programmatische SEO-Projekte (wie `apexx-bau.de`) geändert. Anstatt tausende potenzielle Keyword-Seiten zu generieren und die ohne Inhalt auf `noindex` zu setzen, werden jetzt nur noch Seiten generiert, für die bereits angereicherter Content (z.B. aus CSV-Briefings oder NotebookLM-Recherchen) existiert. Dies reduziert die Anzahl der Build-Artefakte drastisch (z.B. von 1.393 auf 53) und stellt sicher, dass jede live geschaltete URL einen echten Mehrwert bietet.
- **Migration des Agenten-Loops zum internen Claude Code Scheduler:** Der primäre autonome Agenten-Loop wurde von Windows Task Scheduler-gesteuerten `.mjs`-Skripten auf den internen Scheduler von Claude Code umgestellt, der `SKILL.md`-basierte Tasks ausführt. Dies zentralisiert die Agenten-Logik und -Ausführung innerhalb der Claude-Umgebung, vereinfacht die Verwaltung und ermöglicht eine schnelle Wiederherstellung der Zeitpläne aus den `SKILL.md`-Definitionen nach einer Neuinstallation.
- **Implementierung eines "Catch-Up"-Agenten für Scheduler-Zuverlässigkeit:** Um die Schwäche des Claude Code Schedulers zu kompensieren, der verpasste Tasks nicht nachholt, wurde ein `morning-catchup` Meta-Agent entwickelt. Dieser Agent läuft einmal täglich nach dem Hauptzeitfenster der Tasks, prüft die Agenten-Logs und führt alle verpassten Tasks nachträglich aus. Diese Architektur stellt die tägliche Ausführung des autonomen Loops sicher, auch wenn das System zum geplanten Zeitpunkt nicht aktiv war.
- **Zweigeteilter SEO-Agenten-Loop (Weekly Strategy, Daily Execution):** Die autonome SEO-Steuerung ist in zwei Agenten mit klarer Aufgabentrennung aufgeteilt. Der **Weekly Agent** agiert als Stratege, analysiert GSC-Daten und Konkurrenz, und legt die Ziele für die Woche fest. Anstatt nur eine `SEO-PLAN.md`-Datei zu pflegen, schreibt der Strategie-Agent konkrete, ausführbare Tasks in eine zentrale Supabase-Tabelle (ursprünglich `claw.webhook_queue`, gedroppt 2026-04-19 — Tasks laufen heute direkt ohne Queue). Der **Daily Agent** ist der Umsetzer, der diese Queue als primäre Aufgabenquelle nutzt und nur bei leerer Queue eine eigene Ad-hoc-Analyse durchführt. Diese Architektur entkoppelt Strategie von Ausführung und schafft einen robusten, datenbankgestützten Workflow.
- **Priorisierung von SEO-Tasks durch einen mehrstufigen Funnel:** Der Daily Agent arbeitet nicht zufällig, sondern folgt einer strikten, 7-stufigen Prioritätenliste (A-G: CTR-Fix → Content-Upgrade → BAFA-Vorrang → Neue Seite → Technisch → PageSpeed → Visuell). Dies stellt sicher, dass immer die Aufgaben mit dem höchsten erwarteten ROI zuerst erledigt werden.
- **Visueller Audit als Teil des SEO-Prozesses:** Der SEO-Agent verlässt sich nicht nur auf Code und Daten. Ein fester Schritt im täglichen Prozess ist ein visueller Audit, bei dem der Agent die Seite über die Browser-Automation öffnet, Screenshots von Desktop und Mobile anfertigt und eine 9-Punkte-Checkliste (Hero, Animationen, CTAs, Whitespace etc.) abarbeitet, um die Seite wie ein menschlicher Nutzer zu bewerten.
- **Integration von PageSpeed-Checks in den autonomen Loop:** Um den SEO-Prozess End-to-End zu automatisieren, wurde ein kritischer Schritt in den Daily Loop integriert. Nach jedem Deploy führt der Agent einen PageSpeed-Check via API durch, um die Performance-Metriken zu validieren und zu protokollieren.
- **Aktiver Backlink-Aufbau durch "Linkable Assets":** Anstatt nur auf passive Links zu hoffen, werden gezielt Inhalte wie Statistik-Seiten ("KI Statistiken Deutschland 2026") und interaktive Tools (ROI-Rechner) erstellt, um als "Link-Magneten" zu dienen. Dies wird durch grundlegende Verzeichnis-Einträge (wlw, Gelbe Seiten) ergänzt.
- **Umgang mit Claude Code Projekt-Duplikaten:** Es wurde entschieden, das Problem der duplizierten Projektordner (`~/.claude/projects/`) als unumgehbares Verhalten von Claude Code zu akzeptieren. Anstatt zu versuchen, die Erstellung durch starre Startpfade zu verhindern (was unpraktikabel ist), wird das Problem durch regelmäßige, manuelle Bereinigung der verwaisten Ordner gelöst.
- **Umgang mit "Persönlichen Plugins":** Es wurde festgestellt, dass "Persönliche Plugins" (wie das 'Marketing'-Plugin) über die Desktop-App-UI verwaltet werden und ihre Skill-Dateien nicht im lokalen Dateisystem gecached werden. Dies bedeutet, dass CLAW keinen direkten Lesezugriff auf ihre `SKILL.md`-Dateien hat, im Gegensatz zu Marketplace-Plugins. Die Interaktion mit diesen Skills muss daher über die UI oder durch manuelles Kopieren der Skill-Definitionen erfolgen.
- **Abschaffung der Edge Function für URL-Normalisierung:** Um einen 21-tägigen Ausfall durch eine Redirect-Schleife zu beheben und die Infrastruktur zu vereinfachen, wurde die 'url-normalize.ts' Edge Function deaktiviert. Die Normalisierung von URLs (Trailing Slashes, Lowercase) wird nun nativ und zuverlässiger durch die "Pretty URLs"-Einstellung von Netlify gehandhabt.
- **Lösung von Keyword-Kannibalisierung durch Canonical Overrides:** Anstatt Seiteninhalte zu entfernen, wird Keyword-Kannibalisierung (z.B. zwischen /chatbot/ und /losungen/kundenservice-automatisierung/) gezielt durch das Setzen von `rel="canonical"`-Tags auf der sekundären Seite gelöst. Dies wurde durch eine `canonicalOverride`-Prop im Astro-Layout implementiert.
- **Freemium-Modell mit Wasserzeichen für `profilfoto-ki.de`:** Um die Einstiegshürde zu senken, wurde ein Freemium-Modell eingeführt. Jeder neue Nutzer erhält genau einen kostenlosen Credit. Das damit generierte Bild wird mit einem Wasserzeichen versehen, um den Anreiz für einen Kauf zu schaffen.
- **Serverseitige Logik für Wasserzeichen-Status:** Die Entscheidung, ob ein Bild ein Wasserzeichen erhält, wird nicht im Frontend oder im n8n-Workflow getroffen, sondern direkt in der Datenbank. Ein `BEFORE INSERT`-Trigger auf der `photo_generations`-Tabelle prüft den `has_purchased_credits`-Status des Nutzers und setzt das `is_watermarked`-Flag auf dem neuen Datensatz. Dies entkoppelt die Geschäftslogik von der Ausführungsebene und macht das System robuster.
- **Wasserzeichen-Implementierung via Prompt-Injection:** Da die n8n Cloud-Umgebung keine Bildbearitungsbibliotheken wie `sharp` oder `jimp` zulässt, wird das Wasserzeichen nicht als Overlay auf das fertige Bild gelegt. Stattdessen wird der Wasserzeichen-Text direkt in den Gemini-Prompt injiziert, sodass das KI-Modell das Wasserzeichen als Teil des Bildes rendert.
- **Aktivierung der End-to-End Stripe-Integration:** Die Monetarisierung von `profilfoto-ki.de` wurde durch die vollständige Konfiguration und Aktivierung der Stripe-Anbindung abgeschlossen. Dies umfasst die `create-checkout` und `stripe-webhook` Supabase Edge Functions, die mit den Live-API-Keys (`sk_live_...` und `whsec_...`) als Secrets konfiguriert sind.
- **Persistente Audits im Projekt-Repository:** Umfassende Analysen (z.B. GSC-Komplett-Audits) werden als datierte Markdown-Dateien direkt im jeweiligen Projekt-Repository gespeichert. Dies schafft eine nachvollziehbare, versionierte Historie des Projektstatus und der Datengrundlage für strategische Entscheidungen.
- **Zentrales Lead-Tracking (st-automatisierung.de):** Anstatt auf unzuverlässige `mailto:`-Links zu setzen, werden alle Kontaktanfragen über ein zentrales Formular erfasst. Eine Supabase Edge Function speichert die Daten in einer `st_leads`-Tabelle, und ein n8n-Webhook triggert eine Benachrichtigung. Dies schafft eine zentrale, nachverfolgbare Lead-Datenbank.
- **Umgang mit Supabase Anon Keys in Git-Historie:** Es wurde entschieden, Anon Keys nicht zu rotieren oder die Git-Historie zu bereinigen, selbst wenn sie versehentlich erwähnt wird. Diese Keys sind per Design öffentlich; der Schutz wird durch Row Level Security (RLS) gewährleistet, nicht durch die Geheimhaltung des Keys. Dies gilt nicht für Service Role Keys.
- **Manuelle Absicherung von Netlify Env Vars:** Umgebungsvariablen in Netlify, insbesondere API-Keys, werden manuell über das Dashboard als "Secret" markiert. Dies verhindert, dass ihre Werte in den Build-Logs erscheinen, und ist eine etablierte Best Practice.
- **Priorisierung von Code-Audits über visuelle Audits bei Asset-Nutzung:** Nach dem Scheitern eines großangelegten visuellen Audits (aufgrund von technischen Problemen mit Screenshots) wurde ein code-basiertes Audit der Bild-Nutzung auf `profilfoto-ki.de` durchgeführt. Dieses war deutlich schneller und effektiver und deckte kritische Inkonsistenzen auf (z.B. 1 Hero-Bild für 25 Seiten). Code-basierte Analysen sind daher für solche Aufgaben zu bevorzugen.
- **Standardisierung der Prompt-Erstellung für visuelle Assets:** Um die visuelle Konsistenz bei der Erstellung neuer Bilder (z.B. Hero-Bilder) zu gewährleisten, wird auf einen etablierten Prompt-Guide (Nano Banana 6-Block-System) zurückgegriffen. Dies stellt sicher, dass neue Assets dem bestehenden Stil entsprechen.
- **Automatisierung der URL-Indexierung via APIs (Google Indexing & IndexNow):** Um den ineffizienten und limitierten manuellen Prozess der URL-Einreichung in der Google Search Console (10-15 URLs/Tag) abzulösen, wird eine zweigleisige API-Strategie verfolgt. **1. Google Indexing API (Priorität):** Obwohl offiziell nur für Jobs/Events, wird diese API als "geduldeter" Weg genutzt, um die Indexierung massiv zu beschleunigen (bis zu 200 URLs/Tag). Das Risiko wird als gering eingeschätzt (im schlimmsten Fall Ignorieren der Anfrage). Die Implementierung erfolgt über einen n8n-Workflow, der nach jedem Deploy die Sitemap parst und die URLs an die API sendet. **2. IndexNow (Ergänzung):** Als offener, risikofreier Standard wird IndexNow parallel genutzt. Dies erreicht primär Bing und andere Partner, sendet aber auch positive Signale, die Google beobachten kann. Diese kombinierte Strategie ersetzt den manuellen Prozess vollständig und ist ein Kernbestandteil der CI/CD-Pipeline.
- **Installation des offiziellen DataForSEO MCP:** Um die SEO-Analysefähigkeiten zu erweitern, wurde der offizielle DataForSEO MCP-Server recherchiert und konfiguriert. Die Anmeldeinformationen wurden aus der bestehenden Antigravity-Konfiguration übernommen, was eine schnelle Inbetriebnahme ermöglichte.
- **Bewusste Entscheidung gegen einen GSC MCP:** Nach einer detaillierten Prüfung der bestehenden n8n-Datenpipeline wurde entschieden, keinen dedizierten GSC MCP zu installieren. Die Pipeline liefert bereits täglich alle relevanten Daten (inkl. Seiten- und Query-Ebene) nach Supabase. Ein historischer Backfill wurde durchgeführt, um die Datenbasis zu vervollständigen. Direkte SQL-Abfragen auf diese Daten sind für die autonomen Agenten effizienter und zuverlässiger als Live-API-Calls über einen MCP.
- **Installation des offiziellen Google Analytics 4 MCP:** Um direkte Abfragen von Analytics-Daten zu ermöglichen, wurde der neu veröffentlichte, offizielle Google Analytics 4 MCP installiert. Die Einrichtung erforderte die Konfiguration eines Google Cloud Projekts, die Aktivierung der notwendigen APIs, die Erstellung von OAuth-Credentials und die Behebung eines Bugs im MCP-Server-Code (stdout/stderr-Konflikt), der das Starten verhinderte.
- **Permanente Erhöhung des MCP-Timeouts für GA4:** Um die extrem lange Ladezeit (~18s) der Google Python-Bibliothek des GA4 MCP abzufangen, wurde eine systemweite Umgebungsvariable unter Windows (`setx MCP_TIMEOUT 60000`) gesetzt. Dies erhöht das Startup-Timeout von Claude Code auf 60 Sekunden und stellt eine stabile Verbindung sicher, ohne dass komplexe Code-Patches am MCP-Server selbst nötig sind.
- **Entwicklung eines domänenspezifischen SEO-Plugins:** Anstelle einer generischen Lösung wurde ein modulares, 4-stufiges SEO-Plugin (`st-auto-seo`) entwickelt, das den gesamten Funnel von Domain Authority (Stage 0) über Impressionen (Stage 1) und Klicks (Stage 2) bis zu Conversions (Stage 3) abdeckt. Die Priorisierung von Domain Authority durch automatisierte Branchenbuch-Einträge via Browser-Automation wurde als initialer Hebel für neue Domains etabliert.
- **Bewusste Entscheidung gegen den "SEO Machine" Workspace:** Das populäre GitHub-Repo wurde analysiert und als Inspiration genutzt, aber bewusst nicht direkt übernommen. Stattdessen wurde ein eigener, modularer Plugin-Ansatz gewählt, der besser in die bestehende CLAW-Architektur und die domänenspezifischen Anforderungen integriert ist.
- **Anbindung von SerpApi über den offiziellen, Remote-gehosteten MCP:** Um die SERP-Analysefähigkeiten zu erweitern, wurde der offizielle, von SerpApi selbst gehostete MCP-Server integriert. Dies vermeidet die Notwendigkeit einer lokalen Installation und Wartung und nutzt die einfachste, vom Anbieter empfohlene Methode, bei der der API-Schlüssel direkt in die MCP-URL eingebettet wird.
- **Dekodierung von Antigravity-Chats via LanguageServer API:** Anstatt zu versuchen, das proprietäre/verschlüsselte `.pb`-Format der Antigravity-Chats direkt zu parsen, wurde ein Python-Skript entwickelt, das über die lokale LanguageServer API des laufenden Antigravity-Clients die Chats im Klartext abruft. Dies ist der einzig zuverlässige Weg, um auf die Daten zuzugreifen.
- **Verzicht auf Perplexity-Automatisierung aufgrund von ToS-Verletzungen:** Die Idee, Perplexity.ai über Browser-Automatisierung für Deep Research zu nutzen, wurde nach Prüfung der Nutzungsbedingungen verworfen. Das Risiko eines Account-Bans ist zu hoch. Stattdessen wird auf die nativen Research-Funktionen des gewählten `nvk/llm-wiki`-Frameworks gesetzt.
- **Bewusste Entscheidung gegen Claude Managed Agents für die Kern-Architektur:** Nach einer Analyse wurde festgestellt, dass es sich bei Managed Agents nicht um eine Cloud-Version von Claude Code handelt, sondern um ein separates System auf Basis des **Claude Agent SDK**. Die Agenten laufen in einer **isolierten, ephemeren Sandbox-Umgebung** (z.B. Docker-Container) ohne persistenten Zugriff auf das lokale Dateisystem. Diese Architektur ist fundamental **inkompatibel mit dem CLAW-System**, das auf dem direkten, zustandsbehafteten Zugriff auf lokale Verzeichnisse wie `~/.claude/` (System), `~/Claude/` (Brain) und `~/Projects/` (Code-Repositories) angewiesen ist. Daher wird die bestehende Architektur, die auf der Claude Code CLI und lokal ausgeführten, `SKILL.md`-basierten Tasks beruht, beibehalten, da sie die erforderliche Kontrolle und den Zugriff auf die lokale Umgebung bietet.
- **Refinement des täglichen SEO-Agenten (`ki-auto-daily-execution`):** Der Agent wurde vereinfacht und fokussiert sich nun auf einen rein datengetriebenen Workflow (GSC-Analyse → Code-Änderung → Deploy). Auf potenziell fehleranfällige Schritte wie den visuellen Audit via Browser-Automation oder automatisierte PageSpeed-Checks innerhalb des täglichen Loops wird bewusst verzichtet, um die Robustheit und Zuverlässigkeit zu erhöhen. Die Kernlogik ist nun direkt in der `SKILL.md` definiert, was die Wartbarkeit verbessert.
- **Verzicht auf `nvk/llm-wiki` Skills zugunsten von Supabase-Suche:** Die `/wiki:*` Skills des installierten `nvk/llm-wiki` Frameworks sind nicht mit der bestehenden Ordnerstruktur des Obsidian Vaults kompatibel. Anstatt die Vault-Struktur anzupassen, wurde entschieden, die Skills zu ignorieren und stattdessen vollständig auf die bereits implementierte, robuste Supabase-Semantiksuche über den `claw-research.mjs`-Hook zu setzen. Dies nutzt die bestehende, funktionierende Architektur und vermeidet einen aufwändigen Umbau.