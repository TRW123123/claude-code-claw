#!/usr/bin/env node
/**
 * claw-skill-retro.mjs — Gap #25 (Logging-Variante)
 *
 * Zweck: Prüft täglich die Scheduled-Tasks und loggt "Failures" (Task sollte
 * gelaufen sein, ist aber nicht) in Supabase claw.skill_failures.
 *
 * WICHTIG: Dieses Script macht KEINE automatischen Skill-Updates.
 * Es sammelt nur Daten für späteres menschliches Review.
 *
 * Heuristik "Failure":
 *   Task ist enabled, hat cronExpression, lastRunAt ist älter als erwarteter
 *   letzter Run + Toleranz (6h). Dann: wahrscheinlich nicht gelaufen → Log.
 *
 * Nutzung:
 *   node claw-skill-retro.mjs                   # einmal prüfen
 *   node claw-skill-retro.mjs --dry             # nur anzeigen, nicht schreiben
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://<SUPABASE_PROJECT_ID>.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const DRY = process.argv.includes('--dry');

// --tasks <path> erlaubt expliziten Input-Pfad (z.B. frisch gedumpt von
// Claude-Code via list_scheduled_tasks). Ohne Flag: Default-Convention.
const tasksArgIdx = process.argv.indexOf('--tasks');
const TASKS_PATH_OVERRIDE = tasksArgIdx > -1 ? process.argv[tasksArgIdx + 1] : null;

if (!SUPABASE_KEY && !DRY) {
    console.error('[skill-retro] FEHLER: SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY nicht gesetzt. --dry nutzen für Test.');
    process.exit(1);
}

const LOG_FILE = path.join(os.homedir(), 'Claude', 'scripts', 'claw-skill-retro.log');
const SKILLS_ROOT = path.join(os.homedir(), '.claude', 'skills');
const SCHEDULED_ROOT = path.join(os.homedir(), '.claude', 'scheduled-tasks');

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

/**
 * Liest Scheduled Tasks via Claude-Code CLI.
 * Fallback: direkt aus JSON-State-File, falls verfügbar.
 *
 * Da dieses Script nicht innerhalb Claude Code läuft, müssen wir die Tasks
 * aus einem Export-File lesen. Convention: der User dumped Tasks regelmäßig
 * nach ~/.claude/scheduled-tasks.json (z.B. via morning-catchup Task).
 */
function loadScheduledTasks() {
    // Priorität 1: expliziter --tasks Pfad
    // Priorität 2: Convention ~/.claude/scheduled-tasks.json (manueller/task-Dump)
    // Kein FS-Fallback auf scheduled-tasks/<id>/SKILL.md — dort gibt's kein
    // lastRunAt, daher wertlos für Failure-Detection.
    const candidates = [
        TASKS_PATH_OVERRIDE,
        path.join(os.homedir(), '.claude', 'scheduled-tasks.json'),
    ].filter(Boolean);

    for (const p of candidates) {
        if (!fs.existsSync(p)) continue;
        try {
            const raw = fs.readFileSync(p, 'utf-8');
            const tasks = JSON.parse(raw);
            if (Array.isArray(tasks)) {
                log(`[skill-retro] Tasks geladen aus: ${p}`);
                return tasks;
            }
        } catch (err) {
            log(`[ERROR] Tasks-File lesen fehlgeschlagen (${p}): ${err.message}`);
        }
    }

    log(`[WARN] Keine Tasks-JSON gefunden. Erwartet: --tasks <path> oder ~/.claude/scheduled-tasks.json`);
    log(`[HINT] Dump via Claude-Code MCP list_scheduled_tasks → JSON-Datei, dann dieses Script aufrufen.`);
    return [];
}

/**
 * Sehr einfache Cron-Heuristik: wenn cronExpression existiert und lastRunAt
 * älter als 26h ist (bei täglichen) → Verdacht auf Failure.
 * Für wöchentliche: > 8 Tage.
 * Für manuelle (keine cronExpression): ignorieren.
 */
function detectFailure(task) {
    if (!task.enabled) return null;
    if (!task.cronExpression) return null; // manuell oder one-time
    if (!task.lastRunAt) {
        // Nie gelaufen — könnte neu sein. Wenn nextRunAt in der Vergangenheit: Failure.
        if (task.nextRunAt && new Date(task.nextRunAt) < new Date()) {
            return { reason: 'never_ran_nextrun_past', lastRunAt: null };
        }
        return null;
    }

    const lastRun = new Date(task.lastRunAt);
    const ageHours = (Date.now() - lastRun.getTime()) / 1000 / 3600;

    // Grobe Klassifizierung per cron-Pattern
    const cron = task.cronExpression;
    const isWeekly = / \* \* [0-6]$/.test(cron) || /1-5$/.test(cron) && /^\d+\s+\d+\s+\*\s+\*/.test(cron) === false;
    const weeklyOnly = / \* \* [0-6]$/.test(cron);
    const workdaysOnly = /1-5$/.test(cron);

    if (weeklyOnly && ageHours > 8 * 24) {
        return { reason: 'weekly_overdue', ageHours: Math.round(ageHours) };
    }
    if (workdaysOnly && ageHours > 4 * 24) {
        // Wenn > 4 Tage alt bei werktäglich, sicher Failure (deckt Wochenenden ab)
        return { reason: 'workday_overdue', ageHours: Math.round(ageHours) };
    }
    if (!weeklyOnly && !workdaysOnly && ageHours > 26) {
        return { reason: 'daily_overdue', ageHours: Math.round(ageHours) };
    }
    return null;
}

/**
 * Versucht den SKILL.md Pfad zu erraten basierend auf Task-ID / Description.
 * Einfacher Match: task-id → skills/<id>/SKILL.md
 * Fallback: null (unknown).
 */
function guessSkillPath(task) {
    const candidates = [
        task.taskId,
        task.taskId?.replace(/-\w+$/, ''),
        task.taskId?.split('-')[0],
    ].filter(Boolean);

    for (const name of candidates) {
        const p = path.join(SKILLS_ROOT, name, 'SKILL.md');
        if (fs.existsSync(p)) return p;
    }
    return null;
}

async function main() {
    log(`[skill-retro] Start (dry=${DRY})`);

    const tasks = loadScheduledTasks();
    log(`[skill-retro] ${tasks.length} Scheduled Tasks geladen`);

    const failures = [];
    for (const t of tasks) {
        const failure = detectFailure(t);
        if (!failure) continue;
        failures.push({
            task_id: t.taskId,
            failure_reason: `${failure.reason} (cron=${t.cronExpression}, ageHours=${failure.ageHours ?? 'n/a'})`,
            skill_path: guessSkillPath(t),
            metadata: {
                cronExpression: t.cronExpression,
                lastRunAt: t.lastRunAt,
                nextRunAt: t.nextRunAt,
                description: t.description,
            },
        });
    }

    log(`[skill-retro] ${failures.length} Potential Failures detected`);
    for (const f of failures) {
        log(`  - ${f.task_id}: ${f.failure_reason}`);
    }

    if (DRY) {
        log('[skill-retro] DRY — kein Write nach Supabase');
        return;
    }
    if (failures.length === 0) {
        log('[skill-retro] Nichts zu loggen.');
        return;
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/skill_failures`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Accept-Profile': 'claw',
            'Content-Profile': 'claw',
            'Prefer': 'return=minimal',
        },
        body: JSON.stringify(failures),
    });
    if (!res.ok) {
        const detail = await res.text();
        log(`[ERROR] Supabase insert fehlgeschlagen: ${res.status} ${detail}`);
        process.exit(1);
    }
    log(`[skill-retro] ${failures.length} Failures nach claw.skill_failures geschrieben`);
}

main().catch(err => {
    log(`[FATAL] ${err.message}`);
    process.exit(1);
});
