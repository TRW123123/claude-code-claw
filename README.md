# CLAW

> A complete operator stack for one builder. 31 production skills. Clone, adapt, run.

I was tired of every "AI agent framework" being 80 percent setup and 20 percent value. CLAW is the inverse. The skills already work. The hooks already fire. The scheduled tasks already run on a real account with real revenue. You clone it and rewrite the 5 percent that is specific to you.

If you are a solo builder running consulting, content, an indie SaaS, or a service business, this is the operator stack you can have today instead of in six months.

---

## What you get on day one

Five skills that pull the most weight. Twenty-six more in the box.

### `local-smb`  ::  Instagram DM outreach for local businesses

Send 30 to 50 hyper-personalized DMs per day to cafés, salons, mechanics, e-commerce shops in your area. Returns: appointment requests within 24 hours, not three weeks of cold-email silence. Account-safety guardrails baked in: rate limits, language switching, blacklist filters. Used by me to fill a 4-week pipeline for AI consulting without buying a single ad.

### `ai-ugc`  ::  AI video reels at scale

Three-agent pipeline. Veo plus Nano Banana plus OmniHuman plus Remotion. Director agent decides the angle, prompt agent writes the I2V prompt with hard rules baked in, render agent ships the final reel. Used by me to produce reels in 8 languages for profilfoto-ki.de without hiring a video editor.

### `elite-ui-ux`  ::  Premium frontend without the agency fee

Forces non-generic UI at build time. Linear-grade dark mode, Bento layouts, WebGL hooks, Framer Motion, dark theme by default. Triggers on prompts like "build me a hero", "premium look", "no generic SaaS template". Used by me to ship apexx-bau.de and ki-automatisieren.de in under a week each.

### `profilfoto-seo`  ::  SEO that compounds, not the kind that stalls

Four-stage funnel from Authority through Conversions. GSC integration. Changelog impact loop: you ship, you measure, you decide the next ship from the data. Used by me to grow profilfoto-ki.de from zero indexed pages to a working content engine in 30 days.

### `seedance`  ::  Seedance 2.0 prompts that actually render

Hard rules distilled from 7 primary sources (Perplexity, 25+ YouTube tutorials, X community threads, 4 GitHub repos). Camera-move cheatsheet, style-keyword whitelist, 5-image rule, 3-shot segment logic. Used by me to render 40+ marketing videos per week with predictable quality, not three rolls of garbage per concept.

---

## Setup, the Claude Code native way

You do not need an install script, npm install, or Docker. You need Claude Code and one prompt.

**1. Clone and open Claude Code in the repo root:**

```bash
git clone https://github.com/TRW123123/claude-code-claw.git claw
cd claw
claude
```

**2. Paste this prompt into Claude Code:**

> You are my setup assistant for the CLAW system. Read `SETUP.md` in this repo and walk me through the 8 phases step by step.
>
> For each phase:
> 1. Ask me for the required inputs (project names, API keys, paths)
> 2. Run the action (copy files, apply migrations, register tasks)
> 3. Verify the step worked
> 4. Show me what you did before moving to the next phase
>
> Hard rules: ask before writing. Nothing destructive without explicit OK. If you need an API key I do not have: tell me where to get it and stop until I have it.
>
> Start with Phase 1 (check prerequisites).

**3. Follow Claude Code's lead.** Setup takes 30 to 60 minutes depending on what you already have installed.

If you prefer manual setup: every step is documented in [`SETUP.md`](SETUP.md) with SQL snippets and exact file paths.

---

## All 31 skills

Grouped by what they do for you.

### Outreach and growth

| Skill | What it does |
|---|---|
| `local-smb` | Instagram DM outreach for local businesses, account-safe |
| `insta-dm` | General Instagram DM workflow with Chrome MCP coordinates |
| `tiktok-post` | TikTok content posting pipeline with sandbox upload |
| `outreach` | Cold email and LinkedIn outreach for DACH and TR markets |
| `linkedin-content` | LinkedIn content agent for personal-brand posts |
| `telegram-gateway` | Telegram bot gateway for approval flows |

### Video and creative

| Skill | What it does |
|---|---|
| `ai-ugc` | 3-agent AI video pipeline (Director, Prompt-Expert, Render) |
| `seedance` | Seedance 2.0 prompting with hard rules from 7 sources |
| `kling` | Kling 3.0 prompting distilled from 5+ primary sources |
| `runway-test` | Runway Explore Mode autonomous concept testing |
| `prompt-factory` | Daily creative brief generator, Nano Banana + Seedance prompts |
| `youtube-thumbnail` | YouTube thumbnail generator, Nano Banana + Remotion |

### SEO and content

| Skill | What it does |
|---|---|
| `profilfoto-seo` | 4-stage SEO funnel for visual content sites |
| `st-auto-seo` | 4-stage SEO funnel with DataForSEO + GSC integration |
| `unique-page` | Daily routine that ships 3 unique landing pages |
| `x-content` | X/Twitter content pipeline with self-learning loop |
| `humanizer-de` | Pre-publish quality gate scoring text 0-100 |

### Build and ship

| Skill | What it does |
|---|---|
| `elite-ui-ux` | Premium frontend at build time, no generic SaaS look |
| `business-launch` | Phase-based orchestrator from domain registration to live site |
| `site-bootstrap` | Onboards a new domain into the CLAW agent system |
| `site-review` | Premium visual review via Claude in Chrome |
| `deployment` | Mandatory pre-flight check before every push and deploy |
| `test-coverage-loop` | Dual-agent test loop for payment and credit flows |

### Agent infrastructure

| Skill | What it does |
|---|---|
| `agent-mesh` | Inter-agent messaging plus task kanban |
| `claw-memory` | CLAW memory layer for cross-session learning |
| `claw-debate` | Multi-agent red-team debate loop for hard decisions |
| `preflight` | Lists available skills, matches them to current task |
| `promise` | Completion promise for long autonomous tasks |
| `reload-skills` | Scans skills folder, validates SKILL.md files |
| `teleport` | Manual session handoff trigger with structured summary |

### Specialized

| Skill | What it does |
|---|---|
| `notebooklm` | Query Google NotebookLM directly from Claude Code |

---

## How CLAW thinks

**Claude Code is the agent.** No external orchestrator, no LangChain layer, no custom runtime. Everything is implemented as:

1. **Hooks** (`SessionStart`, `UserPromptSubmit`, `Stop`, `PreCompact`). Small Node and Python scripts the harness runs at lifecycle events.
2. **Scheduled Tasks**. Cron-registered invocations of Claude Code with a pre-loaded `SKILL.md` playbook.
3. **Skills**. `SKILL.md` files that Claude loads on demand to execute specialized workflows.
4. **Memory**. Supabase (activity log, task queue, learnings) plus optional Pinecone (read-only curated knowledge base).

That is the whole architecture. No magic.

### Lifecycle

```
SessionStart hook  →  claw-queue-check.mjs         → loads pending tasks + last 7 days activity
UserPromptSubmit   →  claw-research.mjs            → semantic search over memory, injects context
Stop / PreCompact  →  claw-session-processor.mjs   → extracts learnings, writes to Supabase
On-demand          →  claw-flush.mjs               → manual memory flush
Cron (OS-level)    →  Claude Code + SKILL.md       → executes a scheduled task autonomously
```

### Hard rules (see `docs/MASTER.md`)

* The agent IS Claude Code. There is no separate runtime.
* Pinecone is read-only for the agent. Writes happen manually after review.
* Destructive actions (`git push`, deploys, external API calls with cost) always ask first.
* Never commit `settings.json`, `settings.local.json`, sessions, or any secret-containing file.

---

## What's in this repo

| Path | What |
|---|---|
| `skills/` | 31 on-demand skill playbooks Claude loads when a task matches |
| `scheduled-tasks/` | Cron-registered tasks (daily SEO loops, content runs, performance pulls) |
| `scripts/` | Infrastructure: session processor, memory flush, semantic research, sync |
| `topics/` | Per-project knowledge files, auto-updated by the session processor |
| `docs/` | `MASTER.md` (stack, hard rules), `SOUL.md` (agent character), `AGENTS.md` (routing) |
| `migrations/` | Supabase SQL migrations |
| `examples/` | Example scheduled tasks you can adapt |

---

## Status

Migration from `.mjs` agent scripts to Claude-native scheduled tasks is complete. 9 scheduled tasks registered, 5 infrastructure scripts active. 31 skills in production use across 5 domains.

If you find a skill you want to adapt, fork the repo or copy the SKILL.md file. Every skill is self-contained.

---

## License

MIT (see `LICENSE`).

## Security

See `SECURITY.md` for responsible disclosure.

## Follow

X / Twitter: [@ST_Automation](https://x.com/ST_Automation)
Domain: [st-automatisierung.de](https://st-automatisierung.de)
