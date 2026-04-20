# profilfoto-ki.de
> Letztes Update: 2026-04-20
> Wird automatisch vom Session Processor aktualisiert

## Aktueller Stand
KI-gestützte professionelle Profilfotos. Produkt fertig. Das Produkt wurde um ein **Freemium-Modell** erweitert: Neue User erhalten **1 kostenlosen, wassergezeichneten Credit**. Die **Stripe-Zahlungsintegration ist vollständig live**, sodass User Credit-Pakete kaufen können, um das Wasserzeichen zu entfernen. Ein umfassender **SEO-Push wurde gestartet**, basierend auf einem vollständigen GSC-Audit. Als erste Maßnahme wurden in einem **CTR-Optimierungs-Sprint die Title/Meta-Tags für 7 Seiten mit hohen Impressionen überarbeitet** und 15 neue pSEO-Seiten erstellt. Ein **umfassender Bild-Audit der statischen Website** hat ein kritisches UX- und Relevanz-Problem aufgedeckt: **Ein einziges Hero-Bild wurde auf 25 pSEO-Seiten wiederverwendet**, obwohl spezialisierte Bilder bereits im Repository vorhanden waren. In einer Korrekturmaßnahme wurden **17 pSEO-Seiten sofort aktualisiert**, um ihre korrekten, themenspezifischen Hero-Bilder zu verwenden. Für die verbleibenden 11 Seiten wurden **detaillierte Prompts zur Erstellung passender Hero-Bilder generiert** und bereitgestellt. Ein Versuch, einen vollautomatisierten Design-Audit via Browser-Automation durchzuführen, scheiterte an technischen Problemen (leere Screenshots durch Lazy Loading). Ein neuer Versuch, einen vollautomatisierten Design-Audit mit einem eigens entwickelten `/site-review` Skill (basierend auf Claude-in-Chrome mit präziser, mathematischer Scroll-Logik) durchzuführen, scheiterte ebenfalls. Der Skill deckte ein kritisches Rendering-Problem auf der Homepage auf: Nach dem Hero-Bereich werden mehrere Sections mit Inhalt im DOM nicht visuell dargestellt, was zu einem riesigen leeren Bereich führt. Dies untermauert erneut die Unzuverlässigkeit von UI-Automation für komplexe visuelle Analysen. Ein weiterer Versuch, die verbleibenden 9 pSEO-Seiten via Scheduled Task zur GSC-Indexierung einzureichen, scheiterte ebenfalls, da die Browser-Automation im unbeaufsichtigten Modus keine Berechtigungsdialoge bestätigen kann. Beide Vorfälle untermauern die "API-first"-Strategie und die bekannte Unzuverlässigkeit von UI-Automation. **Ein erneuter Versuch, einen UI/UX-Audit der Web-App (`app.profilfoto-ki.de`) mit dem `site-review` Skill durchzuführen, scheiterte ebenfalls an technischen Problemen (Tab-Sichtbarkeit, API-Fehler), konnte aber vor dem Abbruch kritische Bugs auf der Login-Seite (`/auth`) aufdecken: ein gebrochenes Logo-Bild, schlechte Raumnutzung, ein "flaches" Design der Login-Card ohne visuellen Container und das Fehlen von alternativen Login-Methoden neben Google.** Der Audit hat zudem **0 von Google gecrawlte Backlinks** als kritischstes Problem identifiziert. Die Entwicklungs-Infrastruktur (CLAW) wurde grundlegend überarbeitet: Ein stündlicher **Session-Processor** (Windows Task Scheduler, Script claw-session-processor.mjs; nach 3-tägigem Ausfall wegen defektem API-Key und statischen Pfaden repariert) analysiert Claude-Gespräche mit **Gemini 2.5 Pro**, extrahiert Hard Rules, Korrekturen und **neu: konkrete Aktivitäten**. Diese Aktivitäten werden in einer neuen `claw.activity_log` Tabelle gespeichert. Ein **`SessionStart`-Hook lädt die letzten 7 Tage dieser Aktivitäten automatisch in den Kontext** neuer Chats, um den Arbeitskontext zwischen Sessions lückenlos zu erhalten. Ein täglicher **`CLAW-Daily-Agent`** prüft autonom GSC-Daten und Projektstände, um proaktiv Aufgaben zu identifizieren. **Als erste Implementierung dieses Agenten wurde der tägliche Task `seo-loop-profilfoto-ki` aktiviert, der nicht nur analysiert, sondern auch autonom SEO-Optimierungen durchführt.** In seinem ersten Lauf identifizierte und korrigierte der Agent ein kritisches CTR-Problem auf der Seite `/ratgeber/coole-profilbilder/` (750+ Impressionen, 0 Klicks), indem er Title und Meta-Description überarbeitete und die Änderungen direkt deployte. **Der Agent verfügt über ein 7-Tage-Kontextfenster (eigene Vorschläge & erledigte Tasks), um doppelte Aufgaben zu vermeiden.** Um verpasste Ausführungen (z.B. durch Offline-Zeiten) abzufangen, wurde ein **mehrstufiger Failsafe-Mechanismus (`morning-catchup`) implementiert, der stündlich (09:36, 10:36, 11:36) prüft**, ob alle für den Tag geplanten Tasks gelaufen sind. Die Vektor-Datenbank-Architektur ist final: Neben Pinecone (Wissensspeicher) wird eine **Supabase pgvector DB (NanoBanana, Schema: `claw`) als autonomes Hippocampus-Gedächtnis** für CLAW genutzt. Es speichert atomare Learnings (Hard Rules, Korrekturen) mit **`gemini-embedding-001` (768d)** und nutzt eine verbesserte, **Scope-übergreifende Jaccard-Deduplikation**, Importance Scoring und täglichen Decay (via pg_cron). **Ein Paradigmenwechsel im Wissensmanagement wurde vollzogen, inspiriert von Andrej Karpathys "Wiki as a codebase"-Konzept. Anstatt auf temporäres RAG zu setzen, wurde ein permanentes, LLM-gepflegtes Wissensarchiv als "Single Source of Truth" aufgebaut. Zu diesem Zweck wurde ein zentrales Obsidian-Vault (`obsidian-claw-vault`) erstellt, das über ein benutzerdefiniertes Python-Skript alle verfügbaren Wissensquellen aggregiert: 342 Claude Code Sessions, 97 Antigravity-Konversationen, 1447 ChatGPT-Exporte und 192 Projekt-Markdown-Dateien. Dieses 32 MB große, volltextdurchsuchbare und vernetzte Archiv dient als zentrales Rohstofflager. Zusätzlich wurde das gesamte nicht-reproduzierbare "Projekt-Wissen" (Sales-Playbooks, Debug-Lektionen, Architektur-Entscheidungen) aus 376 Pinecone-Records extrahiert, bewertet und in 61 hochwertige, destillierte Wiki-Dokumente überführt. Nach einer umfassenden Evaluierung konkurrierender Frameworks wurde `nvk/llm-wiki` als das zentrale Tool ausgewählt und erfolgreich als Claude Code Plugin installiert, um dieses Wissensarchiv aktiv zu verwalten, zu analysieren und für Deep-Research-Aufgaben zu nutzen.** Um das Wissen aus dem Vault für die KI-Agenten nutzbar zu machen, wurde ein **täglicher Synchronisations-Task (`claw-wiki-sync.mjs`)** eingerichtet. Dieser Task chunked alle neuen oder geänderten Wiki-Dokumente, generiert Embeddings via Gemini und upserted sie in die Supabase-Vektordatenbank, wodurch das menschlich kuratierte Wissen für die semantische Suche der Agenten verfügbar wird. Der tägliche GSC-Datenimport via n8n-Workflow "CLAW – GSC Daily Data Collector v3" läuft stabil und befüllt die Tabellen **`gsc_history` (pro Seite/Tag) und `gsc_daily_summary` (pro Domain/Tag)**. **Eine Überprüfung der GSC-Pipeline bestätigte deren Vollständigkeit; ein Backfill wurde durchgeführt, um die Datenhistorie in Supabase auf ~70 Tage zu erweitern, was einen dedizierten GSC-MCP überflüssig macht.** Die Tool-Infrastruktur wurde signifikant erweitert: Ein **offizieller DataForSEO-MCP** für erweiterte SEO-Analysen (SERP, Keywords, Backlinks), der **neue, offizielle Google Analytics 4-MCP** für direkten Zugriff auf GA4-Daten und ein **offizieller, remote-gehosteter SerpApi MCP für Echtzeit-SERP-Analysen** wurden erfolgreich integriert und als voll funktionsfähig verifiziert. Die Einrichtung des GA4-MCPs erforderte das Debugging von initialen Bugs im offiziellen Python-Paket (stdout-prints, langsame Ladezeiten, die eine Erhöhung des `MCP_TIMEOUT` erforderten). **Die Bewerbung für das Google for Startups Cloud Program wurde abgelehnt.** Als Grund wurde eine unzureichende öffentliche Website genannt, der es an klaren Informationen über das **Geschäftsmodell, das Team und das Produkt** mangelt. Eine Überarbeitung der Startseite und die Erstellung einer "Über Uns"-Seite sind nun priorisiert. **Die Integration der TikTok Content Posting API wurde begonnen, um die Video-Pipeline um einen weiteren Distributionskanal zu erweitern. Die Domain `profilfoto-ki.de` wurde erfolgreich im TikTok Developer Portal verifiziert (nach Lösung eines DNS-Problems mit dem TXT-Record auf der Root-Domain vs. www-Subdomain) und eine Sandbox-App wurde konfiguriert. Dabei wurde festgestellt, dass eine AGB-Seite (Terms of Service) für den finalen App-Review fehlt.**

### GSC / SEO
- **Keyword-Master-CSV (Single Source of Truth):** `C:\Users\User\Documents\DataForSEO_Keyword_Analyses\Profilfoto_KI_Keywords.csv` — 226 Keywords aus GSC-Audit 03.04.2026 + wave2_pages.json. Detaillierte Dokumentation im `profilfoto-seo` Skill: `keyword-sources.md`. Zentraler Ablageort für alle Domains: `C:\Users\User\Documents\DataForSEO_Keyword_Analyses\` (enthält auch CSVs für ki-automatisieren.de, st-automatisierung.de, Pergola, Pratik Yapay Zeka TR). **Hard Rule:** Keine neue Keyword-Analyse ohne vorher diese CSV zu lesen.
- **GSC-Audit (Stand 03.04.2026, 3 Monate):**
  - Performance: 24 Klicks, 3.5k Impressionen, 0.7% CTR, Avg. Position 20.7
  - Top-Impression-Seiten: `/ratgeber/coole-profilbilder/` (1.016 Impr.) und Homepage (959 Impr.).
  - **Kritisches Problem: 0 externe Links** laut GSC-Bericht.
- **CTR-Optimierung (Phase 1) gestartet:** Title/Meta-Tags für 7 Seiten mit hohem CTR-Potenzial (u.a. LinkedIn, Homepage, Facebook, /ratgeber/profilbild/) wurden überarbeitet. Zusätzlich wurden 15 neue pSEO-Seiten erstellt.
- **Autonome CTR-Optimierung (Phase 2):** Der tägliche SEO-Agent (`seo-loop-profilfoto-ki`) hat seine Arbeit aufgenommen. Erste Maßnahme: Überarbeitung von Title/Meta für `/ratgeber/coole-profilbilder/` nach Identifizierung von 750+ Impressionen bei 0 Klicks (Position ~10).
- **On-Page UX/Relevanz-Optimierung:** Ein Bild-Audit deckte massive Wiederverwendung von Hero-Bildern auf. **17 pSEO-Seiten wurden korrigiert** und nutzen nun einzigartige, themenrelevante Hero-Bilder, was die Nutzererfahrung und die thematische Signifikanz der Seiten verbessert.
- **Indexierungs-Status:** 40 Seiten indexiert. Problem: `/facebook-profilbild/` ist "Gefunden – zurzeit nicht indexiert". Ein neuer, automatisierter Task (`gsc-indexierung-profilfoto-ki`) überwacht dieses Problem, **scheiterte jedoch bei dem Versuch, neue Seiten unbeaufsichtigt einzureichen, da eine manuelle Browser-Freigabe erforderlich ist.**
- **Rich Results:** Status positiv. Google erkennt und validiert `FAQPage` (34 Seiten), `BreadcrumbList` (26 Seiten), `Review` (19 Seiten) und `Product/aggregateRating` (50 Seiten) Schemas.
- **Hub & Spoke Architektur (Phase 1-3) implementiert:** Content-Cluster für "Bewerbungsfoto" und "Profilbild" sind live.
- **43 Seiten mit Impressionen** in der Google Search Console.
- **Umfassender On-Page SEO Audit (05.04.2026):** UTF-8-Encoding, Hero-Design, JSON-LD Schemas (aggregateRating, BreadcrumbList, twitter:description), Title/Meta-Lengths, interne Verlinkung und Hero-Bilder über 9 Commits korrigiert. Alle Titles <60 Zeichen, alle Descriptions <160 Zeichen. 18 Orphan-Seiten in Homepage-Footer verlinkt. 11 neue KI-generierte Hero-Bilder integriert.
- Seite braucht 20+ Beispielbilder auf /ratgeber/coole-profilbilder/ (visueller Intent)

### n8n
- Workflow: "Profilfoto-KI – V3 Production (with Watermark)" — via Webhook getriggert
- **Wasserzeichen-Implementierung:** Der Workflow liest das `is_watermarked`-Flag aus dem Webhook-Payload. Wenn `true`, wird der Gemini-Prompt modifiziert, um das Wasserzeichen direkt ins Bild zu rendern. Eine serverseitige Bildbearbeitung (z.B. via `sharp`) wurde verworfen, da sie in der n8n Cloud-Umgebung nicht unterstützt wird.
- GSC-Daten: Täglicher Import via n8n-Workflow "CLAW – GSC Daily Data Collector v3" in Supabase-DB (NanoBanana) ist finalisiert und läuft stabil. **Der Workflow überwacht die Domains `profilfoto-ki.de`, `ki-automatisieren.de`, `st-automatisierung.de`, `sanper.de` und `apexx-bau.de`.** Er nutzt eine UPSERT-Logik für ein 7-Tage-Fenster, um GSC-Datenlatenzen auszugleichen und befüllt die Tabellen `gsc_history` und `gsc_daily_summary`. **Eine Überprüfung bestätigte, dass der Workflow trotz eines 1.000-Zeilen-Limits pro API-Call alle Daten erfasst, da die tägliche Datenmenge weit darunter liegt. Ein historischer Backfill wurde durchgeführt, sodass die Supabase-DB nun eine ~70-tägige GSC-Historie enthält.**

### Content-Strategie
- **Positionierung:** Der rote Faden ist **"Wie andere Menschen dich online wahrnehmen — bevor du ein Wort sagst."** Der Content fokussiert sich auf die Psychologie des ersten Online-Eindrucks, nicht auf das Produkt selbst (Themen- statt Produkt-Content).
- **Implementierte Content-Architektur (Phase 1-3):**
  - **Hub 1 (erweitert):** `/bewerbungsfoto-ki/` (um FAQ, Tipps & interne Links erweitert)
  - **Spokes (neu):** `/ratgeber/bewerbungsfoto-kosten/`, `/ratgeber/ki-bewerbungsfoto-test/`
  - **Hub 2 (neu):** `/ratgeber/profilbild/`
  - **Spoke (neu):** `/ratgeber/coole-profilbilder/`
  - **Zusätzliche Erweiterung:** `/linkedin-profilfoto-ki/` wurde ebenfalls um neue Content-Module (Größe/Format, Tipps, FAQ) und interne Links erweitert.
- **Video-Format:** Fokus auf 15-30 Sekunden Videos für Instagram Reels & TikTok, die die Hook/Body/Close-Struktur komprimieren.
- **Video-Pipeline (7 Phasen):** RAG Boot (Kontext-Sammlung) → Ideation (Manifest) → Nano Banana (Anchor Frame) → Veo 3.1 (Raw Video) → Whisper (Transkription) → Remotion (Post-Production & Captions) → Metrics Loop (Der `video-intelligence` MCP analysiert das Video, speichert Performance-Metriken in `wissenspeicher` (namespace: `profilfoto-ki`) und den multimodalen Vektor (via **Gemini Embedding 2.0**) in `media-embeddings`).
- **Self-Learning System:** Das System durchläuft Phasen von manuellem bis zu vollautomatischem Betrieb, basierend auf der Anzahl der Videos mit 24h-Performance-Metriken.
  - **Performance Score:** `(follows*10) + (saves*5) + (watch_time_pct*2) + (views*0.01) + (comments*2)`
  - **Lern-Modus:** 0-4 Videos (Manuell), 5-9 (Semi-Auto), 10-19 (Autonomous), 20+ (Full Auto).
- **Key Learnings (implementiert):**
  - Hooks als offene Fragen (Curiosity Loop).
  - Erste 1-2s: Text, Visual und Audio müssen kombiniert wirken.
  - Charakterkonsistenz durch Master Reference Image (Nano Banana).
  - Multi-Clip-Szenen werden IMMER mit "Veo Extend" realisiert, niemals durch separate T2V-Calls.
  - **Skript-Sprache:** Skripte werden auf maximale Einfachheit optimiert ("Erstklässler-Niveau"), um kognitive Last zu minimieren und die Botschaft direkt zu verankern.
  - **Veo-Audio:** Veo kann exakte Skripte wiedergeben. Dies wurde empirisch bestätigt und widerlegt veraltete Annahmen. **Hard Rule:** Dialog (in Anführungszeichen) und Stimme (z.B. "calm, deep German voice") präzise prompten. Externes TTS ist damit obsolet.
- **Themen:** Dating, Karriere, Social Media (nicht nur Bewerbungsfotos). **Hard Rule:** LinkedIn-spezifischer Content wird explizit vermieden, da Tonalität und Plattform-Energie nicht zu Reels/TikTok passen.
- **Trend-Recherche:** Nutzung der offiziellen Instagram Graph API. Manuelles Scraping via Browser-Automation wurde als zu riskant (Account-Sperre) eingestuft und wird nicht verfolgt.
- **Trennung (Hard Rule):** Die **Content-Architektur** (Was/Warum: Positionierung, Themen-Cluster, Tonalität) wird strikt vom **Skill** (Wie/Technik: Videoproduktion, Tools, Prompting) getrennt gehalten.

### Tech-Stack
- Vanilla HTML5, Tailwind CSS, Node.js Scripts
- **Build-Script:** Ein wiederverwendbares Node.js-Skript (projekt-lokal: build_pages.mjs im profilfoto-ki Repo, nicht unter `C:/Users/User/Claude/scripts`) wurde erstellt, um pSEO-Rohdaten automatisch in vollständige HTML-Seiten mit Template (Nav, Footer, JSON-LD) zu integrieren.
- Hosting: Netlify (Workspace: nanobanana)
- **Monetarisierung (Live):**
  - **Freemium-Modell:** Neue User erhalten **1 kostenlosen Credit**. Generierungen mit diesem Credit erhalten ein **Wasserzeichen**.
  - **Wasserzeichen-Logik (Hard Rule):** Das Wasserzeichen wird nicht per Bildbearbeitung in n8n hinzugefügt. Stattdessen wird bei `is_watermarked=true` der **Gemini-Prompt modifiziert**, um das Wasserzeichen direkt in das Bild zu rendern.
  - **Stripe-Integration:** Die Zahlungabwicklung ist live via Supabase Edge Functions (`create-checkout`, `stripe-webhook`) und konfigurierten API-Keys. Der Webhook verarbeitet `checkout.session.completed`, schreibt Credits gut und setzt `users.has_purchased_credits = true`, um Wasserzeichen für zahlende Kunden zu deaktivieren.
  - **Preisstruktur:**
    | Plan | Preis | Credits | Preis/Bild |
    |---|---|---|---|
    | Kennenlernen | 4,99 € | 2 | 2,50 € / Bild |
    | Professional | 29 € | 12 | 2,42 € / Bild |
    | Executive | 79 € | 40 | 1,98 € / Bild |
- **Lead-Erfassung (Neuer Standard):**
  - **Architektur:** Ein Astro-Kontaktformular sendet Daten an eine Supabase Edge Function (`[domain-prefix]-lead-submit`).
  - **Speicherung:** Die Edge Function speichert den Lead in einer zentralen `st_leads` Tabelle im `NanoBanana` Supabase-Projekt.
  - **Benachrichtigung:** Nach erfolgreicher Speicherung ruft die Edge Function einen n8n-Webhook auf. Ein n8n-Workflow sendet dann eine formatierte E-Mail-Benachrichtigung via Gmail.
  - **Hard Rule:** Dieses System ersetzt `mailto:`-Links und Insellösungen (z.B. Resend), um alle Leads zentral zu tracken. Die Implementierung wird über einen standardisierten Handoff-Prompt (`lead-system-handoff.md`) für alle Projekte ausgerollt.
- **Video-Pipeline:**
  - **Frameworks:** Remotion, Nano Banana 2, Veo 3.1 (via globalem `ai-ugc` Skill).
  - **Talking Heads:** Für direkte Sprecher-Szenen wird **OmniHuman** anstelle von Veo genutzt, um eine höhere Realitätsnähe zu erzielen.
  - **Voice Cloning:** Spezifische Sprecherstimmen werden über **ElevenLabs Voice-IDs** geklont und konsistent gehalten.
  - **Modelle:** `gemini-3.1-flash-image-preview` (Images), `veo-3.1-generate-preview` (Video).
  - **Technik:** "Veo Extend" ist die Hard Rule für Multi-Clip-Konsistenz. Extend akzeptiert nur Veo-eigene Video-URIs und gibt ein kombiniertes Video zurück.
  - **Veo Audio:** Präzises Prompting für Dialog (in Anführungszeichen) und Stimme (z.B. "calm, deep German voice") ist die **Hard Rule**, um Skript-Treue zu gewährleisten und externen TTS-Einsatz zu vermeiden.
  - **Veo 3.1 Prompt-Anatomie (Best Practice):** Prompts werden strukturiert nach: 1. Szene & Kamera (Umgebung, Licht, Position, Linse), 2. Darsteller (Beschreibung, Mood), 3. Audio (Dialog in "", Stimmbeschreibung, Ambience), 4. Stil (Color Grading, Licht-Ratio), 5. Negative Prompt (Verbote). Eine JSON-ähnliche Struktur innerhalb des Prompt-Strings wird für beste Ergebnisse empfohlen. **Zur Vermeidung des "AI-Face"-Looks** wird eine hyper-detaillierte Beschreibung der Hauttextur im Darsteller-Teil empfohlen (z.B. "sichtbare Poren, leichte Hautunreinheiten, keine Filter-Optik, asymmetrische Züge"), um einen realistischeren Look zu erzielen.
  - **Remotion:** `<OffthreadVideo>` ist Pflicht. Trimming erfolgt via `trimBefore` und `trimAfter` (ersetzt `startFrom`/`endAt` seit v4.0.319). Standard-Templates (z.B. `PodcastReel`) werden genutzt.
  - **Caption-Pipeline:** Transkription via Whisper, Verarbeitung als JSON mit dem `@remotion/captions` Paket.
- **Browser-Automation:** "Claude in Chrome" Extension. Ermöglicht Ad-hoc-Aufgaben. **Hard Rule:** Wird aufgrund des hohen Risikos der Bot-Erkennung (Account-Sperre) explizit **nicht** für das Scraping von Social-Media-Plattformen eingesetzt. Die Nutzung für Datendienste (z.B. GSC-Navigation) hat sich als **extrem unzuverlässig und fehleranfällig** erwiesen und wird nur als letzter Ausweg genutzt (API-first-Prinzip). **Ein erneuter Versuch, einen Design-Audit mit einem neuen, verbesserten `/site-review` Skill durchzuführen, scheiterte ebenfalls, diesmal an einem kritischen Rendering-Problem, bei dem ganze Content-Sections nicht im Screenshot erschienen. Ebenso schlug ein geplanter Task zur GSC-Indexierung fehl, da der unbeaufsichtigte Prozess den notwendigen Browser-Zugriffsdialog nicht bestätigen konnte. Ein weiterer Versuch, die Web-App (`app.profilfoto-ki.de`) zu auditieren, scheiterte an Tab-Sichtbarkeitsproblemen und API-Fehlern, deckte aber vor dem Abbruch kritische Bugs auf der Login-Seite auf (gebrochenes Logo, Design-Schwächen).**
- **Social Media API:**
  - Instagram Graph API (für Trend- & KPI-Analyse).
  - **TikTok Content Posting API (in Einrichtung):** Anbindung zur automatisierten Veröffentlichung von Videos. Erfordert das "Login Kit" als Voraussetzung. Die Entwicklung und das Testen erfolgen zunächst in der Sandbox-Umgebung, die private Posts ohne App-Review erlaubt. Benötigte Scopes: `video.publish`, `user.info.basic`. **Eine AGB-Seite (Terms of Service) ist für den finalen App-Review erforderlich.**
- **MCP-Server:**
  - **DataForSEO MCP (neu):** Ein offizieller MCP-Server von DataForSEO wurde konfiguriert. Er bietet direkten Zugriff auf die REST-API für SERP, Keywords Data, OnPage und Backlink-Analysen. Die Konfiguration nutzt die gleichen Credentials wie der Antigravity-Agent.
  - **Google Analytics 4 MCP (neu):** Der neue, offizielle GA4-MCP von Google wurde erfolgreich eingerichtet. Ein Test am 06.04.2026 bestätigte den vollen, funktionsfähigen Zugriff auf alle relevanten Properties, inklusive `Profilfoto-KI` (ID: 516614685). Er ermöglicht direkten Zugriff auf die Analytics Admin und Data APIs für Reports und Account-Informationen. Die Einrichtung erforderte die Erstellung von OAuth-Credentials (Desktop App) und das Debugging von initialen Bugs im offiziellen Python-Paket (stdout-prints, langsame Ladezeiten). Die Ladezeit von ~18s führte zu einem Startup-Timeout in Claude Code, was durch die permanente Setzung der Umgebungsvariable `MCP_TIMEOUT=60000` (via `setx`) gelöst wurde.
  - **SerpApi MCP (neu):** Ein offizieller, remote-gehosteter MCP von SerpApi wurde für Echtzeit-SERP-Analysen (Google, Bing, etc.) integriert. Die Konfiguration erfolgte über die globale `.mcp.json` und erfordert kein lokales SDK.
- **Vektor-DB: Pinecone**
  - `wissenspeicher`: 1024d (llama-text-embed-v2) für Text/RAG. Nutzt Pinecones internes Embedding-Modell. **Das in diesem Index enthaltene, nicht-reproduzierbare "Projekt-Wissen" (376 Records, u.a. Sales-Playbooks, Debug-Lektionen) wurde exportiert und in das zentrale Obsidian-Wissensarchiv überführt, um die Abhängigkeit von temporärem RAG zu reduzieren.**
  - `media-embeddings`: **1536d (cosine)** für multimodale Vektoren. Dieser Index ist speziell für externe, dichte Vektoren des **`gemini-embedding-2-preview` (Gemini Embedding 2.0)** Modells konfiguriert. Er wird aktiv vom **`video-intelligence` MCP** (via `embed_media` Tool) befüllt und nutzt explizit **kein** internes Pinecone-Embedding-Modell.
- **Vektor-DB: Supabase (pgvector)**
  - **Projekt:** NanoBanana, Schema `claw` (mit public Wrappers).
  - **Zweck:** Autonomes CLAW-Gedächtnis (Hippocampus-System) für Hard Rules und Korrekturen. Dient zusätzlich als semantischer Suchindex für das Obsidian-Wissensarchiv.
  - **Tabellen:** `memories_user` (permanent), `memories_session` (temporär).
  - **Embedding (Hard Rule):** `gemini-embedding-001` (768d, kostenlos) ist das einzig genutzte Modell. Ein Test mit `embedding-2-preview` wurde wegen Inkompatibilität der Vektorräume verworfen; alle betroffenen Einträge wurden neu eingebettet, um die Datenkonsistenz zu wahren.
  - **Logik:** Verbesserte, **Scope-übergreifende Jaccard-Deduplikation** (>0.6), Importance Scoring (0.55-0.92), täglicher Decay via pg_cron. Ein täglicher Scheduled Task (`claw-wiki-sync.mjs`) hält die Embeddings des Obsidian-Vaults aktuell.
- **Wissensmanagement: Obsidian Vault (neu)**
  - **Zweck:** Zentrales, durchsuchbares und vernetztes Archiv aller Konversationen, Projekt-Dokumente und extrahiertem Erfahrungswissen als "Single Source of Truth".
  - **Standort:** `C:\Users\User\obsidian-claw-vault\`
  - **Integrierte Quellen:**
    - **Claude Code:** 342 Sessions aus `.jsonl`-Transkripten
    - **Antigravity:** 97 Konversationen aus `.pb`-Dateien (via LanguageServer API)
    - **ChatGPT:** 1447 Konversationen aus offiziellen Exporten
    - **Projekt-Dateien:** 192 Markdown-Dateien aus dem `Projects`-Verzeichnis
    - **Pinecone `wissenspeicher`:** 376 Records (Sales-Playbooks, Debug-Lektionen, etc.) exportiert und als 61 destillierte Wiki-Dokumente integriert.
  - **Technik:** Ein benutzerdefiniertes Python-Skript (`jsonl-to-obsidian.py`) konvertiert und integriert alle Quellen, bereinigt Metadaten und erstellt automatisch `[[Wiki-Links]]` für bekannte Konzepte (z.B. Supabase, Netlify), um einen vernetzten Wissensgraphen zu erzeugen.
- **Website Changelog (Single Source of Truth):**
  - **Tabelle:** `claw.changelog` in NanoBanana — protokolliert JEDE Änderung an der Website.
  - **Felder:** `domain`, `page_path`, `change_type` (title, meta_desc, schema, hero_image, internal_link, encoding, design, content), `old_value`, `new_value`, `reason`, `commit_hash`, `actor` (agent/human/scheduled-task).
  - **Hard Rule:** Jeder Agent, Chat und Scheduled Task der Änderungen an profilfoto-ki.de vornimmt MUSS einen Eintrag in `claw.changelog` schreiben. Funktion: `public.insert_changelog(domain, page_path, change_type, ...)`.
  - **Query:** `SELECT * FROM public.get_page_changelog('profilfoto-ki.de', '/arzt-profilbild/')` — zeigt komplette History einer Seite.
  - **Korrelation mit GSC:** Title-/Content-Änderungen können gegen `gsc_history` abgeglichen werden, um den Impact zu messen.
- **Supabase (Anwendungs-DB):**
  - **Freemium-Schema:** Die `users` Tabelle enthält die Spalte `has_purchased_credits` (boolean), die `photo_generations` Tabelle enthält `is_watermarked` (boolean).
  - **Trigger-Logik:** Ein `BEFORE INSERT` Trigger auf `photo_generations` setzt `is_watermarked` automatisch basierend auf dem `has_purchased_credits`-Status des Users. Die `handle_new_user` Funktion vergibt 1 Credit an neue User.
  - **Hard Rule (Manuelle DB-Änderungen):** Bei manueller Gutschrift von Credits muss auch `users.has_purchased_credits` auf `true` gesetzt werden, um das Wasserzeichen-System nicht fälschlicherweise auszulösen.
- **MCP-Server: `video-intelligence`**
  - **Zweck:** Zentraler Service für Video-Analyse, Embedding und Ähnlichkeitssuche.
  - **Standort:** `C:\Users\User\Projects\mcp-video-intelligence\`
  - **Tools:**
    - `analyze_video`: Extrahiert Metadaten (Hook, Transkript, Qualität) aus Videos via `gemini-3-flash-preview`.
    - `embed_media`: Erstellt 1536d Vektoren aus Videos/Bildern via `gemini-embedding-2-preview` und speichert sie in Pinecone.
    - `find_similar`: Findet ähnliche Medien in Pinecone basierend auf einem Input-Medium oder Text.
  - **Hard Rule:** Videos >100MB werden über die File API verarbeitet, kleinere inline.
- Kosten pro Foto-Generierung: ~0,10€
- Google Startup Credits: Abgelehnt. Grund: Website erfüllt nicht die Anforderungen (fehlende Infos zu Business, Team, Produkt). Eine erneute Bewerbung nach Überarbeitung der Seite ist geplant.

### Entwicklungs-Workflow
- **Tooling-Entscheidung (finalisiert März 2026):** Die Konversation hat die Trennung der Tools und Modelle finalisiert, um Konfusion zu beseitigen.
  - **Antigravity (Gemini CLI):** Das Werkzeug der Wahl für **technische Ausführung und Coding** direkt im Projektverzeichnis. Nutzt **Gemini-Modelle (Flash/Pro)**.
  - **Claude Code (Direkt):** Wird für übergeordnete, strategische Aufgaben genutzt: **Reasoning, Planung, Tool-übergreifende Orchestrierung (via MCPs) und die Erstellung von Dokumenten/Präsentationen**. Nutzt **Claude-Modelle (Sonnet/Opus)**. Die Integration von spezialisierten MCPs (DataForSEO, GA4, SerpApi) untermauert diesen Ansatz, indem sie direkten, tool-basierten Zugriff auf komplexe Daten-APIs ermöglicht.
  - **Hard Rule (IDE vs. App):** Nur Tools mit direktem Dateisystem- und Terminal-Zugriff (Antigravity, Claude Code CLI) werden für die Entwicklung genutzt. Grafische Apps wie **Claude Desktop** oder **Claude Cowork** sind für diese Aufgaben ungeeignet, da ihnen dieser Zugriff fehlt.
- **Zentrales Wissensmanagement (Karpathy-Pattern):**
  - **Strategie:** Ein Paradigmenwechsel weg von temporärem RAG hin zu einem permanenten, LLM-gepflegten Wissensarchiv ("Wiki as a codebase" nach Andrej Karpathy).
  - **Implementierung:** Das zentrale **Obsidian Vault** dient als aggregiertes Rohstofflager. Das Framework **`nvk/llm-wiki`** wurde als das zentrale Werkzeug ausgewählt und als Claude Code Plugin installiert, um dieses Archiv aktiv zu verwalten.
  - **Workflow (4 Phasen):**
    1.  **Ingest:** Rohdaten (Chats, Web-Content, Dokumente, Pinecone-Exporte) werden im Vault gesammelt.
    2.  **Extract:** Das LLM (via `nvk/llm-wiki`) destilliert Konzepte, Entitäten und Beziehungen aus den Rohdaten.
    3.  **Resolve:** Neue Erkenntnisse werden in bestehende Wiki-Seiten gemerged, Widersprüche werden markiert.
    4.  **Schema:** Die Wiki-Struktur wächst organisch, mit automatischen Querverweisen und Index-Seiten.
  - **Deep Research:** Das `nvk/llm-wiki` Framework wird für Deep-Research-Aufgaben genutzt. Es steuert Claude.ai über Browser-Automation, um umfassende Recherchen durchzuführen und die Ergebnisse direkt im Wissensarchiv zu strukturieren.
  - **Hard Rule (Tooling):** Die Automatisierung von Perplexity.ai ist aufgrund expliziter ToS-Verletzungen verboten.
- **Learnings aus /insights Report (04.04.2026):** Eine umfassende Analyse von 43 Sessions (`/insights` Befehl) hat zentrale Reibungspunkte im Workflow identifiziert und zu neuen Hard Rules geführt:
  - **Problem: Projekt-Kontext-Verwechslung:** Die KI vermischt häufig Kontexte zwischen verschiedenen Projekten (z.B. `profilfoto-ki.de` vs. `ki-automatisieren.de`). **Hard Rule:** Jede Session muss mit einem expliziten Projekt-Kontext-Block gestartet werden (`PROJECT:`, `PATH:`, `STACK:`, `RULES:`).
  - **Problem: Ignorieren von Skills & fragile Browser-Automation:** Die KI neigt dazu, bestehende, funktionierende Skills zu ignorieren und stattdessen neue, oft fehlerhafte Ansätze zu entwickeln. Insbesondere die Browser-Automation für GSC ist extrem unzuverlässig. **Hard Rule:** Bestehende Skills und dokumentierte Workflows müssen immer priorisiert werden ("Skills-first"). Für Datendienste wie GSC gilt eine "API-first"-Regel; Browser-Automation ist nur ein Fallback und nach 2 Fehlversuchen abzubrechen. **Die Unzuverlässigkeit wurde erneut bestätigt, als ein automatisierter Design-Audit an der Screenshot-Erstellung für dynamische Seiten scheiterte und ein zweiter, verbesserter Versuch ein fundamentales Rendering-Problem aufdeckte.**
  - **Problem: Manuelle Validierung:** Manuelle Build-Checks nach Code-Änderungen sind fehleranfällig und haben zu Deployment-Fehlern geführt. **Best Practice:** `postEdit`-Hooks in `claude/settings.json` sollen für automatisierte Build- und Type-Checks (`npm run build`, `npx tsc`) genutzt werden.
- **Domain-spezifische Automatisierung (Hard Rule):** Jedes Projekt (jede Domain) erhält einen eigenen, isolierten Workspace und dedizierte, zugeschnittene Automatisierungs-Skills (z.B. für SEO). Eine Vermischung von Projekt-Logiken in einem einzigen, generischen Skill wird explizit vermieden, um Kontext-Verwechslungen und fehlerhafte Ausführungen zu verhindern. Der erste Prototyp dieses Ansatzes ist der `st-auto-seo` Skill für das Projekt `st-automatisierung.de`.
- **Deep Research Prozess:** Für tiefgehende Recherchen (z.B. zu rechtlichen Themen wie dem AI Act) wird ein mehrstufiger Prozess genutzt. Anstatt oberflächlicher Web-Suchen werden dedizierte Deep-Research-Agenten oder manuelle Prompts für Claude Online verwendet, die Primärquellen (z.B. via Firecrawl) systematisch analysieren, um eine hohe Fakten- und Quellendichte zu gewährleisten.
- **CLAW-System (Autonomer Agenten-Layer):**
  - **Session Processor:** Der stündliche Job (Script `claw-session-processor.mjs` unter `C:/Users/User/Claude/scripts`, läuft via Windows Task Scheduler "CLAW-Session-Processor" + als Stop/PreCompact-Hook — kein `.claude/scheduled-tasks/` Eintrag) wurde grundlegend repariert (defekter API-Key, statische Pfade). Er scannt nun dynamisch alle Projektverzeichnisse und nutzt einen 30-Minuten-Cooldown, um keine aktiven Sessions zu verarbeiten. Er extrahiert Hard Rules, Korrekturen und **neu: konkrete Aktivitäten**.
  - **Activity Log:** Ein neues **Activity Log** (`claw.activity_log` in Supabase) speichert eine chronologische Liste aller durchgeführten Aktionen (z.B. 'Backlinks für Domain X erstellt'). Der `SessionStart`-Hook lädt die letzten 7 Tage dieser Aktivitäten automatisch in den Kontext neuer Chats, um das Problem verlorenen Wissens zwischen Sessions zu lösen.
  - **Daily Agent:** Ein täglicher Cron-Job (~~claw-daily-agent.mjs~~ Script entfernt 2026-04-03; jetzt implementiert als Scheduled Task `seo-loop-profilfoto-ki` mit SKILL.md statt externem Script) analysiert autonom GSC-Daten und Projektstände, um proaktiv SEO-Aufgaben zu identifizieren **und direkt auszuführen (z.B. Title/Meta-Anpassungen).** **Der Agent verfügt über ein Kontext-Gedächtnis (letzte 7 Tage), um doppelte Vorschläge zu vermeiden.** Um sicherzustellen, dass keine Tasks aufgrund von Offline-Zeiten verpasst werden, wurde der **Failsafe-Task `morning-catchup` auf einen mehrstufigen, stündlichen Lauf (09:36, 10:36, 11:36) umgestellt**, der alle bis dahin fälligen, aber nicht ausgeführten Tasks nachholt.
  - **Zweistufiges Gedächtnis:**
    - **Topic-Dateien (`/topics/`):** Projekt-spezifische Markdown-Dateien (wie diese hier) fassen den aktuellen Stand, die Strategie und offene Punkte zusammen. Sie werden vom Processor automatisch aktualisiert und dienen als primärer, schnell lesbarer Kontext für neue Sessions.
    - **Supabase (`NanoBanana`):** Dient als Vektor-Datenbank für granulare, atomare Learnings (Hard Rules, Korrekturen, technische Details), die semantisch durchsucht werden. Die Deduplizierung wurde verbessert, um Scope-übergreifend zu funktionieren.
  - **Autonome Hooks:** Das System nutzt Claude Code Hooks für autonome Aktionen: `SessionStart` (Webhook-Queue & Activity Log prüfen), `UserPromptSubmit` (Auto-Research in Supabase), `Stop` (Session-Verarbeitung anstoßen).
  - **Webhook-Gateway:** Eine Supabase Edge Function namens "claw-webhook" (nicht zu verwechseln mit einem Scheduled Task) dient als always-on Endpunkt für externe Trigger (z.B. n8n). Eingehende Tasks werden in der `claw.webhook_queue` gespeichert und beim nächsten SessionStart verarbeitet.
- **Projekt-Workspaces:** Die Projekt-Struktur wurde überarbeitet. Jeder Chat wird nun aus einem dedizierten Projekt-Verzeichnis gestartet (z.B. `C:\Users\User\Claude\profilfoto-ki\`), das eine eigene `CLAUDE.md` enthält. Diese lädt globale Kontexte (MASTER, SOUL) und projekt-spezifische Kontexte (Topic-Datei, Skills, Scope). **Hard Rule:** Projekt-spezifische, autonome Tasks (z.B. SEO-Loops) werden ausschließlich aus dem jeweiligen Projekt-Workspace heraus entwickelt und verwaltet, um den korrekten Kontext sicherzustellen. Zentrale "Orchestrator"-Workspaces dienen nur der übergreifenden System-Planung. **Hinweis (Claude Code Bug):** Claude Code erstellt Duplikate von Projekt-Ordnern in `.claude/projects/`, wenn eine Session aus einem leicht abweichend aufgelösten Pfad gestartet wird. Chats sind an den exakten Pfad gebunden; eine Pfadänderung (z.B. Groß-/Kleinschreibung) führt dazu, dass alte Chats im neuen Pfad nicht sichtbar sind. Der Workaround ist, die Duplikate bei Bedarf manuell zu bereinigen.
- **Globaler Kontext:** Eine globale `C:\Users\User\.claude\CLAUDE.md` wurde erstellt und sorgt dafür, dass `C:\Users\User\Claude\MASTER.md` und `C:\Users\User\Claude\ANTIGRAVITY_BRIDGE.md` bei jeder Session automatisch geladen werden.
- **Lange Kontexte:** Bei komplexen, mehrstufigen Aufgaben (z.B. Videoproduktion) werden Sessions proaktiv neu gestartet, um Instabilitäten der KI zu vermeiden und den Kontext frisch zu halten.
- **Skill Management:** Globale Skills sind nun zentral in `C:\Users\User\.claude\skills\` verwaltet, um projektübergreifende Konsistenz zu gewährleisten (z.B. `ai-ugc`, `pseo`, `deployment`, `outreach`).
- **Hinweis (Plugin-Zugriff):** "Persönliche Plugins", die über die Desktop-App-UI verwaltet werden, werden nicht ins lokale Dateisystem gecached. Die KI hat daher keinen direkten Dateizugriff auf deren `SKILL.md`-Dateien. Workaround: Skills bei Bedarf manuell in das globale `skills`-Verzeichnis kopieren.

### Deployment-Regeln
- Niemals ohne explizite Bestätigung deployen
- Nach Deployment: visuelle Verifikation der Live-URL
- Netlify: Security Headers + Caching in netlify.toml. **CSP wurde bereinigt (GA4-Referenzen entfernt).**
- **Hard Rule (Astro/Netlify):** Um Redirect-Loops (`ERR_TOO_MANY_REDIRECTS`) zu vermeiden, wird die URL-Normalisierung ausschließlich Netlify überlassen. **Eine `url-normalize` Edge Function mit Loop-Prevention ist implementiert.** Eigene Redirects für diesen Zweck sind verboten. Canonical Tags dienen als finale Absicherung.
- **Hard Rule (GSC Umleitungsfehler):** Alle intern generierten URLs (Canonical Tags, JSON-LD Schemas, Sitemaps, interne Links) müssen mit einem Trailing Slash (`/`) enden, um "Umleitungsfehler" in der Google Search Console zu vermeiden, die durch das Crawlen von Non-Slash-Versionen und anschließende 301-Redirects entstehen.

### Offene Punkte
- Reel018 (Podcast-Stil, weiblich) finalisieren und veröffentlichen (Skript fertig)
- Reel020 (Social Media, weiblich) generieren und finalisieren (produktionsbereit)
- **Website-Überarbeitung für Google-Bewerbung:** Die Startseite muss überarbeitet werden, um das Geschäftsmodell, das Team und das Produkt klarer darzustellen.
- **"Über Uns"-Seite erstellen:** Eine neue Seite oder ein neuer Abschnitt muss erstellt werden, der das Unternehmen und das Team dahinter vorstellt, um die von Google geforderte Transparenz zu schaffen.
- **AGB (Terms of Service) Seite erstellen:** Erforderlich für den finalen Review der TikTok-App, um Public-Posting zu ermöglichen.
- **TikTok API-Integration fertigstellen:** Post-Script/Workflow implementieren, Test-Videos über die Sandbox posten und die App anschließend für den Production-Modus (Public Posts) einreichen.
- **Login-Seite (`/auth`) überarbeiten:** Kritisches Problem mit gebrochenem Logo beheben.
- **UI/UX der Login-Seite verbessern:** Leerraum im linken Panel reduzieren, Login-Formular in eine visuelle 'Card' einbetten, Sichtbarkeit des 'Zurück'-Links erhöhen.
- **Alternative Login-Methoden evaluieren:** Prüfung von E-Mail/Passwort oder Apple-Login als Ergänzung zu Google.
- **Backlink-Strategie entwickeln und umsetzen**: Als erste Maßnahme sollen automatisierte Einträge in Branchenverzeichnisse (z.B. Gelbe Seiten, Das Örtliche, WLW) via Chrome Automation erfolgen, um eine grundlegende Domain Authority aufzubauen. Weitere Strategien (z.B. Stock Photo Hack, Statistik-Seiten) folgen.
- ~~9 verbleibende pSEO-Seiten manuell in GSC zur Indexierung einreichen.~~ **Erledigt 2026-04-14: 13 nicht-indexierte URLs via Google Indexing API submitted (13/13 OK). Re-Inspect in 3–7 Tagen.**
- **Automatisierungsstrategie für GSC-Indexierung überarbeiten**, da der Task `gsc-indexierung-profilfoto-ki` im unbeaufsichtigten Modus an Browser-Berechtigungsdialogen scheitert.
- ~~20+ Beispielbilder auf /ratgeber/coole-profilbilder/~~ **Erledigt 2026-04-09: 22 cool-*.avif Bilder in `/public/images/examples/` (aesthetic, casual, clean, dark Styles).**
- **Striking-Distance Keywords pushen:** "bewerbungsfoto 2026" (Pos 11.5), "ki profilbilder" (Pos 11.9), "profilfoto" (Pos 14.9).
- **Weitere CTR-Anomalien beheben (Agenten-Backlog):** ~~`/berater-profilfoto/` (Pos 2.2, 0 Klicks)~~ **Fix deployed 2026-04-14 (Commit 992a316)**, `/whatsapp-profilbild/` (Pos 8.7, 0 Klicks — wurde 10.04. bereits gefixt, Impact-Check ausstehend).
- ~~**Sitemap `lastmod` dynamisieren**, um manuelle Updates zu vermeiden.~~ **Erledigt 2026-04-14: scripts/update-sitemap-lastmod.mjs (projekt-lokal im profilfoto-ki Repo, nicht unter `C:/Users/User/Claude/scripts`) aus git log mtime (56/56 URLs).**
- **Image SEO:** ~~Alt-Tags~~ **(202 Tags gefixt 2026-04-14)**, ~~Image Sitemap~~ **(sitemap-images.xml mit 207 Bildern 2026-04-14)**, ~~WebP-Formate~~ **(ersetzt durch AVIF 2026-04-14: 35 Hero-PNGs → AVIF, -84% Groesse, 17.71MB gespart, picture-tag Fallback, Commit 6705e2f)** systematisch implementieren. **Rest: hero-before-after.jpg Homepage LCP noch optimierbar.**
- **Interne Verlinkung** der Hub & Spoke Architektur systematisch ausbauen. **Audit 2026-04-14: 21 Seiten mit <5 Inbound Links identifiziert. Homepage-Footer 2 orphan pages ergänzt. Footer-Sync auf Non-Homepage-Hubs (z.B. `/bewerbungsfoto-ki/` hat 5/14 pSEO-Links vs. Homepage 14/14) bleibt offen.**
- **Autonome AI UGC Pipeline für profilfoto-ki aktivieren**: n8n-Trigger und Telegram-Bot für KPI-Intake finalisieren.
- **Standardisiertes Lead-Erfassungssystem (Supabase/n8n/Gmail) implementieren**, basierend auf dem Handoff-Prompt `lead-system-handoff.md`.
- **Self-Healing Browser Automation Pipeline bauen**, die bei UI-Fehlern automatisch auf Fallback-Strategien (z.B. direkte URL-Navigation) wechselt.
- **Paralleles Multi-Site SEO Content Agenten-System entwickeln**, das über Supabase koordiniert wird.
- **`postEdit`-Hooks für automatisierte Build-Checks einrichten**, um Deployment-Fehler zu vermeiden.
- **Headless Mode für autonome Agenten evaluieren**, um eine 24/7-Ausführung auf einem VPS zu ermöglichen.
- **`wiki:*` Skills testen:** Überprüfen, ob die installierten `nvk/llm-wiki` Skills (query, ingest, research) korrekt mit dem neuen Obsidian Vault funktionieren.
- **Deep Research Workflow etablieren:** Den neuen Prozess mit `/wiki:research` für eine anstehende Rechercheaufgabe nutzen, um sicherzustellen, dass die Ergebnisse direkt als Wiki-File und Supabase-Embedding gespeichert werden.
- **Qualitäts-Check des Wissensarchivs:** Den `/wiki:lint` Skill ausführen, um verwaiste Dokumente, fehlerhafte Links oder veraltete Inhalte im Obsidian Vault zu identifizieren.























### Session Update (2026-04-20)
- Der Daily SEO Agent für profilfoto-ki.de wurde gestartet und die Konfiguration sowie der Workflow wurden geladen.
- Der Agent ist darauf ausgelegt, autonom zu handeln, wenn der Benutzer nicht anwesend ist, und Entscheidungen zu treffen sowie diese im Output zu vermerken.
- Es gibt spezifische Hard Rules, die bei der Ausführung des SEO-Agenten für profilfoto-ki.de zu beachten sind, darunter die Changelog-Pflicht, das Fehlen eines Build-Steps und die Verwendung von nativem Deutsch.

### Session Update (2026-04-19)
- Admin-View für Funnel-Daten implementiert unter `/admin/funnel`.
- Funnel-Dashboard zeigt folgende Metriken: total_signups, total_uploaders, total_generators, total_payers, total_revenue_cents.
- Tägliche Metriken: signups, selfie_uploads, free_generations, paid_conversions (Standard 30 Tage).
- Admin-Zugriff wird über `supabase.rpc('is_current_user_admin')` und `is_admin = true` in Supabase gesteuert.
- Link zum Admin-Dashboard erscheint nur in der Sidebar (AppLayout.tsx:110) wenn `isAdmin === true`.
- Aktuelles Problem: Admin-User kann Dashboard nicht sehen, obwohl als Admin markiert. Mögliche Ursachen: Redirect zu /auth, `summary` ist null, oder ein nicht angezeigter Fehler.

### Session Update (2026-04-19)
- Ein 4-Stufen-Funnel-Dashboard (`/admin/funnel`) wurde in der Web-App implementiert, das Anmeldungen, Selfie-Uploads, kostenlose Generierungen und bezahlte Generierungen verfolgt.
- Das Dashboard ist nur für Admins (Şafaks User-ID) über Supabase-Auth sichtbar.
- Ein täglicher Telegram-Report mit Funnel-Zahlen wird automatisch versendet.
- Ein Sidebar-Menüpunkt 'Funnel Dashboard' wurde für Admins hinzugefügt.
- Die Implementierung erfolgte im GitHub-Repo `TRW123123/profilfoto-ki-app-v2`.

### Session Update (2026-04-19)
- TikTok OAuth-Code Gültigkeit: >> 1 Minute (mind. 30 Sekunden verifiziert).
- TikTok Redirect URI: NUR HTTPS auf verifizierter Domain, `localhost` nicht erlaubt.
- TikTok PKCE: Optional.
- TikTok Access Token: 24h gültig, Refresh Token 365 Tage.
- TikTok Sandbox-App Stabilität: Grundsätzlich über Monate stabil, jährliche Re-Autorisierung des Refresh Tokens nötig.
- TikTok Production Review: Erfordert Scopes `video.publish`, `user.info.basic`, Demo-Video, AGB-URL, Datenschutz-URL, App-Beschreibung, App Icon (Dauer 1-2 Wochen).

### Session Update (2026-04-18)
- Der Instagram-Account 'Profilfoto KI' ist nicht der für das DM-Outreach-Projekt vorgesehene Account.

### Session Update (2026-04-17)
- 16 'Gefunden – zurzeit nicht indexiert' URLs identifiziert, Ursache: Crawl-Budget-Problem durch 0 externe Backlinks.
- Sitemap-Fehler (www-Version eingereicht, non-www aktiv) wurde korrigiert, war nicht die Ursache für die 16 URLs.
- 13 URLs manuell zur Indexierung eingereicht, 3 stehen noch aus (GSC Quota).
- Seite `/bewerbungsfoto/` auf 95/100 optimiert (Title, Meta, Schemas, Content, FAQ).
- Neue Seite `/bewerbungsfoto-online/` erstellt und deployed, um Keyword-Kannibalismus für 'bewerbungsfoto online' zu beheben.
- CTR-Fixes für `/ratgeber/coole-profilbilder/` und `/bewerbungsfoto-mann/` deployed.
- Seite `/linkedin-profilfoto-ki/` als Hub-Push optimiert (Keyword-Shift, Schemas, Content-Erweiterung, FAQ).
- Tageskontingent für GSC-Indexierungsanfragen liegt bei ca. 10-12 URLs.
- Neue Seiten zu erstellen ist bei niedriger Domain Authority und Crawl-Budget-Problemen kontraproduktiv; Fokus sollte auf Optimierung bestehender Seiten liegen.

### Session Update (2026-04-17)
- Das 'awesome-design' Repo kann für 'profilfoto-ki.de' genutzt werden, indem Schemas von Marken wie 'airbnb' oder 'notion' für einen 'warmen, vertrauenswürdigen' Stil angewendet werden.

### Session Update (2026-04-17)
- Der `elite-ui-ux` Skill kann für `profilfoto-ki.de` genutzt werden, indem Brand-Schemas wie `airbnb/` oder `notion/` für einen warmen, vertrauenswürdigen Stil angewendet werden.

### Session Update (2026-04-17)
- GSC-Indexierungsstatus (Stand 13.04.26): 43 indexiert / 22 nicht indexiert (65 gesamt, Sitemap: 56)
- Hauptgrund für Nicht-Indexierung: 'Gefunden – zurzeit nicht indexiert' (16 Seiten), darunter wichtige Money-Pages.
- Ursprünglich angenommener www/non-www-Fehler (Sitemap mit www, Site non-www) wurde korrigiert: Site läuft unter www, Sitemap war korrekt.
- 16 'Gefunden – nicht indexiert' URLs wurden von Google nie gecrawlt ('Zuletzt gecrawlt: Nicht zutreffend').
- Mehrere URLs, die laut GSC nicht indexiert waren, sind inzwischen indexiert (GSC-Daten waren veraltet).
- Manuelle Indexierungsbeantragung für URLs 7, 8, 9, 10, 11 wurde durchgeführt.

### Session Update (2026-04-17)
- Die Seite `/bewerbungsfoto-mann/` wurde als Quick-Win identifiziert und zur Title/Meta-Optimierung priorisiert, da sie trotz Position 4-6 und 41-43 Impressionen 0 Klicks über 12 Tage aufweist.

### Session Update (2026-04-16)
- Das Projekt 'Virtual Watch Try-On' nutzt ein ähnliches Backend-Konzept wie profilfoto-ki.de (Webhook -> n8n -> KI-Bildgenerierung -> Bild zurück).

### Session Update (2026-04-16)
- Die Seite '/whatsapp-profilbild/' hatte eine Position von 6.95 mit 19 Impressionen, aber 0 Klicks, was auf ein CTR-Problem hindeutet.
- Die Meta-Beschreibung für '/whatsapp-profilbild/' war mit 196 Zeichen zu lang und wurde in den SERPs abgeschnitten.
- Der Title für '/whatsapp-profilbild/' wurde von 'WhatsApp Profilbild erstellen · KI-optimiert · Ab 4,99 €' (52 Z.) zu 'WhatsApp KI-Profilbilder – 1 Foto gratis erstellen' (51 Z.) geändert.
- Die Meta-Beschreibung für '/whatsapp-profilbild/' wurde auf 135 Zeichen gekürzt und optimiert.
- Die Änderungen wurden mit dem Commit `851e964` deployed.

### Session Update (2026-04-16)
- Die Seite `/bewerbungsfoto-mann/` wurde als primärer Kandidat für die heutige SEO-Optimierung identifiziert, da sie 36 Impressionen bei Position 16.61, aber 0 Klicks aufweist und bisher nie angepasst wurde.
- Es wurde festgestellt, dass der Title der Seite `/bewerbungsfoto-mann/` das Keyword 'modern' nicht enthält, obwohl es in den Top-Queries relevant ist.
- Ein Encoding-Bug ('haeufigsten' statt 'häufigsten') wurde im Title der Seite `/bewerbungsfoto-mann/` diagnostiziert.

### Session Update (2026-04-15)
- Neues Profilfoto-Lookbook-Video mit Outro erstellt und auf YouTube Shorts und Instagram Reel veröffentlicht.

### Session Update (2026-04-15)
- Der `dist/`-Ordner ist das direkte Deploy-Verzeichnis, da kein Build-Step erforderlich ist.
- Bei GSC-Datenabfragen muss bei aktivem 7-Tage-Lag das Abfragefenster erweitert werden.
- OG- und Twitter-Tags müssen bei Title/Meta-Optimierungen synchronisiert werden.

### Session Update (2026-04-15)
- **SEO Status (03.04.2026):**
  - **Performance (3 Monate):** 24 Klicks, 3.467 Impressions, 0,7% CTR, Avg. Position 20,7.
  - **Top Queries:** 'coole profilbilder' (0 Clicks, 443 Impressions), 'profilfoto' (0 Clicks, 292 Impressions).
  - **Top Seiten:** Homepage (13 Clicks, 959 Impressions), /ratgeber/coole-profilbilder/ (2 Clicks, 1.016 Impressions).
  - **Indexierung:** 40 indexiert, 8 nicht indexiert (4x Weiterleitung, 2x Gefunden – zurzeit nicht indexiert, 1x Umleitungsfehler, 2x Alternative Seite, 2x Duplikat).
  - **Kritische Indexierungsprobleme:** `/facebook-profilbild/` ist 'Gefunden – zurzeit nicht indexiert' und sollte indexiert werden.
  - **Core Web Vitals:** Nicht genügend Nutzungsdaten.
  - **Sitemaps:** `sitemap.xml` erfolgreich, 40 erkannte Seiten.
  - **Manuelle Maßnahmen:** Keine Probleme.
  - **Links:** 0 externe Links (größtes Problem), 700 interne Links.
  - **Rich Results:** 13 gültige Navigationspfade, 34 gültige FAQs, 19 gültige Rezensions-Snippets (mit Warnung 'Ungültiger Objekttyp für Feld 'givenName').
- **SEO-Audit-Datei:** `seo-audit-2026-04-03.md` im Projektordner erstellt, enthält alle 41 Seiten, 226 Queries, Tagestrends, Indexierung, Rich Results und Link-Profil.
- **SEO-Recherche-Dateien:** `seo-research-claude-backlinks.md` (16 Strategien) und `seo-research-grok-backlinks.md` (Top 3 Hacks) im Projektordner gespeichert.
- **Content-Optimierung:** Title, Meta Description, OG-Tags und Twitter-Tags für LinkedIn, Homepage, Facebook, Profilbild, Modernes Bewerbungsfoto, Business Portrait und WhatsApp zur CTR-Optimierung überarbeitet.

### Session Update (2026-04-14)
- 13 pSEO-URLs via Google Indexing API eingereicht (2 indexiert, 6 'Gefunden – zurzeit nicht indexiert', 7 'URL ist Google nicht bekannt').
- Homepage Title/Meta CTR-Fix deployed: Title `KI Profilbilder erstellen · Profilfoto in 5 Min · Ab 4,99 €`, Meta 148 Zeichen.
- CTR-Anomalie `/berater-profilfoto/` behoben und deployed: Title `Berater Profilbild per KI in 5 Min · Vertrauen · Ab 4,99 €`.
- Image SEO: 202 Alt-Tags gefixt, Image Sitemap (207 Bilder) generiert und deployed.
- Interne Verlinkung: Footer-Sync auf 108 Landing-Pages durchgeführt, Reduzierung von 21 auf 1 Orphan Page.
- 20+ Beispielbilder für `/ratgeber/coole-profilbilder/` sind bereits als 22 `cool-*.avif` Bilder seit 09.04. vorhanden.
- WebP-Konvertierung ersetzt durch Task 'PNG-Heroes zu AVIF konvertieren' (42 Bilder, benötigt `npm install sharp` und API-Budget-OK).

### Session Update (2026-04-14)
- TikTok Developer App 'Claude' für profilfoto-ki.de erstellt und konfiguriert.
- Domain `profilfoto-ki.de` (ohne www) im TikTok Developer Portal verifiziert.
- Login Kit und Content Posting API in der Sandbox-App aktiviert.
- Redirect URI `http://localhost:3000/callback` für lokalen Auth-Server registriert.
- Lokaler PKCE-fähiger Auth-Server (projekt-lokal: tiktok-auth-server.mjs im profilfoto-ki Repo, nicht unter `C:/Users/User/Claude/scripts`) für automatischen OAuth-Code-Austausch implementiert.
- Posting-Skript (projekt-lokal: tiktok-post.mjs im profilfoto-ki Repo) für TikTok API-Uploads vorbereitet.
- Temporäre Nutzung des Impressums als AGB-URL für die Sandbox-Konfiguration.

### Session Update (2026-04-14)
- CTR-Fix durchgeführt.
- 15 pSEO-Seiten deployed.
- Ein offener Webhook-Queue Task ('CSP bereinigen + Sitemap lastmod dynamisieren') existiert noch und muss geprüft/umgesetzt werden.
- Es sollen keine Scheduled Tasks für profilfoto-ki.de erstellt werden.

### Session Update (2026-04-14)
- profilfoto-ki.de wurde als Beispiel für ein von Grund auf mit AIOS-Prinzipien aufgebautes SaaS-Produkt genannt, das Webseiten, SEO, AI-Backend, Social Media und Zahlungssysteme über ein einziges System verwaltet.

### Session Update (2026-04-13)
- Replicate API Key für n8n erhalten und integriert.
- Replicate Seedream 5.0 Lite als Fallback-Option für Gemini in n8n Workflow implementiert.
- Aktualisierter n8n Workflow mit Replicate Fallback verfügbar.

### Session Update (2026-04-13)
- Der Weekly SEO-Strategie-Agent für profilfoto-ki.de ist für die Analyse von SEO-Metriken und die Erstellung eines Impact-Reports zuständig.
- Der Agent darf keine Code-Änderungen vornehmen oder Dateien editieren/deployen.
- Die Changelog Impact-Analyse mittels `measure_change_impact()` ist ein Kern-Feature und obligatorisch.
- Es werden WoW-Vergleiche auf Domain- und Seitenebene durchgeführt.
- Drop Detection für Impressions und Positionen ist implementiert.
- Ein wöchentlicher Content Health Baseline-Scan für Top-20-Seiten ist vorgesehen.
- Eine Priorities-Matrix für den Daily Agent wird aus Quick Wins, Declining Pages und Low CTR Pages generiert.
- Ein CRO-Analyst Aktivierungs-Check basierend auf wöchentlichen Klicks und GA4 Conversion Events ist integriert.
- Striking Distance Opportunities werden identifiziert und als Tasks für den Daily Agent formuliert.
- Das Ergebnis ist ein detaillierter Impact-Report im Agent-Log.

### Session Update (2026-04-11)
- Google Indexing API mit Service Account für die Domain eingerichtet und als Inhaber in der GSC hinzugefügt.
