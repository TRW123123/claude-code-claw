#!/usr/bin/env node
/**
 * Parst die LinkedIn CSV + matched Impressions aus manuellen Daten
 * Gibt INSERT-SQL-Statements aus die direkt in Supabase ausgefuehrt werden koennen.
 */
import { readFileSync } from 'fs';

const csvPath = process.env.LINKEDIN_CSV_PATH || './linkedin-posts.csv';
const raw = readFileSync(csvPath, 'utf-8');

// CSV Parser (handles quoted multiline fields)
function parseCSV(text) {
 const rows = [];
 let current = [];
 let field = '';
 let inQuotes = false;

 for (let i = 0; i < text.length; i++) {
 const ch = text[i];
 const next = text[i + 1];
 if (inQuotes) {
 if (ch === '"' && next === '"') { field += '"'; i++; }
 else if (ch === '"') { inQuotes = false; }
 else { field += ch; }
 } else {
 if (ch === '"') { inQuotes = true; }
 else if (ch === ',') { current.push(field); field = ''; }
 else if (ch === '\n' || (ch === '\r' && next === '\n')) {
 current.push(field); field = '';
 if (current.length > 1) rows.push(current);
 current = [];
 if (ch === '\r') i++;
 } else { field += ch; }
 }
 }
 if (field || current.length > 0) { current.push(field); if (current.length > 1) rows.push(current); }
 return rows;
}

const rows = parseCSV(raw);
const headers = rows[0];
const data = rows.slice(1);

function col(name) {
 const idx = headers.indexOf(name);
 if (idx >= 0) return idx;
 for (let i = 0; i < headers.length; i++) {
 if (headers[i]?.includes(name)) return i;
 }
 return -1;
}

const iCommentary = col('commentary');
const iLikes = col('engagement/likes');
const iComments = col('engagement/comments');
const iShares = col('engagement/shares');
const iDate = col('postedAt/date');
const iTimestamp = col('postedAt/timestamp');
const iShareUrn = col('shareUrn');
const iRepostId = col('repostId');
const iArticleTitle = col('article/title');
const iNewsletterTitle = col('newsletterTitle');
const iVideo = col('postVideo/videoUrl');
const iImages0 = col('postImages/0/url');

// Impressions from manual LinkedIn UI scrape (matched by hook text).
// Populate from your own data — pattern: { 'first words of post': impression_count }.
const impressionsMap = {
 // 'Example hook': 1000,
};

function matchImpressions(text) {
 for (const [hook, impressions] of Object.entries(impressionsMap)) {
 if (text.includes(hook)) return impressions;
 }
 return null;
}

// Build post objects
const posts = [];
for (const row of data) {
 const commentary = (row[iCommentary] || '').trim();
 const likes = parseInt(row[iLikes]) || 0;
 const comments = parseInt(row[iComments]) || 0;
 const shares = parseInt(row[iShares]) || 0;
 const date = row[iDate] || '';
 const timestamp = parseInt(row[iTimestamp]) || 0;
 const shareUrn = (row[iShareUrn] || '').trim();
 const repostId = (row[iRepostId] || '').trim();
 const articleTitle = (row[iArticleTitle] || '').trim();
 const newsletterTitle = (row[iNewsletterTitle] || '').trim();
 const hasVideo = !!(row[iVideo] || '').trim();

 if (repostId) continue; // skip reposts
 if (!date || !shareUrn) continue; // skip rows without date/urn
 if (!commentary && likes === 0) continue; // skip empty

 const impressions = matchImpressions(commentary);

 // Determine pillar
 let pillar = 'manual';
 if (newsletterTitle) pillar = 'newsletter';
 else if (hasVideo) pillar = 'video';
 else if (articleTitle) pillar = 'article';

 const hook = commentary.split('\n')[0]?.substring(0, 120) || '';
 const charCount = commentary.length;

 posts.push({
 shareUrn,
 pillar,
 text: commentary,
 charCount,
 hook,
 source: 'import',
 isReference: true,
 postedAt: date,
 likes,
 comments,
 shares,
 impressions,
 });
}

// Output as JSON for Supabase import
console.log(JSON.stringify(posts, null, 2));
console.error(`\nTotal: ${posts.length} posts ready for import`);
console.error(`With impressions: ${posts.filter(p => p.impressions).length}`);
console.error(`Without impressions: ${posts.filter(p => !p.impressions).length}`);
