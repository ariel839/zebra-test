# Zebra — VisibilityIQ Foresight Guided Setup

## Wizard Spec (frontend-only prototype) — v4, verified against rendered frames

**Figma:** `XseXmXBMoevLAxK3x2VHgY` → page `Dashboard settings_self onboarding` (`7606:10539`)
**Product name in UI:** VisibilityIQ Foresight — Guided Setup
**Reference screenshots:** `screens/` — all 36 frames rendered at 1456×832, named
`<row><n>_<state>__<node-id>.png`. Every claim below was checked against these images, not
inferred from the layer tree.

**Scope of this build:** click-through frontend prototype covering **every screen in the section** —
all 36 frames, rows A–G plus the standalone review column. No backend, no API, no persistence.
Deployed to Vercel for a client demo.

---

## 0. Decisions already made

| Topic          | Decision                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------- |
| Stack          | Vite + React + React Router                                                               |
| Component base | Sisense design language (see §7 — needs one verification step)                            |
| Screens        | **All 36.** Nothing is phase 2.                                                           |
| Mock data      | Enough fixtures to reach every screen: seeded account numbers drive the branch — see §7.1 |
| Persistence    | None. State lives in memory; refresh resets.                                              |

**Scope, settled (v3):** every screen on the canvas gets built. No row is deferred, no state is
"phase 2". Earlier drafts parked the Existing-Dashboards rows by over-applying a mock-data answer to
the screen list — that is corrected. The table in §1 is the complete build list; if a screen is not
in it, it is not on the canvas.

---

## 1. Screen inventory (verified against Figma)

**36 of 36 frames in the section are listed below and all are in scope.** Every node id was read
from the file and machine-checked against it — see §9 for the audit. Row labels are the vertical
dark labels on the canvas.

Every node id below was read from the file.

### Row A — Overview (`8474:11925`)

| Screen             | Node         |
| ------------------ | ------------ |
| Overview / welcome | `8474:11927` |

Static explainer page. Left nav + title "Dashboard Settings" + intro paragraph, then a 2-column grid of 7 field explainers, each with a Lucide icon:

| Field                       | Icon           | Copy (verbatim from Figma)                                                                                                                                                                                                                                                                                                                                       |
| --------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account Number              | Hash           | "The end customer's Siebel account number, as stated in their VisibilityIQ contract. Enter this number manually to initiate the dashboard setup. If an existing dashboard is found for this account or a related account under the same Standard Name, you will be notified. In such cases, consider using the existing dashboard instead of creating a new one" |
| User Email                  | Mail           | "The email address of the primary customer contact who will receive the initial welcome letter and dashboard access once the data flow is validated. Make sure the email domain name matches the company name before adding a user."                                                                                                                             |
| Company Name                | Factory        | "This is the dashboard's core identifier within the VIQ system and cannot be changed once set. Upon entering the Siebel account ID, you can choose from the Account Name, Subsidiary Standard Name (if available), or the global Standard Name."                                                                                                                 |
| Sign Up For Learning Series | Graduation cap | "Check this box to subscribe the customer user to the VIQ learning series. This provides them with training videos to enhance their understanding and utilization of the VisibilityIQ product."                                                                                                                                                                  |
| Display Name                | Circle-user    | "This name will be visible to users on their dashboard when they log in. While it defaults to the chosen Company Name, you can customize it for rebranding or other preferences. This setting can be updated at any time."                                                                                                                                       |
| Company Logo                | Image          | "Use this button to upload your company's logo, which will be prominently displayed on the dashboard when customers log in. It can be updated at any time to reflect branding changes or preferences"                                                                                                                                                            |
| Contract Type               | Handshake      | "This field determines the dashboard's data source, as well as the automatically generated roles and user groups. It is pre-populated based on the purchased service offer (represented by service SKU), but can be updated manually if needed."                                                                                                                 |

Footer: `Back` (ghost, ← icon) + `Next` (primary, → icon).
Note: the Figma copy contains real typos ("confgure", "notifed", "identifer", "fow", "ofer", "refect"). **Reproduce them as-is** and raise them as a copy bug in a separate list — do not silently fix client copy.

### Row B — Happy flow (`8135:2841` "Self onboarding - dashboard settings - happy flow")

| #   | State                                        | Node          |
| --- | -------------------------------------------- | ------------- |
| B1  | Default — all fields empty                   | `10489:76487` |
| B2  | Automatically add contracts → set to No      | `8135:2690`   |
| B3  | Field hover                                  | `10489:76991` |
| B4  | Selected field (focus)                       | `10489:77480` |
| B5  | Regular selection dropdown                   | `10489:77782` |
| B6  | 3-tier dropdown with search option           | `10489:78221` |
| B7  | Filled                                       | `10489:78667` |
| B8  | Logo hover / added chip hover / button hover | `10489:79003` |
| B9  | Loading                                      | `10489:79600` |
| B10 | Success                                      | `10489:79811` |

### Row C — Filter flow (`11153:92565`)

Filter panel _inside_ the 3-tier dropdown, opened by the funnel icon in the dropdown's search bar.
| # | State | Node |
|---|---|---|
| C1 | Click filter icon | `11153:92265` |
| C2 | Type country/region | `11137:85205` |
| C3 | Suggested search results | `11137:89921` |
| C4 | Selected filter + apply | `11153:91657` |
| C5 | Filters applied (badge count on funnel icon) | `11153:92575` |

### Row D — Tooltip (`8474:11923`)

| #   | State   | Node          |
| --- | ------- | ------------- |
| D1  | Tooltip | `10489:80202` |
| D2  | Tooltip | `10489:80363` |
| D3  | Tooltip | `10489:76248` |

Each field label carries an `Info-Lucide` 16px icon. Hovering it shows a `Tooltip` component anchored to the icon (structure confirmed: `instance: Tooltip` + `instance: Pointer` for the cursor mock).

### Row E — Review and Edit (`8474:25218`)

| #   | State            | Node          |
| --- | ---------------- | ------------- |
| E1  | Review           | `8901:9551`   |
| E2  | Edit             | `10489:80942` |
| E3  | (variant)        | `10489:80741` |
| —   | Dev notes sticky | `9082:6667`   |

**Dev note, verbatim from the Figma canvas:**

> "When entering the 'self onboarding area' once again - after finishing the initial set up - the dashboard settings will be in review mode: no stepper at the top clear overview of the data. editing will be possible through edit button"

**Review mode**, confirmed from `screens/E1_review…` and the four `R*` frames: the form is replaced
by read-only **label-above-value rows**, and the logo moves to a panel on the right
(bordered card holding the logo, with **`Account Logo`** / **`File Name`** labels beside it).
Multi-value fields keep the chip presentation (`Euro Car Parts Ltd` ×4 + **`+30`** overflow;
`IOT Mobile Computer`, `IOT Printer`). `Automatically add contracts` renders as the plain word `Yes`.

Four review layouts exist in the file — pick one with the designer, do not build all four:

| Frame                                    | Layout                                                                                    | Footer             |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------ |
| `E1` / `R1` (`8901:9551`, `10680:16649`) | each row in its own bordered card, logo panel right                                       | `Edit ✏️` / `Done` |
| `R2` (`10680:15949`)                     | rows separated by hairline dividers, no card borders, logo panel right                    | `Done`             |
| `R3` (`10680:16436`)                     | logo card on the **left** with company name + account number under it, compact rows right | `Done`             |
| `R4` (`10680:16540`)                     | logo card top-left with name beside it, rows below                                        | `Done`             |

`R3`/`R4` also drop `Account number`, `Company name` and `Automatically add contracts` from the row
list, showing instead a right-aligned note **`Contracts automatically added`** next to Display name.

**Edit mode** (`E2` `10489:80942`, `E3` `10489:80741`): back to the editable form, values populated,
footer becomes **`✕ Cancel`** (outline) + **`Edit`** (primary). Note the primary is labelled `Edit`,
not `Save` — looks like a designer slip; confirm before shipping.

_Inconsistency to flag:_ the email reads `Useremail@gmail.com` in the form frames and
`Useremail@Gmail.Com` in `R2`–`R4`. Use one.

### Row F — Existing Dashboards: 3 Types (`10446:42163`)

| #   | State                                   | Node          |
| --- | --------------------------------------- | ------------- |
| F1  | Enter account number                    | `10489:81290` |
| F2  | Overview — existing dashboards detected | `10489:82761` |
| F3  | Hover                                   | `10489:83067` |
| F4  | Hover                                   | `11134:11303` |
| F5  | Hover                                   | `11134:11613` |
| F6  | Hover                                   | `11134:11999` |

**F1** is the standard Dashboard Settings form with the account number filled (`189189189`) and
the rest empty — visually identical to B1 plus a value in field 1. Submit is disabled.

**F2** is F1 with a **modal** over a page-wide white scrim (the form behind is visible but washed out).
Modal ~1055×390, radius ~8, centred. Contents, read off the rendered frame:

- Title **"Existing Dashboards Detected"**
- Body **"Select an existing dashboard to continue with upgrades or license changes, or create a new dashboard from scratch."**
- Section heading **"Existing Dashboards"** with **search** and **download** icon buttons right-aligned
  on the same line. (Other frames in the file also show a **filter** icon with a `3` badge in this
  group — build filter/search/download and hide what a given state does not use.)
- Table — **5 data columns + a 6th hover-only action cell**:

| Column            | Content                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Company           | `Albert Heijn` · `Albert CZ` · `Ahold Delhaize`                                                                            |
| Partner           | `Zebra` · `Kodys` · `Zebra`                                                                                                |
| Supported Actions | **Tag** + an `Info-Lucide` in the header. `Upgrade` (green outline), `None` (grey outline), `Add Licenses` (amber outline) |
| Region            | `EMEA` for all three                                                                                                       |
| Contract type     | `OneCare` · `OneCare` · `Foresight IOT`                                                                                    |
| _(hover only)_    | an **outline button appearing at the row's right edge on hover**, labelled with that row's supported action                |

- Row hover paints the row light grey **and** reveals the action button: `F3` → `Upgrade` on the
  Albert Heijn row, `F5` → `Add Licenses` on the Ahold Delhaize row. `F4` hovers the `None` row and
  **no button appears** — a row whose action is `None` is hoverable but not actionable. Build the
  button off the row's action value, not off hover alone.
- Footer: **`Create a New Dashboard`**, outline, bottom-right. `F6` is its hover state (light grey fill).

### Row G — Existing Dashboards: single, direct OneCare (`10053:53658`)

| #   | State                                 | Node          |
| --- | ------------------------------------- | ------------- |
| G1  | Enter account number                  | `10489:81444` |
| G2  | System recognized existing dashboards | `10489:82718` |
| G3  | Selected dashboard                    | `10489:83024` |

Same component, **different copy and a single row**:

- Title **"Existing Direct OneCare Dashboard Detected"**
- Body **"A direct OneCare dashboard already exists for this customer account. Upgrade it to Foresight to use existing data, or create a new dashboard."**
- One row: `Albert Heijn` · `Zebra` · `Upgrade` · `EMEA` · `OneCare`
- `G3` is that row hovered, showing the `Upgrade` action button — same mechanic as `F3`.
- Modal is shorter (~310px) since it sizes to its rows; `Create a New Dashboard` sits at the bottom-right.

So: **one `ExistingDashboardsModal`**, taking `{title, body, rows}`. Do not fork it.

### Standalone review screens (right-hand column, red-marked in Figma)

`10680:16649`, `10680:15949`, `10680:16436`, `10680:16540` — full review-mode renders. Use these as the source of truth for §E, they are the most complete.

---

## 2. Layout shell (identical on every screen)

```
1920 × 1080
├── wizard top strip            h=48   dark green (#1a2e05-ish), "VisibilityIQ Foresight" (brand green) + " Guided Setup" (white), X close at right
└── main page content           h=1032
    ├── side bar                w=232  border-right
    │   └── Container           x=8 y=24 w=215
    │       └── 7 × Button      h=40, gap 8  — active item has a light blue-grey fill
    └── main content            w=1688
        ├── main content wrapper  h=933
        │   ├── header            h=97   title (33px) at x=56 y=32; optional sub-header (hidden on form screens)
        │   └── main content      y=129  form strips
        └── wizard bottom strip   h=98   Back (outline) + Submit/Next (primary blue) right-aligned
```

**Sidebar items (order fixed):** Dashboard Settings · User Creation · ZDS Configuration · Device Enrollment · Site Management · Device Group Management · API Setup.
Only _Dashboard Settings_ is implemented; the rest are visible-but-inert. Confirm with the client whether they should look disabled or merely un-clickable — the Figma shows them at full contrast.

**Form grid:** rows are `strip` frames, `x=32`, `w=1624`, `h=54`, vertical rhythm 86px. Inside each strip, controls sit at `x=24` and `x=316`, each `w=260`. So: a two-column form, 260px controls, 32px gutter between the columns' start offsets (24 → 316 = 292 pitch).

---

## 3. Fields (Dashboard Settings step)

| Field                       | Control                                     | Placeholder                   | Required | Notes                                                                                         |
| --------------------------- | ------------------------------------------- | ----------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| Account number              | text input                                  | `Type your account number...` | ✅       | Free text. In the filled state: `189189189`                                                   |
| Company name                | select (single)                             | `Select compony name...`      | ✅       | **typo in Figma placeholder — reproduce as-is.** Filled: `Euro Car Parts`                     |
| Display name                | text input                                  | `Create a display name...`    | ✅       | Defaults to the chosen Company Name per the overview copy                                     |
| Automatically add contracts | radio group                                 | —                             | —        | `No` / `Yes`, **default `Yes`**                                                               |
| Valid company names         | 3-tier tree multi-select w/ search + filter | `Select all valid names`      | ✅       | The complex one — see §4                                                                      |
| Contract type               | multi-select                                | `Select contract types`       | ✅       | Filled: `IOT Mobile Computer`, `IOT Printer`                                                  |
| User email                  | text input                                  | `Enter your email...`         | ✅       |                                                                                               |
| Sign up for learning series | checkbox                                    | —                             | —        | Unchecked by default                                                                          |
| Company logo                | upload button                               | `Upload Logo` + upload icon   | —        | Filled state replaces the button with a `LogoIpsum Asset` thumbnail (`214×305` rect in Figma) |

Required fields carry a red `*` after the label. Every label carries a 16px info icon → tooltip (§Row D).
Tooltip copy captured so far (dark-on-light box, ~170px wide, anchored above-right of the icon):

- Account number — "Enter the customer's Siebel account number as it appears on their VIQF contract."
- Company name — "Select the core identifier for your dashboard; this name cannot be changed once set."

The remaining five tooltips were not shown in any frame; reuse the Overview copy from §Row A, or ask the designer.

**Company name dropdown** (`B05`) is a plain list whose options carry a **type badge**:
`LKG Corporation` [Standard, dark grey], `Euro Car Parts` [Subsidiary, dark grey],
`Euro Car Parts` [Account, blue]. Two options can share a label — the badge is what
distinguishes them, so key the list by id, not by name.

**Filled state** (`B07`): account `189189189`, company + display name `Euro Car Parts`,
email `Useremail@gmail.com`. Both multi-selects render their selections as a **chip row
directly beneath the closed control**, not inside it: Valid company names →
`Euro Car Parts` `Euro Car Parts Ltd` `+3`; Contract type → `IOT Mobile Computer` `IOT Printer`.
The trigger keeps showing its placeholder. Upload Logo is replaced by a bordered
thumbnail card (~88×88) holding the logo image.

**Hover states** (`B08`): a chip on hover grows an `×` and a blue border; the logo card on
hover dims under a grey scrim with a pencil icon top-right; the primary button darkens.

Footer button on this step is labelled **`Submit`** (not Next) and is **disabled until the form is valid** — confirmed: greyed in B1/B6, active in B7.

---

## 4. The 3-tier dropdown (`Valid company names`)

The single most expensive component in this build. Budget for it accordingly.

Anatomy, top to bottom, from `10489:78221`:

1. Trigger — looks like a select, chevron flips up when open. Panel is 242px wide, anchored below, `max-height ≈ 390`, own scrollbar.
2. **Search bar** — magnifier icon + `Search` placeholder, on a grey fill; a **funnel icon at its right** opens the filter panel (§Row C). When filters are active the funnel gets a numeric badge (`filter icon_added filters` → text `1`, and `3` elsewhere).
3. `Select All` checkbox.
4. Tree, three levels deep, each node = checkbox + label (+ chevron if it has children):
   - L1 `LKQ Corporation` (chevron down = expanded)
     - L2 `Euro Car Parts` (expanded)
       - L3 `Euro Car Parts Ltd`, `Euro Car Parts Irland` _(sic)_, `Euro Car Parts GmbH`
     - L2 `Auto Kelly` (chevron right = collapsed)
     - L2 `Auto Kelly Ltd` (collapsed)

Indentation steps ~19px per level (checkbox x: 298 → 317 → 336 in Figma coords).

**Behaviour to implement:**

- Checking a parent checks all descendants; unchecking clears them. Partial selection → indeterminate parent checkbox.
- Search filters the tree, keeping ancestors of matches visible.
- **Filter panel** (§Row C) — a **separate floating panel**, not part of the dropdown. It opens to
  the right of the form (roughly x 960–1400, y 100–365 in frame coordinates), while the tree stays
  open underneath. Anatomy:
  - Header: **`Filter`** + close `×`
  - Left column, **`Filter Properties`**: a vertical list of properties — **`By Country`** (selected,
    light grey fill) and **`By Region`**. Selecting one swaps the right column.
  - Right column, titled by the active property (**`Select Countries`**): a search input,
    placeholder **`Type a country name`**, with a magnifier icon. A **`Reset`** link appears
    top-right of this column once anything is selected.
  - Typing shows a typeahead list, each row a magnifier icon + the name — typing `Ca` gives
    `Ca`, `Canada`, `Cambodia`, `Cameroon`, `Cape Verde` (the raw query is the first row).
  - Chosen values become removable chips below the input: `× Canada`.
  - Footer: **`Clear All`** (outline, left) and **`Apply Filters`** (primary, right).
  - After Apply the panel closes, the tree is narrowed, and the funnel icon in the dropdown's
    search bar carries a small dark **count badge** (`1` in `C5`, `3` elsewhere).
- Selected values render outside the trigger as **chips** in a `tab group`: `Euro Car Parts`, `Euro Car Parts Ltd`, `+3` overflow chip. Chip hover state exists (B8). The review screens show `+30`, so the overflow chip must handle 2-digit counts.

**Mock data:** build a `companyTree` fixture ~40 leaves deep enough that `+30` is reachable, with a `country` property per node so the country filter actually does something in the demo.

---

## 5. Flow & routing

Two paths, chosen by the account number entered.

```
/                      → Overview                (Back disabled, Next → /setup)
/setup                 → Dashboard Settings form
  ↳ account number blur → accountLookup(number)
       ├─ no match      → stay on the form   (happy flow, rows B–E)
       └─ match(es)     → ExistingDashboardsModal   (rows F–G)
             ├─ select a row        → continue with that dashboard
             └─ Create a New Dashboard → dismiss, continue as happy flow
  ↳ submit             → loading overlay (~2.5s, progress 0→100%)
  ↳ done               → success overlay
/setup?mode=review     → review mode (read-only + pencil per row)
  ↳ edit               → back to editable form, footer becomes Save/Cancel
```

**`accountLookup` seam:** one function in `src/mocks/accountLookup.ts` maps an account number to
`{ existing: Dashboard[] }`. It is the only place that decides which path the demo takes — nothing
else in the app branches on the account number. Seed it per §7.1.

---

## 6. Component inventory

From the Figma instance names — build these once, reuse everywhere:

| Component                 | Figma instance                            | Variants seen                                      |
| ------------------------- | ----------------------------------------- | -------------------------------------------------- |
| `WizardTopStrip`          | `wizard top strip`                        | —                                                  |
| `WizardBottomStrip`       | `wizard bottom strip`                     | Back+Next, Back+Submit(disabled/enabled)           |
| `SideNav`                 | `side bar` / `Button` / `Button (margin)` | active, default                                    |
| `InputWithHeader`         | `Input w header`                          | empty, hover, focus, filled, required              |
| `RadioField`              | `radio field`                             | No/Yes                                             |
| `Checkbox`                | `checkbox`                                | unchecked, checked, indeterminate                  |
| `Select`                  | —                                         | closed, open (regular), open (3-tier)              |
| `TreeSelect`              | —                                         | see §4                                             |
| `FilterPanel`             | `Filter` / `Filter Properties`            | idle, typing, results, applied                     |
| `Chip` / `ChipGroup`      | `tag` / `tab group`                       | default, hover, overflow (`+N`)                    |
| `Tooltip`                 | `Tooltip`                                 | anchored to info icon                              |
| `UploadButton`            | `Master` + `LogoIpsum Asset`              | empty, hover, uploaded                             |
| `LoadingOverlay`          | `Frame 2147225060`                        | with progress                                      |
| `SuccessOverlay`          | `Frame 2147225061`                        | —                                                  |
| `ReviewRow`               | `Frame 2147225458`                        | text value, chip values, with/without pencil       |
| `DataTable`               | `Table` / `table line` / `table cell`     | default, row hover, row selected                   |
| `ExistingDashboardsModal` | `Frame 2147225060`                        | 3 results (F), 1 result (G)                        |
| `Tag`                     | `Tag`                                     | Upgrade (green), None (grey), Add Licenses (amber) |

Icons are **Lucide** throughout (`Icon 24/Filter-Lucide`, `Icon 24/Search-Lucide`, `Icon 24/Download-Lucide`, `Icon 24/Pencil-Line-Lucide`, `Icon 16/Info-Lucide`, `Hash`, `Mail`, `Factory`, `Graduation-Cap`, `Circle-User`, `Image`, `File-Check`, `Handshake`). Use `lucide-react` — do not export icon SVGs from Figma.

---

## 7. Open items — resolve before or during the build

**Closed since v3:** company names and the mystery 6th table column (it is a hover-only action
button — §Row F); the filter panel's real anatomy (§4); the success overlay's contents (§5).

1. **Which account numbers trigger what.** Rows F/G are in scope, so the demo needs a way to reach
   them in front of the client. Default unless you say otherwise: seed three numbers in
   `accountLookup` — `189189189` → no match (happy flow, matches the Figma filled state),
   one number → three existing dashboards (row F), one number → a single OneCare dashboard (row G).
   Hand the client a card with the three numbers rather than relying on memory mid-demo.

2. **Which review layout ships.** Four exist (§Row E). Pick one with the designer before building;
   they are not variants of one component, they are four different arrangements.

3. **Sisense component library.** The decision is "follow the Sisense library". Verify what that
   concretely means before writing components: is there an internal Zebra/Sisense npm package you
   can install, or is it a visual language you re-implement? `@sisense/sdk-ui` is the
   analytics-embedding SDK — it does **not** ship the form controls in this design. If there is no
   installable package, build a local `components/ui/*` that matches the frames pixel-for-pixel and
   keep every component's public API boring, so swapping in the real library later is a
   find-and-replace rather than a rewrite.

4. **Design tokens not extracted.** The Figma MCP is capped on a View seat, and the variables panel
   lives in Dev Mode, which a View seat cannot open. Either upgrade the seat, or have someone with a
   Dev seat export the variables, or sample the colors off `screens/` and accept the drift. Do this
   before styling anything, and generate `src/styles/tokens.css` from the result.

5. **Copy typos** in the Figma: "confgure", "notifed", "identifer", "data fow", "service ofer",
   "refect", "Select compony name...", "Euro Car Parts Irland". Reproduce verbatim, hand the client
   a list.

6. **Edit mode's primary button says `Edit`, not `Save`** (§Row E). Almost certainly a slip.

7. **Email casing** is `Useremail@gmail.com` in the form and `Useremail@Gmail.Com` in the R-column
   review frames. Pick one.

8. **Success overlay has no dismiss control.** Auto-advance, or a button the designer omitted?

9. **Sidebar items 2–7** — inert but full-contrast. Disabled styling or not?

10. **`Back` on the Overview** — where does it go? It is the first screen.

## 8. Verification checklist for the finished demo

- [ ] Every screen in §1 rows A–G reproduced at 1920×1080, side by side with the Figma frame
- [ ] Tree select: parent/child/indeterminate, search, country filter with badge, `+N` overflow chip
- [ ] Submit disabled until all required fields valid; enabled state matches B7
- [ ] Loading → success sequence runs without a click
- [ ] Review mode reachable and matches the right-hand column screens
- [ ] Existing Dashboards modal: three-row variant (F) and single-row variant (G), row hover and
      row selected, `Create a New Dashboard` dismisses and returns to the happy flow
- [ ] All three seeded account numbers reach their intended path
- [ ] All hover states present (field, chip, logo, buttons, info icons)
- [ ] Responsive down to 1280 without horizontal scroll (Figma is fixed-width — decide with the client)
- [ ] No console errors; Lighthouse a11y ≥ 90

---

## 9. Completeness audit

Ran against the raw Figma metadata for the section (`7000 < y < 19600`, `-800 < x < 21500`,
frames named `wizard` or `notes`):

| Row                               | Screens   | Node ids                                                                                                                                  |
| --------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A — Overview                      | 1         | `8474:11927`                                                                                                                              |
| B — Happy flow                    | 10        | `10489:76487` `8135:2690` `10489:76991` `10489:77480` `10489:77782` `10489:78221` `10489:78667` `10489:79003` `10489:79600` `10489:79811` |
| C — Filter flow                   | 5         | `11153:92265` `11137:85205` `11137:89921` `11153:91657` `11153:92575`                                                                     |
| D — Tooltip                       | 3         | `10489:80202` `10489:80363` `10489:76248`                                                                                                 |
| E — Review and Edit               | 3 + notes | `8901:9551` `10489:80942` `10489:80741` + `9082:6667`                                                                                     |
| F — Existing Dashboards, 3 types  | 6         | `10489:81290` `10489:82761` `10489:83067` `11134:11303` `11134:11613` `11134:11999`                                                       |
| G — Existing Dashboards, single   | 3         | `10489:81444` `10489:82718` `10489:83024`                                                                                                 |
| Review column (right, red-marked) | 4         | `10680:16649` `10680:15949` `10680:16436` `10680:16540`                                                                                   |
| **Total**                         | **36**    | all present in this spec                                                                                                                  |

Nothing on the canvas in this section is unaccounted for.

---

## 10. Screenshot index (`screens/`)

All 36 frames, captured from the live Figma file at 1456×832. Filenames end in the node id.

| File prefix   | Frame                                                               |
| ------------- | ------------------------------------------------------------------- |
| `A1_`         | Overview                                                            |
| `B01_`–`B10_` | Happy flow, in canvas order                                         |
| `C1_`–`C5_`   | Filter flow                                                         |
| `D1_`–`D3_`   | Tooltips                                                            |
| `E1_`–`E4_`   | Review, Edit, Edit variant, Dev-notes sticky                        |
| `F1_`–`F6_`   | Existing Dashboards, 3 types (`F2b_` is a zoomed crop of the modal) |
| `G1_`–`G3_`   | Existing Dashboards, single direct OneCare                          |
| `R1_`–`R4_`   | The four review-mode layouts from the right-hand column             |

Hand these to Claude Code alongside this spec. When it builds a screen, point it at the matching
file by name and require a side-by-side before the screen is called done.
