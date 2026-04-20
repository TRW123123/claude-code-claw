# AGENTS.md — Agent Registry & Routing Table
> Letzte Aktualisierung: März 2026
> Welcher Agent macht was. Immer hier nachschauen bevor ein Task gestartet wird.

---

## SYSTEM-NAMEN

| Name | Basis | Rolle |
|------|-------|-------|
| **CLAW** | Claude Code | Autonomes lokales System. Supabase Memory. Ausführung. |
| **Antigravity** | Gemini | Architekt, Researcher, SEO-Suite, paralleler Agent |

---

## ARCHITEKTUR

```
Safak Tepecik (Director)
    │
    ├── CLAW (Claude Code — dieses System)
    │       Skills:  C:\Users\User\Claude\skills\
    │       Memory:  Supabase pgvector (autonom, lesen+schreiben)
    │       Wissen:  Pinecone (nur lesen — NIEMALS schreiben)
    │
    └── Antigravity (Gemini-basiert, paralleler Architekt)
            Skills:  C:\Users\User\.gemini\antigravity\skills\
            Brain:   C:\Users\User\.gemini\antigravity\
            Memory:  Pinecone (lesen+schreiben — manuell durch Safak Tepecik)
```

---

## MEMORY-REGELN (KRITISCH)

### Supabase — CLAW's autonomes Memory
- CLAW liest und schreibt selbstständig
- Session-Scope: temporär, wird nach Abschluss geleert
- User-Scope: permanente Learnings aus CLAW-Sessions
- Embedding: Google gemini-embedding-001 (kostenlos, 1.000 req/Tag Free Tier)

### Pinecone — kuratiertes Wissensspeicher
- ✅ CLAW darf Pinecone **lesen/abfragen**
- ❌ CLAW darf Pinecone **NIEMALS schreiben/updaten**
- ✅ Nur Safak Tepecik löst Pinecone-Updates manuell aus
- ✅ Antigravity schreibt auf Safak Tepeciks Anweisung

**Regel:** Skill existiert in CLAW → nutze ihn hier.
Skill existiert nur in Antigravity → Bridge nutzen (ANTIGRAVITY_BRIDGE.md).
Skill existiert in beiden → CLAW hat Vorrang.

---

## CLAUDE CODE — SKILL REGISTRY

| Skill | Trigger | Was er tut |
|-------|---------|------------|
| `ai-ugc` | Video, Reels, UGC, Instagram Content | Video-Pipeline: Remotion + Veo 3.1 + Nano Banana |
| `deployment` | git push, Netlify Deploy, live schalten | Preflight-Check: Build, TS, Routing, Security Headers |
| `outreach` | Cold Email, LinkedIn, Instantly, Kampagne | DACH+TR Outreach-Sequenzen, Follow-Ups |
| `pseo` | pSEO, programmatic SEO, Seiten generieren | pSEO Workflow für DACH-Projekte |
| `strategie` | Strategie, Prioritäten, Business-Entscheidung | Strategische Analyse und Entscheidungsrahmen |
| `claw-memory` | Memory speichern/lesen, Auto-Flush | Hippocampus: Supabase pgvector + Gemini Embedding |

---

## ANTIGRAVITY — SKILL REGISTRY

### Recherche & Analyse
| Skill | Was er tut |
|-------|------------|
| `autoresearch-protocol` | Basis-Recherche-Loop |
| `autoresearch-debate-protocol` | The Colosseum: Lösungen gegeneinander antreten lassen |
| `autoresearch-master-architecture` | Gesamtarchitektur für komplexe Recherchen |
| `pseo-autoresearch-loop` | pSEO-spezifischer Recherche-Loop |
| `dataforseo-mcp-playbook` | DataForSEO Abfragen und Auswertung |

### SEO (vollständige Suite)
| Skill | Was er tut |
|-------|------------|
| `seo-forensic-master-audit` | Vollständiger forensischer SEO-Audit (White+Black Box) |
| `seo-audit` | Standard SEO-Audit |
| `seo-technical` | Technisches SEO |
| `seo-content` | Content-SEO |
| `seo-competitor-pages` | Wettbewerber-Analyse |
| `seo-programmatic` | Programmatic SEO Seiten |
| `seo-page` | On-Page Optimierung |
| `seo-plan` | SEO-Strategie und Planung |
| `seo-schema` | Schema Markup |
| `seo-sitemap` | Sitemap-Generierung |
| `seo-images` | Bild-SEO |
| `seo-geo` | Lokales/Geo SEO |
| `seo-hreflang` | Hreflang für Mehrsprachigkeit |
| `seo-best-practice-guard` | SEO-Guardrails, verhindert Fehler |

### Build & Deployment
| Skill | Was er tut |
|-------|------------|
| `deployment-preflight` | Pre-Deploy Checks |
| `cross-platform-build` | Cross-Platform Build-Prozesse |
| `netlify-routing-protocol` | Netlify Routing-Regeln und _redirects |
| `github-project-management-skill` | GitHub Issues, PRs, Branches — 7-Step Pipeline |

### Memory & Wissen
| Skill | Was er tut |
|-------|------------|
| `pinecone-memorization-protocol` | Strukturiertes Schreiben in Pinecone (wissenspeicher) |
| `pinecone-retrieval-protocol` | Gezieltes Abrufen aus Pinecone |

### Design & UI/UX
| Skill | Was er tut |
|-------|------------|
| `stitch-elite-prototyper` | Awwwards-Level UI via Google Stitch |
| `design-prompt-generator` | Elite Design-Prompts für Cursor/v0/Claude |
| `state_anchored_creative_execution` | Kreative Outputs durch erzwungene Tension/Ambiguity |

### Utilities
| Skill | Was er tut |
|-------|------------|
| `planning` | Task-Planung und Breakdown |
| `troubleshooting` | Systematisches Debugging |
| `transcript-processor` | Meeting-Transkripte verarbeiten |
| `eod-project-scanner` | End-of-Day: alle Projekte scannen, Status updaten |
| `llm-behavior-guardrails` | LLM-Verhalten absichern, Halluzinationen blockieren |
| `skill_creator` | Neue Skills erstellen und optimieren |
| `dealership-website-generator` | Autohandel-Website Blueprint (instant deploy) |

---

## ROUTING-REGELN

**Video/Content** → `ai-ugc` (Claude Code)
**SEO irgendwas** → Antigravity SEO-Suite
**Deployment/Push** → `deployment` (Claude Code) — MANDATORY, kein Bypass
**Outreach/Sales** → `outreach` (Claude Code)
**Recherche mit Debate** → `autoresearch-debate-protocol` (Antigravity)
**CLAW Memory speichern** → `claw-memory` (Claude Code) → Supabase — AUTOMATISCH
**Pinecone schreiben** → ❌ NIEMALS durch CLAW — ausschließlich manuell durch Safak Tepecik
**Pinecone lesen/abfragen** → Pinecone MCP direkt (read-only für CLAW)
**CLAW Memory lesen** → `claw-memory` (Supabase) → hybrid search
**UI/UX Design** → `stitch-elite-prototyper` (Antigravity)
**GitHub Workflow** → `github-project-management-skill` (Antigravity)
**Neuer Skill nötig** → `skill_creator` (Antigravity)

---

## STATUS (Phasen)

| Feature | Status |
|---------|--------|
| Identity Layer (SOUL.md, AGENTS.md) | ✅ Phase 1 |
| Memory Hippocampus (Supabase pgvector) | ✅ Phase 2 |
| Auto-Research Hook (UserPromptSubmit) | ✅ Phase 2 |
| Auto-Learning Loop (Stop Hook) | ✅ Phase 2 |
| Context Scoping (Global/Domain/Project) | ✅ Phase 2 |
| Webhooks via Supabase Edge Function | ✅ Phase 5 |
| Telegram Gateway | ⏸️ keine Eile |
| Voice/STT | ⏸️ Teil von Telegram |
| Proaktive Cron-Tasks (EOD Scanner) | ❌ offen |
| Proaktive Alerts (Netlify, Traffic) | ❌ offen |
| Skill Auto-Trigger | ❌ offen |
