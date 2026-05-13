---
name: phase-1-infra
description: Business Launch Phase 1 — Infrastruktur. Zoho Mail, Supabase Projekt + Schema, GitHub Repo, Lead-Schema-Wizard. Wird von business-launch Master-Skill geladen.
allowed-tools: [Read, Write, Edit, Bash, mcp__Claude_in_Chrome__navigate, mcp__Claude_in_Chrome__read_page, mcp__Claude_in_Chrome__find, mcp__Claude_in_Chrome__form_input, mcp__Claude_in_Chrome__computer, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__create_project, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__execute_sql, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__apply_migration, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__list_projects]
---

# Phase 1 — Infrastruktur

## Voraussetzungen
- Pre-Flight-Questions (Q1–Q5) im Master-Skill beantwortet
- Domain registriert (IONOS oder anderer Registrar)
- Handoff-Datei vorhanden mit: `domain`, `projektName`, `repo`

---

## Schritt 1: Zoho Mail einrichten (Browser)

**Ziel:** info@{domain} + hallo@{domain} anlegen, MX-Records bei IONOS setzen.

```
1. https://www.zoho.com/mail/ öffnen → "Sign Up for Free"
2. Domain eingeben: {domain}
3. Zoho gibt MX-Records aus → notieren
4. IONOS DNS öffnen: https://my.ionos.de → Domains → {domain} → DNS
5. Bestehende MX-Records löschen, Zoho MX-Records eintragen
6. Bei Zoho: Domain verifizieren (TXT-Record oder HTML-Datei)
7. Postfächer anlegen: info@{domain}, hallo@{domain}
```

---

## Schritt 2: Supabase Projekt anlegen ODER bestehendes nutzen

**Decision:** Eigenes Projekt vs. Shared Project mit eigenem Schema?
- **Eigenes Projekt:** Wenn Volumen erwartet, eigene API-Keys, eigene Limits
- **Shared Projekt mit Schema:** Wenn Side-Project oder Co-Existence (z.B. NanoBanana-Projekt mit `autohaus_video` schema)

**Für Shared-Pattern (autohaus_video Beispiel):**
```sql
CREATE SCHEMA IF NOT EXISTS my_project;
```

**Für eigenes Projekt:**
```
mcp__534623b9...__create_project
  name: "{projektName}"
  region: "eu-central-1"
  organization_id: "..."
```

---

## Schritt 3: Lead-Schema-Wizard

**Pre-Flight Q3 (Lead-Flow) → bestimmt Schema-Komplexität:**

### Wenn Q3 = A (DB only) — Klassischer Lead
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source TEXT,            -- welche Landing Page
  status TEXT DEFAULT 'new'
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- Service Role Key für Backend-Inserts
```

### Wenn Q3 = B/C (Form + Storage / Edge-Processing)
**→ Phase 2.5 ausführen.** Phase 1 erstellt minimales Skelett, Phase 2.5 baut die volle Pipeline. Pflicht-Felder hier:
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,    -- für Public-Result-Page
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  source TEXT,
  source_platform TEXT,         -- z.B. 'mobile.de', 'autoscout24'
  listing_url TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  photo_count INT DEFAULT 0,
  video_url TEXT,
  video_uploaded_at TIMESTAMPTZ,
  status TEXT DEFAULT 'new',
  ip_address INET,
  user_agent TEXT
);
```

### Wenn Q3 = D (Workflow) — Lead + Outreach-Tracking
Gleich wie B/C plus:
```sql
CREATE TABLE outreach_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  channel TEXT,                 -- 'email', 'whatsapp', 'tiktok-dm'
  direction TEXT,               -- 'inbound' | 'outbound'
  message_type TEXT,
  content TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Standard-Helpers (immer erstellen)

```sql
-- Slug Generator (8-char base36, kollisionsfrei)
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TEXT AS $$
DECLARE
  candidate TEXT;
  exists_count INT;
BEGIN
  LOOP
    candidate := substr(md5(random()::text || clock_timestamp()::text), 1, 8);
    SELECT COUNT(*) INTO exists_count FROM leads WHERE slug = candidate;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_update_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Schritt 4: ⚠️ Migrations als Files in Repo speichern (Pflicht)

**Pitfall P-12:** Migrations dürfen NICHT nur über MCP `apply_migration` laufen — sie müssen als File im Project-Repo committed werden.

```
project-root/
  db/
    migrations/
      20260427_120000_create_leads.sql
      20260427_120100_rpc_bridge.sql
      20260427_120200_storage_bucket.sql
```

**Workflow:**
1. SQL als File anlegen mit Timestamp-Prefix (sortierbar)
2. File via `mcp__supabase__apply_migration` deployen
3. File ins Repo committen mit Code-Änderungen die die Migration brauchen

So bleibt die Datenbank-History reproduzierbar.

---

## Schritt 5: GitHub Repo erstellen

```bash
# Repo anlegen
gh repo create {projektName} --private --description "{domain} — {Stack-Beschreibung}"

# Lokal initialisieren
mkdir -p ~/Projects/{projektName}
cd ~/Projects/{projektName}
git init
git remote add origin https://github.com/TRW123123/{projektName}.git

# Standard-Folders anlegen
mkdir -p db/migrations supabase/functions
echo "# {projektName}" > README.md
git add . && git commit -m "Initial commit"
git push -u origin main
```

---

## Schritt 6: Förderung-Vorbereitung (wenn Q2 ≠ Keine)

Wenn Pre-Flight Q2 = Google AI Startup / EU / etc:

**Tech-Stack-Wahl auf Förderung-Kriterien ausrichten:**
- **Google AI Startup:** Vertex AI Frankfurt (europe-west3), Gemini-Modelle, Nano Banana, Veo
- **EU AI Act / Innovation Fund:** EU-only Subprocessors (Supabase EU-Region, Netlify EU-Edge, n8n EU-Hosting)
- **KfW / Bafa Innovation:** Made-in-Germany-Story, Co-Development-Partner aus DE

In Handoff-File dokumentieren:
```yaml
foerderung:
  target: "Google AI Startup Programm"
  tech_stack_committed:
    - "Google Vertex AI (europe-west3)"
    - "Google Gemini 2.5 Pro für Reasoning"
    - "Google Nano Banana für Bildgenerierung"
    - "Supabase EU (Frankfurt)"
    - "Netlify EU-Edge"
  tech_stack_verified_with_user: true   # ← KRITISCH (Pitfall P-14)
  application_due: "2026-Q3"
```

**Hard Rule:** Tech-Stack-Behauptungen die später auf Public-Pages erscheinen (Über-uns) müssen mit User explizit verifiziert sein. NICHT raten basierend auf Context.

---

## Schritt 7: Handoff-Datei updaten

`~/Claude/sessions\business-launch-{projektName}-handoff.md`:

```markdown
# Business Launch Handoff: {projektName}

## Pre-Flight Answers
- Q1 Stack: {A | B | C}
- Q2 Förderung: {Google AI Startup | EU | None}
- Q3 Lead-Flow: {A | B | C | D}
- Q4 Browser-MCP: {available | blocked}
- Q5 Humanizer-Auto: yes

## Project
- Domain: {domain}
- Repo: ~/Projects/{projektName}
- GitHub: github.com/TRW123123/{projektName}
- Supabase: {project-id} (own | shared with {schema})
- Zoho: info@{domain} ✅

## DB Schema
- Tables: leads {+ outreach_log wenn Q3=D}
- Slug-Generator: ✅
- Migrations in Repo: ✅

## Phase Status
Phase 1: ✅ done — {date}
Phase 2A/2B: ⏳ pending
Phase 2.5: ⏳ pending (wenn Q3 ≠ A)
Phase 3–6: ⏳ pending

## Förderung (wenn Q2 ≠ None)
- Target: ...
- Tech-Stack verified: yes/no
- Application due: ...

## Common Pitfalls Awareness
- [P-01] Cachebust+Font: bekannt, in Phase 2A vermieden
- [P-02] Schema not exposed: RPC-Bridge geplant für Phase 2.5
- [P-12] Migrations in Repo: aktiv
```

---

## Phase 1 Abschluss-Checkliste

```
✅ Zoho Mail: info@{domain} + hallo@{domain} aktiv
✅ MX-Records bei IONOS gesetzt
✅ Supabase Projekt-ID dokumentiert (oder shared schema name)
✅ Lead-Schema basierend auf Q3 angelegt
✅ Slug-Generator + Update-Trigger erstellt
✅ Migrations als Files in db/migrations/ committed
✅ GitHub Repo angelegt + initialisiert
✅ Folders: db/migrations, supabase/functions
✅ Förderung-Tech-Stack mit User verifiziert (wenn Q2 ≠ None)
✅ Handoff-Datei vollständig
```

**→ User-Bestätigung bevor Phase 2A/2B startet.**
