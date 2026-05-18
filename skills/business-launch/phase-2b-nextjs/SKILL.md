---
name: phase-2b-nextjs
description: Business Launch Phase 2B — Next.js Web-App mit Auth, Dashboard, Server Actions. Für Apps mit Login/User-Accounts. Referenz: profilfoto-ki-app-v2.
allowed-tools: [Read, Write, Edit, Bash, Skill, mcp__Claude_in_Chrome__navigate, mcp__Claude_in_Chrome__read_page, mcp__dataforseo__on_page_lighthouse]
---

# Phase 2B — Next.js Web-App

## Voraussetzungen
- Phase 1 abgeschlossen
- Pre-Flight Q1 = B (Full Web-App) oder C (Split — App-Teil)
- Lead-Schema in Phase 1 definiert

## Stack
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, TypeScript
- **Backend:** Supabase (DB + Auth + Storage), n8n Webhooks
- **Deploy:** Netlify mit `@netlify/plugin-nextjs`
- **Pattern:** profilfoto-ki-app-v2 als Referenz-Repo

---

## Schritt 1: Next.js Scaffold

```bash
cd ~/Projects/{projektName}

npx create-next-app@latest . \
 --typescript \
 --tailwind \
 --app \
 --no-src-dir \
 --import-alias "@/*"

npm install @supabase/supabase-js @supabase/ssr lucide-react
npm install --save-dev @types/node @netlify/plugin-nextjs
```

---

## Schritt 2: Supabase Client

`lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
 createBrowserClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 )
```

`lib/supabase/server.ts` (für Server Components):
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
 const cookieStore = await cookies()
 return createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
 )
}
```

`.env.local` (niemals committen):
```
NEXT_PUBLIC_SUPABASE_URL=https://{supabase-id}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY={anon-key}
SUPABASE_SERVICE_ROLE_KEY={service-role-key} # nur Server-side!
N8N_WEBHOOK_URL={url}
N8N_WEBHOOK_SECRET={secret}
```

---

## Schritt 3: Auth-Pages (wenn User-Accounts)

```
app/
 auth/
 page.tsx ← Sign-in / Sign-up / Forgot Password
 callback/page.tsx ← OAuth-Callback
 reset-password/page.tsx
 api/
 auth/
 callback/route.ts
```

**Pattern (basierend auf profilfoto-ki-app-v2):**
- Drei-Modi-Layout: Sign-in / Sign-up / Forgot Password (toggle in einer Component)
- Email + Passwort mit Double Opt-In (DOI) — DSGVO-konform
- Optional Google OAuth (aber DOI als Primär-Pfad in DACH-Markt — Google-Konto-Verlust-Risiko)
- Consent-Checkbox bei Registrierung (Datenschutz + AGB)
- ResetPassword Flow

---

## Schritt 4: Lead-Capture Route (wenn Form auf Landing-Page)

`app/api/leads/route.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
 const body = await req.json()

 const { data, error } = await supabase
 .from('leads')
 .insert({
 name: body.name,
 email: body.email,
 phone: body.phone,
 message: body.message,
 source: body.source || 'homepage'
 })
 .select()
 .single()

 if (error) return Response.json({ error: error.message }, { status: 500 })

 // n8n Webhook async, fail-silent
 fetch(process.env.N8N_WEBHOOK_URL!, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ lead: data })
 }).catch(() => {})

 return Response.json({ success: true, id: data.id })
}
```

**Wenn Lead-Flow komplex (Q3 = B/C/D): Phase 2.5 ausführen für Edge-Function-basierten Flow.**

---

## Schritt 5: `netlify.toml` mit Next.js Plugin

```toml
[build]
 command = "npm run build"
 publish = ".next"

[[plugins]]
 package = "@netlify/plugin-nextjs"

[build.environment]
 NODE_VERSION = "20"

[[headers]]
 for = "/*"
 [headers.values]
 X-Frame-Options = "DENY"
 X-Content-Type-Options = "nosniff"
 Strict-Transport-Security = "max-age=31536000; includeSubDomains"

[[headers]]
 for = "/_next/static/*"
 [headers.values]
 Cache-Control = "public, max-age=31536000, immutable"
```

---

## Schritt 6: Pre-Deploy-Checks

```bash
npm run build # Exit 0?
npx tsc --noEmit # 0 TS-Errors?
npm run lint # Clean?
```

⚠️ **`tsc` Permission denied bei Netlify-Build:** `typescript` als devDependency wird mit `--production` skipped. Fix in `netlify.toml`:
```toml
[build.environment]
 NPM_FLAGS = "--production=false"
```

---

## Schritt 7: Netlify Deploy + Custom Domain

Wie in Phase 2A — zwei Möglichkeiten:
- **Git-Auto-Deploy:** Netlify Dashboard → Site Settings → Continuous deployment → Link to Git
- **CLI-Deploy:** `netlify deploy --prod`

**Verify:** P-03 (Netlify auto-deploy mode dokumentieren)

---

## Phase 2B Abschluss-Checkliste

```
✅ Next.js App läuft lokal (npm run dev)
✅ Supabase Auth funktioniert (Sign-up + Sign-in + Reset)
✅ Consent-Checkboxen + DOI implementiert (DSGVO)
✅ /api/leads Route → Lead landet in DB
✅ n8n Webhook empfängt + sendet E-Mail
✅ Netlify: Auto-deploy aktiv ODER CLI-Mode dokumentiert
✅ Custom Domain → HTTPS aktiv
✅ Security Headers in netlify.toml
✅ Pre-Deploy: build + tsc + lint alle grün
✅ Lighthouse: ≥95 Performance/Accessibility/Best/SEO
```

**→ User-Bestätigung + Live-URL bestätigen bevor Phase 2.5 / 3 startet.**
