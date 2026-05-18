#!/usr/bin/env node
/**
 * YouTube Thumbnail Orchestrator — Webhook Pipeline
 *
 * Receives a webhook payload and runs the full thumbnail generation pipeline:
 * 1. Extract video metadata (yt-dlp)
 * 2. Auto-detect niche & CTR benchmark
 * 3. Fetch competitor thumbnails (Apify)
 * 4. Generate 4 concept prompts (AI decision-making)
 * 5. Generate 4 backgrounds in parallel (Nano Banana Pro)
 * 6. Remotion renderStill placeholder (4x)
 * 7. Write result summary JSON
 * 8. Email notification placeholder
 *
 * Usage:
 * node orchestrate-thumbnail.mjs --payload '{"videoUrl":"https://youtube.com/watch?v=..."}'
 * echo '{"videoUrl":"..."}' | node orchestrate-thumbnail.mjs
 *
 * HARD RULES:
 * - Model: gemini-3-pro-image-preview (Nano Banana Pro) — no other model
 * - Nano Banana NEVER renders text — text comes from Remotion only
 * - Max 3 words in thumbnail hook text
 * - 16:9 aspect ratio (1920x1080) always
 * - Bottom-right dead zone (YouTube timestamp)
 */

import { execSync, spawn } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Helpers ────────────────────────────────────────────────────────────────

function log(step, msg) {
 const ts = new Date().toISOString().slice(11, 19);
 console.error(`[${ts}] [step ${step}] ${msg}`);
}

function logError(step, msg) {
 const ts = new Date().toISOString().slice(11, 19);
 console.error(`[${ts}] [step ${step}] ERROR: ${msg}`);
}

function slugify(text, maxLen = 50) {
 return text
 .toLowerCase()
 .replace(/[^a-z0-9\s-]/g, '')
 .replace(/[\s-]+/g, '-')
 .replace(/^-+|-+$/g, '')
 .slice(0, maxLen);
}

function today() {
 return new Date().toISOString().slice(0, 10);
}

function extractKeywords(title, tags) {
 const stopWords = new Set([
 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
 'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
 'before', 'after', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet',
 'both', 'either', 'neither', 'each', 'every', 'all', 'any', 'few',
 'more', 'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same',
 'than', 'too', 'very', 'just', 'how', 'what', 'why', 'when', 'where',
 'who', 'which', 'this', 'that', 'these', 'those', 'i', 'me', 'my',
 'you', 'your', 'he', 'she', 'it', 'we', 'they', 'his', 'her', 'its',
 'our', 'their', 'about', 'up', 'out', 'if', 'then',
 ]);
 const titleWords = (title || '')
 .toLowerCase()
 .replace(/[^a-z0-9\s]/g, ' ')
 .split(/\s+/)
 .filter(w => w.length > 2 && !stopWords.has(w));
 const tagWords = (tags || [])
 .slice(0, 10)
 .map(t => t.toLowerCase().trim())
 .filter(t => t.length > 2);
 // Dedupe, title words first
 const seen = new Set();
 const result = [];
 for (const w of [...titleWords, ...tagWords]) {
 if (!seen.has(w)) { seen.add(w); result.push(w); }
 }
 return result.slice(0, 8);
}

// ─── Step 0: Parse Payload ──────────────────────────────────────────────────

async function parsePayload() {
 // Try --payload arg first
 const args = process.argv.slice(2);
 for (let i = 0; i < args.length; i++) {
 if (args[i] === '--payload' && args[i + 1]) {
 return JSON.parse(args[i + 1]);
 }
 }

 // Fall back to stdin (for webhook piping)
 if (!process.stdin.isTTY) {
 const chunks = [];
 for await (const chunk of process.stdin) {
 chunks.push(chunk);
 }
 const raw = Buffer.concat(chunks).toString('utf8').trim();
 if (raw) return JSON.parse(raw);
 }

 console.error('Error: No payload provided.');
 console.error('Usage: node orchestrate-thumbnail.mjs --payload \'{"videoUrl":"..."}\'');
 console.error(' or: echo \'{"videoUrl":"..."}\' | node orchestrate-thumbnail.mjs');
 process.exit(1);
}

// ─── Step 1: Extract Video Metadata ─────────────────────────────────────────

function extractVideoMetadata(videoUrl, outputDir) {
 log(1, `Extracting metadata for: ${videoUrl}`);
 const script = join(__dirname, 'extract-video-metadata.mjs');
 try {
 const raw = execSync(
 `node "${script}" --url "${videoUrl}" --download-thumbnail --output-dir "${outputDir}"`,
 { encoding: 'utf8', timeout: 60_000, stdio: ['pipe', 'pipe', 'pipe'] }
 );
 const metadata = JSON.parse(raw.trim());
 log(1, `Title: "${metadata.title}"`);
 log(1, `Tags: [${(metadata.tags || []).slice(0, 5).join(', ')}]`);
 log(1, `Categories: [${(metadata.categories || []).join(', ')}]`);
 log(1, `Views: ${(metadata.viewCount || 0).toLocaleString()}`);
 return metadata;
 } catch (e) {
 logError(1, `Metadata extraction failed: ${e.message}`);
 throw new Error(`Step 1 failed: ${e.message}`);
 }
}

// ─── Step 2: Auto-detect Niche & CTR Benchmark ─────────────────────────────

const NICHE_MAP = {
 'Gaming': { ctr: 8.5, keywords: ['gaming', 'game', 'gameplay', 'minecraft', 'fortnite', 'gta', 'cod', 'valorant', 'league', 'roblox', 'speedrun', 'playthrough', 'esports', 'twitch', 'stream'] },
 'Health & Fitness': { ctr: 8.0, keywords: ['fitness', 'workout', 'gym', 'health', 'diet', 'weight', 'muscle', 'nutrition', 'yoga', 'exercise', 'bodybuilding', 'running', 'keto', 'protein', 'cardio'] },
 'Tech & Reviews': { ctr: 7.5, keywords: ['tech', 'review', 'unboxing', 'iphone', 'android', 'laptop', 'pc', 'setup', 'build', 'gadget', 'samsung', 'apple', 'nvidia', 'gpu', 'cpu', 'software', 'app'] },
 'Beauty & Fashion': { ctr: 6.5, keywords: ['beauty', 'makeup', 'skincare', 'fashion', 'style', 'haul', 'grwm', 'outfit', 'nails', 'hair', 'tutorial', 'routine', 'aesthetic', 'vogue'] },
 'Entertainment': { ctr: 6.0, keywords: ['vlog', 'challenge', 'prank', 'react', 'reaction', 'funny', 'comedy', 'storytime', 'mukbang', 'drama', 'celebrity', 'movie', 'film', 'music', 'trailer'] },
 'Finance & Business': { ctr: 5.5, keywords: ['money', 'invest', 'stock', 'crypto', 'bitcoin', 'business', 'income', 'passive', 'finance', 'entrepreneur', 'startup', 'trading', 'wealth', 'budget', 'side hustle', 'dropshipping', 'affiliate'] },
 'Education': { ctr: 4.5, keywords: ['learn', 'tutorial', 'course', 'explain', 'science', 'math', 'history', 'study', 'school', 'university', 'lecture', 'lesson', 'education', 'teaching', 'how to'] },
};

function detectNiche(metadata) {
 log(2, 'Auto-detecting niche...');

 const category = ((metadata.categories || [])[0] || '').toLowerCase();
 const titleLower = (metadata.title || '').toLowerCase();
 const tagsLower = (metadata.tags || []).map(t => t.toLowerCase());
 const descLower = (metadata.description || '').toLowerCase().slice(0, 500);
 const corpus = `${titleLower} ${tagsLower.join(' ')} ${descLower} ${category}`;

 let bestNiche = 'Entertainment';
 let bestScore = 0;

 for (const [niche, config] of Object.entries(NICHE_MAP)) {
 let score = 0;
 for (const kw of config.keywords) {
 // Title match = 3 points, tag match = 2, description/category = 1
 if (titleLower.includes(kw)) score += 3;
 if (tagsLower.some(t => t.includes(kw))) score += 2;
 if (descLower.includes(kw) || category.includes(kw)) score += 1;
 }
 if (score > bestScore) {
 bestScore = score;
 bestNiche = niche;
 }
 }

 // YouTube category direct mapping as tiebreaker
 const categoryMap = {
 'gaming': 'Gaming', 'games': 'Gaming',
 'science & technology': 'Tech & Reviews', 'technology': 'Tech & Reviews',
 'howto & style': 'Beauty & Fashion',
 'sports': 'Health & Fitness',
 'education': 'Education',
 'entertainment': 'Entertainment',
 'comedy': 'Entertainment',
 'music': 'Entertainment',
 'news & politics': 'Finance & Business',
 };
 if (bestScore < 3 && categoryMap[category]) {
 bestNiche = categoryMap[category];
 }

 const ctrBenchmark = NICHE_MAP[bestNiche]?.ctr || 6.0;
 log(2, `Niche: ${bestNiche} (CTR benchmark: ${ctrBenchmark}%, score: ${bestScore})`);

 return { niche: bestNiche, ctrBenchmark };
}

// ─── Step 3: Fetch Competitor Thumbnails ────────────────────────────────────

function fetchCompetitorThumbnails(metadata, outputDir) {
 log(3, 'Fetching competitor thumbnails...');
 const keywords = extractKeywords(metadata.title, metadata.tags);
 const query = keywords.slice(0, 4).join(' ');
 const script = join(__dirname, 'fetch-competitor-thumbnails.mjs');

 try {
 const raw = execSync(
 `node "${script}" --query "${query}" --top 5 --min-views 10000 --output-dir "${outputDir}"`,
 { encoding: 'utf8', timeout: 180_000, stdio: ['pipe', 'pipe', 'pipe'] }
 );
 const manifest = JSON.parse(raw.trim());
 log(3, `Fetched ${manifest.length} competitor thumbnails`);
 return manifest;
 } catch (e) {
 logError(3, `Competitor fetch failed (non-fatal): ${e.message}`);
 return [];
 }
}

// ─── Step 4: Generate Thumbnail Prompt Concepts ─────────────────────────────

/**
 * Generate 4 genuinely different concept objects based on video metadata + niche.
 * Each concept varies: desire angle, composition, emotion, visual elements.
 */
function generateConceptPrompts(metadata, niche, payload) {
 log(4, 'Generating 4 concept prompts...');

 const title = metadata.title || 'YouTube Video';
 const keywords = extractKeywords(metadata.title, metadata.tags);
 const topic = keywords.slice(0, 3).join(' ');
 const textSide = payload.textSide || 'left';
 const personSide = textSide === 'left' ? 'right' : 'left';
 const accentColor = payload.accentColor || '#FF6B35';

 // Build topic-aware visual elements
 const topicSignals = analyzeTopicForVisuals(title, keywords, niche);

 // ── Color palettes per concept ──
 const palettes = [
 { accent: accentColor, desc: 'warm amber/orange tones' },
 { accent: '#3B82F6', desc: 'cool electric blue tones' },
 { accent: '#EF4444', desc: 'bold crimson red tones' },
 { accent: '#10B981', desc: 'sharp emerald green tones' },
 ];

 // ── Hook text generation ──
 const hookTexts = generateHookTexts(title, keywords, niche, payload.hookText);

 // ── 4 Concepts with genuinely different approaches ──
 const concepts = [
 // Concept A: END STATE — Show the aspirational result
 {
 conceptId: 'a',
 desireAngle: 'end_state',
 hookText: hookTexts[0],
 subText: topicSignals.subTexts[0] || '',
 accentColor: palettes[0].accent,
 textSide,
 emotion: 'confident',
 prompt: buildPrompt({
 personSide,
 emotion: 'confident, self-assured, slight knowing smile',
 lookDirection: 'directly at camera with commanding eye contact',
 background: `Dark, moody, cinematic environment. ${topicSignals.endStateScene}. ${palettes[0].desc}. Volumetric light from above casting dramatic shadows.`,
 visualElements: `${topicSignals.endStateVisuals}. Positioned on the ${textSide} side with slight depth-of-field blur.`,
 composition: 'Asymmetric composition with strong diagonal leading lines',
 }),
 },

 // Concept B: PROCESS — Show the method/journey
 {
 conceptId: 'b',
 desireAngle: 'process',
 hookText: hookTexts[1],
 subText: topicSignals.subTexts[1] || '',
 accentColor: palettes[1].accent,
 textSide,
 emotion: 'shocked',
 prompt: buildPrompt({
 personSide,
 emotion: 'genuinely shocked, eyebrows raised, mouth slightly open in surprise',
 lookDirection: `looking toward the ${textSide} side with wide eyes, as if seeing something incredible`,
 background: `Dark studio environment with ${palettes[1].desc}. ${topicSignals.processScene}. Subtle neon rim light from behind.`,
 visualElements: `${topicSignals.processVisuals}. Arranged in a dynamic, slightly floating layout on the ${textSide} side.`,
 composition: 'Centered symmetric composition with the person as the anchor point',
 }),
 },

 // Concept C: BEFORE→AFTER — Show transformation
 {
 conceptId: 'c',
 desireAngle: 'before_after',
 hookText: hookTexts[2],
 subText: topicSignals.subTexts[2] || '',
 accentColor: palettes[2].accent,
 textSide,
 emotion: 'curious',
 prompt: buildPrompt({
 personSide,
 emotion: 'curious, intrigued, one eyebrow slightly raised, playful intensity',
 lookDirection: 'angled slightly toward camera, chin tilted down with eyes looking up',
 background: `Split-feel cinematic backdrop — darker on one side fading to ${palettes[2].desc} highlights on the other. ${topicSignals.transformScene}. Gritty, editorial lighting.`,
 visualElements: `${topicSignals.transformVisuals}. Visual contrast between old/small on one edge and new/large on the other, on the ${textSide} side.`,
 composition: 'Split composition suggesting a before-and-after transformation',
 }),
 },

 // Concept D: PAIN POINT — Show the problem vividly
 {
 conceptId: 'd',
 desireAngle: 'pain_point',
 hookText: hookTexts[3],
 subText: topicSignals.subTexts[3] || '',
 accentColor: palettes[3].accent,
 textSide,
 emotion: 'serious',
 prompt: buildPrompt({
 personSide,
 emotion: 'dead serious, intense, slightly furrowed brow, no smile whatsoever',
 lookDirection: 'staring directly at camera with piercing, no-nonsense eye contact',
 background: `Dark, minimal, almost void-like background with a single focused ${palettes[3].desc} accent light. ${topicSignals.painScene}. Dramatic low-key lighting.`,
 visualElements: `${topicSignals.painVisuals}. Minimal, impactful — one or two striking objects on the ${textSide} side.`,
 composition: 'Minimalist composition with maximum negative space for impact',
 }),
 },
 ];

 for (const c of concepts) {
 log(4, ` Concept ${c.conceptId.toUpperCase()}: [${c.desireAngle}] "${c.hookText}" — ${c.emotion}`);
 }

 return concepts;
}

function buildPrompt({ personSide, emotion, lookDirection, background, visualElements, composition }) {
 return `A professional YouTube thumbnail background in 16:9 aspect ratio.

PERSON:
Use the likeness from the attached headshot. Place them on the ${personSide} side, occupying approximately 40% of the frame width. Shoulders-up framing. Dramatic directional lighting with strong contrast. Their expression is ${emotion}. They are ${lookDirection}.

BACKGROUND:
${background}

VISUAL ELEMENTS:
${visualElements}

COMPOSITION:
${composition}. Leave the bottom-right 120x30px area completely empty (YouTube timestamp zone).

Do NOT render any text, words, letters, or numbers anywhere in the image. The image must be purely visual — no overlays, no captions, no watermarks. Text will be added separately in post-production.`;
}

/**
 * Analyze the video topic and return scene/visual descriptions
 * tailored to what the video is actually about.
 */
function analyzeTopicForVisuals(title, keywords, niche) {
 const titleLower = title.toLowerCase();
 const kwSet = new Set(keywords.map(k => k.toLowerCase()));

 // ── Money / Finance / Business ──
 if (matchesAny(titleLower, kwSet, ['money', 'income', 'earn', 'rich', 'wealth', 'dollar', 'revenue', 'profit', 'cash', 'salary'])) {
 return {
 endStateScene: 'Luxurious modern penthouse view through floor-to-ceiling windows at night, city lights below',
 endStateVisuals: 'Floating holographic dollar signs, gold coins cascading, a sleek laptop showing an upward graph',
 processScene: 'A dark command-center style desk setup with multiple glowing monitors',
 processVisuals: 'Glowing dashboards, analytics charts with upward arrows, stacks of organized documents',
 transformScene: 'Transition from a cramped dim room to an expansive bright modern office',
 transformVisuals: 'A small piggy bank on one side contrasted with gold bars on the other',
 painScene: 'A dark, oppressive atmosphere suggesting financial stress',
 painVisuals: 'A cracked phone screen showing a declining graph, empty wallet, alarm clock showing 5 AM',
 subTexts: ['the blueprint', 'step by step', 'real numbers', 'stop this now'],
 };
 }

 // ── AI / Technology / Automation ──
 if (matchesAny(titleLower, kwSet, ['ai', 'artificial', 'chatgpt', 'gpt', 'automation', 'automate', 'robot', 'machine learning', 'neural', 'prompt'])) {
 return {
 endStateScene: 'Futuristic control room with holographic displays and neural network visualizations floating in air',
 endStateVisuals: 'Glowing AI brain network, holographic interfaces, futuristic robot assistant silhouette',
 processScene: 'Dark tech lab with multiple screens showing code and AI training progress',
 processVisuals: 'Neural network diagrams glowing in neon, a terminal with streaming code, connected nodes',
 transformScene: 'Shift from manual paper-cluttered desk to sleek automated digital workspace',
 transformVisuals: 'Old typewriter on one side, futuristic holographic keyboard on the other',
 painScene: 'Dark scene suggesting being left behind by technology',
 painVisuals: 'A ticking countdown clock, a "replaced" stamp graphic, competitors racing ahead as silhouettes',
 subTexts: ['with AI', 'full tutorial', 'before vs after', 'wake up call'],
 };
 }

 // ── Fitness / Health / Body ──
 if (matchesAny(titleLower, kwSet, ['fitness', 'workout', 'muscle', 'gym', 'body', 'weight', 'diet', 'abs', 'bulk', 'cut', 'lean', 'protein'])) {
 return {
 endStateScene: 'Professional gym environment with dramatic overhead spotlights and chalk dust in the air',
 endStateVisuals: 'Heavy barbell with weight plates, protein shake, a visible transformation progress chart',
 processScene: 'Gritty gym floor with rubber mats, iron weights, and sweat-stained equipment',
 processVisuals: 'Dumbbells, resistance bands, a meal prep container with perfectly portioned food',
 transformScene: 'Side-by-side transformation feel — soft unfocused body on one side, chiseled definition on the other',
 transformVisuals: 'A measuring tape, a scale showing dramatic numbers, before/after body silhouettes',
 painScene: 'Dimly lit bedroom with an alarm clock, suggesting the struggle of waking up early',
 painVisuals: 'A broken mirror, junk food wrappers, a dusty unused gym membership card',
 subTexts: ['no excuses', 'full program', 'the results', 'hard truth'],
 };
 }

 // ── Gaming ──
 if (matchesAny(titleLower, kwSet, ['game', 'gaming', 'gameplay', 'play', 'minecraft', 'fortnite', 'gta', 'cod', 'valorant', 'console', 'controller'])) {
 return {
 endStateScene: 'Epic gaming setup with RGB lighting, ultrawide monitor, and a dark room glowing with screen light',
 endStateVisuals: 'A gaming controller glowing with neon light, a victory screen, trophy or crown graphic',
 processScene: 'Intense gaming session atmosphere with screen reflections on the face',
 processVisuals: 'Multiple gaming screens, a headset, action-packed game scene bleeding out of the monitor',
 transformScene: 'From a basic laptop setup to a full RGB battlestation',
 transformVisuals: 'A basic mouse vs a pro gaming mouse, rank badges showing progression',
 painScene: 'Dark room with a "DEFEATED" screen glow casting red light',
 painVisuals: 'A broken controller, a rage-quit scene, a ban hammer graphic',
 subTexts: ['insane strat', 'watch this', 'glow up', 'never again'],
 };
 }

 // ── Education / Tutorial / How-to ──
 if (matchesAny(titleLower, kwSet, ['learn', 'tutorial', 'beginner', 'guide', 'course', 'explain', 'tips', 'tricks', 'hack', 'secret'])) {
 return {
 endStateScene: 'Clean modern workspace with a single focused light beam, suggesting mastery and clarity',
 endStateVisuals: 'A glowing lightbulb moment, organized mind-map floating in 3D, a finished masterpiece',
 processScene: 'Study desk with organized notebooks, highlighted pages, and a focused screen',
 processVisuals: 'Step-by-step arrows glowing in sequence, a checklist with items being checked off',
 transformScene: 'From confused chaos (scattered papers) to organized clarity (neat digital dashboard)',
 transformVisuals: 'A question mark dissolving into an exclamation mark, tangled wires becoming clean cables',
 painScene: 'Overwhelming mess of information, tabs, and notifications',
 painVisuals: 'A browser with 50 tabs open, a confused face emoji, a clock running out',
 subTexts: ['fast method', 'step by step', 'finally clear', 'avoid this'],
 };
 }

 // ── Default / Entertainment / General ──
 return {
 endStateScene: 'Cinematic dark studio with dramatic spotlighting and atmospheric haze',
 endStateVisuals: `Iconic visual elements related to "${keywords.slice(0, 2).join(' ')}", floating with a slight glow effect`,
 processScene: 'Dark, moody environment with multiple light sources creating depth and dimension',
 processVisuals: `Objects and tools associated with "${keywords.slice(0, 2).join(' ')}", arranged in an editorial style`,
 transformScene: 'Gradient backdrop shifting from dark/cold tones on one side to warm/bright on the other',
 transformVisuals: `A visual metaphor showing transformation in the "${keywords.slice(0, 2).join(' ')}" space`,
 painScene: 'Stark, dark, minimal backdrop with a single harsh overhead light',
 painVisuals: `A broken or failing version of something related to "${keywords.slice(0, 2).join(' ')}"`,
 subTexts: ['the truth', 'watch this', 'game changer', 'stop now'],
 };
}

function matchesAny(titleLower, kwSet, targets) {
 for (const t of targets) {
 if (titleLower.includes(t) || kwSet.has(t)) return true;
 }
 return false;
}

/**
 * Generate 4 different hook texts (max 3 words each).
 * If user provided hookText, use it for concept A.
 */
function generateHookTexts(title, keywords, niche, userHookText) {
 const titleLower = title.toLowerCase();

 // Template banks per desire angle
 const endStateTemplates = [
 'BASICALLY CHEATING', 'THIS CHANGES EVERYTHING', 'GAME OVER',
 'UNLIMITED POWER', 'PURE GOLD', 'THE BLUEPRINT', 'FINALLY FREE',
 ];
 const processTemplates = [
 'WATCH THIS', 'FULL BREAKDOWN', 'STEP BY STEP', 'HOW I DID',
 'THE METHOD', 'COPY THIS', 'DO THIS NOW',
 ];
 const transformTemplates = [
 'BEFORE VS AFTER', 'INSANE RESULTS', 'THE GLOW UP', 'ZERO TO HERO',
 'NIGHT AND DAY', 'TOTAL SHIFT', 'UNRECOGNIZABLE',
 ];
 const painTemplates = [
 'STOP THIS NOW', 'HUGE MISTAKE', 'YOURE WRONG', 'HARD TRUTH',
 'WAKE UP', 'NOT GONNA WORK', 'RIP',
 ];

 // Pick contextually — favor terms that relate to the title
 const pick = (templates) => {
 // Simple heuristic: pick a template that shares a word with the title, else random
 for (const t of templates) {
 const words = t.toLowerCase().split(' ');
 if (words.some(w => titleLower.includes(w) && w.length > 3)) return t;
 }
 return templates[Math.floor(Math.random() * templates.length)];
 };

 const hooks = [
 userHookText || pick(endStateTemplates),
 pick(processTemplates),
 pick(transformTemplates),
 pick(painTemplates),
 ];

 // Enforce max 3 words
 return hooks.map(h => {
 const words = h.trim().split(/\s+/).slice(0, 3);
 return words.join(' ').toUpperCase();
 });
}

// ─── Step 5: Generate Backgrounds (4x parallel) ────────────────────────────

async function generateBackgrounds(concepts, competitorManifest, headshotPath, workDir) {
 log(5, 'Generating 4 backgrounds in parallel...');

 const script = join(__dirname, 'generate-thumbnail-bg.mjs');
 const examplePaths = (competitorManifest || [])
 .map(c => c.path)
 .filter(p => existsSync(p))
 .slice(0, 3);

 const examplesArg = examplePaths.length > 0
 ? `--examples ${examplePaths.map(p => `"${p}"`).join(' ')}`
 : '';

 const results = await Promise.allSettled(
 concepts.map(concept => {
 const outputPath = join(workDir, `bg-${concept.conceptId}.png`);
 return new Promise((resolve, reject) => {
 const cmd = `node "${script}" --headshot "${headshotPath}" ${examplesArg} --prompt "${concept.prompt.replace(/"/g, '\\"')}" --output "${outputPath}"`;
 try {
 execSync(cmd, {
 encoding: 'utf8',
 timeout: 180_000,
 stdio: ['pipe', 'pipe', 'pipe'],
 maxBuffer: 50 * 1024 * 1024,
 });
 log(5, ` bg-${concept.conceptId}.png generated`);
 resolve({ conceptId: concept.conceptId, path: outputPath, success: true });
 } catch (e) {
 logError(5, ` bg-${concept.conceptId}.png FAILED: ${e.message}`);
 reject({ conceptId: concept.conceptId, error: e.message, success: false });
 }
 });
 })
 );

 return results.map(r => {
 if (r.status === 'fulfilled') return r.value;
 return r.reason || { conceptId: '?', error: 'Unknown error', success: false };
 });
}

// ─── Step 6: Remotion renderStill Placeholder ───────────────────────────────

function remotionRenderPlaceholder(concepts, bgResults, workDir) {
 log(6, 'Remotion renderStill — PLACEHOLDER (Remotion not yet configured)');

 const renderProps = concepts.map(concept => {
 const bgResult = bgResults.find(r => r.conceptId === concept.conceptId);
 const bgPath = bgResult?.success ? bgResult.path : null;

 const props = {
 backgroundSrc: bgPath || `bg-${concept.conceptId}.png`,
 hookText: concept.hookText.replace(/\s+/g, '\n'),
 subText: concept.subText || '',
 accentColor: concept.accentColor,
 textSide: concept.textSide,
 vignette: true,
 accentGlow: true,
 };

 const outputPath = join(workDir, `thumbnail-${concept.conceptId}.png`);

 log(6, ` [placeholder] Concept ${concept.conceptId.toUpperCase()}:`);
 log(6, ` backgroundSrc: ${props.backgroundSrc}`);
 log(6, ` hookText: "${concept.hookText}"`);
 log(6, ` accentColor: ${props.accentColor}`);
 log(6, ` output: ${outputPath}`);

 // TODO: When Remotion is configured in the project:
 // import { renderStill } from '@remotion/renderer';
 // import { bundle } from '@remotion/bundler';
 //
 // const bundled = await bundle({
 // entryPoint: join(__dirname, 'remotion', 'index.tsx'),
 // });
 //
 // await renderStill({
 // composition: 'YTThumbnail',
 // serveUrl: bundled,
 // output: outputPath,
 // inputProps: props,
 // imageFormat: 'png',
 // chromiumOptions: { enableMultiProcessOnLinux: true },
 // });

 return {
 conceptId: concept.conceptId,
 outputPath,
 inputProps: props,
 status: 'placeholder',
 };
 });

 return renderProps;
}

// ─── Step 7: Generate Result Summary ────────────────────────────────────────

function generateResultSummary(payload, metadata, niche, ctrBenchmark, concepts, bgResults, remotionResults, workDir) {
 log(7, 'Generating result summary...');

 const orderId = randomUUID();
 const hasAllBackgrounds = bgResults.every(r => r.success);
 const successfulBgs = bgResults.filter(r => r.success).length;

 const result = {
 orderId,
 videoUrl: payload.videoUrl,
 videoTitle: metadata.title,
 videoId: metadata.videoId,
 channel: metadata.channel,
 niche,
 ctrBenchmark: `${ctrBenchmark}%`,
 concepts: concepts.map(concept => {
 const bg = bgResults.find(r => r.conceptId === concept.conceptId);
 const remotion = remotionResults.find(r => r.conceptId === concept.conceptId);
 return {
 conceptId: concept.conceptId,
 desireAngle: concept.desireAngle,
 hookText: concept.hookText,
 subText: concept.subText,
 accentColor: concept.accentColor,
 textSide: concept.textSide,
 emotion: concept.emotion,
 backgroundPath: bg?.success ? bg.path : null,
 backgroundStatus: bg?.success ? 'generated' : 'failed',
 thumbnailPath: remotion?.outputPath || null,
 thumbnailStatus: remotion?.status || 'not_rendered',
 remotionProps: remotion?.inputProps || null,
 };
 }),
 status: hasAllBackgrounds ? 'backgrounds_generated' : `partial_${successfulBgs}_of_4`,
 backgroundsGenerated: successfulBgs,
 remotionStatus: 'placeholder_only',
 email: payload.email,
 timestamp: new Date().toISOString(),
 workspaceDir: workDir,
 };

 const resultPath = join(workDir, 'result.json');
 mkdirSync(workDir, { recursive: true });
 writeFileSync(resultPath, JSON.stringify(result, null, 2));
 log(7, `Result written to: ${resultPath}`);
 log(7, `Order ID: ${orderId}`);
 log(7, `Status: ${result.status}`);

 return result;
}

// ─── Step 8: Email Notification Placeholder ─────────────────────────────────

function emailNotificationPlaceholder(payload, result) {
 log(8, `[email] Would send results to ${payload.email}`);
 log(8, `[email] Subject: "Your YouTube thumbnails are ready — Order ${result.orderId.slice(0, 8)}"`);
 log(8, `[email] Body: ${result.backgroundsGenerated} thumbnail backgrounds generated for "${result.videoTitle}"`);
 log(8, '[email] (Gmail MCP will be wired up later)');
}

// ─── Headshot Resolution ────────────────────────────────────────────────────

function resolveHeadshot(payload) {
 // If payload contains base64 headshot, write it to a temp file
 if (payload.headshot && payload.headshot.length > 100) {
 const headshotDir = join(__dirname, '..', 'assets', 'headshots');
 mkdirSync(headshotDir, { recursive: true });
 const headshotPath = join(headshotDir, `webhook-${Date.now()}.png`);
 const buffer = Buffer.from(payload.headshot, 'base64');
 writeFileSync(headshotPath, buffer);
 log(0, `Headshot saved from payload: ${headshotPath}`);
 return headshotPath;
 }

 // Search known headshot locations
 const candidates = [
 join(__dirname, '..', 'assets', 'headshots'),
 ];

 for (const dir of candidates) {
 if (!existsSync(dir)) continue;
 try {
 const files = execSync(`ls "${dir}"`, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
 const image = files.find(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
 if (image) {
 const p = join(dir, image);
 log(0, `Headshot found: ${p}`);
 return p;
 }
 } catch { /* ignore */ }
 }

 // Fallback: UGC Pipeline character
 const ugcFallback = join(
 process.env.HOME || process.env.USERPROFILE || '',
 '.gemini', 'antigravity', 'rag-assets', 'profilfoto-ki', 'Startframe.png'
 );
 if (existsSync(ugcFallback)) {
 log(0, `Headshot fallback: ${ugcFallback}`);
 return ugcFallback;
 }

 return null;
}

// ─── Main Pipeline ──────────────────────────────────────────────────────────

async function main() {
 const startTime = Date.now();
 console.error('='.repeat(60));
 console.error(' YouTube Thumbnail Orchestrator');
 console.error('='.repeat(60));

 // ── Parse payload ──
 const payload = await parsePayload();
 if (!payload.videoUrl) {
 console.error('Error: "videoUrl" is required in payload');
 process.exit(1);
 }
 log(0, `Video URL: ${payload.videoUrl}`);
 log(0, `Email: ${payload.email || 'not provided'}`);

 // ── Resolve workspace directory ──
 const dateStr = today();

 // ── Step 1: Extract metadata ──
 let metadata;
 const metadataDir = join('workspace', dateStr, 'metadata');
 try {
 metadata = extractVideoMetadata(payload.videoUrl, metadataDir);
 } catch (e) {
 console.error(`FATAL: ${e.message}`);
 process.exit(1);
 }

 const slug = slugify(metadata.title || metadata.videoId || 'unknown');
 const workDir = join('workspace', dateStr, 'thumbnails', slug);
 mkdirSync(workDir, { recursive: true });
 log(0, `Workspace: ${workDir}`);

 // ── Step 2: Detect niche ──
 const { niche, ctrBenchmark } = detectNiche(metadata);

 // ── Step 3: Fetch competitor thumbnails ──
 const competitorDir = join('workspace', dateStr, 'examples');
 const competitors = fetchCompetitorThumbnails(metadata, competitorDir);

 // ── Step 4: Generate 4 concept prompts ──
 const concepts = generateConceptPrompts(metadata, niche, payload);

 // ── Step 5: Generate backgrounds ──
 const headshotPath = resolveHeadshot(payload);
 let bgResults = [];

 if (headshotPath) {
 bgResults = await generateBackgrounds(concepts, competitors, headshotPath, workDir);
 } else {
 logError(5, 'No headshot found — skipping background generation.');
 logError(5, 'Provide "headshot" as base64 in payload, or place an image in assets/headshots/');
 bgResults = concepts.map(c => ({ conceptId: c.conceptId, success: false, error: 'No headshot available' }));
 }

 // ── Step 6: Remotion placeholder ──
 const remotionResults = remotionRenderPlaceholder(concepts, bgResults, workDir);

 // ── Step 7: Result summary ──
 const result = generateResultSummary(
 payload, metadata, niche, ctrBenchmark,
 concepts, bgResults, remotionResults, workDir
 );

 // ── Step 8: Email placeholder ──
 if (payload.email) {
 emailNotificationPlaceholder(payload, result);
 }

 // ── Done ──
 const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
 console.error('');
 console.error('='.repeat(60));
 console.error(` Pipeline complete in ${elapsed}s`);
 console.error(` Order: ${result.orderId}`);
 console.error(` Status: ${result.status}`);
 console.error(` Backgrounds: ${result.backgroundsGenerated}/4`);
 console.error(` Workspace: ${workDir}`);
 console.error('='.repeat(60));

 // Machine-readable output to stdout
 console.log(JSON.stringify(result, null, 2));
}

main().catch(e => {
 console.error(`FATAL: ${e.message}`);
 console.error(e.stack);
 process.exit(1);
});
