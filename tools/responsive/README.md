# Responsive sweep

Checks the app across the viewport range, the way `../fidelity` checks it against
the Figma frames at one size.

## What it asserts

1. **No horizontal overflow**, at every width, on every screen. Only elements
   that actually clip (`overflow-x: hidden`) or scroll (`auto`/`scroll`) are
   flagged — an `overflow-x: visible` box whose absolutely positioned child
   paints past it is not a bug, and the data table's deliberate horizontal
   scroll region is exempted. This is the check that caught the country filter
   panel rendering 900px off-screen when its threshold was briefly `lg`.
2. **The structural breakpoints fire on the right side.** The nav is a static
   rail at ≥1024 and a translated-off drawer below; the form's two field slots
   are side by side at ≥768 and stacked below; the review logo card is beside
   the rows at ≥1024 and stacked below.
3. **Canvas mode engages from 1024 up.** `ScaleToFit` must apply a transform at
   ≥1024 and none below it. This is the check that pins every desktop and
   laptop size to the app's original, untouched rendering.
4. **Every token equals its Figma constant at 1920×1080.** Each `--viq-*` token
   in `src/styles/tokens.css` replaced a constant measured off a frame, and from
   1024 up each one simply *is* that constant — the ramps live inside a
   `max-width: 63.999rem` query and never apply on desktop. This check is what
   makes "the frames are untouched" a measurement rather than a claim.

It also prints a `note` line whenever a screen's scroll region overflows
vertically. That is not a failure — the shell is an app shell with one scrolling
middle region — but it is the number to watch, because it is what makes a
laptop-sized window show a scrollbar.

## Usage

```bash
npm run dev                                  # note which port Vite picks
BASE=http://localhost:5173 node tools/responsive/sweep.mjs
BASE=http://localhost:5173 node tools/responsive/sweep.mjs --shots   # + screenshots
```

Screenshots land in `tools/responsive/shots/` (gitignored).

## Playwright

Like `../fidelity`, this imports `playwright` without it being a project
dependency — the repo bans new deps and these are dev aids, not shipped code. It
resolves because `node_modules/playwright` and `node_modules/playwright-core` are
symlinked to a Playwright install in the npm `_npx` cache, and it drives the
locally installed Chrome via `channel: 'chrome'`. If either tool ever fails with
`ERR_MODULE_NOT_FOUND: playwright`, re-point those two symlinks:

```bash
ls -d ~/.npm/_npx/*/node_modules/playwright        # find an install
ln -sfn <that path>       node_modules/playwright
ln -sfn <that path>-core  node_modules/playwright-core
```

## Verifying the design width by hand

The strongest check on a change to this layout is a before/after pixel diff at
1920×1080, where canvas mode is active: stash the change, screenshot every flow
screen, restore it, screenshot again, and compare. The responsive pass was
signed off that way at 1024, 1190, 1440, 1920 and 2560: all 15 screens came
back bit-identical at every one of them, except `E2`, which carries the
intended `Edit` → `Save` button copy.
