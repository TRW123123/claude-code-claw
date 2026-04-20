---
name: funnel-daily-report-profilfoto-ki
description: Tägliche Funnel-Übersicht für profilfoto-ki.de via Telegram
---

Täglicher Funnel-Report für profilfoto-ki.de.

Schritt 1: Query Supabase (project_id: <SUPABASE_PROJECT_ID_PROFILFOTO>) mit execute_sql:

```sql
SELECT * FROM public.funnel_daily WHERE day >= CURRENT_DATE - INTERVAL '7 days' ORDER BY day DESC;
SELECT * FROM public.funnel_summary;
SELECT COALESCE(SUM(amount_cents),0) AS revenue_cents FROM public.orders WHERE status='paid';
```

Schritt 2: Nutze den `telegram-gateway` Skill um eine Nachricht zu senden mit diesem Format:

📊 *Funnel profilfoto-ki.de* (gestern + 7-Tage-Trend)

*Gestern:*
• Signups: X
• Selfie-Uploads: X
• Free Gens: X
• Bezahlt: X

*Letzte 7 Tage (Summe):*
• Signups: X → Uploads: X → Gens: X → Paid: X

*All-Time:*
• Users: X | Uploaders: X | Generators: X | Payers: X
• Konversion Signup→Paid: X%
• Umsatz: X,XX €

Dashboard: https://app.profilfoto-ki.de/admin/funnel

Keine langen Sätze, nur Zahlen. Wenn 0 Paid Conversions: keine Alarm-Eskalation — einfach melden.
