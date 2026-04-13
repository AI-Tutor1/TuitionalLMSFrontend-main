# AGENT_MEMORY.md — Memory, Context & Indexing Architecture

> **Purpose:** This document defines the complete memory system for the Tuitional LMS frontend agent. It is the architectural blueprint for how agents persist knowledge, coordinate work, and maintain codebase awareness across sessions.
>
> **Influenced by:** Graphify knowledge graph patterns (confidence labeling, god nodes, community clustering, SHA256 caching, validation schemas), VoltAgent DESIGN.md format, and the three-layer memory architecture discussed in planning.

---

## PHILOSOPHY

Three formats for three purposes:

| Format | Purpose | Who writes | Who reads | Why this format |
|--------|---------|-----------|-----------|----------------|
| **TOML** | Static configuration, project rules, contracts | Human + Agent (rare updates) | Agent (every session start) | Human-readable, supports comments, no trailing comma bugs, standard config format |
| **JSON** | Dynamic registry data, component/hook/route indexes | Agent (after every creation/modification) | Agent (during task execution) | Programmatically readable/writable, queryable, diffable |
| **Markdown** | Working memory, task state, decisions, reports | Agent (during task execution) | Agent + Human (review) | Natural language reasoning, context-rich, version-controllable |

**The code is always the source of truth.** The registry is a cache. If the registry drifts from reality, the rebuild script regenerates it. Design for graceful degradation, not zero-defect operation.

---

## DIRECTORY STRUCTURE

```
.agent-context/
├── project.toml              # Layer 1: Project DNA — tech stack, conventions, boundaries
├── rules.toml                # Layer 1: Coding standards, patterns to follow/avoid
├── contracts/                # Layer 1: Shared interfaces that all agents respect
│   ├── api-contracts.toml    #   API shapes (endpoints, request/response)
│   └── component-props.toml  #   Component interface contracts
│
├── registry/                 # Layer 2: Living index of everything that exists
│   ├── components.json       #   All UI components with props, deps, status
│   ├── hooks.json            #   Custom hooks with signatures, deps
│   ├── utils.json            #   Utility functions
│   ├── routes.json           #   All app routes with their screens
│   ├── services.json         #   API service functions
│   ├── types.json            #   TypeScript type definitions
│   └── index.json            #   Lightweight manifest for quick lookups
│
├── sessions/                 # Layer 3: Working memory — current and recent tasks
│   ├── current-task.md       #   What the agent is doing right now
│   └── history/              #   Completed task logs
│       ├── 2026-04-13-tier1-critical-fixes.md
│       └── ...
│
├── graph/                    # Graphify-inspired knowledge graph outputs
│   ├── dependencies.json     #   Component dependency graph (who depends on whom)
│   ├── god-nodes.json        #   Most-connected entities (highest blast radius)
│   └── domains.json          #   Community/domain clustering of related entities
│
└── scripts/
    └── rebuild-registry.ts   #   Regenerates registry from actual src/ code
```

---

## LAYER 1 — STATIC KNOWLEDGE (TOML)

These files rarely change. They are the project's constitution. The agent reads them at the start of every session.

### project.toml

```toml
# .agent-context/project.toml
# Last updated: 2026-04-13
# This file describes the project's identity, tech stack, and boundaries.
# The agent reads this FIRST before any task.

[identity]
name = "Tuitional LMS Frontend"
description = "Learning Management System for tutoring education (UAE/Middle East market)"
repository = "TuitionalLMSFrontend-main"
primary_domain = "lms.tuitionaledu.com"
currency = "AED"

[stack]
framework = "Next.js 15.2 (App Router)"
language = "TypeScript 5.5"
ui_library = "MUI 6.4"
state_global = "Redux Toolkit 2.2 + Redux Persist"
state_server = "TanStack Query 5"
realtime = "Socket.io Client 4.8"
styling = "CSS Modules + CSS Variables + Emotion"
notifications = "Firebase 11.7"
charts = ["Chart.js", "Recharts"]
forms = "React Hook Form 7"
http = "Axios 1.7"
deployment = "Vercel"

[routing]
# Dynamic role-based routing: /{role}/{page}
pattern = "/(protected)/[role]/{page}"
roles = ["superAdmin", "admin", "student", "parent", "teacher", "counsellor", "hr", "manager", "qa"]
auth_hoc = "src/utils/withAuth/withAuth.tsx"
public_routes = ["/signin", "/forgot-password", "/password-reset/[email]", "/confirm-password/[email]"]

[architecture]
# The four-layer separation the codebase follows
pages = "src/app/"              # Thin wrappers — import screen, wrap with withAuth
screens = "src/screens/"        # Page-level logic — state, queries, mutations, modals
components = "src/components/"  # UI components — global/ (shared) and ui/ (role-specific)
services = "src/services/"      # API calls — AxiosGet/Post with typed responses
api_urls = "src/api/"           # URL builders — construct endpoint URLs with query params
types = "src/types/"            # TypeScript type definitions
utils = "src/utils/"            # Helper functions
store = "src/lib/store/"        # Redux store, slices, hooks
constants = "src/const/"        # Application constants

[data_hierarchy]
# The core data model. Every module feeds into or reads from this chain.
flow = [
  "Users (Teachers, Students, Parents, Admins)",
  "Enrollments (1 Teacher + 1+ Students + 1 Subject + Curriculum/Board/Grade)",
  "Class Schedules (Recurring weekly slots or one-time extras)",
  "Sessions (Actual conducted classes with attendance tracking)",
  "Transactions (Debits/Credits per session)",
  "Billing (Aggregated balance calculations)",
  "Invoices (Generated for payment collection)",
]
```

### rules.toml

```toml
# .agent-context/rules.toml
# Coding standards and patterns. The agent MUST follow these.

[patterns.follow]
# Patterns that exist in the codebase and must be maintained
component_styling = "CSS Modules (co-located .module.css per component)"
state_server = "TanStack Query for all API data fetching"
state_global = "Redux for auth, resources, roles, assignedPages"
api_layer = "URL builder in src/api/ + service function in src/services/"
auth_wrapping = "Every page.tsx wraps its screen with withAuth()"
modal_props = "{ modalOpen, handleClose, heading, subHeading, loading }"
pagination = "MUI Pagination via src/components/global/pagination/"
toast = "react-toastify — success for CRUD, error for failures"
color_system = "CSS variables from globals.css — never hardcode hex in components"
memoization = "useMemo for computed props, useCallback for handlers, memo() for components"

[patterns.avoid]
# Anti-patterns the agent must NOT introduce
no_tailwind = "Do not add Tailwind classes — project uses CSS Modules"
no_styled_components = "Do not create new styled-components — legacy dependency only"
no_inline_styles_for_colors = "Use CSS variables, not inline hex values"
no_any_types = "Never add new 'any' type annotations"
no_console_in_components = "No console.log in component/screen code"
no_direct_localstorage = "Use Redux Persist, not direct localStorage access"
no_hardcoded_urls = "All URLs via environment variables or src/services/config.ts"

[patterns.shared_utilities]
# Utilities the agent should use (created during bug remediation)
error_handler = "src/utils/helpers/mutation-utils.ts → handleMutationError()"
query_params = "src/utils/helpers/query-params.ts → buildQueryParams()"
html_sanitizer = "src/utils/helpers/sanitize-html.ts → sanitizeHTML()"
debounce = "src/utils/helpers/useDebounce.ts"
api_methods = "src/utils/helpers/api-methods.ts → AxiosGet/Post/Put/Patch/Delete"

[naming]
# Naming conventions
files_components = "kebab-case directory, matching component filename"
files_services = "kebab-case with module name"
files_api = "kebab-case with .api suffix"
files_types = "kebab-case with .types suffix"
files_slices = "kebab-case with -slice suffix"
props_interfaces = "{ComponentName}Props"
event_handlers = "handle{Action} — handleDelete, handleAdd, handleClose"
query_keys = "['resource', 'scope', ...filters] — hierarchical, scoped"
```

### contracts/api-contracts.toml

```toml
# .agent-context/contracts/api-contracts.toml
# API contracts. Agents must respect these shapes.
# If an agent needs to deviate, it flags it — does not silently change.

[api.config]
base_url_var = "NEXT_PUBLIC_API_BASE_URL"
auth_header = "Authorization: {token}"
content_types = ["application/json", "multipart/form-data"]

[api.pagination]
# Standard pagination contract used by all list endpoints
default_limit = 50
params = ["page", "limit"]
response_shape = """
{
  data: T[],
  totalPages: number,
  currentPage: number,
  totalCount: number
}
"""

[api.error_shape]
# Standard error response from backend
response = """
{
  message?: string,
  error?: string,
  statusCode?: number
}
"""

[api.enrollment]
# Example contract — expand for each module as needed
list_endpoint = "GET /api/enrollment/getAllEnrollment"
create_endpoint = "POST /api/enrollment"
delete_endpoint = "DELETE /api/enrollment/{id}"
edit_endpoint = "PUT /api/enrollment/{id}"
break_status_endpoint = "PUT /api/enrollment/{id}/break-new"
```

---

## LAYER 2 — DYNAMIC REGISTRY (JSON)

These files are programmatically updated by the agent after every creation or modification. They are queryable indexes of what exists.

### Registry Schema

Every registry entry borrows Graphify's confidence labeling:

```typescript
// Confidence levels (borrowed from Graphify)
type Confidence = "EXTRACTED" | "INFERRED" | "AMBIGUOUS";
// EXTRACTED = parsed from actual source code (AST-level certainty)
// INFERRED  = reasonable deduction from file structure/naming
// AMBIGUOUS = needs human verification
```

### components.json

```json
{
  "lastUpdated": "2026-04-13T10:00:00Z",
  "generatedBy": "rebuild-registry.ts",
  "components": [
    {
      "id": "enrollment-table",
      "name": "EnrollmentTable",
      "path": "src/components/ui/superAdmin/enrollment/enrollment-table/enrollment-table.tsx",
      "cssModule": "enrollment-table.module.css",
      "category": "ui/superAdmin",
      "domain": "enrollments",
      "props": ["data", "currentPage", "totalCount", "totalPages", "rowsPerPage", "handleChangePage", "handleChangeRowsPerPage", "handleDeleteModal", "handleEditModal", "handleInstantClassModal", "handleExtraClassModal", "handleSwitch"],
      "dependsOn": ["pagination", "tooltip"],
      "usedBy": ["enrollments-screen"],
      "status": "stable",
      "confidence": "EXTRACTED",
      "lines": 593,
      "issues": ["contains any types", "monolithic"]
    },
    {
      "id": "button",
      "name": "Button",
      "path": "src/components/global/button/button.tsx",
      "cssModule": "button.module.css",
      "category": "global",
      "domain": "shared",
      "props": ["icon", "text", "type", "clickFn", "loading", "disabled", "inlineStyling"],
      "dependsOn": ["@mui/material/CircularProgress"],
      "usedBy": ["enrollments-screen", "sessions-screen", "users-screen", "billing-screen", "invoices-screen"],
      "status": "stable",
      "confidence": "EXTRACTED",
      "lines": 38,
      "issues": []
    }
  ]
}
```

### hooks.json

```json
{
  "lastUpdated": "2026-04-13T10:00:00Z",
  "hooks": [
    {
      "id": "use-debounce",
      "name": "useDebounce",
      "path": "src/utils/helpers/useDebounce.ts",
      "signature": "useDebounce<T>(value: T, delay: number): T",
      "domain": "shared",
      "usedBy": ["enrollments-screen", "sessions-screen", "users-screen"],
      "confidence": "EXTRACTED"
    }
  ]
}
```

### routes.json

```json
{
  "lastUpdated": "2026-04-13T10:00:00Z",
  "routes": [
    {
      "path": "/(protected)/[role]/enrollments",
      "page": "src/app/(protected)/[role]/enrollments/page.tsx",
      "screen": "src/screens/enrollments/enrollments.tsx",
      "queryKeys": ["enrollments:list"],
      "services": ["getAllEnrollments", "addEnrollment", "deleteEnrollment", "changeBreakStatus", "editEnrollmentByGroupId"],
      "modals": ["add", "edit", "delete", "instantClass", "extraClass", "pause"],
      "confidence": "EXTRACTED"
    }
  ]
}
```

### index.json (Lightweight Manifest)

The agent reads this first — it's a table of contents for quick lookups without loading full registries.

```json
{
  "lastUpdated": "2026-04-13T10:00:00Z",
  "summary": {
    "components": { "count": 180, "global": 36, "ui_superAdmin": 120, "ui_teacher": 15, "ui_student": 9 },
    "hooks": { "count": 12 },
    "screens": { "count": 42 },
    "services": { "count": 55 },
    "routes": { "count": 40 },
    "types": { "count": 21 }
  },
  "domains": {
    "enrollments": { "components": 12, "screens": 3, "services": 5 },
    "sessions": { "components": 8, "screens": 2, "services": 4 },
    "users": { "components": 9, "screens": 2, "services": 3 },
    "billing": { "components": 4, "screens": 2, "services": 2 },
    "invoices": { "components": 10, "screens": 1, "services": 3 },
    "chat": { "components": 14, "screens": 1, "services": 2 },
    "auth": { "components": 2, "screens": 4, "services": 1 }
  },
  "godNodes": [
    { "id": "button", "usedByCount": 35, "domain": "shared" },
    { "id": "pagination", "usedByCount": 28, "domain": "shared" },
    { "id": "filter-by-date", "usedByCount": 20, "domain": "shared" },
    { "id": "multi-select-dropdown", "usedByCount": 18, "domain": "shared" },
    { "id": "loading-box", "usedByCount": 25, "domain": "shared" },
    { "id": "error-box", "usedByCount": 25, "domain": "shared" },
    { "id": "enrollment-table", "usedByCount": 1, "blastRadius": "high", "domain": "enrollments" }
  ]
}
```

**God nodes** (borrowed from Graphify): The `godNodes` array lists entities with the highest number of dependents. Before modifying any god node, the agent must check all `usedBy` references to assess blast radius.

---

## LAYER 3 — WORKING MEMORY (Markdown)

### current-task.md

```markdown
# Current Task

## Objective
Fix Tier 1 critical bugs per AGENT_TASKS.md

## Status: in-progress
## Branch: fix/tier-1-critical
## Agent: frontend-dev

## Progress
1. [done] BUG-001: Double-brace URL fix — committed
2. [done] BUG-002: FormData conversion fix — committed
3. [in-progress] BUG-003: Strip password from Redux
4. [pending] BUG-004+005: Environment variables
5. [pending] BUG-006: XSS sanitization

## Decisions Made
- Using DOMPurify for HTML sanitization (not custom regex)
- Making password/reset_token optional in User_Type rather than creating a new SafeUser type
- Keeping .env.local gitignored, .env.example committed

## Files Modified This Session
- src/api/sessions.api.ts (BUG-001)
- src/utils/helpers/payload-conversion.ts (BUG-002)
- src/lib/store/slices/user-slice.ts (BUG-003, in progress)
- src/services/auth/auth.types.ts (BUG-003, in progress)

## Blockers
- None
```

---

## GRAPHIFY INTEGRATION POINTS

We borrow five concepts from Graphify, adapted for our use case:

### 1. Confidence Labeling

Every registry entry has a `confidence` field:

| Label | Meaning | When used |
|-------|---------|-----------|
| `EXTRACTED` | Parsed from actual source code by the rebuild script | Default for all auto-generated entries |
| `INFERRED` | Agent's deduction from naming/structure patterns | When rebuild script can't parse props but infers from usage |
| `AMBIGUOUS` | Needs human review — something doesn't look right | When file structure conflicts with expected patterns |

### 2. God Nodes

The `index.json` `godNodes` array identifies the most-connected entities. Before modifying any god node, the agent:
1. Reads the `usedBy` list from the component's registry entry
2. Assesses blast radius
3. If blast radius > 5 components, flags for human approval

### 3. Domain Clustering

Instead of Leiden community detection, we use manual domain tagging:
- Each registry entry has a `domain` field
- Domains map to business modules: `enrollments`, `sessions`, `billing`, `chat`, `auth`, etc.
- The orchestrator uses domains to decide which agent handles what task
- Cross-domain changes (e.g., modifying a `shared` component used by `enrollments` AND `sessions`) require extra validation

### 4. SHA256 File Caching (from Graphify's cache.py)

The rebuild script uses Graphify's caching pattern:
- Hash each source file with SHA256
- Store hash → extracted metadata mapping
- On rebuild, skip unchanged files
- This makes incremental registry updates fast

### 5. Validation Schema (from Graphify's validate.py)

Every registry JSON file is validated before write:

```typescript
// Validation rules for components.json entries
const REQUIRED_COMPONENT_FIELDS = ["id", "name", "path", "category", "domain", "confidence"];
const VALID_CATEGORIES = ["global", "ui/superAdmin", "ui/teacher", "ui/student"];
const VALID_DOMAINS = ["shared", "enrollments", "sessions", "users", "billing", "invoices", "chat", "auth", "class-schedule", "resources", "roles", "permissions", "dashboard", "transactions", "feedbacks"];
const VALID_CONFIDENCES = ["EXTRACTED", "INFERRED", "AMBIGUOUS"];

function validateRegistryEntry(entry: Record<string, unknown>): string[] {
  const errors: string[] = [];
  for (const field of REQUIRED_COMPONENT_FIELDS) {
    if (!(field in entry)) errors.push(`Missing required field: ${field}`);
  }
  if (entry.confidence && !VALID_CONFIDENCES.includes(entry.confidence as string)) {
    errors.push(`Invalid confidence: ${entry.confidence}`);
  }
  return errors;
}
```

---

## REBUILD SCRIPT

The safety net. Regenerates all registry JSON files from actual source code.

### Design (scripts/rebuild-registry.ts)

```
Input:  src/ directory
Output: .agent-context/registry/*.json

Process:
1. Walk src/components/ → extract component metadata → write components.json
2. Walk src/utils/hooks/ → extract hook metadata → write hooks.json
3. Walk src/app/(protected)/ → extract route metadata → write routes.json
4. Walk src/services/ → extract service metadata → write services.json
5. Walk src/types/ → extract type metadata → write types.json
6. Compute index.json (counts, domains, god nodes)
7. Compute dependencies.json (import graph)
8. Compute god-nodes.json (most-depended-on entities)
```

### Extraction Method

For each file:
1. Read file contents
2. Compute SHA256 hash (Graphify pattern)
3. Check cache — if hash matches previous run, skip
4. Parse exports, imports, and props using regex (not AST for speed)
5. Extract metadata
6. Validate against schema
7. Write to registry
8. Save hash to cache

### When to Run

- After any agent creates a new component, hook, or service
- After any agent modifies component props or dependencies
- Periodically as a "health check" (e.g., every 10 tasks)
- Manually by developer when registry seems stale

---

## TOML vs JSON DECISION MATRIX

| Criteria | TOML | JSON |
|----------|------|------|
| Human readability | Excellent — comments, sections, no bracket noise | Poor — no comments, verbose |
| Agent writability | Moderate — string formatting needed | Excellent — `JSON.stringify` |
| Agent readability | Excellent — clear key-value pairs | Excellent — native parsing |
| Config/rules/contracts | Best choice — comments explain WHY | Wrong choice — can't annotate |
| Registry/indexes | Wrong choice — too verbose for large datasets | Best choice — fast, queryable |
| Working memory/notes | Wrong choice — too structured for freeform | Wrong choice — Markdown is better |
| Version control diffs | Excellent — clean line-by-line diffs | Good — but noisy with nested objects |
| Schema validation | Manual parsing needed | JSON Schema available |

**Summary:**
- **TOML** for anything humans need to read, edit, or understand the reasoning behind (project config, rules, contracts)
- **JSON** for anything agents need to programmatically create, query, or update (registry, indexes, dependency graphs)
- **Markdown** for anything that needs natural language context (task state, decisions, reports)

---

## AGENT SESSION LIFECYCLE

```
Session Start:
  1. Read project.toml          → understand tech stack and boundaries
  2. Read rules.toml            → understand patterns to follow/avoid
  3. Read contracts/*.toml      → understand interface contracts
  4. Read index.json            → get quick overview of what exists
  5. Read current-task.md       → understand current task state
  6. Read AGENT_TASKS.md        → get specific instructions

During Task:
  7. Read specific registry entries as needed (components.json, routes.json)
  8. Check god-nodes.json before modifying high-blast-radius entities
  9. Update current-task.md after each subtask completion

After Each Code Change:
  10. Update relevant registry entry (or flag for rebuild)
  11. Update current-task.md progress
  12. Commit with proper message format

Session End:
  13. Archive current-task.md to sessions/history/
  14. Run rebuild script if registry changes were made
  15. Validate all registry files against schema
```

---

## FILE SIZE BUDGET

Keep the context window manageable:

| File | Target Size | Max Size | Rationale |
|------|------------|----------|-----------|
| project.toml | 2-3 KB | 5 KB | Read every session — must be small |
| rules.toml | 2-3 KB | 5 KB | Read every session — must be small |
| contracts/*.toml | 1-2 KB each | 3 KB each | Read on demand |
| index.json | 2-3 KB | 5 KB | Read every session — manifest only |
| components.json | 20-40 KB | 80 KB | Read specific entries, not full file |
| hooks.json | 2-5 KB | 10 KB | Small — few hooks |
| routes.json | 5-10 KB | 20 KB | Medium — 40 routes |
| current-task.md | 1-2 KB | 5 KB | Active working memory |
| god-nodes.json | 1-2 KB | 3 KB | Top 20 most-connected entities |

**Total context load at session start:** ~15 KB (project.toml + rules.toml + index.json + current-task.md)

---

## IMPLEMENTATION ORDER

1. **Create directory structure** — just the folders and empty files
2. **Write project.toml** — manually, based on current codebase understanding
3. **Write rules.toml** — manually, encoding the patterns from DESIGN.md and audit
4. **Write contracts/api-contracts.toml** — manually, based on existing API patterns
5. **Build rebuild-registry.ts** — the script that walks `src/` and generates all JSON files
6. **Run rebuild** — generate all registry JSON files from actual code
7. **Validate** — ensure all generated JSON passes schema validation
8. **Test one agent session** — have agent read context, execute one task, update registry

**Do not build all of this before testing step 8.** If the agent doesn't produce noticeably better results with the context system, stop and redesign.

---

**End of Memory Architecture**
