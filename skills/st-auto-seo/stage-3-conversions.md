# Stage 3: Klicks → Kunden (CRO + GA4)

## Zweck
Analyse welche Seiten Traffic bekommen aber nicht konvertieren.
Nutzt GA4 MCP fuer Verhaltens-Daten und das bestehende Lead-Erfassungssystem.

## Wann ausfuehren
- **Weekly:** Als Teil des Weekly Strategy Agent (Montag)
- **Voraussetzung:** GA4 MCP muss verbunden und stabil sein
- **Minimum-Traffic:** Erst sinnvoll ab >50 Klicks/Woche fuer st-automatisierung.de

## Vorbedingung: GA4 Property ID

Beim ersten Lauf:
1. GA4 MCP Tool `get_account_summaries` aufrufen
2. Property fuer st-automatisierung.de identifizieren
3. Property ID hier eintragen: **[TBD — beim ersten Lauf setzen]**

## Weekly CRO-Report Workflow

### Schritt 1: GA4 Seitenperformance abrufen

GA4 MCP Tool: `run_report`

```json
{
  "property_id": "[PROPERTY_ID]",
  "date_ranges": [{"start_date": "14daysAgo", "end_date": "yesterday"}],
  "dimensions": ["pagePath"],
  "metrics": ["sessions", "bounceRate", "averageSessionDuration", "engagedSessions", "conversions"],
  "order_by": [{"metric": {"metric_name": "sessions"}, "desc": true}],
  "limit": 30
}
```

### Schritt 2: CRO-Scoring pro Seite

Fuer jede Seite mit >= 5 Sessions bewerten:

| Metrik | Gut | Warnung | Kritisch |
|---|---|---|---|
| Bounce Rate | < 50% | 50-70% | > 70% |
| Avg Session Duration | > 60s | 30-60s | < 30s |
| Engaged Sessions Ratio | > 60% | 40-60% | < 40% |
| Conversions | > 0 | — | 0 bei > 20 Sessions |

### Schritt 3: Problem-Seiten identifizieren

```
Prioritaet 1: Viele Sessions + 0 Conversions → CRO fehlt komplett
Prioritaet 2: Hohe Bounce Rate + gute Position → Content/Design Problem
Prioritaet 3: Kurze Verweildauer → Content nicht engaging
```

### Schritt 4: CRO-Empfehlungen generieren

Fuer jede Problem-Seite:

**Bei hoher Bounce Rate:**
- Hero Section pruefen: Ist der Value Proposition klar?
- CTA above the fold vorhanden?
- Ladezeit OK? (Lighthouse pruefen)
- Content-Match: Stimmt der Seiteninhalt mit dem Search Intent ueberein?

**Bei kurzer Verweildauer:**
- Content-Laenge ausreichend? (800+ Woerter)
- Scannable? (Ueberschriften, Listen, Tabellen)
- Visuelle Elemente? (Bilder, Icons, Grafiken)

**Bei 0 Conversions:**
- CTA vorhanden? Ist er sichtbar?
- Kontaktformular / Telefonnummer / E-Mail erreichbar?
- Trust-Signale? (BAFA Badge, Referenzen, Zertifikate)
- Formular-Friction? (zu viele Felder, DSGVO-Warnung)

### Schritt 5: Lead-Tracking pruefen

Das Lead-Erfassungssystem (Supabase + n8n, gebaut 04.04.2026) pruefen:

```sql
-- Gibt es eine Leads-Tabelle?
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE '%lead%';

-- Oder werden Leads via Webhook Queue getrackt?
-- HINWEIS: claw.webhook_queue 2026-04-19 gedroppt (Legacy). Folgendes SQL obsolet:
SELECT * FROM claw.webhook_queue
WHERE payload->>'domain' = 'st-automatisierung.de'
  AND task_type LIKE '%lead%'
ORDER BY created_at DESC LIMIT 10;
```

### Schritt 6: Agent-Log

```markdown
### Stage 3: CRO Report
| Seite | Sessions | Bounce | Duration | Conversions | Problem |
|---|---|---|---|---|---|
| /l/bafa-foerderung-ki-beratung/ | 15 | 73% | 22s | 0 | Kein CTA above fold |

#### CRO Prioritaeten
1. /l/bafa-foerderung-ki-beratung/ — CTA hinzufuegen (hoechster Traffic)
2. /l/angebotserstellung-automatisieren/ — Content erweitern (23s Verweildauer)
```

## Einschraenkungen

- GA4 MCP ist neu und moeglicherweise instabil (18s Startup, gRPC Deadlock-Bug)
- Bei MCP-Fehler: Agent-Log schreiben dass GA4 nicht erreichbar war, KEIN Retry-Loop
- CRO-Empfehlungen sind Analyse-Output, KEINE autonomen Code-Aenderungen
- Code-Aenderungen fuer CRO: Immer Safak-OK einholen
