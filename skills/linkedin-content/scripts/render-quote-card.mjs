#!/usr/bin/env node
/**
 * render-quote-card.mjs — LinkedIn Quote-Card Renderer
 *
 * Rendert pixel-perfekte 1200x1350 Quote-Cards via Remotion renderStill().
 * Persona-spezifisches Branding (primary + secondary).
 *
 * Shared zwischen linkedin-content + linkedin-content-secondary.
 *
 * USAGE:
 * node render-quote-card.mjs --text "..." --persona primary --style quote --out /path/out.png
 * node render-quote-card.mjs --text "..." --persona secondary --style quote --accent-words "Vertrauen,Mitarbeiter" --out /path/out.png
 * node render-quote-card.mjs --text "..." --persona primary --style portrait-overlay --portrait public/primary-portrait.jpg --out /path/out.png
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const REMOTION_DIR = '~/Projects/AI UGC/remotion-app';

function parseArgs(argv) {
 const out = {};
 for (let i = 0; i < argv.length; i++) {
 if (argv[i].startsWith('--')) {
 const key = argv[i].slice(2);
 const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
 out[key] = val;
 if (val !== true) i++;
 }
 }
 return out;
}

async function main() {
 const args = parseArgs(process.argv.slice(2));

 if (!args.text || !args.persona || !args.out) {
 console.error('Usage: render-quote-card.mjs --text "..." --persona <primary|secondary> [--style <quote|portrait-overlay>] [--accent-words "w1,w2"] [--portrait public/path.jpg] --out /full/path/out.png');
 process.exit(2);
 }

 if (!['primary', 'secondary'].includes(args.persona)) {
 console.error(`Invalid persona: ${args.persona}. Allowed: primary | secondary.`);
 process.exit(2);
 }

 const style = args.style || 'quote';
 if (!['quote', 'portrait-overlay'].includes(style)) {
 console.error(`Invalid style: ${style}. Allowed: quote | portrait-overlay.`);
 process.exit(2);
 }

 if (style === 'portrait-overlay' && !args.portrait) {
 console.error('Style portrait-overlay requires --portrait <public-relative-path>');
 process.exit(2);
 }

 const accentWords = args['accent-words']
 ? args['accent-words'].split(',').map(s => s.trim()).filter(Boolean)
 : [];

 const props = {
 hookText: args.text,
 persona: args.persona,
 style,
 accentWords,
 ...(args.portrait ? { portraitSrc: args.portrait } : {}),
 };

 // Output-Pfad absolut machen
 const outPath = path.isAbsolute(args.out) ? args.out : path.resolve(process.cwd(), args.out);
 fs.mkdirSync(path.dirname(outPath), { recursive: true });

 // Render via npx remotion still — Windows-safe via temp JSON file (Remotion-Empfehlung).
 // WICHTIG: Pfad ohne Leerzeichen, sonst Windows-CLI splittet das Argument.
 const propsFile = path.join(os.tmpdir(), `lqc-props-${Date.now()}.json`).replace(/\\/g, '/');
 fs.writeFileSync(propsFile, JSON.stringify(props, null, 2), 'utf8');

 console.error(`[render-quote-card] persona=${args.persona} style=${style} text="${args.text.slice(0, 60)}..." → ${outPath}`);

 const t0 = Date.now();
 try {
 await new Promise((resolve, reject) => {
 const proc = spawn('npx', ['remotion', 'still', 'LinkedInQuoteCard', outPath, `--props=${propsFile}`, '--image-format=png'], {
 cwd: REMOTION_DIR,
 stdio: ['inherit', 'pipe', 'inherit'],
 shell: process.platform === 'win32',
 });
 let stdout = '';
 proc.stdout.on('data', d => { stdout += d.toString(); process.stderr.write(d); });
 proc.on('exit', code => code === 0 ? resolve(stdout) : reject(new Error(`Remotion still exit ${code}`)));
 proc.on('error', reject);
 });
 } finally {
 try { fs.unlinkSync(propsFile); } catch {}
 }

 const ms = Date.now() - t0;
 if (!fs.existsSync(outPath)) {
 console.error('[render-quote-card] FAIL: output file not created');
 process.exit(1);
 }
 const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
 console.error(`[render-quote-card] OK in ${ms}ms — ${outPath} (${sizeKb} KB)`);

 // stdout: nur der Pfad (für Pipe-Weiterverarbeitung)
 console.log(outPath);
}

main().catch(e => {
 console.error('[render-quote-card] FATAL:', e.message);
 process.exit(1);
});
