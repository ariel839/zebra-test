# Fidelity harness

Measures the built app against the Figma frames in `wizard-spec-files/screens/`
so "does it match the design?" is a number, not an opinion.

## Why the frames need a crop

The PNGs are Figma *screenshots*, not frame exports: each one shows the grey
Figma canvas, a blue selection outline, and a `1920 x 1080` badge. The real
artboard sits at roughly `(20, 11)` with size `1411 x 795`, and it moves by
±2px per file. `rects.mjs` detects that rect per file into `rects.json`; every
other script maps design px through it. Comparing against the raw PNG instead
puts the whole page ~15px out and 3% oversized, which reads as a hundred small
layout bugs that aren't there.

Two frames carry no artboard and are excluded: `E4` (a dev-notes sticky) and
`F2b` (a zoom crop).

## Usage

```bash
npm run dev                     # must be on http://localhost:5173
node tools/fidelity/rects.mjs                    # once, refreshes rects.json
node tools/fidelity/shoot.mjs B01 B07 R3         # capture /flow/<id> at 1920x1080
node tools/fidelity/score.mjs B01 B07 R3         # mean abs pixel diff + worst cells
node tools/fidelity/diff.mjs B01                 # difference-blend overlay
MODE=stack node tools/fidelity/diff.mjs B01      # frame above, build below
node tools/fidelity/zoom.mjs B01 288 196 300 60 3  # magnified crop of one region
node tools/fidelity/px.mjs <img> ref|app --rows 196 --cols 300 --bbox x0,y0,x1,y1
node tools/fidelity/color.mjs <img> ref|app "300,196;700,25"
```

Paths are absolute in these scripts (they were written against a scratchpad);
`SP` at the top of each is the only thing to repoint.

## Reading a score

Mean absolute per-pixel difference over the whole 1920x1080 canvas, 0 = identical.
**~2.0 is the floor**, not zero: the frames are a 0.735x downscale, so text
antialiasing alone differs everywhere. A screen at 2.0-2.7 is a match; 4+ means
something structural is off, and `worst:` names the 120x90 cells to look at.

`score.mjs` also carries a `MASKS` table for regions of a screenshot that are
Figma chrome rather than design — live collaborator cursor pins are baked into
`B07` and `B08`, and cost ~0.4 and ~0.2 of score if left unmasked.
