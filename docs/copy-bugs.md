# Copy bugs and design questions

These are real typos in the Figma that the build reproduces deliberately. The client must decide on each one.

## Typos

| Wrong text | Correction | Location |
|---|---|---|
| `confgure` | configure | `src/content/overview.ts` line 43 — intro paragraph |
| `notifed` | notified | `src/content/overview.ts` line 55 — "account-number" field body copy |
| `data fow` | data flow | `src/content/overview.ts` line 63 — "user-email" field body copy |
| `identifer` | identifier | `src/content/overview.ts` line 71 — "company-name" field body copy |
| `refect` | reflect | `src/content/overview.ts` line 99 — "company-logo" field body copy |
| `service ofer` | service offer | `src/content/overview.ts` line 108 — "contract-type" field body copy |
| `input felds` | input fields | `src/content/overview.ts` line 45 — intro paragraph, second sentence |
| `Select compony name...` | Select company name... | `src/content/dashboardSettings.ts` line 22 — placeholder text |
| `Euro Car Parts Irland` | Euro Car Parts Ireland | `src/mocks/companyTree.ts` line 23 — company tree label |
| `LKG Corporation` (in dropdown) | `LKQ Corporation` (matches tree) | `src/mocks/companyNames.ts` line 18 — company name dropdown vs. company tree `src/mocks/companyTree.ts` line 14 |

## Design questions

- **Success overlay:** The overlay reads "37% Complete" on what is a success screen (B10), and has no dismiss control. Is this intentional, or should it show "100% Complete" or remove the percentage entirely? How should users close it?

- **Edit mode button:** ~~Edit mode's primary button is labelled `Edit`, not `Save` — likely a slip. Should it read `Save` instead?~~ **RESOLVED 2026-09-01 — client confirmed it should read `Save`.** The build now ships `Save`, so the E2/E3 frames differ from the app on this one string by design.

- **Email case variance:** The email appears as `Useremail@gmail.com` in the form frames (B01–B09, E2–E3) but `Useremail@Gmail.Com` in R3 (review layout). Which is correct?

- **Sidebar disabled state:** Sidebar items 2–7 are inert (not linked) but drawn at full contrast. Should they read as visually disabled (reduced opacity, strikethrough, or another indicator)?

- **Company chips count companies, not tree nodes:** B07 draws the chip row as `Euro Car Parts` · `Euro Car Parts Ltd` · `+3` — a *branch* label next to one of its own children. Emitting a chip for every fully-checked node reproduces that pair, but then `+N` counts tree rows rather than companies: checking `Rhiag Group` (10 companies) read `Rhiag Group` · `Rhiag Italia` · `+12`, which matches nothing a user can count. The build now emits **one chip per selected company (leaf)**, so `Rhiag Group` reads `Rhiag Milano` · `Rhiag Roma` · `+8`. The `+N` counts in B07 (`+3`) and the review frames (`+30`) still match, but B07's two *visible* chip labels now read `Euro Car Parts Ltd` · `Euro Car Parts Irland` — a branch name can no longer appear as a chip. Confirm this is the intended reading.

- **R3 edit control:** R3 (the chosen review layout) has no edit control of its own. An `Edit` button was added beside `Done` in the build to make edit mode reachable; without it, the mode cannot be entered from review. Confirm this addition is acceptable.

- **Missing tooltip copy (5 fields):** spec §3 says every field label carries an info icon whose tooltip explains the field, but only two of those tooltips are legible in any exported frame — Account number (`D1`) and Company name (`D2`). Those two ship verbatim. **Display name, Automatically add contracts, Valid company names, Contract type and User email have no tooltip copy from the design, so they ship with none**: the icon is still drawn on every label (every frame shows one, so removing the icon would deviate from the design), but hovering it shows nothing. Earlier builds filled these five in with text written during the build; that copy was removed rather than shipped as if it came from the client. **We need the real strings for these five.** The Overview screen's field explainers are an option — §3 suggests reusing them — but they run ~220 characters against ~80 in the two verified tooltips, so the box would be two to three times taller than any frame shows.

- **`D3` frame name is misleading:** the frame exported as `D3_tooltip-submit-hover` shows the **Company name** tooltip open (the same string as `D2`) beside a Submit button in its hover state. There is no tooltip on Submit in it, or in any other frame. Worth renaming the frame so the next person reading the file does not build one, as this project initially did.

- **Colour contrast below WCAG AA:** two Figma-sampled tokens fail the 4.5:1 minimum for normal-size text, so a Lighthouse accessibility run flags every screen. Muted body text `--color-viq-text-muted` `#7c7c7d` on white measures **4.16:1** (Overview intro, every field description, R3 labels), and white text on the primary button `--color-viq-primary` `#6b7ecb` measures **3.83:1** (`Next`, `Submit`, `Done`). Both were reproduced faithfully from the frames rather than corrected. Darkening the muted grey to roughly `#6e6e6f` and the primary to roughly `#5a6cbd` would clear AA with a barely perceptible shift — confirm before we change either.

- **Focus ring accessibility:** No blue focus ring exists in any frame — the focus indicator is a CSS convention, not a visual match to the design. This is an accessibility gap in the source design; plan a focus treatment that meets WCAG 2.1 AA.

## Scope

The Figma section carries four different review-mode arrangements:

- `E1` and `R1`: Boxed cards layout
- `R2`: Dividers layout  
- `R3`: Logo-left layout
- `R4`: Logo-top layout

**Three of the four are built: `R2`, `E1` and `R3`.** `R2` is what the app
itself renders at `/review` — chosen by the client after seeing the boxed
cards, as the more natural read of a completed form. `E1` (boxed) and `R3`
(logo-left) stay reachable in the flow for side-by-side comparison against
their own frames. `R1` is `E1`'s layout under a `Done` footer instead of an
`Edit` one, so `E1` already covers it bar that button; `R4` (logo on top) was
not built.

The addition of an `Edit` button beside `Done` is deliberate on every review
layout — without it, edit mode is unreachable from review.

**Overall:** 33 of the 35 UI frames in the Figma are implemented. The two
unbuilt frames (`R1`, `R4`) are alternative arrangements of the review
screen; the remaining 33 all ship in this build.

## Accessibility measurement

Lighthouse 13.3.0, accessibility category only, run against the production build (`vite preview`), headless Chrome:

| Route | Desktop preset | Mobile preset |
|---|---|---|
| `/` | 94 | 89 |
| `/setup` | 95 | 90 |
| `/review` | 95 | 90 |
| `/flow` | 95 | 90 |

Desktop is the figure that applies: the build is a fixed-1920 desktop prototype. The only failing desktop audit is `color-contrast` (the two tokens above). The mobile preset additionally fails `target-size` — Lighthouse emulates a 412px-wide viewport, which the scale-to-fit canvas shrinks by ~0.21, so a 232x40 design-px sidebar item measures 8.6px tall to the audit. That is an artefact of emulating a phone against a desktop-only canvas, not a real hit area problem.
