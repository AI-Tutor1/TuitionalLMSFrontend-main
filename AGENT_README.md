# Tuitional LMS — Agent-Assisted Bug Remediation

## What This Is

A complete, auditable system for fixing 25 catalogued bugs in the Tuitional LMS Frontend using Claude Code as the execution agent. Every bug has documented before/after code, validation steps, and commit messages.

## Quick Start

```bash
# 1. Clone the LMS repo
git clone <your-lms-repo-url>
cd TuitionalLMSFrontend-main

# 2. Run the setup script
chmod +x .agent-setup/setup.sh
./.agent-setup/setup.sh

# 3. Open Claude Code in this directory
# Claude Code will automatically read CLAUDE.md

# 4. Copy-paste Prompt 1 from EXECUTION_PROMPTS.md into Claude Code
# 5. Review changes, then copy-paste Prompt 2, then 3, then 4
```

## Repository Structure

```
TuitionalLMSFrontend-main/
├── CLAUDE.md                          ← Master prompt (Claude Code reads this automatically)
├── AUDIT_REPORT.md                    ← 25-bug audit with severity ratings and quality scores
├── .env.example                       ← Environment variable template
│
├── .agent-docs/                       ← Documentation for the agent
│   ├── AGENT_TASKS.md                 ← 18 tasks with exact code, paths, validations (970 lines)
│   ├── AGENT_MEMORY.md                ← Memory system architecture
│   ├── DESIGN.md                      ← Visual design system (VoltAgent format)
│   ├── ARCHITECTURE.md                ← Full platform architecture (1499 lines)
│   └── EXECUTION_PROMPTS.md           ← Copy-paste prompts for Claude Code
│
├── .agent-context/                    ← Memory system (TOML + JSON + Markdown)
│   ├── project.toml                   ← Project DNA (stack, routing, data hierarchy)
│   ├── rules.toml                     ← Coding standards and patterns
│   ├── contracts/
│   │   ├── api-contracts.toml         ← API endpoint specifications
│   │   └── component-props.toml       ← Component interface contracts
│   ├── registry/
│   │   ├── index.json                 ← Manifest (counts, domains, god nodes)
│   │   ├── routes.json                ← All 46 routes mapped to screens
│   │   ├── hooks.json                 ← 7 custom hooks with signatures
│   │   └── services.json              ← 39 services with functions
│   ├── graph/
│   │   ├── god-nodes.json             ← Top 10 most-imported entities
│   │   └── domains.json               ← 9 domain clusters
│   ├── sessions/
│   │   ├── current-task.md            ← Active task tracker
│   │   └── history/                   ← Completed task archives
│   └── scripts/
│       └── rebuild-registry.ts        ← Registry regeneration script
│
├── .agent-setup/                      ← Setup automation
│   └── setup.sh                       ← One-command setup script
│
└── src/                               ← The actual codebase (728 files)
```

## Execution Flow

```
                  You
                   │
                   ▼
        ┌──────────────────┐
        │  EXECUTION       │
        │  PROMPTS.md      │
        │  (copy-paste)    │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐     reads      ┌──────────────────┐
        │  Claude Code     │ ──────────────→ │  CLAUDE.md       │
        │  (the agent)     │                 │  (master rules)  │
        └────────┬─────────┘                 └──────────────────┘
                 │                                    │
                 │ follows                            │ points to
                 ▼                                    ▼
        ┌──────────────────┐              ┌──────────────────┐
        │  AGENT_TASKS.md  │              │  .agent-context/  │
        │  (18 tasks with  │              │  (memory system)  │
        │  exact code)     │              │                    │
        └────────┬─────────┘              └──────────────────┘
                 │
                 │ produces
                 ▼
        ┌──────────────────┐
        │  Fixed code +    │
        │  Git commits +   │
        │  Validation      │
        └──────────────────┘
```

## What Gets Fixed

### Tier 1 — Critical (Security + Runtime Failures)
| Bug | Issue | Impact |
|-----|-------|--------|
| BUG-001 | Double-brace in API URLs | Session update/delete returns 404 |
| BUG-002 | FormData fails on nested objects | Corrupted multipart payloads |
| BUG-003 | Password hash in localStorage | Security: credential exposure |
| BUG-004+005 | Hardcoded credentials, no env vars | Cannot deploy to different environments |
| BUG-006 | XSS in chat via unsanitized HTML | Any user can execute JS in others' browsers |

### Tier 2 — High (Incorrect Behavior)
| Bug | Issue |
|-----|-------|
| BUG-007 | No 401 handling — expired token silently breaks everything |
| BUG-010 | Vercel rewrite conflicts with Next.js routing |
| BUG-011 | CLAUDE.md contradicts actual auth behavior |
| BUG-012 | Query key collisions cause stale data |
| BUG-015 | Zero error boundaries — one error crashes entire app |
| BUG-017 | 40+ duplicated error handlers |
| BUG-018 | 25+ duplicated query param builders |
| BUG-022 | 2 JSX files in TypeScript project |

### Tier 3 — Medium (Code Quality)
| Bug | Issue |
|-----|-------|
| BUG-009 | Stale closures in useCallback hooks |
| BUG-014 | React strict mode disabled |
| BUG-019 | 7 file/directory name typos |
| BUG-020+021 | Dead code + sensitive console.log |
| BUG-024 | Blank screen during app bootstrap |

## Audit Trail

Every change is auditable:
- **Each bug = one git commit** with format `fix(BUG-XXX): description`
- **Three branches**: `fix/tier-1-critical`, `fix/tier-2-high`, `fix/tier-3-medium`
- **Validation after each tier**: TypeScript check, lint, build
- **Final audit**: Prompt 4 produces a complete before/after comparison

## Scoring

| Category | Before | Target |
|----------|--------|--------|
| Security | 2/10 | 7/10 |
| Error Handling | 2/10 | 6/10 |
| Code Quality | 3/10 | 5/10 |
| Architecture | 5/10 | 5/10 (no change) |
| Performance | 6/10 | 6/10 (no change) |
| **Overall** | **3.0/10** | **6.0/10** |
