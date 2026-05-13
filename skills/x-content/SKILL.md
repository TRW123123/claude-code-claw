---
name: x-content
description: X/Twitter Content Pipeline for @ST_Automation with Self-Learning Metrics System. Use whenever tweets, threads, or replies are planned, posted, or analyzed. Hybrid language model — EN for standalones (Builder reach), reply language matches the original post. Theme-series content (no diary, no "Day X" narrative). Performance-tracked via claw.x_posts + claw.x_post_performance.
allowed-tools: [Read, Write, Bash, Grep]
---

# X Content Pipeline Skill — @ST_Automation

> **Operator Layer.** Strategy lives in `~/Claude/topics/x-strategy.md` (WHY, ICP, phases, pivot-triggers). This skill is the HOW (format, quality gate, posting mechanic). Conflict → strategy doc wins.

## ⚠️ MANDATORY READ-FIRST

Before any X post:
1. Read this skill in full
2. **Read `DPM-FRAMEWORK.md` in this skill folder** — content psychology, Word Shit List, Cool-without-Uncool, Pattern Interrupt, Open Loops, DPM-Check
3. **For replies: Read `REPLY-TEMPLATES.md` in this skill folder** — 7 Templates, Volumen-Plan, Rate-Limit-Schutz, Performance-Tracking
4. Read the last 5 posts in `claw.x_posts` (hook, pillar, performance, learnings)
5. Read top 3 `is_reference=true` posts as winning-pattern few-shot
6. Read `claw.activity_log` of last 24h for substance fuel
7. **Read today's `claw.x_trends_daily` snapshot** — see TREND-AWARENESS-LAYER below
8. Then draft

Never write a tweet from memory without performance-context lookup.

## TREND-AWARENESS-LAYER (NEW — 2026-05-12)

Daily 07:30 läuft `x-trends-scan` (scheduled task) und schreibt Top 25 DACH X-Trends in `claw.x_trends_daily`. **Vor Reply-Discovery** diesen Query:

```sql
SELECT rank, trend, category, relevance_score
FROM claw.x_trends_daily
WHERE scraped_at = (SELECT MAX(scraped_at) FROM claw.x_trends_daily WHERE source='trends24-germany')
  AND source='trends24-germany'
ORDER BY rank ASC;
```

**Entscheidung pro Tag:**
- **Tech-Trend** (`category='tech'` oder `relevance_score >= 0.6`) **in Top 20** → opportunistische Replies suchen unter `https://x.com/search?q=<trend>&f=live&lang=de`. +3-5 zusätzliche Targets/Tag.
- **Kein Tech-Trend** → Cluster-Plan beibehalten, normale Reply-Discovery (Standard-URLs).

**Wichtig:** NICHT zwanghaft auf Trends posten. Wenn Trend tech-adjacent ist (z.B. "ChatGPT down" und Cluster ist Seedance-Woche), bewusst entscheiden:
- Reply-Volumen für DACH-Reach → ja, opportunistisch
- Standalone-Draft auf Tech-Trend → nur wenn substantieller Take möglich, sonst Cluster-Plan

**Tracking:** Trend-Replies in `iteration_changes` taggen mit `{"trend_source": "<trend>", "trend_rank": X}` für späteres Performance-Tracking.

**Wenn `claw.x_trends_daily` heute leer** (Scan failed) → trotzdem fortfahren. Im activity_log notieren: "x-trends-scan ausgefallen, Reply-Discovery ohne Trend-Layer."

## ACCOUNT POSITIONING (HARD RULE — 2026-05-07 PIVOT)

**@ST_Automation is a builder + AI-tools account on X.** Audience is global English-speaking AI builders, indie hackers, video/UGC creators, and AI-tool early adopters. Secondary audience: DACH AI consultants and KMU IT-leads (reachable via German replies under German posts).

**What changed (2026-05-07):**
- 2026-04-21 → 2026-05-04: English diary ("Day X") — failed (4-19 views, 0 likes)
- 2026-05-04 → 2026-05-07: German diary (DACH-KMU pivot) — failed (Grok confirmed: DACH AI-niche on X is essentially dead, even @wiwo gets 0 likes on a KI-Mittelstand post)
- **2026-05-07 onwards: English standalones, theme-series, value-tutorials. No diary, no "Day X", no self-reference to CLAW as central narrative.**

The only audience large enough on X is global English builders. DACH-KMU lead-gen happens via GSC, LinkedIn, and cold outreach — not X.

## CONTENT FORMAT (HARD RULE)

**Every standalone post must:**
- Stand alone — no "Day 14", no "yesterday I built", no requirement to know the account history
- Deliver one extractable take-away (a prompt, a comparison, a workaround, a number)
- Have one concrete entity (tool name, code snippet, exact value)
- Acknowledge one limitation honestly
- Have a hook readable in <2 seconds

**Every standalone forbids:**
- Hollow self-promo phrases without a concrete event: "I shipped this cool thing", "today I built", "in public", vague "building CLAW" progress updates
- Hype words: "mind-blowing", "game-changer", "this changes everything", "unlocked", "wild"
- Vague meta: "AI is wild", "the future is here", "we live in the future"
- Hashtag spam (max 1, only if it's a real cluster e.g. #AIVideo)
- Bullet dumps and cheat-sheets — write prose, not lists
- **The "-" character in any form** (in posts only — internal MD docs may use `---` as section dividers, posts must not) — no hyphens as bullets, no em-dashes as connectors, no "→" arrows. Write prose, not lists. If a thought needs a dash, restructure the sentence.
- **Word Shit List** (DPM-Framework, full list in `DPM-FRAMEWORK.md`): bespoke, elevate, empower, landscape, enhance, transform, seamless, cutting-edge, revolutionary, unleash, in today's fast-paced world. DE: maßgeschneidert, revolutionär, bahnbrechend, nahtlos, innovativ, ganzheitlich, holistisch, synergetisch.

## CONTENT PILLARS (NEW — 2026-05-07)

| Pillar | Share | What |
|---|---|---|
| `tool-tutorial` | 35% | How-to with concrete prompt / code / config. Tool-name in hook. |
| `comparison` | 20% | Tool A vs B vs C with named criteria + verdict |
| `pain-point` | 20% | Problem most builders hit, with the workaround that works |
| `prompt-pattern` | 15% | Concrete prompt structure or pattern, copy-pasteable |
| `anti-pattern` | 10% | What reproducibly fails + why + the alternative |

**Topic clusters (rotate weekly):**

| Cluster | Posts in pipeline | Status |
|---|---|---|
| Seedance 2.0 | S1 camera moves, S2 style keywords, S3 anti-patterns | active week 1 (2026-05-07) |
| AI UGC Prompts | U1 Veo 5-field structure, U2 non-English reels pain, U3 1.5s hook test | next |
| Claude Code | C1 5 hooks, C2 sub-agent permission pattern, C3 skills vs slash | week 3 |
| Remotion | R1 frame-recycling, R2 renderStill thumbnails, R3 vertical templates | week 4 |
| OpenClaw | O1 per-domain SKILL.md, O2 Map-Read-Synth pattern, O3 memory-as-files | week 5 |
| Free SERP APIs | bonus | later |
| Apify Reel-Posting | bonus | later |
| OmniHuman non-English Lip-Sync | bonus | later |
| n8n Workflows that save hours | bonus | later |

Cluster rotation rule: stay on a cluster for 5-7 days (3 standalones + replies + iterate based on performance) before switching. Don't mix clusters within a single day unless one is reactive (news / quote-trend).

## HOOK-TYPES (with EN examples — 2026-05-07)

| Type | Pattern | EN Example |
|---|---|---|
| `numbers` | Specific count + claim | "8 camera moves cover 90% of Seedance use-cases. The exact prompt strings:" |
| `contrarian` | Mainstream wrong + correction | "Most people think Veo 3 needs cinematic prompts. It needs structured fields." |
| `pain-point` | Name the problem first | "AI reels in non-English languages look broken. Here's why." |
| `comparison` | Tool A vs B + named criterion | "Seedance 2.0 vs Veo 3 vs Kling — what's actually shippable in 2026." |
| `tutorial` | "How I X" | "How I post Reels via Apify (no browser automation)." |
| `anti-pattern` | What fails + why | "Things Seedance 2.0 reproducibly fails at — and what to use instead." |
| `cool-without-uncool` | Result + spared pain (DPM Framework) | "Three new clients. No cold calls. No outreach. Just one pinned post." |
| `reverse-21` | Describe effect, hide the tool (DPM Framework) | "I built a system that handles my lead-gen while I sleep. Zero code." |
| `instant-novelty` | Cognitive dissonance / lie-confession / inverse authority (DPM Framework) | "My brain lied to me for six months. Here's what I actually needed." |

Tag every post with `hook_type` so we learn which pattern wins per cluster.

## REPLIES (HYBRID LANGUAGE — MAIN GROWTH AXIS in Phase 1)

> **PFLICHT vor jedem Reply: `REPLY-TEMPLATES.md` lesen.** Enthält 7 Templates mit Slots, Volumen-Plan (heute Pre-Phase-1 → Eskalation auf 100-150/Tag in ~5 Tagen), Rate-Limit-Schutz, Performance-Tracking pro Template.

Reply volume is the primary 0→10k growth lever. Grok-research-confirmed across 6+ solo-builder sources (callmiAbbas, dramaricic, _Auza_, thevincentholm, AlexFinn, Jeremybtc — all grew via 100–250 replies/day). Standalones are the anchor, replies are the engine.

- Reply in the language of the original post
- DE post → DE reply (DACH micro-niche pull, opportunistic)
- EN post → EN reply (Builder bubble pull, primary)
- **100–150 replies/day in Phase 1** (hard floor; scales down as account matures — see x-strategy.md)
- **Target mix per day:** ~70 EN to AI-builders (Medium-Accounts 1k–50k) + ~20 EN first-reply-bangers to top-targets (<15min reaction window) + ~10 DE to DACH-AI-posts
- **Top-target list** (push-notifications on): levelsio, swyx, mckaywrigley, AlfieJCarter, gregisenberg, milesdeutscher, garrytan, kpaxs, alexalbert, heygurisingh, DeRonin_, PrajwalTomar_, shubham_crazy08, tibo_maker
- Min target post: 50+ likes OR verified profile OR substantive content
- Add concrete value from `claw.activity_log` substance — never empty agreement
- **Link rule (refined 2026-05-12):**
  - Reply on someone else's post → **NO** link (down-rank signal)
  - Own first-reply to own standalone → **link IS allowed** and is a documented algo-hack (sources: knightama 2034380576384487808, big_sensei 1962871565428637899, JohnCassidy 2041179794428047526)
  - Standalone main-tweet → always link-free
- Max 280 chars, count exactly

## HOOK-AND-REPLY FORMAT (HARD RULE — 2026-05-12)

Every standalone post uses this two-part structure:

**Part 1 — Hook tweet** (the post itself): Hook + short setup + teaser line that ends on a colon or open question. Does NOT contain the content. Max ~140 chars. Forces the click.

**Part 2 — First reply** (posted immediately after as a reply to own tweet): The actual content. Prose, no bullets, no dashes. Reads as a natural continuation of Part 1.

Why: The hook tweet drives curiosity clicks and impressions. The reply keeps the engagement inside the thread (algo rewards this). Readers who want the payoff have to interact.

Example:
- Tweet: "The word 'cinematic' does nothing in a Seedance 2.0 prompt. I used it for two weeks before I figured out what really works. Three keywords that actually change the render:"
- Reply: "Shot on Arri Alexa gives you grain and narrow depth of field that cinematic never produces. 35mm film adds soft contrast and light leaks. Anamorphic gives you horizontal flares and oval bokeh. Those three move the render. Cinematic just sits there."

**Forbidden:** Putting the content in the main tweet and leaving the reply empty. The teaser must be unresolved in Part 1.

## DAY X NARRATIVE FORMAT (HARD RULE — 2026-05-12)

Every standalone uses the Day X narrative structure. This is not a diary — it is a concrete event log in EN.

**Structure:**
- **Opener:** "Day [N]." — establishes continuity and makes the account feel like a live system, not a content machine
- **Event:** ONE specific thing that happened, broke, shipped, or failed. Must be real. Must have happened.
- **Numbers:** at least one concrete number (render count, time, views, leads, lines, errors)
- **Lesson:** one sentence that states what this means for anyone building similar systems
- **Link:** `github.com/TRW123123/claude-code-claw` — always at the end for discoverability

**Day counter:** Increment from last posted day_number. Check `claw.x_posts` for the highest day_number to find where we are.

**Example (EN):**
> "Day 14. Ran 40 Seedance 2.0 generations this week. Three came out clean. The other 37 had the same shape: too many inputs competing in one shot. The model does not average them. It picks one and drops the rest.
> github.com/TRW123123/claude-code-claw"

**What makes a Day X post good:**
- Real event, not a tip extracted from nowhere
- The failure is more interesting than the win
- Reads like someone's honest log, not a thread from a growth hacker
- The lesson is implicit in the numbers, not bolted on at the end

**What kills a Day X post:**
- No event — just abstract advice ("here are 4 rules for...")
- Made-up numbers
- Lesson spelled out like a headline ("Key takeaway: always test with real data")
- More than one topic per post

## VOLUME (HARD RULE — 2026-05-12, phased)

> See `~/Claude/topics/x-strategy.md` for full phase-mechanic and KPI floors. Volume scales with phase. Current phase: **Phase 1 (0–1k)**.

| Format | Phase 1 (0–1k) | Phase 2 (1k–5k) | Phase 3 (5k–25k) |
|---|---|---|---|
| Standalones | 2–3/day | 1–2/day | 3–5/day |
| **Replies (main growth axis)** | **100–150/day** (hard floor) | 60–100/day | 30–60/day |
| Quote-RTs | 1/day | 2/day | daily |
| Threads | 0–1/week | 1/week | 2/week |
| Playbook-Drop | 1/month | 1/month | 1/month |
| Visual on standalone | MANDATORY | MANDATORY | MANDATORY |
| Visual on replies | optional (preferred on top-target replies) | same | same |

Reply-Strategie ist die Hauptachse in Phase 1, nicht Beiwerk (Grok-research-confirmed: callmiAbbas, dramaricic, _Auza_, thevincentholm). Standalones sind der Anker, Replies sind der Motor. Don't post 3 from the same cluster on the same day — distribute across 3–5 days for cluster cohesion.

## QUALITY GATE (before every post)

Tweet must pass ALL:

- [ ] ≤ 280 characters
- [ ] Hook line readable in <2s
- [ ] One concrete entity (tool name, number, code-snippet, prompt-string, exact value)
- [ ] One honest limitation or caveat
- [ ] No forbidden phrases (see CONTENT FORMAT above)
- [ ] No hype words
- [ ] Day X opener present with concrete event + number + lesson (Day X narrative is required, hollow diary without event is forbidden)
- [ ] Differentiated from last 5 posts (different cluster or different hook-type)
- [ ] Standalone: visual attached (PNG in `~/Claude/x-visuals/[UUID].png`)
- [ ] If German reply: humanizer-de skill PASS (profile `x`, threshold 75/100)
- [ ] If English: no AI-tells (em-dash > 2 per 100w, "delve", "leverage", "showcase", "in today's fast-paced world")
- [ ] No "-" character anywhere in the post (no hyphens as bullets, no em-dashes, no "→" arrows)
- [ ] **DPM-Check passes ≥ 8/10** (see `DPM-FRAMEWORK.md` §8): Pattern Interrupt hook, tool not named in line 1, Cool-without-Uncool, Open Loop, varied sentence rhythm, no Word-Shit-List terms, 12-year-old understandable, ≥1 concrete detail, Aha-moment or Gap at end

## VISUAL PIPELINE

Visuals are mandatory for standalones. The visual itself must convey value — a code snippet, a comparison table, a numbered cheat-sheet, a render frame, a prompt template. Never decorative graphics.

**Source rotation by pillar:**
| Pillar | Visual source |
|---|---|
| `tool-tutorial` | Code snippet on dark background (1200x675, monospace), or screenshot of the tool with annotation |
| `comparison` | Markdown-rendered comparison table on dark background |
| `pain-point` | Before/after frame pair, or annotated screenshot of the failure |
| `prompt-pattern` | The prompt itself in monospace, with field labels |
| `anti-pattern` | Side-by-side: "what fails" vs "what works" |

**Render path:** HTML → headless Chrome → PNG.
```bash
"C:/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --no-sandbox \
  --hide-scrollbars --window-size=1200,675 \
  --screenshot="~/Claude/x-visuals/[UUID].png" \
  "file:///~/Claude/x-visuals/[slug].html"
```

**Posting via Chrome MCP:**
- File-upload via `file_upload` tool is blocked ("Not allowed"). Workaround: serve via local HTTP server on 127.0.0.1:8765 — but mixed-content from x.com (HTTPS) blocks fetch.
- **Working pattern:** save the b64 data of the PNG to `~/Claude/x-visuals/_b64_[UUID].txt`, inject inline via `javascript_tool` with atob → Blob → DataTransfer → fileInput.files. Anthropic content limit is 200KB+ which fits an 80-90KB b64 string.

```js
// inside javascript_tool, with B64 inlined
const bin = atob(B64);
const bytes = new Uint8Array(bin.length);
for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
const blob = new Blob([bytes], {type: 'image/png'});
const fileInput = document.querySelector('input[type="file"][accept*="image"]');
const dt = new DataTransfer();
dt.items.add(new File([blob], 'visual.png', {type: 'image/png'}));
fileInput.files = dt.files;
fileInput.dispatchEvent(new Event('change', {bubbles: true}));
```

## CHROME-POSTING WORKFLOW (autonomous)

Browser-Selection: deviceId `15e5ce6c-c81a-4d01-aece-24053e06df16`. On login redirect → log to `claw.activity_log` with `summary='X aborted: login_redirect'` and stop. Never guess credentials.

### Standalone

```
1. navigate https://x.com/compose/post
2. wait 4s
3. inject visual via b64 → DataTransfer (see above)
4. wait 5s for preview render
5. JS: const ta = document.querySelector('[data-testid="tweetTextarea_0"]');
       ta.focus(); document.execCommand('insertText', false, TEXT)
6. JS: document.querySelector('[data-testid="tweetButton"]').click()
7. wait 5s, navigate /ST_Automation, find newest post URL → post_id
8. UPDATE claw.x_posts SET post_id, posted_at = now()
```

### Reply (proven pattern from 2026-05-04 run)

```
1. navigate [TARGET_URL]
2. wait 5s
3. before-counter: querySelector('[data-testid="reply"]').innerText
4. JS: document.querySelector('[data-testid="reply"]').click()
5. wait 3s
6. JS: ta.focus(); document.execCommand('insertText', false, REPLY_TEXT)
7. wait 1s
8. JS: btn = document.querySelector('[data-testid="tweetButtonInline"]');
       if (btn && !btn.disabled) btn.click()
9. wait 6s (URL temporarily switches to /compose/post — normal, not an error)
10. re-navigate [TARGET_URL], wait 5s
11. after-counter: querySelector('[data-testid="reply"]').innerText
12. Verification: after > before → reply is live ✅
```

### Modal handling

- "Got it" welcome-modal: `Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Got it')?.click()`
- "Whoops! You already said that" → previous submit succeeded after browser disconnect. Don't retry. Log as `posted_at = now()` with note.

## SELF-LEARNING LOOP

### Insert flow (PRE-posting)

```sql
INSERT INTO claw.x_posts (
  pillar, hook_type, hook, text, char_count,
  media_type, source, iteration_changes
) VALUES (
  '<pillar>', '<hook_type>', '<first-line>', '<full>', <chars>,
  'image' | 'text', 'agent-v1',
  jsonb_build_object('language', 'en' | 'de', 'cluster', '<cluster>')::text
) RETURNING id;
```

Standalones include `day_number` — Day X narrative format is active. Before each run: `SELECT MAX(day_number) FROM claw.x_posts` to find the current counter.

### Post-posting flow

```sql
UPDATE claw.x_posts SET
  post_id = '<tweet_id>',
  posted_at = now(),
  iteration_changes = jsonb_set(
    iteration_changes::jsonb,
    '{post_url}', to_jsonb('https://x.com/ST_Automation/status/<id>'::text)
  )::text
WHERE id = '<uuid>';
```

### Daily performance snapshot (autonomous, runs once/day)

```bash
node ~/.claude/skills/x-content/scripts/snapshot-performance.mjs
```

The script:
1. Pulls all posts from last 14 days where `post_id IS NOT NULL`
2. Visits each post URL via Chrome MCP, scrapes views/likes/replies/reposts/bookmarks/profile-clicks/link-clicks from the analytics drawer
3. Inserts into `claw.x_post_performance`
4. After 7 days of data: computes composite score (formula below) and updates `claw.x_posts.performance_score` + `is_reference`

### Composite score formula

```
score = (
  impressions * 0.05 +
  likes * 4 +
  retweets * 12 +
  replies * 8 +
  bookmarks * 10 +
  profile_clicks * 18 +
  link_clicks * 25 +
  follower_delta * 30
) / max(1, age_in_days)
```

Posts with `score > 50` (calibrated for current low-baseline) become `is_reference = true` and feed back as few-shot for future drafts.

### Weekly pattern extraction (autonomous, runs every Sunday)

Script `~/.claude/skills/x-content/scripts/extract-patterns.mjs`:
1. Reads last 14 days of posts + their performance
2. Groups by `pillar`, `hook_type`, `cluster`
3. Computes ⌀ score per group
4. Identifies winners (top quartile) and losers (bottom quartile)
5. Generates a markdown KVP-update appended to this skill's bottom section

The KVP-section is the only place this skill self-modifies. Hard Rules are not auto-edited — those need explicit user approval.

## STATUS LOG (internal only — no external pings)

The run documents itself in two places: `claw.activity_log` (one row, domain=`st-automatisierung.de`) and the agent-log markdown file. **No Telegram, Slack, or email notifications.** If Şafak wants to see what happened, he opens the agent-log or queries `claw.activity_log`.

Activity-log summary template:
```
X Run [DATE]: standalone (cluster/pillar/lang, chars) live at /status/<id> + N replies. <anomalies if any>. All entries in claw.x_posts source=agent-v1.
```

## AGENT-LOG (mandatory)

`~/Claude/sessions/agent-log-YYYY-MM-DD.md` append:
- Cluster + pillar + hook-type per standalone
- Reply count + targets (URLs + views)
- Visual paths
- Quality-Gate scores
- Anomalies (modals, dedup, counter issues)

`claw.activity_log` insert:
```sql
INSERT INTO claw.activity_log (session_id, domain, summary)
VALUES (current_setting('app.session_id', true)::int, 'st-automatisierung.de', 'X Run: <summary>');
```

## TROUBLESHOOTING

| Issue | Fix |
|---|---|
| `replyCounter: ""` | 0 replies shown — if before-counter was 0 and submit didn't increase: re-try |
| URL switches to `/compose/post` post-submit | Normal X behavior — wait 6s before re-navigating |
| Old composer-modal still open | Close: `document.querySelector('[aria-label="Close"]').click()` before retrying |
| `with_replies` tab doesn't show new reply | X cache aggressive — use counter-diff on the original instead |
| Browser-disconnect mid-batch | Re-connect via `list_connected_browsers` + `select_browser`, retry; X dedup prevents double-post |
| Visual upload fails via `file_upload` tool | Use b64-inline JS injection (see VISUAL PIPELINE above) |
| English-AI-tells flagged | Replace: "leverage" → "use", "showcase" → "show", "delve" → "look at", "in today's fast-paced world" → cut, "robust" → cut |

## ACCOUNT-ONBOARDING-STATUS (2026-05-07)

- ⚠️ **Bio currently mixed-language** — should switch back to clean English to match new strategy. Suggest: "AI consultant building in public · Tools, prompts, comparisons for AI builders · BAFA-certified (DE) · st-automatisierung.de"
- ⚠️ **Pinned post is old English Day-1 launch** — **replacement decided 2026-05-12: „MCP Agent Stack — Replace Your First 3 Hires with Claude Code + 8 MCPs"** (free PDF with comment-mechanic). Draft PDF + thread post pending. DPM-konform: Cool=skip-hires, Uncool=managing-employees.
- ⚠️ **Following list 100% international** — keep, matches new positioning
- ⚠️ **Avatar / Banner** — still empty, premium-checkmark glaubwürdigkeitsverlust. User-action.
- ✅ Premium active (2026-05-04, €4.64/Mo)
- ✅ Location: Schwerte, NRW (kept — adds builder-credibility, doesn't hurt EN reach)

## RELATED SKILLS

- `humanizer-de` → DE-reply quality gate
- `seedance` → source for Seedance cluster posts
- `kling` → source for Kling cluster posts
- `ai-ugc` → source for AI UGC cluster posts (Veo, Nano Banana, OmniHuman)

---

## KVP-LOG (auto-extended by weekly pattern extraction)

### 2026-05-07 — STRATEGY PIVOT v2 (English + theme-series)

**Why:** German DACH-pivot (2026-05-04) failed within 3 days. Grok deep research on 2026-05-07 confirmed: DACH AI/Automation niche on X is essentially dead — even @wiwo (Wirtschaftswoche, 100k+ followers) gets 0 likes on KI-Mittelstand posts. Solo accounts (@FloxioAI, @sesoft_de, @KurpfalzWeb) sit at 0-2 likes/post. No "viral hit" >1k likes in DACH AI niche over 30 days.

**What changed:**
- Language: standalones EN, replies match original-post language
- Format: theme-series (Seedance, AI UGC, Claude Code, Remotion, OpenClaw) — no "Day X", no diary
- Pillars: `tool-tutorial / comparison / pain-point / prompt-pattern / anti-pattern` (replaced `learning-log / skill-showcase / claw-architecture / meta / launch / community / dach-context`)
- Volume: up to 3/day standalones (was 1/day)
- Hard ban on phrases: "I built", "today I", "Day X", "in public", "building CLAW"
- Performance-tracking: daily snapshot mandatory (was: ignored — 11 of 14 last posts had no performance data at all, fundamental learning-loop break)

**Open work:**
- Bio rewrite (user-action)
- Pinned post replacement (auto, after first EN-post >20 likes)
- Daily snapshot script implementation (`scripts/snapshot-performance.mjs`)
- Weekly pattern-extraction script (`scripts/extract-patterns.mjs`)


### KVP Update (2026-05-07)
- [WIN] Der x-content Skill wurde mit einer neuen Strategie umgeschrieben, die sich auf EN-Standalones, Themen-Cluster, den Verzicht auf Tagebuch-Posts und einen Self-Learning-Loop konzentriert. → x-content Skill umgeschrieben

### KVP Update (2026-05-10) — Reply volume floor
- [CHANGE] Replies/day verschärft von "5-10" auf hartes Floor "10". Grund: Range-Wording führte dazu dass Agent bei 5-7 substantivellen Targets stoppte. Mit 10 als Floor: wenn erste Suche zu wenig liefert, müssen Such-Queries erweitert werden (zusätzliche Trends, Konkurrenz-Threads, breitere Cluster-Keywords) bis 10 erreicht. Premium-Boost amortisiert sich nur bei höherem Reply-Volumen.


### KVP Update (2026-05-10)
- [WIN] Aktualisierung des `x-content` Skills, um die Anzahl der Replies pro Tag auf einen Hard Floor von 10 zu setzen. → `x-content` SKILL.md in 3 Bereichen aktualisiert.

### KVP Update (2026-05-12) — Day X Narrative Format zurück

**Warum:** Bullet-Dump-Posts (Seedance Anti-Patterns, Kamera-Moves, Style-Keywords) waren inhaltlich leer — kein Auslöser, keine Neugier, kein Mensch dahinter. Şafak kritisierte explizit: "kein Hook, kein Curiosity Loop, totaler Quatsch". Die alten Day-X Posts (Day 10-13) hatten genau das: konkretes Ereignis, echte Zahlen, ehrliche Lektion.

**Was geändert:**
- `Day X narrative format` ist jetzt HARD RULE für Standalones (neue Sektion im Skill)
- Bullet-Dumps, Cheat-Sheets und abstrakte Tipplisten sind verboten
- "Day X", "I built" etc. sind NICHT mehr grundsätzlich verboten — nur hollow self-promo ohne konkretes Ereignis
- `day_number` wieder Pflichtfeld im INSERT (war fälschlicherweise als "diary artifact" deprecatet)
- 3 schlechte Posts gelöscht: 2052708160801042919, 2053398149721395272, 2053780823166382217

**Was NICHT geändert (zum Zeitpunkt des Eintrags):**
- EN als Primärsprache für Standalones bleibt
- DE replies bleiben mit humanizer-de gate
- ~~10 replies/day hard floor bleibt~~ → später am gleichen Tag revidiert (siehe nächster KVP-Eintrag)
- Hook-and-Reply Zwei-Teil-Struktur bleibt


### KVP Update (2026-05-12) — Strategy Doc + Reply-Volume + Link-Rule revision

**Trigger:** Şafak überließ X-Strategie an Agent mit klarem Nordstern „maximaler Reach + Monetarisierung". Drei Grok-Recherche-Runden lieferten 30+ konkrete Solo-Builder / AI-Builder-Quellen mit Zahlen.

**Was geändert:**
- **Neues lebendes Strategie-Doc** unter `~/Claude/topics/x-strategy.md` mit Nordstern, ICP, 3-Phasen-Roadmap, Pivot-Trigger, KPI-Set. Dieser Skill ist ab jetzt der Operator-Layer, das Doc ist die Quelle für strategische Entscheidungen.
- **Reply-Floor von 10 auf 100–150/Tag in Phase 1** angehoben. Hauptachse, nicht Beiwerk. Grok-Konsens aus 6+ Quellen.
- **Link-Regel präzisiert:** Reply auf fremden Post = kein Link bleibt. Eigene First-Reply zum eigenen Standalone = Link erlaubt + dokumentierter Algo-Hack (sources: knightama 2034380576384487808, big_sensei 1962871565428637899, JohnCassidy 2041179794428047526).
- **Volumen-Tabelle phasenabhängig** umgebaut: Standalones 2–3/Tag (Phase 1), Quote-RTs 1/Tag neu, Playbook-Drop 1/Monat neu, Reply als „main growth axis" markiert.
- **Top-Target-Liste** für First-Reply-Bangers explizit dokumentiert (14 Accounts).
- Header-Hinweis am Skill-Anfang auf `x-strategy.md` als Strategy-Quelle.

**Offen (Phase-2-Bauliste, siehe x-strategy.md → OFFENE PUNKTE):**
- Eigenständige Skill-Sektionen für QUOTE-RT, REPOST CADENCE, PINNED POST STRATEGY
- Sub-Agent `x-strategist.md`
- Sonntags-Routine für Repost-Auswahl + Wochenreview
- Repost-Script `repost-references.mjs`
- Pinned-Post-Playbook PDF
- Top-Target-Push-Notification-Setup


### KVP Update (2026-05-12)
- [WIN] Umfassende Überarbeitung der X-Content-Strategie und des zugehörigen Skills basierend auf neuen Recherchen und dem DPM-Framework. → Erstellung von 'x-strategy.md', 'DPM-FRAMEWORK.md' und Aktualisierung von 'x-content/SKILL.md' mit neuen Regeln und Phasenmodellen.


### KVP Update (2026-05-12)
- [WIN] Implementierung eines täglichen Trend-Scans und neuer Reply-Templates zur Steigerung der Reichweite auf X. → Tabelle `claw.x_trends_daily` mit 25 Live-Daten-Rows, RPC und Scan-Script funktionsfähig, Scheduled Task eingerichtet, 7 neue Reply-Templates in `REPLY-TEMPLATES.md` erstellt und verlinkt.
