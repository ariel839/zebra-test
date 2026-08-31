import type { CompanyNode } from '@/components/ui/TreeSelect/types'
import { useDemoStore } from '@/flow/demoState'
import { COMPANY_TREE } from '@/mocks/companyTree'
import { useWizardStore, type WizardForm } from '@/store/wizard'

/**
 * The guided-flow screen registry — Task 17b.
 *
 * One entry per built screen (31 of the 35 UI frames in spec §9 — see the
 * bottom of this file for exactly what's excluded and why). `route` names
 * which page `src/routes/Flow.tsx` mounts for this screen; `setup()` drives
 * the app into that screen's exact state and runs AFTER the flow route has
 * already reset both `useWizardStore` and `useDemoStore` for this
 * navigation, so every `setup()` here only needs to describe the delta from
 * a clean slate, never a full reset.
 *
 * `setup()` must be idempotent — the flow re-runs it every time this screen
 * is (re)visited, including revisiting the same screen twice in a row.
 */
export interface FlowScreen {
  /** Matches the screens/ filename prefix: 'B06', 'F4', 'R3'. */
  id: string
  label: string
  /** Figma node id (colon form), for the side-by-side against the PNG. */
  node: string
  /** Filename in wizard-spec-files/screens/. */
  png: string
  /** Which page `Flow.tsx` mounts for this screen — see ROUTE_PAGES there. */
  route: '/' | '/setup' | '/review'
  /** Puts the app into this exact state. Must be idempotent. */
  setup: () => void
}

// ---------------------------------------------------------------------------
// FILLED_FORM — the B07 "everything filled in" state, reused by B07, B08 (logo
// present so its hover card renders), E2, E3 and R3.
// ---------------------------------------------------------------------------

/**
 * A small inline `data:` image so the logo card/panel has something to show
 * without a real file upload (no backend, no fetch — a data URI is neither).
 */
const PLACEHOLDER_LOGO_SVG =
  // Traced off B07's 120x120 logo card (x288..408, y554..674): the frame uses
  // the "logoipsum" placeholder mark — a dark-green square (#113322) and two
  // circles (#4a4582, #8e3f5a) on a 20px row at card-relative y36, with the
  // wordmark under it at y62..80. Reproduced here so the demo screens show the
  // same artwork the frames do instead of a flat blue swatch.
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' +
  '<rect width="120" height="120" fill="#ffffff"/>' +
  '<rect x="14" y="36" width="20" height="20" fill="#113322"/>' +
  '<circle cx="46" cy="46" r="10" fill="#4a4582"/>' +
  '<circle cx="68" cy="46" r="11" fill="#8e3f5a"/>' +
  '<text x="14" y="79" font-family="Roboto, sans-serif" font-size="20" font-weight="700"' +
  ' fill="#111111">logoipsum</text>' +
  '<circle cx="103" cy="64" r="2.5" fill="#111111"/>' +
  '</svg>'
const PLACEHOLDER_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_LOGO_SVG)}`

function leavesOf(node: CompanyNode): string[] {
  if (!node.children?.length) return [node.id]
  return node.children.flatMap(leavesOf)
}

function leavesOfBranch(path: string): string[] {
  const find = (nodes: CompanyNode[]): CompanyNode | undefined => {
    for (const n of nodes) {
      if (n.id === path) return n
      const hit = n.children && find(n.children)
      if (hit) return hit
    }
    return undefined
  }
  const node = find(COMPANY_TREE)
  if (!node) throw new Error(`No such company-tree node: ${path}`)
  return leavesOf(node)
}

/**
 * B07 / E2's chip row, verbatim: `Euro Car Parts` · `Euro Car Parts Ltd` · `+3`.
 *
 * `selectedLabels` emits a label for every fully-checked node, so the whole
 * `Euro Car Parts` branch is four labels (the parent plus its three leaves)
 * and one extra leaf makes five — which is exactly the two shown chips plus
 * `+3` at the form's `max={2}`. The extra leaf is `Auto Kelly a.s.`, chosen
 * because it sorts after the Euro Car Parts branch, so the two *visible*
 * chips are the ones the frame draws.
 */
function buildFilledTreeSelection(): string[] {
  return [...leavesOfBranch('lkq.ecp'), 'lkq.ak.cz']
}

/**
 * The review frames (R3, E2, E3) draw a fuller selection than B07 does: every
 * second-tier branch contributes, and all but one leaf of each branch other
 * than `Euro Car Parts` is checked, so those branches stay indeterminate and
 * list their leaves individually instead of collapsing to one chip. That is
 * what pushes the label count past the review chip row's `max` and produces
 * its two-digit `+NN`.
 */
function buildReviewTreeSelection(): string[] {
  const ids: string[] = []
  for (const brand of COMPANY_TREE) {
    for (const mid of brand.children ?? []) {
      const leaves = leavesOf(mid)
      if (mid.id === 'lkq.ecp') ids.push(...leaves)
      else ids.push(...leaves.slice(0, -1))
    }
  }
  return ids
}

export const FILLED_FORM: WizardForm = {
  accountNumber: '189189189',
  // 'ecp-account' — the "Euro Car Parts" option with the blue "Account"
  // badge (verified against B07 in the task-12 report), not the Subsidiary
  // option that shares the same label.
  companyName: 'ecp-account',
  displayName: 'Euro Car Parts',
  automaticallyAddContracts: 'yes',
  validCompanyNames: buildFilledTreeSelection(),
  contractTypes: ['IOT Mobile Computer', 'IOT Printer'],
  userEmail: 'Useremail@gmail.com',
  signUpForLearningSeries: false,
  companyLogo: PLACEHOLDER_LOGO,
}

/** `FILLED_FORM` with the larger selection the read-only review frames draw. */
export const REVIEW_FILLED_FORM: WizardForm = {
  ...FILLED_FORM,
  validCompanyNames: buildReviewTreeSelection(),
}

// ---------------------------------------------------------------------------
// Registry, in canvas order.
// ---------------------------------------------------------------------------

export const FLOW_SCREENS: FlowScreen[] = [
  {
    id: 'A1',
    label: 'Overview',
    node: '8474:11927',
    png: 'A1_overview__8474-11927.png',
    route: '/',
    setup: () => {},
  },

  // --- Row B — Dashboard Settings form -------------------------------------
  {
    id: 'B01',
    label: 'Default, all fields empty',
    node: '10489:76487',
    png: 'B01_default-all-fields-empty__10489-76487.png',
    route: '/setup',
    // The flow route's reset() already produces this state — nothing to add.
    setup: () => {},
  },
  {
    id: 'B02',
    label: 'Automatically add contracts = No',
    node: '8135:2690',
    png: 'B02_auto-add-contracts-no__8135-2690.png',
    route: '/setup',
    setup: () => {
      useWizardStore.getState().setField('automaticallyAddContracts', 'no')
    },
  },
  {
    id: 'B03',
    label: 'Field hover',
    node: '10489:76991',
    png: 'B03_field-hover__10489-76991.png',
    route: '/setup',
    setup: () => {
      useDemoStore.getState().set({ hover: ['field:accountNumber'] })
    },
  },
  {
    id: 'B04',
    label: 'Selected field',
    node: '10489:77480',
    png: 'B04_selected-field__10489-77480.png',
    route: '/setup',
    // Per Input.tsx's own comment, B04's "selected" (focus) border colour is
    // pixel-identical to B03's hover colour in the source frames (no
    // distinct focus treatment was drawn) — so this reuses the same
    // 'field:accountNumber' hover key rather than inventing a second,
    // visually-identical one.
    setup: () => {
      useDemoStore.getState().set({ hover: ['field:accountNumber'] })
    },
  },
  {
    id: 'B05',
    label: 'Regular selection dropdown',
    node: '10489:77782',
    png: 'B05_regular-selection-dropdown__10489-77782.png',
    route: '/setup',
    setup: () => {
      useDemoStore.getState().set({ open: ['select:companyName'] })
    },
  },
  {
    id: 'B06',
    label: '3-tier dropdown with search',
    node: '10489:78221',
    png: 'B06_3tier-dropdown-with-search__10489-78221.png',
    route: '/setup',
    setup: () => {
      useDemoStore.getState().set({ open: ['tree'] })
    },
  },
  {
    id: 'B07',
    label: 'Filled',
    node: '10489:78667',
    png: 'B07_filled__10489-78667.png',
    route: '/setup',
    setup: () => {
      useWizardStore.setState({ form: FILLED_FORM })
    },
  },
  {
    id: 'B08',
    label: 'Logo / chip / button hover',
    node: '10489:79003',
    png: 'B08_logo-chip-button-hover__10489-79003.png',
    route: '/setup',
    // B08 *is* B07 with hovers applied — same filled form, including the
    // company chip row and both contract chips — so it starts from
    // FILLED_FORM rather than seeding the two hover subjects alone.
    // Forces both subjects at once — the logo card AND the 'IOT Mobile
    // Computer' contract-type chip — since `hover` is an array, not a
    // single key.
    setup: () => {
      useWizardStore.setState({ form: FILLED_FORM })
      useDemoStore.getState().set({ hover: ['logo', 'chip:ecp'] })
    },
  },
  {
    id: 'B09',
    label: 'Loading',
    node: '10489:79600',
    png: 'B09_loading__10489-79600.png',
    route: '/setup',
    // Purely store-driven: submit() runs the real ~2.5s progress animation
    // (spec §5), restarting cleanly every visit because the flow route's
    // reset() puts status back to 'idle' first.
    setup: () => {
      useWizardStore.getState().submit()
    },
  },
  {
    id: 'B10',
    label: 'Success',
    node: '10489:79811',
    png: 'B10_success__10489-79811.png',
    route: '/setup',
    // Sets status straight to 'done' rather than calling submit() and
    // waiting ~2.5s for it to get there.
    setup: () => {
      useWizardStore.setState({ status: 'done', progress: 100 })
    },
  },

  // --- Row C — country/region filter panel ---------------------------------
  {
    id: 'C1',
    label: 'Click filter icon',
    node: '11153:92265',
    png: 'C1_click-filter-icon__11153-92265.png',
    route: '/setup',
    // Tree dropdown open, filter panel still CLOSED — the frame is the
    // moment of the click on the funnel icon, and it shows no panel at all
    // (verified against the render: nothing is drawn right of the form).
    setup: () => {
      useDemoStore.getState().set({ open: ['tree'] })
    },
  },
  {
    id: 'C2',
    label: 'Type country/region',
    node: '11137:85205',
    png: 'C2_type-country-region__11137-85205.png',
    route: '/setup',
    // Panel open with an empty search box — the frame draws a text caret
    // and no suggestions, so nothing is typed yet. C3 is the typed state.
    setup: () => {
      useDemoStore.getState().set({ open: ['tree', 'filterPanel'] })
    },
  },
  {
    id: 'C3',
    label: 'Suggested search results',
    node: '11137:89921',
    png: 'C3_suggested-search-results__11137-89921.png',
    route: '/setup',
    // Same query as C2 — this frame is the suggestion list that renders
    // underneath it once 'Ca' matches Canada/Cambodia/Cameroon/Cape Verde.
    setup: () => {
      useDemoStore.getState().set({ open: ['tree', 'filterPanel'], filterQuery: 'Ca' })
    },
  },
  {
    id: 'C4',
    label: 'Selected filter, apply',
    node: '11153:91657',
    png: 'C4_selected-filter-apply__11153-91657.png',
    route: '/setup',
    // Canada staged in the panel's draft (chip visible, Apply Filters
    // enabled) but not yet committed — `countries` (the applied filter)
    // stays unset here; only `filterDraft` seeds the panel's own state.
    setup: () => {
      useDemoStore.getState().set({ open: ['tree', 'filterPanel'], filterDraft: ['Canada'] })
    },
  },
  {
    id: 'C5',
    label: 'Filters applied',
    node: '11153:92575',
    png: 'C5_filters-applied__11153-92575.png',
    route: '/setup',
    // Filter panel closed, applied filter committed — badge count shows on
    // the funnel icon, tree stays open underneath.
    setup: () => {
      useDemoStore.getState().set({ open: ['tree'], countries: ['Canada'] })
    },
  },

  // --- Row D — tooltips ------------------------------------------------------
  {
    id: 'D1',
    label: 'Tooltip: account number',
    node: '10489:80202',
    png: 'D1_tooltip-account-number__10489-80202.png',
    route: '/setup',
    setup: () => {
      useDemoStore.getState().set({ open: ['tooltip:accountNumber'] })
    },
  },
  {
    id: 'D2',
    label: 'Tooltip: company name',
    node: '10489:80363',
    png: 'D2_tooltip-company-name__10489-80363.png',
    route: '/setup',
    setup: () => {
      useDemoStore.getState().set({ open: ['tooltip:companyName'] })
    },
  },
  {
    id: 'D3',
    label: 'Tooltip: company name, submit hover',
    node: '10489:76248',
    png: 'D3_tooltip-submit-hover__10489-76248.png',
    route: '/setup',
    // The frame's name is misleading and this screen used to follow it: it
    // showed an invented tooltip anchored to Submit. Reading the frame
    // (cropped and upscaled — the export is 1456px wide, so the tooltip is
    // illegible at 1:1) shows two things at once and no tooltip on Submit:
    // the **Company name** tooltip open, carrying the same string as D2, and
    // the Submit button in its hover state. That is what this reproduces.
    setup: () => {
      useDemoStore.getState().set({ open: ['tooltip:companyName'], hover: ['button:submit'] })
    },
  },

  // --- Row E — edit mode (reached from review) ------------------------------
  {
    id: 'E2',
    label: 'Edit',
    node: '10489:80942',
    png: 'E2_edit__10489-80942.png',
    route: '/review',
    setup: () => {
      useWizardStore.setState({ form: FILLED_FORM, mode: 'edit' })
    },
  },
  {
    id: 'E3',
    label: 'Edit variant',
    node: '10489:80741',
    png: 'E3_edit-variant__10489-80741.png',
    route: '/review',
    // E2 and E3 are two Figma captures of the same edit-mode layout (Task
    // 16 built one component for both) — same setup, deliberately.
    setup: () => {
      useWizardStore.setState({ form: FILLED_FORM, mode: 'edit' })
    },
  },

  // --- Row F — account lookup, three existing dashboards --------------------
  {
    id: 'F1',
    label: 'Enter account number',
    node: '10489:81290',
    png: 'F1_enter-account-number__10489-81290.png',
    route: '/setup',
    // Typed but not yet blurred — runLookup() is the only thing that opens
    // the modal, and it's never called here.
    setup: () => {
      useWizardStore.getState().setField('accountNumber', '333333333')
    },
  },
  {
    id: 'F2',
    label: 'Existing dashboards detected',
    node: '10489:82761',
    png: 'F2_existing-dashboards-detected__10489-82761.png',
    route: '/setup',
    setup: () => {
      const w = useWizardStore.getState()
      w.setField('accountNumber', '333333333')
      w.runLookup()
    },
  },
  {
    id: 'F3',
    label: 'Row hover: upgrade',
    node: '10489:83067',
    png: 'F3_row-hover-upgrade__10489-83067.png',
    route: '/setup',
    // 'row:ah' = Albert Heijn, the 'Upgrade' row.
    setup: () => {
      const w = useWizardStore.getState()
      w.setField('accountNumber', '333333333')
      w.runLookup()
      useDemoStore.getState().set({ hover: ['row:ah'] })
    },
  },
  {
    id: 'F4',
    label: 'Row hover: none',
    node: '11134:11303',
    png: 'F4_row-hover-none__11134-11303.png',
    route: '/setup',
    // 'row:acz' = Albert CZ, supportedAction 'None' — hovers grey with no
    // action button.
    setup: () => {
      const w = useWizardStore.getState()
      w.setField('accountNumber', '333333333')
      w.runLookup()
      useDemoStore.getState().set({ hover: ['row:acz'] })
    },
  },
  {
    id: 'F5',
    label: 'Row hover: add licenses',
    node: '11134:11613',
    png: 'F5_row-hover-add-licenses__11134-11613.png',
    route: '/setup',
    // 'row:ad' = Ahold Delhaize, 'Add Licenses'.
    setup: () => {
      const w = useWizardStore.getState()
      w.setField('accountNumber', '333333333')
      w.runLookup()
      useDemoStore.getState().set({ hover: ['row:ad'] })
    },
  },
  {
    id: 'F6',
    label: 'Create new dashboard hover',
    node: '11134:11999',
    png: 'F6_create-new-dashboard-hover__11134-11999.png',
    route: '/setup',
    setup: () => {
      const w = useWizardStore.getState()
      w.setField('accountNumber', '333333333')
      w.runLookup()
      useDemoStore.getState().set({ hover: ['button:createNew'] })
    },
  },

  // --- Row G — account lookup, single direct OneCare dashboard --------------
  {
    id: 'G1',
    label: 'Enter account number',
    node: '10489:81444',
    png: 'G1_enter-account-number__10489-81444.png',
    route: '/setup',
    setup: () => {
      useWizardStore.getState().setField('accountNumber', '111111111')
    },
  },
  {
    id: 'G2',
    label: 'Single OneCare detected',
    node: '10489:82718',
    png: 'G2_single-onecare-detected__10489-82718.png',
    route: '/setup',
    setup: () => {
      const w = useWizardStore.getState()
      w.setField('accountNumber', '111111111')
      w.runLookup()
    },
  },
  {
    id: 'G3',
    label: 'Row hover: upgrade',
    node: '10489:83024',
    png: 'G3_row-hover-upgrade__10489-83024.png',
    route: '/setup',
    // 'row:ah' = Albert Heijn, the only row in this result set.
    setup: () => {
      const w = useWizardStore.getState()
      w.setField('accountNumber', '111111111')
      w.runLookup()
      useDemoStore.getState().set({ hover: ['row:ah'] })
    },
  },

  // --- Review ----------------------------------------------------------------
  {
    id: 'R3',
    label: 'Review (logo left)',
    node: '10680:16436',
    png: 'R3_review-logo-left__10680-16436.png',
    route: '/review',
    setup: () => {
      useWizardStore.setState({ form: REVIEW_FILLED_FORM, mode: 'review' })
    },
  },
]

/**
 * Not built, per the explicit scope decision recorded in Task 16/18: `E1`
 * (a boxed-card review arrangement, same as `R1`), `R1`, `R2` and `R4` are
 * three other review-screen layouts the client didn't pick — only `R3`
 * shipped. `E4` is a Figma dev-notes sticky note, not a UI screen. That is
 * 35 - 4 = 31, matching this registry's length.
 */
