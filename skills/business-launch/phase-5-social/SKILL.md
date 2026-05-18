---
name: phase-5-social
description: Business Launch Phase 5 — Social Media Setup + Content-Strategie. TikTok, Instagram, YouTube, LinkedIn, X. Wird von business-launch Master-Skill geladen.
allowed-tools: [Read, Write, Edit, Bash, Skill, mcp__Claude_in_Chrome__navigate, mcp__Claude_in_Chrome__read_page, mcp__Claude_in_Chrome__find, mcp__Claude_in_Chrome__form_input, mcp__Claude_in_Chrome__computer]
---

# Phase 5 — Social Media Launch

## Voraussetzungen
- Phase 4 abgeschlossen, SEO-Foundation steht
- humanizer-de Skill verfügbar (Pflicht für alle Texte)
- ai-ugc Skill verfügbar (für Video-Content)
- Produkt/Service klar definiert, Zielgruppe bekannt

---

## Schritt 1: Plattform-Priorität festlegen

**Nicht alle Plattformen gleichzeitig starten** — wähle 2–3 Primär-Plattformen basierend auf Zielgruppe:

| Zielgruppe | Primär | Sekundär |
|---|---|---|
| B2B (Händler, Handwerker, Makler) | LinkedIn, TikTok | YouTube |
| B2C Konsumenten | TikTok, Instagram | YouTube |
| Tech/Startup | X, LinkedIn | YouTube |
| Alle | TikTok | LinkedIn + Instagram |

**→ User fragen welche Plattformen Priorität haben.**

---

## Schritt 2: Account-Setup (Browser)

Für jede gewählte Plattform:

### TikTok Business
```
1. https://www.tiktok.com/business/ → "Create Now"
2. Business-Account (kein Creator): Kategorie = {Branche}
3. Profilbild: Logo oder professionelles Bild
4. Bio: {Hauptnutzen in 1 Satz} + Link zu {domain}
5. Link in Bio: https://{domain}
```

### Instagram Business
```
1. App: Account → "Zu Professional Account wechseln" → Business
2. Kategorie wählen: {Branche}
3. Bio: {USP} + Link zu {domain}
4. Linktree oder direkte URL (wenn nur 1 Produkt)
5. Story Highlight anlegen: "Über uns", "Leistungen", "Kontakt"
```

### LinkedIn Company Page
```
1. https://www.linkedin.com/company/setup/new/
2. Firmenname: {Firmenname}
3. URL: linkedin.com/company/{projektName}
4. Tagline: {USP in max 120 Zeichen}
5. Logo + Cover-Bild (1128×191px)
6. Beschreibung: Problem → Lösung → CTA (humanizer-de Gate!)
```

### YouTube Channel
```
1. YouTube Studio → Kanal erstellen (Brand Account)
2. Kanalname: {Firmenname}
3. Handle: @{projektName}
4. Beschreibung: Was der Kanal bietet + Link zu {domain}
5. Kanalkunst (2560×1440px)
6. Trailer-Video: 60s Pitch (ai-ugc Skill nutzen)
```

### X (Twitter)
```
1. https://twitter.com → Account erstellen
2. Handle: @{projektName}
3. Bio: {Hauptnutzen} | Link: {domain}
4. Pinned Tweet: Produkt-Launch Ankündigung
```

---

## Schritt 3: Profil-Texte (humanizer-de Gate)

**PFLICHT:** Alle Bio-Texte, Beschreibungen und Posts MÜSSEN durch humanizer-de laufen bevor sie live gehen.

```bash
# Für jeden Profil-Text:
node ~/.claude/skills/humanizer-de/scripts/check.mjs \
 --profile {plattform} \
 --text "{text}"
```

Wenn Score nicht erreicht → Rewrite-Loop bis Pass.

---

## Schritt 4: Content-Strategie definieren

**Posting-Frequenz (realistisch für Launch-Phase):**
- TikTok: 3–5x/Woche
- Instagram: 3x/Woche (Reels bevorzugt)
- LinkedIn: 2–3x/Woche
- YouTube: 1x/Woche
- X: 3–5x/Woche

**Content-Typen für B2B-Produkte:**
1. **Vorher/Nachher** — Transformation zeigen (Hauptformat)
2. **How-It-Works** — 30–60s Demo-Video
3. **Kundenstimmen** — sobald erste Kunden vorhanden
4. **Behind the Scenes** — Vertrauen aufbauen
5. **Branchenspecific Pain Points** — Problem-Awareness

---

## Schritt 5: Erstes Content-Set produzieren (10 Stück)

**Vor dem Launch: 10 Posts/Videos in der Pipeline.**

Für Video-Content → `ai-ugc` Skill aktivieren:
- Hook (0–3s): Zielgruppen-spezifisches Problem
- Problem (3–10s): Konkret, kein Bullshit
- Lösung (10–25s): Produkt/Service in Aktion
- CTA (25–30s): Link in Bio / Webseite / DM

Für Text-Content (LinkedIn/X):
- Problem-Post: Häufiger Fehler in der Branche
- Lösung-Post: Wie {domain} das löst
- Story-Post: Warum dieses Business gestartet wurde

**Alle Texte durch humanizer-de vor Veröffentlichung.**

---

## Schritt 6: Content-Kalender erstellen

Handoff-Datei ergänzen mit Content-Queue:
```
## Content Queue — {Monat}

| Datum | Plattform | Format | Status |
|---|---|---|---|
| 2026-05-01 | TikTok | Video: Demo | ✅ Ready |
| 2026-05-02 | LinkedIn | Text: Pain-Point | ✅ Ready |
| 2026-05-03 | Instagram | Reel: VorherNachher | 🔄 In Prod |
| ... | | | |
```

---

## Schritt 7: DM-Outreach vorbereiten (Optional)

Falls B2B mit direktem Sales-Ansatz:

- TikTok DM: `tiktok-dm` Skill
- Instagram DM: `insta-dm` Skill
- LinkedIn DM: `outreach` Skill

Alle Nachrichten: humanizer-de Gate mandatory.

---

## Phase 5 Abschluss-Checkliste

```
✅ Plattformen: {N} Accounts erstellt
✅ Alle Profile vollständig ausgefüllt
✅ Bio-Texte: humanizer-de Gate bestanden
✅ 10 Content-Pieces produziert + gepuffert
✅ Erste Posts live (1–2 pro Plattform)
✅ Content-Kalender: 4 Wochen geplant
✅ ai-ugc: Erstes Demo-Video fertig
```

**→ Erste Reichweite und Engagement tracken.**
**→ User-Bestätigung bevor Phase 6 startet.**
