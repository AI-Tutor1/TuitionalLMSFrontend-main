# AGENT_TASKS.md — Tuitional LMS Bug Remediation Workflow

> **Purpose:** This document is the single source of truth for an AI coding agent tasked with fixing all catalogued bugs in the Tuitional LMS Frontend. Read this ENTIRELY before writing any code.

---

## OPERATING RULES

1. **One branch per tier.** Create `fix/tier-1-critical`, `fix/tier-2-high`, `fix/tier-3-medium`. Never push directly to `main`.
2. **One commit per bug.** Commit message format: `fix(BUG-XXX): <short description>`. Example: `fix(BUG-001): remove double brace in session API URLs`.
3. **Run validation after every fix.** Each task has a `VALIDATE` block. If validation fails, do not proceed.
4. **Do not refactor while fixing.** Fix only what the task describes. Do not rename files, restructure folders, or "improve" code outside the task scope.
5. **Do not modify test files.** There are none. Do not create test files during bug fixes — that is a separate initiative.
6. **Read DESIGN.md before touching any component.** It defines the project's visual tokens and component patterns.
7. **Read CLAUDE.md for project architecture.** It describes the tech stack, routing, state management, and conventions.
8. **Preserve existing patterns.** If the codebase uses CSS Modules, do not introduce Tailwind. If it uses `useCallback`, do not switch to `useEvent`. Match what exists.
9. **When creating new shared utilities**, place them in `src/utils/helpers/` and export from an index file.
10. **Type everything.** No new `any` types. If a fix touches code with `any`, type it properly as part of the fix.

---

## GIT WORKFLOW

```bash
# Before starting any tier
git checkout main
git pull origin main

# Create tier branch
git checkout -b fix/tier-1-critical

# After each bug fix
git add <changed-files-only>
git commit -m "fix(BUG-XXX): description"

# After completing all bugs in a tier
git push origin fix/tier-1-critical
# Create PR → Review → Merge to main

# Then start next tier
git checkout main
git pull origin main
git checkout -b fix/tier-2-high
```

---

## TIER 1 — CRITICAL (Do First)

These bugs cause failures, security vulnerabilities, or data corruption in production.

---

### TASK: BUG-001 — Fix Double-Brace API URLs

**Files to modify:**
- `src/api/sessions.api.ts`

**What to change:**

Line 104 — Remove extra closing brace:
```typescript
// BEFORE (broken)
export const updateSessionApi = (id: string) =>
  `${BASE_URL}/api/sessions/${id}}`;

// AFTER (fixed)
export const updateSessionApi = (id: string) =>
  `${BASE_URL}/api/sessions/${id}`;
```

Line 106 — Same fix:
```typescript
// BEFORE (broken)
export const deleteSessionApi = (id: string) =>
  `${BASE_URL}/api/sessions/${id}}`;

// AFTER (fixed)
export const deleteSessionApi = (id: string) =>
  `${BASE_URL}/api/sessions/${id}`;
```

**VALIDATE:**
- `grep -n '}}'  src/api/sessions.api.ts` should return zero results for template literal lines.
- Search entire `src/api/` for any other double-brace patterns: `grep -rn "}\}" src/api/ --include="*.ts"` — fix any found.

**Commit:** `fix(BUG-001): remove double closing brace in session API URLs`

---

### TASK: BUG-002 — Fix FormData Conversion Utility

**Files to modify:**
- `src/utils/helpers/payload-conversion.ts`

**What to change:**

Replace the entire `ConvertObjectToFormData` function:

```typescript
// BEFORE (broken — doesn't handle arrays, nested objects, files; uses .map for side effects)
export const ConvertObjectToFormData = (data: object) => {
  const formData = new FormData();
  Object.entries(data).map((value) => formData.append(value[0], value[1]));
  return formData;
};

// AFTER (handles all types correctly)
export const ConvertObjectToFormData = (
  data: Record<string, unknown>,
  formData: FormData = new FormData(),
  parentKey?: string
): FormData => {
  Object.entries(data).forEach(([key, value]) => {
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value === null || value === undefined) {
      return; // Skip null/undefined values
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(formKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File || item instanceof Blob) {
          formData.append(`${formKey}[${index}]`, item);
        } else if (typeof item === "object" && item !== null) {
          ConvertObjectToFormData(
            item as Record<string, unknown>,
            formData,
            `${formKey}[${index}]`
          );
        } else {
          formData.append(`${formKey}[${index}]`, String(item));
        }
      });
    } else if (typeof value === "object" && !(value instanceof Date)) {
      ConvertObjectToFormData(
        value as Record<string, unknown>,
        formData,
        formKey
      );
    } else {
      formData.append(formKey, String(value));
    }
  });

  return formData;
};
```

**VALIDATE:**
- TypeScript compiles without errors: `npx tsc --noEmit`
- No other files import `ConvertObjectToFormData` with different signatures — check: `grep -rn 'ConvertObjectToFormData' src/`

**Commit:** `fix(BUG-002): handle nested objects, arrays, and files in FormData conversion`

---

### TASK: BUG-003 — Strip Sensitive Fields from User Redux State

**Files to modify:**
- `src/lib/store/slices/user-slice.ts`

**What to change:**

In the `setUserData` reducer, strip `password`, `reset_token`, and `reset_token_expiry` before storing:

```typescript
// BEFORE
setUserData: (state, action: PayloadAction<SignIn_Response_Type>) => {
  state.token = action.payload.token;
  state.user = { ...action.payload.user };
  // ...
},

// AFTER
setUserData: (state, action: PayloadAction<SignIn_Response_Type>) => {
  state.token = action.payload.token;
  const { password, reset_token, reset_token_expiry, ...safeUser } =
    action.payload.user;
  state.user = { ...safeUser } as User_Type;
  // ...
},
```

Also update `User_Type` in `src/services/auth/auth.types.ts` to make the sensitive fields optional so the stripped object is still valid:

```typescript
// In User_Type, change these three fields to optional:
  password?: string;
  reset_token?: string | null;
  reset_token_expiry?: string | null;
```

**VALIDATE:**
- TypeScript compiles: `npx tsc --noEmit`
- Search for any direct access to `user.password` in the codebase: `grep -rn 'user\.password\|user?.password' src/` — should return zero results in component/screen files.

**Commit:** `fix(BUG-003): strip password hash and reset tokens from persisted user state`

---

### TASK: BUG-004 + BUG-005 — Move All Hardcoded Credentials to Environment Variables

**Files to create:**
- `.env.local` (gitignored)
- `.env.example` (committed — shows required vars without values)

**Files to modify:**
- `.gitignore` — add `.env.local`, `.env*.local`
- `src/services/config.ts` — use `process.env.NEXT_PUBLIC_API_BASE_URL`
- `src/lib/firebase/index.ts` — use `process.env.NEXT_PUBLIC_FIREBASE_*`
- `src/lib/firebase/hooks/useFCMToken.ts` — use `process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY`

**Step 1 — Create `.env.example`:**

```env
# API
NEXT_PUBLIC_API_BASE_URL=https://dev.tuitionaledu.com

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

**Step 2 — Create `.env.local`** (copy from `.env.example` and fill in current values from the hardcoded files):

```env
NEXT_PUBLIC_API_BASE_URL=https://dev.tuitionaledu.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDz3CotnTdgoZpOSBIZgDvK83SzfP7aoHo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tuitional-lms-115ae.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tuitional-lms-115ae
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tuitional-lms-115ae.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=394983471176
NEXT_PUBLIC_FIREBASE_APP_ID=1:394983471176:web:42e4a8baff3bd6e16a007d
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-9YFQ2CGKEP
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BMg4cJ6Pl4TqQ-oS0M_EXaFSNBXQTQbiOLLom_cleNrfMVHrrgmdF41hH1hQfKqC-CODBySbM7VmetTmH2dVCME
```

**Step 3 — Update `.gitignore`:**
Add these lines:
```
.env.local
.env*.local
```

**Step 4 — Update `src/services/config.ts`:**
```typescript
// BEFORE
export const BASE_URL = "https://dev.tuitionaledu.com";

// AFTER
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev.tuitionaledu.com";
```

**Step 5 — Update `src/lib/firebase/index.ts`:**
```typescript
// BEFORE
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDz3CotnTdgoZpOSBIZgDvK83SzfP7aoHo",
  authDomain: "tuitional-lms-115ae.firebaseapp.com",
  // ... hardcoded values
};

// AFTER
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};
```

**Step 6 — Update `src/lib/firebase/hooks/useFCMToken.ts`:**
Replace the hardcoded VAPID key:
```typescript
// BEFORE
"BMg4cJ6Pl4TqQ-oS0M_EXaFSNBXQTQbiOLLom_cleNrfMVHrrgmdF41hH1hQfKqC-CODBySbM7VmetTmH2dVCME",

// AFTER
process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "",
```

**VALIDATE:**
- `.env.local` exists and is NOT tracked by git: `git status` should not show it.
- `.env.example` IS tracked by git.
- `grep -rn 'AIzaSy' src/` returns zero results (no hardcoded Firebase keys remain).
- `grep -rn 'BMg4cJ6' src/` returns zero results (no hardcoded VAPID key).
- Application still starts: `npm run dev` should boot without errors.

**Commit:** `fix(BUG-004,BUG-005): move all credentials to environment variables`

---

### TASK: BUG-006 — Sanitize All dangerouslySetInnerHTML Usage

**Dependencies to install:**
```bash
npm install dompurify
npm install -D @types/dompurify
```

**Files to create:**
- `src/utils/helpers/sanitize-html.ts`

```typescript
import DOMPurify from "dompurify";

/**
 * Sanitize HTML string to prevent XSS attacks.
 * Allows safe HTML tags (formatting, links) but strips scripts and event handlers.
 */
export const sanitizeHTML = (dirty: string): string => {
  if (typeof window === "undefined") return dirty;
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li",
      "span", "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote",
      "code", "pre", "img",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "class", "style", "src", "alt", "width", "height",
    ],
    ALLOW_DATA_ATTR: false,
  });
};
```

**Files to modify (every file using `dangerouslySetInnerHTML`):**

1. `src/components/ui/superAdmin/chat/right/components/messageList/component/messageItem.tsx`
   - Import: `import { sanitizeHTML } from "@/utils/helpers/sanitize-html";`
   - Change all `dangerouslySetInnerHTML={{ __html: linkifyHTML(...) }}` to `dangerouslySetInnerHTML={{ __html: sanitizeHTML(linkifyHTML(...)) }}`

2. `src/components/global/html-reviewer/html-reviewer.tsx`
   - Import: `import { sanitizeHTML } from "@/utils/helpers/sanitize-html";`
   - Change: `dangerouslySetInnerHTML={{ __html: children || "" }}` to `dangerouslySetInnerHTML={{ __html: sanitizeHTML(children || "") }}`

3. `src/screens/policies/policies.tsx`
   - Import: `import { sanitizeHTML } from "@/utils/helpers/sanitize-html";`
   - Wrap every `dangerouslySetInnerHTML` value with `sanitizeHTML()`

4. `src/components/ui/superAdmin/admin-dashboard/attendance-chart/attendance-chart.tsx`
   - Same pattern: wrap with `sanitizeHTML()`

5. `src/components/ui/superAdmin/admin-dashboard/userEngagement-chart/userEngagement-chart.tsx`
   - Same pattern: wrap with `sanitizeHTML()`

**VALIDATE:**
- `grep -rn 'dangerouslySetInnerHTML' src/ --include="*.tsx"` — every result should have `sanitizeHTML()` wrapping the value.
- `npm run build` compiles without errors.

**Commit:** `fix(BUG-006): sanitize all dangerouslySetInnerHTML usage with DOMPurify`

---

## TIER 2 — HIGH (Do Second)

These bugs cause incorrect behavior, data inconsistencies, or auth failures.

---

### TASK: BUG-007 — Add Axios 401 Interceptor for Token Expiry

**Files to create:**
- `src/utils/helpers/axios-interceptor.ts`

```typescript
import axios from "axios";
import { store } from "@/lib/store/store";
import { emptyUserData } from "@/lib/store/slices/user-slice";
import { emptyAssignedPages } from "@/lib/store/slices/assignedPages-slice";
import { emptyResources } from "@/lib/store/slices/resources-slice";
import { toast } from "react-toastify";

let isRedirecting = false;

export const setupAxiosInterceptors = (): void => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error?.response?.status === 401 &&
        !isRedirecting
      ) {
        isRedirecting = true;

        // Clear all persisted state
        store.dispatch(emptyUserData());
        store.dispatch(emptyAssignedPages());
        store.dispatch(emptyResources());

        toast.error("Session expired. Please sign in again.");

        // Redirect to signin
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }

        // Reset flag after redirect
        setTimeout(() => {
          isRedirecting = false;
        }, 3000);
      }

      return Promise.reject(error);
    }
  );
};
```

**Files to modify:**
- `src/app/provider.tsx` — Call `setupAxiosInterceptors()` once on mount:

```typescript
// Add import at top
import { setupAxiosInterceptors } from "@/utils/helpers/axios-interceptor";

// Inside MainProvider, add to the useEffect:
useEffect(() => {
  setIsMounted(true);
  setupAxiosInterceptors();
}, []);
```

**VALIDATE:**
- `npx tsc --noEmit` — compiles.
- `grep -rn 'setupAxiosInterceptors' src/` shows import in provider.tsx.

**Commit:** `fix(BUG-007): add axios 401 interceptor for automatic session expiry handling`

---

### TASK: BUG-010 — Remove Conflicting Vercel Rewrite

**Files to modify:**
- `vercel.json`

```json
// BEFORE
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }

// AFTER
{}
```

**Reasoning:** Next.js App Router handles all client-side routing natively. The catch-all rewrite is redundant and potentially conflicts with `_next/static`, `_next/image`, and API routes.

**VALIDATE:**
- `npm run build` succeeds.

**Commit:** `fix(BUG-010): remove catch-all Vercel rewrite that conflicts with Next.js routing`

---

### TASK: BUG-011 — Update CLAUDE.md to Match Actual Auth Behavior

**Files to modify:**
- `CLAUDE.md`

Replace the entire "Authentication System" section (lines ~77-104) with:

```markdown
### Authentication System

**JWT-Based Auth with Page-Level Authorization**

The application uses JWT authentication combined with role-based page-level access control:

- **JWT token**: Stored in Redux (persisted via `redux-persist`)
- **User state**: User object (with sensitive fields stripped) persisted in Redux
- **Assigned pages**: List of permitted routes per role, fetched and persisted in Redux

**withAuth HOC** (`src/utils/withAuth/withAuth.jsx`):
- Redirects unauthenticated users to `/signin`
- Redirects authenticated users away from public routes to their dashboard
- Blocks access to other roles' route prefixes (e.g., teacher cannot access `/superAdmin/*`)
- **Performs page-level authorization**: checks if the current route is in the user's `assignedPages` list
- Shows toast messages for access denied scenarios

**Auth Scenarios:**
1. Not logged in → any protected route → redirect to `/signin`
2. Logged in → public route (`/signin`, `/forgot-password`) → redirect to role dashboard
3. Logged in → wrong role prefix → redirect to own dashboard
4. Logged in → route not in assignedPages → redirect to own dashboard with "Access denied"
5. Logged in → permitted route → page loads normally

**Public Routes:** `/signin`, `/forgot-password`, `/password-reset/[email]`, `/confirm-password/[email]`
**Protected Routes:** All routes under `/(protected)/[role]/*`
```

**VALIDATE:**
- Read the updated section — it must accurately match what `src/utils/withAuth/withAuth.jsx` actually does.

**Commit:** `fix(BUG-011): update CLAUDE.md to accurately describe page-level authorization`

---

### TASK: BUG-012 — Fix Query Key Collisions

**Files to modify:** Every file using `queryKey: ["getAllEnrollments"...]`

Apply scoped, descriptive query keys:

| File | Current Key | New Key |
|------|------------|---------|
| `src/screens/enrollments/enrollments.tsx` | `["getAllEnrollments", ...filters]` | `["enrollments", "list", ...filters]` |
| `src/screens/sessions/sessions.tsx` | `["getAllEnrollments", user?.id, ...]` | `["enrollments", "for-session-filters", user?.id, ...]` |
| `src/screens/student-teacher-classSchedules/...` | `["getAllEnrollments"]` | `["enrollments", "for-class-schedule"]` |
| `src/screens/counselling/counselling.tsx` | `["getAllEnrollments", role, id]` | `["enrollments", "for-counselling", role, id]` |
| `src/components/.../generateInvoice-modal.tsx` | `["getAllEnrollments", student]` | `["enrollments", "for-invoice-gen", student]` |

Also update all `queryClient.invalidateQueries` calls to match. Use partial key matching:
```typescript
// Instead of invalidating ALL enrollment queries:
queryClient.invalidateQueries({ queryKey: ["getAllEnrollments"] });

// Invalidate only the list query:
queryClient.invalidateQueries({ queryKey: ["enrollments", "list"] });
```

**VALIDATE:**
- `grep -rn '"getAllEnrollments"' src/` returns zero results.
- Application compiles: `npx tsc --noEmit`

**Commit:** `fix(BUG-012): scope enrollment query keys to prevent cross-screen cache collisions`

---

### TASK: BUG-015 — Add React Error Boundaries

**Files to create:**
- `src/components/global/error-boundary/error-boundary.tsx`

```typescript
"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
    // TODO: Send to error monitoring service (Sentry)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "var(--font-primary, 'League Spartan Regular', sans-serif)",
        }}>
          <h2 style={{ fontSize: "18px", marginBottom: "8px", color: "var(--red-color)" }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-grey)", marginBottom: "16px" }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 24px",
              background: "var(--main-blue-color)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Files to modify:**
- `src/app/(protected)/layout.tsx` — Wrap children with ErrorBoundary:

```typescript
import ErrorBoundary from "@/components/global/error-boundary/error-boundary";

// In the JSX, wrap {children}:
<div className={classes.mainContent}>
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
</div>
```

**VALIDATE:**
- `npx tsc --noEmit`
- `grep -rn 'ErrorBoundary' src/` shows import in protected layout.

**Commit:** `fix(BUG-015): add ErrorBoundary to protected layout for crash recovery`

---

### TASK: BUG-017 — Extract Shared Mutation Error Handler

**Files to create:**
- `src/utils/helpers/mutation-utils.ts`

```typescript
import { toast } from "react-toastify";

interface AxiosErrorShape {
  message?: string;
  response?: {
    status: number;
    statusText: string;
    data: {
      message?: string;
      error?: string;
    };
  };
}

/**
 * Standard error handler for TanStack Query mutations.
 * Extracts the most useful error message and shows a toast.
 */
export const handleMutationError = (
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred"
): void => {
  const axiosError = error as AxiosErrorShape;

  const message =
    axiosError?.response?.data?.message ||
    axiosError?.response?.data?.error ||
    (axiosError?.response
      ? `${axiosError.response.status} ${axiosError.response.statusText}`
      : axiosError?.message || fallbackMessage);

  toast.error(message);
};

/**
 * Standard success handler pattern for mutations.
 * Shows success toast + invalidates queries + closes modal.
 */
export const createMutationHandlers = (options: {
  successMessage: string;
  queryClient: { invalidateQueries: (opts: { queryKey: string[] }) => void };
  invalidateKeys?: string[][];
  onSuccess?: () => void;
  onError?: () => void;
}) => ({
  onSuccess: (data: { message?: string; error?: string }) => {
    if (data?.error) {
      toast.error(data.error);
      return;
    }
    if (data?.message) {
      toast.success(data.message);
    } else {
      toast.success(options.successMessage);
    }
    options.invalidateKeys?.forEach((key) => {
      options.queryClient.invalidateQueries({ queryKey: key });
    });
    options.onSuccess?.();
  },
  onError: (error: unknown) => {
    handleMutationError(error);
    options.onError?.();
  },
});
```

**DO NOT refactor existing screens to use this yet.** Just create the utility. Screen refactoring is a separate initiative in Tier 3.

**VALIDATE:**
- `npx tsc --noEmit`
- File exists at `src/utils/helpers/mutation-utils.ts`

**Commit:** `fix(BUG-017): create shared mutation error handler utility`

---

### TASK: BUG-018 — Extract Shared Query Param Builder

**Files to create:**
- `src/utils/helpers/query-params.ts`

```typescript
/**
 * Build URLSearchParams from an options object, skipping null/undefined/empty values.
 * Eliminates the repeated if-append pattern across all API files.
 */
export const buildQueryParams = (
  options: Record<string, string | number | boolean | null | undefined>
): URLSearchParams => {
  const params = new URLSearchParams();

  Object.entries(options).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });

  return params;
};

/**
 * Build a full URL with query params appended.
 */
export const buildApiUrl = (
  baseUrl: string,
  options: Record<string, string | number | boolean | null | undefined>
): string => {
  const params = buildQueryParams(options);
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};
```

**DO NOT refactor existing API files to use this yet.** Just create the utility.

**VALIDATE:**
- `npx tsc --noEmit`

**Commit:** `fix(BUG-018): create shared query param builder utility`

---

### TASK: BUG-022 — Convert withAuth from JSX to TSX

**Files to rename and modify:**
- Rename: `src/utils/withAuth/withAuth.jsx` → `src/utils/withAuth/withAuth.tsx`

Add proper TypeScript types to the file. Key type additions:

```typescript
import { ComponentType } from "react";

// Type the HOC properly
export const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> => {
  // ... existing logic with proper typing
};
```

**IMPORTANT:** Also convert `src/components/global/custom-text-input/custom-text-input.jsx` to `.tsx`.

**VALIDATE:**
- `find src -name "*.jsx"` returns zero results.
- `npx tsc --noEmit`

**Commit:** `fix(BUG-022): convert remaining JSX files to TypeScript`

---

## TIER 3 — MEDIUM (Do Third)

These are technical debt, naming issues, and code quality improvements.

---

### TASK: BUG-009 — Fix Stale Closure in handleEnrollmentSearch

**Files to modify:**
- `src/screens/enrollments/enrollments.tsx`

```typescript
// BEFORE — missing dependency
const handleEnrollmentSearch = useCallback((e: any) => {
  const enrollmentSearch = e.target.value;
  updateFilter("enrollmentSearch", enrollmentSearch);
}, []);

// AFTER — proper dependency + typed event
const handleEnrollmentSearch = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter("enrollmentSearch", e.target.value);
  },
  [updateFilter]
);
```

**Repeat this pattern** for any other `useCallback` with empty deps that references `updateFilter` or `toggleModal`. Search: `grep -n 'useCallback.*\[\]' src/screens/enrollments/enrollments.tsx`

**Commit:** `fix(BUG-009): add missing dependencies to useCallback hooks in enrollments`

---

### TASK: BUG-014 — Enable React Strict Mode

**Files to modify:**
- `next.config.mjs`

```javascript
// BEFORE
reactStrictMode: false,

// AFTER
reactStrictMode: true,
```

**WARNING:** This may surface double-render warnings in development. These are intentional — they help find bugs. Do not disable strict mode to "fix" them. Fix the underlying issues instead.

**Commit:** `fix(BUG-014): enable React strict mode for development bug detection`

---

### TASK: BUG-019 — Fix File and Directory Name Typos

**This task requires careful git operations.** Rename files/directories one at a time and update all imports.

| Rename | Update imports in |
|--------|------------------|
| `src/services/dashboard/superAdmin/uers/` → `src/services/dashboard/superAdmin/users/` | Any file importing from the old path |
| `src/components/.../billing/add-modal/add-moadl.tsx` → `add-modal.tsx` | `src/components/ui/superAdmin/billing/add-modal/` imports |
| `src/components/.../users/add-modal/add-moadl.tsx` → `add-modal.tsx` | `src/components/ui/superAdmin/users/add-modal/` imports |
| `src/components/ui/teacher/class-shedule/` → `class-schedule/` | All imports referencing this path |
| `src/components/global/video-palyer/` → `video-player/` | All imports referencing this path |

**For each rename:**
1. `git mv old-path new-path`
2. Search for old path in imports: `grep -rn 'old-path-fragment' src/`
3. Update all import paths.
4. `npx tsc --noEmit` to verify.

**DO NOT rename** `src/screens/parent-billing&Payments/` in this pass — the `&` character requires special handling and the route name may be intentional. Flag it for a future ticket.

**Commit:** `fix(BUG-019): correct typos in file and directory names`

---

### TASK: BUG-020 + BUG-021 — Remove Dead Code and Console Statements

**Files to modify:**
- `src/app/(protected)/layout.tsx` — Remove all commented-out imports, commented-out functions, and commented-out JSX.
- `src/lib/firebase/hooks/useFCMToken.ts` — Remove `console.log("FCM token retrieved:", token)` (line 46). This logs a sensitive token.

**DO NOT** remove `console.log` from `src/utils/helpers/api-methods.ts` — those are stripped by the production compiler and are useful in development. Only remove console statements that leak sensitive data.

**Commit:** `fix(BUG-020,BUG-021): remove dead code from protected layout and sensitive console.log`

---

### TASK: BUG-024 — Add Loading State for App Bootstrap

**Files to modify:**
- `src/app/provider.tsx`

Replace the empty fallback:

```typescript
// BEFORE
const EmptyFallback = () => null;

// AFTER
const BootstrapLoader = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
    background: "var(--main-white-color, #fff)",
  }}>
    <div style={{
      width: "40px",
      height: "40px",
      border: "3px solid var(--sidebar-border-color, #a0afb8)",
      borderTopColor: "var(--main-blue-color, #38b6ff)",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
```

Update the usage:
```typescript
if (!isMounted) {
  return <BootstrapLoader />;
}
```

**Commit:** `fix(BUG-024): add loading spinner during app bootstrap instead of blank screen`

---

## POST-COMPLETION CHECKLIST

After all tiers are complete, run these final validations:

```bash
# 1. Full TypeScript check
npx tsc --noEmit

# 2. Linting
npm run lint

# 3. Build check
npm run build

# 4. No hardcoded secrets remain
grep -rn 'AIzaSy\|BMg4cJ6' src/
# Expected: zero results

# 5. No double-brace URLs
grep -rn '}}'  src/api/ --include="*.ts"
# Expected: zero results in template literals

# 6. No unsanitized dangerouslySetInnerHTML
grep -rn 'dangerouslySetInnerHTML' src/ --include="*.tsx" | grep -v 'sanitizeHTML'
# Expected: zero results

# 7. No JSX files remain
find src -name "*.jsx"
# Expected: zero results

# 8. No "getAllEnrollments" query keys
grep -rn '"getAllEnrollments"' src/
# Expected: zero results
```

---

**End of Agent Tasks**
