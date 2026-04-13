# EXECUTION_PROMPTS.md — Exact Prompts for Claude Code

> Copy-paste these prompts into Claude Code in sequence. Each prompt is a self-contained session. Do NOT combine them.

---

## PROMPT 1: Setup & Tier 1 Critical Bugs

```
I need you to fix critical security and runtime bugs in this codebase. 

BEFORE WRITING ANY CODE:
1. Read CLAUDE.md (your operating rules)
2. Read .agent-context/project.toml (understand the project)
3. Read .agent-context/rules.toml (understand coding standards)
4. Read .agent-docs/AGENT_TASKS.md (your task list — read the ENTIRE file)
5. Read .agent-context/graph/god-nodes.json (understand blast radius)

SETUP:
- Create branch: git checkout -b fix/tier-1-critical
- Verify you're on the branch: git branch --show-current

THEN EXECUTE these bugs from AGENT_TASKS.md in exact order. For each bug, the file has exact before/after code, file paths, and validation steps:

1. BUG-001: Fix double-brace URLs in src/api/sessions.api.ts (lines 104, 106)
2. BUG-002: Fix FormData conversion in src/utils/helpers/payload-conversion.ts
3. BUG-003: Strip password from Redux state in src/lib/store/slices/user-slice.ts + src/services/auth/auth.types.ts
4. BUG-004+005: Move credentials to env vars — create .env.example, .env.local, update src/services/config.ts, src/lib/firebase/index.ts, src/lib/firebase/hooks/useFCMToken.ts, update .gitignore
5. BUG-006: Install dompurify, create src/utils/helpers/sanitize-html.ts, wrap ALL dangerouslySetInnerHTML usage

RULES:
- One git commit per bug: git commit -m "fix(BUG-XXX): description"
- Run "npx tsc --noEmit" after each fix to verify types
- Follow the exact code from AGENT_TASKS.md — do not improvise
- Do NOT modify any file not listed in the task

AFTER ALL 6 FIXES:
- Run the full validation from AGENT_TASKS.md "POST-COMPLETION CHECKLIST" section
- Report: which bugs fixed, which validations pass, any issues found
```

---

## PROMPT 2: Tier 2 High Severity Bugs

```
Continue bug fixes on the same codebase. 

SETUP:
- Read CLAUDE.md and .agent-docs/AGENT_TASKS.md (refresh context)
- Ensure previous Tier 1 changes are committed
- Create branch: git checkout -b fix/tier-2-high

EXECUTE these bugs from AGENT_TASKS.md Tier 2 section, in exact order:

1. BUG-007: Create src/utils/helpers/axios-interceptor.ts (401 handling) + integrate in src/app/provider.tsx
2. BUG-010: Fix vercel.json — remove catch-all rewrite
3. BUG-011: This is about updating CLAUDE.md — SKIP this one, I will handle it manually
4. BUG-012: Fix query key collisions — replace ALL "getAllEnrollments" bare keys with scoped hierarchical keys across: src/screens/enrollments/enrollments.tsx, src/screens/sessions/sessions.tsx, src/screens/student-teacher-classSchedules/*, src/screens/counselling/counselling.tsx, src/components/ui/superAdmin/invoices/generateInvoice-modal/*. Also update all queryClient.invalidateQueries calls.
5. BUG-015: Create src/components/global/error-boundary/error-boundary.tsx + wrap children in src/app/(protected)/layout.tsx
6. BUG-017: Create src/utils/helpers/mutation-utils.ts (shared error handler + mutation factory)
7. BUG-018: Create src/utils/helpers/query-params.ts (shared query param builder)
8. BUG-022: Convert src/utils/withAuth/withAuth.jsx to .tsx with proper types. Also convert src/components/global/custom-text-input/custom-text-input.jsx to .tsx.

RULES:
- One commit per bug
- Run "npx tsc --noEmit" after each fix
- Follow AGENT_TASKS.md exactly
- For BUG-012: search ALL files for the old key before committing — grep -rn '"getAllEnrollments"' src/

AFTER ALL FIXES:
- Run: npx tsc --noEmit && npm run lint
- Report results
```

---

## PROMPT 3: Tier 3 Medium Severity Bugs

```
Continue bug fixes on the same codebase.

SETUP:
- Read CLAUDE.md and .agent-docs/AGENT_TASKS.md (refresh context)
- Ensure previous changes are committed
- Create branch: git checkout -b fix/tier-3-medium

EXECUTE these bugs from AGENT_TASKS.md Tier 3 section:

1. BUG-009: Fix stale closure in src/screens/enrollments/enrollments.tsx — add missing useCallback dependencies. Search for other empty-dep useCallbacks that reference updateFilter or toggleModal in the same file.

2. BUG-014: Enable React strict mode in next.config.mjs — change reactStrictMode: false to true.

3. BUG-019: Rename files with typos. For EACH rename:
   a. Use "git mv" (not manual rename)
   b. Update ALL import paths that reference the old name
   c. Run "npx tsc --noEmit" to verify
   
   Renames:
   - src/services/dashboard/superAdmin/uers/ → users/
   - src/components/ui/superAdmin/billing/add-modal/add-moadl.tsx → add-modal.tsx
   - src/components/ui/superAdmin/users/add-modal/add-moadl.tsx → add-modal.tsx  
   - src/components/ui/teacher/class-shedule/ → class-schedule/
   - src/components/global/video-palyer/ → video-player/
   
   For each: grep -rn "old-name" src/ to find all import references before renaming.

4. BUG-020+021: Clean dead code in src/app/(protected)/layout.tsx:
   - Remove ALL commented-out imports
   - Remove ALL commented-out functions
   - Remove ALL commented-out JSX
   - Remove console.log("FCM token retrieved:", token) from src/lib/firebase/hooks/useFCMToken.ts (line 46) — this leaks the FCM token
   - Keep the AddFeedbackModal import ONLY if it's used in active (non-commented) JSX

5. BUG-024: Replace EmptyFallback in src/app/provider.tsx with a loading spinner (BootstrapLoader). Follow the exact code from AGENT_TASKS.md.

RULES:
- One commit per bug
- Run type check after each fix
- BUG-019 is the most dangerous — verify ALL imports update correctly

AFTER ALL FIXES:
Run the FULL post-completion checklist from AGENT_TASKS.md:
  npx tsc --noEmit
  npm run lint
  npm run build
  grep -rn 'AIzaSy\|BMg4cJ6' src/
  grep -rn '}\}' src/api/ --include="*.ts"  
  grep -rn 'dangerouslySetInnerHTML' src/ --include="*.tsx" | grep -v 'sanitizeHTML'
  find src -name "*.jsx"
  grep -rn '"getAllEnrollments"' src/

Report ALL results.
```

---

## PROMPT 4: Final Audit & Verification

```
All bug fixes should now be complete across three branches. I need you to verify everything is correct.

1. Read .agent-docs/AUDIT_REPORT.md to understand what was wrong
2. Run every validation command from the "POST-COMPLETION CHECKLIST" in .agent-docs/AGENT_TASKS.md
3. For each of the 25 bugs listed in AUDIT_REPORT.md, confirm whether it is FIXED or STILL PRESENT
4. Count remaining issues:
   - How many 'any' types: grep -rn ': any' src/ --include="*.ts" --include="*.tsx" | wc -l
   - How many console.log: grep -rn 'console.log' src/ --include="*.ts" --include="*.tsx" | wc -l
   - How many JSX files: find src -name "*.jsx" | wc -l
   - How many dangerouslySetInnerHTML without sanitize: grep -rn 'dangerouslySetInnerHTML' src/ --include="*.tsx" | grep -v 'sanitizeHTML' | wc -l

5. Produce a summary in this format:

TIER 1 CRITICAL:
- BUG-001: [FIXED/PRESENT] — evidence
- BUG-002: [FIXED/PRESENT] — evidence
- BUG-003: [FIXED/PRESENT] — evidence
- BUG-004: [FIXED/PRESENT] — evidence
- BUG-005: [FIXED/PRESENT] — evidence
- BUG-006: [FIXED/PRESENT] — evidence

TIER 2 HIGH:
- BUG-007: [FIXED/PRESENT] — evidence
... (all bugs)

TIER 3 MEDIUM:
... (all bugs)

METRICS:
- any types: before=841, after=???
- console.log: before=93, after=???
- JSX files: before=2, after=???
- Error boundaries: before=0, after=???

OVERALL: Estimated new audit score: X/10 (was 3.0/10)
```

---

## OPTIONAL PROMPT 5: Registry Rebuild

```
After all bugs are fixed, rebuild the agent memory system to reflect the current state of the codebase.

1. Update .agent-context/registry/index.json:
   - Recount components, screens, services, etc.
   - Update knownIssues section with current counts
   - Update godNodes if any import counts changed

2. Update .agent-context/sessions/current-task.md:
   - Mark all Tier 1, 2, 3 tasks as [done]
   - Update status to "completed"
   - List all files modified

3. Create .agent-context/sessions/history/2026-04-14-bug-remediation.md:
   - Archive the completed task with summary of all changes
   - Include final validation results
   - Include before/after metrics

4. Commit: git commit -m "chore: update agent memory after bug remediation"
```
