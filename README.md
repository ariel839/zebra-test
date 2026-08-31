# VisibilityIQ Guided Setup — frontend prototype

A click-through frontend prototype with no backend. Page refresh resets all state. Design tokens in `src/styles/tokens.css` were sampled from rendered PNG frames because the Figma variables API was unavailable; swapping in real variables later is a one-file change.

## Setup

```bash
npm install
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # Production build to dist/
```

## Demo accounts

These three account numbers trigger different flows:

- `189189189` — No existing dashboards (the happy flow, straight through to Submit)
- `333333333` — Three existing dashboards (the "Existing Dashboards Detected" modal)
- `111111111` — One existing OneCare dashboard (the single-result modal)

Enter the number in **Account Number** and click out of the field (lookup fires on blur).

## Routes

- `/` — Overview page
- `/setup` — Dashboard settings form; add `?mode=review` for review mode.
  Review reads live store state, so a cold visit shows empty rows — fill the form
  first, or use `/flow/R3` to see it populated.
- `/flow` — Full screen walkthrough (Prev/Next or arrow keys; dropdown for direct access)
- `/sandbox/tree-select` — Tree select component sandbox. A dev aid: unlinked from the UI but
  deliberately kept in the client build, reachable by URL only.

## Display

The design is fixed at 1920 design px wide with a scale-to-fit wrapper (`src/components/wizard/ScaleToFit.tsx`): the canvas is scaled uniformly by `viewportWidth / 1920` and its height is derived from the viewport, so the UI always fills the window completely — no letterbox bars, no responsive breakpoints, no horizontal scroll. Height is free because the shell is flex-based; only width is fixed by design decision.

## Documentation

- `wizard-spec-files/WIZARD-SPEC.md` — Spec §1–§9, the complete functional brief
- `wizard-spec-files/screens/` — PNG renders of all 35 UI frames (31 built, 4 scoped out)
- `docs/demo-card.md` — Quick reference for demo account numbers and routes
- `docs/copy-bugs.md` — Typos reproduced from Figma and design questions for the client
- `docs/figma-capture.md` — Token sampling methodology and per-token sources
