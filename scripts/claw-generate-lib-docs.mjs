#!/usr/bin/env node
/**
 * CLAW Lib-Docs Generator
 *
 * Scannt alle Scripts in ~/Claude/scripts/ und generiert eine zentrale
 * Übersicht in ~/Claude/CLAW_SCRIPTS.md basierend auf ihren Top-Kommentaren.
 *
 * So vermeidet Claude Halluzinationen über Custom-Scripts:
 * statt zu raten was claw-wiki-sync tut, liest Claude erst CLAW_SCRIPTS.md.
 *
 * Usage: node claw-generate-lib-docs.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const SCRIPTS_DIR = 'C:/Users/User/Claude/scripts';
const OUT_PATH = 'C:/Users/User/Claude/CLAW_SCRIPTS.md';
const RELEVANT_EXT = new Set(['.mjs', '.js', '.py']);

function extractHeader(content, ext) {
    if (ext === '.py') {
        // Python Docstring: zwischen """ oder '''
        const m = content.match(/^(?:#![^\n]*\n)?\s*(?:"""|''')([\s\S]*?)(?:"""|''')/);
        if (m) return m[1].trim();
        // Fallback: Kommentarblock am Anfang
        const lines = content.split('\n');
        const commentLines = [];
        for (const line of lines) {
            if (line.startsWith('#!')) continue;
            if (line.startsWith('#')) commentLines.push(line.replace(/^#\s?/, ''));
            else if (commentLines.length > 0 || line.trim() === '') commentLines.push('');
            else break;
            if (commentLines.length > 30) break;
        }
        return commentLines.join('\n').trim();
    }
    // JS/TS: /** ... */ oder /* ... */ am Anfang
    const m = content.match(/^(?:#![^\n]*\n)?\s*\/\*\*?([\s\S]*?)\*\//);
    if (m) {
        return m[1]
            .split('\n')
            .map(l => l.replace(/^\s*\*\s?/, ''))
            .join('\n')
            .trim();
    }
    return null;
}

function summarize(header) {
    if (!header) return { title: '(kein Header-Kommentar)', body: '' };
    const lines = header.split('\n');
    // Erste nicht-leere Zeile = Titel
    const titleLine = lines.find(l => l.trim()) || '';
    const title = titleLine.replace(/^\*+\s*/, '').trim();
    const body = lines
        .slice(lines.indexOf(titleLine) + 1)
        .join('\n')
        .trim();
    return { title, body };
}

function main() {
    const files = readdirSync(SCRIPTS_DIR)
        .filter(f => RELEVANT_EXT.has(extname(f)))
        .filter(f => !f.endsWith('.log'))
        .sort();

    const entries = [];
    for (const file of files) {
        const path = join(SCRIPTS_DIR, file);
        if (!statSync(path).isFile()) continue;
        let content = '';
        try { content = readFileSync(path, 'utf-8'); } catch { continue; }
        const header = extractHeader(content, extname(file));
        const { title, body } = summarize(header);
        const size = statSync(path).size;
        const mtime = statSync(path).mtime.toISOString().slice(0, 10);
        entries.push({ file, title, body, size, mtime });
    }

    const today = new Date().toISOString().slice(0, 10);
    let md = `# CLAW Scripts — Übersicht\n`;
    md += `> Auto-generiert: ${today} | Quelle: \`C:\\Users\\User\\Claude\\scripts\\\`\n`;
    md += `> Regenerieren: \`node C:/Users/User/Claude/scripts/claw-generate-lib-docs.mjs\`\n\n`;
    md += `**Zweck:** Diese Datei verhindert Halluzinationen über Custom-Scripts. Statt zu raten was ein Script tut, liest Claude den Header-Kommentar aus dieser Übersicht.\n\n`;
    md += `**Regel:** Wenn ein Script in \`~/Claude/scripts/\` editiert oder neu angelegt wird — Header-Kommentar aktuell halten und dieses Script neu generieren.\n\n`;
    md += `---\n\n`;
    md += `## Inhaltsverzeichnis (${entries.length} Scripts)\n\n`;
    for (const e of entries) {
        const anchor = e.file.replace(/\./g, '').toLowerCase();
        md += `- [${e.file}](#${anchor}) — ${e.title.slice(0, 80)}\n`;
    }
    md += `\n---\n\n`;

    for (const e of entries) {
        const anchor = e.file.replace(/\./g, '').toLowerCase();
        md += `## ${e.file}\n`;
        md += `**Letzte Änderung:** ${e.mtime} · **Größe:** ${(e.size / 1024).toFixed(1)} KB\n\n`;
        md += `**Titel:** ${e.title || '(keine)'}\n\n`;
        if (e.body) {
            md += `\`\`\`\n${e.body.slice(0, 1500)}\n\`\`\`\n\n`;
        } else {
            md += `*Kein Body-Kommentar vorhanden — Header sollte ergänzt werden.*\n\n`;
        }
        md += `---\n\n`;
    }

    writeFileSync(OUT_PATH, md, 'utf-8');
    console.log(`✓ Generated ${OUT_PATH}`);
    console.log(`  ${entries.length} Scripts dokumentiert`);
    const missingHeaders = entries.filter(e => !e.body).length;
    if (missingHeaders > 0) {
        console.log(`  ⚠  ${missingHeaders} Scripts ohne Body-Kommentar — Header ergänzen empfohlen`);
    }
}

main();
