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

Two modes, switched on viewport width at 1024 (`src/components/wizard/ScaleToFit.tsx`, `CANVAS_MIN_WIDTH`):

- **≥ 1024 — canvas mode. This is the app's original, unmodified behaviour, and it covers every desktop and laptop size.** The 1920-wide design canvas, scaled uniformly by `viewportWidth / 1920`, with its height derived from the viewport so the UI fills the window with no letterbox bars. Composition, spacing and proportions are the Figma frames exactly; nothing reflows and nothing scrolls that would not also scroll at 1920×1080. At exactly 1920 the scale is 1 and the app is pixel-identical to the frames, which is where `tools/fidelity` captures.
- **< 1024 — responsive mode.** No transform. Real layout against the real viewport, driven by the fluid `--viq-*` tokens at the bottom of `src/styles/tokens.css` plus three structural breakpoints. The Figma has no frames below 1024 and this range needs to exist: at 375px the canvas would scale to 0.195, putting 14px body text under 3px.

**Why the switch is exactly 1024, and why nothing may key off a wider breakpoint.** CSS media queries measure the viewport and know nothing about the canvas. In canvas mode at a 1190px window the layout is 1920 design px wide while every `lg:`/`md:`/`sm:` query still evaluates against 1190. Pinning the switch to Tailwind's `lg` makes all of those prefixes true for the whole of canvas mode, so desktop is unconditionally the design. A prefix keyed to a *wider* breakpoint — `2xl:`, say — would fire late and reflow a canvas that has plenty of room. `lib/useMediaQuery`'s `CANVAS_QUERY` must stay equal to `CANVAS_MIN_WIDTH` for the same reason.

Verified: at 1024, 1190, 1440, 1920 and 2560, all 15 captured flow screens render **0.000% differing pixels** against the pre-responsive build. The single exception is `E2` at 0.013%, which is the intended `Edit` → `Save` button copy. Desktop was not touched.

The three structural breakpoints, all below the canvas threshold or coincident with it:

| At | Below it | From it up |
| --- | --- | --- |
| `lg` (1024) | nav is a slide-in drawer opened from the top strip; the review layouts stack; the country filter is a centred sheet; the modal's table scrolls sideways | canvas mode: the 232px rail, logo card beside the rows, the frame-exact filter popover |
| `md` (768) | the form's two field slots stack, capped at 420px | side by side, 260px each |
| `sm` (640) | footer buttons share the row; the filter sheet's panes stack; a review row's value and note wrap | the frame's right-aligned pair and side-by-side panes |

Sizes never step — they ramp, and only below 1024. Every `--viq-*` token equals its measured Figma constant from 1024 up (asserted at eight widths by `tools/responsive/sweep.mjs`), and below 1024 each ramps smoothly from a 375px-wide / 700px-tall floor to that constant, reaching it at the 1024 boundary so nothing jumps as the query releases. Horizontal measurements ramp on `vw`; vertical rhythm ramps on `vh`, because what makes a short window scroll is its height.

The `position: fixed` ban still holds in both modes — see `ScaleToFit`'s comment for why keeping one code path matters more than the freedom responsive mode would technically allow.

## Documentation

- `wizard-spec-files/WIZARD-SPEC.md` — Spec §1–§9, the complete functional brief
- `wizard-spec-files/screens/` — PNG renders of all 35 UI frames (31 built, 4 scoped out)
- `docs/demo-card.md` — Quick reference for demo account numbers and routes
- `docs/copy-bugs.md` — Typos reproduced from Figma and design questions for the client
- `docs/figma-capture.md` — Token sampling methodology and per-token sources
- `tools/responsive/README.md` — The responsive sweep: what it asserts and how to run it
- `tools/fidelity/README.md` — Pixel-diff harness against the Figma frames
