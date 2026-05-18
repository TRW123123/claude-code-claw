#!/usr/bin/env node
/**
 * apify-pre-check.mjs — Phase 2A Pre-Check für insta-dm-automotive-daily
 *
 * Pro Lead: Apify Instagram Scraper → Bio + 3 jüngste Posts.
 * Routing-Logic wählt V9.5-Variante + extrahiert Slot-Daten.
 *
 * USAGE:
 * node apify-pre-check.mjs handle1 handle2 handle3 ...
 * node apify-pre-check.mjs --file leads.json # erwartet [{handle, name, stadt}]
 *
 * OUTPUT (stdout, JSON):
 * {
 * "results": [
 * {
 * "handle": "autohaus_xyz",
 * "variant": "V9.5-MODELL", // V9.5-MODELL | V9.5-REEL-PERFORMANCE | V9.5-SPEZIALIST | V9.5-HERITAGE | V9.4/A-fallback
 * "slots": { "LETZTES_MODELL": "BMW M3", "DATUM": "vom 7. Mai", ... },
 * "apify_error": null
 * },
 * ...
 * ],
 * "summary": { "total": 30, "V9.5-MODELL": 12, "V9.5-REEL-PERFORMANCE": 3, ... }
 * }
 *
 * STDERR: Progress + Fehler.
 *
 * Kosten: ~$0,0025 pro Profil. 30 Leads = ~$0,08.
 */

import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- APIFY TOKEN ----------------------------------------------------------
// Erst env, dann .mcp.json. Niemals Token ins git committen.
function loadApifyToken() {
 if (process.env.APIFY_TOKEN) return process.env.APIFY_TOKEN;
 try {
 const mcp = JSON.parse(fs.readFileSync('~/.claude/.mcp.json', 'utf8'));
 const tok = mcp.mcpServers?.apify?.env?.APIFY_TOKEN;
 if (tok) return tok;
 } catch (e) {
 process.stderr.write(`[WARN] .mcp.json read failed: ${e.message}\n`);
 }
 throw new Error('APIFY_TOKEN nicht gefunden — env oder .mcp.json setzen');
}

const APIFY_TOKEN = loadApifyToken();
const CONCURRENCY = 3;

// --- HTTP HELPER ----------------------------------------------------------
function httpRequest(opts, body = null) {
 return new Promise((resolve, reject) => {
 const req = https.request(opts, res => {
 const chunks = [];
 res.on('data', c => chunks.push(c));
 res.on('end', () => {
 const buf = Buffer.concat(chunks).toString('utf8');
 try { resolve({ status: res.statusCode, body: JSON.parse(buf) }); }
 catch { resolve({ status: res.statusCode, body: buf }); }
 });
 });
 req.on('error', reject);
 if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
 req.end();
 });
}

async function apifyScrape(handle) {
 const opts = {
 method: 'POST',
 hostname: 'api.apify.com',
 path: `/v2/acts/[apify-actor-id]/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=120&format=json`,
 headers: { 'Content-Type': 'application/json' },
 };
 const body = {
 directUrls: [`https://instagram.com/${handle}/`],
 resultsType: 'details',
 resultsLimit: 5,
 addParentData: false,
 };
 const res = await httpRequest(opts, body);
 if (res.status >= 400) return { error: `apify_http_${res.status}` };
 if (!Array.isArray(res.body) || res.body.length === 0) return { error: 'apify_empty' };
 const p = res.body[0];
 if (p.error) return { error: `apify_profile_${p.error}` };
 return {
 username: p.username || handle,
 fullName: p.fullName || '',
 biography: p.biography || '',
 externalUrl: p.externalUrl || '',
 followersCount: p.followersCount || 0,
 postsCount: p.postsCount || 0,
 isPrivate: !!p.isPrivate,
 isBusinessAccount: !!p.isBusinessAccount,
 businessCategoryName: p.businessCategoryName || '',
 latestPosts3: (p.latestPosts || []).slice(0, 3).map(x => ({
 type: x.type, // 'Image' | 'Sidecar' | 'Video' | 'Reel'
 timestamp: x.timestamp, // ISO
 caption: (x.caption || '').slice(0, 500),
 likesCount: x.likesCount || 0,
 commentsCount: x.commentsCount || 0,
 videoViewCount: x.videoViewCount || 0,
 })),
 };
}

// --- SLOT EXTRACTORS ------------------------------------------------------
// Marken-Whitelist (DACH-Markt). Bewusst groß damit auch seltene Marken matchen.
const MARKEN = [
 'BMW', 'Audi', 'Mercedes-Benz', 'Mercedes', 'Porsche', 'Volkswagen', 'VW',
 'Škoda', 'Skoda', 'SEAT', 'Seat', 'Opel', 'Ford', 'Volvo', 'Mazda',
 'Toyota', 'Lexus', 'Nissan', 'Hyundai', 'Kia', 'Renault', 'Peugeot',
 'Citroën', 'Citroen', 'DS Automobiles', 'Fiat', 'Alfa Romeo', 'Lancia',
 'Maserati', 'Ferrari', 'Lamborghini', 'Bentley', 'Rolls-Royce',
 'Land Rover', 'Range Rover', 'Jaguar', 'Mini', 'MINI', 'Smart',
 'Tesla', 'Cupra', 'Polestar', 'Honda', 'Mitsubishi', 'Subaru', 'Dacia',
 'Aston Martin', 'McLaren', 'Bugatti', 'Lotus', 'Genesis', 'BYD', 'NIO',
];

const MARKEN_REGEX = new RegExp(
 '\\b(' + MARKEN.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
 'i'
);

function extractModell(caption) {
 if (!caption) return null;
 const cleanCaption = caption.replace(/\s+/g, ' ');
 const match = cleanCaption.match(MARKEN_REGEX);
 if (!match) return null;
 const marke = match[1];
 const idx = match.index + match[0].length;
 // Nächste 1-3 Tokens nach der Marke als Modell-Kandidat
 const rest = cleanCaption.slice(idx).trim();
 const tokens = rest.split(/[\s,\.!?#@]/).filter(Boolean);
 if (tokens.length === 0) return marke;
 // Erstes Token muss alphanumerisch sein (z.B. "M3", "911", "A4")
 const t1 = tokens[0];
 if (!/^[A-Za-z0-9-]+$/.test(t1)) return marke;
 // Optional zweites Token (z.B. "Competition", "Carrera", "RS6", "Avant")
 let modell = `${marke} ${t1}`;
 const t2 = tokens[1];
 if (t2 && /^[A-Za-z0-9-]+$/.test(t2) && t2.length <= 15 && t2[0].match(/[A-Z]/)) {
 modell += ` ${t2}`;
 }
 return modell;
}

function formatPostDatum(timestamp) {
 if (!timestamp) return null;
 const post = new Date(timestamp);
 const now = new Date();
 const diffMs = now - post;
 const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
 if (diffDays < 0) return null;
 if (diffDays === 0) return 'von heute';
 if (diffDays === 1) return 'von gestern';
 if (diffDays < 7) return `vor ${diffDays} Tagen`;
 // Absolutes Datum
 const monate = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
 return `vom ${post.getDate()}. ${monate[post.getMonth()]}`;
}

const SPEZIALISIERUNG_PATTERNS = [
 // Marke + Rolle
 { rx: /\b(BMW|Audi|Mercedes(?:-Benz)?|Porsche|VW|Volkswagen|Škoda|Skoda|SEAT|Opel|Ford|Volvo|Mazda|Toyota|Hyundai|Kia|Tesla)[\s-]+(Vertragshändler|Partner|Specialist|Center|Zentrum|Service|Händler)/i,
 fmt: m => `${m[1]}-${m[2]}` },
 // Premium/Sportwagen-Nischen
 { rx: /\b(Sportwagen|Premium|Oldtimer|Klassiker|Youngtimer|Luxus)[-\s]?(Händler|Specialist|Galerie|Garage)?/i,
 fmt: m => m[2] ? `${m[1]}-${m[2]}` : `${m[1]}-Händler` },
 // Geschäftsmodell
 { rx: /\b(Gebrauchtwagen|Neuwagen|EU[-\s]?Fahrzeuge|Jahreswagen|Tageszulassungen)[-\s]?(Händler|Spezialist|Centrum)?/i,
 fmt: m => m[2] ? `${m[1]}-${m[2]}` : `${m[1]}-Händler` },
];

function extractSpezialisierung(biography) {
 if (!biography) return null;
 for (const { rx, fmt } of SPEZIALISIERUNG_PATTERNS) {
 const m = biography.match(rx);
 if (m) return fmt(m);
 }
 return null;
}

function extractHeritage(biography) {
 if (!biography) return null;
 // "Seit YYYY"
 const seit = biography.match(/\b[Ss]eit\s+(\d{4})\b/);
 if (seit) {
 const jahre = new Date().getFullYear() - parseInt(seit[1], 10);
 if (jahre >= 10) return `Seit ${seit[1]} (${jahre} Jahre)`;
 }
 // "Familienunternehmen / Inhabergeführt / X. Generation"
 if (/\b(Familienunternehmen|Familienbetrieb|inhabergeführt)\b/i.test(biography)) {
 const gen = biography.match(/(\d+)\.\s*Generation/i);
 if (gen) return `Familienunternehmen in ${gen[1]}. Generation`;
 return 'Familienunternehmen';
 }
 return null;
}

// --- ROUTING --------------------------------------------------------------
function chooseVariant(apify) {
 if (apify.error) {
 return {
 variant: 'V9.4/A-fallback-no-apify',
 slots: {},
 reason: apify.error,
 };
 }
 if (apify.isPrivate) {
 return {
 variant: 'SKIP-private',
 slots: {},
 reason: 'profile_private',
 };
 }

 const post0 = apify.latestPosts3[0];

 // 1. REEL-PERFORMANCE: jüngster Post ist Video/Reel mit >=50 Views
 if (post0 && (post0.type === 'Video' || post0.type === 'Reel') && post0.videoViewCount >= 50) {
 const modell = extractModell(post0.caption);
 const datum = formatPostDatum(post0.timestamp);
 if (modell && datum) {
 return {
 variant: 'V9.5-REEL-PERFORMANCE',
 slots: { LETZTES_MODELL: modell, DATUM: datum, VIEWS: post0.videoViewCount },
 reason: `reel_${post0.videoViewCount}_views_${modell}`,
 };
 }
 }

 // 2. MODELL: jüngster Post mit klarem Marken+Modell-Token
 if (post0) {
 const modell = extractModell(post0.caption);
 const datum = formatPostDatum(post0.timestamp);
 if (modell && datum) {
 return {
 variant: 'V9.5-MODELL',
 slots: { LETZTES_MODELL: modell, DATUM: datum },
 reason: `post_match_${modell}`,
 };
 }
 }

 // 3. SPEZIALIST: Bio nennt klare Marke/Nische
 const spez = extractSpezialisierung(apify.biography);
 if (spez) {
 // Stadt kommt aus Sheet-Kontext, nicht aus Apify → wird vom Caller injiziert
 return {
 variant: 'V9.5-SPEZIALIST',
 slots: { SPEZIALISIERUNG: spez },
 reason: `bio_match_${spez}`,
 };
 }

 // 4. HERITAGE: Bio zeigt Tradition
 const heritage = extractHeritage(apify.biography);
 if (heritage) {
 return {
 variant: 'V9.5-HERITAGE',
 slots: { TRADITIONS_HINWEIS: heritage },
 reason: `bio_heritage_${heritage}`,
 };
 }

 // 5. Fallback: V9.4/A
 return {
 variant: 'V9.4/A-fallback',
 slots: {},
 reason: 'no_signal_matched',
 };
}

// --- LEAD PROCESSING ------------------------------------------------------
async function processLead(lead) {
 const handle = typeof lead === 'string' ? lead : lead.handle;
 process.stderr.write(`[${handle}] starting...\n`);
 const t0 = Date.now();
 const apify = await apifyScrape(handle);
 const ms = Date.now() - t0;
 const decision = chooseVariant(apify);

 // Stadt aus Lead-Context (für SPEZIALIST-Variante)
 if (decision.variant === 'V9.5-SPEZIALIST' && typeof lead === 'object' && lead.stadt) {
 decision.slots.STADT = lead.stadt;
 }

 process.stderr.write(`[${handle}] ${ms}ms → ${decision.variant} (${decision.reason})\n`);

 return {
 handle,
 variant: decision.variant,
 slots: decision.slots,
 apify_error: apify.error || null,
 apify_meta: apify.error ? null : {
 followers: apify.followersCount,
 posts: apify.postsCount,
 isBusiness: apify.isBusinessAccount,
 bizCategory: apify.businessCategoryName,
 bio_excerpt: (apify.biography || '').slice(0, 120),
 post0_excerpt: apify.latestPosts3[0]?.caption?.slice(0, 120) || null,
 },
 reason: decision.reason,
 ms,
 };
}

// --- CONCURRENCY ----------------------------------------------------------
async function runQueue(items, concurrency) {
 const results = new Array(items.length);
 let next = 0;
 async function worker() {
 while (true) {
 const i = next++;
 if (i >= items.length) return;
 results[i] = await processLead(items[i]);
 }
 }
 const workers = Array.from({ length: concurrency }, worker);
 await Promise.all(workers);
 return results;
}

// --- MAIN -----------------------------------------------------------------
async function main() {
 const argv = process.argv.slice(2);
 let leads = [];

 if (argv[0] === '--file' && argv[1]) {
 const json = JSON.parse(fs.readFileSync(argv[1], 'utf8'));
 leads = Array.isArray(json) ? json : json.leads || [];
 } else if (argv.length > 0) {
 leads = argv;
 } else {
 process.stderr.write('Usage: node apify-pre-check.mjs handle1 handle2 ... | --file leads.json\n');
 process.exit(2);
 }

 if (leads.length === 0) {
 process.stderr.write('Keine Leads übergeben.\n');
 process.exit(2);
 }

 process.stderr.write(`Processing ${leads.length} leads with concurrency=${CONCURRENCY}\n`);
 const t0 = Date.now();
 const results = await runQueue(leads, CONCURRENCY);
 const ms = Date.now() - t0;

 // Summary
 const variantCounts = {};
 for (const r of results) {
 variantCounts[r.variant] = (variantCounts[r.variant] || 0) + 1;
 }

 process.stderr.write('\n=== SUMMARY ===\n');
 process.stderr.write(`Total: ${results.length} | Duration: ${(ms / 1000).toFixed(1)}s\n`);
 for (const [v, n] of Object.entries(variantCounts).sort((a, b) => b[1] - a[1])) {
 process.stderr.write(` ${v}: ${n}\n`);
 }
 const apifyErrors = results.filter(r => r.apify_error).length;
 process.stderr.write(` apify_errors: ${apifyErrors}\n`);

 // Stdout: JSON für Daily-Task zum Konsumieren
 process.stdout.write(JSON.stringify({ results, summary: { total: results.length, durationMs: ms, variantCounts } }, null, 2));
 process.stdout.write('\n');
}

main().catch(e => {
 process.stderr.write(`FATAL: ${e.message}\n${e.stack}\n`);
 process.exit(1);
});
