#!/usr/bin/env node
/**
 * CLAW Skill-Repair Proposer — Self-Improvement-Loop (Singularity-Style)
 *
 * Identifiziert Skills mit schlechter Erfolgsquote (rolling_quality <50%
 * oder 3+ consecutive fails), analysiert die letzten Failures aus
 * claw.skill_failures UND claw.activity_log, generiert via Gemini einen
 * Repair-Vorschlag (neue SKILL.md-Version), und speichert ihn in
 * claw.skill_repair_proposals zum menschlichen Review.
 *
 * NICHT auto-apply — Safak reviewed in separatem Chat und approved/rejects.
 *
 * Env: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
 * Usage:
 *   node claw-skill-repair.mjs              # Alle Kandidaten prüfen
 *   node claw-skill-repair.mjs --skill foo  # Nur einen Skill
 *   node claw-skill-repair.mjs --dry        # Analyze ohne Write in DB
 */

import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON || !GEMINI_KEY) {
    console.error('Missing env vars');
    process.exit(1);
}

const DRY = process.argv.includes('--dry');
const SKILL_ARG = process.argv.indexOf('--skill') > -1
    ? process.argv[process.argv.indexOf('--skill') + 1]
    : null;

const SKILLS_DIRS = [
    'C:/Users/User/.claude/skills',
    'C:/Users/User/.claude/scheduled-tasks'
];

function findSkillPath(skillName) {
    for (const dir of SKILLS_DIRS) {
        const p = path.join(dir, skillName, 'SKILL.md');
        if (fs.existsSync(p)) return p;
    }
    return null;
}

async function supaFetch(path, opts = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
        ...opts,
        headers: {
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`,
            'Content-Type': 'application/json',
            ...(opts.headers || {})
        }
    });
    if (!res.ok) throw new Error(`Supabase ${path}: ${res.status} ${await res.text()}`);
    return res.json();
}

async function getCandidates() {
    if (SKILL_ARG) {
        const rows = await supaFetch(`/claw_skill_metrics?skill_name=eq.${SKILL_ARG}`);
        return rows.map(r => ({
            skill_name: r.skill_name,
            rolling_quality: r.rolling_quality,
            consecutive_fails: r.consecutive_fails,
            success_count: r.success_count,
            fail_count: r.fail_count,
            recommendation: 'MANUAL'
        }));
    }
    const rows = await fetch(`${SUPABASE_URL}/rest/v1/rpc/claw_get_repair_candidates`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${SUPABASE_ANON}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_min_runs: 5, p_quality_threshold: 0.5, p_consecutive_threshold: 3 })
    });
    return rows.json();
}

async function getFailures(skillName, limit = 10) {
    // Aus claw.skill_failures (Task-Level) UND activity_log (Session-Level) sammeln
    const res = await supaFetch(`/rpc/claw_get_skill_failure_context`, {
        method: 'POST',
        body: JSON.stringify({ p_skill_name: skillName, p_limit: limit })
    }).catch(() => null);
    return res || [];
}

async function askGemini(prompt) {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 0 } }
            })
        }
    );
    if (!res.ok) throw new Error(`Gemini: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function proposeRepair(candidate) {
    const skillPath = findSkillPath(candidate.skill_name);
    if (!skillPath) {
        console.log(`  ⚠ ${candidate.skill_name}: SKILL.md nicht gefunden, skip`);
        return null;
    }

    const currentMd = fs.readFileSync(skillPath, 'utf-8');
    const failures = await getFailures(candidate.skill_name, 10);

    const prompt = `Du bist ein CLAW Skill-Doctor. Ein Skill hat eine schlechte Erfolgsquote und muss repariert werden.

SKILL: ${candidate.skill_name}
METRIK: ${candidate.success_count} Success / ${candidate.fail_count} Fails (Quality: ${(candidate.rolling_quality * 100).toFixed(0)}%)
CONSECUTIVE FAILS: ${candidate.consecutive_fails}
RECOMMENDATION: ${candidate.recommendation}

AKTUELLES SKILL.md:
---
${currentMd}
---

LETZTE FAILURES (aus claw.skill_failures + activity_log):
${failures.length > 0 ? JSON.stringify(failures, null, 2) : '(keine strukturierten Failures — Quality basiert auf session-outcomes)'}

AUFGABE:
Analysiere die Failures, identifiziere das Muster, und schreibe eine VERBESSERTE Version der SKILL.md. Konservativ — keine großen Umstrukturierungen, nur präzise Fixes:
- Klarere Hard Rules bei wiederkehrenden Fehlern
- Zusätzliche Edge-Case-Handhabung
- Schärfere Trigger-Kriterien wenn Skill falsch gerufen wird
- Bessere Fehlerbehandlung

ANTWORTE IM FOLGENDEN JSON-FORMAT:
{
  "diff_summary": "1-2 Sätze: was hat sich konzeptionell geändert",
  "proposed_skill_md": "<die komplette neue SKILL.md>",
  "confidence": 1-5,
  "rationale": "Warum diese Änderungen"
}`;

    const response = await askGemini(prompt);

    // JSON extrahieren (Gemini wrappt oft in ```json ... ```)
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.log(`  ⚠ ${candidate.skill_name}: Gemini-Antwort konnte nicht geparsed werden`);
        return null;
    }

    let parsed;
    try {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (e) {
        console.log(`  ⚠ ${candidate.skill_name}: JSON-Parse failed`);
        return null;
    }

    return {
        skill_name: candidate.skill_name,
        skill_path: skillPath,
        current_skill_md: currentMd,
        proposed_skill_md: parsed.proposed_skill_md,
        diff_summary: parsed.diff_summary,
        evidence_fails: { failures, metric: candidate, rationale: parsed.rationale, confidence: parsed.confidence }
    };
}

async function saveProposal(proposal) {
    if (DRY) {
        console.log(`  [DRY] Würde Proposal schreiben für ${proposal.skill_name}:`);
        console.log(`    Diff: ${proposal.diff_summary}`);
        return;
    }
    await supaFetch('/claw_skill_repair_proposals', {
        method: 'POST',
        body: JSON.stringify(proposal),
        headers: { 'Prefer': 'return=minimal' }
    });
    console.log(`  ✓ Proposal gespeichert für ${proposal.skill_name}`);
}

async function main() {
    console.log(`[CLAW Skill-Repair] Start ${new Date().toISOString()}${DRY ? ' (DRY)' : ''}`);

    const candidates = await getCandidates();
    console.log(`Gefunden: ${candidates.length} Repair-Kandidat(en)`);

    if (candidates.length === 0) {
        console.log('Keine Skills brauchen Reparatur. Alles grün.');
        return;
    }

    for (const c of candidates) {
        console.log(`\n→ ${c.skill_name} [${c.recommendation}] quality=${c.rolling_quality?.toFixed(2)} fails=${c.consecutive_fails}`);
        try {
            const proposal = await proposeRepair(c);
            if (proposal) await saveProposal(proposal);
        } catch (err) {
            console.error(`  ✗ Fehler: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 2000)); // Rate-limit
    }

    console.log('\n[CLAW Skill-Repair] Fertig.');
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
