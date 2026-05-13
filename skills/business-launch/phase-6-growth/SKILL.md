---
name: phase-6-growth
description: Business Launch Phase 6 — Google for Startups, Outreach-Sequenzen, CRM-Setup. Wird von business-launch Master-Skill geladen.
allowed-tools: [Read, Write, Edit, Bash, Skill, mcp__Claude_in_Chrome__navigate, mcp__Claude_in_Chrome__read_page, mcp__Claude_in_Chrome__find, mcp__Claude_in_Chrome__form_input, mcp__Claude_in_Chrome__computer]
---

# Phase 6 — Growth

## Voraussetzungen
- Phasen 1–5 abgeschlossen
- Website live, Landing Pages online, Social aktiv
- CRM (Supabase leads-Tabelle) vorhanden

---

## Schritt 1: Google for Startups bewerben (Browser)

**Nutzen:** Bis zu $200k Google Cloud Credits + Mentorship + Tech-Support.

```
1. https://cloud.google.com/startup öffnen
2. "Apply Now" → Startup-Programm
3. Benötigte Infos:
   - Firmenwebsite: https://{domain}
   - Gründungsjahr: 2026
   - Team-Größe: 1–10
   - Funding-Stage: Bootstrapped / Pre-Seed
   - Produkt: {Beschreibung in 2 Sätzen}
   - Zielmarkt: Deutschland / DACH
4. Bewerbung absenden
```

**Humanizer-de Gate:** Alle Freitexte in der Bewerbung prüfen.

Alternativ: **AWS Activate** (bis $100k Credits):
```
https://aws.amazon.com/activate/
```

---

## Schritt 2: B2B Directory Listings

Für Sichtbarkeit und Backlinks:

**Must-Have Einträge:**
```
1. Google Business Profile: https://business.google.com
   → Unternehmenskategorie, Adresse, Tel., Website, Beschreibung
   
2. Bing Places: https://www.bingplaces.com
   
3. Gelbe Seiten: https://www.gelbeseiten.de/eintrag-registrieren
   
4. Branchenspezifisch:
   - Immobilien: immobilienscout24.de/profil
   - Automotive: mobile.de/dealer-registration
   - Handwerk: myhammer.de, blauarbeit.de
```

**Beschreibungstexte** → alle durch humanizer-de vor Einreichung.

---

## Schritt 3: Cold Outreach Sequenz aufsetzen

**Target-Audience definieren:**
| Projekt | Zielgruppe | Plattform | Methode |
|---|---|---|---|
| autohaus-video.de | KFZ-Händler | TikTok, LinkedIn | tiktok-dm, outreach |
| wohnung-staging.de | Immobilienmakler | LinkedIn, Instagram | outreach, insta-dm |
| angebote-erstellen.de | Handwerker, Baugewerbe | TikTok | tiktok-dm |

**Outreach Skill aktivieren:**
→ `outreach` Skill für E-Mail-Sequenzen
→ `tiktok-dm` Skill für TikTok
→ `insta-dm` Skill für Instagram
→ `linkedin-content` + LinkedIn DM für LinkedIn

**Erste Sequenz aufbauen (3 Touchpoints):**
```
Tag 1: Erster Kontakt — Problem benennen, keine Pitch
Tag 3: Follow-up — konkreter Nutzen, Beispiel zeigen
Tag 7: Letzter Versuch — Video/Screenshot als Social Proof
```

Alle Nachrichten: humanizer-de Gate mandatory.

---

## Schritt 4: CRM aktivieren

**Leads aus Outreach + Website ins CRM:**

Supabase `leads` Tabelle (aus Phase 1) + CRM MCP für Lovable-CRM:

```
POST $CRM_MCP_URL/mcp
{"method": "tools/call", "params": {
  "name": "bulk_import_leads",
  "arguments": {
    "leads": [
      {"name": "...", "email": "...", "source": "tiktok-dm", "status": "dm_sent"}
    ]
  }
}}
```

**Follow-up Tracking:**
```
GET due-followups → Wer braucht heute Antwort?
→ log_activity nach jedem Kontakt
→ update_contact_status bei Statuswechsel
```

---

## Schritt 5: Erste Kunden / Piloten gewinnen

**Strategie: 3 Gratis-Piloten vor Paywall**

Ziel: Testimonials + Screenshots + Vorher/Nachher für Social Proof.

```
Angebot: "Ich mache das kostenlos für euch, 
          dafür darf ich das als Referenz nutzen."
```

Nach 3 Piloten:
- Testimonials sammeln (O-Ton, keine generischen Sätze)
- Screenshots / Vorher/Nachher aufnehmen
- Video-Testimonial wenn möglich (ai-ugc Skill)
- Auf Website + Social einbauen

---

## Schritt 6: Pricing & Conversion

**Nach 3 Piloten: Pricing festlegen**

Orientierung:
- Welche Alternativen gibt es? Was kosten die?
- Was wäre der ROI für den Kunden?
- Pricing-Psychologie: 3 Pakete (Basic / Pro / Enterprise)

Landing Page anpassen:
- Pricing-Sektion hinzufügen (Phase 2/3 nachziehen)
- Testimonials einbauen
- "Wie es funktioniert" mit echten Beispielen

---

## Schritt 7: Wachstums-Metriken tracken

Handoff-Datei wöchentlich updaten:

```
## Growth Metriken — KW {N}

Website:
- Besucher: {N}
- Leads (Kontaktformular): {N}
- Conversion Rate: {N}%

Outreach:
- DMs gesendet: {N}
- Antwortrate: {N}%
- Calls gebucht: {N}

Revenue:
- Pilot-Kunden: {N}
- Zahlende Kunden: {N}
- MRR: €{N}
```

---

## Phase 6 Abschluss-Checkliste

```
✅ Google for Startups: Bewerbung eingereicht
✅ Google Business Profile: aktiv
✅ Gelbe Seiten + Bing Places: eingetragen
✅ Outreach: Erste Sequenz live (50+ Kontakte)
✅ CRM: Alle Leads erfasst, Follow-ups getrackt
✅ Piloten: 3 Gratis-Kunden gewonnen
✅ Testimonials: 2–3 gesammelt
✅ Pricing: Live auf Website
✅ Metriken: Tracking aktiv
```

---

## Business Live — Handoff-Datei Final Update

```
Projekt: {domain}
Repo: {pfad}
Supabase: {project-id}

Phase 1: ✅ done — Infra
Phase 2: ✅ done — Website live
Phase 3: ✅ done — {N} Landing Pages
Phase 4: ✅ done — GSC, Legal
Phase 5: ✅ done — Social aktiv
Phase 6: ✅ done — Growth gestartet

Erste Kunden: {N}
MRR: €{N}
Nächstes Ziel: {Milestone}
```

**→ Business läuft. Ab jetzt: Autonomes CLAW-System aufsetzen (site-bootstrap Skill).**
