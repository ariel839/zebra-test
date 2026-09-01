# VisibilityIQ Foresight — Guided Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a click-through, backend-free frontend prototype of the Zebra VisibilityIQ Foresight guided setup wizard covering all 36 Figma frames, deployed to Vercel for a client demo.

**Architecture:** A single Vite + React 19 SPA rendering a fixed 1920×1080 design canvas inside a scale-to-fit wrapper. One Zustand store holds the entire form plus `mode` and `status`; every "does this account have dashboards" question goes through `src/mocks/accountLookup.ts`, the only account-number branch in the app. Screens are routes; hover/focus/dropdown/tooltip "screens" are component states of shared primitives, all reachable from the running app. No network, no persistence.

**Tech Stack:** Vite 8, React 19, TypeScript 6, React Router 8 (`createBrowserRouter`), Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first `@theme`), Zustand 5, `lucide-react` 1.x. No test runner (decided — see Global Constraints).

**Spec:** `wizard-spec-files/WIZARD-SPEC.md` **v4** (screen inventory, node ids, fields, flows), verified by its author against rendered frames. Project rules: `wizard-spec-files/CLAUDE.md`. Read both before starting.

**Visual reference:** `wizard-spec-files/screens/` — a rendered PNG of all 36 frames at 1456×832, named `<row><n>_<state>__<node-id>.png`, plus `F2b_` (a zoomed crop of the modal). **This is the primary visual source, ahead of the Figma MCP.** Open the matching PNG before building a screen and compare against it before calling the screen done. Spec §10 maps prefixes to frames.

---

## Global Constraints

Every task's requirements implicitly include this section.

- **All 36 screens ship.** Spec §1 and §9 are the complete build list. Hover, tooltip and dropdown states are component states, not pages, but each must be reachable in the running app and match its frame.
- **No backend, ever, in this phase.** No `fetch`, no API client, no auth, no database, **no `localStorage`/`sessionStorage`**. State lives in memory and resets on refresh — intended. When a backend arrives it becomes one `submit()` in the store; nothing else may know a network exists.
- **All data from `src/mocks/`.** Three seeded account numbers must all work in the demo (Task 5).
- **Design canvas is exactly 1920×1080.** Build to those coordinates. **AMENDED 2026-09-01, and narrowly:** this originally read "do not invent responsive breakpoints; fit to smaller screens with the `ScaleToFit` transform wrapper only". `ScaleToFit` still does exactly that **for every viewport 1024 and wider** — i.e. every desktop and laptop — so the original constraint is intact where the Figma has frames. Only below 1024, where the Figma has no frames at all and the canvas would scale to 0.195, does the app lay out responsively. Desktop rendering was verified unchanged: all 15 captured flow screens are 0.000% differing pixels at 1024, 1190, 1440, 1920 and 2560 against the pre-responsive build, the sole exception being the intended `Edit`→`Save` copy fix. Below 1024, breakpoints are permitted for **structural** changes only (three of them, listed in the README) — never for sizes; sizes ramp, and every ramp's ceiling is the measured constant. `tools/responsive/sweep.mjs` fails if any of that drifts.
- **Nothing may key a layout change off a breakpoint wider than 1024.** Media queries measure the viewport, not the canvas: in canvas mode at a 1190px window the layout is 1920 design px wide while `2xl:` (1536) is still false. A `2xl:`-gated desktop layout therefore reflows a canvas with room to spare — this is exactly how the review screens briefly ended up stacking the logo card on a 1440 laptop. `CANVAS_MIN_WIDTH` (`ScaleToFit`) and `CANVAS_QUERY` (`lib/useMediaQuery`) must stay equal.
- **`position: fixed` is banned inside the canvas.** A CSS `transform` on an ancestor makes `fixed` resolve against the transformed element, so overlays, modals, dropdown panels and tooltips must be `position: absolute` within the canvas. This is the single most likely source of "why is the modal in the wrong place". **Still in force**, even though responsive mode has no transform and would technically permit `fixed`: the canvas root stays `position: absolute` and keeps its `data-canvas-root` marker in *both* modes, so every overlay has exactly one code path and cannot be right in one mode and broken in the other.
- **Icons: `lucide-react` only.** Never export an icon SVG from Figma.
- **Never hardcode a hex that exists as a token.** Colors come from `src/styles/tokens.css` (Task 2).
- **Copy typos are reproduced verbatim.** The Figma really contains `confgure`, `notifed`, `identifer`, `data fow`, `service ofer`, `refect`, `Select compony name...`, `Euro Car Parts Irland`. Do not silently correct client copy. Collect them in `docs/copy-bugs.md` to hand back (Task 17).
- **All user-facing strings live in `src/content/`,** never inline in JSX, so the client can review one folder.
- **One component per file. No barrel files.** Co-locate a component's types with it.
- **No new dependencies** beyond those named in Task 1. Specifically banned: a second state library, a form library (unless the tree-select genuinely forces it — ask first), an unagreed component library, an animation library, i18n, analytics.
- **No test runner.** Decided by the user. Verification is a scripted manual check per task plus a side-by-side against the Figma frame. Every task's final verification step is mandatory and must actually be run — do not mark a task done on inspection alone.
- **Never mark a screen done without a side-by-side against its PNG in `wizard-spec-files/screens/`.** Each task names the exact files.
- **Every screen must be reachable from the guided flow.** Task 17 builds the registry centrally and walks all 31 built screens; individual tasks do not register their own. A screen that exists but Task 17 cannot reach is not done.
- **Ask before deviating from the Figma.** "It looked better this way" is not a reason.
- **Commit after every task.** Conventional-commit prefixes (`chore:`, `feat:`, `fix:`, `docs:`).

### Known spec conflict to resolve in Task 2

Spec §1's Overview copy table reads as a *cleaned* transcription (e.g. "once the data flow is validated"), while §7's typo list says the Figma actually reads "data fow". **§7 is the authority on typos.** Task 2 verifies each string against the Figma frame and locks the verbatim text; §1 is a paraphrase until then.

### Figma access status (read this before Task 2)

At planning time both Figma paths were dead:
- Figma MCP (`mcp__claude_ai_Figma__*`) → `tool call limit for your View seat on the Professional plan`. Account-level quota; having the file open in a browser does not lift it.
- `figma-rest` MCP → `Figma 403 (token lacks access or expired)`. Its Personal Access Token needs regenerating.

Task 2 is written to work either way. Restoring the `figma-rest` PAT is the cheapest unblock and gives unlimited structured reads.

### Resolved open items (spec §7, v4 numbering)

| # | Spec question | Resolution |
|---|---|---|
| 1 | Which account numbers trigger what | `189189189` → no match (happy flow, matches the Figma filled state); `333333333` → three dashboards (Row F); `111111111` → one direct OneCare dashboard (Row G). Printed on a demo card (Task 17). |
| 2 | Which review layout ships | **`R3` only** (`10680:16436` — logo card left, compact rows right). User decision, given directly. **Consequence, accepted:** `E1`/`R1` (boxed cards), `R2` (dividers) and `R4` (logo top-left) are the same screen in three other arrangements, so they are **not built** — they become design alternates. The build is therefore 32 of the 36 frames plus the `E4` dev-notes sticky, which was never a UI screen. This is the one place the "all 36 ship" rule is deliberately relaxed, on the user's instruction, and it is called out in Task 17's handover. |
| 3 | Sisense component library | **No installable package exists.** npm ships only `@sisense/sdk-*` (Compose SDK — analytics embedding, no form controls). Verified at planning time. Build local `src/components/ui/*` with boring, conventional props (`value`, `onChange`, `disabled`, `placeholder`). |
| 10 | `Back` on the Overview | Rendered but disabled, per spec §5 (`Back disabled`). |
| — | Responsive | Fixed 1920×1080 + uniform scale-to-fit. Spec §8's "responsive down to 1280" is satisfied by scaling, not by reflow. |
| — | Testing | No test runner. Manual verification steps per task. |
| — | Company names, and the 6th table column | **Closed by v4.** Companies are `Albert Heijn` / `Albert CZ` / `Ahold Delhaize`; the 6th column is a **hover-only action button** at the row's right edge. See Task 15. |

### Still open — do not guess, escalate

None of these blocks a task; each has a stated default. Raise all five with the client in Task 17.

| # | Question | Default taken | Affects |
|---|---|---|---|
| 4 | Real design-variable values — the Figma MCP is capped on a View seat and Dev Mode is unavailable to it | Sample colours off `screens/` and accept the drift, per spec §7.4 | Task 2 |
| 5 | Copy typos | Reproduce verbatim | Tasks 4, 12, 17 |
| 6 | Edit mode's primary button reads `Edit`, not `Save` — almost certainly a designer slip | Reproduce as `Edit` verbatim; flag it | Task 16 |
| 7 | Email casing: `Useremail@gmail.com` in the form frames vs `Useremail@Gmail.Com` in `R3` | **Non-issue in a live app** — review renders whatever the user typed, verbatim, so the two frames simply show two different typings. Do not normalise casing anywhere. Note it to the client as a frame inconsistency only. | Task 16 |
| 8 | Success overlay has no dismiss control | Auto-advance is already implied by spec §5; leave it with no dismiss, matching the frame | Task 13 |
| 9 | Sidebar items 2–7: disabled styling or full contrast? | Full contrast, as drawn | Task 3 |
| — | **`R3` has no edit affordance.** Its footer is `Done` alone — no `Edit` button, no per-row pencil — yet the dev note on `9082:6667` says "editing will be possible through edit button" and edit mode (`E2`, `E3`) exists and must be reachable | Add an `Edit` control to the left of `Done`, styled like `E1`'s `Edit ✏️`. Without it, edit mode is unreachable and three screens become dead. Flag to the designer as the one deliberate addition to `R3` | Task 16 |
| — | Five of the seven field tooltips appear in no frame | Reuse the Overview explainer copy for those five; the two captured in spec §3 are used verbatim | Task 6 |

---

## File Structure

```
zebra-viq-wizard/
├── vercel.json                       SPA rewrite so deep links survive refresh
├── vite.config.ts                    + @tailwindcss/vite, @ alias
├── docs/
│   ├── figma-capture.md              Task 2 output: verbatim copy + unreadable-node findings
│   ├── copy-bugs.md                  typo list to hand the client
│   └── demo-card.md                  the three account numbers, for the demo driver
└── src/
    ├── main.tsx                      mounts RouterProvider
    ├── router.tsx                    createBrowserRouter route table
    ├── styles/
    │   ├── tokens.css                @theme block — generated from Figma variables
    │   └── index.css                 @import tailwindcss + tokens, base resets
    ├── lib/
    │   └── cn.ts                     className joiner (no clsx dependency)
    ├── types/
    │   └── dashboard.ts              Dashboard, LookupResult
    ├── content/                      ALL user-facing copy
    │   ├── nav.ts                    sidebar labels
    │   ├── overview.ts               Row A page copy + field explainers
    │   ├── dashboardSettings.ts      labels, placeholders, tooltips, buttons
    │   ├── existingDashboards.ts     modal copy + table headers
    │   ├── review.ts                 review-mode labels
    │   └── overlays.ts               loading + success copy
    ├── mocks/
    │   ├── companyTree.ts            ~40-leaf tree, country per node
    │   ├── contractTypes.ts          contract-type options
    │   ├── companyNames.ts           Company Name select options
    │   └── accountLookup.ts          THE ONLY account-number branch
    ├── store/
    │   └── wizard.ts                 single Zustand store
    ├── components/ui/
    │   ├── Button.tsx  IconButton.tsx  Input.tsx  InputWithHeader.tsx
    │   ├── FieldLabel.tsx  Tooltip.tsx  Checkbox.tsx  RadioGroup.tsx
    │   ├── Select.tsx  MultiSelect.tsx
    │   ├── Chip.tsx  ChipGroup.tsx  Tag.tsx
    │   ├── UploadButton.tsx  Modal.tsx  DataTable.tsx  IconButton.tsx
    │   └── TreeSelect/
    │       ├── types.ts              CompanyNode, TreeSelectProps
    │       ├── treeSelection.ts      PURE selection math — the risky logic
    │       ├── treeSearch.ts         PURE search + country filtering
    │       ├── TreeSelect.tsx        trigger + chips
    │       ├── TreeSelectPanel.tsx   search bar, Select All, node list
    │       ├── TreeNodeRow.tsx       one row, recursive
    │       └── FilterPanel.tsx       Row C filter properties panel
    ├── components/wizard/
    │   ├── ScaleToFit.tsx            1920×1080 canvas → viewport transform
    │   ├── WizardShell.tsx           top strip + sidebar + content + bottom strip
    │   ├── WizardTopStrip.tsx  SideNav.tsx  WizardBottomStrip.tsx
    │   ├── LoadingOverlay.tsx  SuccessOverlay.tsx
    │   ├── ExistingDashboardsModal.tsx   ONE component, data-driven (F and G)
    │   ├── ReviewRow.tsx  ReviewLogoPanel.tsx
    │   └── FlowBar.tsx                    guided-flow chrome (Task 17)
    ├── flow/
    │   ├── screens.ts                registry of all 31 built screens (Task 17)
    │   └── demoState.ts              additive hover/open overrides for the flow
    └── routes/
        ├── Flow.tsx                  /flow and /flow/:screenId
        ├── Overview.tsx              Row A
        ├── DashboardSettings.tsx     /setup — picks form vs review off ?mode
        ├── DashboardSettingsForm.tsx Rows B, C, D, F, G
        ├── DashboardSettingsReview.tsx Row E + standalone review column
        └── TreeSelectSandbox.tsx     /sandbox/tree-select — build §4 in isolation
```

**Decomposition rationale.** `TreeSelect` is split into pure logic (`treeSelection.ts`, `treeSearch.ts`) and rendering because the selection/indeterminate math is the only genuinely error-prone code in the build and, with no test runner, it must at least be isolated enough to eyeball and exercise from the sandbox route. `content/` is split by screen so the client gets reviewable chunks. `ExistingDashboardsModal` is one file on purpose — spec forbids forking it into three-result and one-result variants.

---

## Task 1: Toolchain — git, dependencies, Tailwind v4, Vercel config

The repo today is an untouched Vite React-TS scaffold with no git history and none of the stack installed.

**Files:**
- Create: `.git/` (via `git init`), `vercel.json`, `src/lib/cn.ts`, `src/styles/index.css`
- Modify: `package.json`, `vite.config.ts`, `tsconfig.app.json`, `index.html`, `src/main.tsx`
- Delete: `src/App.tsx`, `src/App.css`, `src/index.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `README.md` scaffold text

**Interfaces:**
- Consumes: nothing.
- Produces: `cn(...classes: (string | false | null | undefined)[]): string`; a dev server on `npm run dev`; `@/` resolving to `src/`.

- [ ] **Step 1: Initialise git and make a baseline commit**

```bash
cd /Users/ariellunenfeld/zebra-viq-wizard
git init
printf 'node_modules\ndist\n.vercel\n.DS_Store\n' >> .gitignore
git add -A && git commit -m "chore: baseline Vite React TS scaffold"
```

- [ ] **Step 2: Install runtime and build dependencies**

Versions verified on npm at planning time. `react-router` v8 is the current package — `react-router-dom` is the legacy v7 name; import from `react-router`.

```bash
npm install react-router@^8 zustand@^5 lucide-react@^1
npm install -D tailwindcss@^4 @tailwindcss/vite@^4
```

- [ ] **Step 3: Wire Tailwind v4 and the `@/` alias into Vite**

Tailwind v4 has no `tailwind.config.js` — configuration is CSS-first. Do not create one.

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
```

Add to `tsconfig.app.json` under `compilerOptions` so editors and `tsc -b` agree with Vite:

```json
"paths": { "@/*": ["./src/*"] }
```

**No `baseUrl`.** TypeScript 6 deprecates it (TS5101) and 7 removes it; `paths` has resolved relative to the tsconfig file since TS 5.0. Adding `baseUrl` forces an `ignoreDeprecations` suppression that would have to be undone later — do not add either.

- [ ] **Step 4: Replace the scaffold entry files**

```bash
rm -f src/App.tsx src/App.css src/index.css src/assets/react.svg src/assets/vite.svg src/assets/hero.png
```

```ts
// src/lib/cn.ts
/** Joins class names, dropping falsy values. Avoids a clsx dependency. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
```

```css
/* src/styles/index.css */
@import "tailwindcss";
@import "./tokens.css";

html, body, #root {
  height: 100%;
  margin: 0;
  background: #000;
}
```

`background: #000` is the letterbox behind the scaled canvas; Task 3 may change it once the real Figma backdrop is known.

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="p-8 text-white">toolchain ok</div>
  </StrictMode>,
)
```

Create a placeholder `src/styles/tokens.css` so the import resolves — Task 2 fills it:

```css
/* src/styles/tokens.css — GENERATED FROM FIGMA VARIABLES IN TASK 2. Do not hand-edit. */
@theme {
  /* placeholder */
}
```

Set the document title in `index.html`: `<title>VisibilityIQ Foresight — Guided Setup</title>`.

- [ ] **Step 5: Add the Vercel SPA rewrite**

Without this, a client opening a shared `/setup` link gets a 404 — per CLAUDE.md the one failure mode that matters.

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 6: Verify the toolchain**

```bash
npm run dev
```
Expected: server starts with no errors; `http://localhost:5173` shows white "toolchain ok" on black — proving Tailwind's utility classes and the CSS pipeline are live. Then:

```bash
npm run build
```
Expected: `tsc -b` passes and `dist/` is produced with no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: add react-router, zustand, lucide, tailwind v4 and vercel rewrite"
```

---

## Task 2: Design tokens (resolves spec §7.4)

Nothing visual may be built before this lands — every later task cites token names from here.

**v4 closed most of what this task used to carry.** The company names, the mystery 6th column, the filter-panel anatomy and the success-overlay contents are all now documented in the spec from rendered frames. What remains is colour values.

**Files:**
- Create: `docs/figma-capture.md`
- Modify: `src/styles/tokens.css`

**Interfaces:**
- Consumes: Task 1's `tokens.css` placeholder.
- Produces: Tailwind utility classes `bg-viq-*`, `text-viq-*`, `border-viq-*`, `rounded-viq-*` for every design colour and radius. Every later task cites these names.

- [ ] **Step 1: Get colour values — try the accurate path, then fall back**

Spec §7.4 explicitly permits the fallback, so this task cannot block the build.

1. **Figma variables** (accurate). The MCP is capped on a View seat and Dev Mode is unavailable to it, so this needs either an upgraded seat or someone with a Dev seat exporting the variable collection for page `7606:10539`. Try `mcp__claude_ai_Figma__get_variable_defs` once; if it returns the seat-quota error, do not retry — go to 2.
2. **Sample off `screens/`** (accepted fallback). Eyedrop each colour from the PNGs and record which file and roughly which element each value came from. Accept the drift; note in `docs/figma-capture.md` that these are sampled, not authoritative, so a later swap to real variables is a one-file change.

Do **not** use the spec's by-eye guesses (`#84cc16`-ish, `#4f6ef7`-ish) as shipped values — they are sanity checks for whichever path you took.

- [ ] **Step 2: Write `tokens.css`**

Tailwind v4 `@theme` entries. These names are referenced verbatim by later tasks; all must exist when this task ends.

```css
/* src/styles/tokens.css
   Source: <figma variables | sampled from wizard-spec-files/screens/>
   File XseXmXBMoevLAxK3x2VHgY, page Dashboard settings_self onboarding (7606:10539).
   Do not hand-edit in components; change it here. */
@theme {
  --color-viq-brand-green:       ...;  /* top strip wordmark, A1 */
  --color-viq-strip-dark:        ...;  /* top strip fill, near-black green, A1 */
  --color-viq-primary:           ...;  /* primary button, focus ring, badge — the Done/Submit blue */
  --color-viq-primary-hover:     ...;  /* B08 primary hover, darker */
  --color-viq-nav-active:        ...;  /* sidebar active fill, light blue-grey, A1 */
  --color-viq-text:              ...;  /* body and label text */
  --color-viq-text-muted:        ...;  /* review-row labels, secondary copy */
  --color-viq-text-placeholder:  ...;  /* input placeholder */
  --color-viq-border:            ...;  /* control borders, table rules, card borders */
  --color-viq-border-hover:      ...;  /* B03 control border on hover */
  --color-viq-border-focus:      ...;  /* B04 focus border + the blue chip-hover border */
  --color-viq-surface-hover:     ...;  /* row / option / ghost-button hover fill, F3–F6 */
  --color-viq-surface-disabled:  ...;  /* disabled input fill */
  --color-viq-surface-search:    ...;  /* grey fill behind the tree-select search bar, B06 */
  --color-viq-scrim:             ...;  /* the washed-out white page scrim behind the modal, F2 */
  --color-viq-logo-scrim:        ...;  /* grey scrim over the logo card on hover, B08 */
  --color-viq-icon-muted:        ...;  /* info, chevron, search, download, funnel icons */
  --color-viq-danger:            ...;  /* required-field asterisk */
  --color-viq-badge:             ...;  /* dark count badge on the funnel icon, C5 */
  --color-viq-tag-upgrade:       ...;  /* Tag outline, green — F2b */
  --color-viq-tag-none:          ...;  /* Tag outline, grey — F2b */
  --color-viq-tag-add-licenses:  ...;  /* Tag outline, amber — F2b */

  --radius-viq-control:          ...;  /* input / button / chip radius */
  --radius-viq-modal:            8px;  /* spec §1 Row F: modal radius ~8 */
}
```

Add every other value the collection or your sampling produced. If a colour has no Figma variable, still put it here under a `/* not a variable — sampled */` comment, so components have exactly one colour surface.

- [ ] **Step 3: Record the escalation list**

Write `docs/figma-capture.md` with (a) which colour path you used and, if sampled, the file each value came from; (b) the five open questions from Global Constraints — success-overlay dismiss (§7.8), `Edit` vs `Save` in edit mode (§7.6), email casing (§7.7), sidebar contrast (§7.9), and `R3`'s missing edit control. Surface them to the user at the end of this task; do not block on them.

- [ ] **Step 4: Verify**

```bash
npm run build
```
Expected: clean. Then `npm run dev`, and in DevTools confirm `--color-viq-*` custom properties resolve on `:root` and that a scratch element with `class="bg-viq-primary"` paints the right blue against `screens/R3_review-logo-left__10680-16436.png` (its `Done` button is the clearest sample of that colour). Remove the scratch element.

Confirm `tokens.css` contains no `...` placeholders.

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css docs/figma-capture.md
git commit -m "feat: design tokens from figma variables / screens sampling"
```

---

## Task 3: Layout shell — scale-to-fit canvas, top strip, sidebar, bottom strip, routing

Produces the frame every one of the 36 screens sits inside (spec §2).

**Files:**
- Create: `src/components/wizard/ScaleToFit.tsx`, `src/components/wizard/WizardTopStrip.tsx`, `src/components/wizard/SideNav.tsx`, `src/components/wizard/WizardBottomStrip.tsx`, `src/components/wizard/WizardShell.tsx`, `src/content/nav.ts`, `src/components/ui/Button.tsx`, `src/router.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `cn` (Task 1), `viq-*` tokens (Task 2).
- Produces:
  - `<ScaleToFit>{children}</ScaleToFit>` — renders a 1920×1080 canvas scaled uniformly into the viewport.
  - `<WizardShell title, subtitle?, footer, children>` where `footer: React.ReactNode`.
  - `<Button variant="primary" | "outline" | "ghost" size="md" disabled onClick leftIcon rightIcon>`.
  - `NAV_ITEMS: { id: string; label: string }[]` from `src/content/nav.ts`.
  - Routes `/`, `/setup`, `/sandbox/tree-select`.

- [ ] **Step 1: Build the scale-to-fit canvas**

This is what makes a 1920 design usable on the client's laptop. It scales uniformly — it never reflows.

```tsx
// src/components/wizard/ScaleToFit.tsx
import { useEffect, useState, type ReactNode } from 'react'

export const DESIGN_WIDTH = 1920
export const DESIGN_HEIGHT = 1080

/**
 * Renders children on a fixed 1920x1080 canvas, uniformly scaled to fit the
 * viewport and centred. The design is fixed-width by decision; this is the only
 * concession to smaller screens.
 *
 * WARNING: the CSS transform here makes `position: fixed` descendants resolve
 * against this element, not the viewport. Everything inside must use
 * `position: absolute`. See Global Constraints.
 */
export function ScaleToFit({ children }: { children: ReactNode }) {
  // NOTE: `grid place-items-center` does NOT work here. A CSS transform does not
  // affect layout, so once the 1920x1080 child overflows a smaller container the
  // grid track anchors it top-left and the canvas clips to the bottom-right corner.
  // Absolute + translate(-50%,-50%) is immune to that. Verified at 800x600 and 1024x768.
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () =>
      setScale(
        Math.min(
          window.innerWidth / DESIGN_WIDTH,
          window.innerHeight / DESIGN_HEIGHT,
        ),
      )
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
        className="bg-white"
      >
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build the Button primitive**

Boring, conventional props so a real Sisense library can be swapped in later (resolved §7.3).

```tsx
// src/components/ui/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'outline' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-viq-control',
        'px-4 h-10 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'primary' &&
          'bg-viq-primary text-white hover:bg-viq-primary-hover',
        variant === 'outline' &&
          'border border-viq-border text-viq-text hover:bg-viq-surface-hover',
        variant === 'ghost' && 'text-viq-text hover:bg-viq-surface-hover',
        className,
      )}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  )
}
```

All four tokens used here are on Task 2's required list. If any is missing, go back and add it to `tokens.css` from the Figma hover states — never substitute a Tailwind default.

- [ ] **Step 3: Build the top strip**

Spec §2: `h=48`, dark green fill, "VisibilityIQ Foresight" in brand green + " Guided Setup" in white, X close at right.

```tsx
// src/components/wizard/WizardTopStrip.tsx
import { X } from 'lucide-react'

export function WizardTopStrip() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between bg-viq-strip-dark px-6">
      <span className="text-sm font-semibold">
        <span className="text-viq-brand-green">VisibilityIQ Foresight</span>
        <span className="text-white"> Guided Setup</span>
      </span>
      <button type="button" aria-label="Close setup" className="text-white/80 hover:text-white">
        <X size={20} />
      </button>
    </header>
  )
}
```

The X is inert in this prototype (there is nowhere to close to). Leave it non-functional rather than wiring a route.

- [ ] **Step 4: Build the sidebar**

Order is fixed (spec §2). Only *Dashboard Settings* is implemented; the rest are visible-but-inert. Match the contrast recorded in `docs/figma-capture.md` Step 3.4 — the Figma draws them at full contrast, so **do not** apply disabled styling unless the capture says otherwise.

```ts
// src/content/nav.ts
export const NAV_ITEMS = [
  { id: 'dashboard-settings', label: 'Dashboard Settings' },
  { id: 'user-creation', label: 'User Creation' },
  { id: 'zds-configuration', label: 'ZDS Configuration' },
  { id: 'device-enrollment', label: 'Device Enrollment' },
  { id: 'site-management', label: 'Site Management' },
  { id: 'device-group-management', label: 'Device Group Management' },
  { id: 'api-setup', label: 'API Setup' },
] as const
```

```tsx
// src/components/wizard/SideNav.tsx
import { NAV_ITEMS } from '@/content/nav'
import { cn } from '@/lib/cn'

export function SideNav({ activeId }: { activeId: string }) {
  return (
    <nav className="w-[232px] shrink-0 border-r border-viq-border">
      <div className="mx-2 mt-6 flex w-[215px] flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={item.id === activeId ? 'page' : undefined}
            className={cn(
              'h-10 rounded-viq-control px-3 text-left text-sm',
              item.id === activeId && 'bg-viq-nav-active font-medium',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 5: Build the bottom strip and the shell**

Spec §2: bottom strip `h=98`, buttons right-aligned. The shell takes the footer as a node so each screen supplies its own button pair (`Back`+`Next` on Overview, `Back`+`Submit` on the form, `Cancel`+`Save` in edit mode).

```tsx
// src/components/wizard/WizardBottomStrip.tsx
import type { ReactNode } from 'react'

export function WizardBottomStrip({ children }: { children: ReactNode }) {
  return (
    <footer className="flex h-[98px] shrink-0 items-center justify-end gap-3 border-t border-viq-border px-14">
      {children}
    </footer>
  )
}
```

```tsx
// src/components/wizard/WizardShell.tsx
import type { ReactNode } from 'react'
import { SideNav } from './SideNav'
import { WizardBottomStrip } from './WizardBottomStrip'
import { WizardTopStrip } from './WizardTopStrip'

export interface WizardShellProps {
  title: string
  subtitle?: string
  footer: ReactNode
  children: ReactNode
  activeNavId?: string
}

export function WizardShell({
  title,
  subtitle,
  footer,
  children,
  activeNavId = 'dashboard-settings',
}: WizardShellProps) {
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <WizardTopStrip />
      <div className="flex min-h-0 flex-1">
        <SideNav activeId={activeNavId} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="h-[97px] shrink-0 px-14 pt-8">
              <h1 className="text-[33px] leading-none font-semibold text-viq-text">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-viq-text-muted">{subtitle}</p>}
            </div>
            <div className="min-h-0 flex-1 overflow-visible">{children}</div>
          </div>
          <WizardBottomStrip>{footer}</WizardBottomStrip>
        </div>
      </div>
    </div>
  )
}
```

Note `overflow-visible` on the content area: dropdown panels and tooltips must be able to escape it. If a later task needs clipping, add it locally, not here.

- [ ] **Step 6: Wire the router**

Placeholder route bodies — Tasks 4, 12 and 16 fill them.

```tsx
// src/router.tsx
import { createBrowserRouter } from 'react-router'
import { DashboardSettings } from '@/routes/DashboardSettings'
import { Overview } from '@/routes/Overview'
import { TreeSelectSandbox } from '@/routes/TreeSelectSandbox'

export const router = createBrowserRouter([
  { path: '/', element: <Overview /> },
  { path: '/setup', element: <DashboardSettings /> },
  { path: '/sandbox/tree-select', element: <TreeSelectSandbox /> },
])
```

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { ScaleToFit } from '@/components/wizard/ScaleToFit'
import { router } from '@/router'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScaleToFit>
      <RouterProvider router={router} />
    </ScaleToFit>
  </StrictMode>,
)
```

Create the three route files as minimal shells returning `<WizardShell title="Dashboard Settings" footer={null}>…</WizardShell>` so the app compiles.

- [ ] **Step 7: Verify against Figma node `8474:11927`**

```bash
npm run dev
```
Check all of the following at `http://localhost:5173/`:
1. The whole 1920×1080 canvas is visible with no horizontal scrollbar, letterboxed on black.
2. Resize the browser narrower and shorter — the canvas scales uniformly, nothing reflows, no scrollbar ever appears.
3. Top strip is 48px tall in design units, wordmark two-tone, X at the right.
4. Sidebar is 232px with seven items in the spec §2 order, `Dashboard Settings` carrying the active fill.
5. Bottom strip is 98px with right-aligned content.
6. Side-by-side against Figma `8474:11927` at the same zoom — strip heights, sidebar width and title position match.
7. Browser console is clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wizard layout shell with 1920x1080 scale-to-fit canvas and routing"
```

---

## Task 4: Row A — Overview screen (1 screen: `8474:11927`)

First complete screen, end to end. Stop here and compare before moving on (CLAUDE.md working style).

**Files:**
- Create: `src/content/overview.ts`
- Modify: `src/routes/Overview.tsx`

**Interfaces:**
- Consumes: `WizardShell`, `Button` (Task 3); verbatim copy from `docs/figma-capture.md` (Task 2).
- Produces: `OVERVIEW_COPY: { title, intro, fields: OverviewField[] }` where `OverviewField = { id: string; label: string; icon: LucideIcon; body: string }`.

- [ ] **Step 1: Write the copy module with the typos intact**

Take every string from `docs/figma-capture.md` §3, **not** from the spec's §1 table, which is a cleaned paraphrase. The strings below carry the §7 typos applied to the spec's paraphrase — replace each one with your verified transcription and delete this note once done.

```ts
// src/content/overview.ts
import {
  CircleUser, Factory, GraduationCap, Hash, Handshake, Image, Mail,
  type LucideIcon,
} from 'lucide-react'

export interface OverviewField {
  id: string
  label: string
  icon: LucideIcon
  body: string
}

export const OVERVIEW_COPY = {
  title: 'Dashboard Settings',
  // TYPO 'confgure' is from the Figma — spec §7. Verify exact sentence in capture doc.
  intro: '<verbatim intro paragraph from 8474:11927>',
  fields: [
    {
      id: 'account-number',
      label: 'Account Number',
      icon: Hash,
      // TYPO: 'notifed'
      body:
        "The end customer's Siebel account number, as stated in their VisibilityIQ contract. " +
        'Enter this number manually to initiate the dashboard setup. If an existing dashboard is ' +
        'found for this account or a related account under the same Standard Name, you will be ' +
        'notifed. In such cases, consider using the existing dashboard instead of creating a new one',
    },
    {
      id: 'user-email',
      label: 'User Email',
      icon: Mail,
      // TYPO: 'data fow'
      body:
        'The email address of the primary customer contact who will receive the initial welcome ' +
        'letter and dashboard access once the data fow is validated. Make sure the email domain ' +
        'name matches the company name before adding a user.',
    },
    {
      id: 'company-name',
      label: 'Company Name',
      icon: Factory,
      // TYPO: 'identifer'
      body:
        "This is the dashboard's core identifer within the VIQ system and cannot be changed once " +
        'set. Upon entering the Siebel account ID, you can choose from the Account Name, ' +
        'Subsidiary Standard Name (if available), or the global Standard Name.',
    },
    {
      id: 'learning-series',
      label: 'Sign Up For Learning Series',
      icon: GraduationCap,
      body:
        'Check this box to subscribe the customer user to the VIQ learning series. This provides ' +
        'them with training videos to enhance their understanding and utilization of the ' +
        'VisibilityIQ product.',
    },
    {
      id: 'display-name',
      label: 'Display Name',
      icon: CircleUser,
      body:
        'This name will be visible to users on their dashboard when they log in. While it defaults ' +
        'to the chosen Company Name, you can customize it for rebranding or other preferences. ' +
        'This setting can be updated at any time.',
    },
    {
      id: 'company-logo',
      label: 'Company Logo',
      icon: Image,
      // TYPO: 'refect'
      body:
        "Use this button to upload your company's logo, which will be prominently displayed on the " +
        'dashboard when customers log in. It can be updated at any time to refect branding changes ' +
        'or preferences',
    },
    {
      id: 'contract-type',
      label: 'Contract Type',
      icon: Handshake,
      // TYPO: 'service ofer'
      body:
        "This field determines the dashboard's data source, as well as the automatically generated " +
        'roles and user groups. It is pre-populated based on the purchased service ofer ' +
        '(represented by service SKU), but can be updated manually if needed.',
    },
  ] satisfies OverviewField[],
}
```

`Image` collides with the DOM `Image` global. Import it as shown and never call `new Image()` in this file.

- [ ] **Step 2: Build the Overview route**

Spec §1 Row A: title, intro paragraph, then a 2-column grid of 7 field explainers each with its Lucide icon. Footer is `Back` (ghost, ← icon, **disabled** — resolved §7.8) + `Next` (primary, → icon) routing to `/setup`.

```tsx
// src/routes/Overview.tsx
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { WizardShell } from '@/components/wizard/WizardShell'
import { OVERVIEW_COPY } from '@/content/overview'

export function Overview() {
  const navigate = useNavigate()

  return (
    <WizardShell
      title={OVERVIEW_COPY.title}
      footer={
        <>
          <Button variant="ghost" disabled leftIcon={<ArrowLeft size={16} />}>
            Back
          </Button>
          <Button
            variant="primary"
            rightIcon={<ArrowRight size={16} />}
            onClick={() => navigate('/setup')}
          >
            Next
          </Button>
        </>
      }
    >
      <div className="px-14">
        <p className="max-w-[1100px] text-sm leading-relaxed text-viq-text-muted">
          {OVERVIEW_COPY.intro}
        </p>
        <div className="mt-10 grid grid-cols-2 gap-x-16 gap-y-8">
          {OVERVIEW_COPY.fields.map(({ id, label, icon: Icon, body }) => (
            <div key={id} className="flex gap-3">
              <Icon size={20} className="mt-0.5 shrink-0 text-viq-text" />
              <div>
                <h2 className="text-sm font-semibold text-viq-text">{label}</h2>
                <p className="mt-1 text-sm leading-relaxed text-viq-text-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WizardShell>
  )
}
```

Grid gaps and the intro's max-width are starting values — correct them against the frame in Step 3, do not leave them as written if they disagree.

- [ ] **Step 3: Verify against Figma node `8474:11927`**

`npm run dev`, open `/`, then check:
1. Side-by-side with the Figma frame at matched zoom: two columns, seven explainers in spec order (Account Number, User Email, Company Name, Sign Up For Learning Series, Display Name, Company Logo, Contract Type — note the Figma's reading order runs down the left column then the right; confirm which and match it).
2. Each of the seven icons is the correct Lucide glyph.
3. **Typo check** — search the rendered page for `notifed`, `data fow`, `identifer`, `refect`, `service ofer`. All five must be present. If any is absent, the copy was silently corrected; fix it.
4. `Back` renders disabled; `Next` navigates to `/setup` and the shell persists.
5. Console clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: overview screen (row A) with verbatim figma copy"
```

---

## Task 5: Domain types, mocks, and the Zustand store

All state and all data. No UI. Doing this before the form means every later screen reads from one place.

**Files:**
- Create: `src/types/dashboard.ts`, `src/mocks/companyNames.ts`, `src/mocks/contractTypes.ts`, `src/mocks/companyTree.ts`, `src/mocks/accountLookup.ts`, `src/store/wizard.ts`
- Modify: none

**Interfaces:**
- Consumes: nothing.
- Produces — later tasks depend on these exact names:
  - `Dashboard`, `LookupResult`, `SupportedAction` (`src/types/dashboard.ts`)
  - `accountLookup(accountNumber: string): LookupResult`
  - `COMPANY_TREE: CompanyNode[]`, `CompanyNode` (`src/components/ui/TreeSelect/types.ts`)
  - `useWizardStore` with the state shape below, plus the selector `selectIsFormValid(state): boolean`.

- [ ] **Step 1: Define the domain types**

The F and G modals carry **different titles and bodies** (spec §1 Row G), so the lookup returns copy alongside rows — that keeps `ExistingDashboardsModal` a single unforked component taking `{title, body, rows}`.

```ts
// src/types/dashboard.ts
export type SupportedAction = 'Upgrade' | 'None' | 'Add Licenses'

export interface Dashboard {
  id: string
  company: string
  partner: string
  supportedAction: SupportedAction
  region: string
  contractType: string
}

export interface ExistingDashboardsCopy {
  title: string
  body: string
}

export interface LookupResult {
  existing: Dashboard[]
  /** Modal copy for this match. Null when there is nothing to show. */
  copy: ExistingDashboardsCopy | null
}
```

There is no `description` field. v4 established the 6th table cell is a **hover-only action button** derived from `supportedAction`, not data — see Task 15.

- [ ] **Step 2: Write the tree node type and the company tree fixture**

Spec §4 requires the panel's visible top to match Figma `10489:78221` exactly, *and* enough leaves that a `+30` overflow chip is reachable. Satisfy both: the Figma-visible nodes come first, additional L1 siblings follow below the fold.

```ts
// src/components/ui/TreeSelect/types.ts
export interface CompanyNode {
  id: string
  label: string
  /** Drives the Row C country filter. Every node carries one, including branches. */
  country: string
  children?: CompanyNode[]
}
```

```ts
// src/mocks/companyTree.ts
import type { CompanyNode } from '@/components/ui/TreeSelect/types'

/**
 * Nodes 1..3 of the first branch reproduce Figma 10489:78221 exactly — the panel's
 * visible top must match the frame. Everything after `lkq` exists so the tree has
 * ~40 leaves, which is what makes the `+30` overflow chip in the review screens
 * reachable, and gives the country filter something to bite on.
 *
 * 'Euro Car Parts Irland' is a typo in the Figma. Reproduce it. See spec §7.5.
 */
export const COMPANY_TREE: CompanyNode[] = [
  {
    id: 'lkq',
    label: 'LKQ Corporation',
    country: 'United States',
    children: [
      {
        id: 'lkq.ecp',
        label: 'Euro Car Parts',
        country: 'United Kingdom',
        children: [
          { id: 'lkq.ecp.ltd', label: 'Euro Car Parts Ltd', country: 'United Kingdom' },
          { id: 'lkq.ecp.irl', label: 'Euro Car Parts Irland', country: 'Ireland' },
          { id: 'lkq.ecp.gmbh', label: 'Euro Car Parts GmbH', country: 'Germany' },
        ],
      },
      {
        id: 'lkq.ak',
        label: 'Auto Kelly',
        country: 'Czechia',
        children: [
          { id: 'lkq.ak.cz', label: 'Auto Kelly a.s.', country: 'Czechia' },
          { id: 'lkq.ak.sk', label: 'Auto Kelly Slovakia', country: 'Slovakia' },
          { id: 'lkq.ak.pl', label: 'Auto Kelly Polska', country: 'Poland' },
        ],
      },
      {
        id: 'lkq.akl',
        label: 'Auto Kelly Ltd',
        country: 'United Kingdom',
        children: [
          { id: 'lkq.akl.north', label: 'Auto Kelly Ltd North', country: 'United Kingdom' },
          { id: 'lkq.akl.south', label: 'Auto Kelly Ltd South', country: 'United Kingdom' },
        ],
      },
    ],
  },
  // ...continued in Step 3
]
```

- [ ] **Step 3: Extend the fixture to ~40 leaves**

Append three more L1 branches following the same shape, so the total leaf count is 38–42. Use plausible automotive-parts group names and spread `country` across at least eight countries (United Kingdom, Ireland, Germany, France, Spain, Italy, Netherlands, Poland, Czechia, Slovakia) so the Row C country typeahead returns varied results.

Required shape per added branch:

```ts
  {
    id: 'stahlgruber',
    label: 'Stahlgruber Group',
    country: 'Germany',
    children: [
      {
        id: 'stahlgruber.de',
        label: 'Stahlgruber GmbH',
        country: 'Germany',
        children: [
          { id: 'stahlgruber.de.munich', label: 'Stahlgruber München', country: 'Germany' },
          { id: 'stahlgruber.de.berlin', label: 'Stahlgruber Berlin', country: 'Germany' },
          { id: 'stahlgruber.de.hamburg', label: 'Stahlgruber Hamburg', country: 'Germany' },
        ],
      },
      // ...2-3 more L2 branches, each with 3-4 L3 leaves
    ],
  },
```

Then add `rhiag` (Italy) and `sator` (Netherlands) branches on the same pattern. Count the leaves before moving on:

```bash
node -e "const t=require('node:fs').readFileSync('src/mocks/companyTree.ts','utf8');console.log('leaf-ish lines:',(t.match(/label:/g)||[]).length)"
```
Expected: at least 45 `label:` occurrences (leaves plus branches), giving ≥38 leaves.

- [ ] **Step 4: Write the remaining option fixtures**

```ts
// src/mocks/contractTypes.ts
/** Multi-select options. Spec §3 filled state selects the first two. */
export const CONTRACT_TYPES = [
  'IOT Mobile Computer',
  'IOT Printer',
  'IOT Scanner',
  'OneCare Essential',
  'OneCare Select',
  'Foresight IOT',
] as const
```

```ts
// src/mocks/companyNames.ts
/**
 * Company Name single-select options, from screens/B05_regular-selection-dropdown__10489-77782.png.
 * Each option carries a TYPE BADGE, and two options share the label 'Euro Car Parts' —
 * the badge is the only thing distinguishing them, so the list is keyed by id, never by label.
 *
 * 'LKG Corporation' is spelled with a G in this dropdown while the tree (§4) says 'LKQ'.
 * Reproduce both as drawn and add it to the copy-bug list.
 */
export type CompanyNameKind = 'Standard' | 'Subsidiary' | 'Account'

export interface CompanyNameOption {
  id: string
  label: string
  kind: CompanyNameKind
}

export const COMPANY_NAMES: CompanyNameOption[] = [
  { id: 'lkg-standard',  label: 'LKG Corporation', kind: 'Standard' },
  { id: 'ecp-subsidiary', label: 'Euro Car Parts',  kind: 'Subsidiary' },
  { id: 'ecp-account',    label: 'Euro Car Parts',  kind: 'Account' },
]
```

The `Account` badge renders blue; `Standard` and `Subsidiary` render dark grey (B05).

Because two options share a label, `WizardForm.companyName` stores the **option id**, not the label. Anywhere a label is displayed, look it up by id.

- [ ] **Step 5: Write `accountLookup` — the only account-number branch in the app**

All values below are read off `screens/F2b_modal-detail-zoom__10489-82761.png` and `screens/G2_single-onecare-detected__10489-82718.png`. No placeholders remain — v4 closed this.

```ts
// src/mocks/accountLookup.ts
import type { Dashboard, LookupResult } from '@/types/dashboard'

/**
 * THE ONLY PLACE IN THE APP THAT BRANCHES ON AN ACCOUNT NUMBER.
 * Components must never compare an account number themselves — call this.
 *
 * Demo numbers (also printed in docs/demo-card.md):
 *   189189189  no match          -> happy flow, rows B-E
 *   333333333  three dashboards  -> row F
 *   111111111  one direct OneCare-> row G
 */

const THREE_RESULTS: Dashboard[] = [
  { id: 'ah',  company: 'Albert Heijn',   partner: 'Zebra', supportedAction: 'Upgrade',      region: 'EMEA', contractType: 'OneCare' },
  { id: 'acz', company: 'Albert CZ',      partner: 'Kodys', supportedAction: 'None',         region: 'EMEA', contractType: 'OneCare' },
  { id: 'ad',  company: 'Ahold Delhaize', partner: 'Zebra', supportedAction: 'Add Licenses', region: 'EMEA', contractType: 'Foresight IOT' },
]

const SINGLE_RESULT: Dashboard[] = [
  { id: 'ah', company: 'Albert Heijn', partner: 'Zebra', supportedAction: 'Upgrade', region: 'EMEA', contractType: 'OneCare' },
]

// Verbatim from the frames. F and G say different things — that is why copy
// travels with the result rather than living in the modal component.
const F_COPY = {
  title: 'Existing Dashboards Detected',
  body:
    'Select an existing dashboard to continue with upgrades or license changes, ' +
    'or create a new dashboard from scratch.',
}

const G_COPY = {
  title: 'Existing Direct OneCare Dashboard Detected',
  body:
    'A direct OneCare dashboard already exists for this customer account. ' +
    'Upgrade it to Foresight to use existing data, or create a new dashboard.',
}

const SEEDED: Record<string, LookupResult> = {
  '189189189': { existing: [], copy: null },
  '333333333': { existing: THREE_RESULTS, copy: F_COPY },
  '111111111': { existing: SINGLE_RESULT, copy: G_COPY },
}

export function accountLookup(accountNumber: string): LookupResult {
  return SEEDED[accountNumber.trim()] ?? { existing: [], copy: null }
}
```

The three tag variants are spread across the F rows deliberately, so one screenshot exercises `Upgrade` (green), `None` (grey) and `Add Licenses` (amber) — and `Albert CZ`'s `None` is what proves the hover action button is driven by the row's action, not by hover alone.

- [ ] **Step 6: Write the store**

One flat form object plus `mode` and `status`, per CLAUDE.md.

```ts
// src/store/wizard.ts
import { create } from 'zustand'
import { accountLookup } from '@/mocks/accountLookup'
import type { Dashboard, LookupResult } from '@/types/dashboard'

export type WizardMode = 'edit' | 'review'
export type WizardStatus = 'idle' | 'submitting' | 'done'

export interface WizardForm {
  accountNumber: string
  /** CompanyNameOption id, NOT a label — two options share the label 'Euro Car Parts'. */
  companyName: string | null
  displayName: string
  automaticallyAddContracts: 'yes' | 'no'
  /** Leaf ids from COMPANY_TREE. Only leaves are stored; parent state is derived. */
  validCompanyNames: string[]
  contractTypes: string[]
  userEmail: string
  signUpForLearningSeries: boolean
  /** Object URL of the uploaded file, or null. Never persisted. */
  companyLogo: string | null
}

const EMPTY_FORM: WizardForm = {
  accountNumber: '',
  companyName: null,
  displayName: '',
  automaticallyAddContracts: 'yes', // spec §3: default Yes
  validCompanyNames: [],
  contractTypes: [],
  userEmail: '',
  signUpForLearningSeries: false,
  companyLogo: null,
}

export interface WizardState {
  form: WizardForm
  mode: WizardMode
  status: WizardStatus
  /** 0-100 while status === 'submitting'. */
  progress: number
  /** Null until an account number has been looked up. */
  lookup: LookupResult | null
  isModalOpen: boolean
  selectedExistingDashboardId: string | null
  /** Snapshot taken on enterEdit so cancelEdit can restore it. */
  editSnapshot: WizardForm | null

  setField: <K extends keyof WizardForm>(key: K, value: WizardForm[K]) => void
  runLookup: () => void
  dismissModal: () => void
  selectExistingDashboard: (id: string) => void
  createNewDashboard: () => void
  submit: () => void
  enterEdit: () => void
  cancelEdit: () => void
  saveEdit: () => void
  reset: () => void
}

export const useWizardStore = create<WizardState>((set, get) => ({
  form: EMPTY_FORM,
  mode: 'edit',
  status: 'idle',
  progress: 0,
  lookup: null,
  isModalOpen: false,
  selectedExistingDashboardId: null,
  editSnapshot: null,

  setField: (key, value) =>
    set((s) => ({ form: { ...s.form, [key]: value } })),

  // Called on account-number blur. The ONLY caller of accountLookup.
  runLookup: () => {
    const result = accountLookup(get().form.accountNumber)
    set({ lookup: result, isModalOpen: result.existing.length > 0 })
  },
  // `result.copy` carries the modal title/body — F and G word them differently.

  dismissModal: () => set({ isModalOpen: false }),

  selectExistingDashboard: (id) => set({ selectedExistingDashboardId: id }),

  // 'Create a New Dashboard' — dismiss and continue as the happy flow.
  createNewDashboard: () =>
    set({ isModalOpen: false, selectedExistingDashboardId: null }),

  // The single seam a real backend would replace. Nothing else may know
  // a network could exist. Spec §5: ~2.5s, progress 0 -> 100.
  submit: () => {
    if (get().status !== 'idle') return
    set({ status: 'submitting', progress: 0 })
    const started = Date.now()
    const DURATION = 2500
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - started
      const pct = Math.min(100, Math.round((elapsed / DURATION) * 100))
      set({ progress: pct })
      if (pct >= 100) {
        window.clearInterval(tick)
        set({ status: 'done' })
      }
    }, 50)
  },

  enterEdit: () => set((s) => ({ mode: 'edit', editSnapshot: s.form })),
  cancelEdit: () =>
    set((s) => ({
      mode: 'review',
      form: s.editSnapshot ?? s.form,
      editSnapshot: null,
    })),
  saveEdit: () => set({ mode: 'review', editSnapshot: null }),

  reset: () =>
    set({
      form: EMPTY_FORM,
      mode: 'edit',
      status: 'idle',
      progress: 0,
      lookup: null,
      isModalOpen: false,
      selectedExistingDashboardId: null,
      editSnapshot: null,
    }),
}))

/** Spec §3: Submit is disabled until every required field is valid. */
export function selectIsFormValid(state: WizardState): boolean {
  const f = state.form
  return (
    f.accountNumber.trim().length > 0 &&
    f.companyName !== null &&
    f.displayName.trim().length > 0 &&
    f.validCompanyNames.length > 0 &&
    f.contractTypes.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.userEmail.trim())
  )
}
```

Required fields are exactly the six marked ✅ in spec §3. `automaticallyAddContracts`, `signUpForLearningSeries` and `companyLogo` are optional and must not gate Submit.

- [ ] **Step 7: Verify**

```bash
npm run build
```
Expected: `tsc -b` clean.

Then temporarily expose the store on the Overview route (`useEffect(() => { (window as any).wz = useWizardStore }, [])`), run `npm run dev`, and in the console check each of:

```js
wz.getState().form.automaticallyAddContracts        // 'yes'
wz.getState().setField('accountNumber','333333333'); wz.getState().runLookup()
wz.getState().lookup.existing.length                 // 3
wz.getState().lookup.copy.title                      // 'Existing Dashboards Detected'
wz.getState().isModalOpen                            // true
wz.getState().setField('accountNumber','111111111'); wz.getState().runLookup()
wz.getState().lookup.existing.length                 // 1
wz.getState().lookup.copy.title                      // 'Existing Direct OneCare Dashboard Detected'
wz.getState().setField('accountNumber','189189189'); wz.getState().runLookup()
wz.getState().lookup.existing.length                 // 0
wz.getState().isModalOpen                            // false
```

Remove the `window.wz` line before committing.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: domain types, mock fixtures and wizard store with seeded account lookup"
```

---

## Task 6: Form primitives and tooltips (covers B3, B4, and Row D — 5 screens)

Delivers the field states: hover (`10489:76991`), focus (`10489:77480`), and the three tooltip frames (`10489:80202`, `10489:80363`, `10489:76248`).

**Files:**
- Create: `src/components/ui/Tooltip.tsx`, `src/components/ui/FieldLabel.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/InputWithHeader.tsx`, `src/components/ui/Checkbox.tsx`, `src/components/ui/RadioGroup.tsx`, `src/content/dashboardSettings.ts`

**Interfaces:**
- Consumes: `cn`, tokens, `Button`.
- Produces:
  - `<Tooltip content={string}>{trigger}</Tooltip>` — hover-and-focus triggered, absolutely positioned.
  - `<FieldLabel label required tooltip />` — renders the label, red `*`, and a 16px `Info` icon wrapped in a Tooltip.
  - `<Input value onChange onBlur placeholder disabled />`
  - `<InputWithHeader label required tooltip value onChange onBlur placeholder />`
  - `<Checkbox checked indeterminate onChange label disabled />`
  - `<RadioGroup name value onChange options={{label,value}[]} />`
  - `DASHBOARD_SETTINGS_COPY` with `labels`, `placeholders`, `tooltips`, `buttons`.

- [ ] **Step 1: Build the Tooltip**

Must be `absolute`, never `fixed` — see Global Constraints. Anchor it to a `relative` wrapper.

```tsx
// src/components/ui/Tooltip.tsx
import { useState, type ReactNode } from 'react'

export interface TooltipProps {
  content: string
  children: ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-[280px] -translate-x-1/2
                     rounded-viq-control bg-viq-tooltip-bg px-3 py-2 text-xs
                     leading-relaxed text-viq-tooltip-text shadow-lg"
        >
          {content}
        </span>
      )}
    </span>
  )
}
```

Match width, placement, arrow and fill to Figma `10489:80202`. The Figma also draws an `instance: Pointer` — that is a mock cursor for the presentation, **not** part of the component. Do not build it.

- [ ] **Step 2: Build FieldLabel**

Spec §3: required fields carry a red `*` after the label; every label carries a 16px info icon → tooltip.

```tsx
// src/components/ui/FieldLabel.tsx
import { Info } from 'lucide-react'
import { Tooltip } from './Tooltip'

export interface FieldLabelProps {
  label: string
  required?: boolean
  tooltip?: string
  htmlFor?: string
}

export function FieldLabel({ label, required, tooltip, htmlFor }: FieldLabelProps) {
  return (
    <span className="mb-1.5 flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-viq-text">
        {label}
        {required && <span className="text-viq-danger"> *</span>}
      </label>
      {tooltip && (
        <Tooltip content={tooltip}>
          <Info size={16} tabIndex={0} className="cursor-help text-viq-icon-muted" />
        </Tooltip>
      )}
    </span>
  )
}
```

- [ ] **Step 3: Build Input and InputWithHeader**

`w-[260px]` matches the spec §2 form grid. Hover and focus rings must match B3/B4 exactly.

```tsx
// src/components/ui/Input.tsx
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-[260px] rounded-viq-control border border-viq-border px-3 text-sm',
        'text-viq-text placeholder:text-viq-text-placeholder',
        'hover:border-viq-border-hover',
        'focus:border-viq-primary focus:ring-2 focus:ring-viq-primary/20 focus:outline-none',
        'disabled:cursor-not-allowed disabled:bg-viq-surface-disabled',
        className,
      )}
      {...rest}
    />
  )
}
```

```tsx
// src/components/ui/InputWithHeader.tsx
import { useId, type InputHTMLAttributes } from 'react'
import { FieldLabel } from './FieldLabel'
import { Input } from './Input'

export interface InputWithHeaderProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  tooltip?: string
}

export function InputWithHeader({ label, required, tooltip, ...rest }: InputWithHeaderProps) {
  const id = useId()
  return (
    <div className="flex flex-col">
      <FieldLabel label={label} required={required} tooltip={tooltip} htmlFor={id} />
      <Input id={id} {...rest} />
    </div>
  )
}
```

- [ ] **Step 4: Build Checkbox with an indeterminate state**

`indeterminate` is a DOM property, not an attribute — it cannot be set in JSX and must go through a ref. The TreeSelect depends on this working.

```tsx
// src/components/ui/Checkbox.tsx
import { useEffect, useId, useRef } from 'react'
import { cn } from '@/lib/cn'

export interface CheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function Checkbox({
  checked, indeterminate = false, onChange, label, disabled, className,
}: CheckboxProps) {
  const id = useId()
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked
  }, [indeterminate, checked])

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-viq-primary"
      />
      {label && (
        <label htmlFor={id} className="cursor-pointer text-sm text-viq-text select-none">
          {label}
        </label>
      )}
    </span>
  )
}
```

If the Figma's checkbox does not match a native `accent-color` control, replace the `<input>` visual with a styled `<span>` overlay but keep the native input for a11y and keep the props identical.

- [ ] **Step 5: Build RadioGroup**

Spec §3: `No` / `Yes`, default `Yes`. B2 (`8135:2690`) is this set to `No`.

```tsx
// src/components/ui/RadioGroup.tsx
export interface RadioOption<T extends string> { label: string; value: T }

export interface RadioGroupProps<T extends string> {
  name: string
  value: T
  options: RadioOption<T>[]
  onChange: (value: T) => void
}

export function RadioGroup<T extends string>({ name, value, options, onChange }: RadioGroupProps<T>) {
  return (
    <div className="flex items-center gap-6">
      {options.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm text-viq-text">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="h-4 w-4 accent-viq-primary"
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Write the form copy module**

Placeholders are verbatim from spec §3 — note the `compony` typo.

```ts
// src/content/dashboardSettings.ts
export const DASHBOARD_SETTINGS_COPY = {
  title: 'Dashboard Settings',
  labels: {
    accountNumber: 'Account Number',
    companyName: 'Company Name',
    displayName: 'Display Name',
    automaticallyAddContracts: 'Automatically Add Contracts',
    validCompanyNames: 'Valid Company Names',
    contractType: 'Contract Type',
    userEmail: 'User Email',
    signUpForLearningSeries: 'Sign Up For Learning Series',
    companyLogo: 'Company Logo',
  },
  placeholders: {
    accountNumber: 'Type your account number...',
    companyName: 'Select compony name...', // TYPO from Figma — spec §7.5. Do not fix.
    displayName: 'Create a display name...',
    validCompanyNames: 'Select all valid names',
    contractType: 'Select contract types',
    userEmail: 'Enter your email...',
    treeSearch: 'Search',
  },
  buttons: {
    back: 'Back',
    submit: 'Submit', // NOT 'Next' on this step — spec §3
    uploadLogo: 'Upload Logo',
    save: 'Save',
    cancel: 'Cancel',
  },
  radio: { yes: 'Yes', no: 'No' },
  /** One per field — reuse the Overview explainer bodies verbatim. */
  tooltips: {
    // Import from OVERVIEW_COPY rather than duplicating, if the Figma text matches.
    // Verify against 10489:80202 / 10489:80363 / 10489:76248 first.
  },
} as const
```

Check whether the Row D tooltip text is the same as the Overview explainer text. If it is, derive `tooltips` from `OVERVIEW_COPY.fields` so there is one copy source. If it differs, transcribe the tooltip text separately from the three Row D nodes.

- [ ] **Step 7: Verify against B3, B4 and Row D**

Render all six primitives on the `/sandbox/tree-select` route temporarily. Check:
1. **B3 hover** (`10489:76991`): hovering an input changes the border to the Figma's hover colour.
2. **B4 focus** (`10489:77480`): clicking in shows the Figma's focus treatment.
3. **Row D** (`10489:80202`, `10489:80363`, `10489:76248`): hovering each info icon opens a tooltip in the Figma's position with the Figma's text. Keyboard-focusing the icon opens it too.
4. Checkbox: set `indeterminate` and confirm the dash renders.
5. Radio: `Yes` is preselected.
6. Required labels show a red `*`; optional ones do not.
7. Console clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: form primitives with hover, focus and tooltip states (B3, B4, row D)"
```

---

## Task 7: Select and MultiSelect (covers B5 — 1 screen)

The regular selection dropdown, `10489:77782`. Used by Company Name (single) and Contract Type (multi).

**Files:**
- Create: `src/components/ui/Select.tsx`, `src/components/ui/MultiSelect.tsx`

**Interfaces:**
- Consumes: `FieldLabel`, `Checkbox`, `cn`, tokens.
- Produces:
  - `SelectOption = { id: string; label: string; badge?: string; badgeTone?: 'blue' | 'grey' }`
  - `<Select label required tooltip value={string|null} onChange={(id:string)=>void} options={SelectOption[]} placeholder />` — trigger shows the selected option's label
  - `<MultiSelect label required tooltip value={string[]} onChange={(v:string[])=>void} options={readonly string[]} placeholder />` — trigger keeps its placeholder; selections render as a chip row beneath

- [ ] **Step 1: Build Select**

Panel is `absolute`, chevron flips when open, closes on outside click and on Escape.

```tsx
// src/components/ui/Select.tsx
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { FieldLabel } from './FieldLabel'

export interface SelectProps {
  label: string
  required?: boolean
  tooltip?: string
  /** Selected option id, not a label. */
  value: string | null
  onChange: (id: string) => void
  options: SelectOption[]
  placeholder: string
}

export function Select({
  label, required, tooltip, value, onChange, options, placeholder,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="flex flex-col" ref={root}>
      <FieldLabel label={label} required={required} tooltip={tooltip} />
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-10 w-[260px] items-center justify-between rounded-viq-control',
            'border border-viq-border px-3 text-sm hover:border-viq-border-hover',
            open && 'border-viq-primary',
          )}
        >
          <span className={value ? 'text-viq-text' : 'text-viq-text-placeholder'}>
            {options.find((o) => o.id === value)?.label ?? placeholder}
          </span>
          <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute top-full left-0 z-40 mt-1 max-h-[390px] w-[260px] overflow-y-auto
                       rounded-viq-control border border-viq-border bg-white py-1 shadow-lg"
          >
            {options.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.id === value}
                  onClick={() => { onChange(o.id); setOpen(false) }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2
                             text-left text-sm hover:bg-viq-surface-hover"
                >
                  <span>{o.label}</span>
                  {o.badge && (
                    <span className={cn(
                      'rounded px-1.5 py-0.5 text-[10px]',
                      o.badgeTone === 'blue' ? 'text-viq-primary' : 'text-viq-text-muted',
                    )}>
                      {o.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build MultiSelect**

Same shell, checkbox rows, panel stays open on select, trigger summarises the selection.

Copy the `Select` outside-click and Escape effect verbatim. Differences: `value: string[]`; each row is a `<Checkbox>`; clicking toggles membership without closing the panel.

**The trigger never shows the selection.** Spec §3, confirmed on `screens/B07_filled__10489-78667.png`: the closed control keeps showing its placeholder, and the selected values render as a **chip row directly beneath it**. Contract type shows `IOT Mobile Computer` `IOT Printer` that way. So `MultiSelect` renders `<ChipGroup>` (Task 10) under the trigger — do not put text in the trigger, and do not truncate anything into it.

Until Task 10 lands, render the selected labels as plain comma-separated text below the trigger and replace it with `ChipGroup` there.

**Company Name select is not a plain list.** Per spec §3 and `screens/B05_regular-selection-dropdown__10489-77782.png`, each option carries a type badge, and two options share the label `Euro Car Parts`. So `Select` takes `options: CompanyNameOption[]` keyed by `id`, renders `label` plus a badge, and calls `onChange(id)`. Give `Select` a generic option shape rather than `readonly string[]`:

```ts
export interface SelectOption {
  id: string
  label: string
  /** Optional right-hand badge. 'Account' renders blue, others dark grey (B05). */
  badge?: string
  badgeTone?: 'blue' | 'grey'
}
```

The trigger displays the selected option's `label`, looked up by id.

- [ ] **Step 3: Verify against `screens/B05_regular-selection-dropdown__10489-77782.png`**

On the sandbox route:
1. Panel width, max-height, row height, hover fill and chevron rotation match the frame.
2. Three options render: `LKG Corporation` [Standard, grey], `Euro Car Parts` [Subsidiary, grey], `Euro Car Parts` [Account, blue]. The two `Euro Car Parts` rows are independently selectable — picking one does not highlight the other. That is the bug this option shape exists to prevent; test it explicitly.
3. Outside click and Escape close it.
4. MultiSelect keeps the panel open across multiple selections, keeps showing its placeholder in the trigger, and lists selections beneath it.
5. Console clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: select and multi-select dropdowns (B5)"
```

---

## Task 8: TreeSelect core in isolation (covers B6 — 1 screen)

The most expensive component in the build (spec §4). Built on its own route before it touches the form, per CLAUDE.md working style. Pure logic is separated from rendering because with no test runner it must be small enough to reason about directly.

**Files:**
- Create: `src/components/ui/TreeSelect/treeSelection.ts`, `src/components/ui/TreeSelect/treeSearch.ts`, `src/components/ui/TreeSelect/TreeNodeRow.tsx`, `src/components/ui/TreeSelect/TreeSelectPanel.tsx`, `src/components/ui/TreeSelect/TreeSelect.tsx`
- Modify: `src/routes/TreeSelectSandbox.tsx`

**Interfaces:**
- Consumes: `CompanyNode` (Task 5), `COMPANY_TREE`, `Checkbox`, `FieldLabel`.
- Produces — Tasks 9, 10 and 12 use these exact signatures:
  - `collectLeafIds(node: CompanyNode): string[]`
  - `toggleNode(node: CompanyNode, selected: Set<string>, checked: boolean): Set<string>`
  - `nodeState(node: CompanyNode, selected: Set<string>): 'checked' | 'indeterminate' | 'unchecked'`
  - `rollUpSelection(tree: CompanyNode[], selected: Set<string>): string[]` — labels of the highest fully-selected nodes, for chips
  - `filterTree(tree: CompanyNode[], query: string, countries: string[]): CompanyNode[]`
  - `allCountries(tree: CompanyNode[]): string[]`
  - `<TreeSelect label required tooltip value={string[]} onChange={(ids:string[])=>void} tree={CompanyNode[]} placeholder />`

- [ ] **Step 1: Write the selection math**

Only leaf ids are ever stored. Parent checked/indeterminate is always derived, which makes an inconsistent state unrepresentable.

```ts
// src/components/ui/TreeSelect/treeSelection.ts
import type { CompanyNode } from './types'

export function collectLeafIds(node: CompanyNode): string[] {
  if (!node.children?.length) return [node.id]
  return node.children.flatMap(collectLeafIds)
}

/** Checking a parent checks all descendants; unchecking clears them. Spec §4. */
export function toggleNode(
  node: CompanyNode,
  selected: Set<string>,
  checked: boolean,
): Set<string> {
  const next = new Set(selected)
  for (const id of collectLeafIds(node)) {
    if (checked) next.add(id)
    else next.delete(id)
  }
  return next
}

export function nodeState(
  node: CompanyNode,
  selected: Set<string>,
): 'checked' | 'indeterminate' | 'unchecked' {
  const leaves = collectLeafIds(node)
  const hits = leaves.filter((id) => selected.has(id)).length
  if (hits === 0) return 'unchecked'
  if (hits === leaves.length) return 'checked'
  return 'indeterminate'
}

/**
 * Chip labels: the highest fully-selected nodes. Selecting all of
 * 'Euro Car Parts' yields one chip 'Euro Car Parts', not three leaf chips —
 * which is what Figma 10489:78667 shows.
 */
export function rollUpSelection(tree: CompanyNode[], selected: Set<string>): string[] {
  const out: string[] = []
  const walk = (nodes: CompanyNode[]) => {
    for (const n of nodes) {
      const state = nodeState(n, selected)
      if (state === 'checked') out.push(n.label)
      else if (state === 'indeterminate' && n.children) walk(n.children)
    }
  }
  walk(tree)
  return out
}
```

- [ ] **Step 2: Write search and country filtering**

Search keeps ancestors of matches visible (spec §4). The two filters compose: a node survives if it matches the query **and** the country set.

```ts
// src/components/ui/TreeSelect/treeSearch.ts
import type { CompanyNode } from './types'

/**
 * Returns a pruned copy of the tree. A node is kept when it matches, or when
 * any descendant matches — so ancestors of a match stay visible. Spec §4.
 * An empty query and an empty country list are both no-ops.
 */
export function filterTree(
  tree: CompanyNode[],
  query: string,
  countries: string[],
): CompanyNode[] {
  const q = query.trim().toLowerCase()
  const countrySet = new Set(countries)

  const selfMatches = (n: CompanyNode) =>
    (q === '' || n.label.toLowerCase().includes(q)) &&
    (countrySet.size === 0 || countrySet.has(n.country))

  const prune = (nodes: CompanyNode[]): CompanyNode[] =>
    nodes.flatMap((n) => {
      const kids = n.children ? prune(n.children) : []
      if (kids.length > 0) return [{ ...n, children: kids }]
      return selfMatches(n) ? [{ ...n, children: n.children ? [] : undefined }] : []
    })

  return prune(tree)
}

export function allCountries(tree: CompanyNode[]): string[] {
  const seen = new Set<string>()
  const walk = (nodes: CompanyNode[]) => {
    for (const n of nodes) {
      seen.add(n.country)
      if (n.children) walk(n.children)
    }
  }
  walk(tree)
  return [...seen].sort()
}
```

Note the branch that keeps a matched branch node with `children: []`: a branch matching by name shows without its non-matching children. Confirm that against the Figma search state; if the design keeps the children, change `children: []` to `children: n.children`.

- [ ] **Step 3: Build the recursive row**

Indentation is ~19px per level (spec §4: checkbox x 298 → 317 → 336).

```tsx
// src/components/ui/TreeSelect/TreeNodeRow.tsx
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { nodeState, toggleNode } from './treeSelection'
import type { CompanyNode } from './types'

const INDENT_PX = 19

export interface TreeNodeRowProps {
  node: CompanyNode
  depth: number
  selected: Set<string>
  onSelectedChange: (next: Set<string>) => void
  /** Forces every branch open while a search or filter is active. */
  forceExpanded: boolean
}

export function TreeNodeRow({
  node, depth, selected, onSelectedChange, forceExpanded,
}: TreeNodeRowProps) {
  // Figma 10489:78221: LKQ Corporation and Euro Car Parts are expanded, the
  // Auto Kelly branches are collapsed. Depth < 2 reproduces that default.
  const [open, setOpen] = useState(depth < 2)
  const expanded = forceExpanded || open
  const hasChildren = Boolean(node.children?.length)
  const state = nodeState(node, selected)

  return (
    <li>
      <div
        className="flex h-8 items-center gap-1 pr-2 hover:bg-viq-surface-hover"
        style={{ paddingLeft: 8 + depth * INDENT_PX }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={expanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
            onClick={() => setOpen((o) => !o)}
            className="text-viq-icon-muted"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-[14px]" />
        )}
        <Checkbox
          checked={state === 'checked'}
          indeterminate={state === 'indeterminate'}
          label={node.label}
          onChange={(checked) => onSelectedChange(toggleNode(node, selected, checked))}
        />
      </div>
      {hasChildren && expanded && (
        <ul>
          {node.children!.map((child) => (
            <TreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              onSelectedChange={onSelectedChange}
              forceExpanded={forceExpanded}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
```

- [ ] **Step 4: Build the panel**

Spec §4 anatomy, top to bottom: search bar with magnifier + funnel, `Select All` checkbox, then the tree. Panel is 242px wide, `max-height ≈ 390`, own scrollbar. The funnel button is rendered here but wired in Task 9 — give it an `onFilterClick` prop and a `filterCount` badge now so Task 9 is a pure addition. Note the filter panel itself is **not** a child of this panel (v4 corrected this): it floats to the right of the form and `TreeSelect` owns it.

```tsx
// src/components/ui/TreeSelect/TreeSelectPanel.tsx — signature only; fill in per §4
export interface TreeSelectPanelProps {
  tree: CompanyNode[]
  selected: Set<string>
  onSelectedChange: (next: Set<string>) => void
  query: string
  onQueryChange: (q: string) => void
  countries: string[]
  onFilterClick: () => void
  /** Badge count on the funnel. Task 9 supplies it. */
  filterCount: number
}
```

Behaviour: `visible = filterTree(tree, query, countries)`; `forceExpanded = query.trim() !== '' || countries.length > 0`; `Select All` reflects `nodeState` across the whole visible tree and toggles every visible leaf. The funnel shows a numeric badge when `countries.length > 0` (spec §4 — Figma shows `1` and `3`).

- [ ] **Step 5: Build the trigger**

Trigger looks like a Select, chevron flips up when open. Selected values render **outside** the trigger as chips — that is Task 10; for now render `rollUpSelection(...).length` as plain text and replace it in Task 10.

- [ ] **Step 6: Build the sandbox route**

```tsx
// src/routes/TreeSelectSandbox.tsx — dev-only, not linked from any screen
```
Render a single `<TreeSelect>` over `COMPANY_TREE` with local `useState`, plus a `<pre>` dumping the selected ids and `rollUpSelection` output so the math is visible while clicking.

- [ ] **Step 7: Verify against B6 `10489:78221`**

At `/sandbox/tree-select`, confirm every one of these by clicking:
1. Default open state matches the frame: `LKQ Corporation` expanded, `Euro Car Parts` expanded showing its three leaves (including `Euro Car Parts Irland`, typo intact), `Auto Kelly` and `Auto Kelly Ltd` collapsed.
2. Panel is 242px wide with a ~390px max-height and its own scrollbar once the extra branches are in view.
3. Checking `Euro Car Parts` checks all three leaves; the `<pre>` shows three ids; the chip roll-up shows exactly `Euro Car Parts`.
4. Unchecking one leaf makes `Euro Car Parts` indeterminate (dash, not tick) and `LKQ Corporation` indeterminate too.
5. Unchecking the parent clears all three.
6. `Select All` checks every leaf in the tree; the roll-up collapses to the top-level labels.
7. Typing `kelly` filters to the Auto Kelly branches with `LKQ Corporation` still visible as the ancestor, and everything force-expanded. Clearing the query restores the default expansion.
8. Indentation steps ~19px per level.
9. Console clean — in particular no key warnings from the recursion.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: 3-tier tree select with selection math and search (B6)"
```

---

## Task 9: Filter panel (covers Row C — 5 screens)

`screens/C1_click-filter-icon__11153-92265.png`, `C2_type-country-region__11137-85205.png`, `C3_suggested-search-results__11137-89921.png`, `C4_selected-filter-apply__11153-91657.png`, `C5_filters-applied__11153-92575.png`.

**v4 corrected this component's anatomy.** It is **not** a panel inside the dropdown. It is a **separate floating panel** that opens to the right of the form (roughly x 960–1400, y 100–365 in frame coordinates) **while the tree stays open underneath**. Build it as a sibling of the tree panel, not a child.

**Files:**
- Create: `src/components/ui/TreeSelect/FilterPanel.tsx`
- Modify: `src/components/ui/TreeSelect/TreeSelectPanel.tsx`, `src/components/ui/TreeSelect/TreeSelect.tsx`, `src/mocks/countries.ts` (create)

**Interfaces:**
- Consumes: `allCountries`, `filterTree` (Task 8), `IconButton` (Task 14 — if Task 14 has not run, build the funnel button inline and retrofit it).
- Produces: `<FilterPanel open onClose value={string[]} onApply={(c:string[])=>void} onClearAll={()=>void} />`

- [ ] **Step 1: Add a country fixture**

The typeahead suggests real countries, not just the ones present in the tree — `C3` shows `Canada`, `Cambodia`, `Cameroon`, `Cape Verde` for the query `Ca`, and none of those are company countries. So the suggestion source is a country list, while the tree filter matches against node `country` values.

```ts
// src/mocks/countries.ts
/** Suggestion source for the By Country filter. A plain ISO-ish country list. */
export const COUNTRIES: string[] = [
  'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Czechia', 'France',
  'Germany', 'Ireland', 'Italy', 'Netherlands', 'Poland', 'Slovakia',
  'Spain', 'United Kingdom', 'United States',
  // ...extend to ~60 so the typeahead feels real
]
```

- [ ] **Step 2: Build the FilterPanel**

Anatomy, verbatim from spec §4 and the C frames:

- **Header:** `Filter` + a close `×`.
- **Left column, `Filter Properties`:** a vertical list of properties — `By Country` (selected, light grey fill) and `By Region`. Selecting one swaps the right column. Only `By Country` is wired; `By Region` renders and is selectable but its right column can be an empty state — match whatever `C1` shows.
- **Right column, titled by the active property (`Select Countries`):** a search input, placeholder `Type a country name`, magnifier icon. A `Reset` link appears **top-right of this column once anything is selected**.
- **Typeahead:** each row is a magnifier icon + the name. **The raw query is the first row** — typing `Ca` yields `Ca`, `Canada`, `Cambodia`, `Cameroon`, `Cape Verde`. Reproduce that; it is unusual and it is what `C3` shows.
- **Chosen values become removable chips below the input:** `× Canada`.
- **Footer:** `Clear All` (outline, left) and `Apply Filters` (primary, right).

```ts
export interface FilterPanelProps {
  open: boolean
  onClose: () => void
  /** Committed countries. The panel stages its own draft and only emits on Apply. */
  value: string[]
  onApply: (countries: string[]) => void
  onClearAll: () => void
}
```

Nothing is applied until `Apply Filters` — `C4` is explicitly "Selected filter + apply", with the tree unchanged behind it. Position it `absolute` within the canvas (never `fixed`).

- [ ] **Step 3: Wire it into the tree select**

`TreeSelect` — not `TreeSelectPanel` — owns `countries: string[]` and `filterPanelOpen: boolean`, because the panel is a sibling of the tree panel and must survive independently of it. Pass `countries` down into `filterTree`. The funnel button inside the tree's search bar toggles `filterPanelOpen` and carries a dark count badge when `countries.length > 0` (`1` in C5).

Build the funnel button inline here with its badge; Task 14 Step 2 retrofits it to `IconButton` once that exists.

**Add two optional props to `TreeSelect` for the guided flow (Task 17):**

```ts
  /** Seeds the applied country filter. Task 17 drives the C5 screen through this. */
  defaultCountries?: string[]
  /** Opens the tree panel on mount. Task 17 drives B06 and C1–C5 through this. */
  defaultOpen?: boolean
```

They seed the initial state and nothing more — normal interaction must still override them freely. This is the seam the flow uses instead of reaching into component internals.

- [ ] **Step 4: Verify against all five C frames**

At `/sandbox/tree-select`, side by side with each PNG:
1. **C1** — the funnel opens a floating panel to the right of the form, **and the tree stays open underneath**. Header `Filter` + `×`. `By Country` is preselected with a light grey fill; `By Region` is listed below it.
2. **C2** — typing in `Type a country name` is reflected in the input.
3. **C3** — typing `Ca` lists `Ca`, `Canada`, `Cambodia`, `Cameroon`, `Cape Verde`, in that order, each row with a magnifier icon. The raw query really is first.
4. **C4** — picking `Canada` adds a removable `× Canada` chip below the input, a `Reset` link appears top-right of the right column, and **the tree behind is still unfiltered**.
5. **C5** — `Apply Filters` closes the panel, narrows the tree, and puts a dark `1` badge on the funnel. Applying two countries shows `2`.
6. `Clear All` empties the draft; `Reset` clears the column's selection; closing via `×` discards the draft without applying.
7. Search and country filter compose: with `Germany` applied, typing `stahl` in the tree's own search narrows further.
8. Console clean.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: floating country/region filter panel (row C)"
```

---

## Task 10: Chips, chip group and `+N` overflow (part of B8)

**Files:**
- Create: `src/components/ui/Chip.tsx`, `src/components/ui/ChipGroup.tsx`
- Modify: `src/components/ui/TreeSelect/TreeSelect.tsx`

**Interfaces:**
- Consumes: `rollUpSelection` (Task 8).
- Produces: `<Chip label onRemove? />`, `<ChipGroup labels={string[]} max={number} onRemove?={(label:string)=>void} />`

- [ ] **Step 1: Build Chip and ChipGroup**

Spec §4: selected values render outside the trigger as chips in a `tab group` — `Euro Car Parts`, `Euro Car Parts Ltd`, `+3`. The review screens show `+30`, so the overflow chip must not clip at two digits.

```tsx
// src/components/ui/ChipGroup.tsx
import { Chip } from './Chip'

export interface ChipGroupProps {
  labels: string[]
  /** Chips shown before collapsing into +N. Figma B7 shows 2. */
  max?: number
  onRemove?: (label: string) => void
}

export function ChipGroup({ labels, max = 2, onRemove }: ChipGroupProps) {
  const shown = labels.slice(0, max)
  const overflow = labels.length - shown.length
  return (
    <div className="flex flex-wrap items-center gap-2">
      {shown.map((l) => (
        <Chip key={l} label={l} onRemove={onRemove && (() => onRemove(l))} />
      ))}
      {overflow > 0 && <Chip label={`+${overflow}`} />}
    </div>
  )
}
```

**Chip hover, from `screens/B08_logo-chip-button-hover__10489-79003.png`:** the chip grows an `×` and takes a blue border. So `Chip` renders its `×` only on hover (or keyboard focus, for a11y) and swaps its border to `--color-viq-border-focus`. Reserve the `×`'s width in the resting state so the chip does not jump on hover. The `+N` chip is not removable and has no hover treatment.

- [ ] **Step 2: Wire chips into TreeSelect and MultiSelect**

Two call sites, both replacing placeholder rendering left behind by earlier tasks:

1. **TreeSelect** — replace Task 8 Step 5's placeholder count with `<ChipGroup labels={rollUpSelection(tree, selected)} max={2} />` below the trigger.
2. **MultiSelect** — replace Task 7's plain comma-separated text with `<ChipGroup labels={value} max={2} />` below the trigger. Task 7 shipped the text form only because `ChipGroup` did not exist yet; this is the swap it was waiting for. The trigger keeps showing its placeholder in both cases.

- [ ] **Step 3: Verify against B7 `10489:78667` and B8 `10489:79003`**

1. Select `Euro Car Parts` plus one other leaf → two chips, matching B7's text and order.
2. `Select All` → two chips plus a `+N` chip; confirm N is correct against the `<pre>` roll-up count.
3. With ~40 leaves selected the overflow reads a two-digit `+NN` without clipping — the review screens show `+30`.
4. Chip hover matches `screens/B08_logo-chip-button-hover__10489-79003.png`: an `×` appears and the border turns blue. The chip does not change width on hover.
5. Chips render **beneath** the closed control, not inside it, and the trigger still shows its placeholder (B07).
6. Console clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: chips and +N overflow for tree select selections"
```

---

## Task 11: Upload button (part of B8)

**Files:**
- Create: `src/components/ui/UploadButton.tsx`

**Interfaces:**
- Consumes: `Button`, tokens.
- Produces: `<UploadButton value={string|null} onChange={(url:string|null)=>void} label />`

- [ ] **Step 1: Build it**

Spec §3: `Upload Logo` + upload icon. The filled state replaces the button with a **bordered thumbnail card ~88×88** holding the logo image (v4 corrected this — the `214×305` figure in the old spec was the Figma asset's own rect, not the rendered card).

Hidden `<input type="file" accept="image/*">`; on change, `URL.createObjectURL(file)`. **No upload, no persistence** — revoke the previous object URL on replace to avoid a leak, and never write it to storage.

Three states, all on `screens/B08_logo-chip-button-hover__10489-79003.png`:
- **empty** — the `Upload Logo` button with its upload icon
- **uploaded** — the ~88×88 bordered card
- **card hover** — the card dims under a grey scrim with a **pencil icon top-right**; clicking it reopens the file picker

- [ ] **Step 2: Verify against B8 `10489:79003`**

Button matches the frame. Choosing a local image swaps to the ~88×88 bordered card. Hovering the card dims it under a grey scrim with a pencil top-right, and clicking reopens the picker. Replacing twice does not leak (the previous object URL is revoked). No console errors, and the Application tab shows **empty** storage — no `localStorage` writes.

Review mode renders the logo differently again — a larger bordered panel with `Account Logo` / `File Name` labels (Task 16). Do not try to reuse this component there; they only share the image.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: company logo upload button with thumbnail state (B8)"
```

---

## Task 12: Assemble the Dashboard Settings form (covers B1, B2, B7 — 3 screens)

Everything built so far, wired to the store, on the spec §2 form grid.

**Files:**
- Create: `src/routes/DashboardSettingsForm.tsx`
- Modify: `src/routes/DashboardSettings.tsx`

**Interfaces:**
- Consumes: every primitive from Tasks 6–11, `useWizardStore`, `selectIsFormValid`, `COMPANY_TREE`, `CONTRACT_TYPES`, `COMPANY_NAMES`, `DASHBOARD_SETTINGS_COPY`.
- Produces: `<DashboardSettingsForm />`; `/setup` renders the real form.

- [ ] **Step 1: Lay out the grid**

Spec §2: rows are `strip` frames at `x=32`, `w=1624`, `h=54`, vertical rhythm 86px; controls at `x=24` and `x=316`, each `w=260`. That is a two-column grid with a 292px pitch. Implement it as rows of two columns rather than a CSS grid over the whole form, so a full-width control (the tree select's chip row) can span when needed.

```tsx
function Strip({ children }: { children: ReactNode }) {
  return <div className="mb-[32px] flex h-[54px] gap-[32px] pl-[24px]">{children}</div>
}
```

`mb-[32px]` plus `h-[54px]` gives the 86px rhythm. Verify the resulting row positions against B1 and correct the numbers if they drift.

Field order — read it off B1 (`10489:76487`) rather than the spec §3 table, which is a list, not a layout. Nine controls: Account Number, Company Name, Display Name, Automatically Add Contracts, Valid Company Names, Contract Type, User Email, Sign Up For Learning Series, Company Logo.

- [ ] **Step 2: Wire each control to the store**

Every control is controlled by `useWizardStore`. No local form state.

```tsx
const form = useWizardStore((s) => s.form)
const setField = useWizardStore((s) => s.setField)
const runLookup = useWizardStore((s) => s.runLookup)
```

- Account Number: `onBlur={runLookup}` — this is what opens the Existing Dashboards modal (spec §5). It is the only place `runLookup` is called from the form.
- Company Name: `Select`, placeholder `Select compony name...` (typo intact). Map the fixture to `SelectOption`s, tagging `Account` blue:
  ```tsx
  options={COMPANY_NAMES.map((c) => ({
    id: c.id, label: c.label, badge: c.kind,
    badgeTone: c.kind === 'Account' ? 'blue' : 'grey',
  }))}
  ```
  `form.companyName` stores the **option id**. Anywhere the name is displayed, resolve it via `COMPANY_NAMES.find(c => c.id === form.companyName)?.label`.
- Display Name: per the Overview copy it *defaults to the chosen Company Name*. Implement as: when `companyName` changes and `displayName` is empty or still equals the **label** of the previously selected option, set `displayName` to the new option's label. Do not overwrite a value the user typed themselves. Compare labels, not ids — two options share the label `Euro Car Parts`, so switching between them must not clobber the display name.
- Automatically Add Contracts: `RadioGroup`, options `[{label:'No',value:'no'},{label:'Yes',value:'yes'}]` in the Figma's order, default `yes`.
- Valid Company Names: `TreeSelect` over `COMPANY_TREE`.
- Contract Type: `MultiSelect` over `CONTRACT_TYPES`.
- User Email: `Input type="email"`.
- Sign Up For Learning Series: `Checkbox`, unchecked by default.
- Company Logo: `UploadButton`.

- [ ] **Step 3: Wire the footer**

Spec §3: the button is labelled **`Submit`**, not `Next`, and is disabled until the form is valid.

```tsx
const isValid = useWizardStore(selectIsFormValid)
const submit = useWizardStore((s) => s.submit)
// footer: <Button variant="outline" onClick={() => navigate('/')}>Back</Button>
//         <Button variant="primary" disabled={!isValid} onClick={submit}>Submit</Button>
```

- [ ] **Step 4: Verify against B1, B2 and B7**

`/setup`, side by side with each frame:
1. **B1 `10489:76487`** — all fields empty, two-column grid, row positions and control widths match, `Submit` greyed out.
2. **B2 `8135:2690`** — clicking `No` on Automatically Add Contracts matches the frame.
3. **B7 `10489:78667`** — fill everything (account `189189189`, company `Euro Car Parts`, a display name, tree selections, contract types `IOT Mobile Computer` + `IOT Printer`, a valid email, a logo). `Submit` becomes enabled and the filled layout matches the frame.
4. Submit stays disabled if the email is malformed, if no contract type is picked, or if no company name is selected — test each individually.
5. Choosing a Company Name populates Display Name; typing over it and then changing Company Name does **not** clobber the typed value.
6. Console clean.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: dashboard settings form wired to store (B1, B2, B7)"
```

---

## Task 13: Loading and success overlays (covers B9, B10 — 2 screens)

`10489:79600` and `10489:79811`. Spec §5: submit → loading overlay ~2.5s with progress 0→100 → success overlay, with no click in between.

**Files:**
- Create: `src/components/wizard/LoadingOverlay.tsx`, `src/components/wizard/SuccessOverlay.tsx`, `src/content/overlays.ts`
- Modify: `src/routes/DashboardSettings.tsx`

**Interfaces:**
- Consumes: `useWizardStore` (`status`, `progress`).
- Produces: `<LoadingOverlay progress={number} />`, `<SuccessOverlay />`, `OVERLAYS_COPY`.

- [ ] **Step 1: Build the overlays**

Both are `absolute inset-0` over a scrim inside the 1920×1080 canvas — **not** `fixed`, and not React portals to `document.body`, which would escape the scaled canvas and render at the wrong size.

The progress driver already exists in `store.submit()` (Task 5) — the overlays are pure renderers of `progress`. Do not add a second timer.

Put both overlay strings in `src/content/overlays.ts` transcribed from the frames.

- [ ] **Step 2: Reproduce the "37% Complete" text on the success overlay**

Node `10489:79811` reads "37% Complete" on what is a *success* screen. Spec §7.6 flags this as a probable designer bug. **Reproduce it verbatim** — client copy is not silently corrected — and make sure it is already listed in the escalation section of `docs/figma-capture.md` from Task 2 Step 4. If the client answers before this task runs, follow their answer instead.

- [ ] **Step 3: Render them from `/setup`**

```tsx
const status = useWizardStore((s) => s.status)
const progress = useWizardStore((s) => s.progress)
// ...inside the shell, after the form:
// {status === 'submitting' && <LoadingOverlay progress={progress} />}
// {status === 'done' && <SuccessOverlay />}
```

- [ ] **Step 4: Verify against B9 and B10**

1. Fill the form validly, click `Submit`. The loading overlay appears immediately, the progress reading climbs 0→100 over roughly 2.5s, and the success overlay replaces it **with no further click**.
2. The overlay is centred within the 1920 canvas and scales with it — resize the window mid-run and confirm it stays put and stays proportional.
3. Side-by-side: B9 `10489:79600` and B10 `10489:79811` match, including "37% Complete" on the success frame.
4. Double-clicking `Submit` does not start two runs (the `status !== 'idle'` guard in the store).
5. Console clean; no React state-update-after-unmount warning when navigating away mid-run.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: loading and success overlays (B9, B10)"
```

---

## Task 14: Tag, Modal and DataTable primitives

Prerequisites for the Existing Dashboards modal. Split from Task 15 so the table can be checked against the frame before the flow logic lands on top of it.

**Files:**
- Create: `src/components/ui/Tag.tsx`, `src/components/ui/Modal.tsx`, `src/components/ui/DataTable.tsx`

**Interfaces:**
- Consumes: tokens, `SupportedAction` (Task 5).
- Produces:
  - `<Tag variant={SupportedAction} />` — `Upgrade` green outline, `None` grey outline, `Add Licenses` amber outline
  - `<IconButton icon={ReactNode} label={string} badge?={number} onClick? disabled? />` — square icon-only button with an optional numeric badge
  - `<Modal open onClose title children footer />` — absolute scrim + panel inside the canvas
  - `<DataTable columns rows selectedId onSelect />` generic over a row type with an `id`

- [ ] **Step 1: Build Tag**

Three outline variants, colours from the `--color-viq-tag-*` tokens extracted in Task 2. The variant name *is* the label text (spec §1 Row F).

- [ ] **Step 2: Build IconButton**

Used by the Existing Dashboards modal's filter / search / download action group (Task 15), and by the tree select's funnel where a badge is needed. `label` becomes `aria-label` — an icon-only button with no accessible name fails the Lighthouse a11y target in spec §8.

```tsx
// src/components/ui/IconButton.tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface IconButtonProps {
  icon: ReactNode
  /** Accessible name. Required — icon-only buttons must have one. */
  label: string
  /** Rendered as a corner badge when > 0. Figma shows `1` and `3`. */
  badge?: number
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function IconButton({ icon, label, badge, onClick, disabled, className }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-8 w-8 items-center justify-center rounded-viq-control',
        'text-viq-icon-muted hover:bg-viq-surface-hover disabled:opacity-40',
        className,
      )}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] rounded-full bg-viq-primary px-1
                         text-[10px] leading-4 text-white">
          {badge}
        </span>
      )}
    </button>
  )
}
```

Retrofit the tree select's funnel button (Task 9) to use this rather than keeping a second badge implementation.

- [ ] **Step 3: Build Modal**

`absolute inset-0 z-50` scrim + a centred panel positioned with `absolute`. Escape closes; clicking the scrim closes. **No `fixed`, no portal to `document.body`** — see Global Constraints. Trap focus within the panel and restore it to the trigger on close.

- [ ] **Step 4: Build DataTable**

```tsx
export interface Column<T> {
  key: string
  header: string
  /** Optional header adornment — the Supported Actions column carries an Info icon. */
  headerIcon?: ReactNode
  render: (row: T) => ReactNode
}

export interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  rows: T[]
  selectedId?: string | null
  onSelect?: (id: string) => void
}
```

Three visual row states, from the F and G frames: default, hover (light grey fill), and a **hover-revealed trailing action cell**.

v4 established there is no data-bearing 6th column. Instead the table takes an optional `rowAction` render prop that draws into a trailing cell **only while the row is hovered**, and only when it returns something:

```ts
  /** Rendered in a trailing cell on row hover. Return null to show nothing. */
  rowAction?: (row: T) => ReactNode
```

Reserve the trailing cell's width permanently so revealing the button does not reflow the row.

- [ ] **Step 5: Verify**

Render all four on the sandbox route with throwaway data, against `screens/F2b_modal-detail-zoom__10489-82761.png`:
1. The three Tag variants match the frame's outline colours — `Upgrade` green, `None` grey, `Add Licenses` amber — and are pill-shaped outlines, not filled.
2. The Modal centres inside the scaled canvas over a **page-wide white scrim that washes out the form behind rather than darkening it** (F2), radius ~8, and closes on Escape and scrim click.
3. Row hover paints light grey and reveals the trailing action cell; a row whose `rowAction` returns null hovers grey with no button, and the row does not reflow.
4. Column headers read `Company`, `Partner`, `Supported Actions` (with an info icon), `Region`, `Contract type` — note the lowercase `t` in `Contract type`, as drawn.
Remove the throwaway render before committing. Console clean.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: tag, icon button, modal and data table primitives"
```

---

## Task 15: Existing Dashboards modal (covers Rows F and G — 9 screens)

F1–F6 (`10489:81290`, `10489:82761`, `10489:83067`, `11134:11303`, `11134:11613`, `11134:11999`) and G1–G3 (`10489:81444`, `10489:82718`, `10489:83024`).

**One component, driven by data.** Spec and CLAUDE.md both forbid forking it into three-result and one-result variants.

**Files:**
- Create: `src/components/wizard/ExistingDashboardsModal.tsx`, `src/content/existingDashboards.ts`
- Modify: `src/routes/DashboardSettings.tsx`

**Interfaces:**
- Consumes: `Modal`, `DataTable`, `Tag`, `IconButton`, `useWizardStore` (`lookup`, `isModalOpen`, `selectedExistingDashboardId`, `dismissModal`, `selectExistingDashboard`, `createNewDashboard`).
- Produces: `<ExistingDashboardsModal />` (reads the store directly — it has no props).

- [ ] **Step 1: Write the copy module**

The **title and body live in `accountLookup`** (Task 5), because F and G word them differently. Only the shared chrome belongs here.

```ts
// src/content/existingDashboards.ts
export const EXISTING_DASHBOARDS_COPY = {
  sectionHeading: 'Existing Dashboards',
  createNew: 'Create a New Dashboard',
  columns: {
    company: 'Company',
    partner: 'Partner',
    supportedActions: 'Supported Actions',
    region: 'Region',
    contractType: 'Contract type', // lowercase 't', as drawn
  },
} as const
```

- [ ] **Step 2: Build the modal**

Structure from `screens/F2b_modal-detail-zoom__10489-82761.png`, top to bottom: title; body paragraph; a section heading line with the action icon group right-aligned; the table; `Create a New Dashboard` (outline) bottom-right.

Geometry: modal ~1055×390 for the three-row case, radius ~8, centred, over a **page-wide white scrim** — the form behind stays visible but washed out. G's modal is shorter (~310px) because it sizes to its rows; do not hard-code a height.

```tsx
export interface ExistingDashboardsModalProps {
  open: boolean
  title: string
  body: string
  rows: Dashboard[]
  onAction: (row: Dashboard) => void
  onCreateNew: () => void
  onClose: () => void
}
```

**Action icon group:** build filter / search / download and hide what a given state does not use. `F2b` shows search + download only; other frames show a filter icon with a `3` badge. Drive with `showFilter` / `showSearch` / `showDownload` props — do not fork the component. The icons are inert in this prototype.

**The trailing action cell** is the v4 answer to the old "6th column" question:

```tsx
rowAction={(row) =>
  row.supportedAction === 'None' ? null : (
    <Button variant="outline">{row.supportedAction}</Button>
  )
}
```

The button's label **is** the row's supported action — `Upgrade` on the Albert Heijn row (F3), `Add Licenses` on Ahold Delhaize (F5). The `None` row (F4) hovers grey and shows **no button**: hoverable, not actionable. Derive from the action value, never from hover alone.

- [ ] **Step 3: Wire it to the store**

```tsx
const open = useWizardStore((s) => s.isModalOpen)
const lookup = useWizardStore((s) => s.lookup)
// title={lookup?.copy?.title ?? ''} body={lookup?.copy?.body ?? ''} rows={lookup?.existing ?? []}
```
Row action → `selectExistingDashboard(row.id)`. `Create a New Dashboard` → `createNewDashboard()`, which dismisses and continues as the happy flow (spec §5).

- [ ] **Step 4: Verify all nine frames**

At `/setup`, each against its PNG in `wizard-spec-files/screens/`:
1. **F1** — type `333333333`, do not blur: the form is B1 plus a value in field 1, `Submit` disabled.
2. **F2** — blur: the modal opens over the washed-out white scrim with three rows. Title `Existing Dashboards Detected`, body verbatim. Rows read `Albert Heijn`/`Zebra`/`Upgrade`/`EMEA`/`OneCare`, `Albert CZ`/`Kodys`/`None`/`EMEA`/`OneCare`, `Ahold Delhaize`/`Zebra`/`Add Licenses`/`EMEA`/`Foresight IOT`. Compare against `F2b_` for detail.
3. **F3** — hover the Albert Heijn row: grey fill **and** an `Upgrade` outline button at the right edge.
4. **F4** — hover the Albert CZ row: grey fill, **no button**. This is the one that catches a hover-driven implementation.
5. **F5** — hover the Ahold Delhaize row: an `Add Licenses` button.
6. **F6** — hover `Create a New Dashboard`: light grey fill.
7. **G1** — refresh, type `111111111`.
8. **G2** — blur: **different copy** — title `Existing Direct OneCare Dashboard Detected`, body `A direct OneCare dashboard already exists…`. One row, `Albert Heijn`/`Zebra`/`Upgrade`/`EMEA`/`OneCare`. The modal is shorter (~310px) with no layout collapse.
9. **G3** — hover that row: the `Upgrade` button appears, same mechanic as F3.
10. Type `189189189` and blur: **no modal** — the happy flow is untouched.
11. `Create a New Dashboard` dismisses and leaves the form editable with the account number still filled.
12. Escape and scrim click both close the modal.
13. Confirm by inspection that `ExistingDashboardsModal.tsx` is one component with no branch on `rows.length`, and that `accountLookup` is still the only place comparing an account number:

```bash
grep -rn "189189189\|333333333\|111111111" src/ --include=*.tsx --include=*.ts
```
Expected: hits in `src/mocks/accountLookup.ts` and `src/flow/screens.ts` only.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: data-driven existing dashboards modal (rows F and G)"
```

---

## Task 16: Review and edit mode — R3 layout (covers E2, E3, R3 — 3 screens)

Reference PNGs: `screens/R3_review-logo-left__10680-16436.png` (review), `screens/E2_edit__10489-80942.png` and `screens/E3_edit-variant__10489-80741.png` (edit).

**Scope decision, from the user: only `R3` ships.** `E1`/`R1` (boxed cards), `R2` (hairline dividers) and `R4` (logo top-left) are three other arrangements of the same screen and are **not built**. Task 17 records that in the handover.

Dev note from the Figma canvas (`9082:6667`), verbatim:
> "When entering the 'self onboarding area' once again - after finishing the initial set up - the dashboard settings will be in review mode: no stepper at the top clear overview of the data. editing will be possible through edit button"

**Files:**
- Create: `src/components/wizard/ReviewRow.tsx`, `src/components/wizard/ReviewLogoPanel.tsx`, `src/routes/DashboardSettingsReview.tsx`, `src/content/review.ts`
- Modify: `src/routes/DashboardSettings.tsx`

**Interfaces:**
- Consumes: `useWizardStore` (`mode`, `enterEdit`, `cancelEdit`, `saveEdit`), `ChipGroup`, `rollUpSelection`, `WizardShell`, `COMPANY_NAMES`.
- Produces: `<ReviewRow label value note? />` where `value: ReactNode`; `<ReviewLogoPanel logo companyName accountNumber />`; `<DashboardSettingsReview />`.

- [ ] **Step 1: Build the R3 layout skeleton**

Two columns, from the frame:

- **Left:** a bordered logo card (~130×130) holding the logo image, with the **company name in bold** and the **account number** stacked beneath it — in the frame, `Euro Car Parts` then `189189189`.
- **Right:** a single column of label-above-value rows, each separated by a hairline rule.

`R3` **drops `Account number`, `Company name` and `Automatically add contracts`** from the row list — the first two move under the logo, and the third becomes a right-aligned note reading `Contracts automatically added`, sitting on the same line as the Display name value.

Rows shown on the right, in order: `Display name`, `Valid company names`, `Contract type`, `User email`.

- [ ] **Step 2: Build ReviewRow**

Label **above** value (not beside it — that was the E1 arrangement), with an optional right-aligned note.

```tsx
// src/components/wizard/ReviewRow.tsx
import type { ReactNode } from 'react'

export interface ReviewRowProps {
  label: string
  value: ReactNode
  /** Right-aligned note on the value line. R3 uses it for 'Contracts automatically added'. */
  note?: string
}

export function ReviewRow({ label, value, note }: ReviewRowProps) {
  return (
    <div className="border-b border-viq-border py-3">
      <div className="text-xs text-viq-text-muted">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-4">
        <div className="text-sm font-medium text-viq-text">{value}</div>
        {note && <span className="text-xs text-viq-text-muted">{note}</span>}
      </div>
    </div>
  )
}
```

No per-row pencil icon — `R3` has none. Editing is reached from the footer (Step 4).

- [ ] **Step 3: Render the values**

- `Display name` — `form.displayName`, with `note="Contracts automatically added"` when `form.automaticallyAddContracts === 'yes'`.
- `Valid company names` — `<ChipGroup labels={rollUpSelection(COMPANY_TREE, new Set(form.validCompanyNames))} max={4} />`. The frame shows four chips then `+30`, so `max={4}` here, against the form's `max={2}`.
- `Contract type` — a chip row of `form.contractTypes`, no overflow in the frame.
- `User email` — `form.userEmail` rendered verbatim. **Do not normalise casing**; the frames differ only because two different strings were typed.
- Logo panel — the uploaded image, or the frame's `logoipsum` placeholder when nothing was uploaded.

Per the dev note, review mode has **no stepper** above the title. Confirm nothing renders there.

- [ ] **Step 4: Footer, and the missing edit control**

`R3`'s footer is `Done` (primary blue, right-aligned) and nothing else. But edit mode exists (`E2`, `E3`) and the dev note requires reaching it, so **add an `Edit` control to the left of `Done`** — the one deliberate addition to the frame in this build. Flag it to the designer via `docs/figma-capture.md`.

Edit mode's own footer, from `E2`/`E3`: `✕ Cancel` (outline) + `Edit` (primary). The primary really is labelled `Edit`, not `Save` — spec §7.6 calls it a likely slip. **Reproduce it verbatim** and list it as a copy bug; do not quietly rename it to `Save`.

Wiring: `Edit` (from review) → `enterEdit()`; `✕ Cancel` → `cancelEdit()` (restores the snapshot); the primary `Edit` in edit mode → `saveEdit()`. The store already holds the snapshot — do not add a second copy of the form.

- [ ] **Step 5: Wire the mode switch**

```tsx
// src/routes/DashboardSettings.tsx
const [params] = useSearchParams()
const mode = useWizardStore((s) => s.mode)
const isReview = params.get('mode') === 'review' && mode === 'review'
```
Entering `/setup?mode=review` sets `mode` to `'review'`.

- [ ] **Step 6: Verify against R3, E2 and E3**

1. Fill the form at `/setup`, submit through to success, then go to `/setup?mode=review`.
2. Side by side with `screens/R3_review-logo-left__10680-16436.png`: logo card left with company name bold and account number beneath; four rows right with hairline rules; `Contracts automatically added` right-aligned on the Display name line; `Done` bottom-right in primary blue.
3. `Account number`, `Company name` and `Automatically add contracts` do **not** appear as rows.
4. No stepper above the title.
5. `Valid company names` shows four chips then `+N`; with the full tree selected N reaches the high twenties/thirties, matching the frame's `+30`.
6. The `Edit` control (the added one) enters edit mode; the footer becomes `✕ Cancel` + `Edit`, matching `E2`/`E3` with values populated.
7. Change a value → `✕ Cancel` → the original is back. Change a value → `Edit` (primary) → the new value shows in review.
8. Email renders exactly as typed, in whatever casing.
9. Console clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: R3 review layout and edit mode (E2, E3, R3)"
```

---

## Task 17: Guided flow — every screen in one click-through

**The client-facing deliverable the user asked for:** one route that walks every built screen in canvas order, driving the real app into each state. Prev / Next plus a jump list. Nothing to type, nothing to remember.

**Files:**
- Create: `src/flow/screens.ts`, `src/flow/demoState.ts`, `src/routes/Flow.tsx`, `src/components/wizard/FlowBar.tsx`
- Modify: `src/router.tsx`, and every component that owns a hover or open/closed state (see Step 2)

**Interfaces:**
- Consumes: `useWizardStore`, every route and component built so far.
- Produces: `FLOW_SCREENS: FlowScreen[]`; `useDemoStore`; route `/flow` and `/flow/:screenId`.

- [ ] **Step 1: Define the screen registry**

One entry per built screen. `setup` drives the app into that state; it runs after the route change.

```ts
// src/flow/screens.ts
export interface FlowScreen {
  /** Matches the screens/ filename prefix: 'B06', 'F4', 'R3'. */
  id: string
  label: string
  /** Figma node id, for the side-by-side. */
  node: string
  /** Filename in wizard-spec-files/screens/. */
  png: string
  route: string
  /** Puts the app into this exact state. Must be idempotent. */
  setup: () => void
}
```

**31 entries.** That is the 35 UI frames in spec §9 minus `E1`, `R1`, `R2` and `R4` (the three unbuilt review layouts plus `E1`, which is `R1`'s arrangement), and excluding `E4`, a Figma sticky note rather than a screen. Order them exactly as the canvas reads: `A1`, `B01`–`B10`, `C1`–`C5`, `D1`–`D3`, `E2`, `E3`, `F1`–`F6`, `G1`–`G3`, `R3`.

- [ ] **Step 2: Add the demo-override store**

Hover states and open dropdowns are component-local, so the flow cannot reach them through the wizard store. Add a tiny separate store that components **OR** into their own state.

```ts
// src/flow/demoState.ts
import { create } from 'zustand'

interface DemoState {
  /** e.g. 'field:accountNumber', 'chip:ecp', 'row:acz', 'button:createNew', 'logo'. */
  hover: string | null
  /** e.g. 'select:companyName', 'tree', 'filterPanel', 'tooltip:accountNumber'. */
  open: string | null
  /** Seeds TreeSelect's applied country filter via its `defaultCountries` prop (Task 9). */
  countries: string[] | null
  set: (patch: Partial<Pick<DemoState, 'hover' | 'open' | 'countries'>>) => void
  clear: () => void
}

export const useDemoStore = create<DemoState>((set) => ({
  hover: null,
  open: null,
  countries: null,
  set: (patch) => set(patch),
  clear: () => set({ hover: null, open: null, countries: null }),
}))
```

**The rule every component follows:** the override is additive and never subtractive.

```tsx
const forced = useDemoStore((s) => s.hover === 'field:accountNumber')
const isHovered = localHover || forced
```

Never `const isHovered = forced`. Outside the flow both values are null, so normal behaviour is untouched — verify that explicitly in Step 5.

This is the one place the demo apparatus reaches into product components. Keep it to a boolean OR per component; no other flow logic may live in `components/`.

- [ ] **Step 3: Build the flow bar and route**

```tsx
// src/routes/Flow.tsx — /flow/:screenId, defaulting to the first screen
```
On mount and on every `screenId` change: `useWizardStore.getState().reset()`, `useDemoStore.getState().clear()`, then navigate to `screen.route` and run `screen.setup()`. Resetting first is what makes any screen reachable directly by URL, in any order — the jump list depends on it.

`FlowBar` renders above the canvas (outside `ScaleToFit`, so it does not scale): `‹ Prev`, `N / 31`, `Next ›`, the current screen's `id · label`, and a jump dropdown listing all 31. Bind `←` / `→` to Prev / Next. Deep-link each screen as `/flow/B06`.

- [ ] **Step 4: Write the `setup` functions**

Each is a few lines against the two stores. Examples covering each kind:

```ts
// B01 — default form
{ id: 'B01', route: '/setup', setup: () => {} },

// B02 — automatically add contracts set to No
{ id: 'B02', route: '/setup', setup: () => {
    useWizardStore.getState().setField('automaticallyAddContracts', 'no')
  } },

// B03 — field hover
{ id: 'B03', route: '/setup', setup: () => {
    useDemoStore.getState().set({ hover: 'field:accountNumber' })
  } },

// B06 — 3-tier dropdown open
{ id: 'B06', route: '/setup', setup: () => {
    useDemoStore.getState().set({ open: 'tree' })
  } },

// C5 — filters applied, badge on the funnel
{ id: 'C5', route: '/setup', setup: () => {
    useDemoStore.getState().set({ open: 'tree', countries: ['Canada'] })
  } },

// F4 — hover the None row
{ id: 'F4', route: '/setup', setup: () => {
    const w = useWizardStore.getState()
    w.setField('accountNumber', '333333333')
    w.runLookup()
    useDemoStore.getState().set({ hover: 'row:acz' })
  } },

// R3 — review
{ id: 'R3', route: '/setup?mode=review', setup: () => {
    useWizardStore.setState({ form: FILLED_FORM, mode: 'review' })
  } },
```

Add a `FILLED_FORM` constant to `src/flow/screens.ts` matching `B07`: account `189189189`, company `Euro Car Parts`, display name `Euro Car Parts`, email `Useremail@gmail.com`, contract types `IOT Mobile Computer` + `IOT Printer`, and enough tree selections that the overflow chip reads `+30` in `R3`.

`TreeSelect` already exposes `defaultCountries` and `defaultOpen` for exactly this (Task 9 Step 3). Feed them from the demo store; do not duplicate the filter logic and do not reach into component internals.

- [ ] **Step 5: Verify**

1. `/flow` opens at `A1`. `Next` walks all 31 in canvas order; `Prev` walks back. Arrow keys work.
2. **Every screen matches its PNG.** With the flow bar showing `B06 · 3-tier dropdown with search`, open `wizard-spec-files/screens/B06_3tier-dropdown-with-search__10489-78221.png` side by side. Do this for all 31 — this is the moment the whole build gets checked in one pass.
3. Deep links work cold: paste `/flow/F4` into a fresh tab and it lands on the hovered-`None` row with no button, without visiting anything first.
4. Jumping backwards works: `R3` → `B01` shows a clean empty form, not leftover review data. That is the `reset()` in Step 3.
5. **Normal use is unaffected:** go to `/setup` directly, with no flow involved, and confirm hovering and dropdowns behave exactly as before. Then check nothing forces a state:

```bash
grep -rn "useDemoStore" src/components src/routes | grep -v "||"
```
Expected: only the import lines. Every usage site should be an `||`.
6. Console clean on every screen.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: guided flow walking all 31 built screens"
```

---

## Task 18: Client handover — demo card, copy-bug list, full audit, deploy

Closes out spec §8's verification checklist and the deliverables CLAUDE.md and spec §7.5 promise the client.

**Files:**
- Create: `docs/demo-card.md`, `docs/copy-bugs.md`
- Modify: `README.md`
- Delete: the `/sandbox/tree-select` route **only if** the client-facing build should not carry it — see Step 4

**Interfaces:**
- Consumes: everything.
- Produces: a deployed Vercel URL and two handover documents.

- [ ] **Step 1: Write the demo card**

Spec §7.1 asks for this so nobody has to remember the numbers mid-demo.

```markdown
# VisibilityIQ Guided Setup — demo card

Prototype only. No backend. Refreshing the page resets everything.

| Type this account number | You get |
|---|---|
| `189189189` | No existing dashboards — the happy flow, straight through to Submit |
| `333333333` | Three existing dashboards — the "Existing Dashboards Detected" modal |
| `111111111` | One existing OneCare dashboard — the single-result modal |

Enter the number in **Account Number** and click out of the field (the lookup runs on blur).

Review mode: add `?mode=review` to the setup URL.

**To see every screen in one pass:** open `/flow`. Prev / Next (or the ← → keys) walk all 31
screens in the order they appear on the Figma canvas; the dropdown jumps straight to any one.
```

- [ ] **Step 2: Write the copy-bug list for the client**

Spec §7.5 — every typo reproduced in the build, with where it appears, so the client can rule on each one. Include the Success-overlay "37% Complete" question (§7.6) and the sidebar-contrast question (§7.7) at the bottom under "Design questions". Pull the exact strings from `docs/figma-capture.md`.

At minimum: `confgure`, `notifed`, `identifer`, `data fow`, `service ofer`, `refect`, `Select compony name...`, `Euro Car Parts Irland`, `LKG Corporation` in the Company Name dropdown where the tree says `LKQ`, and **`input felds`** in the Overview intro paragraph — this last one was found during the build by transcribing the frame directly; it appears in no earlier spec list.

Design questions to list alongside them: the success overlay has no dismiss control (§7.8); edit mode's primary button reads `Edit`, not `Save` (§7.6); the email appears as `Useremail@gmail.com` in the form frames and `Useremail@Gmail.Com` in `R3` (§7.7); sidebar items 2–7 are inert but full-contrast (§7.9); `R3` has no edit control of its own.

Then confirm each one is genuinely present in the shipped build:

```bash
grep -rn "confgure\|notifed\|identifer\|data fow\|service ofer\|refect\|compony\|Irland" src/content src/mocks
```
Expected: every listed typo returns at least one hit. A typo with zero hits was silently corrected somewhere — fix it.

- [ ] **Step 3: Run the full spec §8 checklist**

Work through it in the running app and record the result of each line in the commit message or a scratch note:

- [ ] Every built screen reproduced at 1920×1080, side by side with its PNG in `wizard-spec-files/screens/` — 31 of the 35 UI frames. **Walk `/flow` end to end to do this in one pass.**
- [ ] The four not built are `E1`, `R1`, `R2`, `R4` — the three review layouts the user did not pick, plus `E1`, which is `R1`'s arrangement. Recorded in the handover, not silently dropped
- [ ] All 31 screens reachable from `/flow`, and each deep link (`/flow/<id>`) works cold
- [ ] Tree select: parent/child/indeterminate, search, country filter with badge, `+N` overflow chip
- [ ] Submit disabled until all required fields valid; enabled state matches B7
- [ ] Loading → success runs without a click
- [ ] Review mode reachable and matches the right-hand column screens
- [ ] Existing Dashboards modal: three-row (F) and single-row (G), row hover, row selected, `Create a New Dashboard` returns to the happy flow
- [ ] All three seeded account numbers reach their intended path
- [ ] All hover states present (field, chip, logo, buttons, info icons)
- [ ] No horizontal scroll at any window size — the scale-to-fit wrapper handles it
- [ ] No console errors on any screen
- [ ] Lighthouse accessibility ≥ 90 (run against the production build, not the dev server)

Then verify the two structural constraints hold:

```bash
grep -rn "localStorage\|sessionStorage\|fetch(\|axios" src/     # expected: no matches
grep -rn "position: fixed\|\bfixed\b" src/components src/routes # expected: no matches inside the canvas
```

- [ ] **Step 4: Decide the sandbox route**

`/sandbox/tree-select` is a dev aid, unlinked but reachable by URL in production. `/flow` is deliberately client-facing and stays. Keep the sandbox too unless the build must be clean — **ask the user** rather than deciding. If it stays, note it in the README.

- [ ] **Step 4b: Write the scope note for the client**

Add to `docs/copy-bugs.md`, under a `Scope` heading: the Figma section carries four different review-mode arrangements (`E1`/`R1` boxed cards, `R2` dividers, `R3` logo-left, `R4` logo-top). **`R3` was chosen and built; the other three were not.** State it plainly — the client should not discover it by counting frames. Note also the one deliberate addition to `R3`: an `Edit` control beside `Done`, without which edit mode is unreachable.

- [ ] **Step 5: Rewrite the README**

Replace the Vite scaffold text with: what this is (frontend prototype, no backend, resets on refresh), `npm install` / `npm run dev` / `npm run build`, the three demo account numbers, a pointer to `wizard-spec-files/WIZARD-SPEC.md` and `docs/`, and the fixed-1920-with-scale-to-fit decision.

- [ ] **Step 6: Build and deploy**

```bash
npm run build
npx vercel --prod
```
Then, on the deployed URL, confirm the one failure mode that matters (CLAUDE.md): open `<url>/setup` directly and hard-refresh it. Expected: the app loads, **not** a 404. If it 404s, `vercel.json` is not being picked up — fix it before handing over the link.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "docs: demo card, copy bug list and README for client handover"
```

---

## Verification summary — screens to tasks

| Row | Frames | Built | Task |
|---|---|---|---|
| A — Overview | 1 | 1 | 4 |
| B — Happy flow | 10 | 10 | B01/B02/B07 → 12; B03/B04 → 6; B05 → 7; B06 → 8; B08 → 10 + 11; B09/B10 → 13 |
| C — Filter flow | 5 | 5 | 9 |
| D — Tooltip | 3 | 3 | 6 |
| E — Review and Edit | 3 | 2 | E2, E3 → 16. **E1 not built** (R1's arrangement) |
| F — Existing Dashboards, 3 types | 6 | 6 | 15 (primitives in 14) |
| G — Existing Dashboards, single | 3 | 3 | 15 |
| Review column | 4 | 1 | R3 → 16. **R1, R2, R4 not built** (user picked R3) |
| **Total UI frames** | **35** | **31** | all 31 walked by `/flow` (Task 17) |

`E4` (`9082:6667`) is a Figma sticky note, not a screen — its content is quoted in Task 16.

The four unbuilt frames are a deliberate, user-approved scope decision, recorded in Task 18's handover. Everything else in spec §9 ships.
