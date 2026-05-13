---
name: phase-4-seo
description: Business Launch Phase 4 — GSC einrichten, Schema, Sitemap, Über-uns-Page (Pflicht für Förderung), Impressum, DSGVO, Cookie Consent, Pretty-URLs.
allowed-tools: [Read, Write, Edit, Bash, Skill, mcp__Claude_in_Chrome__navigate, mcp__Claude_in_Chrome__read_page, mcp__Claude_in_Chrome__find, mcp__Claude_in_Chrome__form_input, mcp__Claude_in_Chrome__computer]
---

# Phase 4 — SEO & Legal Foundation

## Voraussetzungen
- Phase 2 abgeschlossen, Site live
- Domain bei Netlify + HTTPS aktiv
- Zoho E-Mail aktiv (für GSC-Verifikation)

---

## Schritt 1: Google Search Console einrichten (Browser)

```
1. https://search.google.com/search-console/ öffnen
2. "Property hinzufügen" → Domain-Property (nicht URL-Prefix)
3. DNS-TXT-Verifikation:
   - GSC gibt google-site-verification=... aus
   - IONOS DNS → {domain} → DNS → TXT-Record
   - Zurück zu GSC → "Bestätigen"
4. Warten 5–30 Min DNS-Propagation
```

---

## Schritt 2: Sitemap einreichen

```bash
# Verify lokal
curl https://{domain}/sitemap.xml
```

GSC → Sitemaps → `https://{domain}/sitemap.xml` → Senden.

---

## Schritt 3: robots.txt

`public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://{domain}/sitemap.xml
```

Niemals `Disallow: /` versehentlich gesetzt lassen.

---

## Schritt 4: ⭐ Über-uns-Page (Pflicht — für Förderung KRITISCH)

**Wenn Pre-Flight Q2 ≠ "Keine":** Über-uns Page ist Bewerbungs-Voraussetzung (z.B. Google Startup Credits werden ohne Founder-Story + Tech-Stack-Info abgelehnt — siehe Pitfall P-14).

**Pflicht-Sektionen:**

### 4.1 Hero
```html
<header>
  <span class="badge">Built in {Stadt} · Powered by {Top-Tech}</span>
  <h1>Über {Firmenname}</h1>
  <p>{Tagline — was ihr tut, in 1-2 Sätzen}</p>
</header>
```

### 4.2 Founder-Section
```html
<section>
  <img src="/images/team/founder-portrait.jpg" alt="{Founder-Name}, Founder von {Firmenname}">
  <span class="badge">Founder Story</span>
  <h2>{Founder-Name}<br><span>Founder & Builder</span></h2>
  <div class="story">
    <p>{Persönlicher Anker — was hat dich getriggert?}</p>
    <p>{Erkenntnis-Moment — was hast du bemerkt?}</p>
    <p>{Gründung — warum jetzt?}</p>
    <p class="bold">{Mission-Statement — was wollt ihr ändern?}</p>
  </div>
</section>
```

**Hard Rule:** Founder-Story muss **mit User verifiziert** sein. NICHT halluzinieren basierend auf Context-Annahmen.

### 4.3 Mission
```html
<section>
  <h2>Unsere Mission</h2>
  <p>{Klare 1-Satz Vision der demokratisierten Lösung}</p>
</section>
```

### 4.4 Differenziatoren (3 Cards)
```html
<section>
  <h2>Was uns anders macht</h2>
  <div class="grid grid-cols-3">
    <article>
      <h3>{Differenziator 1 — z.B. "Made in Germany"}</h3>
      <p>{Beleg, Tech-Stack, geografisch}</p>
    </article>
    <article>
      <h3>{Differenziator 2 — z.B. "Faires Pricing"}</h3>
      <p>{Konkrete Zahlen vs. Wettbewerb}</p>
    </article>
    <article>
      <h3>{Differenziator 3 — z.B. "Echte KI"}</h3>
      <p>{Welches Modell, warum es passt}</p>
    </article>
  </div>
</section>
```

### 4.5 Fakten in Zahlen (4 Stats)
```html
<section>
  <div class="stat"><big>2026</big><small>Gegründet</small></div>
  <div class="stat"><big>{Stadt}</big><small>Standort 🇩🇪</small></div>
  <div class="stat"><big>{Preis}</big><small>{Einheit}</small></div>
  <div class="stat"><big>{Lieferzeit}</big><small>Bis fertig</small></div>
</section>
```

### 4.6 Tech-Stack-Sektion ⭐ (KRITISCH für Förderung)

**Hard Rule (Pitfall P-14):** Tech-Stack-Behauptungen müssen mit User explizit verifiziert sein. Sonst Risiko bei Förderprüfung.

```html
<section>
  <span class="badge">Unter der Haube</span>
  <h2>Wie wir's bauen</h2>
  <p>{Tech-Stack ist auf {Förderer}-Cloud-Infrastruktur aufgebaut. Komplett in der EU. DSGVO-konform.}</p>

  <ol>
    <li>
      <span>01</span>
      <h3>{Top-AI-Service}: {Provider} {Region}</h3>
      <p>{Was läuft hier, welche Modelle, welche Region, DSGVO-Status}</p>
    </li>
    <li>
      <span>02</span>
      <h3>{Reasoning/Brain}: {Modell}</h3>
      <p>{Was macht das, welche Eingabe → welcher Output}</p>
    </li>
    <li>
      <span>03</span>
      <h3>{Bildgenerierung/Detail}: {Modell}</h3>
      <p>{Wozu, welche Limits}</p>
    </li>
    <li>
      <span>04</span>
      <h3>Datenbank: Supabase Frankfurt</h3>
      <p>Postgres in eu-central-1, verschlüsselt at rest + in transit.</p>
    </li>
    <li>
      <span>05</span>
      <h3>Hosting: Netlify Frankfurt</h3>
      <p>Edge-Locations in der EU. Keine US-CDN-Hops für deutsche Nutzer.</p>
    </li>
  </ol>
</section>
```

**Beispiel (autohaus-video) — Google AI Startup-Bewerbung:**
- Stufe 1: Google Veo 3 auf Vertex AI europe-west3 (Frankfurt)
- Stufe 2: Gemini 2.5 Pro für Storyboard
- Stufe 3: Nano Banana (Gemini 2.5 Flash Image) für Detail-Shots
- Stufe 4: Supabase Frankfurt
- Stufe 5: Netlify Frankfurt + n8n EU

### 4.7 CTA mit Trust-Badges
```html
<section class="cta">
  <h2>Bereit für {Action}?</h2>
  <a href="/...">CTA</a>
  <div class="badges">
    <span>DSGVO-konform</span>
    <span>Made in Germany</span>
    <span>{Liefer-USP}</span>
  </div>
</section>
```

---

## Schritt 5: ⭐ JSON-LD Organization @graph (Pflicht)

In `index.html` und `ueber-uns.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://{domain}/#organization",
      "name": "{Firmenname}",
      "legalName": "{Firmenname} · Inhaber {Founder-Name}",
      "url": "https://{domain}/",
      "foundingDate": "{Jahr}",
      "email": "info@{domain}",
      "founder": {
        "@type": "Person",
        "@id": "https://{domain}/ueber-uns#founder",
        "name": "{Founder-Name}",
        "jobTitle": "Founder & Builder",
        "image": "https://{domain}/images/team/founder-portrait.jpg",
        "worksFor": { "@id": "https://{domain}/#organization" }
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "{Straße}",
        "postalCode": "{PLZ}",
        "addressLocality": "{Stadt}",
        "addressCountry": "DE"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "info@{domain}",
        "contactType": "customer support",
        "areaServed": ["DE", "AT", "CH"],
        "availableLanguage": ["de"]
      }
    },
    {
      "@type": "Service",
      "@id": "https://{domain}/#service",
      "serviceType": "{Service-Type}",
      "provider": { "@id": "https://{domain}/#organization" },
      "areaServed": {"@type": "Country", "name": ["Deutschland", "Österreich", "Schweiz"]},
      "offers": {"@type": "Offer", "priceCurrency": "EUR", "price": "{Preis}"}
    },
    {
      "@type": "WebSite",
      "@id": "https://{domain}/#website",
      "url": "https://{domain}/",
      "name": "{Firmenname}",
      "publisher": { "@id": "https://{domain}/#organization" },
      "inLanguage": "de-DE"
    }
  ]
}
</script>
```

**Validation:** https://search.google.com/test/rich-results

---

## Schritt 6: Pretty-URLs (kein .html in Canonical)

Alle internen Links + Canonicals nutzen **Clean URLs** ohne .html:
- `https://{domain}/ueber-uns` ← canonical
- `https://{domain}/impressum`
- `https://{domain}/datenschutz`

In `netlify.toml`:
```toml
# Rewrite (URL bleibt clean, intern wird .html geladen)
[[redirects]]
  from = "/ueber-uns"
  to = "/ueber-uns.html"
  status = 200

# Redirect (alte .html-Links → clean)
[[redirects]]
  from = "/ueber-uns.html"
  to = "/ueber-uns"
  status = 301
  force = false
```

Wiederholen für jede Page.

**Internal Links in HTML:** alle `href="/ueber-uns.html"` → `href="/ueber-uns"` (Pretty-URL).

---

## Schritt 7: Impressum (§5 TMG vollständig)

`src/impressum.html` (oder `app/impressum/page.tsx`):

Pflicht-Sektionen:
1. **Anbieter:** Name, Adresse (Straße, PLZ, Stadt, Land)
2. **Kontakt:** E-Mail (Telefon optional)
3. **Steuernummer:** {NN/NNNN/NNNN}
4. **USt-ID** (wenn vorhanden — sonst weglassen, NICHT erfinden)
5. **Verantwortlich für den Inhalt:** nach §18 Abs. 2 MStV
6. **Streitbeilegung:** EU-ODR-Plattform-Link
7. **Haftungsausschluss**

⚠️ **Hard Rule:** KEINE Platzhalter wie `[STRASSE HAUSNUMMER]` im finalen Deploy. User muss echte Daten liefern. Pre-Phase-4: Liste aller benötigten Felder ausgeben + User um Bestätigung bitten.

```html
<meta name="robots" content="noindex, nofollow">  <!-- Impressum nicht in Google -->
```

---

## Schritt 8: Datenschutzerklärung (DSGVO)

`src/datenschutz.html`:

Pflicht-Sektionen:
1. **Verantwortlicher:** Echter Name + Adresse + E-Mail
2. **Hosting:** Netlify, Inc. (USA) + AVV-Hinweis
3. **Form-Submissions:** welche Daten, wo (Supabase EU), Speicherdauer
4. **Cookies:** technisch notwendige + ggf Analytics
5. **Storage / File-Uploads:** wenn Q3=B/C/D — wo Files liegen, wie lange, wer Zugriff
6. **Betroffenenrechte:** Auskunft, Löschung, Widerspruch (Art. 15-21 DSGVO)
7. **Beschwerderecht:** zuständige Aufsichtsbehörde (z.B. NRW: Düsseldorf)

**Tool:** https://www.datenschutz-generator.de/ via Browser für vollständigen Text.

⚠️ Beim Static-Site-Pattern: Datenschutz-File muss `<meta name="robots" content="index, follow">` haben (DSGVO-konform = OK indexierbar) — nur Impressum hat noindex.

---

## Schritt 9: Cookie Consent

**Wenn nur technisch notwendige Cookies:** kein Banner nötig (DSGVO erlaubt).

**Wenn Analytics/Tracking:** Banner pflicht.

Plausible (Privacy-First, **kein Banner nötig**) — empfohlen für static sites.

GA4 → Banner-Pflicht. Komplexer.

---

## Schritt 10: Footer-Links prüfen

Footer muss enthalten:
- `/ueber-uns`
- `/impressum`
- `/datenschutz`
- `© {Jahr} {Firmenname} · {Stadt}`

Alle Links live testen (nicht 404, nicht .html, sondern Pretty-URL).

---

## Schritt 11: Core Web Vitals & Lighthouse (Final)

Vor Phase 4 Abschluss: Lighthouse-Audit beider Pages (Index + Über-uns):

```
mcp__dataforseo__on_page_lighthouse
url: https://{domain}/
url: https://{domain}/ueber-uns
```

**Ziel-Scores:**
| Metrik | Ziel |
|---|---|
| Performance | ≥ 95 |
| Accessibility | ≥ 95 |
| Best Practices | 100 |
| SEO | 100 |
| LCP | < 1.5s |
| CLS | < 0.1 |

Wenn unter Target → `COMMON_PITFALLS.md` lesen + spezifische Fixes anwenden.

---

## Schritt 12: Rich-Results-Test

```
https://search.google.com/test/rich-results
URL: https://{domain}/ueber-uns
```

Validiert JSON-LD Organization + Service + WebSite Schema. Alle 3 müssen "valid" zeigen.

---

## Phase 4 Abschluss-Checkliste

```
✅ GSC: Property verifiziert + Sitemap erfolgreich
✅ robots.txt: Allow + Sitemap korrekt
✅ Über-uns-Page mit Founder-Story + Tech-Stack (Q2 verifiziert)
✅ JSON-LD Organization @graph in index + ueber-uns
✅ Pretty-URLs (canonical ohne .html) konfiguriert + alle internen Links umgestellt
✅ Impressum: §5 TMG vollständig (KEINE Platzhalter)
✅ Datenschutz: DSGVO-konform mit Storage/File-Section wenn relevant
✅ Cookie Consent: aktiv ODER Plausible (kein Banner)
✅ Footer: Über-uns + Impressum + Datenschutz Links (Pretty-URLs)
✅ Lighthouse: ≥95/95/100/100 auf Index + Ueber-uns
✅ Rich-Results-Test: alle Schemas valid
✅ Core Web Vitals: LCP < 1.5s, CLS < 0.1
```

**→ User-Bestätigung bevor Phase 5 (Social) startet.**
**→ GSC: 3–5 Tage warten bis erste Crawl-Daten erscheinen.**

---

## Förderung-Bewerbung (wenn Q2 ≠ Keine)

Nach Phase 4: Site ist bewerbungsbereit. Pflicht-Pages:
- Über-uns mit Founder-Story ✅
- Tech-Stack-Sektion mit verifiziertem Stack ✅
- JSON-LD Organization Schema ✅
- Impressum mit echten Daten ✅
- Made-in-Germany / DSGVO-Story ✅

Phase 6 (Growth) übernimmt dann den eigentlichen Bewerbungs-Prozess.
