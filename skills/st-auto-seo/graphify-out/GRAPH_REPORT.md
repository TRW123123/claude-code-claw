# Graph Report - .  (2026-04-09)

## Corpus Check
- Corpus is ~12,254 words - fits in a single context window. You may not need a graph.

## Summary
- 76 nodes · 111 edges · 7 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 80,000 input · 22,053 output

## God Nodes (most connected - your core abstractions)
1. `Stage 1: Impressionen (4-Phase Pipeline)` - 19 edges
2. `Stage 2: Clicks CTR Optimization (Editor JSON Loop)` - 15 edges
3. `Cluster-specific AEO/GEO Mandatory Blocks` - 11 edges
4. `Composite Score Formula and Thresholds (>=70 pass, <60 review)` - 11 edges
5. `st-auto-seo Plugin (4-Stage SEO Funnel)` - 8 edges
6. `Brand Identity (ST BERATUNG, UG, Schwerte NRW)` - 8 edges
7. `Anti-AI Blacklist (Verbs, Adjectives, Transitions, Openings, Fillers)` - 8 edges
8. `Context-Sensitive Em-Dash Replacement` - 8 edges
9. `Workflow Pipeline (binding order)` - 7 edges
10. `Stage 0b: Link Building (Chrome Automation)` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Trust Signals (BAFA-Zulassung, Creditreform, IHK)` --semantically_similar_to--> `NAP Data (Name/Address/Phone - identical across directories)`  [INFERRED] [semantically similar]
  st-auto-context.md → stage-0-link-building.md
- `Competitor Backlink Gap Identification` --semantically_similar_to--> `3-Tier Directory List (Gelbe Seiten, WLW, BAFA Beraterliste)`  [INFERRED] [semantically similar]
  stage-0-authority.md → stage-0-link-building.md
- `Stage 2: Clicks CTR Optimization (Editor JSON Loop)` --references--> `Brand Voice (Sachlich, Sie-Form, kein Bro-Marketing)`  [EXTRACTED]
  stage-2-clicks.md → st-auto-context.md
- `Stage 0a: Domain Authority Tracking (weekly)` --shares_data_with--> `Stage 1: Impressionen (4-Phase Pipeline)`  [INFERRED]
  stage-0-authority.md → stage-1-impressions.md
- `Stage 1: Impressionen (4-Phase Pipeline)` --shares_data_with--> `Stage 2: Clicks CTR Optimization (Editor JSON Loop)`  [INFERRED]
  stage-1-impressions.md → stage-2-clicks.md

## Hyperedges (group relationships)
- **4-Stage SEO Funnel Flow** — stage_0_authority_tracking, stage_0_link_building, stage_1_impressions, stage_2_clicks, stage_3_conversions [EXTRACTED 1.00]
- **Content Quality Pipeline (Plain German > Anti-AI > AEO > Scrubber > Quality Gate)** — refs_plain_german_list, refs_anti_ai_blacklist, refs_aeo_cluster_mandates, refs_scrubber_em_dash, refs_quality_composite [EXTRACTED 1.00]
- **5 Content Scoring Dimensions** — refs_quality_5_dimensions, refs_quality_composite, refs_quality_editor_json, refs_quality_auto_revision, refs_quality_st_auto_stricter [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (17): Rationale: Em-Dash is #1 AI detection signal, Rationale: B2B Beratungs-Intent demands more precision than standard, Anti-AI Blacklist (Verbs, Adjectives, Transitions, Openings, Fillers), Em-Dash Rule (max 1, 0 for st-auto), Bro-Marketing Buzzwords (Game-Changer, Next Level, 10x), Filler Phrases to Strike, Plain German Word Replacement List (A-Z), 5 Content Scoring Dimensions (Humanity 30%, Specificity 25%, Structure 20%, SEO 15%, Readability 10%) (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (14): 4-Stufen-Funnel (Authority > Impressions > Clicks > Conversions), Stage 0a: Domain Authority Tracking (weekly), Chrome MCP Automation (Profil 1, navigate, form_input), claw.domain_authority Supabase Table, Competitor Backlink Gap Identification, DataForSEO Backlinks Tools (summary, bulk_ranks, spam_score, domain_intersection), 3-Tier Directory List (Gelbe Seiten, WLW, BAFA Beraterliste), Stage 0b: Link Building (Chrome Automation) (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (12): Beratungs-Intent (NOT Umsetzungs-Intent), Rationale: Position scoring is opportunity-type-specific not linear, Rationale: Stage 2 is fastest ROI (0.5-2% CTR push), Opportunity Scoring 8-Factor Formula, 4 Position Opportunity Types (Quick Win/Improvement/Medium/Long-Term), Cluster Priority (BAFA > AI Act > KI-Beratung > Strategieberatung > Schulung), Teil A: Weekly Analysis (Keyword Gaps, Opportunity Scoring), 3-Variant Title/Meta Generation with JSON Scoring (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.31
Nodes (9): Rationale: LLMs and target audience use different language than SEO tools, Stage 1 Anti-Patterns (no long-form block, no skip SERP), Phase 3: Section-by-section Article Plan, Stage 1 Composite Target >=75 (stricter than 70), Stage 1: Impressionen (4-Phase Pipeline), 12 pSEO Playbooks (Templates, Curation, Comparisons, Locations, etc), Phase 4: Section-by-section Writing with Mini-Score, Phase 1: SERP Analysis (mandatory) (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (9): Rationale: AI engines cite structured answer blocks not long-form, Cluster-specific AEO/GEO Mandatory Blocks, AEO Comparison Table Block, AEO Definition Block (Was ist X?), AEO FAQ Block (5+ FAQs mandatory), AEO Step-by-Step Block, GEO Evidence Sandwich (Claim > Proof > Implication), GEO Statistics Citation Block (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (7): Opportunity Buckets (CRITICAL/HIGH/MEDIUM/LOW/SKIP), Domain Config (st-automatisierung.de, Astro 5.1, Netlify), 15 Hard Rules (binding), Daily Agent Routing Logic, SEO Machine Repo Heritage (TheCraigHewitt/seomachine), st-auto-seo Plugin (4-Stage SEO Funnel), Supabase Tables (claw schema)

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (7): Brand Identity (ST BERATUNG, UG, Schwerte NRW), Brand Voice (Sachlich, Sie-Form, kein Bro-Marketing), Conflict Resolution Rules (Brand > Keyword, Intent > Traffic), Internal Linking Map (Hub pages to Calendly), Zielgruppe Persona (GF/IT-Leiter, 10-250 MA, KMU DACH), Trust Signals (BAFA-Zulassung, Creditreform, IHK), NAP Data (Name/Address/Phone - identical across directories)

## Knowledge Gaps
- **38 isolated node(s):** `Domain Config (st-automatisierung.de, Astro 5.1, Netlify)`, `Supabase Tables (claw schema)`, `15 Hard Rules (binding)`, `SEO Machine Repo Heritage (TheCraigHewitt/seomachine)`, `Zielgruppe Persona (GF/IT-Leiter, 10-250 MA, KMU DACH)` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Stage 1: Impressionen (4-Phase Pipeline)` connect `Community 3` to `Community 0`, `Community 1`, `Community 2`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.454) - this node is a cross-community bridge._
- **Why does `Stage 2: Clicks CTR Optimization (Editor JSON Loop)` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 6`?**
  _High betweenness centrality (0.256) - this node is a cross-community bridge._
- **Why does `Cluster-specific AEO/GEO Mandatory Blocks` connect `Community 4` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.204) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Stage 1: Impressionen (4-Phase Pipeline)` (e.g. with `Stage 0a: Domain Authority Tracking (weekly)` and `Stage 2: Clicks CTR Optimization (Editor JSON Loop)`) actually correct?**
  _`Stage 1: Impressionen (4-Phase Pipeline)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Stage 2: Clicks CTR Optimization (Editor JSON Loop)` (e.g. with `Stage 1: Impressionen (4-Phase Pipeline)` and `Stage 3: Conversions (CRO + GA4)`) actually correct?**
  _`Stage 2: Clicks CTR Optimization (Editor JSON Loop)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Domain Config (st-automatisierung.de, Astro 5.1, Netlify)`, `Supabase Tables (claw schema)`, `15 Hard Rules (binding)` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._