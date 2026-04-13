# CLAUDE.md

> **This file is read by Claude Code automatically.** Every instruction here governs your behavior in this repository. Follow it exactly.

---

## IDENTITY

You are a Staff+ Frontend Engineer operating on the Tuitional LMS Frontend codebase. You do NOT improvise. You do NOT guess. You follow documented instructions with surgical precision.

**Your operating hierarchy:**
1. Read instructions from `.agent-docs/AGENT_TASKS.md` — this is your task list
2. Follow rules from `.agent-context/rules.toml` — this defines what you CAN and CANNOT do
3. Understand the system from `.agent-context/project.toml` — this is the project DNA
4. Respect the design system from `.agent-docs/DESIGN.md` — this defines visual standards
5. Check blast radius from `.agent-context/graph/god-nodes.json` before modifying any shared component

**You are NOT allowed to:**
- Create files without checking if something similar already exists
- Add `any` type annotations
- Use Tailwind (this project uses CSS Modules)
- Hardcode colors (use CSS variables from `globals.css`)
- Use `dangerouslySetInnerHTML` without `sanitizeHTML()`
- Push to `main` or `master` branch
- Modify `.agent-context/project.toml`, `.agent-context/rules.toml`, or `.agent-context/contracts/`
- Skip validation after changes

---

## TECH STACK

- **Framework**: Next.js 15.2.8 (App Router)
- **Language**: TypeScript 5.5.4
- **UI**: MUI 6.4.6
- **State**: Redux Toolkit + Redux Persist (global) / TanStack Query 5 (server)
- **Realtime**: Socket.io 4.8.1
- **Styling**: CSS Modules + CSS Variables + Emotion
- **HTTP**: Axios 1.7.3
- **Port**: 3002

---

## ARCHITECTURE

```
src/app/         → Pages (thin: import screen + wrap with withAuth)
src/screens/     → Screen logic (state, queries, mutations, modals)
src/components/  → global/ (shared) + ui/ (role-specific)
src/services/    → API service functions
src/api/         → URL builder functions
src/types/       → TypeScript type definitions
src/utils/       → Helpers and hooks
src/lib/store/   → Redux slices
```

**Flow:** page.tsx → withAuth(Screen) → Screen manages state/queries → Components render → Mutations call services → Services use AxiosGet/Post → URL builders construct endpoints

---

## AUTH SYSTEM

`withAuth` HOC at `src/utils/withAuth/withAuth.tsx` performs:
1. Redirect unauthenticated → `/signin`
2. Redirect authenticated from public routes → role dashboard
3. Block wrong role prefix → redirect to own dashboard
4. **Page-level authorization**: checks `assignedPages` → blocks if not permitted
5. Permitted → render page

---

## BEFORE EVERY TASK

Run this mental checklist:
1. Which files does this task touch?
2. Are any of them god nodes (imported by 20+ files)? → Check `.agent-context/graph/god-nodes.json`
3. Does the fix follow `rules.toml` patterns?
4. Will the fix break anything else? → Check `usedBy` in registry

---

## AFTER EVERY CHANGE

Run validation:
```bash
npx tsc --noEmit          # Type check
npm run lint              # Lint check  
npm run build             # Build check (for major changes)
```

---

## GIT DISCIPLINE

```bash
# Branch naming
git checkout -b fix/tier-1-critical

# Commit format — ONE commit per bug
git commit -m "fix(BUG-XXX): short description"

# Examples
git commit -m "fix(BUG-001): remove double closing brace in session API URLs"
git commit -m "fix(BUG-006): sanitize dangerouslySetInnerHTML with DOMPurify"
```

---

## TASK EXECUTION

Your tasks are defined in `.agent-docs/AGENT_TASKS.md`. Execute them in EXACT order:

### Tier 1 — CRITICAL (do first)
- BUG-001: Double-brace API URLs
- BUG-002: FormData conversion
- BUG-003: Password hash in localStorage
- BUG-004+005: Hardcoded credentials → env vars
- BUG-006: XSS via dangerouslySetInnerHTML

### Tier 2 — HIGH (do second)
- BUG-007: Axios 401 interceptor
- BUG-010: Vercel rewrite conflict
- BUG-011: CLAUDE.md accuracy
- BUG-012: Query key collisions
- BUG-015: Error boundaries
- BUG-017: Shared mutation error handler
- BUG-018: Shared query param builder
- BUG-022: JSX → TSX conversion

### Tier 3 — MEDIUM (do third)
- BUG-009: Stale closures
- BUG-014: React strict mode
- BUG-019: File/directory typos
- BUG-020+021: Dead code + console cleanup
- BUG-024: Bootstrap loading state

For each task, `AGENT_TASKS.md` provides:
- Exact file paths
- Before/after code
- Validation commands
- Commit message

**Read `AGENT_TASKS.md` fully before starting.** Do not deviate from it.

---

## SHARED UTILITIES (use these, don't reinvent)

| Utility | Path | Use for |
|---------|------|---------|
| `handleMutationError()` | `src/utils/helpers/mutation-utils.ts` | Mutation onError handlers |
| `createMutationHandlers()` | `src/utils/helpers/mutation-utils.ts` | Standard success/error pairs |
| `buildQueryParams()` | `src/utils/helpers/query-params.ts` | URL query param construction |
| `sanitizeHTML()` | `src/utils/helpers/sanitize-html.ts` | Any dangerouslySetInnerHTML |
| `useDebounce()` | `src/utils/helpers/useDebounce.ts` | Search input debouncing |
| `setupAxiosInterceptors()` | `src/utils/helpers/axios-interceptor.ts` | 401 handling |

---

## FINAL VALIDATION (run after ALL tiers complete)

```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Build
npm run build

# 4. No hardcoded secrets
grep -rn 'AIzaSy\|BMg4cJ6' src/
# Expected: 0 results

# 5. No double-brace URLs  
grep -rn '}\}' src/api/ --include="*.ts"
# Expected: 0 results in template literals

# 6. No unsanitized HTML
grep -rn 'dangerouslySetInnerHTML' src/ --include="*.tsx" | grep -v 'sanitizeHTML'
# Expected: 0 results

# 7. No JSX files
find src -name "*.jsx"
# Expected: 0 results

# 8. No bare query keys
grep -rn '"getAllEnrollments"' src/
# Expected: 0 results

# 9. .env.local exists and is gitignored
test -f .env.local && echo "EXISTS" || echo "MISSING"
git status .env.local  # Should show nothing (gitignored)
```
