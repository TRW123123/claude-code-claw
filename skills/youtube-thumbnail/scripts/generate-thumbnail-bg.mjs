#!/usr/bin/env node
/**
 * Generate a text-free YouTube thumbnail background using Nano Banana Pro.
 * Produces the AI-generated scene + face image that Remotion will overlay text on.
 *
 * Usage:
 *   node generate-thumbnail-bg.mjs \
 *     --headshot path/to/headshot.png \
 *     --prompt "A confident woman in a modern office, dramatic lighting, looking at camera" \
 *     --output workspace/backgrounds/bg-a.png
 *
 *   With competitor examples as style reference:
 *   node generate-thumbnail-bg.mjs \
 *     --headshot path/to/headshot.png \
 *     --examples workspace/examples/slug-1.jpg workspace/examples/slug-2.jpg \
 *     --prompt "..." \
 *     --output workspace/backgrounds/bg-a.png
 *
 * HARD RULE: Model = gemini-3-pro-image-preview (Nano Banana Pro)
 * HARD RULE: Prompt must NOT contain any text to render — text comes from Remotion
 *
 * Env: GEMINI_API_KEY
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- .env loader ---
function loadEnv() {
  const candidates = [
    join(__dirname, '..', '..', '..', '.env'),
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
  const opts = { headshots: [], examples: [], references: [], prompt: '', output: '' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--headshot') {
      while (args[i + 1] && !args[i + 1].startsWith('--')) opts.headshots.push(args[++i]);
    }
    if (args[i] === '--examples') {
      while (args[i + 1] && !args[i + 1].startsWith('--')) opts.examples.push(args[++i]);
    }
    if (args[i] === '--reference') {
      while (args[i + 1] && !args[i + 1].startsWith('--')) opts.references.push(args[++i]);
    }
    if (args[i] === '--prompt' && args[i + 1]) opts.prompt = args[++i];
    if (args[i] === '--output' && args[i + 1]) opts.output = args[++i];
  }
  if (!opts.prompt) { console.error('Error: --prompt required'); process.exit(1); }
  if (!opts.output) { console.error('Error: --output required'); process.exit(1); }
  if (opts.headshots.length === 0) { console.error('Error: --headshot required'); process.exit(1); }
  return opts;
}

// --- Validate image file ---
function validateImage(path) {
  if (!existsSync(path)) {
    console.error(`Error: File not found: ${path}`);
    process.exit(1);
  }
  const header = readFileSync(path).slice(0, 256).toString();
  if (header.includes('<!DOCTYPE') || header.includes('<html') || header.includes('<HTML')) {
    console.error(`Error: '${path}' is HTML, not an image. Re-download from a different source.`);
    process.exit(1);
  }
}

// --- Load image as base64 for Gemini API ---
function loadImagePart(path) {
  const buffer = readFileSync(path);
  const ext = path.toLowerCase().split('.').pop();
  const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: mimeMap[ext] || 'image/png',
    }
  };
}

// --- Main ---
async function main() {
  loadEnv();
  const opts = parseArgs();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY not set');
    process.exit(1);
  }

  // Validate all images
  [...opts.headshots, ...opts.examples, ...opts.references].forEach(validateImage);

  // Build prompt — ENFORCE no text rendering
  let fullPrompt = opts.prompt;

  // Safety: strip any text rendering instructions
  fullPrompt += `

CRITICAL RULES:
- Do NOT render any text, words, letters, or numbers on the image
- Do NOT include any text overlays, captions, titles, or watermarks
- The image must be PURELY visual — scene, person, objects, lighting only
- Text will be added separately in post-production
- Aspect ratio: 16:9 (YouTube thumbnail standard)
- Resolution: High quality, suitable for 1920x1080`;

  if (opts.examples.length > 0) {
    fullPrompt += `

STYLE EXAMPLES:
The final attached images are thumbnails from high-performing YouTube videos on this topic.
Study their composition, color usage, lighting, and visual hierarchy.
Apply those patterns to create an ORIGINAL image. Do NOT copy these thumbnails.
Do NOT include any text that appears in these examples — text-free output only.`;
  }

  // Build request parts
  const parts = [{ text: fullPrompt }];

  // Add headshots
  for (const h of opts.headshots) {
    parts.push(loadImagePart(h));
  }

  // Add reference images
  for (const r of opts.references) {
    parts.push(loadImagePart(r));
  }

  // Add examples
  for (const e of opts.examples) {
    parts.push(loadImagePart(e));
  }

  console.error('[nano-banana] Generating thumbnail background...');
  console.error(`[nano-banana] Model: gemini-3-pro-image-preview`);
  console.error(`[nano-banana] Headshots: ${opts.headshots.length}, Examples: ${opts.examples.length}, Refs: ${opts.references.length}`);

  // Call Gemini API directly (no SDK dependency)
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          imageConfig: { aspectRatio: '16:9' },
        },
      }),
      signal: AbortSignal.timeout(120_000),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`[nano-banana] Error ${res.status}: ${body}`);
    process.exit(1);
  }

  const data = await res.json();
  const candidates = data.candidates?.[0]?.content?.parts || [];

  let imageSaved = false;
  let textResponse = '';

  for (const part of candidates) {
    if (part.inlineData) {
      const buffer = Buffer.from(part.inlineData.data, 'base64');
      mkdirSync(dirname(opts.output), { recursive: true });
      writeFileSync(opts.output, buffer);
      imageSaved = true;
      console.error(`[nano-banana] Background saved: ${opts.output}`);
    }
    if (part.text) {
      textResponse += part.text;
    }
  }

  if (textResponse) {
    console.error(`[nano-banana] Model notes: ${textResponse}`);
  }

  if (!imageSaved) {
    console.error('[nano-banana] Error: No image generated.');
    if (textResponse) console.error(`Response: ${textResponse}`);
    process.exit(1);
  }

  // Output path to stdout for piping
  console.log(opts.output);
}

main().catch(e => { console.error(e); process.exit(1); });
