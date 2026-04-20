#!/usr/bin/env node
/**
 * Parst die LinkedIn CSV + matched Impressions aus manuellen Daten
 * Gibt INSERT-SQL-Statements aus die direkt in Supabase ausgefuehrt werden koennen.
 */
import { readFileSync } from 'fs';

const csvPath = 'C:/Users/User/Downloads/dataset_linkedin-profile-posts_2026-04-01_08-31-49-485.csv';
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

// Impressions from manual LinkedIn UI scrape (matched by hook text)
const impressionsMap = {
  'Bu sabah hiçbir şey yapmadan': 36,
  'Claude tüm satış ekibimi': 177,
  'Yapay zeka ile yapılan en büyük hata': 98,
  'Geçtiğimiz hafta sonu OpenAI': 94,
  'Satış ekiplerinin size söylediği': 118,
  'Bugüne kadar ChatGPT\'ye yazdığınız': 239,
  'Ocak 2026, ABD\'de finans kriz': 231,
  'Türkiye, Yapay Zekaya İlk Yasal': 169,
  'Avrupa\'da satış, Türk usulü': 210,
  'TEI\'den Tam AI ve Bulut': 115,
  'Kurumsal tanıtım videoları': 176,
  'Bugün, URCU Group': 286,
  'Türkiye 7. Eğitim Teknolojileri': 55,
  'TEI, Türkiye\'nin kritik savunma sanayii': 122,
  'TEI\'den Türkiye\'de büyük sarsıntı': 118,
  'TEI\'den Şok Karar': 96,
  'Türkiye\'den kritik AI kararı: TEI': 101,
  'Borsa İstanbul\'da Manipülasyona': 107,
  'Türkiye\'nin kritik savunma sanayisi firması TEI': 90,
  'Türkiye\'nin yerli yapay zekâ modeli': 116,
  'Türkiye\'den tarihi bir hukuk adımı': 95,
  'AI Türkiye\'de işlerin kaderini': 91,
  'Yapay Zekâ Türkiye\'de Yeni Bir Döneme': 195,
  'Dünyanın en iyi gökbilimcileri': 428,
  'Yapay zeka kapatılacağını öğrenince': 338,
  'Gelen kutunda e-posta seli': 277,
  'Kulağa gerçek geliyor': 346,
  'Yapay zeka konusunda fit olduğunu': 151,
  'ChatGPT\'yi kullanmak bir şey': 414,
  'Üretken Yapay Zekaya Yapılan': 170,
  'Dünya genelinde yapay zekaya tam 252': 223,
  'Yarın önemli bir toplantın': 206,
  'Daha büyük bir ekibe ihtiyacın yok': 98,
  'Your AI-generated emails': 241,
  'ChatGPT\'s new GPT-4o': 77,
  'Knowledge was never expensive': 180,
  'China führt KI als Pflichtfach': 352,
  'Wie viele Stunden sparst du': 256,
  'Es gibt Veränderungen': 151,
  'Habt ihr auch das Gefühl': 455,
  'Kannst du einfach Bilder': 222,
  'Warum nutzen so viele noch': 163,
  'ChatGPT ist super': 202,
  'Die Evolution der KI im E-Mail': 171,
  'Vergessen, den Prospect zu recherchieren': 261,
  'Welches ChatGPT-Modell': 293,
  'DeepSeek: Innovation oder': 513,
  '2030: Wie künstliche Intelligenz': 197,
  'KI ist schlau, aber nicht klug': 290,
  'Alle sprechen über KI': 1238,
  'Ich habe einen neuen Job': 920,
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
