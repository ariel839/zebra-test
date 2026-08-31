import { create } from 'zustand'

/**
 * The demo-override store — Task 17's one seam into product components.
 *
 * Hover states and open/closed dropdowns are ordinary component-local state
 * (`useState`, or in several places pure CSS `:hover` / `group-hover:`).
 * None of that is reachable from the wizard store, so the guided flow has no
 * way to say "land on this screen with the Account Number field mid-hover"
 * or "with the tree dropdown open." This store is the side channel that lets
 * a flow screen's `setup()` (see `src/flow/screens.ts`, a follow-up file)
 * force exactly that, without the flow reaching into component internals or
 * simulating real mouse/keyboard events.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ THE CONTRACT — read this before wiring a component into the flow.    │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Every consuming component ORs the forced value into its own state. It
 * NEVER replaces it:
 *
 *   const forced = useForcedHover('field:accountNumber')
 *   const isHovered = localHover || forced   // additive — NEVER `= forced`
 *
 * Outside the flow (i.e. on any ordinary route — `/setup`, `/`, etc.) this
 * store is never written to, so `hover` and `open` are always `[]`, so
 * `forced` is always `false` for every key, so `isHovered` reduces to
 * exactly `localHover` — today's behaviour, untouched. An override that
 * *replaces* local state (`isHovered = forced`) would break real interaction
 * everywhere the component is used outside the flow the moment the flow
 * happens to have touched that same boolean at some point in the session —
 * do not do that under any circumstance.
 *
 * A second, less obvious case: several components (`Button`, `Chip`,
 * `DataTable` row/action reveal) render their hover treatment with a pure
 * CSS `hover:` / `group-hover:` pseudo-class and hold no JS hover state at
 * all. There, "OR in the forced value" means: keep the CSS trigger exactly
 * as it is (so real mouse hover keeps working), and additionally apply the
 * same visual classes when `forced` is true, e.g.
 *
 *   className={cn(base, 'hover:bg-viq-surface-hover', forced && 'bg-viq-surface-hover')}
 *
 * — add to the existing trigger, never swap it out.
 *
 * `open` works the same way for dropdowns/panels/tooltips that already carry
 * `useState(false)`. `TreeSelect` is the one exception worth calling out: it
 * already accepts `defaultOpen` / `defaultCountries` props (Task 9) for
 * exactly this purpose, so the OR-site there is the *call site* feeding
 * `useForcedOpen('tree')` / the `countries` value into those props — not a
 * change inside `TreeSelect` itself.
 *
 * Key strings are free-form but namespaced by kind, e.g.:
 *   hover: 'field:accountNumber', 'chip:ecp', 'row:acz', 'button:createNew', 'logo'
 *   open:  'select:companyName', 'tree', 'filterPanel', 'tooltip:accountNumber'
 * Pick one key per forceable target and keep it stable — `screens.ts` and the
 * component's OR-site must agree on the exact string.
 *
 * `hover` and `open` are both arrays, not a single string — a handful of
 * frames genuinely need more than one target forced at once (B08 forces the
 * logo card AND a contract-type chip hovered simultaneously; C1-C5 force the
 * tree dropdown AND the country filter panel open at once). `useForcedHover`
 * / `useForcedOpen` test membership, so a single-target screen just passes a
 * one-element array and everything above still holds.
 *
 * `filterQuery` / `filterDraft` are the same kind of seed as `countries`
 * above, one level deeper: they seed `FilterPanel`'s own local `query` /
 * `draft` state (via its `defaultQuery` / `defaultDraft` props) for the C2
 * ("Type country/region") and C4 ("Selected filter, apply") frames, exactly
 * the way `countries` seeds `TreeSelect`'s `defaultCountries`. Same caveat:
 * these only seed *initial* state, so they rely on the same per-screen
 * remount `Flow.tsx` already does for `TreeSelect`.
 */

/**
 * The three review arrangements the Figma draws, all of the same seven
 * fields. `'dividers'` is R2 — a hairline rule under each field, logo card
 * to the right; `'boxed'` is E1/R1, which puts every field in its own
 * bordered card instead; `'logoLeft'` is R3, a logo panel on the left with
 * a shorter set of ruled rows beside it.
 */
export type ReviewLayout = 'dividers' | 'boxed' | 'logoLeft'

export interface DemoState {
  /** Which hover targets are forced on. See key examples above. */
  hover: string[]
  /** Which open/expanded targets are forced on. See key examples above. */
  open: string[]
  /** Seeds TreeSelect's applied country filter via its `defaultCountries` prop (Task 9). */
  countries: string[] | null
  /** Seeds FilterPanel's `defaultQuery` (C2/C3 — a country name typed but not yet added). */
  filterQuery: string | null
  /** Seeds FilterPanel's `defaultDraft` (C4 — a country staged but not yet applied). */
  filterDraft: string[] | null
  /**
   * Which review-screen arrangement `DashboardSettingsReview` should draw.
   * Null — the value everywhere outside the flow — means the app's own
   * review screen, the R2 `'dividers'` layout. The flow's `E1` and `R3`
   * entries set `'boxed'` and `'logoLeft'` so those alternate layouts stay
   * reachable for the side-by-side against their own frames.
   */
  reviewLayout: ReviewLayout | null
  set: (
    patch: Partial<
      Pick<
        DemoState,
        'hover' | 'open' | 'countries' | 'filterQuery' | 'filterDraft' | 'reviewLayout'
      >
    >,
  ) => void
  /** Resets everything to its empty default. Called by the flow route on every screen change. */
  clear: () => void
}

const EMPTY: DemoState['hover'] = []

export const useDemoStore = create<DemoState>((set) => ({
  hover: EMPTY,
  open: EMPTY,
  countries: null,
  filterQuery: null,
  filterDraft: null,
  reviewLayout: null,
  set: (patch) => set(patch),
  clear: () =>
    set({
      hover: EMPTY,
      open: EMPTY,
      countries: null,
      filterQuery: null,
      filterDraft: null,
      reviewLayout: null,
    }),
}))

/**
 * Typed helper so call sites compare against a key without stringly-typing
 * `useDemoStore((s) => s.hover.includes(key))` at every OR-site. Returns
 * `false` for every key when the store is empty (the default, outside the
 * flow).
 */
export function useForcedHover(key: string): boolean {
  return useDemoStore((s) => s.hover.includes(key))
}

/**
 * Typed helper mirroring {@link useForcedHover} for the `open` slot.
 * Returns `false` for every key when the store is empty.
 */
export function useForcedOpen(key: string): boolean {
  return useDemoStore((s) => s.open.includes(key))
}
