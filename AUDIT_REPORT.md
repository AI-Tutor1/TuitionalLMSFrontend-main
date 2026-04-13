# Tuitional LMS Frontend — Complete Bug Audit & Quality Assessment

**Audit Date:** April 13, 2026  
**Codebase:** TuitionalLMSFrontend-main  
**Auditor Scope:** 728 files | 321 TSX | 151 TS | 253 CSS Modules  
**Methodology:** Static analysis, pattern scanning, architectural review, security audit

---

## SECTION A: BUG REGISTRY

Every bug is categorized by severity, tagged with exact file location, and classified by type.

---

### 🔴 SEVERITY: CRITICAL (Will cause failures in production)

---

**BUG-001 | Double Closing Brace in API URLs**  
Type: Runtime Error  
Files: `src/api/sessions.api.ts` lines 104, 106  

```typescript
// CURRENT (BROKEN) — produces URLs like /api/sessions/123}
export const updateSessionApi = (id: string) =>
  `${BASE_URL}/api/sessions/${id}}`;
export const deleteSessionApi = (id: string) =>
  `${BASE_URL}/api/sessions/${id}}`;
```

Impact: Every session update and delete request returns 404. Users cannot edit session duration, change conclusion types, or delete sessions. This silently fails because the error handler shows a generic toast.

Fix: Remove the extra `}` from both template literals.

---

**BUG-002 | FormData Conversion Silently Fails on Nested Objects and Arrays**  
Type: Data Corruption  
File: `src/utils/helpers/payload-conversion.ts` line 5  

```typescript
// CURRENT — uses .map() for side effects, doesn't handle nested objects/arrays/files
export const ConvertObjectToFormData = (data: object) => {
  const formData = new FormData();
  Object.entries(data).map((value) => formData.append(value[0], value[1]));
  return formData;
};
```

Impact: Any API call using `multipart/form-data` with nested objects (e.g., student_ids array in enrollment creation) will append `[object Object]` as the value. File uploads with metadata will corrupt the payload. The `.map()` return value is discarded — should be `.forEach()`.

Fix: Implement recursive FormData builder that handles arrays, nested objects, File/Blob types, and null values.

---

**BUG-003 | User Password Hash Stored in Redux/LocalStorage**  
Type: Security Vulnerability  
File: `src/services/auth/auth.types.ts` line 28  

```typescript
export type User_Type = {
  // ...
  password: string;  // <-- Hashed password from backend response
  token: string;
};
```

Impact: The backend returns the password hash in the sign-in response. This gets stored in Redux → persisted to localStorage via `redux-persist`. Any XSS attack or browser extension can read the password hash from localStorage. Even hashed, this is a security violation (CWE-312: Cleartext Storage of Sensitive Information).

Fix: Strip `password`, `reset_token`, and `reset_token_expiry` from the user object before storing in Redux. Better yet, the backend should never return these fields.

---

**BUG-004 | Firebase Credentials Hardcoded in Source**  
Type: Security Vulnerability  
Files:  
- `src/lib/firebase/index.ts` — Full Firebase config (apiKey, authDomain, appId, measurementId)
- `src/lib/firebase/hooks/useFCMToken.ts` line 40 — VAPID key hardcoded

Impact: Firebase API key, project ID, and VAPID key are committed to the repository. While Firebase API keys are meant to be public, the VAPID key and full config should be in environment variables for environment-specific deployments (dev/staging/prod). Currently there are zero `.env` files — the entire app points at the production Firebase project.

Fix: Move all credentials to environment variables. Create `.env.local`, `.env.development`, `.env.production`.

---

**BUG-005 | BASE_URL Hardcoded — No Environment Configuration**  
Type: Configuration Error  
File: `src/services/config.ts`  

```typescript
export const BASE_URL = "https://dev.tuitionaledu.com";
// export const BASE_URL = "http://localhost:4000";
```

Impact: Developers must manually comment/uncomment URLs to switch environments. No `.env` files exist. Every deploy targets the same backend. Cannot run staging/production independently without code changes.

Fix: Use `process.env.NEXT_PUBLIC_API_BASE_URL` with `.env.*` files.

---

**BUG-006 | XSS Vulnerability in Chat Messages and HTML Reviewer**  
Type: Security Vulnerability  
Files:  
- `src/components/ui/superAdmin/chat/right/components/messageList/component/messageItem.tsx` lines 175, 216
- `src/components/global/html-reviewer/html-reviewer.tsx` line 12
- `src/screens/policies/policies.tsx` line 322

```typescript
// Chat messages rendered as raw HTML
dangerouslySetInnerHTML={{ __html: linkifyHTML(message.message_content) }}

// HTML reviewer accepts arbitrary HTML with zero sanitization
dangerouslySetInnerHTML={{ __html: children || "" }}
```

Impact: Any user who sends a chat message containing `<script>` tags or event handlers (`<img onerror="...">`) can execute arbitrary JavaScript in every recipient's browser. The HTML reviewer component renders policy content without sanitization. This is a textbook Stored XSS vulnerability.

Fix: Use DOMPurify to sanitize all HTML before rendering. For chat, consider rendering plain text with a linkify library that outputs React elements, not HTML strings.

---

### 🟠 SEVERITY: HIGH (Causes incorrect behavior or data loss)

---

**BUG-007 | No Token Refresh / Expiry Handling**  
Type: Auth Failure  
Files: `src/services/config.ts`, `src/utils/helpers/api-methods.ts`  

No axios interceptors exist. No 401/403 response handling. No token expiry check. When the JWT expires, every API call silently fails with 401 errors, but the user sees generic "An unexpected error occurred" toasts because error handlers don't check for auth failures. The user remains "logged in" (Redux has stale token) but all functionality breaks.

Fix: Add an Axios response interceptor that catches 401 → clears Redux → redirects to `/signin` with "Session expired" message.

---

**BUG-008 | Authorization Header Missing "Bearer" Prefix**  
Type: Potential Auth Failure  
File: `src/services/config.ts` line 10  

```typescript
Authorization: configData.token ? configData.token : "",
```

Standard JWT auth headers use `Bearer {token}`. If the backend currently works without it, it's non-standard and will break if the backend ever adds standard middleware.

---

**BUG-009 | Stale Closure in handleEnrollmentSearch**  
Type: React Hook Bug  
File: `src/screens/enrollments/enrollments.tsx` line 137  

```typescript
const handleEnrollmentSearch = useCallback((e: any) => {
  const enrollmentSearch = e.target.value;
  updateFilter("enrollmentSearch", enrollmentSearch);
}, []); // Empty deps array but references updateFilter
```

Impact: `updateFilter` is captured at mount time. If `updateFilter` ever changes (unlikely due to its own `useCallback` with `[]` deps, but still a React best-practice violation), the search handler would use stale references. This pattern is repeated across multiple screens.

---

**BUG-010 | Vercel Rewrite Conflicts with Next.js App Router**  
Type: Routing Error  
File: `vercel.json`  

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

Impact: This catch-all rewrite sends ALL requests (including API proxy routes, `_next/static`, `_next/image`) to the root page. Next.js handles its own routing — this rewrite is either redundant or actively harmful, potentially breaking static asset serving and API routes in production.

Fix: Remove the rewrite entirely, or scope it to only catch client-side routes that need SPA fallback behavior (which Next.js App Router handles natively).

---

**BUG-011 | CLAUDE.md Contradicts Actual Auth Behavior**  
Type: Documentation Error  
File: `CLAUDE.md` lines 97-104  

CLAUDE.md explicitly states: "Does NOT perform granular page-level authorization", "No assigned pages validation". The actual `withAuth.jsx` code checks `assignedPages` on every navigation and blocks unauthorized routes. Any developer or AI agent following CLAUDE.md will make incorrect assumptions about the auth system.

Fix: Update CLAUDE.md to accurately describe the full auth flow including page-level authorization.

---

**BUG-012 | Query Key Collision — "getAllEnrollments"**  
Type: Data Inconsistency  
Files: Used in 6 different locations with different parameters  

```
src/screens/enrollments/enrollments.tsx         → ["getAllEnrollments", ...12 filter deps]
src/screens/sessions/sessions.tsx               → ["getAllEnrollments", user?.id, isStudent, isTeacher, isParent]
src/screens/student-teacher-classSchedules/...  → ["getAllEnrollments"]
src/screens/counselling/counselling.tsx          → ["getAllEnrollments", role, id]
src/components/.../generateInvoice-modal.tsx    → ["getAllEnrollments", student]
```

Impact: When any screen calls `queryClient.invalidateQueries({ queryKey: ["getAllEnrollments"] })`, it invalidates ALL of these queries across the app — including ones on screens the user isn't viewing. This causes unnecessary refetches. Worse, the bare `["getAllEnrollments"]` key in class schedules will return cached data from enrollments with completely different filter parameters.

Fix: Use descriptive, scoped query keys: `["enrollments", "list", {...filters}]`, `["enrollments", "for-sessions", userId]`, etc.

---

### 🟡 SEVERITY: MEDIUM (Technical debt, maintainability, performance)

---

**BUG-013 | 841 Instances of `: any` Type**  
Type: Type Safety  
Scope: Entire codebase  

841 occurrences of `any` type annotations. This defeats the purpose of TypeScript. Concentrated in screen files (mutation handlers, filter callbacks, API response destructuring) and component props.

---

**BUG-014 | React Strict Mode Disabled**  
Type: Hidden Bugs  
File: `next.config.mjs` line 4  

```javascript
reactStrictMode: false,
```

Impact: Double-render detection is disabled, meaning stale effect bugs, missing cleanup functions, and improper side effects in render won't be caught during development.

---

**BUG-015 | No Error Boundaries**  
Type: Crash Recovery  
Scope: Entire application  

Zero `ErrorBoundary` components exist. A single unhandled JavaScript error in any component will crash the entire application (white screen). With 1163-line screen components containing complex state, this is a high-probability event.

---

**BUG-016 | Monolithic Screen Files**  
Type: Maintainability  
Files: Top offenders by line count:  

| File | Lines | Modals | Filters | Mutations |
|------|-------|--------|---------|-----------|
| session-details.tsx | 1163 | 4+ | 5+ | 6+ |
| sessions.tsx | 1047 | 3+ | 12+ | 4+ |
| enrollments.tsx | 1045 | 6 | 10 | 5 |
| invoices.tsx | 953 | 4+ | 6+ | 5+ |
| enrollment-details.tsx | 917 | 5+ | 3+ | 4+ |

Impact: Each file manages all state, queries, mutations, handlers, memoized props, and JSX in a single component. Bugs are difficult to isolate. Changes risk unintended side effects. Code review is impractical.

---

**BUG-017 | Duplicated Error Handling Pattern (~40+ occurrences)**  
Type: Code Duplication  
Scope: Every screen with mutations  

```typescript
// This exact pattern is copy-pasted across 40+ mutation handlers
onError: (error: unknown) => {
  const axiosError = error as MyAxiosError;
  toast.error(
    axiosError.message ||
      (axiosError?.response
        ? axiosError?.response.status === 404
          ? "No [resource] found"
          : axiosError?.response.data.error ||
            `${axiosError?.response.status} ${axiosError?.response.statusText}`
        : "An unexpected error occurred"),
  );
};
```

---

**BUG-018 | Duplicated Query Param Builder Pattern (~25+ occurrences)**  
Type: Code Duplication  
Scope: Every file in `src/api/`  

```typescript
// This exact pattern is repeated in every API URL builder
const params = new URLSearchParams();
if (options?.name) params.append("name", options?.name);
if (options?.startDate) params.append("startDate", options?.startDate);
if (options?.endDate) params.append("endDate", options?.endDate);
// ... 5-15 more conditionals per function
```

---

**BUG-019 | File and Directory Name Typos**  
Type: Code Quality  

| Current Name | Should Be |
|-------------|-----------|
| `src/services/dashboard/superAdmin/uers/` | `users/` |
| `src/components/.../add-moadl.tsx` (2 files) | `add-modal.tsx` |
| `src/components/ui/teacher/class-shedule/` | `class-schedule/` |
| `src/components/global/video-palyer/` | `video-player/` |
| `src/screens/class-calendar/class-calender.tsx` | `class-calendar.tsx` |
| `src/screens/parent-billing&Payments/` | `parent-billing-payments/` |
| `src/components/global/datepicker-originall/` | `datepicker-original/` |

Impact: The `&` in `parent-billing&Payments` can cause issues with shell scripts, CI/CD pipelines, and URL encoding.

---

**BUG-020 | 93 console.log Statements**  
Type: Information Leakage  
Scope: Entire codebase  

Although `next.config.mjs` strips console in production builds, 93 console.log statements slow development debugging by cluttering the console. FCM token is logged in plain text (`useFCMToken.ts` line 46).

---

**BUG-021 | Unused Imports in Protected Layout**  
Type: Dead Code  
File: `src/app/(protected)/layout.tsx`  

`AddFeedbackModal` is imported but only used in a commented-out JSX block. `MyAxiosError` is imported and used but only for a query error that triggers a console.error. Multiple commented-out imports and functions remain in the file.

---

**BUG-022 | Two JSX Files in TypeScript Project**  
Type: Inconsistency  
Files:  
- `src/utils/withAuth/withAuth.jsx`  
- `src/components/global/custom-text-input/custom-text-input.jsx`  

Both should be `.tsx` with proper type annotations. `withAuth.jsx` is the most critical file in the auth system and has zero type safety.

---

**BUG-023 | Accessibility: Only 10 ARIA Attributes in 36 Global Components**  
Type: Accessibility  
Scope: `src/components/global/`  

36 reusable components, only 10 instances of `aria-*` or `role=` attributes across all of them. Buttons, modals, dropdowns, toggles, and pagination have no ARIA labels, no keyboard navigation support, and no screen reader compatibility.

---

**BUG-024 | No Loading State for Initial App Bootstrap**  
Type: UX  
File: `src/app/provider.tsx`  

```typescript
if (!isMounted) {
  return <EmptyFallback />;  // Returns null — blank screen
}
```

Users see a blank white screen until the Redux store rehydrates and React mounts. No loading spinner, no skeleton, no visual feedback.

---

**BUG-025 | 3946 Optional Chaining Operations**  
Type: Defensive Programming Overuse  
Scope: Entire codebase  

3,946 instances of `?.` optional chaining. While some are legitimate, this volume suggests the data contracts between API and frontend are poorly defined — developers use `?.` as a substitute for proper type narrowing and null checks.

---

---

## SECTION B: CTO-LEVEL QUALITY ASSESSMENT

### Scoring Methodology

Each category is scored 1-10 where:
- 1-3 = Critical failures, requires immediate remediation
- 4-6 = Below production standard, significant investment needed
- 7-8 = Acceptable with improvements
- 9-10 = Production excellence

---

### 1. SECURITY — Score: 2/10

| Finding | Impact |
|---------|--------|
| Stored XSS in chat via `dangerouslySetInnerHTML` on unsanitized user input | Critical |
| Password hash persisted in localStorage via Redux Persist | Critical |
| Firebase credentials hardcoded (no `.env` files exist) | High |
| VAPID key hardcoded in source | High |
| BASE_URL hardcoded — no environment separation | High |
| No CSRF protection | Medium |
| No rate limiting on client side | Medium |
| No Content Security Policy for inline scripts | Medium |
| FCM token logged to console in plain text | Low |
| Authorization header missing "Bearer" prefix | Low |

**Assessment:** The application has multiple exploitable vulnerabilities. The XSS in chat is the most dangerous — any authenticated user can execute JavaScript in other users' browsers. Password hashes in localStorage compound this risk. No security review has been performed.

---

### 2. TYPE SAFETY — Score: 3/10

| Metric | Value |
|--------|-------|
| Total `any` annotations | 841 |
| Files with `any` in function parameters | ~120 |
| API response types with proper generics | ~40% |
| Mutation payloads typed as `any` | ~60% |
| Filter state types | Partially typed |
| Component props with `any` | ~30% |

**Assessment:** TypeScript is used as a syntax layer, not a safety net. The most critical code paths (mutations, error handlers, filter callbacks) bypass the type system entirely. The value of TypeScript adoption is significantly diminished.

---

### 3. ARCHITECTURE — Score: 5/10

| Aspect | Score | Notes |
|--------|-------|-------|
| Directory structure | 7 | Clean separation of app/screens/components/services |
| State management split | 6 | Redux for global + React Query for server — correct choice |
| API layer design | 4 | URL builders + service functions pattern is good; implementation has massive duplication |
| Component hierarchy | 5 | Global primitives exist but are insufficient; role-specific components are coupled |
| Screen organization | 3 | Monolithic files, no separation of concerns within screens |
| Auth architecture | 6 | withAuth HOC works but is complex and fragile |
| Real-time architecture | 7 | Singleton SocketManager is well-designed |
| Routing | 7 | Next.js App Router with role-based dynamic segments is elegant |

**Assessment:** The architectural skeleton is sound — the right tools were chosen and the directory structure makes sense. But the implementation within each layer has devolved into copy-paste patterns and God Components. The foundation supports scaling; the current code does not.

---

### 4. CODE QUALITY — Score: 3/10

| Metric | Value | Benchmark |
|--------|-------|-----------|
| Average screen file size | 650 lines | Target: < 200 |
| Largest component | 1263 lines | Target: < 300 |
| Code duplication (error handling) | 40+ identical blocks | Target: 0 |
| Code duplication (query params) | 25+ identical patterns | Target: 0 |
| File naming typos | 7 directories/files | Target: 0 |
| Console statements | 93 | Target: 0 in committed code |
| Dead/commented code | ~100 lines in protected layout alone | Target: 0 |

---

### 5. ERROR HANDLING — Score: 2/10

| Aspect | Status |
|--------|--------|
| Error boundaries | None exist |
| Global error handler | None |
| Axios interceptors | None |
| 401/403 handling | None |
| Network failure recovery | None |
| Offline detection | None |
| Retry logic | None |
| User-friendly error messages | Generic toasts only |

**Assessment:** A single uncaught error crashes the entire app. Expired tokens silently break all functionality. Network failures show cryptic messages. There is no graceful degradation at any level.

---

### 6. PERFORMANCE — Score: 6/10

| Aspect | Score | Notes |
|--------|-------|-------|
| Bundle splitting | 7 | Vendor chunking configured (MUI, Redux, Charts, Firebase) |
| Image optimization | 7 | Next.js Image with proper remote patterns |
| CSS optimization | 6 | CSS Modules prevent global pollution; `optimizeCss` enabled |
| React memoization | 6 | Heavy use of `useMemo`/`useCallback`/`memo` |
| Data fetching | 5 | React Query caching used but `refetchOnWindowFocus: false` means stale data |
| Initial load | 4 | No loading state (blank screen), no code splitting at route level |
| Re-render prevention | 4 | Overly complex memoization often recreates objects anyway |

---

### 7. TESTING — Score: 0/10

| Test Type | Status |
|-----------|--------|
| Unit tests | None |
| Integration tests | None |
| E2E tests | None |
| Visual regression tests | None |
| Accessibility tests | None |
| Performance tests | None |
| Test framework configured | No |

**Assessment:** Zero tests. Zero test infrastructure. No Jest, no Cypress, no Playwright, no Testing Library. For a system managing financial transactions, student records, and real-time communication, this is a critical risk.

---

### 8. ACCESSIBILITY (a11y) — Score: 2/10

| Aspect | Status |
|--------|--------|
| ARIA labels on interactive elements | 10 total across 36 global components |
| Keyboard navigation | Not implemented |
| Focus management in modals | Not implemented |
| Screen reader compatibility | Not tested |
| Color contrast compliance | Unknown |
| Skip navigation links | None |
| Form label associations | Inconsistent |

---

### 9. DOCUMENTATION — Score: 4/10

| Document | Status |
|----------|--------|
| CLAUDE.md | Exists but contains inaccurate auth description |
| README.md | Basic setup instructions only |
| Chat README | Good — detailed architecture docs |
| Component documentation | None |
| API documentation | None (types serve as partial docs) |
| Architecture Decision Records | None |
| Onboarding guide | None |

---

### 10. DEPLOYMENT & DEVOPS — Score: 3/10

| Aspect | Status |
|--------|--------|
| Environment configuration | None (hardcoded URLs/keys) |
| CI/CD pipeline | Not configured |
| Linting | ESLint configured but unused in CI |
| Pre-commit hooks | None |
| Branch protection | Unknown |
| Staging environment | None apparent |
| Monitoring/observability | None |
| Error tracking (Sentry etc.) | None |

---

## SECTION C: OVERALL SCORES

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Security | 2/10 | 20% | 0.4 |
| Type Safety | 3/10 | 10% | 0.3 |
| Architecture | 5/10 | 15% | 0.75 |
| Code Quality | 3/10 | 15% | 0.45 |
| Error Handling | 2/10 | 10% | 0.2 |
| Performance | 6/10 | 10% | 0.6 |
| Testing | 0/10 | 10% | 0.0 |
| Accessibility | 2/10 | 5% | 0.1 |
| Documentation | 4/10 | 2.5% | 0.1 |
| DevOps | 3/10 | 2.5% | 0.075 |
| **TOTAL** | | **100%** | **2.975 / 10** |

---

## SECTION D: REMEDIATION PRIORITY MATRIX

### Tier 1 — Fix Immediately (Week 1)
1. BUG-001: Double-brace URL fix (5 minutes)
2. BUG-006: Sanitize `dangerouslySetInnerHTML` with DOMPurify (2 hours)
3. BUG-003: Strip password from Redux user object (30 minutes)
4. BUG-005: Move credentials to environment variables (1 hour)
5. BUG-007: Add Axios 401 interceptor with redirect (1 hour)
6. BUG-011: Fix CLAUDE.md to match actual auth behavior (30 minutes)

### Tier 2 — Fix This Sprint (Week 2-3)
7. BUG-002: Fix FormData conversion utility (1 hour)
8. BUG-010: Remove conflicting Vercel rewrite (5 minutes)
9. BUG-015: Add React Error Boundaries at layout + screen level (3 hours)
10. BUG-017: Extract shared mutation error handler (2 hours)
11. BUG-018: Extract shared query param builder (2 hours)
12. BUG-022: Convert JSX files to TSX (2 hours)

### Tier 3 — Architectural Improvement (Month 1-2)
13. BUG-016: Decompose monolithic screens into custom hooks
14. BUG-013: Systematic `any` elimination campaign
15. BUG-012: Implement scoped query key strategy
16. BUG-023: Accessibility audit and remediation
17. BUG-014: Enable React Strict Mode and fix violations

### Tier 4 — Long-term Investment (Quarter 1-2)
18. Implement testing framework and achieve 60%+ coverage
19. Set up CI/CD pipeline with linting, type-checking, tests
20. Set up error monitoring (Sentry)
21. Performance audit with Lighthouse + Core Web Vitals

---

**End of Audit Report**
