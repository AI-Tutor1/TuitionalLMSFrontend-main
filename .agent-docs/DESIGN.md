# DESIGN.md — Tuitional LMS Design System

> **Format:** Stitch DESIGN.md (VoltAgent-compatible)  
> **Purpose:** AI coding agents read this file to maintain visual consistency when modifying or creating UI components.

---

## Identity

**Product:** Tuitional LMS — Learning Management System for tutoring education  
**Aesthetic:** Clean institutional blue, light editorial surfaces, card-based data density  
**Font:** League Spartan (6 weights: Thin, Light, Regular, Medium, SemiBold, Bold)  
**Primary color:** `#38b6ff` (bright sky blue)  
**Mood:** Professional, trustworthy, education-focused, data-rich

---

## Color Tokens

All colors are defined as CSS custom properties in `src/app/globals.css`.

### Primary Palette

| Token | Light Mode | Usage |
|-------|-----------|-------|
| `--main-blue-color` | `#38b6ff` | Primary buttons, active states, links, pagination |
| `--main-white-color` | `#ffffff` | Card backgrounds, input fields |
| `--black-color` | `#2d2d2d` | Primary text |
| `--text-grey` | *(defined in globals.css)* | Secondary text, labels |

### Status Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--green-color` | `rgb(40, 167, 69)` | Success states, "Conducted" badge, active status |
| `--red-color` | `rgb(255, 68, 68)` | Error states, "Cancelled" badge, destructive actions |
| `--green-background-color1` | `rgb(209, 231, 221)` | Student role badge background |
| `--green-text-color1` | `rgb(15, 81, 50)` | Student role badge text |

### Surface Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-background-color` | `#ecf8ff` | Sidebar, modal backgrounds |
| `--cards--background-color` | `#f1faff` | Card surfaces |
| `--cards-header-color` | `#afe2ff` | Card header accents |
| `--modal-background-color` | `#ecf8ff` | Modal overlays |
| `--toggle-highlight-color` | `#ecf8ff` | Active toggle background |

### Border & Shadow

| Token | Value |
|-------|-------|
| `--sidebar-border-color` | `#a0afb8` |
| `--color-dashboard-border` | `#ebebeb` |
| `--cards--boxShadow-color` | `0 0px 7px rgba(0, 0, 0, 0.1)` |

### Dark Mode

The app supports dark mode via `next-themes` with `class` attribute strategy. Dark mode overrides are defined in `globals.css` under `.dark` or `[data-theme="dark"]` selectors. When creating components, always use CSS variables — never hardcode hex values.

---

## Typography

**Font Family:** League Spartan  
**Font files:** `/public/fonts/league-spartan/`

| Weight | CSS Variable / Name | Usage |
|--------|-------------------|-------|
| Thin | `"League Spartan Thin"` | Decorative only |
| Light | `"League Spartan Light"` | Subtle labels |
| Regular | `"League Spartan Regular"` | Body text, table cells |
| Medium | `"League Spartan Medium"` | Default body, navigation |
| SemiBold | `"League Spartan SemiBold"` | Headings, card titles |
| Bold | `"League Spartan Bold"` | Page titles, emphasis |

### Text Scale

| Element | Size | Weight |
|---------|------|--------|
| Page title | 22-24px | Bold or SemiBold |
| Section heading | 18px | SemiBold |
| Card title | 16px | SemiBold |
| Body text | 14px | Regular or Medium |
| Table cell | 13-14px | Regular |
| Label / caption | 12px | Light or Regular |
| Badge text | 11-12px | Medium |

---

## Component Patterns

### Buttons

**Primary button:**
- Background: `var(--main-blue-color)` — `#38b6ff`
- Text: white
- Border radius: 8px
- Height: 40px
- Full-width in modals, `width: max-content` in action bars
- Loading state: MUI `CircularProgress` spinner replaces text

**Implementation:** `src/components/global/button/button.tsx`

### Tables

**Data table pattern:**
- Header: light blue background (`--cards-header-color` or similar)
- Rows: alternating white / off-white
- Pagination: MUI Pagination at bottom with "Showing X to Y of Z entries"
- Default: 50 rows per page (15 for Sessions)
- Row expansion: click to reveal additional actions

**Implementation:** Each module has its own table component in `src/components/ui/superAdmin/{module}/{module}-table/`

**Shared styles:** `src/styles/table-styles.module.css`

### Cards

**Data card pattern (e.g., Activities, Resources):**
- Background: `var(--cards--background-color)` — `#f1faff`
- Border radius: 12px
- Box shadow: `var(--cards--boxShadow-color)`
- Padding: 16px
- Two-column grid layout

### Modals

**Standard modal pattern:**
- Title: SemiBold, 18px
- Subtitle: Regular, 14px, grey text
- Fields: two-column layout for forms
- Submit button: full-width, primary blue
- Cancel button: outlined, light blue
- Delete confirmation: blue trash icon, centered, with "Are You Sure?" heading

**Implementation:** Each module has modal components in `src/components/ui/superAdmin/{module}/{action}-modal/`

### Badges / Pills

| Type | Background | Text Color | Example |
|------|-----------|-----------|---------|
| Student | Light green | Dark green | Role badge |
| Teacher | Light purple | Dark purple | Role badge |
| Conducted | Green | White | Session status |
| Cancelled | Red | White | Session status |
| Student Absent | Cyan | Dark cyan | Session status |
| No Show | Yellow/Orange | Dark orange | Session status |
| Teacher Absent | Purple | White | Session status |
| High priority | Red/Pink | Dark red | Enrollment priority |
| Moderate priority | Yellow | Dark yellow | Enrollment priority |
| Low priority | Green | Dark green | Enrollment priority |
| Debit | Red/Pink | Dark red | Transaction type |
| Credit | Green | Dark green | Transaction type |

### Filters

**Standard filter bar:**
- Position: top of screen, below page title
- Layout: horizontal flex wrap
- Components used: `FilterByDate`, `MultiSelectDropDown`, `SearchBox`, `FilterDropdown`
- Mobile: toggle visibility with `MobileFilterButton`
- Background: `var(--main-white-color)` on filter inputs

### Pagination

**Standard pagination:**
- Component: `src/components/global/pagination/pagination.tsx`
- Uses MUI Pagination with custom styling
- Active page: `var(--main-blue-color)` background, white text
- Shows: "Showing X to Y of Z entries"
- Dropdown for rows per page

### Loading State

- Component: `src/components/global/loading-box/loading-box.tsx`
- Uses MUI CircularProgress or custom loader

### Empty State

- Component: `src/components/global/error-box/error-box.tsx`
- Displayed when data array is empty

### Toast Notifications

- Library: `react-toastify`
- Position: top-center
- Auto-close: 2000ms
- Theme: light
- Success: green
- Error: red
- Z-index: 30000

---

## Layout System

### Protected Layout (`src/app/(protected)/layout.tsx`)

```
┌──────────────────────────────────────────────┐
│ Marquee (top notification bar)               │
├──────────┬───────────────────────────────────┤
│          │ Header (breadcrumb + actions)      │
│ Sidebar  ├───────────────────────────────────┤
│          │                                   │
│          │ Main Content Area                 │
│          │ (screens render here)             │
│          │                                   │
├──────────┴───────────────────────────────────┤
│ Background image layer (decorative)          │
└──────────────────────────────────────────────┘
```

### Screen Layout Pattern

Every screen follows this structure:
```
┌───────────────────────────────────────────┐
│ Action buttons (top right): Filter, Add,  │
│ Export, etc.                               │
├───────────────────────────────────────────┤
│ Filter bar (conditionally visible)        │
├───────────────────────────────────────────┤
│ Data area:                                │
│   Loading → LoadingBox                    │
│   Empty   → ErrorBox                      │
│   Mobile  → MobileViewCard               │
│   Desktop → DataTable                     │
├───────────────────────────────────────────┤
│ Pagination                                │
└───────────────────────────────────────────┘
```

---

## Styling Conventions

1. **CSS Modules** — every component has a co-located `.module.css` file
2. **CSS Variables** — all colors, shadows, and borders use variables from `globals.css`
3. **No inline styles** except for dynamic values (widths, flex ratios)
4. **MUI `sx` prop** — used for MUI component overrides, references CSS variables
5. **No Tailwind** — do not introduce Tailwind classes
6. **No styled-components for new code** — use CSS Modules (styled-components is a legacy dep)
7. **Responsive** — use `react-responsive` `useMediaQuery` hook with breakpoint at 1220px

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|-----------|---------|
| Component | kebab-case directory, PascalCase file | `add-modal/add-modal.tsx` |
| Screen | kebab-case | `enrollments/enrollments.tsx` |
| CSS Module | matches component name | `enrollments.module.css` |
| Service | kebab-case | `enrollments.ts` |
| API URL builder | kebab-case with `.api` suffix | `enrollment.api.ts` |
| Type file | kebab-case with `.types` suffix | `getAllEnrollments.types.ts` |
| Redux slice | kebab-case with `-slice` suffix | `user-slice.ts` |

### Component Props

- Props interfaces named `{Component}Props`
- Event handlers prefixed with `handle`: `handleDelete`, `handleAdd`
- Modal state props: `modalOpen`, `handleClose`, `heading`, `subHeading`
- Loading state: `loading` boolean prop
- Button text: `text` prop, icon: `icon` prop

### Query Keys

After BUG-012 fix, use hierarchical keys:
```typescript
["enrollments", "list", ...filterDeps]
["enrollments", "for-invoice-gen", studentId]
["sessions", "list", ...filterDeps]
["sessions", "detail", sessionId]
```

---

## Icon System

- **MUI Icons** (`@mui/icons-material`) — used for action buttons
- **Lucide React** — used for some UI icons
- **SVG files** — sidebar icons at `/public/assets/svgs/menuBarIcons/`

---

## Third-Party Component Usage

| Purpose | Library | Import Pattern |
|---------|---------|---------------|
| Date picker | RSuite DateRangePicker | `from "rsuite"` |
| Charts | Chart.js + Recharts | Module-specific |
| Phone input | react-phone-input-2 | `from "react-phone-input-2"` |
| Rich text | react-quill-new | `from "react-quill-new"` |
| Emoji picker | emoji-picker-react | `from "emoji-picker-react"` |
| Maps | react-simple-maps | `from "react-simple-maps"` |

---

**End of Design System**
