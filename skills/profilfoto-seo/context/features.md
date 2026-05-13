# Product Features — profilfoto-ki.de

## Produkt in einem Satz
KI-gestützte professionelle Profilfotos für LinkedIn, Bewerbungen, Dating, Social Media — ohne Fotograf, in 5 Minuten, für einen Bruchteil der Kosten.

## Funnel & Pricing

### Freemium-Einstieg
- **1 kostenloser Credit** für neue User
- Dieser Credit erzeugt ein **wassergezeichnetes** Bild
- User sieht Qualität vor Kauf → Conversion-Hebel

### Pricing (Stripe Live)

| Plan | Preis | Credits | Preis/Bild | Zielgruppe |
|---|---|---|---|---|
| Kennenlernen | 4,99 € | 2 | 2,50 € | Ausprobierer |
| Professional | 29 € | 12 | 2,42 € | Standard-Use-Case |
| Executive | 79 € | 40 | 1,98 € | Power-User / mehrere Anlässe |

**Hard Rule Preise:** Nicht auf Seiten anzeigen wenn sich die Preise ändern könnten — stattdessen "ab 4,99 €" verwenden und auf /preise/ verlinken.

## Kern-Features

### 1. Input (User-Seite)
- **8-15 Fotos hochladen** — Selfies + Fremdfotos gemischt
- Keine Hüte, keine Sonnenbrillen, keine Gruppenfotos
- Handyfotos reichen — keine Profi-Kamera nötig
- Upload-Dauer: ~30 Sekunden

### 2. Processing
- **n8n Workflow** "Profilfoto-KI – V3 Production (with Watermark)"
- Trigger via Webhook
- Gemini 3.1 Flash Image Preview als Generierungs-Modell
- **Wasserzeichen-Logik:** Bei `is_watermarked=true` wird das Wasserzeichen direkt im Gemini-Prompt gerendert (keine serverseitige Bildbearbeitung)
- Durchschnittliche Generierungsdauer: 3-5 Minuten
- User bekommt Email mit Download-Link

### 3. Output
- **Multiple Stile** pro Session (Corporate, Casual, Creative etc.)
- Hohe Auflösung (print-ready)
- Keine Wasserzeichen bei zahlenden Kunden
- Ähnlichkeit zur echten Person: ~80% abhängig von Input-Qualität

### 4. Use Cases (Cluster-Mapping)
- **LinkedIn-Profilfoto** → Hauptziel, häufigster Use Case
- **Bewerbungsfoto** → CV, Anschreiben, deutsche Bewerbungen
- **Xing / Business Portraits**
- **Social Media** (Instagram, Facebook, Dating)
- **Arzt / Anwalt / Coach-Portraits** → Branchenseiten

## Tech-Stack (intern)

- **Frontend:** Vanilla HTML5 + Tailwind CSS, KEIN Build-Step (dist/ = src/)
- **Hosting:** Netlify (Workspace: nanobanana)
- **Backend:** Supabase (NanoBanana, `[your-supabase-project-id]`) + Supabase Edge Functions
- **Processing:** n8n Cloud Workflows
- **Zahlungen:** Stripe via Supabase Edge Functions (`create-checkout`, `stripe-webhook`)
- **Lead-Erfassung:** Edge Function → `st_leads` Tabelle → n8n → Gmail (ersetzt mailto:)

## Was das Produkt NICHT macht

- **Kein Bild-Editor** — User bearbeitet keine Bilder nach
- **Keine Hintergrund-Austausch-Funktion** (noch nicht)
- **Keine Videos** — nur Stills
- **Keine Gruppen-Fotos**
- **Keine NSFW-Inhalte**
- **Kein API-Zugang** für Drittsysteme (noch nicht)

## Monetarisierungs-Hebel für SEO-Seiten

Seiten die **zahlende User generieren sollen** brauchen:
1. **Klarer CTA** — "Jetzt kostenlos testen" (nicht "Mehr erfahren")
2. **Preis-Anker** — "ab 4,99 €" (Kennenlernen-Plan)
3. **Social Proof** — aggregateRating Schema, Testimonials
4. **Friction-Minimizer** — "Keine Registrierung nötig für Test"
5. **Wasserzeichen-Disclaimer** — transparent: "Der Test ist wassergezeichnet"

## Features die wir NICHT bewerben sollten (aus Erfahrung)

- **"KI"** als Hauptverkaufsargument → triggert Skepsis statt Vertrauen
- **Technische Details** (Diffusion Model, Gemini etc.) → interessiert keinen
- **"Unbegrenzt"** → haben wir nicht, Credit-basiert
