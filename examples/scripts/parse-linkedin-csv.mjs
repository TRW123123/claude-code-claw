#!/usr/bin/env node
/**
 * Parst die LinkedIn-Posts CSV korrekt (inkl. mehrzeiliger Felder)
 * und gibt eine saubere Analyse-Tabelle aus.
 */
import { readFileSync } from 'fs';

const csvPath = 'C:/Users/User/Downloads/dataset_linkedin-profile-posts_2026-04-01_08-31-49-485.csv';
const raw = readFileSync(csvPath, 'utf-8');

// CSV mit quoted fields korrekt parsen
function parseCSV(text) {
  const rows = [];
  let current = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++; // skip escaped quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        current.push(field);
        field = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        current.push(field);
        field = '';
        if (current.length > 1) rows.push(current);
        current = [];
        if (ch === '\r') i++; // skip \n after \r
      } else {
        field += ch;
      }
    }
  }
  // last row
  if (field || current.length > 0) {
    current.push(field);
    if (current.length > 1) rows.push(current);
  }
  return rows;
}

const rows = parseCSV(raw);
const headers = rows[0];
const data = rows.slice(1);

// Spalten-Indizes finden
function col(name) {
  const idx = headers.indexOf(name);
  if (idx === -1) {
    // Fuzzy match
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] && headers[i].includes(name)) return i;
    }
  }
  return idx;
}

const iCommentary = col('commentary');
const iLikes = col('engagement/likes');
const iComments = col('engagement/comments');
const iShares = col('engagement/shares');
const iDate = col('postedAt/date');
const iTimestamp = col('postedAt/timestamp');
const iPostId = col('postId');
const iShareUrn = col('shareUrn');
const iRepostId = col('repostId');
const iRepostAuthor = col('repost/author/name');
const iArticleTitle = col('article/title');
const iArticleLink = col('article/link');
const iNewsletterTitle = col('newsletterTitle');
const iVideo = col('postVideo/videoUrl');
const iReactionType0 = col('engagement/reactions/0/type');
const iReactionCount0 = col('engagement/reactions/0/count');
const iReactionType1 = col('engagement/reactions/1/type');
const iReactionCount1 = col('engagement/reactions/1/count');
const iImages0 = col('postImages/0/url');
const iEdited = col('edited');
const iHeaderText = col('header/text');

console.log(`Gefundene Spalten: commentary=${iCommentary}, likes=${iLikes}, comments=${iComments}, shares=${iShares}, date=${iDate}, postId=${iPostId}, repostId=${iRepostId}`);
console.log(`Total Rows (ohne Header): ${data.length}\n`);

const posts = [];

for (const row of data) {
  const commentary = (row[iCommentary] || '').trim();
  const likes = parseInt(row[iLikes]) || 0;
  const comments = parseInt(row[iComments]) || 0;
  const shares = parseInt(row[iShares]) || 0;
  const date = row[iDate] || '';
  const timestamp = parseInt(row[iTimestamp]) || 0;
  const postId = row[iPostId] || '';
  const shareUrn = row[iShareUrn] || '';
  const repostId = row[iRepostId] || '';
  const repostAuthor = row[iRepostAuthor] || '';
  const articleTitle = row[iArticleTitle] || '';
  const articleLink = row[iArticleLink] || '';
  const newsletterTitle = row[iNewsletterTitle] || '';
  const hasVideo = !!(row[iVideo] || '').trim();
  const hasImages = !!(row[iImages0] || '').trim();
  const edited = row[iEdited] || '';
  const headerText = row[iHeaderText] || '';

  // Reactions breakdown
  const reactions = {};
  if (row[iReactionType0]) reactions[row[iReactionType0]] = parseInt(row[iReactionCount0]) || 0;
  if (row[iReactionType1]) reactions[row[iReactionType1]] = parseInt(row[iReactionCount1]) || 0;

  const isRepost = !!repostId;
  const hook = commentary.split('\n')[0].substring(0, 80);

  // Sprache erkennen
  let lang = 'TR';
  if (/[äöüß]|Hashtag#KI |Hashtag#K[üu]nstliche/.test(commentary) || /^(Alle sprechen|Habt ihr|Warum|Wie |Es gibt|Die |Stellen|Vergessen|ChatGPT ist|Können|Rückblick|China|Vor der)/.test(commentary)) lang = 'DE';
  if (/^(Your |🧠 Knowledge|💡 ChatGPT|📧 Your|🚀 ChatGPT)/.test(commentary)) lang = 'EN';

  // Typ erkennen
  let type = 'post';
  if (isRepost) type = 'repost';
  else if (newsletterTitle) type = 'newsletter';
  else if (hasVideo) type = 'video';
  else if (articleTitle || articleLink) type = 'article';
  else if (headerText && (headerText.includes('Neue Position') || headerText.includes('new position') || headerText.includes('neuen Job'))) type = 'job-announcement';
  else if (hasImages) type = 'image-post';

  posts.push({
    date, timestamp, hook, likes, comments, shares, lang, type,
    isRepost, postId, shareUrn, articleTitle, newsletterTitle,
    hasVideo, hasImages, edited: edited === 'true', reactions,
    textLength: commentary.length,
  });
}

// Sortieren nach Datum (neueste zuerst)
posts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

// Impressionen aus dem Screenshot manuell zuordnen (da nicht in CSV)
// Die CSV enthält likes/comments/shares aber KEINE Impressionen
// Impressionen kommen aus dem manuell kopierten LinkedIn-Feed

console.log('='.repeat(120));
console.log('VOLLSTÄNDIGE POST-LISTE (neueste zuerst)');
console.log('='.repeat(120));
console.log('#  | Datum       | Likes | Comm | Shares | Lang | Typ            | Hook');
console.log('-'.repeat(120));

let totalPosts = 0;
let totalReposts = 0;
let totalLikes = 0;
let totalComments = 0;
let totalShares = 0;

const byLang = {};
const byType = {};

posts.forEach((p, i) => {
  const num = String(i + 1).padStart(2);
  const date = (p.date || 'n/a').padEnd(11);
  const likes = String(p.likes).padStart(5);
  const comm = String(p.comments).padStart(4);
  const shares = String(p.shares).padStart(6);
  const lang = p.lang.padEnd(4);
  const type = (p.isRepost ? 'REPOST' : p.type).padEnd(14);
  const hook = p.hook || '(kein Text)';

  console.log(`${num} | ${date} | ${likes} | ${comm} | ${shares} | ${lang} | ${type} | ${hook}`);

  if (p.isRepost) {
    totalReposts++;
  } else {
    totalPosts++;
    totalLikes += p.likes;
    totalComments += p.comments;
    totalShares += p.shares;

    // Stats nach Sprache
    if (!byLang[p.lang]) byLang[p.lang] = { count: 0, likes: 0, comments: 0, shares: 0 };
    byLang[p.lang].count++;
    byLang[p.lang].likes += p.likes;
    byLang[p.lang].comments += p.comments;
    byLang[p.lang].shares += p.shares;

    // Stats nach Typ
    if (!byType[p.type]) byType[p.type] = { count: 0, likes: 0, comments: 0, shares: 0 };
    byType[p.type].count++;
    byType[p.type].likes += p.likes;
    byType[p.type].comments += p.comments;
    byType[p.type].shares += p.shares;
  }
});

console.log('\n' + '='.repeat(80));
console.log('ZUSAMMENFASSUNG');
console.log('='.repeat(80));
console.log(`Eigene Posts: ${totalPosts} | Reposts: ${totalReposts} | Total: ${posts.length}`);
console.log(`Gesamt-Likes: ${totalLikes} | Gesamt-Comments: ${totalComments} | Gesamt-Shares: ${totalShares}`);
console.log(`Durchschnitt pro Post: ${(totalLikes/totalPosts).toFixed(1)} Likes, ${(totalComments/totalPosts).toFixed(1)} Comments, ${(totalShares/totalPosts).toFixed(1)} Shares`);

console.log('\n--- Nach Sprache ---');
for (const [lang, s] of Object.entries(byLang)) {
  console.log(`${lang}: ${s.count} Posts, Avg ${(s.likes/s.count).toFixed(1)} Likes, ${(s.comments/s.count).toFixed(1)} Comments`);
}

console.log('\n--- Nach Typ ---');
for (const [type, s] of Object.entries(byType).sort((a,b) => b[1].likes/b[1].count - a[1].likes/a[1].count)) {
  console.log(`${type.padEnd(16)}: ${String(s.count).padStart(3)} Posts, Avg ${(s.likes/s.count).toFixed(1)} Likes, ${(s.comments/s.count).toFixed(1)} Comments`);
}

// Top 10 nach Likes
console.log('\n--- TOP 10 nach Likes ---');
const ownPosts = posts.filter(p => !p.isRepost);
ownPosts.sort((a, b) => b.likes - a.likes);
ownPosts.slice(0, 10).forEach((p, i) => {
  console.log(`${i+1}. ${p.likes} Likes | ${p.comments} Comm | ${p.lang} | ${p.type.padEnd(14)} | ${p.hook}`);
});

// Bottom 10 nach Likes (eigene Posts mit Text)
console.log('\n--- BOTTOM 10 nach Likes ---');
const withText = ownPosts.filter(p => p.hook && p.hook !== '(kein Text)');
withText.sort((a, b) => a.likes - b.likes);
withText.slice(0, 10).forEach((p, i) => {
  console.log(`${i+1}. ${p.likes} Likes | ${p.comments} Comm | ${p.lang} | ${p.type.padEnd(14)} | ${p.hook}`);
});

// Textlängen-Analyse
console.log('\n--- Textlänge vs Engagement ---');
const buckets = [
  { label: 'Kurz (0-500)', min: 0, max: 500 },
  { label: 'Mittel (500-1200)', min: 500, max: 1200 },
  { label: 'Lang (1200-2000)', min: 1200, max: 2000 },
  { label: 'Sehr lang (2000+)', min: 2000, max: 99999 },
];
for (const b of buckets) {
  const bucket = ownPosts.filter(p => p.textLength >= b.min && p.textLength < b.max);
  if (bucket.length === 0) continue;
  const avgLikes = (bucket.reduce((s, p) => s + p.likes, 0) / bucket.length).toFixed(1);
  const avgComm = (bucket.reduce((s, p) => s + p.comments, 0) / bucket.length).toFixed(1);
  console.log(`${b.label.padEnd(22)}: ${bucket.length} Posts, Avg ${avgLikes} Likes, ${avgComm} Comments`);
}
