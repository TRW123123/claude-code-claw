#!/usr/bin/env node
/**
 * CLAW Build-Safety Hook — PostToolUse
 *
 * Läuft nach Write/Edit/MultiEdit auf TypeScript/Astro-Dateien.
 * Findet das nächste package.json und läuft `tsc --noEmit --incremental`.
 *
 * Signalisiert Fehler an Claude via Exit 2 + JSON-Output ("decision":"block"),
 * damit der Agent TypeScript-Errors sofort sieht und fixen kann.
 *
 * Hook-Contract: Claude Code sendet via stdin JSON mit `tool_input`.
 */

import { readFileSync, existsSync, appendFileSync } from 'fs';
import { dirname, join, extname, resolve } from 'path';
import { execSync } from 'child_process';

const RELEVANT_EXT = new Set(['.ts', '.tsx', '.astro', '.mts', '.cts']);
const LOG_PATH = 'C:/Users/User/Claude/scripts/claw-build-check.log';

function log(msg) {
    try {
        appendFileSync(LOG_PATH, `[${new Date().toISOString()}] ${msg}\n`);
    } catch {}
}

function findPackageJson(startDir) {
    let cur = resolve(startDir);
    const root = resolve('/');
    while (cur && cur !== root) {
        const pkg = join(cur, 'package.json');
        if (existsSync(pkg)) return { dir: cur, pkgPath: pkg };
        const parent = dirname(cur);
        if (parent === cur) break;
        cur = parent;
    }
    return null;
}

function main() {
    let payload = '';
    try {
        payload = readFileSync(0, 'utf-8');
    } catch {
        process.exit(0);
    }

    if (!payload.trim()) process.exit(0);

    let data;
    try {
        data = JSON.parse(payload);
    } catch {
        process.exit(0);
    }

    const toolInput = data.tool_input || {};
    const filePath = toolInput.file_path || toolInput.path || null;
    if (!filePath) process.exit(0);

    const ext = extname(filePath).toLowerCase();
    if (!RELEVANT_EXT.has(ext)) process.exit(0);

    const projectInfo = findPackageJson(dirname(filePath));
    if (!projectInfo) process.exit(0);

    let pkg;
    try {
        pkg = JSON.parse(readFileSync(projectInfo.pkgPath, 'utf-8'));
    } catch {
        process.exit(0);
    }

    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    if (!deps.typescript) process.exit(0);

    log(`tsc check start: ${filePath} in ${projectInfo.dir}`);
    try {
        execSync('npx tsc --noEmit --incremental --skipLibCheck', {
            cwd: projectInfo.dir,
            stdio: 'pipe',
            timeout: 30000
        });
        log(`tsc OK: ${filePath}`);
        process.exit(0);
    } catch (err) {
        const out = ((err.stdout?.toString() || '') + '\n' + (err.stderr?.toString() || '')).trim();
        log(`tsc FAIL: ${filePath}\n${out.slice(0, 2000)}`);
        const message = {
            decision: 'block',
            reason: `TypeScript-Fehler nach Edit an ${filePath}:\n\n${out.slice(0, 2000)}\n\nBitte den Fehler fixen, bevor weitere Änderungen vorgenommen werden.`
        };
        process.stdout.write(JSON.stringify(message));
        process.exit(2);
    }
}

try {
    main();
} catch (e) {
    log(`hook error: ${e?.message || e}`);
    process.exit(0);
}
