#!/usr/bin/env node
// dataforseo-discovery.mjs
// ----------------------------------------------------------------------------
// Lead-Discovery für insta-dm Automotive-Pipeline.
// Nutzt DataForSEO SERP-API mit Query "site:instagram.com autohaus {stadt}"
// und parst Handle + Follower direkt aus den Treffern. Pre-Filter auf
// follower >= MIN_FOLLOWER spart 70% Profil-Visits gegenüber Instagram-Search.
//
// Voraussetzung: DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD als ENV gesetzt.
// (Werte stehen im DataForSEO-Dashboard unter API Access.)
//
// Usage:
//   node dataforseo-discovery.mjs                    # default 14 cities
//   node dataforseo-discovery.mjs köln düsseldorf    # custom cities
//   node dataforseo-discovery.mjs --json             # raw JSON output
//
// Output: TSV (handle\tname\t\tstadt) auf stdout, plus Stats auf stderr.
// Pipe direkt in clipboard und in Sheet pasten:
//   node dataforseo-discovery.mjs | clip
//   → Sheet → Ctrl+J → A{nextRow} → Enter → Ctrl+V
// ----------------------------------------------------------------------------

import { Buffer } from 'node:buffer';

const LOGIN = process.env.DATAFORSEO_LOGIN;
const PASSWORD = process.env.DATAFORSEO_PASSWORD;
const MIN_FOLLOWER = Number(process.env.MIN_FOLLOWER ?? 200);
const SHEET_ID = process.env.AUTOMOTIVE_SHEET_ID;  // set via env, see SKILL.md
const SHEET_GID = process.env.AUTOMOTIVE_SHEET_GID;
if (!SHEET_ID || !SHEET_GID) {
  console.error('Set AUTOMOTIVE_SHEET_ID and AUTOMOTIVE_SHEET_GID env vars before running');
  process.exit(1);
}

const DEFAULT_CITIES = [
  'berlin', 'köln', 'münchen', 'hamburg', 'stuttgart',
  'düsseldorf', 'bremen', 'essen', 'dortmund', 'hannover',
  'nürnberg', 'leipzig', 'dresden', 'frankfurt'
];

if (!LOGIN || !PASSWORD) {
  console.error('FEHLER: DATAFORSEO_LOGIN und DATAFORSEO_PASSWORD müssen gesetzt sein.');
  console.error('Setze sie z.B. via: $env:DATAFORSEO_LOGIN="..."; $env:DATAFORSEO_PASSWORD="..."');
  process.exit(1);
}

const args = process.argv.slice(2);
const wantJson = args.includes('--json');
const cities = args.filter(a => !a.startsWith('--'));
const targets = cities.length ? cities : DEFAULT_CITIES;

// ----------------------------------------------------------------------------
// Existierende Handles aus dem Sheet laden, damit wir nicht doppelt einfügen.
// ----------------------------------------------------------------------------
async function loadExistingHandles() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}&cb=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Sheet-Load fehlgeschlagen: ${res.status}`);
    return new Set();
  }
  const csv = await res.text();
  const handles = new Set();
  for (const line of csv.split('\n')) {
    // Spalte A enthält den Handle. Erste Zelle des CSV-Rows.
    const cell = line.split(',')[0]?.replace(/^"|"$/g, '').trim().toLowerCase();
    if (cell && /^[a-z0-9_.]+$/.test(cell) && cell.length >= 3) {
      handles.add(cell);
    }
    // Auch in Tab-getrennten Mergeartefakten suchen
    for (const part of line.split('\t')) {
      const cleaned = part.replace(/^"|"$/g, '').trim().toLowerCase();
      if (cleaned && /^[a-z0-9_.]+$/.test(cleaned) && cleaned.length >= 4 && cleaned.length < 40) {
        handles.add(cleaned);
      }
    }
  }
  return handles;
}

// ----------------------------------------------------------------------------
// DataForSEO SERP-Call.
// ----------------------------------------------------------------------------
async function serpCall(keyword) {
  const auth = Buffer.from(`${LOGIN}:${PASSWORD}`).toString('base64');
  const body = [{
    keyword,
    language_code: 'de',
    location_name: 'Germany',
    depth: 50
  }];
  const res = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`SERP API ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json?.tasks?.[0]?.result?.[0]?.items ?? [];
}

// ----------------------------------------------------------------------------
// Follower-Zahl aus breadcrumb parsen.
// "Ca. 38.740 Follower" / "Ca. 7000 Follower" / "Ca. 120 Follower"
// ----------------------------------------------------------------------------
function parseFollowers(breadcrumb) {
  if (!breadcrumb) return null;
  // Leerzeichen, Punkte und Kommas als Tausendertrenner entfernen
  const m = breadcrumb.match(/Ca\.?\s*([\d.,]+)\s*(Follower|Tsd|K|M)/i);
  if (!m) return null;
  let num = m[1].replace(/[.,]/g, '');
  let value = parseInt(num, 10);
  if (Number.isNaN(value)) return null;
  // Tsd / K / M Multiplikator
  const unit = m[2]?.toLowerCase();
  if (unit === 'tsd' || unit === 'k') value *= 1000;
  else if (unit === 'm') value *= 1000000;
  return value;
}

// ----------------------------------------------------------------------------
// Handle aus URL extrahieren (instagram.com/{handle}/).
// ----------------------------------------------------------------------------
function parseHandle(url) {
  const m = url?.match(/instagram\.com\/([a-zA-Z0-9_.]+)\/?/);
  if (!m) return null;
  const handle = m[1].toLowerCase();
  // Reservierte Pfade ausschließen
  if (['explore', 'reels', 'direct', 'accounts', 'p', 'stories', 'popular'].includes(handle)) {
    return null;
  }
  return handle;
}

// ----------------------------------------------------------------------------
// Display-Name aus title parsen.
// Beispiele:
//   "Business Name (@business_handle)"
//   "EXAMPLE-DOMAIN.COM (@example_handle) · City"
//   "Brand (@brand_handle) • Instagram photos and videos"
// ----------------------------------------------------------------------------
function parseName(title) {
  if (!title) return null;
  const m = title.match(/^(.+?)\s*\(@/);
  if (m) return m[1].trim();
  // Fallback: alles bis zum ersten Trennzeichen
  return title.split(/[·•|]/)[0].trim();
}

// ----------------------------------------------------------------------------
// Stadt-Anzeigename normalisieren (köln → Köln).
// ----------------------------------------------------------------------------
function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ----------------------------------------------------------------------------
// Main.
// ----------------------------------------------------------------------------
async function main() {
  console.error(`[discover] Loading existing handles from sheet…`);
  const existing = await loadExistingHandles();
  console.error(`[discover] ${existing.size} existing handles will be skipped.`);

  const all = [];
  const seen = new Set();
  let totalRaw = 0;
  let qualifiedCount = 0;
  let dupeCount = 0;
  let lowFollowerCount = 0;

  for (const city of targets) {
    const keyword = `site:instagram.com autohaus ${city}`;
    console.error(`[discover] Querying: ${keyword}`);
    let items;
    try {
      items = await serpCall(keyword);
    } catch (e) {
      console.error(`[discover] FAIL "${keyword}": ${e.message}`);
      continue;
    }
    totalRaw += items.length;

    for (const item of items) {
      if (item.type !== 'organic') continue;
      const handle = parseHandle(item.url);
      if (!handle) continue;
      if (seen.has(handle)) { dupeCount++; continue; }
      if (existing.has(handle)) { dupeCount++; continue; }
      const followers = parseFollowers(item.breadcrumb);
      if (followers !== null && followers < MIN_FOLLOWER) {
        lowFollowerCount++;
        continue;
      }
      seen.add(handle);
      qualifiedCount++;
      all.push({
        handle,
        name: parseName(item.title) || handle,
        followers: followers ?? null,
        city: titleCase(city),
        description: item.description ?? '',
        rank: item.rank_absolute
      });
    }
    // Rate-Limit-Schonkost
    await new Promise(r => setTimeout(r, 800));
  }

  console.error(`[discover] DONE. Raw: ${totalRaw} | Qualified: ${qualifiedCount} | Skipped (dupe): ${dupeCount} | Skipped (low-follower): ${lowFollowerCount}`);

  if (wantJson) {
    process.stdout.write(JSON.stringify(all, null, 2) + '\n');
    return;
  }

  // TSV: handle\tname\t\tstadt  (Spalte C Follower bewusst leer — wird beim DM-Send verifiziert)
  for (const lead of all) {
    process.stdout.write(`${lead.handle}\t${lead.name}\t\t${lead.city}\n`);
  }
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
