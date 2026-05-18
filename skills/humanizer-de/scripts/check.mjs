#!/usr/bin/env node
/**
 * humanizer-de — Pass 1: Deterministic Quality Check
 *
 * Usage:
 * node check.mjs --text "<TEXT>" --profile <profile-name>
 * node check.mjs --file <path> --profile <profile-name>
 * echo "<TEXT>" | node check.mjs --stdin --profile <profile-name>
 *
 * Output: JSON report with score, dimensions, flags, platform-pass status.
 *
 * No LLM calls. Pure regex + counting. Fast.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

// ---------- Load data ----------
const blacklistDe = JSON.parse(readFileSync(join(DATA_DIR, 'blacklist-de.json'), 'utf8'));
const blacklistEn = JSON.parse(readFileSync(join(DATA_DIR, 'blacklist-en.json'), 'utf8'));
const translationese = JSON.parse(readFileSync(join(DATA_DIR, 'translationese-en-de.json'), 'utf8'));
const profiles = JSON.parse(readFileSync(join(DATA_DIR, 'platform-profiles.json'), 'utf8'));

// ---------- CLI parsing ----------
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

// ---------- Tokenization ----------
function sentences(text) {
 // Split on . ! ? followed by whitespace+uppercase or EOL
 return text
 .split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])|(?<=[.!?])\s*\n+/)
 .map(s => s.trim())
 .filter(Boolean);
}

function words(text) {
 return text.match(/\b[\wäöüÄÖÜß\-']+\b/g) || [];
}

function normalize(s) {
 return s.toLowerCase().normalize('NFC');
}

// ---------- Dimension 1: Blacklist ----------
function checkBlacklist(text) {
 const lower = normalize(text);
 const hits = [];

 const collect = (category, list, source) => {
 for (const term of list) {
 const t = normalize(term);
 const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
 const matches = [...lower.matchAll(re)];
 for (const m of matches) {
 hits.push({ category, term, source, position: m.index });
 }
 }
 };

 // DE
 collect('verb', blacklistDe.verben, 'de');
 collect('adjective', blacklistDe.adjektive, 'de');
 collect('noun', blacklistDe.nomen, 'de');
 collect('opener', blacklistDe.opener_phrasen, 'de');
 collect('closer', blacklistDe.closer_phrasen, 'de');
 collect('transition', blacklistDe.uebergaenge, 'de');
 collect('filler', blacklistDe.filler_woerter, 'de');
 collect('academic', blacklistDe.academic_tells, 'de');

 // EN
 collect('verb', blacklistEn.verbs, 'en');
 collect('adjective', blacklistEn.adjectives, 'en');
 collect('noun', blacklistEn.nouns, 'en');
 collect('opener', blacklistEn.opener_phrases, 'en');
 collect('closer', blacklistEn.closer_phrases, 'en');
 collect('transition', blacklistEn.transitions, 'en');

 // Translationese
 for (const c of translationese.calques) {
 const t = normalize(c.de_ai);
 const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
 const matches = [...lower.matchAll(re)];
 for (const m of matches) {
 hits.push({
 category: 'translationese',
 term: c.de_ai,
 suggestion: c.de_natural,
 source: 'en-de-calque',
 position: m.index,
 });
 }
 }

 // Structural patterns (DE)
 for (const p of blacklistDe.strukturelle_patterns) {
 const re = new RegExp(p.regex, 'gi');
 const matches = [...text.matchAll(re)];
 if (matches.length >= p.hits_threshold) {
 hits.push({
 category: 'structural',
 term: p.pattern,
 count: matches.length,
 threshold: p.hits_threshold,
 source: 'de-pattern',
 });
 }
 }

 const n = hits.length;
 let points = 0;
 if (n === 0) points = 20;
 else if (n === 1) points = 14;
 else if (n === 2) points = 8;
 else if (n === 3) points = 3;
 else points = 0;

 return { points, hits, count: n };
}

// ---------- Dimension 2: Sentence Rhythm ----------
function checkRhythm(text) {
 const sents = sentences(text);
 if (sents.length < 3) return { points: 14, stddev: null, note: 'too few sentences' };

 const lengths = sents.map(s => words(s).length);
 const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
 const variance = lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
 const stddev = Math.sqrt(variance);

 let points = 0;
 if (stddev >= 6) points = 20;
 else if (stddev >= 4) points = 14;
 else if (stddev >= 2) points = 7;
 else points = 0;

 // Red flag: 3+ consecutive same-length sentences (±1 word)
 let streak = 1;
 let maxStreak = 1;
 for (let i = 1; i < lengths.length; i++) {
 if (Math.abs(lengths[i] - lengths[i - 1]) <= 1) { streak++; maxStreak = Math.max(maxStreak, streak); }
 else streak = 1;
 }
 if (maxStreak >= 3) points = Math.max(0, points - 5);

 return { points, stddev: +stddev.toFixed(2), mean: +mean.toFixed(1), maxStreak, sentenceCount: sents.length };
}

// ---------- Dimension 3: Punctuation & Formatting ----------
function checkPunctuation(text, profile) {
 let points = 20;
 const flags = [];
 const wordCount = words(text).length;

 // Em-dash rate
 const emDashes = (text.match(/—/g) || []).length;
 const emDashesPer500 = wordCount > 0 ? (emDashes / wordCount) * 500 : 0;
 if (emDashesPer500 > profile.max_em_dashes_per_500w) {
 points -= 8;
 flags.push({ type: 'em-dash-excess', count: emDashes, per500w: +emDashesPer500.toFixed(2), allowed: profile.max_em_dashes_per_500w });
 }

 // Bulleted lists with bold lead-ins
 const boldBullets = (text.match(/^[\-\*•]\s+\*\*[^*]+\*\*:/gm) || []).length;
 if (boldBullets >= 1) {
 points -= 4;
 flags.push({ type: 'bulleted-bold-leadin', count: boldBullets });
 }

 // Unicode bullets
 const unicodeBullets = (text.match(/[•●▪◆]/g) || []).length;
 if (unicodeBullets >= 1) {
 points -= 3;
 flags.push({ type: 'unicode-bullets', count: unicodeBullets });
 }

 // AI opener — first 80 chars
 const opener = text.slice(0, 120).toLowerCase();
 for (const phrase of blacklistDe.opener_phrasen) {
 if (opener.includes(phrase.toLowerCase())) {
 points -= 4;
 flags.push({ type: 'ai-opener', phrase });
 break;
 }
 }

 // AI closer — last 120 chars
 const closer = text.slice(-180).toLowerCase();
 for (const phrase of blacklistDe.closer_phrasen) {
 if (closer.includes(phrase.toLowerCase())) {
 points -= 4;
 flags.push({ type: 'ai-closer', phrase });
 break;
 }
 }

 // Oxford-comma creep in DE
 const oxfordComma = (text.match(/,\s+und\s+\w+/g) || []).length;
 if (oxfordComma >= 2) {
 points -= 2;
 flags.push({ type: 'oxford-comma', count: oxfordComma });
 }

 // Emoji in header (# or ##)
 const emojiHeader = (text.match(/^#+\s.*[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/mu) || []).length;
 if (emojiHeader >= 1) {
 points -= 2;
 flags.push({ type: 'emoji-header', count: emojiHeader });
 }

 return { points: Math.max(0, points), flags };
}

// ---------- Dimension 4: Concreteness ----------
function checkConcreteness(text, profile) {
 const wordCount = words(text).length;
 if (wordCount === 0) return { points: 0, entitiesPer150w: 0, total: 0 };

 // Count named entities — naive but effective
 let entities = 0;

 // Capitalized words that are NOT at sentence start
 const sents = sentences(text);
 for (const s of sents) {
 const ws = s.split(/\s+/);
 for (let i = 1; i < ws.length; i++) {
 const w = ws[i].replace(/[.,;:!?()"']/g, '');
 if (/^[A-ZÄÖÜ][a-zäöüß]+/.test(w) && !/^(Der|Die|Das|Und|Aber|Oder|Wenn|Weil|Dass|Ein|Eine|Ich|Du|Sie|Er|Wir|Ihr|Mein|Dein|Unser)$/.test(w)) {
 entities++;
 }
 }
 }

 // Numbers and percentages
 entities += (text.match(/\b\d+([.,]\d+)?%?\b/g) || []).length;

 // Dates: years 2020-2030, months
 entities += (text.match(/\b(20[1-3]\d|19\d\d)\b/g) || []).length;
 entities += (text.match(/\b(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|Q[1-4])\b/g) || []).length;

 // URLs and email
 entities += (text.match(/https?:\/\/\S+/g) || []).length;

 const entitiesPer150w = (entities / wordCount) * 150;
 const threshold = profile.min_concrete_entities_per_150w;

 let points = 0;
 if (entitiesPer150w >= threshold + 0) points = 20;
 if (entitiesPer150w < threshold) {
 if (entitiesPer150w >= threshold * 0.66) points = 14;
 else if (entitiesPer150w >= threshold * 0.33) points = 7;
 else points = 0;
 } else {
 points = 20;
 }

 return { points, entitiesPer150w: +entitiesPer150w.toFixed(2), total: entities, threshold };
}

// ---------- Dimension 5: Passive Voice ----------
function checkPassive(text) {
 const sents = sentences(text);
 if (sents.length === 0) return { points: 20, ratio: 0, passiveCount: 0, total: 0 };

 // DE passive markers: "wird/wurde/worden" + Partizip II; "sein + Partizip II" (Zustandspassiv)
 const passiveRegex = /\b(wird|werden|wurde|wurden|worden|ist|sind|war|waren|bin|bist|seid)\s+(?:nicht\s+)?(?:\w+\s+){0,3}(ge\w+[td]|\w+iert)\b/i;
 let passiveCount = 0;
 for (const s of sents) {
 if (passiveRegex.test(s)) passiveCount++;
 }
 const ratio = passiveCount / sents.length;

 let points = 0;
 if (ratio < 0.10) points = 20;
 else if (ratio < 0.20) points = 14;
 else if (ratio < 0.30) points = 8;
 else points = 0;

 return { points, ratio: +ratio.toFixed(3), passiveCount, total: sents.length };
}

// ---------- Hard-fail flags ----------
function hardFailChecks(text, profile) {
 const wordCount = words(text).length;
 const fails = [];

 if (profile.max_words && wordCount > profile.max_words) {
 fails.push({ type: 'max_words_exceeded', wordCount, limit: profile.max_words });
 }

 if (profile.forbid_listings) {
 const hasList = /^[\-\*•]\s+/m.test(text) || /^\d+\.\s+/m.test(text);
 if (hasList) fails.push({ type: 'listings_forbidden' });
 }

 if (profile.require_hook) {
 const firstLine = text.split('\n')[0] || '';
 const hookPatterns = [/\?$/, /^\d/, /^[^.]*?[!:]/, /^(Wie|Warum|Was|Wann|Wer)/i];
 if (!hookPatterns.some(re => re.test(firstLine.trim()))) {
 fails.push({ type: 'hook_missing', firstLine });
 }
 }

 if (profile.require_action_verb) {
 const first = (text.trim().split(/\s+/)[0] || '').toLowerCase();
 const actionVerbs = ['klicken', 'senden', 'weiter', 'starten', 'speichern', 'öffnen', 'schließen', 'zurück', 'abbrechen', 'bestätigen', 'hinzufügen', 'entfernen', 'anmelden', 'abmelden', 'buchen', 'kaufen'];
 if (!actionVerbs.some(v => first.startsWith(v))) {
 fails.push({ type: 'action_verb_missing', first });
 }
 }

 return fails;
}

// ---------- Main ----------
function main() {
 const args = parseArgs(process.argv);
 const profileName = args.profile;
 if (!profileName || !profiles[profileName]) {
 console.error(`Unknown profile: ${profileName}. Available: ${Object.keys(profiles).filter(k => !k.startsWith('_')).join(', ')}`);
 process.exit(2);
 }
 const profile = profiles[profileName];
 const text = loadText(args);

 const dim1 = checkBlacklist(text);
 const dim2 = checkRhythm(text);
 const dim3 = checkPunctuation(text, profile);
 const dim4 = checkConcreteness(text, profile);
 const dim5 = checkPassive(text);

 const score = dim1.points + dim2.points + dim3.points + dim4.points + dim5.points;
 const hardFails = hardFailChecks(text, profile);
 const pass = score >= profile.min_score && hardFails.length === 0;

 const report = {
 profile: profileName,
 score,
 min_score: profile.min_score,
 pass,
 dimensions: {
 blacklist: { points: dim1.points, hits: dim1.count, details: dim1.hits },
 rhythm: { points: dim2.points, ...dim2 },
 punctuation: { points: dim3.points, flags: dim3.flags },
 concreteness: { points: dim4.points, ...dim4 },
 passive: { points: dim5.points, ...dim5 },
 },
 hard_fails: hardFails,
 word_count: words(text).length,
 sentence_count: sentences(text).length,
 };

 console.log(JSON.stringify(report, null, 2));
 process.exit(pass ? 0 : 1);
}

main();
