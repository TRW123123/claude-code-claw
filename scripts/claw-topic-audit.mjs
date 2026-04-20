#!/usr/bin/env node
/**
 * CLAW Topic Audit — Self-driving Docs (Gap #31)
 *
 * Durchsucht alle Topic-Files in ~/Claude/topics/ nach Referenzen auf
 *   - Scheduled Tasks  (erwartet unter ~/.claude/scheduled-tasks/<name>/SKILL.md)
 *   - Scripts          (erwartet unter ~/Claude/scripts/<name>)
 *   - Supabase-Objekte (claw.*, public.* — nur Auflistung, KEINE DB-Verifikation)
 *
 * Output: Report pro Topic-File mit Stale-Referenzen (Task/Script existiert nicht mehr).
 * Supabase-Referenzen werden nur gelistet — echte DB-Verifikation wäre ein separater Task.
 *
 * Dies ist KEIN Auto-Fixer. User liest den Report + korrigiert manuell.
 *
 * Usage:
 *   node claw-topic-audit.mjs
 *   node claw-topic-audit.mjs --topic claw-architecture
 *   node claw-topic-audit.mjs --json
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const TOPICS_DIR = 'C:/Users/User/Claude/topics';
const SCRIPTS_DIR = 'C:/Users/User/Claude/scripts';
const TASKS_DIR = 'C:/Users/User/.claude/scheduled-tasks';

function parseArgs(argv) {
    const args = { topic: null, json: false };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--topic') args.topic = argv[++i];
        else if (a === '--json') args.json = true;
    }
    return args;
}

function listExistingTasks() {
    try { return new Set(readdirSync(TASKS_DIR).filter(n => statSync(join(TASKS_DIR, n)).isDirectory())); }
    catch { return new Set(); }
}

function listExistingScripts() {
    try { return new Set(readdirSync(SCRIPTS_DIR)); }
    catch { return new Set(); }
}

// Extract referenced scheduled-task names from backticks.
// Heuristik: Backtick-Strings, die zu einem Ordnernamen in scheduled-tasks/ passen oder
// dem Muster "kebab-case mit mindestens einem Bindestrich und ohne Datei-Extension" entsprechen.
function extractTaskRefs(content, existingTasks) {
    const refs = new Set();
    // Known-task-name matching
    for (const task of existingTasks) {
        const re = new RegExp(`\`${task.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\``, 'g');
        if (re.test(content)) refs.add(task);
    }
    // Plus explicit patterns that LOOK like task names (kebab-case, no extension) but might be stale
    const backtickMatches = content.match(/`([a-z][a-z0-9-]{3,}[a-z0-9])`/g) || [];
    for (const m of backtickMatches) {
        const name = m.slice(1, -1);
        // Heuristic: contains dash + looks like a scheduled task (starts with known prefix)
        if (/^(seo-|ki-auto-|linkedin-|gsc-|funnel-|morning-|claw-|telegram-|tiktok-)/.test(name)
            && !name.endsWith('.mjs') && !name.endsWith('.md') && !name.endsWith('.js')) {
            refs.add(name);
        }
    }
    return refs;
}

function extractScriptRefs(content) {
    const refs = new Set();
    // `<name>.mjs`, `<name>.js`, `<name>.py`, `<name>.ps1`
    const re = /`([a-zA-Z0-9_\-/\\.]+\.(?:mjs|js|py|ps1|cmd|bat))`/g;
    let m;
    while ((m = re.exec(content)) !== null) {
        const full = m[1];
        // Take basename
        const base = full.split(/[\\/]/).pop();
        refs.add(base);
    }
    return refs;
}

function extractSupabaseRefs(content) {
    const refs = new Set();
    const re = /`(claw\.[a-z_]+|public\.[a-z_]+(?:\(\))?|insert_changelog|measure_change_impact|get_page_changelog)`/g;
    let m;
    while ((m = re.exec(content)) !== null) refs.add(m[1]);
    return refs;
}

function auditTopic(file, existingTasks, existingScripts) {
    const path = join(TOPICS_DIR, file);
    const content = readFileSync(path, 'utf-8');

    const taskRefs = extractTaskRefs(content, existingTasks);
    const scriptRefs = extractScriptRefs(content);
    const sbRefs = extractSupabaseRefs(content);

    const staleTasks = [...taskRefs].filter(t => !existingTasks.has(t));
    const staleScripts = [...scriptRefs].filter(s => !existingScripts.has(s));

    return {
        file,
        path,
        size_kb: (statSync(path).size / 1024).toFixed(1),
        counts: {
            task_refs: taskRefs.size,
            script_refs: scriptRefs.size,
            supabase_refs: sbRefs.size,
        },
        stale_tasks: staleTasks,
        stale_scripts: staleScripts,
        all_task_refs: [...taskRefs].sort(),
        all_script_refs: [...scriptRefs].sort(),
        supabase_refs: [...sbRefs].sort(),
    };
}

function main() {
    const { topic, json } = parseArgs(process.argv);
    const existingTasks = listExistingTasks();
    const existingScripts = listExistingScripts();

    let files = readdirSync(TOPICS_DIR).filter(f => f.endsWith('.md'));
    if (topic) {
        const needle = topic.endsWith('.md') ? topic : topic + '.md';
        files = files.filter(f => f === needle);
    }

    const reports = files.map(f => auditTopic(f, existingTasks, existingScripts));

    if (json) {
        console.log(JSON.stringify({
            topics_dir: TOPICS_DIR,
            existing_tasks: [...existingTasks].sort(),
            existing_scripts_count: existingScripts.size,
            reports,
        }, null, 2));
        return;
    }

    console.log(`\n=== CLAW Topic Audit ===`);
    console.log(`Topics dir:      ${TOPICS_DIR}`);
    console.log(`Scripts dir:     ${SCRIPTS_DIR} (${existingScripts.size} Dateien)`);
    console.log(`Scheduled Tasks: ${TASKS_DIR} (${existingTasks.size} Tasks)`);
    console.log(`Topics geprüft:  ${reports.length}\n`);

    let totalStale = 0;
    for (const r of reports) {
        const stale = r.stale_tasks.length + r.stale_scripts.length;
        totalStale += stale;
        const status = stale === 0 ? 'OK' : `STALE (${stale})`;
        console.log(`--- ${r.file}  [${status}]  ${r.size_kb} KB`);
        console.log(`    task_refs=${r.counts.task_refs}  script_refs=${r.counts.script_refs}  supabase_refs=${r.counts.supabase_refs}`);

        if (r.stale_tasks.length > 0) {
            console.log(`    STALE scheduled-tasks (kein Ordner unter ${TASKS_DIR}):`);
            for (const t of r.stale_tasks) console.log(`      - ${t}`);
        }
        if (r.stale_scripts.length > 0) {
            console.log(`    STALE scripts (nicht in ${SCRIPTS_DIR}):`);
            for (const s of r.stale_scripts) console.log(`      - ${s}`);
        }
        if (r.supabase_refs.length > 0) {
            console.log(`    Supabase-Refs (NICHT gegen DB verifiziert — manuell prüfen):`);
            for (const s of r.supabase_refs) console.log(`      - ${s}`);
        }
        console.log('');
    }

    console.log(`=== Summary ===`);
    console.log(`Topics: ${reports.length}  |  Stale-Referenzen total: ${totalStale}`);
    console.log(`Limitierung: Supabase-Objekte werden NICHT gegen DB verifiziert.`);
    console.log(`             Task-Heuristik matched kebab-case-Prefixe — false positives möglich.`);

    if (totalStale > 0) process.exitCode = 1;
}

main();
