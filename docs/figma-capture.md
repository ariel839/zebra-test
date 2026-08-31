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
| `--color-viq-primary` | `#5665a3` | `R3_review-logo-left__10680-16436.png` | "Done" button fill, histogram over (1305,752)–(1345,778), 88.9% dominant |
| `--color-viq-primary-hover` | `#4c598f` | *derived, not sampled* | See Confidence notes — no distinct hover fill found in B08, D3, or C4 |
| `--color-viq-nav-active` | `#eef1f7` | `A1_overview__8474-11927.png` | "Dashboard Settings" sidebar item fill, histogram over (20,68)–(190,92), 77.1% dominant |
| `--color-viq-text` | `#131b05` | `B01_default-all-fields-empty__10489-76487.png` | H1 "Dashboard Settings", histogram over (225,70)–(425,100), 580px flat sample |
| `--color-viq-text-muted` | `#7c7c7d` | `R3_review-logo-left__10680-16436.png` | "Display name" row label, darkest pixel over (460,158)–(720,172) |
| `--color-viq-text-placeholder` | `#d1d3d7` | `B01_default-all-fields-empty__10489-76487.png` | "Type your account number..." placeholder, darkest pixel over (245,160)–(420,172) |
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
- **`primary-hover` and `border-focus` have no clean source.** Every frame in the set named for a
  hover or focus state (`B08_logo-chip-button-hover`, `D3_tooltip-submit-hover`,
  `C4_selected-filter-apply`, `B04_selected-field`) was sampled directly, and in every case the
  primary button's fill and the focused input's border rendered identically to their non-hover/
  non-focus counterparts. This was checked three separate times before concluding it's a real
  property of the rendered frames, not a sampling error — these two states appear not to be
  visually differentiated in the exported PNGs at all (only a text caret marks B04 as "selected").
  Both tokens currently hold derived/reused values (a programmatic 12%-darkened primary, and the
  primary colour reused as a focus ring) marked with `/* not a variable — sampled */`-style
  comments in `tokens.css`. **These two need the real Figma variables more than anything else in
  this file** — flagging for follow-up.
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
