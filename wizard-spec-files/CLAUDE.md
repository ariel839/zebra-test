# Zebra — VisibilityIQ Foresight Guided Setup (frontend prototype)

Read `WIZARD-SPEC.md` before writing any code. `screens/` holds a rendered PNG of every
one of the 36 Figma frames, named by row, state and node id. **Open the matching screenshot
before building a screen, and compare against it before calling the screen done.** The spec's
§10 maps filename prefixes to frames. It is the source of truth for screens,
fields, copy and behaviour, and it carries the Figma node id for every screen.

## What this is

A click-through frontend prototype of a multi-step setup wizard, built from Figma
for a client demo. Deployed to Vercel.

**All 36 screens in the Figma section get built.** Nothing is deferred. The spec's
§1 inventory and §9 audit are the complete build list — if a screen is listed there,
it ships. Hover states, tooltip states and dropdown states count as screens: they are
states of a component, not separate pages, but every one of them must be reachable
and must match its frame.

**There is no backend and there will not be one in this phase.** No API calls, no
fetch, no auth, no database, no localStorage. All data comes from fixtures in
`src/mocks/`. State lives in memory and resets on refresh — that is intended.

## Stack

- Vite + React 19 + TypeScript
- React Router (declarative routes, `createBrowserRouter`)
- Tailwind CSS
- `lucide-react` for all icons — never export icon SVGs from Figma
- Zustand for wizard state (single store, see below)

Do not add: a state library beyond Zustand, a form library unless the tree-select
forces it, a component library that was not agreed, an animation library, i18n,
a test runner beyond Vitest, or any analytics.

## Figma

File key `XseXmXBMoevLAxK3x2VHgY`, page `Dashboard settings_self onboarding`.
`screens/` is the primary visual reference — use it first. The Figma MCP is rate-capped on
this account's seat, so spend calls only on things the screenshots cannot answer (exact
spacing, a token value), using the node ids listed in the spec. Before styling anything, pull design variables with `get_variable_defs`
and write them to `src/styles/tokens.css` as CSS custom properties. Never hardcode a
hex value that exists as a token.

The Figma is fixed-width 1920×1080. Build to that; do not invent responsive
breakpoints without asking.

## Component rules

Components follow the Sisense design language. Check whether an installable
Sisense/Zebra package exists **before** hand-rolling anything — if it does, use it.
If it does not, build local primitives in `src/components/ui/` that match the Figma
exactly and keep their props boring and conventional (`value`, `onChange`,
`disabled`, `placeholder`), so the real library can be swapped in later without a
rewrite.

One component per file. No barrel files. Co-locate a component's types with it.

## State

Single Zustand store, `src/store/wizard.ts`, holding the whole form as one flat
object plus `mode: 'edit' | 'review'` and `status: 'idle' | 'submitting' | 'done'`.

Every read of "does this account already have dashboards" goes through
`src/mocks/accountLookup.ts`, which maps an account number to `{ existing: Dashboard[] }`.
It is the **only** place in the app that branches on the account number — do not scatter
that check into components. Three account numbers are seeded (spec §7.1): one with no
match (happy flow), one with three existing dashboards, one with a single OneCare
dashboard. All three paths must work in the demo.

When a real backend arrives it should be one `submit()` function in the store —
nothing else in the app should know a network exists.

## Copy

The Figma contains real typos ("confgure", "notifed", "identifer", "data fow",
"service ofer", "refect", "Select compony name...", "Euro Car Parts Irland").
**Reproduce them verbatim.** Do not silently correct client copy. They are listed
in §7 of the spec to hand back to the client.

All user-facing strings live in `src/content/`, not inline in JSX, so the client can
be given a single file to review.

## Structure

```
src/
  components/ui/      primitives (Input, Select, TreeSelect, Chip, Tooltip, ...)
  components/wizard/  shell (TopStrip, SideNav, BottomStrip, Overlays)
  routes/             one file per route
  store/wizard.ts
  mocks/              companyTree.ts, contractTypes.ts, accountLookup.ts
  content/            all copy
  styles/tokens.css   generated from Figma variables
```

## Deploy

Vercel, static. `vercel --prod` from the repo root. Add a `vercel.json` rewrite of
`/(.*)` → `/index.html` so deep links do not 404 on refresh — a client clicking a
shared link into `/setup` and getting a 404 is the one failure mode that matters here.

## Working style

- Build one screen end to end and stop, so it can be compared against the Figma
  frame, before moving to the next.
- Build `ExistingDashboardsModal` once and drive both the three-result and
  single-result variants from data. Do not fork it into two components.
- The 3-tier tree select (spec §4) is the expensive piece. Build it in isolation
  with its own route or story before wiring it into the form.
- Never mark a screen done without a side-by-side against its Figma node.
- Ask before deviating from the Figma. "It looked better this way" is not a reason.
