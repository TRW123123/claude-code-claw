#!/usr/bin/env node
/**
 * Fetch top-performing YouTube thumbnails for a keyword via Apify.
 *
 * Usage:
 *   node fetch-competitor-thumbnails.mjs --query "ki automatisierung tutorial" --top 5
 *   node fetch-competitor-thumbnails.mjs --query "AI agents" --top 3 --min-views 50000
 *
 * Env: APIFY_TOKEN (or .env in project root)
 *
 * Output: Downloads thumbnails to workspace/examples/ and prints JSON manifest to stdout.
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- .env loader (no deps) ---
function loadEnv() {
  const candidates = [
    join(__dirname, '..', '..', '..', '.env'),  // project root
    join(process.cwd(), '.env'),
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

// --- Args ---
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { query: '', top: 5, minViews: 0, outputDir: 'workspace/examples' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--query' && args[i + 1]) opts.query = args[++i];
    if (args[i] === '--top' && args[i + 1]) opts.top = parseInt(args[++i], 10);
    if (args[i] === '--min-views' && args[i + 1]) opts.minViews = parseInt(args[++i], 10);
    if (args[i] === '--output-dir' && args[i + 1]) opts.outputDir = args[++i];
  }
  if (!opts.query) { console.error('Error: --query required'); process.exit(1); }
  return opts;
}

// --- Apify YouTube Scraper ---
async function runApifyScraper(query, maxResults, token) {
  console.error(`[apify] Searching YouTube for: "${query}" (max ${maxResults} results)...`);

  // Use the synchronous run endpoint for simplicity
  const res = await fetch(
    `https://api.apify.com/v2/acts/bernardo~youtube-scraper/run-sync-get-dataset-items?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchKeywords: [query],
        maxResults,
        maxResultsShorts: 0,
      }),
      signal: AbortSignal.timeout(120_000),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`[apify] Error ${res.status}: ${body}`);
    process.exit(1);
  }

  return res.json();
}

// --- Download thumbnail ---
async function downloadThumbnail(url, outputPath) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return false;

    const buffer = Buffer.from(await res.arrayBuffer());

    // Validate: not HTML
    const header = buffer.slice(0, 256).toString();
    if (header.includes('<!DOCTYPE') || header.includes('<html') || header.includes('<HTML')) {
      console.error(`  [skip] Got HTML instead of image from ${url}`);
      return false;
    }
    if (buffer.length < 100) {
      console.error(`  [skip] File too small (${buffer.length} bytes)`);
      return false;
    }

    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, buffer);
    return true;
  } catch (e) {
    console.error(`  [skip] Download failed: ${e.message}`);
    return false;
  }
}

// --- Slug ---
function slugify(text, maxLen = 40) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-').slice(0, maxLen);
}

// --- Main ---
async function main() {
  loadEnv();
  const opts = parseArgs();

  const token = process.env.APIFY_TOKEN;
  if (!token) {
    console.error('Error: APIFY_TOKEN not set (check .env or environment)');
    process.exit(1);
  }

  const videos = await runApifyScraper(opts.query, opts.top * 2, token);

  if (!videos || videos.length === 0) {
    console.error('No videos found.');
    process.exit(1);
  }

  console.error(`[apify] Got ${videos.length} videos`);

  // Sort by views, filter by min
  const sorted = videos
    .map(v => ({
      title: v.title || 'Untitled',
      views: v.viewCount || v.views || 0,
      channel: v.channelName || v.channel || '',
      url: v.url || '',
      thumbnailUrl: v.thumbnailUrl || v.thumbnail || '',
    }))
    .filter(v => v.views >= opts.minViews && v.thumbnailUrl)
    .sort((a, b) => b.views - a.views)
    .slice(0, opts.top);

  if (sorted.length === 0) {
    console.error(`No videos found with >= ${opts.minViews} views.`);
    process.exit(1);
  }

  console.error(`\nTop ${sorted.length} videos by views:`);
  sorted.forEach((v, i) => {
    console.error(`  ${i + 1}. [${v.views.toLocaleString()} views] ${v.title.slice(0, 60)}`);
  });

  // Download thumbnails
  const slug = slugify(opts.query);
  const manifest = [];

  for (let i = 0; i < sorted.length; i++) {
    const v = sorted[i];
    // Try maxresdefault first, then hqdefault
    const thumbUrls = [];
    if (v.thumbnailUrl) thumbUrls.push(v.thumbnailUrl);

    // Extract video ID and try high-res variants
    const videoId = v.url?.match(/[?&]v=([^&]+)/)?.[1];
    if (videoId) {
      thumbUrls.unshift(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
      thumbUrls.push(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    }

    const filename = `${slug}-${i + 1}.jpg`;
    const outputPath = join(opts.outputDir, filename);

    console.error(`  Downloading ${i + 1}/${sorted.length}: ${v.title.slice(0, 50)}...`);

    let downloaded = false;
    for (const url of thumbUrls) {
      if (await downloadThumbnail(url, outputPath)) {
        downloaded = true;
        break;
      }
    }

    if (downloaded) {
      manifest.push({
        path: outputPath,
        title: v.title,
        views: v.views,
        channel: v.channel,
        url: v.url,
      });
    }
  }

  if (manifest.length === 0) {
    console.error('Error: Failed to download any thumbnails.');
    process.exit(1);
  }

  console.error(`\nDownloaded ${manifest.length} thumbnails to ${opts.outputDir}/`);
  // Machine-readable output to stdout
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
