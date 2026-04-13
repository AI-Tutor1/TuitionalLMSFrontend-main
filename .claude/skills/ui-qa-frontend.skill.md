---
name: ui-qa-frontend
description: >
  Comprehensive UI quality assurance and frontend audit skill for a Next.js / React + Tailwind CSS
  website. Use this skill whenever the user asks to check, audit, review, or fix any frontend
  issues — including layout bugs, responsive design problems, mobile breakpoints, image scaling,
  navbar/menu behavior, font overflow, accessibility basics, or SEO-related HTML issues. Trigger
  this skill for phrases like "check the UI", "does this look right on mobile", "review my
  components", "fix responsive issues", "audit my page", "check SEO tags", "is my navbar broken",
  "something looks off", or any mention of frontend visual/layout problems. Also trigger when the
  user shares a component file and asks for a review — even without explicit QA language.
---

# UI QA — Frontend Audit Protocol (Next.js + Tailwind)

Full-stack frontend audit protocol for a mobile-first website.
Stack: **Next.js (App Router or Pages)**, **Tailwind CSS**.
Target browsers: **Chrome** and **Safari (incl. iOS Safari)**.

> **Scope of this skill:** Identify and fix functional, structural, and standards-compliance issues
> only. Do not suggest changes to colours, fonts, spacing scale, visual hierarchy, or any other
> design decision — those belong to the design system and are out of scope.

---

## How to Use This Skill

When the user asks for a UI check or shares code:
1. Identify the **scope** (single component, full page, whole site)
2. Run through the relevant checklist sections below
3. Report issues in the **structured output format** at the end
4. Provide code fixes inline — never just describe the problem
5. Fix only what is broken — do not alter design choices that are functioning correctly

---

## 1. Breakpoint Audit

### Tailwind Breakpoint Reference (defaults)
| Name       | Width         | Tailwind prefix |
|------------|---------------|-----------------|
| Mobile     | 320 – 480px   | (base / `xs:`)  |
| Tablet     | 768 – 1024px  | `md:` / `lg:`   |
| Desktop    | 1280px+       | `xl:` / `2xl:`  |

> Tailwind is **mobile-first**. Base styles = mobile. Larger styles stack up via prefixes.
> If the project overrides default breakpoints, defer to `tailwind.config.js`.

### Checks
- [ ] Every layout div uses mobile-first class order (e.g. `flex-col md:flex-row`)
- [ ] No fixed pixel widths without a responsive override
- [ ] Text size classes follow mobile-first order — base size is not larger than larger-breakpoint size
- [ ] No horizontal scroll on any breakpoint
- [ ] Grid columns collapse correctly at intended breakpoints
- [ ] No content is clipped, hidden, or inaccessible at 320px

**Common Tailwind pitfall to catch:**
```jsx
// ❌ Wrong — desktop-first thinking in a mobile-first system
<div className="text-2xl sm:text-base">

// ✅ Correct — base is smallest, scale up
<div className="text-base md:text-xl lg:text-2xl">
```

---

## 2. Navbar / Header Checks

- [ ] Hamburger/mobile menu renders and toggles correctly on mobile breakpoints
- [ ] Menu closes on route change
- [ ] Menu closes on outside click
- [ ] Menu items meet minimum touch target size (`min-h-[44px]`)
- [ ] Logo does not overflow or get clipped at 320px
- [ ] No z-index conflicts between navbar and page content
- [ ] Sticky/fixed header accounts for body offset so content is not hidden behind it
- [ ] No hover-only interactions on touch devices (dropdowns, submenus)
- [ ] Safari: no nav flicker caused by `-webkit-overflow-scrolling`

```jsx
// Safe mobile menu close on route change
const [isOpen, setIsOpen] = useState(false);
const pathname = usePathname();
useEffect(() => setIsOpen(false), [pathname]);
```

---

## 3. Typography & Text Overflow

QA checks only — do not alter font choices, sizes, weights, or colour.

- [ ] No text overflows its container at any breakpoint
- [ ] Long words or URLs break correctly (`break-words` / `overflow-wrap: break-word`)
- [ ] No text is clipped or truncated unintentionally (`overflow: hidden` without `text-ellipsis`)
- [ ] Heading text does not wrap in unexpected ways that break the intended layout
- [ ] Font loading uses `font-display: swap` to prevent invisible text flash (FOIT)

---

## 4. Image & Media Checks

- [ ] All images use Next.js `<Image>` component, not bare `<img>`, for automatic optimisation
- [ ] `width` and `height` props are set, OR `fill` prop is used with a positioned parent
- [ ] Hero/LCP images use the `priority` prop
- [ ] `sizes` attribute is set appropriately for responsive loading:
  ```jsx
  <Image sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
  ```
- [ ] No layout shift (CLS) from images without reserved dimensions — use an `aspect-ratio` wrapper
- [ ] SVG icons have explicit `w-` and `h-` classes so they do not collapse to 0
- [ ] Safari: parent of `fill` images has `overflow: hidden` so the image does not bleed out

```jsx
// Correct fill image wrapper — do not change aspect ratio or rounding unless broken
<div className="relative w-full aspect-video overflow-hidden">
  <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
</div>
```

---

## 5. Forms & Interactive Elements

- [ ] Input fields meet minimum touch target size (`min-h-[44px]`)
- [ ] Every `<input>` and `<textarea>` has an associated `<label>` via `htmlFor` / `id`
- [ ] Error states do not cause layout shift
- [ ] Submit button is not obscured by the on-screen keyboard on iOS
- [ ] `autocomplete` attributes are present and correct
- [ ] All interactive elements have a visible focus ring — `outline-none` must not be used without a replacement:
  ```html
  <button class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[current-brand-color]">
  ```
- [ ] Controlled inputs do not reset when the mobile keyboard opens or closes

---

## 6. Safari & iOS-Specific Checks

- [ ] `position: sticky` — fails if any ancestor has `overflow: hidden`; verify the ancestor chain
- [ ] `100vh` — unreliable on iOS due to dynamic address bar; use `100dvh` instead:
  ```css
  height: 100dvh; /* supported iOS 15.4+ */
  ```
- [ ] `-webkit-tap-highlight-color: transparent` set to remove the default blue tap flash if the project requires it
- [ ] `gap-` on flex/grid — works Safari 14+; check minimum supported iOS version
- [ ] `aspect-ratio` — works Safari 15+; if supporting older, use padding-bottom fallback
- [ ] Smooth scroll — `scroll-behavior: smooth` requires `-webkit-overflow-scrolling: touch` on iOS

---

## 7. Accessibility — Structural & Functional (Not Design)

QA checks only — do not alter colours, font sizes, or visual design to meet contrast. Flag contrast failures as issues for the design owner to resolve.

- [ ] Text contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text (WCAG AA) — **flag only, do not change colours**
- [ ] All interactive elements have a visible focus ring
- [ ] Informational images have non-empty, meaningful `alt` text
- [ ] Decorative images use `alt=""` so screen readers skip them
- [ ] State is not communicated by colour alone (error fields, required markers, etc.)
- [ ] All interactive elements are keyboard-reachable and in a logical tab order
- [ ] Semantic HTML is used correctly: `<button>` for actions, `<a>` for navigation — not `<div onClick>`
- [ ] Heading hierarchy is logical (`h1 → h2 → h3`) with no skipped levels
- [ ] One `<h1>` per page

---

## 8. SEO Frontend Checks

Structural and metadata checks only — do not rewrite copy or alter wording.

### Per-Page Metadata (Next.js App Router)
```jsx
export const metadata: Metadata = {
  title: 'Page Title | Site Name',           // 50–60 chars
  description: 'Page description...',        // 150–160 chars
  openGraph: {
    title: '...',
    description: '...',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};
```

**Checklist:**
- [ ] Every page has a unique `<title>` tag
- [ ] Every page has a unique `<meta name="description">`
- [ ] OG image present at 1200×630px
- [ ] `canonical` URL set
- [ ] Heading hierarchy is logical (see Section 7)
- [ ] `robots.txt` and `sitemap.xml` are present and up to date
- [ ] No `noindex` left on production pages
- [ ] Internal links use descriptive anchor text

### Schema Markup
If structured data is already present, verify it is valid. Do not add new schema types unless the user requests it.

---

## 9. Performance Quick Checks

- [ ] No `console.log` or debug code in production components
- [ ] Large client-only components use `dynamic()` with `{ ssr: false }`
- [ ] `useEffect` dependency arrays are correct — no missing or excess dependencies
- [ ] Images are served in next-gen formats (Next.js `<Image>` handles this automatically)
- [ ] Third-party scripts use `next/script` with an appropriate `strategy` — not blocking `<head>`
- [ ] Fonts loaded via `next/font` for automatic optimisation

---

## 10. Structured Issue Report Format

Always report findings using this format. Do not include suggestions to change design decisions.

```
## UI QA Report — [Component or Page Name]

### 🔴 Critical (breaks layout or functionality)
- [MOBILE] Navbar does not close on route change → Fix: add usePathname effect
- [ALL] Content causes horizontal scroll at 320px → Fix: add overflow-x-hidden to wrapper

### 🟡 Warning (degrades experience or standards compliance)
- [SAFARI] Full-height section uses 100vh — cut by iOS address bar → Fix: use 100dvh
- [SEO] Page missing meta description

### 🟢 Minor (best practice / standards)
- [A11Y] Button missing focus ring → Fix: add focus:ring-2 classes
- [PERF] Raster image not using Next.js <Image> component

### ✅ Passing
- Responsive grid collapses correctly at all breakpoints
- All images have meaningful alt text
```

> **Note to Claude:** When reporting issues, fix only the structural or functional problem.
> Never change colours, font choices, spacing scale, border radii, or any other visual design value.
> If a design value appears to violate an accessibility standard (e.g. contrast), flag it and
> leave the fix to the design owner.