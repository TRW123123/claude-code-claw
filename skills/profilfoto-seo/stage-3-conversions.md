# Stage 3: Klicks → Conversions (CRO via GA4)

## Status: INAKTIV

Diese Stage ist fuer profilfoto-ki.de **noch nicht aktiv**. Aktivierung erfordert:

## Aktivierungs-Kriterien

1. **>50 Klicks/Woche** — Aktuell ~3 Klicks/Woche (12 in 30 Tagen). Statistisch nicht signifikant fuer CRO-Tests.
2. **GA4 MCP eingerichtet** — `mcp__analytics-mcp` ist installiert, Property muss verbunden werden
3. **Conversion-Events definiert** in GA4:
 - `signup` (neue Registrierung)
 - `first_photo_generated` (Free Credit eingeloest)
 - `purchase` (Stripe-Kauf)
4. **Stripe Webhook → Supabase** Event-Logging muss laufen

## Warum noch nicht aktiv

- Aktueller Traffic-Floor zu niedrig fuer statistisch valide CRO-Tests
- Stage 2 (CTR-Optimierung) hat groesseren Hebel: 1233 Impr → mehr Klicks → erst dann CRO
- Erst wenn Stage 1 + 2 den Traffic hochgezogen haben, lohnt sich Stage 3

## Wenn aktiviert: Workflow

### Schritt 1: GA4 Conversion-Funnel laden

```
mcp__analytics-mcp__run_report
property_id: [GA4 Property ID profilfoto-ki]
metrics: [sessions, conversions, revenue]
dimensions: [landing_page, source_medium]
date_range: last_28_days
```

### Schritt 2: Drop-Off-Punkte identifizieren

```
Funnel:
Landing → Sign-Up → First Photo → Purchase

Drop-Off pro Schritt analysieren:
- Landing → Sign-Up: <10% = Hero-CTA Problem
- Sign-Up → First Photo: <50% = Onboarding Problem
- First Photo → Purchase: <5% = Wasserzeichen-Wert nicht klar
```

### Schritt 3: A/B-Test-Vorschlaege generieren

Fuer profilfoto-ki sind die wichtigsten Hebel:
1. **Hero-CTA Wording** — "Jetzt testen" vs "1 Foto gratis" vs "Kostenlos starten"
2. **Wasserzeichen-Sichtbarkeit** — Wie aggressiv? Wo platziert?
3. **Preis-Ankerung** — Welche Pakete zuerst zeigen?
4. **Trust-Signale** — Reviews, Anzahl Nutzer, Geld-zurueck
5. **Onboarding-Friction** — Wieviele Felder bei Sign-Up?

### Schritt 4: Test-Setup

profilfoto-ki ist Vanilla HTML — kein Built-in A/B-Test-Framework. Optionen:
- **Netlify Split Testing** (built-in, kostenlos)
- **Google Optimize** (deprecated, nicht mehr verfuegbar)
- **Manuelle Variante** mit Cookie-basiertem Routing

### Schritt 5: Impact in Changelog

```sql
SELECT insert_changelog(
 'profilfoto-ki.de',
 '/[seite]/',
 'design',
 '[alte-variante]',
 '[neue-variante]',
 'CRO Stage 3: A/B-Test [hypothesis] — Sample Size [N], Conversion Vorher [X]%, Nachher [Y]%',
 '[commit]',
 'claw-agent'
);
```

## Hard Rules

1. **Statistische Signifikanz** — Mind. 100 Conversions pro Variante vor Entscheidung
2. **Eine Variable pro Test** — keine Mehrfach-Tests
3. **Stripe-Daten = Single Source of Truth** fuer Revenue
4. **Keine A/B-Tests auf <500 Sessions/Woche pro Seite** — zu volatil
5. **Aktivierung nur wenn Traffic-Floor erreicht ist** (siehe Aktivierungs-Kriterien oben)
