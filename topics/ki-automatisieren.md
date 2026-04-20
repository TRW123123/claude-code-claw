> Letztes Update: 2026-04-19

## Projekt: ki-automatisieren.de
- **Domain:** ki-automatisieren.de
- **Repo:** C:/Users/User/Projects/ki-automatisieren-astro (GitHub: TRW123123/ki-automatisieren)
- **Workspace:** C:/Users/User/Claude/ki-automatisieren (enthält projekt-spezifische `CLAUDE.md`)
- **Stack:** Astro SSG, Tailwind, TypeScript
- **Hosting:** Netlify, Branch: master, auto-deploy aktiv

## Projekt: profilfoto-ki.de
- **Domain:** profilfoto-ki.de
- **Repo:** C:/Users/User/Projects/profilfoto-ki-static
- **Workspace:** C:/Users/User/Claude/profilfoto-ki (enthält projekt-spezifische `CLAUDE.md`)
- **Stack:** Statisches HTML, Tailwind CSS, Node.js (Build-Skript für pSEO)
- **Hosting:** Netlify

## Projekt: ST-Strategieberatung UG
- **Domain:** st-automatisierung.de
- **Repo:** C:/Users/User/Projects/strategie-beratung
- **Stack:** Astro 5.1, Tailwind CSS
- **Hosting:** Netlify
- **Spezifische Agenten-Regeln:** Positionierung auf Beratungs-Intent (Strategie, BAFA, Compliance), keine AI-Floskeln ("nahtlos", "revolutionär"), alle internen Links mit Trailing Slash, neue Seiten benötigen FAQ oder ROI-Daten, BAFA-Badge für relevante Inhalte.

## Projekt: <BUSINESS_EXAMPLE> UG
- **Domain:** <BUSINESS_EXAMPLE> (301-Redirect von `<BUSINESS_EXAMPLE>`)
- **Repo:** C:/Users/User/Projects/sanper-vision-astro
- **Workspace:** C:/Users/User/Claude/<BUSINESS_EXAMPLE> (enthält projekt-spezifische `CLAUDE.md`)
- **Stack:** Astro 5, React 19, Tailwind CSS v4, shadcn/ui, Framer Motion
- **Hosting:** Netlify

## Projekt: Pratik Yapay Zeka
- **Domain:** yapayzekapratik.com
- **Repo:** C:/Users/User/Projects/Pratik Yapay Zeka/pratik-yapay-zeka-astro (GitHub: TRW123123/pratik-yapay-zeka-astro)
- **Stack:** Astro, Supabase
- **Hosting:** Netlify (serene-macaron-4b56d2)

## Autonomes Agenten-System (CLAW)
Ein autonomes KI-Agenten-System, das auf dem Prinzip "Claude Code IS der Agent" basiert. Es gibt keinen separaten Agenten-Layer; Claude Code selbst agiert als autonomer Agent, gesteuert durch eine Infrastruktur aus Skripten, Hooks und Datenbanken.
- **Architektur-Prinzip:** Claude Code speichert keine Chat-Historie. Der Kontext wird ausschließlich über das Dual-Layer Memory System, das Activity Log und Agenten-Logs zwischen Sessions persistiert. Die System-Infrastruktur ist klar getrennt: Claude Code Engine (`~/.claude`), CLAW Brain (`~/Claude/`) und Projekt-Repos (`~/Projects/`).
- **AKTUALISIERT: "LLM Wiki as a Codebase" (Karpathy-Pattern) & Obsidian Knowledge Vault:** Das System wurde von klassischem RAG auf ein neues Paradigma umgestellt. Statt bei jeder Anfrage rohe Daten zu durchsuchen, baut und pflegt das LLM aktiv eine eigene, strukturierte Wissensbasis (das Obsidian Knowledge Vault). Das LLM agiert als "Redakteur" des Systemgedächtnisses, nicht nur als Antwortgeber. Dies führt zu einem tieferen, kontextuellen Verständnis und einer drastischen Reduzierung des Token-Verbrauchs.
  - **Vault-Pfad:** `C:/Users/User/obsidian-claw-vault/`
  - **Zweck:** Konsolidierung allen Wissens aus fragmentierten Quellen in eine einzige, durchsuchbare und visuell navigierbare Wissensbasis. Dient als "Langzeitgedächtnis" des gesamten Systems.
  - **Integrierte Quellen:**
    - **Claude Code:** 331 Chat-Transkripte (`.jsonl`)
    - **Antigravity:** 97 Konversationen (aus verschlüsselten `.pb`-Dateien extrahiert)
    - **ChatGPT:** 1.447 Chat-Exporte
    - **Project Files:** 192 relevante Markdown-Dateien (`SKILL.md`, `README.md` etc.) aus dem `Projects`-Ordner
    - **PDFs & Docs:** 56 destillierte Wiki-Artikel aus lokalen PDFs, Google Drive und DataForSEO-Exporten.
    - **Pinecone:** 376 Records aus dem `wissenspeicher`-Index (primäres Projektwissen) wurden exportiert und in 5 hochkonzentrierte Wiki-Artikel destilliert, die das nicht-reproduzierbare Erfahrungswissen des Systems enthalten.
  - **Status:** Der Vault wurde mit über 2.100 Notizen erfolgreich erstellt. Alle Quellen wurden konvertiert, bereinigt und mit automatischen `[[Wiki-Links]]` vernetzt. Das `nvk/llm-wiki` Framework wurde als Claude Code Plugin installiert, um das Vault aktiv mit LLM-Intelligenz zu verwalten. Ein täglicher, lokaler Scheduled Task (`CLAW-Wiki-Sync`) hält den Supabase Vektor-Index mit dem Vault synchron.
- **NEU: 4-Layer-Architektur-Modell:** Für komplexe, wiederverwendbare Automatisierungen wird ein 4-stufiges Modell angestrebt:
    1.  **Skills (Fähigkeit):** Die unterste Ebene, die eine rohe Fähigkeit bereitstellt (z.B. Playwright CLI ansteuern).
    2.  **Sub-Agents (Skalierung):** Spezialisierte Agenten, die einen Skill nutzen, um eine bestimmte Aufgabe zu erfüllen und parallelisiert werden können.
    3.  **Commands/Prompts (Orchestrierung):** Wiederverwendbare Prompts, die Agenten-Teams für komplexe Workflows (z.B. ein kompletter UI-Test) spawnen und steuern.
    4.  **Task Runner (Wiederverwendbarkeit):** Eine oberste Schicht (z.B. `justfile`), die es Menschen und anderen Agenten ermöglicht, komplexe Workflows mit einfachen Befehlen (`j ui-review`) zu starten.
- **Projekt-Workspaces:** Jeder Chat wird aus einem dedizierten Projekt-Ordner (`C:/Users/User/Claude/<projekt>/`) gestartet. Eine `CLAUDE.md` in jedem Ordner sorgt für sofortigen, korrekten Kontext (relevante Topic-Dateien, Skills, Repo-Pfade). Der Workspace "Open Claw" dient als zentraler Orchestrator für systemübergreifende Tasks.
- **System-Analyse (`/insights`):** Ein internes Claude Code Kommando (`/insights`) analysiert alle lokalen Session-Daten der letzten 30 Tage und generiert einen HTML-Report. Dieser Report identifiziert Verhaltensmuster, Projekt-Fokus, Reibungspunkte (z.B. fehleranfällige Browser-Automatisierung, Projekt-Verwechslungen) und schlägt konkrete Verbesserungen für Workflows und `CLAUDE.md`-Regeln vor. Eine manuelle "Chat-Archäologie" im Rahmen der Vault-Erstellung deckte kritische Probleme wie Workspace-Fragmentierung und Cross-Contamination auf.
- **Autonomes Task-Management (Claude Code Scheduler):** Die Steuerung der autonomen Agenten erfolgt ausschließlich über den internen Scheduler von Claude Code. Dieses System ersetzt die frühere, auf dem Windows Task Scheduler basierende Architektur für Cloud-basierte, wiederkehrende Aufgaben.
  - **Geplante Tasks:** Ein Set von 9 aktiven, spezialisierten Tasks (`ki-auto-daily-execution`, `ki-auto-weekly-strategy`, `seo-loop-st-automatisierung`, `seo-loop-profilfoto-ki` etc.) führt datengetriebene SEO- und Content-Aufgaben für die Projekte `ki-automatisieren.de`, `st-automatisierung.de` und `profilfoto-ki.de` aus.
  - **Status:** Die Tasks sind registriert und werden getriggert. Die `SKILL.md`-Dateien für die Tasks von `st-automatisierung.de` und `profilfoto-ki.de` wurden mit der korrekten Logik befüllt und ersetzen die alte Platzhalter-Logik. Die restlichen Tasks enthalten noch eine zirkuläre Selbstreferenz.
  - **Zeitplan:** Alle Tasks sind so geplant, dass sie werktags ab ca. 07:00 Uhr gestaffelt starten.
  - **Catch-Up-Mechanismus:** Ein täglicher Meta-Agent (`morning-catchup`) läuft um 09:35 Uhr. Er prüft die Agenten-Logs des aktuellen Tages und führt alle Tasks aus, die aufgrund eines ausgeschalteten Laptops verpasst wurden. Dies stellt sicher, dass alle täglichen Aufgaben zuverlässig ausgeführt werden, solange der Laptop vor Mittag gestartet wird. Am 10.04. identifizierte und startete dieser Mechanismus erfolgreich den verpassten `ki-auto-daily-execution`-Task.
- **NEU: Lokales Task-Management (Windows Task Scheduler):** Für systemnahe Aufgaben, die direkten Zugriff auf das lokale Dateisystem benötigen (z.B. Log-Verarbeitung, Wiki-Synchronisation), wird der Windows Task Scheduler genutzt.
  - **`claw-session-processor`:** Läuft stündlich, verarbeitet neue Chat-Transkripte und aktualisiert Supabase sowie die Topic-Dateien.
  - **`CLAW-Wiki-Sync`:** Läuft täglich um 13:00 Uhr. Prüft, welche Wiki-Dateien im Obsidian Vault seit dem letzten Lauf geändert wurden, und synchronisiert nur die neuen Inhalte als Vektor-Embeddings nach Supabase. Ein Catch-Up-Mechanismus stellt sicher, dass verpasste Läufe nachgeholt werden.
- **Dual-Layer Memory System & Activity Log:**
  - **NEU: Activity Log (`claw.activity_log`):** Eine neue Supabase-Tabelle, die als Kurzzeitgedächtnis für Aktionen dient. Der Session Processor extrahiert am Ende jeder Session konkrete Aktivitäten ("Backlink bei wlw.de erstellt"), Entscheidungen und offene Punkte. Ein SessionStart-Hook lädt die Aktivitäten der letzten 7 Tage in den Kontext jedes neuen Chats, um Wissensverlust zwischen Sessions zu verhindern.
  - **Topic-Dateien (`/topics/*.md`):** Detaillierte, menschenlesbare Dokumente pro Projekt, die den aktuellen Stand, offene Punkte und Strategien enthalten. Dienen als primärer, token-effizienter Kontext. Werden vom Session Processor automatisch aktualisiert.
  - **Supabase Vector Store (`claw.memories`):** Speichert atomare, hochrelevante Informationen als Embeddings. Nutzt ein "Hippocampus"-System mit Importance Scoring, Deduplizierung und automatischem Decay. Die Deduplizierungs-Funktion (`upsert_memory`) wurde gefixt, um Duplikate über verschiedene Scopes hinweg zu erkennen; 94 Duplikate wurden archiviert. Dient als durchsuchbarer Index für das Obsidian Knowledge Vault.
- **AKTUALISIERT: GSC-Integration & Indexierungs-Automatisierung:** Die bisherige Methode, URLs via Browser-Automatisierung manuell in der GSC einzureichen, wurde als ineffizient und fehleranfällig identifiziert. Sie wird durch eine zweigleisige, API-basierte Strategie ersetzt:
    - **Google Indexing API:** Als primärer, skalierbarer Ersatz für das manuelle Einreichen bei Google. Der Agent nutzt die API, um neue oder geänderte URLs aktiv an Google zu "pushen". Obwohl die API offiziell nur für "JobPosting" und "BroadcastEvent" vorgesehen ist, wird sie als "Grauzonen"-Strategie zur Effizienzsteigerung eingesetzt. Das Risiko besteht in einer potenziellen Ignorierung der Anfragen, nicht in einer Bestrafung.
    - **IndexNow Protokoll:** Als risikofreier, offener Standard, um Suchmaschinen wie Bing, Yandex und Seznam über Änderungen zu informieren. Dies wird parallel zur Google-API implementiert, um eine breite und schnelle Indexierung sicherzustellen.
- **NEU: Kernkompetenz Visueller Website-Audit:** Ein neuer Skill (`/site-review`) wurde entwickelt, um Websites wie ein menschlicher Designer zu bewerten.
    - **Technologie:** Nutzt Claude-in-Chrome, um die Seite live zu "sehen" und zu interagieren.
    - **Methode:** Misst die Seitenhöhe per JS, scrollt einmal komplett, um Lazy-Loading-Inhalte zu triggern, und teilt die Seite dann in mathematisch exakte, überlappungsfreie Segmente auf. Jedes Segment wird für Desktop und Mobile einzeln per Screenshot erfasst und sofort auf 7 Kriterien (Layout, Typo, Bilder, etc.) analysiert.
    - **Zweck:** Qualitative Design- und UX-Analyse, die über technische Tests (z.B. mit Playwright) hinausgeht.
- **NEU: DataForSEO-Integration:** Der Agent hat verifizierten MCP-Zugriff auf die DataForSEO-API. Dies ermöglicht Live-Abfragen für SERP-Daten, Keyword-Recherchen, Backlink-Analysen und Wettbewerber-Checks und erweitert die SEO-Fähigkeiten über die GSC-Integration hinaus.
- **AKTUALISIERT: Google Analytics 4 (GA4) Integration:** Der Agent ist mit dem neuen, offiziellen Google Analytics 4 MCP (Machine-Code Protocol) verbunden. Dies ermöglicht direkten, programmatischen Zugriff auf GA4-Daten. Der Live-Zugriff wurde verifiziert; der Agent kann über Tools wie `get_account_summaries` und `run_report` Live-Abfragen für alle verknüpften Properties durchführen (Property-IDs und Kundennamen wurden zur Wahrung der Privatsphäre entfernt — siehe `<BUSINESS_EXAMPLE>` Platzhalter).

## NEU: Autonomes SEO-Plugin (ST-Automatisierung)
- **Ziel:** Ein datengetriebenes, modulares Plugin zur systematischen Steuerung aller SEO-Aktivitäten für eine spezifische Domain.
- **Pilot-Projekt:** `st-automatisierung.de`
- **Architektur:** Ein 4-stufiges Modell, das den gesamten SEO-Funnel abdeckt:
    - **Stufe 0 (Authority):** Messung der Domain Authority und Aufbau von Backlinks. Nutzt Chrome-Automatisierung für Branchenbuch-Einträge und (zukünftig) die DataForSEO API für Monitoring.
    - **Stufe 1 (Impressionen):** Identifizierung von Keyword- und SERP-Lücken zur Erstellung neuer, hochrelevanter pSEO-Seiten.
    - **Stufe 2 (Klicks):** Systematische Analyse und Optimierung der Click-Through-Rate (CTR) für bestehende Seiten mit hohem Potenzial.
    - **Stufe 3 (Conversions):** Analyse des Nutzerverhaltens (z.B. Bounce Rate, Verweildauer) via GA4 und Optimierung der Lead-Generierung.
- **Integration:** Das Plugin ist als Skill-Set (`.claude/skills/st-auto-seo/`) implementiert und wird von den bestehenden autonomen Tasks (`seo-loop-st-automatisierung`, `seo-gsc-weekly-review-st`) genutzt. Jede durchgeführte Aktion wird im `claw.changelog` protokolliert, um die Auswirkungen messbar zu machen.
- **Status:** Die Plugin-Struktur (6 Kerndateien) wurde erstellt und die autonomen Agenten wurden darauf umgestellt. Stufe 2 (Klicks) ist voll funktionsfähig. Eine System-Analyse ("Chat-Archäologie") hat ergeben, dass Stufe 0 (Authority) bewusst als Zukunftsthema geparkt wurde und nicht als aktiver Bug zu werten ist; die zugehörige Supabase-Tabelle `claw.domain_authority` ist daher erwartungsgemäß leer. Stufe 3 (Conversions) ist von der GA4-Integration abhängig, die nun funktionsfähig ist.

## Autonomer Content-Agent (LinkedIn)
Ein autonomer Agent erstellt und veröffentlicht Inhalte auf dem persönlichen LinkedIn-Profil von Safak Tepecik, gesteuert durch den internen Scheduler von Claude Code.
- **Tasks:** `linkedin-monday`, `linkedin-wednesday`, `linkedin-friday`.
- **Frequenz:** Jeden Montag, Mittwoch und Freitag um ca. 09:13 Uhr.
- **Strategie-Quelle:** Die gesamte Content-Strategie, Tonalität ("Quiet Authority"), Regeln und Frameworks (SLAY) sind in einer zentralen `SKILL.md`-Datei definiert, die der Agent bei jeder Ausführung lädt.
- **Content-Säulen (Türkisch):**
  - **Montag (Haber):** Trend-Jacking. Aktuelle KI-News (via WebSearch) mit einem Pivot für türkische B2B-Entscheider.
  - **Mittwoch (Anwendungsfall):** "Was wir bauen". Übersetzt technische Fortschritte aus den CLAW Topic-Dateien in greifbaren Mehrwert für KMUs.
  - **Freitag (Meinung):** "Was ich denke". Extrahiert persönliche Meinungen, Reaktionen und Learnings von Safak Tepecik direkt aus den wöchentlichen CLAW Session Logs.
- **Datenbank:** Jeder veröffentlichte Post wird zur Analyse und als zukünftige Stil-Referenz in der Supabase-Tabelle `claw.linkedin_posts` gespeichert.

## Interne Tools: Rechnungs-Generator
Ein lokales System zur automatisierten Erstellung von PDF-Rechnungen und Angeboten.
- **Repo:** C:/Users/User/Documents/Claude/invoices
- **Stack:** Python, Jinja2 (Templating), Playwright (HTML-zu-PDF-Rendering).
- **Architektur:**
  - Ein zentrales Skript (`generate.py`) generiert die PDFs.
  - Company-spezifische Konfigurationen (`/companies/<name>/config.json`) enthalten Stammdaten (Adresse, Steuernummer, IBAN), Branding (Farben, Schriftart) und das Logo.
  - Ein zentrales HTML/CSS-Template (`/templates/rechnung.html`) wird mit den Firmendaten befüllt.
- **Unterstützte Firmen:**
  - `ki-automatisieren` (Einzelunternehmen)
  - `ST-Strategieberatung UG` (ehemals ST Automatisierung)
  - `<BUSINESS_EXAMPLE> UG`

## Aktueller Stand
- **Pratik Yapay Zeka (yapayzekapratik.com):** Ein umfassendes Code-, Security- und SEO-Audit wurde durchgeführt. Kritische Fixes (XSS-Härtung im Kontaktformular, Implementierung von `Article` Schema für Case Studies, Hinzufügen von Twitter Meta-Tags) wurden erfolgreich deployed (Commit `d2471f8`). Die Git-Konfiguration wurde bereinigt (`.netlify/` aus Tracking entfernt) und die Supabase Environment Variables in Netlify wurden manuell als "Secret" markiert, um deren Sichtbarkeit in Build-Logs zu verhindern. Eine erste SEO-Analyse identifizierte fehlende Content-Tiefe und ein nicht existentes Backlink-Profil als größte Hebel für organisches Wachstum.
- **ST-Strategieberatung UG (st-automatisierung.de):** Ein umfassendes SEO-Audit wurde durchgeführt und zahlreiche On-Page- und technische Verbesserungen wurden umgesetzt.
    - **Technische SEO-Fixes:** Ein kritischer Bug, der durch JSON-LD-Schemas ohne Trailing Slash "Umleitungsfehler" in der GSC verursachte, wurde behoben. Die Sitemap wurde um dynamische `lastmod`-Einträge erweitert und ein `BreadcrumbList`-Schema wurde für alle 48 pSEO-Seiten implementiert.
    - **Content-Erweiterung:** Eine neue, 1.800 Wörter starke Pillar-Page zum Thema "KI-Strategieberatung" wurde erstellt und live geschaltet, um einen zentralen Content-Gap zu schließen. Die Titel von 3 wichtigen Lösungsseiten (`Angebote schreiben`, `Dokumentenextraktion`, `Personalakte digitalisieren`) wurden für eine höhere CTR und besseres Keyword-Matching optimiert.
    - **Indexierungs-Push:** 4 der wichtigsten, noch nicht indexierten Seiten wurden manuell in der GSC zur Indexierung eingereicht. Das Tageskontingent wurde erreicht; 5 weitere Seiten stehen für den nächsten Tag an. Eine Analyse identifizierte Keyword-Kannibalisierung als Hauptursache für die Indexierungsprobleme von 4 weiteren Seiten.
    - **Lead-Management-System:** Das bisherige `mailto:`-System wurde durch ein zentrales Lead-Management ersetzt. Ein neues Kontaktformular auf allen 48 pSEO-Seiten speichert Anfragen nun direkt in einer `st_leads`-Tabelle im zentralen Supabase-Projekt. Alle `cal.com`-Links wurden auf den korrekten Calendly-Link (`.../st-automatisierung-info/30min`) umgestellt.
    - **Off-Page-SEO:** Erste Backlinks wurden durch Einträge in Branchenverzeichnissen (`Gelbe Seiten`, `Das Örtliche`, `wlw.de`) aufgebaut.
    - **Datenkorrektur:** Der fälschlicherweise hinterlegte Name "Savaş Topçu" wurde systemweit in "<USER_NAME>" korrigiert.
    - **Autonomes 4-Stufen-SEO-Plugin implementiert:** Ein neues, modulares SEO-Plugin wurde speziell für diese Domain entwickelt und in die bestehenden täglichen und wöchentlichen autonomen Agenten integriert. Das Plugin steuert systematisch die Optimierung von Domain Authority, Impressionen, Klicks und Conversions. Der tägliche autonome SEO-Task (`seo-loop-st-automatisierung`) läuft stabil. In seinem Lauf am 10.04. identifizierte der Agent ein kritisches Problem: Obwohl die durchschnittliche Ranking-Position der Domain von ~40 auf ~17 gestiegen ist, verharrt die CTR bei nahezu 0%. Als erste Maßnahme wurde die Seite mit der größten CTR-Lücke (BAFA-Hauptseite, hohe Impressionen, 0 Klicks) optimiert. Title und Meta-Description wurden überarbeitet, um die Klickrate zu erhöhen und ein Em-Dash (Regelverstoß) wurde entfernt. Die Änderungen wurden deployed (Commit `6470e26`).
- **profilfoto-ki.de:** Ein umfassender GSC-Audit (3 Monate) offenbarte eine niedrige CTR von 0,7% und 0 externe Backlinks. Ein Bild-Audit deckte auf, dass ein generisches Hero-Bild auf 25 pSEO-Seiten wiederverwendet wurde; 17 davon wurden sofort korrigiert. Für die restlichen 11 wurde eine Prompt-Datei (`hero-image-prompts.md`) erstellt. Ein neuer, tiefgehender visueller Design-Audit mit dem `/site-review`-Skill wurde gestartet und deckte ein kritisches Design-Problem auf der Homepage auf: Ein ca. 1700px hoher, leerer Bereich trennt den Hero vom restlichen Inhalt. **Ein neuer, autonomer Daily-SEO-Task (`seo-loop-profilfoto-ki`) ist jetzt aktiv.** In seinem ersten Lauf identifizierte und behob der Agent die Seite mit der größten CTR-Lücke (`/ratgeber/coole-profilbilder/`), die bei über 750 Impressionen 0 Klicks aufwies. Title und Meta-Description wurden für den Search Intent optimiert und deployed (Commit `edf57e7`).
- **<BUSINESS_EXAMPLE> UG (<BUSINESS_EXAMPLE>):** Eine vollständige Sanierung des Projekts wurde durchgeführt und deployed. Die Architektur wurde von 1.393 Seiten (davon 1.352 Thin Content mit `noindex`) auf 53 qualitativ hochwertige Seiten reduziert. Eine neue Content-Pipeline (`generate -> merge -> enrich -> faqs -> meta`) wurde implementiert. 31 Landing Pages wurden mit "Deep Content" und individuellen Meta-Descriptions angereichert, 155 einzigartige FAQs mit Schema-Markup generiert und 8 ausführliche Ratgeber-Artikel (9.640 Wörter) erstellt und integriert. Kritische SEO-Fehler (www/non-www-Konflikt, doppelter robots-Tag, 404-Seiten mit GSC-Ranking) wurden behoben. Die Sitemap enthält nur noch 45 indexierbare Qualitäts-URLs.
- **ki-automatisieren.de:** Das Projekt wurde zur "Prototyp-Reife" gebracht. Die Seite umfasst jetzt 141 Seiten. Ein 40-seitiger pSEO-Cluster (`/{use-case}/{branche}/`) wurde auf Basis des COLOSSEUM-Blueprints gebaut. Das Blog-System wurde auf **17 Artikel** erweitert (3 neue Artikel zu Papierrechnungen, DATEV und Dokumentenextraktion). Zwei Hub-Seiten (`/prozessoptimierung`, `/prozesse-automatisieren`) und zwei "Ghost Pages" (`/chatbot`, `/marketing-automatisierung-ki`) wurden erstellt, um bestehende GSC-Rankings zu nutzen; Keyword-Kannibalisierung wurde durch `canonical`-Tags auf die jeweiligen Lösungsseiten behoben. Als neue "Linkable Assets" wurden eine Statistik-Seite ("KI Statistiken Deutschland 2026") und ein interaktiver ROI-Rechner (auf Homepage + 6 Lösungsseiten) implementiert. Erste Off-Page-SEO-Maßnahmen wurden durch Einträge bei `Gelbe Seiten`, `Das Örtliche`, `wlw.de` und `induux.de` umgesetzt. Ein Gastbeitrag-Pitch wurde an eine relevante Publikation gesendet. Meta-Titel und Descriptions für Top-Seiten (`/fallstudien/acilsatis/`, `/losungen/crm-prozessautomatisierung/`, `/losungen/kundenservice-automatisierung/`) wurden optimiert. Der tägliche autonome SEO-Task (`ki-auto-daily-execution`) läuft stabil. In seinem Lauf am 09.04. identifizierte der Agent ein **kritisches Indexierungsproblem**: Nur die Startseite ist bei Google indexiert. Als erste Maßnahme wurde der Titel und die Meta-Description der Startseite optimiert, um das Haupt-Ranking-Keyword "ki automatisierung" (Position ~55) besser zu bedienen. Eine weitere Analyse am 10.04. bestätigte das Indexierungsproblem als Kernursache aller SEO-Schwächen und identifizierte zudem Keyword-Kannibalisierung ('vertriebsautomatisierung' rankt auf der Homepage). Da Optimierungen nicht-indexierter Seiten wirkungslos sind, hat der Agent die Strategie auf die Erstellung neuer Inhalte umgestellt und die Arbeit an einem neuen Blog-Artikel zum Thema 'Angebotserstellung im Handwerk mit KI' begonnen.
- **Technisches SEO (ki-automatisieren.de):** Ein kritischer SEO-Bug, bei dem interaktive React-Komponenten (`client:visible`) für den Googlebot unsichtbar waren, wurde durch Umstellung auf `client:load` behoben. Eine fehlerhafte Netlify Edge Function für URL-Normalisierung wurde entfernt und durch Netlify's natives "Pretty URLs"-Feature ersetzt, was einen historischen 21-Tage-Ausfall behebt. Ein defektes OG-Fallback-Bild (`social-image.png`) wurde korrigiert. Der "Blog" wurde zur Desktop- und Mobile-Navigation hinzugefügt. Trailing-Slash-Inkonsistenzen im Blog-Index wurden behoben. Insgesamt wurden 11 kritische URLs (Statistik-Seite, Homepage, 6 Lösungsseiten, 3 neue Blog-Artikel) manuell in der GSC zur Indexierung eingereicht, um die Crawling-Frequenz zu erhöhen. Ein kritischer Bug, der den primären CTA-Modal auf der Startseite blockierte (doppelte Komponenten-Instanz führte zu fehlerhaftem Stacking Context), wurde identifiziert und behoben.
- **Infrastruktur (CLAW):** Eine Generalüberholung der CLAW-Infrastruktur wurde durchgeführt, die in der Umstellung auf ein neues Architektur-Paradigma gipfelte. **Ein zentrales Obsidian Knowledge Vault wurde erstellt**, das Chat-Transkripte (Claude Code, Antigravity, ChatGPT), Projektdokumente, PDFs, Google Drive-Inhalte und einen Pinecone-Export in einer einzigen, durchsuchbaren und vernetzten Wissensbasis mit über 2.100 Notizen konsolidiert. Dies löst das Problem der fragmentierten Wissenssilos und legt die Grundlage für das neue **"LLM Wiki as a Codebase"**-Architekturprinzip. Das `nvk/llm-wiki` Framework wurde als Claude Code Plugin installiert, um das Vault aktiv zu verwalten. Das gesamte Systemwissen wurde in 61 hochkonzentrierte Wiki-Artikel destilliert, darunter 5 Artikel aus dem primären Pinecone-Projektwissen.
- **Daten-Infrastruktur:** Der n8n-Workflow `CLAW – GSC Daily Data Collector v3` läuft stabil und befüllt die Supabase-Tabellen täglich. Die Domain `<BUSINESS_EXAMPLE>` wurde zur Konfiguration hinzugefügt; die ersten Daten werden in 1-2 Tagen erwartet. Ein manueller Backfill wurde durchgeführt, sodass die GSC-Daten in Supabase nun eine Historie von ca. 70 Tagen umfassen. Ein neuer, täglicher lokaler Task (`CLAW-Wiki-Sync`) hält den Supabase Vektor-Index mit dem Obsidian Knowledge Vault synchron.
- **LinkedIn-Agent:** Aktiv und auf den neuen Claude Code Scheduler umgestellt. Der Agent postet zuverlässig nach Zeitplan. Der "Freitags-Post" (Kisisel Hikaye) vom 10.04.2026 wurde erfolgreich erstellt und veröffentlicht; Thema war die emotionale Erkenntnis bei der Erstellung des Obsidian Knowledge Vaults.
- **Interne Tools:** Rechnungs-Generator unverändert. Das neue Obsidian Knowledge Vault ist live und einsatzbereit.

## Backlink-Strategie (ki-automatisieren.de)
Basierend auf zwei Deep Research Dokumenten (Claude + Grok, 02.04.2026) wurde eine umfassende Backlink-Strategie entwickelt. Die Dokumente liegen in Google Drive und enthalten 15+ Strategien mit konkretem Implementierungs-Roadmap.
- **Referenz-Dokumente (Google Drive):**
  - "Claude Deep Research SEO, Backlinks" (Doc-ID: `1-T3pvD3Uz37ZpSTsGuGu3C1JOmkKww35mi-hrJBKk-c`) — 15 Strategien, priorisierter Roadmap, deutsche Rechtsgrundlagen
  - "Grok Deep Research SEO, Backlinks" (Doc-ID: `10vzB2qTTvVABU5omvRjxhP4sWbhvVQh1u12FtqLj79Y`) — X/Twitter-Recherche, AI Link-Magnets, Directory-Hacks
- **Erledigt (Stand 04.04.2026):**
  - ✅ Gelbe Seiten — Eintrag eingereicht
  - ✅ Das Örtliche — Eintrag eingereicht
  - ✅ wlw.de — Eintrag eingereicht
  - ✅ induux.de — Eintrag eingereicht
  - ✅ KI Statistiken Deutschland 2026 — Linkable Asset Seite live (`/ki-statistiken-deutschland/`)
  - ✅ ROI-Rechner — auf Homepage + 6 Lösungsseiten als Tool-Magnet
  - ✅ Gastbeitrag-Pitch an selbstständig-magazin.de gesendet (Nachfassen bis 10.04.)
  - ✅ 11 URLs manuell in GSC zur Indexierung eingereicht
  - ✅ Testimonial an n8n eingereicht (03.04.2026) — Quote: autonomes Agenten-System, GSC→Supabase→SEO. Link: ki-automatisieren.de. Veröffentlichung: Yes. Auf Freigabe durch n8n Team warten.
- **Offen (nächste Schritte aus Roadmap):**
  - [ ] Google Business Profile Verifizierung abwarten
  - [ ] Recherchescout registrieren (Business-Tier, Kategorien: Digitalisierung, IT & Technologie)
  - [ ] Google Alerts für Brand-Monitoring einrichten
  - [ ] Testimonials an DeepL etc. schreiben (Backlink via Testimonial-Seiten)
  - [ ] Bitkom Get Started Membership (100€/Jahr) — Eintrag in Mitgliederliste
  - [ ] AI-Stockfoto-Pipeline: 20+ Bilder auf Unsplash/Pexels hochladen, Pixsy + Copytrack registrieren
  - [ ] Weitere Gastbeiträge pitchen (digital-magazin.de, Conplore, selbstständig-magazin.de)
  - [ ] Podcast-Pitches (KI Unternehmer, GENIUS ALLIANCE, Das Gelbe vom AI)
  - [ ] Broken Link Building via n8n automatisieren (IHK, Uni, Bitkom Seiten)
  - [ ] Infografiken mit Embed-Code erstellen und verteilen

## Daten-Infrastruktur (GSC-Monitoring)
- **System:** Ein n8n-Workflow (`CLAW – GSC Daily Data Collector v3`) sammelt täglich um 06:00 Uhr Daten aus der Google Search Console für die Domains `ki-automatisieren.de`, `profilfoto-ki.de`, `st-automatisierung.de`, `<BUSINESS_EXAMPLE>` und `<BUSINESS_EXAMPLE>`. Die Domain `yapayzekapratik.com` ist aktuell noch nicht integriert.
- **Speicherort:** Supabase-Projekt "NanoBanana" — **Project-ID: `<SUPABASE_PROJECT_ID>`** (Region: us-east-1)
- **MCP-Zugriff:** `mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__execute_sql` mit `project_id: "<SUPABASE_PROJECT_ID>"`
- **Datenbank-Tabellen:**
  - `gsc_history`: Tägliche Performance-Daten auf Seiten-Ebene (`page`).
  - `gsc_queries`: Tägliche Performance-Daten auf Keyword-Ebene (`query`).
  - `gsc_daily_summary`: Täglich aggregierte Performance-Daten auf Domain-Ebene.
  - `claw.memories`: Destillierte Learnings und Wiki-Inhalte als Vektor-Embeddings. Dient als durchsuchbarer Index für das Obsidian Vault.
  - `claw.activity_log`: Kurzzeitgedächtnis mit konkreten Aktionen, Entscheidungen und offenen Punkten aus jeder Session.
  - `claw.changelog`: Protokolliert jede autonome oder manuelle Änderung an einer Website (Seite, Typ, alter/neuer Wert, Grund, Commit).
  - `claw.webhook_queue`: Task-Liste für den autonomen Executor, wird vom Daily Agent befüllt.
  - `claw.keyword_research`: Gespeicherte Keywords für SEO-Analysen und Content-Erstellung.
  - `claw.projects`: Stammdaten der verwalteten Projekte/Domains.
  - `claw.site_audits`: Speichert Ergebnisse aus visuellen/technischen SEO-Audits (z.B. vom `/site-review` Skill).
  - `claw.domain_authority_history`: Wöchentlicher Snapshot der Domain Authority und Backlink-Metriken (benötigt DataForSEO Backlinks API).
  - `public.claw_processed_sessions`: Verhindert die doppelte Verarbeitung von Chat-Sessions.
  - `claw.linkedin_posts`: Speichert alle vom Agenten erstellten LinkedIn-Posts.
  - `public.st_leads`: Zentrales Lead-Tracking für st-automatisierung.de (Name, E-Mail, Nachricht, Quelle).
- **Status:** Die Datensammlung für bestehende Projekte läuft fehlerfrei. Ein manueller Backfill wurde durchgeführt, sodass die Daten in Supabase nun eine Historie von ca. 70 Tagen umfassen. Für `<BUSINESS_EXAMPLE>` wird der erste Datenfluss in 1-2 Tagen erwartet, nachdem die GSC-Property verifiziert wurde.

## Nächste Schritte / Offene Punkte
1.  **CLAW-System (Knowledge Management):** Die installierten `wiki:*` Skills (`/wiki:query`, `/wiki:research`) aktiv nutzen, um mit dem neuen Knowledge Vault zu interagieren und den 4-Phasen-Workflow (Ingest, Extract, Resolve, Schema) zu etablieren.
2.  **CLAW-System (Deep Research):** Den `/wiki:research` Skill für neue Deep-Research-Aufgaben verwenden, um Unique Content zu erstellen. Die Ergebnisse sollen direkt als neue, strukturierte Wiki-Artikel und Supabase-Embeddings gespeichert werden.
3.  **CLAW-System (Knowledge Management):** Den `/wiki:lint` Skill und die Obsidian Graph View nutzen, um die Qualität des Vaults zu überwachen (verwaiste Seiten, fehlerhafte Links, veraltete Inhalte identifizieren).
4.  **CLAW-System (Tasks):** Die 6 verbleibenden leeren `SKILL.md`-Dateien für die nativen Scheduled Tasks müssen aus den jeweiligen Projekt-Chats befüllt werden, um die alten `.mjs`-Skripte abzulösen.
5.  **CLAW-System (Tasks):** Die zwei verbleibenden neuen Scheduled Tasks für die SEO-Automatisierung von `<BUSINESS_EXAMPLE>` und ein `ai-ugc`-Projekt erstellen.
6.  **CLAW-System (Workflow-Optimierung):** Basierend auf dem `/insights`-Report: `postEdit`-Hooks in `settings.json` einrichten, um nach Code-Änderungen automatische Build-Checks (`npm run build`, `tsc`) auszuführen und Deployment-Fehler zu verhindern.
7.  **CLAW-System (Workflow-Optimierung):** Einen `/preflight`-Skill erstellen, der zu Beginn einer Aufgabe alle relevanten, bestehenden Skills auflistet, um zu verhindern, dass das Rad neu erfunden wird.
8.  **CLAW-System (Indexierung):** Einen n8n-Workflow für die **Google Indexing API** aufsetzen (Service Account erstellen, GSC-Verknüpfung), der nach Deployments automatisch neue URLs einreicht.
9.  **CLAW-System (Indexierung):** Einen parallelen Prozess (n8n oder Netlify Deploy Hook) für das **IndexNow-Protokoll** implementieren (API-Key generieren, im `public`-Ordner ablegen).
10. **CLAW-System (Infrastruktur):** Evaluieren, ob die autonomen Agenten im Headless-Modus auf einem Server (VPS/n8n) betrieben werden können, um die Abhängigkeit vom lokalen Laptop zu beseitigen und 24/7-Betrieb zu ermöglichen.
11. **CLAW-System (Architektur):** Das 4-Stufen-SEO-Plugin-Konzept als Blaupause für `profilfoto-ki.de` und `ki-automatisieren.de` adaptieren und ausrollen.
12. **CLAW-System (Testing):** Einen ersten Prototypen für token-effizientes, funktionales End-to-End-Testing mit Playwright ('Write vs. Run'-Methode) für das Projekt ki-automatisieren.de entwickeln.
13. **CLAW-System (Skills):** Den Skill `/analytics-report` implementieren, der den funktionsfähigen Google Analytics 4 MCP nutzt, um wöchentliche Traffic- und Engagement-Berichte für die Projekte zu erstellen.
14. **CLAW-System (Skills):** DataForSEO Backlinks API Abonnement evaluieren und aktivieren, um Stufe 0 (Authority Tracking) des SEO-Plugins für `st-automatisierung.de` freizuschalten.
15. **NEU: CLAW-System (Knowledge Management):** OCR-Funktionalität (z.B. via `tesseract`) implementieren, um den Inhalt von reinen Bild-PDFs (z.B. `Strategic_Agriculture_Intelligence.pdf`) zu extrahieren und für das Vault verfügbar zu machen.
16. **Pratik Yapay Zeka (Content):** Content-Tiefe für bestehende Seiten erhöhen (Ziel: 3.500+ Wörter), um mit Wettbewerbern gleichzuziehen.
17. **Pratik Yapay Zeka (Content):** Eine Blog-Strategie entwickeln und mit der Erstellung von Artikeln beginnen, um einen neuen organischen Traffic-Kanal aufzubauen.
18. **Pratik Yapay Zeka (Off-Page):** Eine grundlegende Backlink-Strategie entwickeln und mit dem Aufbau erster Links (z.B. Branchenverzeichnisse) beginnen.
19. **ki-automatisieren.de (Technisches SEO):** Kritisches Indexierungsproblem analysieren und beheben. Laut Agenten-Analyse vom 09.04. ist aktuell nur die Startseite indexiert, obwohl 141 Seiten existieren.
20. **ki-automatisieren.de (Off-Page):** Google Business Profile Verifizierung abwarten.
21. **ki-automatisieren.de (Off-Page):** Nachfassen beim `selbstständig-magazin.de` bezüglich des Gastbeitrag-Pitches.
22. **ki-automatisieren.de (Content):** Den Content-Plan aus `SEO-PLAN-2026.md` weiter umsetzen (KW15 ff.).
23. **ki-automatisieren.de (Technisches SEO):** Google Search Console Property für non-www verifizieren, um www/non-www-Split in den Daten zu beheben.
24. **ki-automatisieren.de (Technisches SEO):** Autoren-Fotos und individuelle OG-Bilder für Blog-Artikel implementieren, um E-E-A-T und Social-Sharing-Previews zu verbessern.
25. **ki-automatisieren.de (Performance):** Google Fonts lokal hosten, um externe Anfragen zu reduzieren und LCP zu verbessern.
26. **ki-automatisieren.de (Technisches SEO):** CSP-Header härten (unsafe-inline und unsafe-eval entfernen).
27. **profilfoto-ki.de (Content):** Die 11 fehlenden, themenspezifischen Hero-Bilder mithilfe der `hero-image-prompts.md` generieren und integrieren.
28. **profilfoto-ki.de (Design):** Den mit dem `/site-review`-Skill begonnenen visuellen Audit für alle 55 URLs abschließen und die identifizierten Probleme (insb. der leere Bereich auf der Homepage) beheben.
29. **profilfoto-ki.de (SEO):** Die vom autonomen Agenten identifizierten Seiten mit CTR-Anomalien optimieren (Priorität: `/berater-profilfoto/`, `/whatsapp-profilbild/`).
30. **profilfoto-ki.de (Technisches SEO):** Das Indexierungsproblem der Seite `/facebook-profilbild/` (Status: "Gefunden – zurzeit nicht indexiert") analysieren und beheben.
31. **profilfoto-ki.de (Off-Page):** Eine konkrete Backlink-Strategie basierend auf den `seo-research-*.md` Dokumenten entwickeln und mit der Umsetzung beginnen.
32. **st-automatisierung.de (SEO):** Das identifizierte Keyword-Kannibalisierungsproblem für die 4 nicht-indexierten Seiten (Cluster: AI Act, BAFA) durch Content-Differenzierung oder 301-Redirects beheben.
33. **st-automatisierung.de (SEO):** Erste Ergebnisse des neuen 4-Stufen-SEO-Plugins überwachen, insbesondere die automatischen CTR-Optimierungen des Daily Agents.
34. **st-automatisierung.de (SEO):** Die vom autonomen Agenten als nächste Kandidaten identifizierten Seiten mit kritischen CTR-Problemen ("EU KI Verordnung", "Rechnungsverarbeitung") systematisch optimieren.
35. **st-automatisierung.de (Off-Page):** Link-Building-Queue (`stage-0-link-building.md`) mit den 14 identifizierten Branchenverzeichnissen befüllen und den Chrome-Automatisierungs-Agenten für den ersten Lauf starten.
36. **st-automatisierung.de (Infrastruktur):** Den bestehenden n8n-Workflow (Gmail-Benachrichtigung) um eine Telegram-Benachrichtigung für neue Leads erweitern.
37. **st-automatisierung.de (Content):** Die 4 pSEO-Seiten mit unter 180 Wörtern ("Thin Content") müssen mit Inhalten erweitert werden.
38. **st-automatisierung.de (Content):** Keyword-Recherche und Intent-Analyse für den potenziellen neuen Content-Cluster "KI Schulung" (2.400 Suchvolumen) durchführen.
39. **Daten-Infrastruktur (GSC-Monitoring):** Die neue Domain `yapayzekapratik.com` zur GSC-Property-Liste im n8n-Workflow hinzufügen.
40. **<BUSINESS_EXAMPLE> (GSC-Monitoring):** Überwachen, ob die GSC-Daten für die neue Domain `<BUSINESS_EXAMPLE>` in den nächsten 1-2 Tagen korrekt in Supabase ankommen.
41. **<BUSINESS_EXAMPLE> (Content-Strategie):** Sobald die ersten GSC-Daten verfügbar sind, eine datengetriebene Entscheidung für die nächste Content-Erweiterungsphase treffen.
42. **Rechnungs-Generator (Daten):** Stammdaten (IBAN, Steuernummer) für <BUSINESS_EXAMPLE> UG ergänzen.
43. **Rechnungs-Generator (Assets):** Hochauflösende Logo-Dateien für alle Firmen bereitstellen und in die jeweiligen Company-Ordner legen.

## Hard Rules
- Der autonome Task Executor (`claw-task-executor.mjs`) wird die Freigabe haben, SEO-Tasks (Status `pending`) selbstständig zu committen und zu deployen. Code-Änderungen (Status `pending_approval`) werden uncommitted im Repo abgelegt und erfordern manuelle Freigabe via Telegram.
- Der autonome LinkedIn-Agent (Tasks: `linkedin-monday`, `linkedin-wednesday`, `linkedin-friday`) hat die explizite Freigabe, Inhalte direkt und ohne manuelle Freigabe auf dem persönlichen LinkedIn-Profil von Safak Tepecik zu veröffentlichen.
- CLAW hat Lese- und Schreibzugriff auf das autonome Supabase Memory (Schema: `claw`).
- Jeder vom autonomen Agenten erstellte Blog-Artikel muss ein Quality Gate passieren: 1.000+ Wörter, 3+ H2-Überschriften, FAQ-Block, und mindestens 60% der genannten Zahlen müssen aus dem vorangegangenen 4-Quellen-Research-Prozess stammen.
- **URL-Normalisierung (Trailing Slashes):** Wird ausschließlich durch Astro-Config (`trailingSlash: 'always'`) und Netlify's "Pretty URLs"-Feature gehandhabt. Es dürfen KEINE Edge Functions für diesen Zweck verwendet werden, da dies in der Vergangenheit zu einem 21-tägigen Ausfall durch Redirect-Loops führte. Ebenso dürfen keine selbstreferenzierenden Redirects (z.B. `/robots.txt` -> `/robots.txt`) in `netlify.toml` oder `_redirects` existieren. Alle generierten URLs (Canonicals, Sitemaps, JSON-LD) müssen den Trailing Slash enthalten.
- **Embedding-Modell:** Für Vektor-Embeddings im Supabase Vector Store wird ausschließlich das Modell `gemini-embedding-001` verwendet, um Kompatibilität und Stabilität zu gewährleisten. Ein Wechsel erfordert eine vollständige Migration und Re-Embedding aller bestehenden Vektoren.
- **Testing-Methodik:** Für qualitative Design- und UX-Audits wird der interaktive `/site-review`-Skill (Claude-in-Chrome) verwendet, da er den Live-Kontext am besten erfasst. Für wiederholbare, funktionale End-to-End-Tests (z.B. "Funktioniert der Checkout?") soll die 'Write vs. Run'-Methode mit Playwright bevorzugt werden, bei der die KI einmalig die Test-Skripte schreibt, die dann token-frei ausgeführt werden.
- **Indexierungs-Strategie:** Die manuelle URL-Einreichung in der GSC via Browser-Automatisierung wird eingestellt. Stattdessen wird eine API-basierte Strategie verfolgt:
    1.  **Google Indexing API:** Wird als primäres Tool zur Beschleunigung der Google-Indexierung genutzt. Dies geschieht im Bewusstsein, dass es sich um eine offiziell nicht für Standard-Content vorgesehene "Grauzone" handelt. Das Effizienzpotenzial wird höher bewertet als das geringe Risiko einer Ignorierung der Anfragen.
    2.  **IndexNow Protokoll:** Wird parallel als offener Standard für Bing und andere Suchmaschinen genutzt.
- **NEU: Deep Research & Automation:** Die Automatisierung externer Web-Dienste ist nur über Browser-Steuerung (z.B. Claude-in-Chrome) und im Rahmen der jeweiligen Nutzungsbedingungen des Dienstes erlaubt. Das direkte Scraping oder die Automatisierung von Diensten wie Perplexity, die dies in ihren ToS explizit verbieten, ist streng untersagt, um Account-Sperrungen zu vermeiden.
- **NEU: Knowledge Management Framework:** Das `nvk/llm-wiki` Framework ist der designierte Standard für die Implementierung des "LLM Wiki as a Codebase"-Patterns. Neue Wissensmanagement-Aufgaben müssen auf diesem Framework aufbauen.
- **NEU: Knowledge Source of Truth:** Das Obsidian Knowledge Vault ist die "Source of Truth" für das Langzeitgedächtnis des Systems. Es wird manuell und durch Agenten gepflegt. Supabase (`claw.memories`) dient als durchsuchbarer Vektor-Index dieses Wissens und wird täglich automatisch mit dem Vault synchronisiert.
- **NEU: Workspace-Integrität:** Alle Arbeiten für ein spezifisches Projekt MÜSSEN innerhalb des dafür vorgesehenen, einzigen Projekt-Workspaces (`C:/Users/User/Claude/<projekt>/`) stattfinden. Das Anlegen mehrerer Workspaces für dasselbe Projekt oder das Arbeiten in einem generischen oder themenfremden Workspace ("Cross-Contamination") ist verboten, um die Wissensfragmentierung zu verhindern.
- **NEU: Changelog-Pflicht:** Jede autonome oder manuelle Änderung an einer Website MUSS in der Supabase-Tabelle `claw.changelog` protokolliert werden. Kein Deploy ohne korrespondierenden Changelog-Eintrag.
- **NEU: Agenten-Verhalten:** Autonome Agenten sollen bei unklaren Situationen oder fehlenden Optimierungsmöglichkeiten keine Aktionen erzwingen. Stattdessen sollen sie nur eine Analyse im Agenten-Log hinterlassen und die Aufgabe beenden.
- **NEU: Tonalitäts-Kalibrierung:** Beispiele, die zur Veranschaulichung einer Zielgruppe oder Tonalität gegeben werden (z.B. "sprich wie für Handwerker"), dürfen nicht wörtlich in den finalen Output übernommen werden. Der Agent muss das Beispiel nutzen, um die allgemeine Tonalität (z.B. "einfach", "direkt") zu kalibrieren, aber den Inhalt auf die tatsächliche Marke und das allgemeine Ziel (z.B. B2B Tech) anwenden.
- **NEU: Komplexitäts-Abbruch:** Wenn die Einrichtung oder Reparatur eines Tools (z.B. MCP-Server) wiederholt fehlschlägt und die Lösungsversuche zu komplex werden (z.B. mehrfaches Patchen von Quellcode), wird der Prozess abgebrochen. Es wird ein Reset auf den Ausgangszustand (z.B. saubere Reinstallation) durchgeführt und der einfachste, offiziell dokumentierte Weg von Grund auf neu verfolgt.
- **NEU: Chrome-MCP (Browser-Steuerung):** Der Chrome-MCP arbeitet in isolierten Tab-Gruppen. Er kann NICHT auf bereits geöffnete Tabs des Nutzers zugreifen. Um einen bestehenden Tab zu steuern, muss der Nutzer diesen explizit über das Claude-Extension-Icon zur Session hinzufügen ("Add to session"). Alternativ muss der Agent den Tab per URL-Navigation in seiner eigenen Session neu öffnen.
- KEIN Deploy ohne `npm run build` (Exit 0) lokal bestätigt.
- Der "Deployment Preflight Skill" ist vor jedem Push obligatorisch.
- Browser-Automatisierung ist für visuelle Website-Audits (Screenshot-Analyse, Layout-Prüfung) mit Chrome-Profil 'Profile 1' (<USER_EMAIL>) explizit freigegeben und wird aktiv genutzt. Der Agent muss die GSC-URL aus den Browser-Lesezeichen entnehmen und sicherstellen, dass die URL `/u/1/` enthält.
- **Geplante Tasks & Browser-Automatisierung:** Autonome Tasks, die im unbeaufsichtigten Modus (Scheduled Tasks) laufen, dürfen keine Aktionen beinhalten, die eine manuelle UI-Interaktion (z.B. Browser-Zugriffs-Dialog) erfordern, da diese garantiert fehlschlagen. Solche Aktionen müssen in interaktiven Sessions oder über APIs ausgeführt werden.
- Die autonome Agenten-Infrastruktur ist für die Projekte `ki-automatisieren.de` und `st-automatisierung.de` aktiv.
- Skill-Definitionen (`SKILL.md`) werden ausschließlich im Kontext des jeweiligen Projekt-Chats erstellt und modifiziert, nicht zentral.
- **FAQ-Schema-Parsing:** Das Schema für FAQs darf NUR aus Markdown-Zeilen generiert werden, die mit `**` beginnen und mit einem Fragezeichen `?**` enden. Fettgedruckter Text ohne Fragezeichen darf nicht als FAQ gewertet werden.
- **Infrastruktur-Dateien:** Änderungen an kritischen Konfigurationsdateien (`netlify.toml`, `astro.config.mjs`, `BaseLayout.astro`) erfordern immer eine explizite Bestätigung des Users.
- **Projekt-Scope (via /insights):** Wenn ein spezifisches Projekt (z.B. ki-automatisieren.de) referenziert wird, arbeite NUR an diesem Projekt. Kein Kontext von anderen Projekten annehmen oder erwähnen, außer es wird explizit gefordert.
- **Skills-First-Prinzip (via /insights):** Immer bestehende Skills und dokumentierte Workflows in `.claude/skills/` prüfen, BEVOR neue Ansätze entwickelt oder externe Pakete installiert werden. Bewährte Muster exakt befolgen, nicht improvisieren.
- **Browser-Automation Fallback (via /insights):** Bei Browser-Automatisierung (GSC, Verzeichnisse) ist direkte URL-Navigation UI-Klicks vorzuziehen. Wenn eine UI-Interaktion zweimal fehlschlägt, sofort auf direkte URL- oder API-basierte Ansätze wechseln.
- **Security (via /insights):** Niemals externe Pakete, GitHub-Skills oder nicht vertrauenswürdigen Code installieren/ausführen, ohne vorher auf Prompt-Injection-Risiken zu prüfen. Quelle und Inhalt immer verifizieren.
- **Working Directory (via /insights):** Es wird an mehreren Projekten in unterschiedlichen Ordnern gearbeitet. Kein fixes Arbeitsverzeichnis annehmen. Zu Beginn jeder Session immer das Projekt und den Pfad bestätigen.

### Session Update (2026-04-11)
- Google Indexing API mit Service Account für die Domain eingerichtet und als Inhaber in der GSC hinzugefügt.


### Session Update (2026-04-14)
- Der DACH-Markt zeigt ein starkes Wachstum für 'KI Betriebssystem' (+1.000% YoY) und 'AI Operating System' (+271% YoY), was eine First-Mover-Opportunity darstellt.
- 'KI Automatisierung Agentur' hat einen hohen CPC (€16,38) und kommerziellen Intent.
- SERP-Analyse für 'KI Betriebssystem' zeigt, dass `ai-first.ai` (kleine Agentur) und `wavesix.ai` (Direkt-Konkurrent) die Top-Positionen belegen, aber schlagbar sind.
- YouTube-Analyse zeigt hohes Interesse an 'KI Betriebssystem Unternehmen' mit Videos von 'The Morpheus' (41k Views) und 'INDUSTRIEMAGAZIN' (69k Views) sowie neuen, relevanten Videos von Laurin Fouquet.
- Es gibt eine Lücke für Content, der die Implementierung von AIOS für Unternehmen detailliert beschreibt und konkrete Anwendungsfälle aufzeigt.


### Session Update (2026-04-14)
- Indexierungsprobleme festgestellt: Nur Homepage indexiert, kaum Clicks, viele Artikel nicht gecrawlt.
- Keine Striking Distance Opportunities identifiziert (Queries auf Position 54-100).
- Neuer Artikel 'Einkauf Dunkelverarbeitung KI' wird erstellt (KW16 P1, ausstehend aus KW15 #4), um die Indexierungsrate zu verbessern.


### Session Update (2026-04-14)
- Vollständiger SEO-Audit durchgeführt, inklusive Website, Sitemap, Robots.txt, Codebasis, Netlify-Config, 742 Keywords, GSC-Daten, Pinecone Wissensbasis (376 Records, 17 Namespaces) und Thin Content Audit Report.
- Externer Code-Audit mit 14 Findings verifiziert und 4 zusätzliche Befunde entdeckt.
- Alle 18 Audit-Findings gefixt und deployed (6 Commits: Quick Wins, Solution-Pages Schema, Blog-Artikel, CTA Modal Fix, P1/P2/P3 Fixes, Unsplash-Bilder lokal, Canonical Overrides, Sitemap-Bereinigung, webmanifest, Blog #11-14).
- Edge Function `url-normalize.ts` entfernt und Netlify Pretty URLs (pretty_urls = true) aktiviert.
- Legacy Redirects von 3 Hops auf 1 Hop reduziert.
- Autonomer SEO-Loop `seo-loop-ki-automatisieren` eingerichtet (täglich 09:23, 3-5 Blog-Artikel/Tag, 4-Quellen-Research, Quality Gate, Deploy, Thin-Content Fix alle 3 Tage, Pillar Page bei >25 Artikeln).
- Wöchentlicher Review `seo-gsc-weekly-review` eingerichtet (montags 10:17, GSC-Datenanalyse, Output: seo-weekly-report.md + claw_keyword_inventory.json Updates).
- Tool-Permissions für autonome Tasks erteilt.
- Kannibalisierung via Canonical Overrides gelöst für `/chatbot/`, `/marketing-automatisierung-ki/`, `/prozesse-automatisieren/` mittels `canonicalOverride` Prop in `BaseLayout.astro`.
- Aktueller Stand der Site: 134 Pages deployed, 14 Blog-Artikel live (3 vom autonomen Loop), 23 Slugs offen in `claw_keyword_inventory.json`, 50 Branchen-Pages (30 Thin Content, 10 ohne FAQs), GSC Impressions ~426, GSC Klicks 2, DR ~5-10, Edge Function ENTFERNT, Pretty URLs AKTIV.
- Offene Punkte: Frische GSC-Daten einholen, Backlink-Strategie, GSC Property für non-www verifizieren, Dispatch Feature in Claude Desktop fixen, CSP-Hardening.
- Wichtige Dateien: `claw_keyword_inventory.json`, `KEYWORD-MASTER-DATASET.csv`, `gsc_queries.json`/`gsc_pages.json` (veraltet), `thin_content_audit_report.md`, `seo-weekly-report.md`, `scripts/deploy-safe.sh`, `scripts/content-quality-gate.sh`, `src/data/solutions.ts`, `src/data/blogData.ts`, `src/data/pseo-branchen.ts`, `netlify.toml`, `public/_redirects`, `public/_headers`.
- Pinecone Namespaces (READ-ONLY) genutzt: `pseo-eeat`, `system-wissen`, `sales-experte`, `trw-sales-playbooks`, `ki-automatisieren`, `autoresearch-logs`.
- Meta-Titel und Descriptions für `/fallstudien/acilsatis/`, `/losungen/crm-prozessautomatisierung/`, `/losungen/kundenservice-automatisierung/` optimiert.
- GSC Indexierung für `/fallstudien/acilsatis/` und `/losungen/crm-prozessautomatisierung/` beantragt.
- GSC Indexierung für `/losungen/kundenservice-automatisierung/` manuell beantragt.
- `webhook_queue` ist aktuell leer.
- GSC-Daten sind bis zum 31.03.2026 aktuell, der n8n Collector läuft täglich um 06:00 Uhr.


### Session Update (2026-04-14)
- Backlinks durch Firmeneinträge (Gelbe Seiten, Das Örtliche, wlw.de, induux.de) erstellt.
- Gastbeitrag-Pitch vorbereitet.
- SKILL.md-Dateien für `ki-auto-daily-execution` und `ki-auto-weekly-strategy` wurden befüllt.


### Session Update (2026-04-14)
- Die 'Comet-System'-Opener-Vorlage ('Dürüst olayım: [Rolle-Pain]. Darboğaz A mı, B mi?') wird konsistent und erfolgreich angewendet.
- Die Strategie des 'Mirror statt Pitch' nach einer Antwort wird beibehalten und verfeinert.
- Die 'Freedom-Close-Ton'-Strategie bei schwierigen Antworten wird beibehalten.
- Die DM-Strategie wurde von einem direkten 'Pitch' zu einem 'explorativen' und 'beratenden' Ansatz verschoben, um den Gesprächspartner als Experten zu respektieren und Informationen zu sammeln.
- Der Fokus in DMs liegt nun stärker auf dem Verständnis des Geschäftsmodells und der spezifischen Herausforderungen des Leads (z.B. Lead-Generierung vs. Lead-Nurturing, B2B vs. B2C).
- Die Kommunikation soll sich dem emotionalen und direkten Stil des Gesprächspartners anpassen, um Rapport aufzubauen.


### Session Update (2026-04-15)
- Canonical-Override für `/prozesse-automatisieren/` entfernt, da die Seite einen eigenen Intent hat (Auswahl & Priorisierung) im Gegensatz zu `/prozessoptimierung/` (Methodik & ROI-Kalkulation).
- Content von `/prozesse-automatisieren/` mit Statistiken gestärkt.
- Neuer Artikel zum Thema 'Dunkelverarbeitung' wurde deployed und in die Matrix aufgenommen.


### Session Update (2026-04-16)
- Ein 'Solar Lead Scoring as a Service' basierend auf Google Solar API Daten (ohne Bildverarbeitung) ist ein valides B2B-SaaS-Geschäftsmodell.
- Eine 'Customer Photo Pipeline' für AI-Visualisierungen (Kunde lädt eigenes Foto hoch) ist eine rechtlich saubere Alternative zur Nutzung von Google-Bildern.


### Session Update (2026-04-17)
- Es bestehen weiterhin Indexierungsprobleme, die sich in niedrigen Impressionen über alle Abfragen zeigen.
- Der KW16 Förderungs-Cluster wurde gestartet.
- Der erste Artikel des KW16 Förderungs-Clusters, `bafa-berater-finden-ki-prozessoptimierung`, wurde geschrieben und zu blogData.ts hinzugefügt.
- Es sind aktuell 22 Artikel live auf der Domain.


### Session Update (2026-04-17)
- Der `elite-ui-ux` Skill kann für `ki-automatisieren.de` und `st-automatisierung.de` genutzt werden, indem Brand-Schemas wie `linear.app/`, `stripe/` oder `vercel/` für eine klare SaaS-Autorität angewendet werden.


### Session Update (2026-04-17)
- Das 'awesome-design' Repo kann für Projekte wie 'ki-automatisieren.de' und 'st-automatisierung.de' genutzt werden, indem Schemas von Marken wie 'linear.app', 'stripe' oder 'vercel' für eine 'klare SaaS-Autorität' angewendet werden.
- Firecrawl (oder dessen Ersatz WebFetch/Chrome MCP) ist weiterhin relevant für das Scrapen von Competitor-Sites (Farben, Typo, Logos) als JSON-Tokens für pSEO-Landingpages.


### Session Update (2026-04-18)
- Das Projekt 'yapayzekapratik.com' ist ein kleines SaaS-Portal mit 53 Seiten, nicht nur eine Landingpage.
- Die Seitenstruktur wurde in 7 Gruppen klassifiziert: Unique (6), Service/Çözümler (13), Case Studies (6), Blog (10), Legal (4), Calculators (13), Thank-You (1).
- Der Tech-Stack von yapayzekapratik.com umfasst Astro 6, Tailwind 4, React 19 islands, GSAP 3.14 und Netlify adapter.
- Es gibt spezifische SEO-kritische Sperren, die nicht angetastet werden dürfen: `trailingSlash: 'always'`, `site: https://yapayzekapratik.com`, `/sitemap-index.xml` Pfad, Verbot von Edge Functions, alle titles/meta/canonical/structured-data/H1-Text bleiben 1:1.
- Die Website nutzt bereits CSS-Variablen, aber auch Tailwind-Klassen, die vom Elite-Skill als suboptimal eingestuft werden (`rounded-2xl`, `backdrop-blur-md`).
- Türkische Sonderzeichen fehlen bereits im Source-Code der Website, was als Content-Problem und nicht als Design-Problem identifiziert wurde.


### Session Update (2026-04-19)
- Der 'Solar Funnel' (Adresseingabe -> Dachdaten + Ersparnis) ist der zentrale USP für die Lead-Generierung bei Solarbetrieben.
- TikTok wird als Outreach-Kanal für Solarbetriebe genutzt, mit spezifischen DM-Strategien und -Regeln.
- Ein CRM-MCP für das Tracking von Outreach-Aktivitäten ist in Planung.
