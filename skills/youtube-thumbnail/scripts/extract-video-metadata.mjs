#!/usr/bin/env node
/**
 * Extract YouTube video metadata via yt-dlp (FREE, no API key needed).
 * Returns everything needed for thumbnail generation: title, description,
 * tags, category, channel, views, existing thumbnail, and optionally subtitles.
 *
 * Usage:
 * node extract-video-metadata.mjs --url "https://www.youtube.com/watch?v=VIDEO_ID"
 * node extract-video-metadata.mjs --url "VIDEO_ID"
 * node extract-video-metadata.mjs --url "https://youtu.be/VIDEO_ID" --subtitles
 *
 * Requires: yt-dlp installed (pip install yt-dlp)
 * Output: JSON to stdout with all relevant fields
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

function parseArgs() {
 const args = process.argv.slice(2);
 const opts = { url: '', subtitles: false, downloadThumbnail: false, outputDir: 'workspace/metadata' };
 for (let i = 0; i < args.length; i++) {
 if (args[i] === '--url' && args[i + 1]) opts.url = args[++i];
 if (args[i] === '--subtitles') opts.subtitles = true;
 if (args[i] === '--download-thumbnail') opts.downloadThumbnail = true;
 if (args[i] === '--output-dir' && args[i + 1]) opts.outputDir = args[++i];
 }
 if (!opts.url) { console.error('Error: --url required'); process.exit(1); }
 return opts;
}

function normalizeUrl(input) {
 // Accept: full URL, youtu.be short, or just video ID
 if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
 return `https://www.youtube.com/watch?v=${input}`;
 }
 if (input.includes('youtu.be/')) {
 const id = input.split('youtu.be/')[1]?.split(/[?&#]/)[0];
 return `https://www.youtube.com/watch?v=${id}`;
 }
 return input;
}

function extractMetadata(url) {
 console.error(`[yt-dlp] Extracting metadata for: ${url}`);
 try {
 const raw = execSync(`yt-dlp --dump-json --no-download "${url}"`, {
 encoding: 'utf8',
 timeout: 30000,
 stdio: ['pipe', 'pipe', 'pipe'],
 });
 return JSON.parse(raw);
 } catch (e) {
 console.error(`[yt-dlp] Error: ${e.message}`);
 process.exit(1);
 }
}

function extractSubtitles(url, lang = 'en') {
 console.error(`[yt-dlp] Extracting subtitles (${lang})...`);
 try {
 const raw = execSync(
 `yt-dlp --skip-download --write-auto-sub --sub-lang ${lang} --sub-format json3 --print-json "${url}"`,
 { encoding: 'utf8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe'] }
 );
 return JSON.parse(raw);
 } catch (e) {
 console.error(`[yt-dlp] Subtitle extraction failed: ${e.message}`);
 return null;
 }
}

async function downloadThumbnail(thumbnailUrl, outputPath) {
 try {
 const res = await fetch(thumbnailUrl, {
 headers: { 'User-Agent': 'Mozilla/5.0' },
 signal: AbortSignal.timeout(15000),
 });
 if (!res.ok) return null;
 const buffer = Buffer.from(await res.arrayBuffer());
 mkdirSync(dirname(outputPath), { recursive: true });
 writeFileSync(outputPath, buffer);
 return outputPath;
 } catch (e) {
 console.error(`[download] Thumbnail download failed: ${e.message}`);
 return null;
 }
}

async function main() {
 const opts = parseArgs();
 const url = normalizeUrl(opts.url);
 const meta = extractMetadata(url);

 // Extract video ID
 const videoId = meta.id || url.match(/[?&]v=([^&]+)/)?.[1] || '';

 // Build clean output
 const result = {
 videoId,
 url: meta.webpage_url || url,
 title: meta.title || '',
 description: (meta.description || '').slice(0, 1000),
 tags: meta.tags || [],
 categories: meta.categories || [],
 channel: meta.channel || meta.uploader || '',
 channelUrl: meta.channel_url || meta.uploader_url || '',
 viewCount: meta.view_count || 0,
 likeCount: meta.like_count || 0,
 duration: meta.duration || 0,
 uploadDate: meta.upload_date || '',
 // Thumbnails — sorted by quality
 thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
 thumbnailUrls: {
 maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
 hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
 mq: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
 },
 // Available subtitle languages
 subtitleLanguages: Object.keys(meta.subtitles || {}),
 autoSubtitleLanguages: Object.keys(meta.automatic_captions || {}).slice(0, 20),
 // Niche detection helpers
 nicheSignals: {
 category: (meta.categories || [])[0] || 'Unknown',
 tags: (meta.tags || []).slice(0, 15),
 titleWords: (meta.title || '').toLowerCase().split(/\s+/).length,
 hasSubtitles: Object.keys(meta.subtitles || {}).length > 0,
 },
 };

 // Download current thumbnail if requested
 if (opts.downloadThumbnail) {
 mkdirSync(opts.outputDir, { recursive: true });
 const thumbPath = join(opts.outputDir, `${videoId}-current-thumb.jpg`);
 const downloaded = await downloadThumbnail(result.thumbnailUrl, thumbPath);
 if (downloaded) {
 result.downloadedThumbnailPath = downloaded;
 console.error(`[download] Current thumbnail saved: ${downloaded}`);
 }
 }

 // Machine-readable output
 console.log(JSON.stringify(result, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
