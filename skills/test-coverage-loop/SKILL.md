---
name: test-coverage-loop
description: Dual-Agent Test-Loop für profilfoto-ki.de Payment/Credit-Flow. Writer-Agent schreibt Vitest/Playwright-Tests, Reviewer-Agent bewertet APPROVE/NEEDS_IMPROVEMENT. Aktivieren bei "test coverage", "add tests", "tests generieren", "test-loop". NUR für profilfoto-ki — andere Domains brauchen eigene Adaption.
---

# Test-Coverage-Loop Skill

## Scope-Lock (Hard Rule)
Dieser Skill ist exklusiv für **profilfoto-ki.de** (Repo `C:/Users/User/Projects/profilfoto-ki-app-v2/`).
Stack: **Vite + React + Supabase** (NICHT Next.js). Test-Runner: **Vitest + Playwright**.

Andere Domains (ki-automatisieren, st-automatisierung, yapayzekapratik) brauchen eigene Adaption — kein Cross-Domain-Einsatz.

## Starter-Scope (kritischste 3 Targets)
| Priorität | Target | Typ | Warum |
|---|---|---|---|
| 1 | Edge Function `stripe-webhook/index.ts` | Integration | Wenn broken → User zahlt ohne Credits. Höchstes Risiko. |
| 2 | Edge Function `create-checkout/index.ts` | Integration | Session-Creation, Auth-Check, `has_purchased_credits`-Flag |
| 3 | `src/pages/Generate.tsx` | Unit + E2E | Credit-Decrement, 1-Free-Credit-Regel, Wasserzeichen-Logik |

Edge-Cases die Tests abdecken müssen: doppelter Webhook, invalides Signing-Secret, expired Event, Refund-Event, Idempotenz.

## Pre-Flight (bevor erster Testlauf)
Blocker die VOR dem ersten Skill-Run geklärt sein müssen:
1. **Test-Supabase-Projekt provisionieren** via `mcp__supabase__create_branch` oder separates Projekt. Hard Rule: "integration tests must hit a real database, not mocks".
2. **Edge-Functions lokal ziehen** via `mcp__supabase__get_edge_function` (Stripe-Webhook, Create-Checkout) → ablegen in `supabase/functions/<slug>/index.ts`
3. **Test-Tooling installieren:**
   ```bash
   cd C:/Users/User/Projects/profilfoto-ki-app-v2
   npm i -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom playwright @playwright/test
   npx playwright install chromium
   ```
4. **Stripe Test-Mode Secrets** in `.env.test` eintragen (NUR `sk_test_*` + `whsec_*` aus Stripe Dashboard → Test-Mode)

Ohne diese 4 Punkte: Tests laufen als `describe.skip` mit Warnung in REVIEW.md.

## 6-Schritt-Prozedur

### Schritt 1 — Target bestätigen
Frage User: "Welche Datei soll getestet werden?" Wenn Starter-Scope: Wahl aus Tabelle oben. Sonst: Pfad angeben.

### Schritt 2 — Writer-Agent (Subagent)
Launch via `Agent`-Tool, subagent_type `general-purpose`:

```
Du bist Writer-Agent. Schreibe Vitest-Tests für die folgende Datei:
<file_path>

Stack: Vite + React + Supabase.
Framework: Vitest (Unit/Integration), Playwright (E2E).

Output: <dateiname>.test.ts im GLEICHEN ORDNER wie das Target.
- Integration-Tests hitten Test-Supabase (Projekt-ID: <TEST_PROJECT_ID>)
- Unit-Tests mocken NUR externe APIs (Stripe-Client, nicht Supabase)
- 1 assert pro `it`-Block
- TypeScript strict mode — jeder Typ muss passen

Hard Rules:
- Keine Prod-Secrets im Test
- Stripe nur test-mode (sk_test_*, whsec_*)
- Edge-Cases: doppelter Webhook, expired Event, invalid Signature
- Keine .skip außer wenn Test-Supabase fehlt

Bei Abschluss: gib den Pfad der geschriebenen Test-Datei zurück.
```

### Schritt 3 — Reviewer-Agent (Subagent, READ-ONLY)
Launch via `Agent`-Tool mit TOOL-BESCHRÄNKUNG (nur Read, Grep):

```
Du bist Reviewer-Agent. READ-ONLY — du darfst keinen Code ändern.
Prüfe die Test-Datei: <test_file_path>

Kriterien:
1. Hitten Integration-Tests eine echte DB oder sind sie gemockt? → Pflicht: echte DB
2. Decken sie Edge-Cases ab? (doppelter Webhook, expired, refund, auth-fail)
3. 1 assert pro `it`-Block?
4. TypeScript-Errors? (npx tsc --noEmit auf Test-File)
5. Test-Namen aussagekräftig?

Output: Schreibe `REVIEW.md` im gleichen Ordner wie die Test-Datei mit:
- Verdict: `APPROVE` ODER `NEEDS_IMPROVEMENT`
- Bei NEEDS_IMPROVEMENT: konkrete Liste was nachgebessert werden muss

Nicht: selbst Code ändern.
```

### Schritt 4 — Loop bei NEEDS_IMPROVEMENT (max 3 Iterationen)
Wenn Reviewer `NEEDS_IMPROVEMENT` schreibt: Writer-Agent neu launchen mit dem REVIEW.md-Inhalt als zusätzlichem Kontext. Nach 3 Iterationen ohne APPROVE: Abbruch + User-Report.

### Schritt 5 — TypeScript-Trockenlauf
```bash
cd C:/Users/User/Projects/profilfoto-ki-app-v2
npx tsc --noEmit
```
Muss grün sein. Bei Fehler: Writer-Agent mit Errors nachbessern lassen.

### Schritt 6 — User-Gate für Execution
Tests werden NICHT automatisch ausgeführt. User-Entscheidung:
- `npx vitest run <test-file>` für Unit/Integration
- `npx playwright test <test-file>` für E2E

Grund: Tests die ein echtes Stripe-Webhook triggern könnten müssen vom Menschen abgesegnet werden.

## Output-Layout
```
src/pages/Generate.tsx
src/pages/Generate.test.ts      ← Writer output
src/pages/REVIEW.md             ← Reviewer output (Verdict + Issues)
```

## Hard Rules (bindend)
1. **Integration-Tests gegen echte Test-DB** — keine Mocks (Hard Rule aus Memory: "integration tests must hit a real database, not mocks")
2. **Keine Prod-Secrets im Test** — nur `sk_test_*`, `whsec_test_*`
3. **TypeScript strict** — kein `any`, keine `@ts-ignore`
4. **1 assert pro `it`-Block** — bei mehreren: aufsplitten
5. **Stripe nur test-mode** — never live-mode in Tests
6. **Test-Supabase Pflicht** — wenn nicht verfügbar: `describe.skip` + klare Warnung in REVIEW.md

## Integration mit `deployment`-Skill
Vorschlag für `deployment`-Preflight-Erweiterung: Wenn ein Diff Dateien in `supabase/functions/**`, `*stripe*`, `Billing*` oder `Generate*` verändert → prüfe dass `REVIEW.md` im selben Ordner `APPROVE` sagt UND die Test-Datei existiert. Sonst: Block.

Implementierung dieses Checks: Folge-Task (nicht Teil dieses Skills).

## Limitationen (transparent)
- **Aktuell keine Test-Supabase** — muss vom User provisioniert werden bevor dieser Skill sinnvoll läuft
- **Edge Functions nicht lokal** — erster Skill-Run muss sie ziehen (Supabase-MCP)
- **Playwright-E2E hat lange Runtime** — nur für kritische Flows (Generate.tsx), nicht für jede Komponente
- **Kein echter Rollback** — wenn Tests die Test-DB in schlechten Zustand bringen: Branch neu anlegen

## Wann NICHT triggern
- Andere Domains (ki-automatisieren, st-automatisierung etc.) — eigene Skills nötig
- Reine TypeScript-Type-Checks — dafür reicht `tsc --noEmit`
- Config-Änderungen (`.env`, `package.json`) — keine Unit-Tests sinnvoll
