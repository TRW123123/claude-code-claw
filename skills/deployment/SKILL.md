---
name: deployment
description: Mandatory Preflight vor jedem git push und Netlify Deploy. Prueft Build, TypeScript, Routing und Security Headers. Nutzen vor JEDEM Deployment — kein Bypass erlaubt.
allowed-tools: [Read, Bash]
---

# Deployment Preflight Skill

## Rolle
Release-Gate. NICHTS geht live wenn der Build bricht.

---

## Pflicht-Reihenfolge vor jedem Push

```bash
# 1. Git Status — muss clean sein
git status

# 2. Build lokal
npm run build   # Exit Code muss 0 sein

# 3. TypeScript (falls vorhanden)
tsc --noEmit

# 4. Linting (falls vorhanden)
npm run lint

# 5. Tailwind-Arbitrary-Value-Check (siehe unten)
```

**Regel:** Wenn einer dieser Schritte fehlschlaegt → STOP. Nicht pushen.

---

## 🚨 TAILWIND-JIT-ARBITRARY-VALUES-CHECK (PFLICHT fuer static Projekte)

### Das Problem (Lesson Learned 2026-04-15)

Bei static Sites ohne Build-Pipeline auf Netlify (d.h. dist/ wird roh deployed):
- Tailwind-Classes wie `lg:grid-cols-[1.1fr_1fr]`, `aspect-[2/1]`, `w-[calc(100%-2rem)]` sind **arbitrary values**
- Sie werden NUR in die kompilierte `style.css` aufgenommen wenn der Tailwind-Build (Schritt 2) sie im HTML sieht
- Wenn `npm run build` nicht gelaufen ist zwischen Edit + Push → die Class fehlt in style.css → UI bricht auf Live-URL

### Check-Script

```bash
# Nach Edit, vor Commit — diesen Check laufen lassen:
# Findet alle arbitrary-values im HTML und prüft ob in style.css
for file in src/**/*.html src/*.html; do
  grep -oE '(lg|md|sm|xl):(grid-cols|col-span|row-span|aspect|gap|p|m|w|h|max-w|min-h|text)-\[[^]]+\]' "$file" 2>/dev/null | sort -u
done | sort -u > /tmp/arb-used.txt

# Check in kompilierter CSS:
while read class; do
  escaped=$(echo "$class" | sed 's/\[/\\[/g; s/\]/\\]/g; s|/|\\/|g; s/\./\\./g')
  if ! grep -q "$escaped" dist/style.css 2>/dev/null; then
    echo "⚠ MISSING in dist/style.css: $class"
  fi
done < /tmp/arb-used.txt
```

**Wenn MISSING: 2 Optionen:**
1. **Rebuild** — `npm run build` ausführen, dann erneut committen
2. **Inline-CSS-Fallback** — Arbitrary-Tailwind-Class ersetzen durch eine benannte CSS-Klasse mit raw CSS im `<style>` Block der Seite

**Bevorzugt bei static deploys ohne Build-Step:** Option 2 (Inline-CSS). Keine Abhängigkeit vom Build-State.

### Pattern-Fix-Rezept

Schlechte Praxis (brechbar):
```html
<div class="grid lg:grid-cols-[1.1fr_1fr]">
```

Gute Praxis (Inline-CSS):
```html
<div class="grid my-grid">
<style>
  .my-grid { grid-template-columns: 1fr; }
  @media (min-width: 1024px) { .my-grid { grid-template-columns: 1.1fr 1fr; } }
</style>
```

---

## Netlify-spezifische Checks

### Shadowing-Check (kritisch)
Nie gleichzeitig:
- `[[redirects]]` mit `status = 200` (Rewrite)
- UND eine physische Datei am gleichen Pfad

Fix: `force = true` setzen wenn Rewrite gewollt

### Trailing Slash
Entscheide EINMAL: alle URLs enden mit `/` oder ohne.
Niemals mischen.

### Branch-Awareness
```bash
# Welcher Branch deployed bei Netlify?
cat netlify.toml | grep branch
# Mit aktuellem Branch abgleichen
git branch --show-current
```

### Security Headers (netlify.toml Pflicht)
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

### Caching-Strategie
```toml
# Assets: immutable
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# HTML: kein Cache (atomare Deploys)
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

---

## Post-Deploy Verifikation

1. Live-URL im Browser oeffnen — visuell pruefen
2. `seo-forensic-master-audit` ausfuehren (Routing-Verifikation)
3. Deployment-Lesson in Pinecone schreiben falls Fehler aufgetreten

---

## Hard Rules
- **`npm run build` → Exit 0** muss lokal bestaetigt sein
- **Browser-Verifikation** nach jedem Deploy
- **KEIN Deploy** ohne User-Bestaetigung
- **Deployment Lessons** Namespace: `deployment-lessons` in Pinecone


### KVP Update (2026-04-26)
- [FAIL] Der gestartete Server zeigte nicht die korrekte App, was eine Neukonfiguration erforderte.


### KVP Update (2026-04-27)
- [WIN] Implementierung eines Double Opt-In (DOI) E-Mail/Passwort-Anmelde-Flows parallel zum Google-Login, inklusive Lifecycle-Mails und DSE-Anpassungen. → DOI-Sign-up mit Email/Passwort und Google-Login parallel live; Drei Lifecycle-Mails rechtssicher implementiert; DSE aktualisiert; Supabase-Konfiguration abgeschlossen; Test-Mail erfolgreich versandt.
- [WIN] Automatisierung des Selfie-Uploads (kein separater 'Speichern'-Klick mehr) und Verbesserung des 'Generieren'-Buttons durch eine Sticky-Bottom-Bar. → Auto-Upload von Selfies live; Sticky-Bottom-Bar für den Generieren-Button live.
- [WIN] Behebung eines Fehlers, bei dem Nutzer nach erfolgreichem Email/Passwort-Login nicht zum Dashboard weitergeleitet wurden. → Login-Weiterleitung zum Dashboard funktioniert nach Fix.


### KVP Update (2026-04-27)
- [WIN] Behebung von Lokalisierungsfehlern und visuellen Bugs auf der türkischen Landingpage 'oto-galeri-video.netlify.app' basierend auf einem visuellen Site Review. → Hero-Stats-Layout korrigiert, Slab-2- und Slab-4-SVGs lokalisiert, FAQ-Antwort korrigiert, alle deutschen Sektions-IDs in türkische umbenannt, mehrere Deployments erfolgreich durchgeführt.


### KVP Update (2026-04-27)
- [WIN] Umfassende Überprüfung und Korrektur von Sprach-, Währungs-, Navigations- und SVG-Textfehlern auf der oto-galeri-video.netlify.app-Website. → Alle 6 aufgeführten Fixes wurden erfolgreich implementiert und verifiziert. Final Score: Copy/Content 97, UX/Navigation 96, Trust 97.


### KVP Update (2026-04-27)
- [WIN] Erstellung eines AIOS-Hub-and-Spoke-Clusters mit einer Pillar-Seite und 5 Satelliten-Seiten auf st-automatisierung.de. → 1 Pillar-Seite und 5 Satelliten-Seiten deployed, 6 URLs bei GSC eingereicht.
- [WIN] Behebung eines HTML-Layout-Bugs auf der Homepage und eines CSS-Schriftgrößen-Bugs im Footer. → Homepage-Layout und Footer-Schriftgröße visuell korrigiert.


### KVP Update (2026-04-28)
- [WIN] Einrichtung des LinkedIn-Profils von Meltem Tepecik für ST-Automatisierung, inklusive Banner, Connection Requests und API-Integration. → LinkedIn Banner erstellt, 20 Connection Requests gesendet, LinkedIn API-Zugriff eingerichtet, erster Post live.
- [WIN] Anpassung des bestehenden LinkedIn Posting Skills für die neue Persona von Meltem Tepecik (Werkstudentin) und Implementierung einer konsolidierten täglichen Routine. → Neuer `scheduled-tasks/linkedin-meltem/SKILL.md` erstellt und registriert, `claw-linkedin-meltem-agent.mjs` implementiert.


### KVP Update (2026-04-28)
- [WIN] Implementierung der Kernfunktionalität des Angebotschreibers, inklusive UI, Datenmanagement und PDF-Export. → Voll funktionsfähige Web-App mit allen spezifizierten Features.
- [WIN] Iterative Verbesserung der PDF-Export-Qualität, Behebung von Clipping, Font-Rendering und Layout-Problemen. → PDF-Qualität von ~60/100 auf 95/100 verbessert, alle Rendering-Probleme behoben.
- [WIN] Hinzufügen vollständiger DE/TR-Sprachunterstützung für UI, Daten und PDF-Export. → App und PDF sind vollständig DE/TR-bilingual, inklusive dynamischer Inhaltsübersetzung.
- [WIN] Integration des KI-Assistenten (Foto/Text/Sprache) und der Übersetzungsfunktion mittels Gemini API. → KI-Assistent und TR→DE-Übersetzung funktionieren, Gemini API über Netlify Proxy angebunden.
- [WIN] Behebung von Problemen mit hardgecodeten Strings, localStorage-Caching und API-Key-Verfügbarkeit. → Alle gemeldeten hardgecodeten Strings und Caching-Probleme behoben, API-Key für Produktion verfügbar gemacht.


### KVP Update (2026-04-29)
- [WIN] Implementierung eines DSGVO-konformen Google Analytics 4 Trackings auf der Static-Site und der Web-App von profilfoto-ki.de, inklusive Consent-Manager und Funnel-Events. → GA4 Realtime zeigt 1 aktiven Nutzer nach Server-Side-Test-Hit; gtag.js und Consent-Banner sind auf beiden Codebases live und funktional.


### KVP Update (2026-05-02)
- [WIN] Vier neue Bilder und ein neuer Tile-Titel wurden in den Code integriert und auf Netlify deployed. → 4 Bilder und 1 Tile-Titel live auf ki-automatisieren.de
- [WIN] Der 'Entdecke mehr' Button auf der Hero-Sektion wurde hinsichtlich Lesbarkeit und Animation auf Desktop und Mobile optimiert. → Button 'ENTDECKE MEHR' ist konstant voll lesbar, keine Fade-Animation mehr, verbesserte Textdarstellung und sanfter Pfeil-Bounce.


### KVP Update (2026-05-03)
- [WIN] Manuelle Einreichung von 10 neuen pSEO-Seiten und der aktualisierten Sitemap bei Google Search Console und Start der Einreichung bei Bing Webmaster Tools. → Sitemap mit 65 URLs bei GSC eingereicht, 10 URLs erfolgreich zur Indexierung bei GSC beantragt.


### KVP Update (2026-05-05)
- [WIN] Ein Reel (reel_042) wurde für die Veröffentlichung auf Instagram, YouTube und TikTok vorbereitet und auf den ersten beiden Plattformen live geschaltet. → Reel_042 live auf Instagram (ID 18100352711009265) und YouTube (https://www.youtube.com/shorts/741FgehBqMg), TikTok in App-Inbox.


### KVP Update (2026-05-05)
- [WIN] Erstellung und Optimierung von 5 pSEO-Seiten (6-10) mit spezifischen Layout-Identitäten und anschließender Humanizer-Optimierung, Build und visueller Verifikation. → 5 neue pSEO-Seiten deployed, 9/10 Humanizer-Scores ≥82, alle 10 Pages visuell verifiziert.


### KVP Update (2026-05-05)
- [WIN] Deployment von 10 elite-ui-ux pSEO-Seiten auf Netlify via Git-Push. → Commit bfc713d auf main deployed.


### KVP Update (2026-05-06)
- [WIN] Eine bestehende Webseite wurde komplett überarbeitet, um visuelle Fehler zu beheben, die Benutzerfreundlichkeit zu verbessern und Inhalte für Laien verständlicher zu machen. → Use-Case-Atlas v3 fertiggestellt und verifiziert (Desktop + Mobile + alle 8 Sektionen).


### KVP Update (2026-05-06)
- [WIN] Behebung eines Darstellungsproblems im Angebots-PDF, bei dem die Lieferkosten nicht transparent aufgeschlüsselt waren und zu einer verwirrenden Nettosumme führten. → Live-Deployment mit korrigierter Berechnung und Darstellung der Lieferkosten im PDF.


### KVP Update (2026-05-06)
- [WIN] Implementierung eines Lightbox-Effekts für Stil-Vorschaubilder und anschließendes Deployment. → Lightbox-Effekt ist live auf profilfoto-ki.de
- [WIN] Implementierung eines Hover-Zoom-Effekts für Stil-Vorschaubilder und anschließendes Deployment. → Hover-Zoom-Effekt ist live auf profilfoto-ki.de


### KVP Update (2026-05-06)
- [WIN] Durchführung eines paranoiden Sicherheits- und DSGVO-Audits für profilfoto-ki.de und Implementierung aller kritischen und notwendigen Fixes. → Selfie-Storage privat, RLS aktiv, Security Headers live, DSE aktualisiert und realitätskonform, Abmahnrisiken reduziert, automatische Selfie-Löschung implementiert.
- [WIN] Durchführung eines paranoiden Sicherheits- und DSGVO-Audits für profilfoto-ki.de und Implementierung aller kritischen und notwendigen Fixes. → Selfie-Storage privat, RLS aktiv, Security Headers live, DSE aktualisiert und realitätskonform, Abmahnrisiken reduziert, automatische Selfie-Löschung implementiert.
- [WIN] Durchführung eines paranoiden Sicherheits- und DSGVO-Audits für profilfoto-ki.de und Implementierung aller kritischen und notwendigen Fixes. → Selfie-Storage privat, RLS aktiv, Security Headers live, DSE aktualisiert und realitätskonform, Abmahnrisiken reduziert, automatische Selfie-Löschung implementiert.
- [WIN] Durchführung eines paranoiden Sicherheits- und DSGVO-Audits für profilfoto-ki.de und Implementierung aller kritischen und notwendigen Fixes. → Selfie-Storage privat, RLS aktiv, Security Headers live, DSE aktualisiert und realitätskonform, Abmahnrisiken reduziert, automatische Selfie-Löschung implementiert.


### KVP Update (2026-05-07)
- [WIN] Erfassung der Performance von LinkedIn-Posts, Nachverfolgung von Top-Performern und Erstellung sowie Veröffentlichung eines neuen LinkedIn-Posts für Meltem Tepecik. → 7 LinkedIn-Posts in Supabase aktualisiert, 1 neuer Post live gestellt (Post-ID urn:li:share:7458086301788033025), 1 Skill-Patch durchgeführt.


### KVP Update (2026-05-07)
- [WIN] Behebung von Problemen beim Greenscreen-Compositing für `reel_044`, einschließlich der Korrektur fehlerhafter Frames und der Umstellung auf eine effizientere Chroma-Keying-Methode. → 576 Frames in 85 Sekunden verarbeitet, Remotion neu gerendert.


### KVP Update (2026-05-07)
- [WIN] Die aktualisierte Website autohaus-video.de wurde nach erfolgreichem Preflight auf Netlify deployed. → Website ist live auf https://autohaus-video.de mit allen Änderungen.


### KVP Update (2026-05-08)
- [WIN] Mehrere kleine Textanpassungen (Klammer entfernen, Autorennamen, Endzeit) auf der toolfestival.de Website wurden umgesetzt und deployed. → 3 Deploys live: `69fa4a73`, `69fa4bc3`, `69fa4c5a` mit verifizierten Änderungen.


### KVP Update (2026-05-08)
- [WIN] Analyse der Impressionen und Klicks, Identifizierung von Seiten mit hohem Optimierungspotenzial (hohe Impressionen, 0 Klicks) und Anpassung von Title/Meta-Descriptions, um die CTR zu verbessern. → CTR-Fixes für 16 Seiten implementiert und deployed, Preis aus Meta-Descriptions entfernt, Keywords und Freemium-Hooks hinzugefügt.


### KVP Update (2026-05-08)
- [WIN] Behebung kritischer SEO-Probleme, die die Indexierung von toolfestival.de verhinderten. → robots.txt, sitemap.xml, canonical, OG-Tags, Twitter Card, meta robots, Schema.org Event JSON-LD live und korrekt.
- [WIN] Systematische Behebung von HTML-Entity-Escaping-Bugs und anderen Render-Fehlern auf der gesamten Website. → Keine `&quot;`, `&amp;`, `&rarr;` oder andere Render-Bug-Muster mehr im Live-HTML gefunden.
- [WIN] Redaktionelle Überprüfung und Korrektur von Tippfehlern und Markenkonsistenz in den Texten der Website. → 6 spezifische Pflicht-Fixes (Tippfehler, Markenkonsistenz) live und korrekt umgesetzt.


### KVP Update (2026-05-08)
- [FAIL] Der Skill konnte nicht vollständig ausgeführt werden, da das Hero-Image fehlte und ein explizites OK vor dem Push erforderlich ist.


### KVP Update (2026-05-08)
- [FAIL] Der Skill konnte nicht vollständig ausgeführt werden, da der Push aufgrund des fehlenden Hero-Images und der Anweisung, vor dem Push zu stoppen, nicht erfolgte.


### KVP Update (2026-05-08)
- [WIN] Systematische Entfernung von Preisangaben aus Titeln und Meta-Beschreibungen auf 20 Seiten, um die Klickrate für informationelle Suchanfragen zu verbessern. → 20 Seiten mit CTR-Fixes deployed
- [WIN] Verbesserung der Content-Tiefe und interner Verlinkung für die Seite `/ratgeber/coole-profilbilder-whatsapp/`. → Wortzahl von 1342 auf 1557 erhöht, 2 interne Links hinzugefügt
- [WIN] Hinzufügen von FAQ-Sektionen und FAQPage Schema zu `/cv-foto/` und `/lebenslauf-foto/` zur Verbesserung der Rich Results in den SERPs. → FAQ-Sektionen und FAQPage Schema auf 2 Seiten implementiert


### KVP Update (2026-05-08)
- [WIN] Vollständiger Business Launch für autohaus-video.de, von der Infrastruktur bis zur Lead Capture Pipeline. → Live-Website autohaus-video.netlify.app mit funktionierender Lead Capture, UI/UX Score von 96/100 (Accessibility) und 100/100 (Performance, Best Practices, SEO).
- [WIN] Iterative Verbesserung des UI/UX-Designs der Landing Page basierend auf User-Feedback und Elite UI/UX Skill. → UI/UX Score von 77/100 auf 96/100 (Accessibility) und 100/100 (Performance, Best Practices, SEO) verbessert.
- [WIN] Iterative Verbesserung der Texte der Landing Page basierend auf User-Feedback und Humanizer-DE Skill. → Hero-Claim, Subline, Pain-Section und Benefits wurden mehrfach überarbeitet, um kognitive Last zu reduzieren und Zielgruppe besser anzusprechen.
- [WIN] Implementierung einer End-to-End Lead Capture Pipeline mit Supabase Edge Functions, Storage und Result-Page. → Funktionierendes Formular mit Foto-Upload, JPEG-Konvertierung, Speicherung in Supabase und Weiterleitung zu einer Status-Seite (`/v/[slug]`).


### KVP Update (2026-05-08)
- [WIN] Erstellung einer B2B-AGB-Seite, Hinzufügen von AGB-Links zu Footern und Aktualisierung von Meta-Tags für SEO/Social Media. → AGB-Seite live, Footer-Links live, og:image und Twitter-Tags live.
- [WIN] Paranoides Audit der autohaus-video.de Website gegen Google for Startups Guidelines, inklusive Fehlerbehebung für Hero-Sichtbarkeit. → Audit-Ergebnis: PASS, Hero-Content sofort sichtbar, alle Google-Anforderungen erfüllt.


### KVP Update (2026-05-08)
- [WIN] Behebung von 2 kritischen 404er-Links im Footer und in der Sitemap, Hinzufügen von 9 Orphan-Pages zur Sitemap und Sicherstellung der Sitemap-Konsistenz. → Sitemap URL Count von 76 auf 83 erhöht, Broken Slugs in Sitemap von 2 auf 0 reduziert, 9 Orphan-Pages hinzugefügt, Footer-Links von 404 auf `/bewerbungsfoto-ki/` geändert.


### KVP Update (2026-05-08)
- [WIN] Behebung von Netlify-Deploy-Fehlern im Zusammenhang mit Node-Version und `package.json`-Handling für Astro-Projekte. → Netlify build SUCCESS, Astro-Preview live.


### KVP Update (2026-05-10)
- [FAIL] Versand von personalisierten Instagram DMs an Leads aus dem Google Sheet, inklusive Generierung, Einfügen und Senden der Nachrichten.


### KVP Update (2026-05-10)
- [WIN] Das Favicon für toolfestival.de wurde von einem generischen Next.js-Icon auf ein gebrandetes Logo umgestellt und für alle Clients optimiert. → Neues Favicon live, alte default-favicon.ico entfernt, Multi-Size ICO verfügbar, HTTP 200 für alle Favicon-Assets.


### KVP Update (2026-05-10)
- [WIN] Umfassender Pivot von SEO-Strategie zu GEO-Strategie für autohaus-video.de, inklusive Erstellung und Deployment von 13 neuen Seiten (Hub, 10 Q&A, Q&A-Index, Standort-Seite) und Integration des Humanizer-DE Quality Gates. → 22 Files deployed, 13 neue GEO-Pages live, alle Humanizer-DE Checks bestanden, GEO-Baseline-Re-Test durchgeführt.


### KVP Update (2026-05-10)
- [FAIL] Der Visual Upload für den X-Post schlug aufgrund von Chrome MCP-Einschränkungen und Mixed-Content-Regeln fehl.


### KVP Update (2026-05-10)
- [WIN] Erstellung und Deployment von 13 neuen GEO-optimierten Seiten (Hub, Q&A-Library, Standort-Seite) inklusive Pipeline-Updates und Humanizer-Check. → 13 neue GEO-Pages live (22 Files deployed), Humanizer-Gate bestanden, GEO-Baseline-Re-Test durchgeführt.


### KVP Update (2026-05-11)
- [WIN] Behebung fehlender interner Verlinkung für neue Pages in Navigation und Footer. → Alle neuen Links sind live verlinkt und aus der Homepage erreichbar.


### KVP Update (2026-05-11)
- [FAIL] Browser war unresponsive/eingefroren während des Sheet-Updates, was manuelle Eingriffe erforderte.
- [WIN] Überarbeitung und Personalisierung von 30 Instagram DMs für Local SMB Leads basierend auf externen Daten und neuen Kommunikationsregeln. → 30 V6-DMs im Sheet K32:K61, 30 Profil-Notizen in L32:L61, aktualisierte Status in F32:F61, Integration von DataForSEO und Apify.


### KVP Update (2026-05-11)
- [WIN] Erstellung von 3 neuen, unique pSEO-Seiten für profilfoto-ki.de basierend auf spezifischen Angles und unter Berücksichtigung der Astro-Infrastruktur. → 3 Seiten (`/lustige-profilbilder-whatsapp/`, `/coole-profilbilder-jungs/`, `/gaming-profilbild/`) erstellt und erfolgreich gebaut.


### KVP Update (2026-05-11)
- [WIN] Sicherstellen, dass der lokale HTTP-Server persistent läuft. → HTTP-Server läuft persistent auf Port 7823 (PID 44756).


### KVP Update (2026-05-11)
- [WIN] Erstellung und Deployment von drei neuen pSEO-Seiten für profilfoto-ki.de, die jeweils eine hohe UI/UX-Qualität aufweisen. → 3 Seiten deployed mit Scores von 94/100, 92/100, 96/100.


### KVP Update (2026-05-11)
- [WIN] Drei neue pSEO-Seiten wurden auf profilfoto-ki.de deployed und bei Google, Bing und Yandex zur Indexierung eingereicht. → 3 Seiten deployed, Sitemap aktualisiert, IndexNow Ping akzeptiert, 3 URLs bei GSC eingereicht.


### KVP Update (2026-05-11)
- [WIN] Eine statische Website für 'Urcu Grup YZ Atlas' wurde auf Netlify deployed, inklusive Initialisierung, API-basierter Site-Erstellung und Verifikation. → Site 'https://urcu-grup-yz-atlas.netlify.app' ist live, HTTP 200, korrekte Inhalte und Header.


### KVP Update (2026-05-11)
- [WIN] Technische Begriffe und der Begriff 'Use Case' wurden aus dem Website-Copy entfernt und durch benutzerfreundlichere Formulierungen ersetzt. → 11 Begriffe wurden geändert und die Website aktualisiert.


### KVP Update (2026-05-11)
- [WIN] Erstellung eines neuen Skill-Templates 'branchen-hooks.md' zur Konsolidierung von Hook-Patterns und branchenspezifischen Regeln. → branchen-hooks.md mit 7 Sektionen und ~200 Zeilen erstellt.


### KVP Update (2026-05-11)
- [WIN] Identified and fixed mobile layout issues on the `tolga.html` pitch page for Urcu Grup, then deployed and verified the changes. → Mobile renders perfectly on 390px viewport (iPhone), with single-column hero, 2-column stats bar, single-column jump nav, and clean project sections. No horizontal overflow or clipped text.
