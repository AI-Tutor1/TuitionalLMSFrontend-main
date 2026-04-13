# ARCHITECTURE.md — AI Agent Orchestration Platform

**Document Classification:** Engineering Architecture Specification  
**Version:** 1.0.0  
**Date:** 2026-04-13  
**Status:** Design-Complete, Pre-Implementation  
**Authors:** CTO Architecture Review  
**Review Cadence:** Every phase boundary

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architectural Principles](#2-architectural-principles)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Agent Architecture](#4-agent-architecture)
5. [Memory System Design](#5-memory-system-design)
6. [Tooling & Execution Layer](#6-tooling--execution-layer)
7. [TypeScript Bridge Design](#7-typescript-bridge-design)
8. [API Design (FastAPI)](#8-api-design-fastapi)
9. [State Management & Workflow Engine](#9-state-management--workflow-engine)
10. [Observability & Monitoring](#10-observability--monitoring)
11. [Failure Modes & Risk Analysis](#11-failure-modes--risk-analysis)
12. [Scalability Strategy](#12-scalability-strategy)
13. [Security Model](#13-security-model)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Governance Files](#15-governance-files)

---

## 1. SYSTEM OVERVIEW

### 1.1 Purpose

The AI Agent Orchestration Platform (AAOP) is a multi-agent system that autonomously analyzes, plans, executes, and validates code changes across frontend codebases. It coordinates specialized AI agents (Frontend, Backend, QA) under a Master Agent that operates as an automated CTO — decomposing high-level objectives into validated, committed code changes.

The system operates on the Tuitional LMS Frontend (728 files, Next.js 15, TypeScript) as its initial target codebase, with architecture designed for multi-project extensibility.

### 1.2 Core Responsibilities

| Responsibility | Description |
|---------------|-------------|
| **Task Decomposition** | Break high-level objectives ("fix all security bugs") into atomic, ordered subtasks |
| **Code Analysis** | Understand codebase structure via AST parsing, dependency graphs, and registry queries |
| **Code Generation** | Produce correct, pattern-compliant code changes |
| **Validation** | Type-check, lint, build-verify, and contract-validate every change before commit |
| **Memory Persistence** | Maintain awareness of project state, decisions, and context across sessions |
| **Human Coordination** | Surface decisions that require human approval, present diffs, accept feedback |
| **Observability** | Log every decision, tool invocation, token usage, and outcome for audit |

### 1.3 System Boundaries

**The system IS:**
- An autonomous code analysis and modification engine
- A task orchestration platform for coordinating multiple AI agents
- A memory-driven system that improves with usage
- A human-in-the-loop platform with approval workflows

**The system is NOT:**
- A code hosting platform (uses existing git repos)
- A CI/CD pipeline (triggers external CI, does not replace it)
- A production deployment system (generates code, does not deploy it)
- A general-purpose AI assistant (scoped strictly to code operations)
- A real-time IDE plugin (operates as a background service with dashboard)

### 1.4 Non-Goals

- **Not a code generation chatbot.** The system does not respond to freeform prompts. It executes structured task definitions.
- **Not a replacement for human review.** Every change above a configurable risk threshold requires human approval before merge.
- **Not a multi-language polyglot system in Phase 1.** Initial scope is TypeScript/React. Python backend analysis is Phase 3+.
- **Not real-time collaborative editing.** The system operates on branches, not live files.

---

## 2. ARCHITECTURAL PRINCIPLES

### Principle 1: Deterministic Execution

**Definition:** Given identical inputs (task definition + codebase state + memory state), the system must produce identical execution plans. The plan may invoke non-deterministic LLM calls, but the execution framework around them is deterministic.

**Why it exists:** Agent systems fail when execution order is implicit. If Agent A and Agent B can run in any order and their outputs conflict, the system is non-deterministic. Deterministic execution ordering eliminates conflict classes entirely.

**What breaks if violated:** Agents modify the same file simultaneously, producing merge conflicts, corrupted state, or silent data loss. Human reviewers cannot predict or reproduce agent behavior.

### Principle 2: Separation of Intelligence from Execution

**Definition:** The LLM (Claude) provides intelligence (analysis, planning, code generation). The execution framework provides safety (validation, file operations, git, builds). These are strictly separated — the LLM never directly executes commands.

**Why it exists:** LLMs hallucinate. If the LLM directly writes to the filesystem, a hallucinated path could overwrite critical files. The execution layer validates every operation before performing it.

**What breaks if violated:** A hallucinated `file_write` to `package.json` with malformed JSON bricks the project. A hallucinated `shell_exec("rm -rf /")` is catastrophic.

### Principle 3: Contract-First Interfaces

**Definition:** Every boundary between components (Python ↔ TypeScript bridge, API ↔ Dashboard, Agent ↔ Memory) is defined by an explicit contract (JSON Schema, TOML spec, or TypeScript interface) that is version-controlled and validated at runtime.

**Why it exists:** When multiple systems communicate, implicit contracts drift silently. The Python orchestrator assumes the TS bridge returns `{ props: string[] }` but it actually returns `{ props: { name: string, type: string }[] }`. This class of bug is eliminated by schema validation on every boundary crossing.

**What breaks if violated:** Silent data corruption. The orchestrator makes decisions based on malformed data from the TS bridge, producing incorrect code changes.

### Principle 4: Idempotent Operations

**Definition:** Every tool invocation and agent action must be idempotent — executing it twice with the same inputs produces the same result without side effects.

**Why it exists:** Agent retries are frequent. Network failures, LLM timeouts, and validation failures all trigger retries. If `file_write("x.ts", content)` appends instead of overwrites, a retry corrupts the file.

**What breaks if violated:** Duplicate git commits, appended file content, double API calls, inconsistent state after retry cycles.

### Principle 5: Observability-First Design

**Definition:** Every decision, tool call, LLM interaction, and state transition is logged with structured metadata (timestamp, agent_id, task_id, input_hash, output_hash, token_count, duration_ms). There are no silent operations.

**Why it exists:** When an agent produces incorrect code, the debugging question is "why did it make that decision?" Without observability, this question is unanswerable. The system becomes a black box.

**What breaks if violated:** Debugging agent failures requires reproducing the entire execution from scratch. Cost tracking is impossible. Performance optimization has no data.

### Principle 6: Blast Radius Containment

**Definition:** Every operation has a bounded blast radius. File writes are scoped to the target project directory. Git operations are scoped to feature branches. Shell commands are allowlisted. No operation can affect files outside the project root.

**Why it exists:** An agent operating on the Tuitional LMS should never be able to modify the orchestration platform's own code, the operating system, or another project's files.

**What breaks if violated:** A misconfigured path causes the agent to overwrite its own configuration. A shell command with path traversal modifies system files.

### Principle 7: Human-in-the-Loop as Architecture, Not Afterthought

**Definition:** Human approval checkpoints are first-class architectural components with defined trigger conditions, timeout behaviors, and fallback actions. They are not optional UI features.

**Why it exists:** AI agents make confident mistakes. A high-confidence incorrect refactor that passes all automated checks but violates business logic must be caught by a human before it reaches `main`.

**What breaks if violated:** Agents merge breaking changes automatically. The system becomes "move fast and break things" without the human safety net that makes autonomy viable.

### Principle 8: Memory as the Single Source of Coordination

**Definition:** All agent coordination happens through the file-based memory system (`.agent-context/`). Agents do not communicate directly. Agent A writes to memory, Agent B reads from memory. The orchestrator sequences access.

**Why it exists:** Direct agent-to-agent communication creates hidden dependencies, race conditions, and debugging nightmares. File-based memory is inspectable, version-controllable, and deterministic.

**What breaks if violated:** Two agents hold conflicting views of the project state. Coordination bugs are invisible because the communication channel is ephemeral (in-memory message passing, not persisted).

---

## 3. HIGH-LEVEL ARCHITECTURE

### 3.1 Layered System Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│  LAYER 4: PRESENTATION                                                │
│  Next.js + React Dashboard                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐              │
│  │ Task     │ │ Agent    │ │ Diff     │ │ Cost &     │              │
│  │ Board    │ │ Activity │ │ Review   │ │ Analytics  │              │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘              │
└──────────────────────────┬────────────────────────────────────────────┘
                           │ REST + WebSocket
                           ▼
┌───────────────────────────────────────────────────────────────────────┐
│  LAYER 3: ORCHESTRATION                                               │
│  Python + FastAPI + LangGraph                                        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  WORKFLOW ENGINE (LangGraph)                                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │ Plan     │→ │ Execute  │→ │ Validate │→ │ Commit/  │       │ │
│  │  │ Phase    │  │ Phase    │  │ Phase    │  │ Approve  │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │
│  │ Master    │ │ Frontend  │ │ Backend   │ │ QA        │           │
│  │ Agent     │ │ Agent     │ │ Agent     │ │ Agent     │           │
│  │ (active)  │ │ (active)  │ │ (Phase 3) │ │ (Phase 3) │           │
│  └─────┬─────┘ └─────┬─────┘ └───────────┘ └───────────┘           │
│        │              │                                               │
│  ┌─────┴──────────────┴─────────────────────────────────────────┐   │
│  │  TOOL REGISTRY                                                │   │
│  │  file_read │ file_write │ git_ops │ shell_exec │ ts_bridge   │   │
│  │  memory_read │ memory_write │ llm_call │ human_approve       │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────────┘
                              │ subprocess / CLI
                              ▼
┌───────────────────────────────────────────────────────────────────────┐
│  LAYER 2: INTELLIGENCE                                                │
│  TypeScript Bridge (ts-morph + CLI)                                  │
│                                                                       │
│  extract_props │ extract_imports │ extract_exports │ type_check      │
│  rebuild_registry │ validate_contracts │ lint │ dependency_graph     │
└──────────────────────────────┬────────────────────────────────────────┘
                               │ file system operations
                               ▼
┌───────────────────────────────────────────────────────────────────────┐
│  LAYER 1: TARGET CODEBASE                                             │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  .agent-context/         (Memory System)                       │   │
│  │  project.toml │ rules.toml │ registry/*.json │ graph/*.json  │   │
│  └───────────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  src/                    (Application Source Code)              │   │
│  │  app/ │ screens/ │ components/ │ services/ │ api/ │ types/    │   │
│  └───────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow: Task Execution

```
1. TASK INPUT
   Human submits task via Dashboard or AGENT_TASKS.md
   │
2. MASTER AGENT PLANNING
   Reads: project.toml, rules.toml, index.json, god-nodes.json, current-task.md
   Produces: Ordered subtask list with agent assignments
   │
3. AGENT EXECUTION (sequential per subtask)
   Frontend Agent receives subtask
   ├── Reads relevant registry entries (components.json, services.json)
   ├── Reads relevant contracts (api-contracts.toml, component-props.toml)
   ├── Invokes LLM with context window: [memory + subtask + relevant code]
   ├── LLM produces: { plan: string, file_changes: FileChange[], reasoning: string }
   ├── Execution layer validates each FileChange:
   │   ├── Path within project root? (SECURITY CHECK)
   │   ├── File exists for modification? (EXISTENCE CHECK)
   │   ├── Change matches expected pattern? (RULES CHECK)
   │   └── No god-node modification without approval? (BLAST RADIUS CHECK)
   ├── Execution layer applies changes
   ├── Invokes ts_bridge for type checking
   ├── Invokes ts_bridge for lint validation
   ├── Updates registry if structural change (new component, renamed file)
   └── Updates current-task.md progress
   │
4. VALIDATION PHASE
   ├── npx tsc --noEmit (type check)
   ├── npm run lint (lint check)
   ├── npm run build (build check, if configured)
   ├── Contract validation (registry consistency)
   └── If ANY validation fails → rollback file changes, report failure
   │
5. COMMIT / APPROVAL
   ├── If risk_level <= threshold: auto-commit
   ├── If risk_level > threshold: queue for human approval via Dashboard
   └── Human approves → commit; Human rejects → rollback + log reason
   │
6. MEMORY UPDATE
   ├── Update current-task.md (mark subtask complete)
   ├── Update registry/*.json (if structural changes)
   ├── Log to sessions/history/
   └── Proceed to next subtask or mark task complete
```

### 3.3 Data Flow: Inter-Layer Communication

| Source → Target | Protocol | Format | Frequency |
|----------------|----------|--------|-----------|
| Dashboard → API | REST (HTTP) | JSON | Per user action |
| API → Dashboard | WebSocket | JSON events | Per agent action (streaming) |
| Orchestrator → LLM | HTTPS (Anthropic API) | Messages API | Per LLM call (1-20 per subtask) |
| Orchestrator → TS Bridge | subprocess (stdin/stdout) | JSON (newline-delimited) | Per analysis/validation |
| Orchestrator → Filesystem | direct I/O | UTF-8 text | Per file read/write |
| Orchestrator → Git | subprocess (GitPython) | CLI commands | Per commit/branch operation |
| Orchestrator → Memory | direct I/O | TOML (read) + JSON (write) + MD (write) | Per session start + per subtask |

---

## 4. AGENT ARCHITECTURE

### 4.1 Agent Type: Master Agent (CTO)

**Role:** Strategic decomposition and coordination. Does not write code directly.

**Responsibilities:**
- Receive high-level task definitions (e.g., "Fix all Tier 1 critical bugs")
- Read project memory to understand current state
- Decompose task into ordered subtasks with dependencies
- Assign each subtask to the appropriate specialized agent
- Monitor execution progress
- Escalate to human when confidence is low or blast radius is high
- Archive completed tasks to session history

**Inputs:**
```python
class MasterAgentInput:
    task_definition: str                    # Human-readable objective
    project_context: ProjectContext          # From project.toml
    rules: RulesContext                      # From rules.toml
    registry_index: RegistryIndex           # From index.json
    god_nodes: list[GodNode]                # From god-nodes.json
    current_task: Optional[TaskState]       # From current-task.md
    task_history: list[CompletedTask]       # From sessions/history/
```

**Outputs:**
```python
class MasterAgentOutput:
    plan: TaskPlan
    subtasks: list[Subtask]                 # Ordered, with dependencies
    risk_assessment: RiskAssessment
    estimated_tokens: int
    requires_human_approval: bool
    reasoning: str                          # Chain-of-thought for audit

class Subtask:
    id: str                                 # "BUG-001", "BUG-002"
    description: str
    assigned_agent: AgentType               # FRONTEND | BACKEND | QA
    depends_on: list[str]                   # Subtask IDs that must complete first
    files_likely_modified: list[str]        # Predicted file paths
    risk_level: RiskLevel                   # LOW | MEDIUM | HIGH | CRITICAL
    estimated_llm_calls: int
    validation_required: list[ValidationType]  # TYPE_CHECK | LINT | BUILD | MANUAL
```

**Decision Boundaries:**
- Master Agent decides WHAT to do and WHO does it
- Master Agent does NOT decide HOW (that's the specialized agent's job)
- Master Agent does NOT write code (that's the specialized agent + LLM)
- Master Agent CAN reject a subtask result and request re-execution

**Failure Modes:**
| Failure | Cause | Mitigation |
|---------|-------|------------|
| Over-decomposition | Task split into too many tiny subtasks | Max subtask limit per task (configurable, default: 20) |
| Under-decomposition | Complex task treated as single subtask | Validation: if subtask modifies >5 files, force re-decomposition |
| Wrong agent assignment | Frontend task assigned to Backend agent | Validation: check file paths against agent domain expertise |
| Circular dependencies | Subtask A depends on B which depends on A | DAG validation on subtask dependency graph |

### 4.2 Agent Type: Frontend Agent

**Role:** Code analysis and modification for TypeScript/React/Next.js codebases.

**Responsibilities:**
- Read relevant source files and memory context
- Generate code changes (new files, modifications, deletions)
- Invoke TS bridge for code intelligence (AST parsing, type extraction)
- Validate changes via type checking, linting, and build
- Update registry after structural changes
- Report results to Master Agent

**Inputs:**
```python
class FrontendAgentInput:
    subtask: Subtask                       # From Master Agent
    relevant_files: list[FileContent]       # Source files the subtask touches
    contracts: ContractSet                  # Relevant TOML contracts
    registry_entries: list[RegistryEntry]   # Relevant component/hook/service entries
    rules: RulesContext                     # Coding standards
    design_system: DesignSystem             # From DESIGN.md
```

**Outputs:**
```python
class FrontendAgentOutput:
    status: SubtaskStatus                  # SUCCESS | FAILED | NEEDS_HUMAN_REVIEW
    file_changes: list[FileChange]
    validation_results: ValidationResults
    registry_updates: list[RegistryUpdate]  # New/modified entries for registry
    reasoning: str                          # Why these changes were made
    tokens_used: TokenUsage
    duration_ms: int

class FileChange:
    path: str                              # Relative to project root
    operation: FileOp                      # CREATE | MODIFY | DELETE | RENAME
    content: Optional[str]                 # Full file content for CREATE
    diff: Optional[str]                    # Unified diff for MODIFY
    old_path: Optional[str]                # For RENAME operations
```

**Decision Boundaries:**
- Frontend Agent decides HOW to implement the subtask
- Frontend Agent does NOT modify files outside `src/`, `.agent-context/`, or project config files
- Frontend Agent does NOT install npm packages without explicit subtask instruction
- Frontend Agent MUST validate every change before reporting success
- Frontend Agent MUST update registry if creating/renaming/deleting components

**Failure Modes:**
| Failure | Cause | Mitigation |
|---------|-------|------------|
| Hallucinated imports | LLM invents a non-existent module | TS bridge validates all imports resolve |
| Wrong file path | LLM targets non-existent file | Existence check before every MODIFY operation |
| Pattern violation | Generated code doesn't follow rules.toml | Post-generation lint check + rules validation |
| God node modification | Changes high-blast-radius component unsafely | Pre-check against god-nodes.json; require approval if blast radius > threshold |
| Build failure | Change introduces type errors or syntax errors | tsc + build check before commit; rollback on failure |

### 4.3 Agent Type: Backend Agent (Phase 3)

**Role:** Python/FastAPI code analysis and modification for backend codebases.

**Status:** Not implemented until Phase 3. Architecture reserved.

**Key differences from Frontend Agent:**
- Uses Python AST (`ast` module or `rope`) instead of ts-morph
- Validates with `mypy` instead of `tsc`
- Lints with `ruff` instead of ESLint
- Registry schema extended for Python modules, endpoints, models

### 4.4 Agent Type: QA/Validation Agent (Phase 3)

**Role:** Cross-cutting validation that no single agent can perform.

**Responsibilities:**
- Run end-to-end validation after all subtask agents complete
- Check cross-file consistency (does the component use the hook that was just modified?)
- Run build verification (`npm run build`)
- Verify registry consistency (does components.json match actual src/?)
- Generate diff summary for human review
- Flag potential regression risks based on dependency graph

**Key property:** The QA Agent never modifies code. It only reads, validates, and reports. This makes it safe to run at any point without side effects.

---

## 5. MEMORY SYSTEM DESIGN

### 5.1 Design Philosophy

The memory system uses three formats for three purposes (established in AGENT_MEMORY.md):

| Format | Purpose | Writers | Readers |
|--------|---------|---------|---------|
| TOML | Static config, rules, contracts | Human (rare), Master Agent (rarer) | All agents (every session) |
| JSON | Dynamic registry, indexes, graphs | Agents (after every structural change), rebuild script | All agents (on demand) |
| Markdown | Working memory, task state, decisions | Agents (during execution) | All agents + humans |

### 5.2 File Structure

```
.agent-context/
├── project.toml                  # [READ-MOSTLY] Project DNA
├── rules.toml                    # [READ-MOSTLY] Coding standards
├── contracts/
│   ├── api-contracts.toml        # [READ-MOSTLY] API endpoint shapes
│   └── component-props.toml      # [READ-MOSTLY] Component interfaces
├── registry/
│   ├── index.json                # [READ-WRITE] Manifest — counts, god nodes, issues
│   ├── components.json           # [READ-WRITE] Component registry
│   ├── routes.json               # [READ-WRITE] Route → screen mappings
│   ├── hooks.json                # [READ-WRITE] Custom hook registry
│   └── services.json             # [READ-WRITE] Service function registry
├── graph/
│   ├── god-nodes.json            # [READ-WRITE] High-blast-radius entities
│   └── domains.json              # [READ-WRITE] Domain cluster analysis
├── sessions/
│   ├── current-task.md           # [READ-WRITE] Active task state
│   └── history/                  # [APPEND-ONLY] Completed task archives
├── scripts/
│   └── rebuild-registry.ts       # [READ-ONLY] Registry regeneration tool
└── .gitignore                    # Ignores cache + local session files
```

### 5.3 Read/Write Rules

| File | Who Reads | Who Writes | Write Trigger | Concurrency |
|------|-----------|-----------|---------------|-------------|
| `project.toml` | All agents at session start | Human only | Manual project config change | No concurrent writes |
| `rules.toml` | All agents at session start | Human only | Standard update | No concurrent writes |
| `contracts/*.toml` | Agents when touching relevant domain | Human primarily | API/component contract change | No concurrent writes |
| `registry/index.json` | All agents at session start | Rebuild script, agents after structural changes | Component create/delete/rename | Sequential access enforced by orchestrator |
| `registry/components.json` | Frontend Agent when modifying components | Frontend Agent, rebuild script | After component structural change | Single-writer (orchestrator sequences) |
| `current-task.md` | All agents at session start | Active agent after each subtask | After each subtask step | Single-writer (only one agent active at a time) |
| `sessions/history/*.md` | Master Agent for context | Master Agent at task completion | Task archival | Append-only, no conflicts |

### 5.4 Consistency Guarantees

**Guarantee 1: Sequential Agent Access.** The orchestrator ensures only one agent writes to the memory system at any time. There are no concurrent writers.

**Guarantee 2: Rebuild Safety Net.** If any registry JSON file becomes inconsistent with the actual codebase, `scripts/rebuild-registry.ts` regenerates it from source. The code is always the source of truth; the registry is a cache.

**Guarantee 3: TOML Immutability During Execution.** TOML files are never modified by agents during task execution. They are read at session start and treated as constants. Only humans (or the Master Agent with explicit human approval) modify TOML files.

**Guarantee 4: Append-Only History.** Session history files are never modified after creation. They are append-only archives.

### 5.5 Versioning Strategy

- `.agent-context/` is committed to git alongside the project code
- TOML files (project.toml, rules.toml, contracts/) are versioned normally — changes require PR review
- Registry JSON files are regenerable — if they conflict during merge, regenerate with rebuild script
- `current-task.md` is gitignored (local to each developer/agent session)
- `sessions/history/` is gitignored (local archives)
- `.rebuild-cache.json` is gitignored (SHA256 hash cache for incremental rebuilds)

---

## 6. TOOLING & EXECUTION LAYER

### 6.1 Tool Registry Architecture

Tools are registered as Python functions with strict input/output schemas. The orchestrator calls tools on behalf of agents — agents never call tools directly.

```python
@dataclass
class ToolDefinition:
    name: str
    description: str
    input_schema: dict          # JSON Schema
    output_schema: dict         # JSON Schema
    risk_level: RiskLevel       # LOW | MEDIUM | HIGH | CRITICAL
    requires_approval: bool     # If True, queue for human approval
    idempotent: bool           # Must be True for all tools
    timeout_seconds: int
    allowed_paths: list[str]    # Glob patterns for allowed file paths
```

### 6.2 Tool Definitions

#### file_read

```python
# Input
{ "path": "src/components/global/button/button.tsx" }

# Output
{
  "content": "...",
  "encoding": "utf-8",
  "size_bytes": 1234,
  "last_modified": "2026-04-13T10:00:00Z"
}

# Constraints
# - Path must be within project root
# - Path must not contain ".." traversal
# - Max file size: 1MB
# - Risk: LOW
```

#### file_write

```python
# Input
{
  "path": "src/utils/helpers/sanitize-html.ts",
  "content": "...",
  "operation": "CREATE",            # CREATE | OVERWRITE
  "create_directories": true
}

# Output
{
  "success": true,
  "path": "src/utils/helpers/sanitize-html.ts",
  "bytes_written": 567,
  "previous_hash": null,            # SHA256 of previous content (null for CREATE)
  "new_hash": "a1b2c3..."
}

# Constraints
# - Path must be within project root
# - Cannot write to: node_modules/, .git/, .env.local
# - OVERWRITE requires previous_hash match (optimistic concurrency)
# - Risk: MEDIUM (CREATE) | HIGH (OVERWRITE)
```

#### git_ops

```python
# Input
{
  "operation": "COMMIT",             # BRANCH | COMMIT | CHECKOUT | STATUS | DIFF
  "branch": "fix/tier-1-critical",
  "message": "fix(BUG-001): remove double closing brace in session API URLs",
  "files": ["src/api/sessions.api.ts"]
}

# Output
{
  "success": true,
  "commit_hash": "abc123...",
  "branch": "fix/tier-1-critical",
  "files_committed": 1
}

# Constraints
# - Cannot push to main/master
# - Cannot force push
# - Cannot delete branches
# - Commit message must match format: type(scope): description
# - Risk: HIGH
```

#### shell_exec

```python
# Input
{
  "command": "npx tsc --noEmit",
  "working_directory": ".",          # Relative to project root
  "timeout_seconds": 120
}

# Output
{
  "exit_code": 0,
  "stdout": "...",
  "stderr": "...",
  "duration_ms": 4523
}

# Constraints
# - ALLOWLIST ONLY. Permitted commands:
#   - npx tsc --noEmit
#   - npm run lint
#   - npm run build
#   - npm install <package> (only with explicit subtask instruction)
#   - node .agent-context/scripts/rebuild-registry.ts
# - ALL other commands are REJECTED
# - Working directory locked to project root
# - Timeout enforced (default: 120s)
# - Risk: HIGH
```

#### ts_bridge

```python
# Input
{
  "command": "extract_props",
  "args": {
    "file": "src/components/global/button/button.tsx",
    "component": "Button"
  }
}

# Output
{
  "success": true,
  "data": {
    "props": [
      { "name": "icon", "type": "ReactNode", "required": false },
      { "name": "text", "type": "string", "required": false },
      { "name": "clickFn", "type": "() => void", "required": false },
      { "name": "loading", "type": "boolean", "required": false }
    ]
  }
}

# Risk: LOW (read-only analysis)
```

#### memory_read / memory_write

```python
# memory_read Input
{
  "file": "registry/index.json",
  "query": null                      # null = full file, or JSONPath for partial read
}

# memory_write Input
{
  "file": "sessions/current-task.md",
  "content": "...",
  "operation": "OVERWRITE"           # OVERWRITE | APPEND
}

# Constraints
# - Cannot write to TOML files (read-only for agents)
# - Cannot delete memory files
# - Risk: LOW (read) | MEDIUM (write)
```

### 6.3 Error Handling Model

Every tool call returns a standardized result:

```python
class ToolResult:
    success: bool
    data: Optional[dict]            # Present if success=True
    error: Optional[ToolError]      # Present if success=False
    duration_ms: int
    retryable: bool                 # Can the caller safely retry?

class ToolError:
    code: str                       # PERMISSION_DENIED | FILE_NOT_FOUND | TIMEOUT | VALIDATION_FAILED
    message: str
    details: Optional[dict]
```

**Retry policy:** Tools marked `retryable=True` are retried up to 3 times with exponential backoff (1s, 4s, 16s). Tools marked `retryable=False` (e.g., git_ops COMMIT after success) are never retried.

---

## 7. TYPESCRIPT BRIDGE DESIGN

### 7.1 Why ts-morph

The TypeScript compiler API (exposed via `ts-morph`) is the only tool that provides:

- **Resolved types:** After generics are resolved, after type narrowing, after merging. Regex-based extraction gets `React.FC<ButtonProps>`. ts-morph gets the actual resolved prop types.
- **Import resolution:** Determines that `import { Button } from "@/components/global/button/button"` resolves to a specific file on disk, not just a string pattern.
- **Export analysis:** Understands `export default memo(Button)` means `Button` is the actual component, not `memo`.
- **Type inference:** For components without explicit prop types, infers props from usage.

Tree-sitter (used by Graphify) gives AST nodes but cannot resolve types. For a system that needs to understand React component contracts perfectly, ts-morph is required.

### 7.2 CLI Interface Design

The TS bridge is a Node.js CLI application invoked by the Python orchestrator via subprocess.

```bash
# Command structure
node ts-bridge/cli.js <command> [--flags] [args]

# Commands
node ts-bridge/cli.js extract-props --file src/components/global/button/button.tsx
node ts-bridge/cli.js extract-imports --file src/screens/enrollments/enrollments.tsx
node ts-bridge/cli.js extract-exports --file src/services/auth/auth.ts
node ts-bridge/cli.js type-check
node ts-bridge/cli.js lint --file src/api/sessions.api.ts
node ts-bridge/cli.js rebuild-registry --output .agent-context/registry/
node ts-bridge/cli.js dependency-graph --entry src/screens/enrollments/enrollments.tsx
node ts-bridge/cli.js validate-contracts --contracts .agent-context/contracts/
```

### 7.3 Communication Contract

**Protocol:** subprocess with JSON on stdout, errors on stderr.

**Input:** Command-line arguments (no stdin streaming in Phase 1).

**Output:** Single JSON object on stdout, terminated by newline:

```json
{
  "success": true,
  "command": "extract-props",
  "data": { ... },
  "duration_ms": 234,
  "ts_version": "5.5.4"
}
```

**Error output:**

```json
{
  "success": false,
  "command": "extract-props",
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File not found: src/components/global/button/buttonz.tsx"
  },
  "duration_ms": 12
}
```

**Exit codes:**
| Code | Meaning |
|------|---------|
| 0 | Success (JSON on stdout) |
| 1 | Command error (JSON error on stdout) |
| 2 | Invalid arguments (message on stderr) |
| 3 | TypeScript project error (cannot load tsconfig) |

---

## 8. API DESIGN (FastAPI)

### 8.1 REST Endpoints

#### Task Management

```
POST   /api/v1/tasks                    # Create new task
GET    /api/v1/tasks                    # List all tasks (paginated)
GET    /api/v1/tasks/{task_id}          # Get task details + subtasks
POST   /api/v1/tasks/{task_id}/execute  # Start task execution
POST   /api/v1/tasks/{task_id}/cancel   # Cancel running task
GET    /api/v1/tasks/{task_id}/logs     # Get execution logs
```

#### Agent Monitoring

```
GET    /api/v1/agents                   # List registered agents
GET    /api/v1/agents/{agent_id}/status # Get agent status
GET    /api/v1/agents/{agent_id}/history # Get agent execution history
```

#### Approval Workflow

```
GET    /api/v1/approvals                # List pending approvals
GET    /api/v1/approvals/{id}           # Get approval details + diff
POST   /api/v1/approvals/{id}/approve   # Approve change
POST   /api/v1/approvals/{id}/reject    # Reject change with reason
```

#### Memory Inspection

```
GET    /api/v1/memory/project           # Get project.toml as JSON
GET    /api/v1/memory/rules             # Get rules.toml as JSON
GET    /api/v1/memory/registry/{file}   # Get specific registry file
GET    /api/v1/memory/graph/{file}      # Get specific graph file
GET    /api/v1/memory/task              # Get current-task.md
POST   /api/v1/memory/rebuild           # Trigger registry rebuild
```

#### Analytics

```
GET    /api/v1/analytics/tokens         # Token usage over time
GET    /api/v1/analytics/tasks          # Task success/failure rates
GET    /api/v1/analytics/costs          # Cost breakdown by agent/task
```

### 8.2 WebSocket Streaming

```
WS     /ws/v1/tasks/{task_id}/stream    # Stream task execution events
```

**Event Types:**

```python
class WSEvent:
    type: str               # task_started | subtask_started | subtask_completed |
                            # tool_invoked | tool_completed | llm_call_started |
                            # llm_call_completed | validation_started |
                            # validation_completed | approval_required |
                            # task_completed | task_failed | log_entry
    timestamp: str          # ISO 8601
    task_id: str
    subtask_id: Optional[str]
    agent_id: Optional[str]
    data: dict              # Event-specific payload
```

### 8.3 Request/Response Schemas

#### Create Task

```python
# Request
class CreateTaskRequest(BaseModel):
    title: str
    description: str
    task_type: TaskType                # BUG_FIX | FEATURE | REFACTOR | AUDIT
    source: TaskSource                 # AGENT_TASKS_MD | MANUAL | SCHEDULED
    target_project: str                # Path to project root
    priority: Priority                 # LOW | MEDIUM | HIGH | CRITICAL
    auto_approve_threshold: RiskLevel  # Auto-approve changes below this risk

# Response
class CreateTaskResponse(BaseModel):
    task_id: str
    status: TaskStatus                 # CREATED
    created_at: str
    estimated_subtasks: int
    estimated_tokens: int
    estimated_cost_usd: float
```

### 8.4 Authentication

Phase 1-2: API key authentication (single-tenant, local deployment).

```
Authorization: Bearer <api-key>
```

Phase 3+: OAuth2 with JWT tokens for multi-user dashboard access.

---
## 9. STATE MANAGEMENT & WORKFLOW ENGINE

### 9.1 LangGraph Usage

LangGraph provides the state machine that governs task execution. It is chosen over simpler alternatives (sequential function calls, basic async pipelines) because:

1. **Cycles:** If validation fails, the workflow must loop back to execution, not terminate. LangGraph supports cycles natively.
2. **Checkpointing:** If the system crashes mid-task, LangGraph can resume from the last checkpoint. This is critical for long-running tasks (20+ subtasks).
3. **Human-in-the-loop:** LangGraph has first-class support for pausing execution at a node, waiting for human input, and resuming.
4. **Observability:** LangGraph emits state transitions as events, which we stream via WebSocket.

### 9.2 State Machine Design

```
                    ┌─────────────────────┐
                    │                     │
                    ▼                     │
┌──────────┐  ┌──────────┐  ┌──────────┐ │  ┌──────────┐  ┌──────────┐
│ RECEIVED │→ │ PLANNING │→ │ EXECUTING│─┘→ │VALIDATING│→ │ COMMIT/  │
│          │  │          │  │          │     │          │  │ APPROVE  │
└──────────┘  └────┬─────┘  └────┬─────┘     └────┬─────┘  └────┬─────┘
                   │             │                 │             │
                   ▼             ▼                 ▼             ▼
              ┌──────────┐ ┌──────────┐     ┌──────────┐  ┌──────────┐
              │ PLAN     │ │ EXEC     │     │ VALID.   │  │COMPLETED │
              │ FAILED   │ │ FAILED   │     │ FAILED   │  │          │
              └──────────┘ └──────────┘     └────┬─────┘  └──────────┘
                                                  │
                                             (retry loop
                                              back to
                                              EXECUTING,
                                              max 3x)
```

### 9.3 Task State Schema

```python
class TaskState(TypedDict):
    task_id: str
    status: TaskStatus
    plan: Optional[TaskPlan]
    subtasks: list[SubtaskState]
    current_subtask_index: int
    retry_count: int
    max_retries: int                        # Default: 3
    total_tokens_used: int
    total_cost_usd: float
    started_at: Optional[str]
    completed_at: Optional[str]
    error: Optional[str]
    requires_approval: bool
    approval_status: Optional[ApprovalStatus]  # PENDING | APPROVED | REJECTED
    git_branch: str
    files_modified: list[str]
    checkpoint_id: Optional[str]            # LangGraph checkpoint for resume

class SubtaskState(TypedDict):
    subtask_id: str
    status: SubtaskStatus                   # PENDING | IN_PROGRESS | COMPLETED | FAILED | SKIPPED
    agent_id: str
    file_changes: list[FileChange]
    validation_results: Optional[ValidationResults]
    tokens_used: int
    retry_count: int
    error: Optional[str]
    started_at: Optional[str]
    completed_at: Optional[str]
```

### 9.4 Task Lifecycle

**1. RECEIVED → PLANNING**
- Master Agent reads memory (project.toml, rules.toml, index.json, current-task.md)
- LLM call: decompose task into subtasks
- Validate: DAG check on subtask dependencies, risk assessment per subtask
- Output: Ordered subtask list

**2. PLANNING → EXECUTING (per subtask, sequential)**
- Load relevant context for the assigned agent
- Agent invokes LLM with context + subtask definition
- LLM returns file changes
- Execution layer applies changes via file_write tool
- If file_write fails: mark subtask FAILED, log error

**3. EXECUTING → VALIDATING**
- Invoke ts_bridge: type_check
- Invoke shell_exec: npm run lint
- Invoke shell_exec: npm run build (if configured)
- Validate registry consistency
- If ALL validations pass: proceed to COMMIT
- If ANY validation fails: increment retry_count

**4. VALIDATING → EXECUTING (retry loop)**
- Provide validation error output to the agent as additional context
- Agent generates corrected changes
- Maximum 3 retries per subtask
- After 3 failures: mark subtask FAILED, skip to next (or halt if dependency)

**5. VALIDATING → COMMIT/APPROVE**
- If `risk_level <= auto_approve_threshold`: auto-commit via git_ops
- If `risk_level > auto_approve_threshold`: emit `approval_required` event, pause execution
- Human reviews diff in Dashboard, approves or rejects
- Approved: commit and proceed
- Rejected: rollback changes, log rejection reason, mark subtask FAILED

**6. COMMIT → COMPLETED (or next subtask)**
- Update current-task.md
- Update registry if structural changes occurred
- If more subtasks remain: return to EXECUTING for next subtask
- If all subtasks complete: archive to sessions/history/, mark task COMPLETED

### 9.5 Retry Logic

```python
RETRY_CONFIG = {
    "max_retries_per_subtask": 3,
    "backoff_strategy": "none",          # Retries are instant (LLM call, not network)
    "retry_context_enhancement": True,   # Include previous error in retry prompt
    "escalate_after_max_retries": True,  # Surface to human after 3 failures
    "skip_on_failure": False,            # Default: halt on failure (configurable per subtask)
}
```

### 9.6 Human-in-the-Loop Checkpoints

| Checkpoint | Trigger | What Human Sees | Actions |
|-----------|---------|----------------|---------|
| Plan Review | Task has >10 subtasks OR modifies god nodes | Subtask list with risk ratings | Approve / Modify / Reject |
| High-Risk Change | Subtask risk = HIGH or CRITICAL | Unified diff of all file changes | Approve / Reject with reason |
| Repeated Failure | Subtask fails 3 times | Error logs + last attempted changes | Fix manually / Skip / Abort task |
| God Node Modification | Any change to entity with importedBy > 20 | Component details + all dependents | Approve / Reject |

---

## 10. OBSERVABILITY & MONITORING

### 10.1 Logging Strategy

**Structured JSON logging.** Every log entry is a JSON object with mandatory fields:

```python
class LogEntry:
    timestamp: str                  # ISO 8601 with milliseconds
    level: str                      # DEBUG | INFO | WARN | ERROR
    task_id: str
    subtask_id: Optional[str]
    agent_id: Optional[str]
    event_type: str                 # tool_call | llm_call | state_transition | validation | error
    message: str
    data: dict                      # Event-specific payload
    duration_ms: Optional[int]
    tokens: Optional[TokenUsage]
```

**Storage:** SQLite database (Phase 1-2), PostgreSQL (Phase 3+). Queryable via API endpoints.

**Retention:** 90 days rolling. Task-level summaries retained indefinitely.

### 10.2 Metrics

| Metric | Type | Granularity | Purpose |
|--------|------|-------------|---------|
| `task.total` | Counter | per status (completed/failed/cancelled) | Task success rate |
| `task.duration_ms` | Histogram | per task_type | Performance tracking |
| `subtask.retries` | Counter | per agent_type | Agent reliability |
| `tokens.input` | Counter | per agent, per model | Cost tracking |
| `tokens.output` | Counter | per agent, per model | Cost tracking |
| `cost.usd` | Gauge | per task, per day | Budget tracking |
| `tool.invocations` | Counter | per tool_name | Tool usage patterns |
| `tool.failures` | Counter | per tool_name, per error_code | Tool reliability |
| `validation.failures` | Counter | per validation_type | Code quality trends |
| `approval.wait_time_ms` | Histogram | per risk_level | Human bottleneck |
| `ts_bridge.duration_ms` | Histogram | per command | Bridge performance |

### 10.3 Debugging Workflows

**"Why did the agent make this change?"**
1. Query logs by task_id + subtask_id
2. Find the `llm_call` event for that subtask
3. Inspect `data.prompt` (full context sent to LLM) and `data.response` (LLM output)
4. Inspect `data.reasoning` (agent's chain-of-thought)

**"Why did validation fail?"**
1. Query logs for `validation` events with the subtask_id
2. Inspect `data.validation_type` and `data.error_output`
3. If type_check failure: inspect the tsc stderr output
4. If lint failure: inspect the ESLint output
5. Cross-reference with the file changes from the execution step

**"How much did this task cost?"**
1. Query `GET /api/v1/analytics/costs?task_id={id}`
2. Response includes: per-subtask token counts, per-agent totals, USD cost at current rates

---

## 11. FAILURE MODES & RISK ANALYSIS

### 11.1 Architectural Risks

| ID | Risk | Cause | Impact | Probability | Mitigation |
|----|------|-------|--------|-------------|------------|
| R-01 | **LLM produces invalid code** | Hallucination, context window limits | Build failure, runtime errors | HIGH | Three-layer validation: tsc + lint + build. Retry with error context. |
| R-02 | **Agent modifies wrong file** | Path hallucination, ambiguous task | Unrelated code corruption | MEDIUM | Pre-execution path validation against registry. Blast radius check. |
| R-03 | **Registry drifts from codebase** | Agent fails to update registry after structural change | Future agents make decisions on stale data | MEDIUM | Rebuild script as safety net. Run periodically. |
| R-04 | **Infinite retry loop** | Validation fails for a reason the LLM cannot fix | Token waste, task stuck forever | MEDIUM | Max 3 retries per subtask. Escalate to human after limit. |
| R-05 | **Context window overflow** | Too many files loaded for a complex subtask | LLM truncates context, misses critical info | MEDIUM | Monitor context size. Chunk large files. Use registry for targeted file loading instead of loading everything. |
| R-06 | **Cross-subtask conflict** | Subtask B modifies a file that subtask A already changed | Merge conflict within same branch | LOW | Sequential execution. Each subtask starts from the latest committed state. |
| R-07 | **Memory corruption** | Malformed JSON written to registry | All agents read corrupt data | LOW | JSON schema validation on every write. Backup before write. |
| R-08 | **Human approval bottleneck** | Approvals queue faster than humans review | Task pipeline stalls | MEDIUM | Configurable auto-approve threshold. Dashboard notifications. Approval timeout with auto-escalation. |
| R-09 | **Credential exposure** | Agent reads .env.local or outputs secrets in logs | Security breach | LOW | .env.local in file_read deny list. Log sanitization for known secret patterns. |
| R-10 | **Token cost overrun** | Complex task generates 100+ LLM calls | Unexpected API bill | MEDIUM | Per-task token budget. Alert at 80% budget. Hard stop at 100%. |

### 11.2 Agent Hallucination Risks

| Hallucination Type | Example | Detection | Mitigation |
|-------------------|---------|-----------|------------|
| **Invented import** | `import { useQuery } from "@/hooks/useQuery"` (doesn't exist) | ts_bridge extract-imports + resolution check | Reject file change, retry with error |
| **Wrong prop type** | Passes `string` where component expects `number` | tsc type check | Build validation catches it |
| **Fictional API endpoint** | Calls `POST /api/enrollment/bulk-delete` (doesn't exist) | Check against api-contracts.toml | Contract validation in TOML |
| **Misremembered pattern** | Uses Tailwind classes in CSS Modules project | Lint + rules.toml pattern check | Post-generation rules validation |
| **Confident wrong reasoning** | "This component is unused" (but it's used by 15 files) | god-nodes.json + registry usedBy check | Blast radius validation |

### 11.3 File Corruption Risks

| Risk | Cause | Mitigation |
|------|-------|------------|
| Partial write | System crash during file_write | Atomic write: write to .tmp file, then rename |
| Encoding corruption | LLM outputs non-UTF-8 characters | Enforce UTF-8 encoding on all writes |
| JSON malformation | Agent writes invalid JSON to registry | JSON.parse validation before write. Backup pre-write. |
| Merge conflict in .agent-context | Two developers merge branches with registry changes | Gitignore dynamic files. Rebuild script resolves conflicts. |

---

## 12. SCALABILITY STRATEGY

### 12.1 Phase 1-2: Single-Instance Architecture

```
Single machine:
├── FastAPI server (1 process, 1 worker)
├── SQLite for logs/metrics
├── File system for memory
├── Direct subprocess calls to ts-bridge
└── Direct subprocess calls to git/npm
```

Sufficient for: 1 project, 1 concurrent task, 1 user.

### 12.2 Phase 3: Horizontal Scaling

```
┌───────────────────────────────────────────┐
│  Load Balancer (nginx)                    │
├───────────┬───────────┬───────────────────┤
│ API-1     │ API-2     │ API-N             │
│ (FastAPI) │ (FastAPI) │ (FastAPI)         │
└─────┬─────┴─────┬─────┴─────┬─────────────┘
      │           │           │
      ▼           ▼           ▼
┌─────────────────────────────────────────┐
│  Redis (Task Queue + Pub/Sub)           │
│  ├── task_queue (pending tasks)         │
│  ├── agent_events (pub/sub for WS)      │
│  └── locks (distributed file locks)     │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│  Worker Pool                            │
│  ├── Worker-1 (LangGraph executor)      │
│  ├── Worker-2 (LangGraph executor)      │
│  └── Worker-N                           │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│  PostgreSQL (logs, metrics, task state)  │
└─────────────────────────────────────────┘
```

**Scaling rules:**
- API servers scale horizontally (stateless, behind load balancer)
- Workers scale horizontally (each claims tasks from Redis queue)
- One worker per active task (tasks are sequential internally, but multiple tasks can run in parallel on different projects)
- File system access serialized via Redis distributed locks (per project)
- ts-bridge instances are per-worker (subprocess, no shared state)

### 12.3 Multi-Project Support

Each project has its own:
- `.agent-context/` directory (within the project repo)
- Git branch namespace (`agent/{project-id}/fix/...`)
- Task queue partition (Redis key prefix by project_id)
- Token budget (per-project cost limits)

The orchestrator is stateless with respect to projects — all project-specific state lives in `.agent-context/` within the project repo.

---

## 13. SECURITY MODEL

### 13.1 File System Safety

**Allowlist-based path validation.** Every file operation validates the target path against an allowlist:

```python
ALLOWED_READ_PATHS = [
    "src/**/*",
    ".agent-context/**/*",
    ".agent-docs/**/*",
    "package.json",
    "tsconfig.json",
    "next.config.mjs",
    ".eslintrc.*",
    "CLAUDE.md",
    "AUDIT_REPORT.md",
]

DENIED_READ_PATHS = [
    ".env.local",
    ".env",
    ".git/**/*",
    "node_modules/**/*",
]

ALLOWED_WRITE_PATHS = [
    "src/**/*",
    ".agent-context/registry/**/*",
    ".agent-context/graph/**/*",
    ".agent-context/sessions/**/*",
    ".env.example",
]

DENIED_WRITE_PATHS = [
    ".env.local",
    ".env",
    ".git/**/*",
    "node_modules/**/*",
    ".agent-context/project.toml",         # Read-only for agents
    ".agent-context/rules.toml",           # Read-only for agents
    ".agent-context/contracts/**/*",       # Read-only for agents
    ".agent-context/scripts/**/*",         # Read-only for agents
]
```

**Path traversal prevention:** All paths are resolved to absolute paths and validated to be within the project root. Any path containing `..` is rejected.

### 13.2 Command Execution Restrictions

Shell commands are **allowlisted, not blocklisted**. Only the following commands are executable:

```python
ALLOWED_COMMANDS = [
    r"^npx tsc --noEmit$",
    r"^npm run lint$",
    r"^npm run build$",
    r"^npm install [a-zA-Z0-9@/._-]+( --save-dev)?$",
    r"^node .agent-context/scripts/rebuild-registry\.ts$",
    r"^node ts-bridge/cli\.js .+$",
    r"^git (status|diff|log|branch|checkout|add|commit|push).*$",
]
```

Any command not matching an allowed pattern is rejected with `PERMISSION_DENIED`.

### 13.3 Secrets Handling

- `.env.local` is in the deny list for both read and write
- Log entries are sanitized: any string matching known secret patterns (API keys, tokens, passwords) is redacted to `[REDACTED]`
- LLM prompts never include `.env.local` content
- The system does not store, transmit, or log secrets

### 13.4 Input Sanitization

- Task descriptions are sanitized for prompt injection attempts before being sent to the LLM
- File content read from disk is validated for encoding (UTF-8 only, reject binary)
- JSON inputs from the Dashboard API are validated against Pydantic schemas
- TOML files are parsed with strict mode (reject malformed TOML)

---

## 14. IMPLEMENTATION ROADMAP

### Phase 0: Manual + Claude Code (Weeks 1-2)

**Scope:** Fix all 25 bugs using Claude Code directly, guided by AGENT_TASKS.md.

**Deliverables:**
- All Tier 1 critical bugs fixed and merged
- All Tier 2 high-severity bugs fixed and merged
- Tier 3 medium bugs addressed
- `.agent-context/` memory system committed to repo
- Registry validated against actual codebase

**Risks:**
- Manual process is slow but safe
- Validates that the memory system actually improves Claude Code output quality

**Exit criteria:** All bugs fixed. Build passes. Audit score improved from 3.0 to 6.0+.

### Phase 1: Single-Agent System (Weeks 3-6)

**Scope:** Build the Python orchestrator with a single Frontend Agent.

**Deliverables:**
- FastAPI server with task CRUD endpoints
- LangGraph workflow: plan → execute → validate → commit
- Tool registry: file_read, file_write, git_ops, shell_exec, memory_read, memory_write
- Anthropic SDK integration for Claude API calls
- SQLite logging and basic metrics
- CLI interface for submitting tasks (no dashboard yet)

**Architecture decisions locked:**
- Sequential subtask execution (no parallelism)
- File-based memory (no database for context)
- Subprocess-based tool execution (no microservices)

**Risks:**
- LangGraph learning curve (mitigate: start with linear workflow, add cycles later)
- Claude API rate limits (mitigate: exponential backoff, token budget per task)

**Exit criteria:** Agent can autonomously execute a 5-subtask bug fix, commit results to a branch, and pass all validations.

### Phase 2: TypeScript Bridge + Dashboard (Weeks 7-10)

**Scope:** Add code intelligence and human monitoring.

**Deliverables:**
- ts-morph CLI bridge with all commands (extract-props, extract-imports, type-check, rebuild-registry)
- Replace regex-based registry building with compiler-level AST extraction
- Contract validation (api-contracts.toml, component-props.toml)
- Next.js dashboard: task board, agent activity stream, diff viewer, approval workflow
- WebSocket streaming of agent events to dashboard
- Token usage and cost analytics

**Risks:**
- ts-morph project loading can be slow for large codebases (mitigate: lazy loading, file-scoped analysis)
- Dashboard WebSocket complexity (mitigate: use existing Socket.io patterns from LMS codebase)

**Exit criteria:** Human can submit task via dashboard, watch agent execute in real-time, review diffs, and approve/reject changes.

### Phase 3: Multi-Agent Orchestration (Weeks 11-16)

**Scope:** Full multi-agent system with Master Agent coordination.

**Deliverables:**
- Master Agent with task decomposition and agent assignment
- QA Agent for cross-cutting validation
- Backend Agent stub (Python code analysis via AST module)
- Redis task queue for parallel task execution (multi-project)
- PostgreSQL migration from SQLite
- Human-in-the-loop approval workflow with configurable thresholds
- God-node blast radius alerts
- Domain-aware task routing

**Risks:**
- Multi-agent coordination complexity (mitigate: sequential within a task, parallel across tasks only)
- State consistency across agents (mitigate: single-writer principle enforced by orchestrator)
- Cost scaling with multiple agents (mitigate: per-task and per-day token budgets)

**Exit criteria:** System can decompose a high-level objective ("fix all security bugs") into subtasks, assign to agents, execute, validate, and present for review — all without human intervention between decomposition and review.

---

## 15. GOVERNANCE FILES

### 15.1 ARCHITECTURE.md (This Document)

**Purpose:** Single source of truth for system architecture. Every architectural decision, interface contract, and design principle is documented here.

**Required content:** All 15 sections above.

**Enforcement:** Every PR that changes system architecture must update this document. Architectural reviews reference this document. New engineers read this before writing code.

### 15.2 FRONTEND_GUIDELINES.md

**Purpose:** Coding standards for the Next.js monitoring dashboard.

**Required content:**
- Component naming and file structure conventions
- State management rules (TanStack Query for API data, Zustand or useState for UI state)
- Styling approach (Tailwind CSS for dashboard — distinct from the LMS which uses CSS Modules)
- TypeScript strictness rules (no `any`, strict null checks)
- Testing requirements (Vitest + Testing Library)
- Accessibility standards (WCAG 2.1 AA)

**Enforcement:** ESLint config + pre-commit hooks + PR review checklist.

### 15.3 API_CONTRACT.md

**Purpose:** Complete specification of the FastAPI REST + WebSocket API.

**Required content:**
- Every endpoint with request/response schemas (Pydantic models)
- Error response format
- Authentication mechanism
- Rate limiting rules
- WebSocket event catalog
- API versioning strategy

**Enforcement:** FastAPI auto-generates OpenAPI spec. Contract tests validate schema compliance. Breaking changes require version bump.

### 15.4 STATE_MANAGEMENT.md

**Purpose:** Rules for LangGraph state machine design and task state management.

**Required content:**
- State schema definitions (TaskState, SubtaskState)
- State transition rules (which transitions are valid)
- Checkpointing strategy (when and how state is persisted)
- Recovery procedures (how to resume from a checkpoint)
- Retry policies per state

**Enforcement:** State transitions validated at runtime by LangGraph. Invalid transitions raise exceptions.

### 15.5 FILE_CREATION_RULES.md

**Purpose:** Prevent unnecessary file proliferation — the #1 cause of AI-generated codebase bloat.

**Required content:**
```
Before creating ANY file, the agent must:
1. Search for existing files with similar purpose
2. Check if the functionality can be added to an existing file
3. Justify why a new file is necessary
4. Define the file's single responsibility
5. Specify its exact location in the folder structure
6. List its dependencies
7. Confirm it follows naming conventions from rules.toml
```

**Enforcement:** The Master Agent validates file creation requests against this checklist. The execution layer logs every file creation with justification.

### 15.6 AI_INTEGRATION.md

**Purpose:** How LLM calls are structured, prompt engineering standards, and model configuration.

**Required content:**
- System prompt templates per agent type
- Context window management strategy (what gets included, priority order)
- Structured output schemas (how LLM responses are parsed)
- Token budget policies per task type
- Model selection (which Claude model for which task)
- Fallback strategy (what happens when the API is down)
- Prompt versioning (prompts are version-controlled, not inline strings)

**Enforcement:** All prompts stored in `prompts/` directory with version suffixes. Prompt changes require PR review.

### 15.7 CODE_REVIEW_CHECKLIST.md

**Purpose:** Self-review checklist that the QA Agent (and human reviewers) use to validate changes.

**Required content:**
```
For every code change, verify:

CORRECTNESS
□ Does it solve the stated problem?
□ Does it pass type checking (tsc --noEmit)?
□ Does it pass linting (npm run lint)?
□ Does it build successfully (npm run build)?

CONSISTENCY
□ Does it follow patterns in rules.toml?
□ Does it use shared utilities (not copy-paste)?
□ Does it follow naming conventions?
□ Does it use CSS variables (not hardcoded colors)?

SAFETY
□ No dangerouslySetInnerHTML without sanitizeHTML?
□ No hardcoded secrets or URLs?
□ No new 'any' type annotations?
□ God nodes checked for blast radius?

COMPLETENESS
□ Registry updated for structural changes?
□ Current-task.md updated?
□ Commit message follows format?
□ All validation commands pass?
```

**Enforcement:** QA Agent runs this checklist automatically. Dashboard displays pass/fail per item.

---

## APPENDIX A: GLOSSARY

| Term | Definition |
|------|-----------|
| **God Node** | A component/utility imported by 20+ files. Changes have high blast radius. |
| **Blast Radius** | The number of files affected by modifying a single entity. |
| **Domain** | A logical grouping of related components, screens, and services (e.g., "enrollments", "sessions"). |
| **Confidence Label** | Tag on registry entries: EXTRACTED (from code), INFERRED (from structure), AMBIGUOUS (needs verification). |
| **Memory System** | The `.agent-context/` directory containing TOML config, JSON registries, and Markdown working state. |
| **TS Bridge** | TypeScript CLI tool using ts-morph for compiler-level code analysis. |
| **Tool** | A registered function that agents can invoke through the orchestrator (never directly). |
| **Checkpoint** | A saved point in LangGraph execution from which the workflow can resume after failure. |
| **Subtask** | An atomic unit of work assigned to a single agent, modifying a bounded set of files. |

## APPENDIX B: CONFIGURATION DEFAULTS

```python
# System defaults — override via environment variables or config file
DEFAULTS = {
    "max_subtasks_per_task": 20,
    "max_retries_per_subtask": 3,
    "max_files_per_subtask": 5,
    "max_tokens_per_task": 500_000,
    "max_cost_per_task_usd": 25.00,
    "max_cost_per_day_usd": 100.00,
    "auto_approve_threshold": "LOW",       # AUTO-approve LOW risk, require approval for MEDIUM+
    "shell_exec_timeout_seconds": 120,
    "ts_bridge_timeout_seconds": 60,
    "llm_call_timeout_seconds": 120,
    "approval_timeout_hours": 24,          # Auto-escalate after 24h without review
    "log_retention_days": 90,
    "model_default": "claude-sonnet-4-20250514",
    "model_planning": "claude-sonnet-4-20250514",
    "model_complex_generation": "claude-sonnet-4-20250514",
    "checkpoint_interval": "per_subtask",  # Checkpoint after each subtask completion
}
```

---

**End of Architecture Document**

**Document Version History:**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-04-13 | CTO Architecture Review | Initial complete specification |
