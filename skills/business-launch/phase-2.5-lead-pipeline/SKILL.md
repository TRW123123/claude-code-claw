---
name: phase-2.5-lead-pipeline
description: Business Launch Phase 2.5 — Lead-Capture-Pipeline. Form → Edge Function → Storage → DB → Result-Page. Mit File-Upload + Image-Konvertierung. Distilliert aus autohaus-video.de Production-Build.
allowed-tools: [Read, Write, Edit, Bash, Skill, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__apply_migration, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__execute_sql, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__deploy_edge_function, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__list_edge_functions, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__get_publishable_keys, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__get_project_url]
---

# Phase 2.5 — Lead-Capture-Pipeline

## Wann nutzen
- Pre-Flight Q3 = B (Form+Storage), C (Edge-Processing) oder D (Workflow)
- Use-Cases: Foto-Upload-Form, Voice-Memo-Form, Custom-Order-Form mit Anhängen
- Result: Kunde bekommt Slug-URL (`/v/{slug}`), kann Status verfolgen, am Ende Ergebnis abrufen

## Architektur (Distillation aus autohaus-video)

```
Browser Form
    ↓ multipart/form-data POST (mit Files)
Edge Function: {prefix}-submit
    ├─ Validate (E-Mail/Phone Pflicht, Listing-URL ODER Files Pflicht)
    ├─ Generate unique slug (8-char base36)
    ├─ Insert lead via RPC bridge (autohaus_create_lead etc.)
    ├─ For each File:
    │   ├─ Decode (imagescript für JPEG/PNG/GIF/BMP/TIFF)
    │   ├─ Resize bei >2048px
    │   ├─ Re-encode JPEG (Quality 85)
    │   └─ Upload zu Storage: submissions/{slug}/photos/01.jpg
    └─ Return { slug, view_url: /v/{slug} }
        ↓
Browser → Redirect zu /v/{slug}
        ↓
Result Page (v.html, JS-Driven)
    ├─ Parse slug from URL
    ├─ Fetch Edge Function: {prefix}-get-lead?slug=...
    ├─ Render Status + Photo-Grid + Video-Player
    └─ Poll alle 30s für Updates
        ↓
Edge Function: {prefix}-get-lead
    ├─ RPC bridge (autohaus_get_lead_by_slug)
    ├─ Generate signed URLs für photos (7d TTL)
    ├─ Generate signed URL für video (wenn vorhanden)
    └─ Return JSON
```

---

## Schritt 1: DB-Schema entscheiden + Migration

**Lead-Schema-Wizard — beantworte:**
1. **Custom-Schema** (z.B. `mein_projekt`) ODER **public schema** für leads-Tabelle?
   - Custom-Schema: Cleaner, isoliert. ABER: Pitfall P-02 — REST-API exposed nur public.
   - **Empfehlung:** Custom-Schema + RPC-Bridge in public.
2. Welche Felder im Lead?
   - Standard: `id`, `slug`, `created_at`, `email`, `phone`, `status`
   - Optional: `dealer_name`, `company`, `message`
   - Domain-spezifisch: `mobile_de_url`, `car_model`, `source_platform`
   - File-Refs: `photo_urls TEXT[]`, `video_url`, `photo_count`
   - Tracking: `ip_address`, `user_agent`

**Migration anwenden** (Beispiel autohaus_video):
```sql
-- File: db/migrations/{timestamp}_create_leads.sql

CREATE SCHEMA IF NOT EXISTS my_project;

CREATE TABLE my_project.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'website',
  source_platform TEXT,
  dealer_name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  listing_url TEXT,
  car_model TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  photo_count INT DEFAULT 0,
  video_url TEXT,
  video_uploaded_at TIMESTAMPTZ,
  status TEXT DEFAULT 'new',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_leads_slug ON my_project.leads (slug);
CREATE INDEX idx_leads_status ON my_project.leads (status);
CREATE INDEX idx_leads_created_at ON my_project.leads (created_at DESC);

-- Slug Generator
CREATE OR REPLACE FUNCTION my_project.generate_slug()
RETURNS TEXT AS $$
DECLARE
  candidate TEXT;
  exists_count INT;
BEGIN
  LOOP
    candidate := substr(md5(random()::text || clock_timestamp()::text), 1, 8);
    SELECT COUNT(*) INTO exists_count FROM my_project.leads WHERE slug = candidate;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

-- Auto-update trigger
CREATE OR REPLACE FUNCTION my_project.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_update_updated_at
  BEFORE UPDATE ON my_project.leads
  FOR EACH ROW EXECUTE FUNCTION my_project.update_updated_at();
```

**Pflicht: Migration als File im Repo speichern** (Pitfall P-12):
```
project-root/
  db/
    migrations/
      20260427_120000_create_leads.sql
      20260427_120100_rpc_bridge.sql
```

---

## Schritt 2: RPC-Bridge in public schema (Pitfall P-02)

Custom-Schemas (autohaus_video, my_project, etc.) sind nicht über REST-API erreichbar. Lösung: SECURITY DEFINER Functions in public:

```sql
-- File: db/migrations/{timestamp}_rpc_bridge.sql

CREATE OR REPLACE FUNCTION public.my_create_lead(
  p_dealer_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_listing_url TEXT,
  p_message TEXT,
  p_source_platform TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT
)
RETURNS TABLE(id UUID, slug TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = my_project, public
AS $$
DECLARE
  v_slug TEXT;
  v_id UUID;
BEGIN
  v_slug := my_project.generate_slug();

  INSERT INTO my_project.leads (
    slug, source, source_platform, dealer_name, email, phone,
    listing_url, message, status, ip_address, user_agent
  ) VALUES (
    v_slug, 'website', p_source_platform, p_dealer_name, p_email, p_phone,
    p_listing_url, p_message, 'new',
    NULLIF(p_ip_address, '')::inet, p_user_agent
  )
  RETURNING leads.id INTO v_id;

  RETURN QUERY SELECT v_id, v_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.my_update_photos(
  p_lead_id UUID,
  p_photo_urls TEXT[],
  p_photo_count INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = my_project, public
AS $$
BEGIN
  UPDATE my_project.leads
  SET photo_urls = p_photo_urls, photo_count = p_photo_count
  WHERE id = p_lead_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.my_get_lead_by_slug(p_slug TEXT)
RETURNS TABLE(slug TEXT, status TEXT, dealer_name TEXT, /* ... */)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = my_project, public
AS $$
BEGIN
  RETURN QUERY
  SELECT l.slug, l.status, l.dealer_name /* ... */
  FROM my_project.leads l
  WHERE l.slug = p_slug
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.my_create_lead TO service_role;
GRANT EXECUTE ON FUNCTION public.my_update_photos TO service_role;
GRANT EXECUTE ON FUNCTION public.my_get_lead_by_slug TO anon, authenticated, service_role;
```

---

## Schritt 3: Storage Bucket

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'my-project-submissions',
  'my-project-submissions',
  false,                       -- private; serve via signed URLs
  52428800,                    -- 50MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
        'video/mp4', 'video/webm', 'video/quicktime']
);

-- Service role: full access
CREATE POLICY "service_role_all_my_project" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'my-project-submissions')
  WITH CHECK (bucket_id = 'my-project-submissions');

-- Public read (we serve via signed URLs anyway, but allow direct read for unguessable slugs)
CREATE POLICY "public_read_my_project" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'my-project-submissions');
```

**Path-Schema:** `submissions/{slug}/photos/01.jpg`, `submissions/{slug}/photos/02.jpg`, … `submissions/{slug}/video.mp4`

---

## Schritt 4: Edge Function `submit`

**Pflicht: Source als File im Repo speichern** (Pitfall P-12):
```
project-root/
  supabase/
    functions/
      my-project-submit/
        index.ts                ← single source of truth
```

Template-Code (basiert auf autohaus-submit, anpassen für Projekt):
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Image } from "https://deno.land/x/imagescript@1.2.17/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "my-project-submissions";
const MAX_PHOTOS = 12;
const MAX_DIMENSION = 2048;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

// ⚠️ imagescript supports JPEG/PNG/GIF/BMP/TIFF — NICHT WebP/AVIF (Pitfall P-07)
async function convertToJpeg(buffer: Uint8Array, mimeType: string) {
  try {
    const img = await Image.decode(buffer);
    if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height);
      img.resize(Math.round(img.width * ratio), Math.round(img.height * ratio));
    }
    const jpegBuffer = await img.encodeJPEG(85);
    return { data: new Uint8Array(jpegBuffer), mime: "image/jpeg", converted: true };
  } catch {
    // WebP/AVIF fallthrough: store as-is
    return { data: buffer, mime: mimeType, converted: false };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const form = await req.formData();
    const dealerName = String(form.get("dealer_name") || "");
    const email = String(form.get("email") || "");
    const phone = String(form.get("phone") || "");
    const listingUrl = String(form.get("listing_url") || "");
    const message = String(form.get("message") || "");
    const photoFiles = (form.getAll("photos").filter((f) => f instanceof File) as File[])
      .slice(0, MAX_PHOTOS);

    if (!email && !phone) return json({ error: "E-Mail oder Telefon nötig" }, 400);
    if (!listingUrl && photoFiles.length === 0) return json({ error: "URL oder Foto nötig" }, 400);

    // Lead erstellen via RPC
    const { data: rpcData, error: rpcErr } = await supabase.rpc("my_create_lead", {
      p_dealer_name: dealerName || null,
      p_email: email || null,
      p_phone: phone || null,
      p_listing_url: listingUrl || null,
      p_message: message || null,
      p_source_platform: detectPlatform(listingUrl),
      p_ip_address: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || null,
      p_user_agent: req.headers.get("user-agent") || null,
    });
    if (rpcErr) throw rpcErr;
    const lead = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    // Photos verarbeiten
    const photoUrls: string[] = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      const buffer = new Uint8Array(await file.arrayBuffer());
      const { data, mime } = await convertToJpeg(buffer, file.type);
      const ext = mime === "image/jpeg" ? "jpg" : (file.name.split(".").pop() || "bin").toLowerCase();
      const path = `submissions/${lead.slug}/photos/${String(i + 1).padStart(2, "0")}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, data, {
        contentType: mime, upsert: true,
      });
      if (!upErr) photoUrls.push(path);
    }

    if (photoUrls.length > 0) {
      await supabase.rpc("my_update_photos", {
        p_lead_id: lead.id, p_photo_urls: photoUrls, p_photo_count: photoUrls.length,
      });
    }

    return json({ ok: true, slug: lead.slug, photo_count: photoUrls.length, view_url: `/v/${lead.slug}` });
  } catch (err) {
    console.error(err);
    return json({ error: (err as Error).message }, 500);
  }
});

function detectPlatform(url: string): string | null {
  if (!url) return null;
  const u = url.toLowerCase();
  // Domain-spezifisch anpassen
  if (u.includes("mobile.de")) return "mobile.de";
  if (u.includes("autoscout24")) return "autoscout24";
  return "other";
}
```

**Deploy:**
```typescript
mcp__534623b9...__deploy_edge_function({
  project_id: "{supabase-id}",
  name: "my-project-submit",
  entrypoint_path: "index.ts",
  verify_jwt: false,  // Form ist Public-Endpoint
  files: [{ name: "index.ts", content: "..." }]
})
```

---

## Schritt 5: Edge Function `get-lead`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "my-project-submissions";
const SIGNED_URL_TTL = 60 * 60 * 24 * 7; // 7 days

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug || !/^[a-z0-9]{4,16}$/i.test(slug)) {
    return new Response(JSON.stringify({ error: "Invalid slug" }), { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const { data: rpcData } = await supabase.rpc("my_get_lead_by_slug", { p_slug: slug });
  const lead = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!lead) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

  // Sign photo URLs
  let photoSignedUrls: string[] = [];
  if (lead.photo_urls?.length > 0) {
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(lead.photo_urls, SIGNED_URL_TTL);
    photoSignedUrls = signed?.map((s) => s.signedUrl).filter(Boolean) as string[] || [];
  }

  // Sign video
  let videoSignedUrl: string | null = null;
  if (lead.video_url) {
    if (lead.video_url.startsWith("http")) {
      videoSignedUrl = lead.video_url;
    } else {
      const { data: vSigned } = await supabase.storage.from(BUCKET).createSignedUrl(lead.video_url, SIGNED_URL_TTL);
      videoSignedUrl = vSigned?.signedUrl || null;
    }
  }

  return new Response(JSON.stringify({
    slug: lead.slug,
    status: lead.status,
    photo_urls: photoSignedUrls,
    video_url: videoSignedUrl,
    video_ready: !!videoSignedUrl,
    /* ... weitere Felder ... */
  }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
});
```

---

## Schritt 6: Frontend Form (HTML)

Beispiel für Phase 2A (Static):
```html
<form id="lead-form" novalidate>
  <input name="dealer_name" required placeholder="Name">
  <input name="email" type="email" required>
  <input name="phone" type="tel">
  <input name="listing_url" type="url">
  <input name="photos" type="file" accept="image/*" multiple>
  <textarea name="message"></textarea>
  <button type="submit">Anfordern</button>
</form>

<script>
const form = document.getElementById('lead-form');
const SUBMIT_URL = 'https://{supabase-id}.supabase.co/functions/v1/my-project-submit';
const ANON_KEY = '...';  // public

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const res = await fetch(SUBMIT_URL, {
    method: 'POST',
    headers: { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY },
    body: data
  });
  const json = await res.json();
  if (res.ok && json.slug) {
    window.location.href = '/v/' + json.slug;
  } else {
    alert(json.error);
  }
});
</script>
```

---

## Schritt 7: Result-Page `/v/[slug]` (v.html)

Single statisches HTML mit JS-Slug-Lookup. Netlify-Rewrite:
```toml
[[redirects]]
  from = "/v/*"
  to = "/v.html"
  status = 200
```

JS in v.html parsed slug aus `window.location.pathname.match(/\/v\/([a-z0-9]+)/)`, ruft `get-lead` Edge Function, rendert UI mit Photo-Grid + Video-Player + 30s-Polling.

Komplett-Template siehe `autohaus-video-static/src/v.html` als Referenz.

---

## Schritt 8: CSP in netlify.toml erweitern

```toml
Content-Security-Policy = "
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  media-src 'self' https:;
  font-src 'self';
  connect-src 'self' https://{supabase-id}.supabase.co https://{supabase-id}.storage.supabase.co;
  frame-ancestors 'self';
  form-action 'self';
"
```

---

## Schritt 9: E-Mail-Notification auf neuen Lead

Database Webhook in Supabase Dashboard → Database → Webhooks:
- Trigger: INSERT auf `my_project.leads`
- HTTP Endpoint: Resend / Brevo / n8n-Webhook
- Body: Lead-Daten + Slug + View-URL

ODER Supabase Database Trigger + pg_net-Extension für direkten HTTP-Call.

---

## Schritt 10: Test-Daten

Nach Deploy: 2-3 Sample-Leads via cURL submitten zum Smoke-Test:

```bash
# Test 1: URL only
curl -X POST {supabase-url}/functions/v1/my-project-submit \
  -H "apikey: $ANON_KEY" \
  -F "dealer_name=Test" -F "email=test@example.com" \
  -F "listing_url=https://example.com/listing"

# Test 2: Mit File-Upload
curl -X POST {supabase-url}/functions/v1/my-project-submit \
  -H "apikey: $ANON_KEY" \
  -F "dealer_name=Test" -F "email=test@example.com" \
  -F "photos=@/path/to/test.jpg" -F "photos=@/path/to/test2.png"

# Test 3: Get
curl {supabase-url}/functions/v1/my-project-get-lead?slug=$SLUG \
  -H "apikey: $ANON_KEY"
```

---

## Phase 2.5 Abschluss-Checkliste

```
✅ DB-Schema definiert + Migration committed (db/migrations/)
✅ RPC-Bridge in public schema (Pitfall P-02)
✅ Storage Bucket angelegt mit Policies
✅ Edge Function "submit" deployed + Source in Repo (Pitfall P-12)
✅ Edge Function "get-lead" deployed + Source in Repo
✅ Frontend Form integriert + multipart/form-data POST
✅ Result-Page /v/[slug] mit Polling
✅ Netlify Rewrite /v/* → /v.html
✅ CSP erweitert um Supabase-Domain
✅ E-Mail-Notification auf neuen Lead konfiguriert
✅ Smoke-Test: 2-3 Sample-Leads via cURL erstellt + abgerufen
✅ Image-Konvertierung getestet (JPEG-Output verified)
✅ Pitfall P-07 dokumentiert: WebP/AVIF Fallback (as-is) bekannt
```

**→ User-Bestätigung + 1 echtes End-to-End-Test (Form ausfüllen → Slug-URL öffnen → erscheint korrekt) bevor weitere Phase.**
