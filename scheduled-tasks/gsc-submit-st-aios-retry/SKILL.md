---
name: gsc-submit-st-aios-retry
description: Retry GSC Manual-Submit der 6 AIOS-URLs fuer st-automatisierung.de (Kontingent-Reset erwartet)
---

GSC Manual-Submit Retry fuer st-automatisierung.de — 6 AIOS-Cluster-URLs.

## Hintergrund
Am 2026-04-14 nachmittags und am 2026-04-15 morgens wurde der GSC-Submit versucht und jeweils mit "Kontingent ueberschritten" abgelehnt. Das Kontingent ist ein rollierendes 24h-Fenster, nicht kalendertaeglich. Heute ab 15:00 Uhr lokal sollte es frei sein.

## URLs zu submitten (alle sind live 200, in Sitemap, gebaut ueber Commits 222cd02 + b8dcd4c)
1. https://st-automatisierung.de/l/ki-betriebssystem-mittelstand-strategie/   (Pillar, Prio 1)
2. https://st-automatisierung.de/l/schatten-ki-mittelstand-risiken-governance/
3. https://st-automatisierung.de/l/ai-operating-model-mittelstand-unterschied-konzern/
4. https://st-automatisierung.de/l/ki-pilot-scheitert-poc-falle-mittelstand/
5. https://st-automatisierung.de/l/ki-governance-eu-ki-verordnung-mittelstand/
6. https://st-automatisierung.de/l/ki-reifegrad-modell-mittelstand-assessment/

## Vorgehen (Hard Rules aus topic-File)
- Chrome Profil 1, URL-Pfad `/u/1/`, GSC ueber Lesezeichen oder direkte URL
- Property: sc-domain:st-automatisierung.de
- Pro URL: URL-Inspektions-Suchfeld oben → URL eingeben → Suggestion-Dropdown anklicken → Live-Test abwarten (1-2 Min) → "INDEXIERUNG BEANTRAGEN" klicken → Bestaetigungs-Dialog schliessen → naechste URL
- Bei "Kontingent ueberschritten": sofort abbrechen, naechsten Retry fuer morgen 10 Uhr anlegen
- Nach jedem Submit kurz pruefen ob "Indexierung angefordert" Bestaetigung kam

## Tools die du brauchst
- mcp__Claude_in_Chrome__tabs_context_mcp (Tab holen, createIfEmpty:true)
- mcp__Claude_in_Chrome__navigate
- mcp__Claude_in_Chrome__find
- mcp__Claude_in_Chrome__computer (left_click, scroll_to, screenshot)
- mcp__Claude_in_Chrome__javascript_tool (Status-Polling via Text im body)
- mcp__Claude_in_Chrome__form_input

Nutze Chrome MCP, NICHT computer-use (GSC laeuft im Browser).

## Dokumentation am Ende
Schreibe in `claw.changelog` fuer JEDE erfolgreich submittete URL einen Eintrag:
- domain: st-automatisierung.de
- page_path: der /l/... Pfad
- change_type: gsc_submit
- new_value: "GSC Manual-Submit via URL-Inspektion, Indexierung angefordert"
- reason: "Retry nach 24h-Kontingent-Reset, AIOS-Cluster Launch vom 14.04.2026"
- actor: claude-opus-4-6

Supabase Projekt-ID: <SUPABASE_PROJECT_ID> (NanoBanana)

## Abbruch-Kriterien
- Kontingent ueberschritten → abbrechen + neuen Retry fuer morgen 10 Uhr anlegen
- URL bereits indexiert → skip, logge dass Submit nicht noetig war
- Chrome MCP nicht verbunden → abbrechen + in agent-log-YYYY-MM-DD.md schreiben

## Am Ende
- Kurzer Abschlussbericht: X von 6 URLs erfolgreich submittet
- Bei allen 6 erfolgreich: weiteren Retry NICHT anlegen
- Bei Teilerfolg: Retry fuer die fehlenden URLs morgen