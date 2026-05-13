#!/usr/bin/env node
/**
 * Standalone concreteness check. Same logic as in check.mjs Dimension 4,
 * but can be run independently for diagnostics.
 *
 * Usage:
 *   node concreteness.mjs --text "<TEXT>"
 *   node concreteness.mjs --file <path>
 */

import { readFileSync } from 'node:fs';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) args[key] = true;
      else { args[key] = next; i++; }
    }
  }
  return args;
}

function loadText(args) {
  if (args.text) return args.text;
  if (args.file) return readFileSync(args.file, 'utf8');
  if (args.stdin) return readFileSync(0, 'utf8');
  throw new Error('Provide --text, --file, or --stdin');
}

function sentences(text) {
  return text.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])|(?<=[.!?])\s*\n+/).map(s => s.trim()).filter(Boolean);
}

function words(text) {
  return text.match(/\b[\wäöüÄÖÜß\-']+\b/g) || [];
}

function extractEntities(text) {
  const entities = { propernouns: [], numbers: [], dates: [], urls: [], months: [] };
  const sents = sentences(text);

  for (const s of sents) {
    const ws = s.split(/\s+/);
    for (let i = 1; i < ws.length; i++) {
      const w = ws[i].replace(/[.,;:!?()"']/g, '');
      if (/^[A-ZÄÖÜ][a-zäöüß]+/.test(w) && !/^(Der|Die|Das|Und|Aber|Oder|Wenn|Weil|Dass|Ein|Eine|Ich|Du|Sie|Er|Wir|Ihr|Mein|Dein|Unser)$/.test(w)) {
        entities.propernouns.push(w);
      }
    }
  }

  entities.numbers = text.match(/\b\d+([.,]\d+)?%?\b/g) || [];
  entities.dates = text.match(/\b(20[1-3]\d|19\d\d)\b/g) || [];
  entities.months = text.match(/\b(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|Q[1-4])\b/g) || [];
  entities.urls = text.match(/https?:\/\/\S+/g) || [];

  return entities;
}

const args = parseArgs(process.argv);
const text = loadText(args);
const wordCount = words(text).length;
const entities = extractEntities(text);
const total = entities.propernouns.length + entities.numbers.length + entities.dates.length + entities.months.length + entities.urls.length;
const per150 = wordCount > 0 ? (total / wordCount) * 150 : 0;

console.log(JSON.stringify({
  word_count: wordCount,
  entities,
  total,
  per_150_words: +per150.toFixed(2),
}, null, 2));
