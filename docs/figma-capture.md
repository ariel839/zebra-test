# Figma capture — Task 2 design tokens

## Path used

**Fallback path (spec §7.4), not Figma variables.** Both read paths were dead before this task
started:

- `mcp__claude_ai_Figma__get_variable_defs` (and every other `claude_ai_Figma` tool) returns a
  View-seat quota error on this account. This is account-level; it was not retried.
- The `figma-rest` MCP (`mcp__figma-rest__*`) returns `403 Token expired`.

Per spec §7.4, this is an explicitly accepted fallback: colours were sampled directly off the
rendered PNGs in `wizard-spec-files/screens/` (1456×832 renders of the 1920×1080 design, scale
factor ≈0.758) using a throwaway pure-Python PNG pixel sampler, not read by eye.

**This is drift, not ground truth.** Every value in `src/styles/tokens.css` should be treated as
provisional until someone with Figma Dev-seat access exports the real variable collection for
file `XseXmXBMoevLAxK3x2VHgY`, page `Dashboard settings_self onboarding` (`7606:10539`). Swapping
in real values later is a one-file change — `tokens.css` is the only place these hexes appear;
no component may hardcode a colour that exists as a token.

## Sampling method

`.superpowers/sdd/2026-08-31-viq-guided-setup/png_sample.py` — a pure-stdlib (`zlib` only) PNG
decoder and pixel sampler. No PIL, no ImageMagick, no new dependencies; it lives only in the SDD
workspace and is never imported by product code. It supports:

- `pixel <x> <y>` — exact hex at one coordinate
- `hist <x0> <y0> <x1> <y1> [topN]` — frequency-sorted colour histogram over a region (used to
  find a fill colour without hunting for one perfect pixel)
- `row <x0> <x1> <y>` / `col <x> <y0> <y1>` — every pixel hex across a line (used to find borders
  and text, where the true colour sits at the darkest/most-saturated point in an anti-aliased run,
  not the first pixel hit)

Verified against `sips -g pixelWidth -g pixelHeight` (both report 1456×832 for the sampled PNGs)
before trusting the decoder's output. All screens sampled are 8-bit RGB, non-interlaced (`file`
confirmed), which the decoder handles without the general PNG interlace/palette paths being
exercised.

Fills (large flat regions) were read with `hist`. Borders and small text (1px strokes,
anti-aliased at ~0.758 scale) were read with `row`/`col`, taking the darkest/most-saturated pixel
in the run rather than the first pixel encountered, per the task's anti-aliasing guidance. Two
`sips --cropOffset` + `-z` crops were used as a visual sanity check when a value looked
suspicious (see Confidence notes below) — never as a colour source, only to confirm coordinates
and shapes by eye.

## Per-token source

| Token | Value | Source file | Where |
|---|---|---|---|
| `--color-viq-brand-green` | `#baf75b` | `A1_overview__8474-11927.png` | Wordmark "VisibilityIQ Foresight", peak of an anti-aliased cluster, region (27,18)–(165,35) |
| `--color-viq-strip-dark` | `#131b05` | `A1_overview__8474-11927.png` | Top strip fill, histogram over (0,0)–(1456,45), 66.5% dominant |
| `--color-viq-primary` | `#6b7ecb` | `B07_filled__10489-78667.png`, `E2_edit__10489-80942.png`, `E3_edit-variant__10489-80741.png` | Submit/Done button fill (rest state), histogram over (1305,752)–(1385,778) — 54.7% / 85.9% / 85.8% dominant respectively. **Corrected** (see Confidence notes): previously `#5665a3`, sampled from R3, which is a hover-state frame. |
| `--color-viq-primary-hover` | `#5665a3` | `B08_logo-chip-button-hover__10489-79003.png`, `D3_tooltip-submit-hover__10489-76248.png`, `C4_selected-filter-apply__11153-91657.png`, `R3_review-logo-left__10680-16436.png` | Submit/Done/Apply Filters button fill (hover state), histogram over (1305,752)–(1385,778) for B08/D3/R3 — 81.8% / 82.8% / 88.9% dominant — and (1298,332)–(1382,348) for C4 (Apply Filters is positioned differently), 71.2% dominant. **Corrected**: previously `#4c598f`, a derived/darkened guess. |
| `--color-viq-nav-active` | `#eef1f7` | `A1_overview__8474-11927.png` | "Dashboard Settings" sidebar item fill, histogram over (20,68)–(190,92), 77.1% dominant |
| `--color-viq-text` | `#131b05` | `B01_default-all-fields-empty__10489-76487.png` | H1 "Dashboard Settings", histogram over (225,70)–(425,100), 580px flat sample |
| `--color-viq-text-muted` | `#7c7c7d` | `R3_review-logo-left__10680-16436.png` | "Display name" row label, darkest pixel over (460,158)–(720,172) |
| `--color-viq-text-placeholder` | `#a3a9af` | `B01_default-all-fields-empty__10489-76487.png` | "Type your account number..." placeholder, darkest pixel over (245,160)–(420,172), landing at (267,170). **Corrected**: previously `#d1d3d7`, which does not match this method when re-run — see Confidence notes. |
| `--color-viq-border` | `#d0d8e7` | `B01_default-all-fields-empty__10489-76487.png` | Account Number input box border, row/col scan confirmed exact match, top-left corner |
| `--color-viq-border-hover` | `#a4a9af` | `B03_field-hover__10489-76991.png` | Same field, hovered — histogram over (220,148)–(430,178), 183px dominant border colour |
| `--color-viq-border-focus` | `#5665a3` | *derived, not sampled* | See Confidence notes — no distinct blue focus ring found in B04 |
| `--color-viq-border-strong` (extra) | `#868f8a` | `B01_default-all-fields-empty__10489-76487.png` | "Back" ghost-button stroke, flat isolated row scan at y=752 |
| `--color-viq-surface-hover` | `#f3f5fa` | `F3_row-hover-upgrade__10489-83067.png` | Hovered "Albert Heijn" table row, histogram over (700,405)–(850,420), 93.1% dominant |
| `--color-viq-surface-disabled` | `#f6f7fa` | `B02_auto-add-contracts-no__8135-2690.png` | Disabled "Submit" button fill, histogram over (1305,752)–(1385,778), 85.7% dominant |
| `--color-viq-surface-search` | `#f6f7fa` | `B06_3tier-dropdown-with-search__10489-78221.png` | Search bar background, histogram over (246,322)–(400,344), 90.6% dominant |
| `--color-viq-scrim` | `#e7e8e6` | `F2_existing-dashboards-detected__10489-82761.png` | Washed-out background page, histogram over (1300,400)–(1420,550), 100% flat (most reliable value in the file) |
| `--color-viq-logo-scrim` | `#cccccc` | `B08_logo-chip-button-hover__10489-79003.png` | Grey scrim over the logo card, histogram over (234,420)–(320,500), 79.8% dominant |
| `--color-viq-icon-muted` | `#7f7f80` | `C5_filters-applied__11153-92575.png` | Funnel icon body, darkest pixel over (385,328)–(405,340) |
| `--color-viq-danger` | `#de5c57` | `B01_default-all-fields-empty__10489-76487.png` | Red asterisk on "Account number *", darkest pixel over (299,141)–(309,149) |
| `--color-viq-badge` | `#0f2015` | `C5_filters-applied__11153-92575.png` | Count badge on the funnel icon, flat isolated pixel over (393,322)–(406,334) |
| `--color-viq-tag-upgrade` | `#a4d8c4` | `F6_create-new-dashboard-hover__11134-11999.png` | "Upgrade" pill outline, darkest of 5 independent row/col samples across F6 and F2b |
| `--color-viq-tag-none` | `#c2c6ca` | `F6_create-new-dashboard-hover__11134-11999.png` | "None" pill outline, darkest of 4 independent row/col samples across F6 and F2b |
| `--color-viq-tag-add-licenses` | `#f6c963` | `F6_create-new-dashboard-hover__11134-11999.png` | "Add Licenses" pill outline, one isolated unblended pixel at (601–604, 493) |
| `--radius-viq-control` | `6px` | `R3_review-logo-left__10680-16436.png`, `B01_default-all-fields-empty__10489-76487.png` | Measured corner curve on the "Done" button and the Account Number input box (~4–5 rendered px at 0.758 scale) |
| `--radius-viq-modal` | `8px` | spec §1 Row F | Given directly by the spec, not independently measured (cross-checked against F2b's modal corner, consistent) |
| `--radius-viq-pill` (extra) | `9999px` | `F2b_modal-detail-zoom__10489-82761.png` | Visual confirmation the status tags are fully-rounded stadium pills, distinct from `--radius-viq-control` |

## Confidence notes

- **`strip-dark` and `text` share the same hex (`#131b05`).** This was verified independently
  (66.5% dominant over the whole top strip; 580px flat sample on the H1 heading) — the design's
  "black" is genuinely a near-black olive-green, not pure `#000`, used consistently for both the
  chrome fill and body text.
- **CORRECTED — `primary` and `primary-hover` were swapped/wrong, not "no clean source".** The
  original claim below (kept struck through for history) — that every hover/focus-named frame
  renders the button identically to non-hover frames, "checked three separate times" — was false.
  It only ever compared hover frames against *other* hover frames: `R3_review-logo-left` was used
  as the source for the *default* `--color-viq-primary`, but R3 is itself a hover-state capture
  (the cursor is visibly on its Done button). So the value that shipped as default (`#5665a3`) was
  actually the hover colour, and the real default was never sampled at all — it was guessed as a
  programmatic 12%-darkened primary and shipped as `--color-viq-primary-hover` (`#4c598f`), which
  doesn't match any rendered frame.

  Re-sampled: three genuinely rest-state frames (`B07_filled`, `E2_edit`, `E3_edit-variant`) all
  give `#6b7ecb`, now `--color-viq-primary`. Four genuinely hover-state frames (`B08`, `D3`, `C4`,
  and `R3` itself) all give `#5665a3`, now `--color-viq-primary-hover`. Both are histogram-confirmed
  at 70-89% dominance — a clean, distinct pair. **Trap for next time: a frame's filename is not
  proof of its render state.** `R3_review-logo-left` gives no hint from its name that it's a hover
  capture; only the visible cursor position on the Done button reveals it. Check cursor position,
  not just filenames, before treating any frame as a default-state source.

  ~~Original (superseded) note: "primary-hover and border-focus have no clean source. Every frame~~
  ~~in the set named for a hover or focus state (B08, D3, C4, B04) was sampled directly, and in~~
  ~~every case the primary button's fill and the focused input's border rendered identically to~~
  ~~their non-hover/non-focus counterparts... these two states appear not to be visually~~
  ~~differentiated in the exported PNGs at all."~~

  **`border-focus` is unaffected by this task (out of scope, not fixed) but now suspect.** It still
  holds a *derived* value, hardcoded as `#5665a3` with a comment saying it "reuses
  `--color-viq-primary`". That comment predates this correction: `--color-viq-primary` is no longer
  `#5665a3`, so as of this fix `border-focus`'s hardcoded hex silently equals the new
  `--color-viq-primary-hover` instead of primary, and its comment is stale. This token still needs
  the real Figma variable more than anything else in the file — flagging for follow-up, not fixed
  here per the task's scope (only `primary`, `primary-hover`, and `text-placeholder` were in scope).
- **CORRECTED — `text-placeholder` didn't match its own documented method.** The shipped value
  (`#d1d3d7`) was captioned as "darkest of AA run over (245,160)-(420,172)" in
  `B01_default-all-fields-empty`, but re-running that exact scan lands on `#a3a9af` at (267,170) —
  substantially darker, and confirmed independently with a full min-brightness scan of the region
  (not just a row scan). Corrected to `#a3a9af`.

- **Other tokens citing R3 or a hover-named frame, checked but not changed (no evidence of error).**
  Per the same-family risk that caused the primary/primary-hover mixup, every other token citing
  `R3_review-logo-left` or a frame whose name suggests a hover/selected state was re-checked:
  - `--color-viq-text-muted` cites R3's "Display name" row label. This label's colour is unrelated
    to the Done button's hover state (different element entirely), and R3's value (`#7c7c7d`)
    matches the independently-sampled `--color-viq-tooltip-text` from three separate Row D frames
    (D1, D2, D3) exactly — strong cross-validation. No evidence of an error; not changed.
  - `--radius-viq-control` cites R3's Done button corner curve (alongside B01's input box). A
    button's corner radius is not expected to change between rest and hover states, and the
    R3-derived measurement agrees with the independent B01 input-box measurement. No evidence of
    an error; not changed.
  - `--color-viq-border-hover` (B03, `field-hover`) and `--color-viq-tag-add-licenses` (F6,
    `create-new-dashboard-hover`) are hover tokens sourced from hover-named frames — that is
    correct by design, not a mixup.
  - `--color-viq-border-focus` reuses the old primary hex directly (see the primary/primary-hover
    note above) — flagged there as now-stale, not fixed here.

- **The three tag-pill colours (`tag-upgrade`, `tag-none`, `tag-add-licenses`) are the least
  certain colour values.** These are 1px strokes on a fully-rounded pill at ~0.758 render scale,
  so almost every pixel is an anti-aliasing blend; only `tag-add-licenses` happened to land on one
  unblended pixel. The other two are the darkest pixel found across multiple independent samples
  in two different source files (F6 and the zoomed F2b), which is the best available estimate but
  is very likely lighter than the true fill.
- **`--color-viq-border-strong` and `--radius-viq-pill` are not in the brief's required list.**
  They were added per the task's rule 5 ("add every other value... so components have exactly one
  colour surface") because a ghost-button border and a pill radius both appear in the frames and
  are visually distinct from the required tokens — leaving them out would force a later component
  to hardcode a hex or radius that isn't a token.

## Escalate to client

These are known open questions from spec §7, not something this task can resolve — surfacing them
here per the task brief rather than blocking on them:

1. **Success overlay has no dismiss control** (spec §7.8) — auto-advance, or a button the designer
   omitted?
2. **Edit mode's primary button reads `Edit`, not `Save`** (spec §7.6) — almost certainly a slip.
3. **Email casing is inconsistent** — `Useremail@gmail.com` in the form frames,
   `Useremail@Gmail.Com` in the R-column review frames (spec §7.7). Pick one.
4. **Sidebar items 2–7 are inert but drawn at full contrast** (spec §7.9) — should they use
   disabled styling instead?
5. **`R3` (review, logo left) has no edit control of its own** — unlike the other review layouts,
   there's no visible way to get from R3 back into edit mode.

---

# Measured frame geometry (2026-08-31, second pass)

Everything below was read off the reference PNGs with `tools/fidelity/px.mjs`,
mapping through each frame's detected artboard rect (see that folder's README —
the PNGs are Figma screenshots, so the 1920x1080 artboard sits at ~(20,11) at
1411x795 and must be cropped before anything is compared). Values are design px
on the 1920x1080 canvas. Where a value contradicts a Figma *inspect* reading,
the frame won: Figma reports `line-height: 100%` for A1's copy, but that is its
"Auto" setting and the frame renders a 17.5px pitch on the intro and 17px on the
item bodies.

## Shell

| Thing | Value | Read from |
|---|---|---|
| Top strip height | 50 | B01 col 300 (`0-49`) |
| Strip wordmark | 16px/600, starts x16, full string 250 wide | B01, green run 18..165 |
| Strip is NOT scrimmed by modals/overlays | `#111b02` on B01, F2 and B09 alike | colour samples |
| Sidebar width | 232 (divider at x231-233) | B01 row 214 |
| Nav pill | x8..223, first pill y72..112, 48px pitch, label inset 18 | B01 row 93, col 12 |
| Page heading | 28px/600, glyph box x290..534 y86..112 | B01 bbox |
| Content left edge | 288 (`px-14` off the 232 sidebar) | every row scan |
| Content divider | y981 | B01 col 300 |
| Footer buttons | 120x40, 32 apart, Back x1592..1712, Submit x1744..1864, top 1008 | B01/B07 footer scans |

## Form grid (Row B, C, D, F, G)

| Thing | Value |
|---|---|
| Control height | 36 (not 40) |
| Control width | 260; column 2 starts x580 |
| Row pitch | 86 = label 16 + 3 + control 36 + 31 |
| First control top | y196 |
| Field label | 12px/16, inset 7px from the control's left edge, 3px above it |
| Required asterisk | 3px after the label |
| Radio options | 64 apart (No circle x580, Yes circle x684) |
| Learning-series checkbox | 18px below its row top, not centred on the control opposite |
| Chips | 22 tall, 4 apart, 12 below the control (top y415) |
| Upload Logo button | 125x41 at y521; uploaded card 120x120 at y554..674 |
| Placeholder logo | the "logoipsum" mark: #113322 square, #4a4582 and #8e3f5a circles |

## Overlays (B09, B10)

Card 630x378, centred on the canvas at (645, 351). Page behind stays legible,
darkened — NOT hidden and NOT washed white. Order is illustration, title,
progress bar, percentage, description: the percentage sits **under** the bar.

| Thing | Value |
|---|---|
| Title | 20px/600 ("Scanning Information" 193 wide) |
| Progress bar | 220x6 at y600, fill `#596372`, track `#f2f2f2` |
| Percentage | 14px, glyph y620..633 |
| Description | 18px, one line, 471 wide |

The frame's illustration is a line-art scanner with a grey blob — an asset we
were never given. A lucide glyph stands in at the measured size. **Flag for the
client.**

## Modal (Rows F and G)

| Thing | Value |
|---|---|
| Box | 1437 wide at x242, height follows content, centred at y540 (F2 y277..804, G2 y329..753) |
| Padding | 56 sides, 52 top, 54 bottom |
| Title | 20px/600 |
| Body copy | 16px, 9 below the title |
| Section heading | 16px/600, 59 below the body |
| Table | 12px throughout; 5 columns on a 242 pitch from x298; header row 22 tall; rows 48; a divider under the LAST row too |
| Footer button | 180x40, 39 under the last divider |
| Scrim | ~16% of `#6b6b6b` below the strip: white 255 -> 231 while the page heading's own row goes 136 -> 132. A white wash lightens the page; an opaque fill hides it. Both are wrong. |

## A1 (Overview)

Intro at 14px with a 17.5px pitch, max ~700 wide (it wraps after
"confgure your"), starting at y124 — 14px under the heading, i.e. above where
the shell's 88px title block hands over. Item grid inset 12px (icons x300, text
x321), right column text at x1163 (a 120px column gap), item titles 16px/600,
bodies 14px with a 17px pitch, ~78px row gap.

**Known remainder:** the frame's fourth left-column item (`Contract Type`) sits
~30px lower than any uniform grid gap produces — rows 1-3 match to 2px, so the
frames look hand-placed there rather than grid-driven. Not chased.

---

## Scale correction — the screens are NOT 1456/1920 = 0.758

Measured while rebuilding the filter panel (Row C) and it invalidates every
*dimension* previously read off these PNGs:

Each export is 1456×832, but that includes Figma's selection chrome — a grey
mat and the blue selection rectangle around the frame, plus the `1920 x 1080`
size label under it. The 1920×1080 frame itself is the inner rectangle:

- origin **(21.5, 11.5)** in PNG pixels (the blue border sits on the frame edge)
- **1410 × 794** PNG px for 1920 × 1080 design px
- scale **1410/1920 = 0.734375** (the vertical, 794/1080 = 0.7352, agrees)

So `design = (png − 21.5) / 0.734375` horizontally, `(png − 11.5) / 0.734375`
vertically. Cross-checks: the form's input boxes come out 260 design px wide
(the code's `w-[260px]`), the sidebar border at x≈231, the top strip ≈48 tall.

The colour table above is unaffected — every entry there is a *location* in the
PNG, and locations did not change. What is affected is anything that converted
a PNG measurement into a design px size or position. The known casualty was the
filter panel: `WIZARD-SPEC.md` §4 gives its position as "roughly x 960-1400,
y 100-365 in frame coordinates", which are PNG pixels, not frame coordinates —
converted, the panel is **600 × 360 at design (1276, 120)**, and it was built at
440 × auto at (960, 100) relative to the tree trigger. Fixed in `FilterPanel.tsx`.
