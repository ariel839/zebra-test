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

- **Edit mode button:** Edit mode's primary button is labelled `Edit`, not `Save` — likely a slip. Should it read `Save` instead?

- **Email case variance:** The email appears as `Useremail@gmail.com` in the form frames (B01–B09, E2–E3) but `Useremail@Gmail.Com` in R3 (review layout). Which is correct?

- **Sidebar disabled state:** Sidebar items 2–7 are inert (not linked) but drawn at full contrast. Should they read as visually disabled (reduced opacity, strikethrough, or another indicator)?

- **R3 edit control:** R3 (the chosen review layout) has no edit control of its own. An `Edit` button was added beside `Done` in the build to make edit mode reachable; without it, the mode cannot be entered from review. Confirm this addition is acceptable.

- **Focus ring accessibility:** No blue focus ring exists in any frame — the focus indicator is a CSS convention, not a visual match to the design. This is an accessibility gap in the source design; plan a focus treatment that meets WCAG 2.1 AA.

## Scope

The Figma section carries four different review-mode arrangements:

- `E1` and `R1`: Boxed cards layout
- `R2`: Dividers layout  
- `R3`: Logo-left layout
- `R4`: Logo-top layout

**`R3` was chosen and built; the other three were not.** This is a deliberate, user-approved scope decision. The addition of an `Edit` button beside `Done` in R3 is deliberate — without it, edit mode is unreachable from review.

**Overall:** 31 of the 35 UI frames in the Figma are implemented. The four unbuilt frames (`E1`, `R1`, `R2`, `R4`) represent alternative layouts the user declined; the remaining 31 all ship in this build.
