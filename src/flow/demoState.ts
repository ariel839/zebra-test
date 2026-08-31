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
 *   const forced = useDemoStore((s) => s.hover === 'field:accountNumber')
 *   const isHovered = localHover || forced   // additive — NEVER `= forced`
 *
 * Outside the flow (i.e. on any ordinary route — `/setup`, `/`, etc.) this
 * store is never written to, so `hover` and `open` are always `null`, so
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
 */

export interface DemoState {
  /** Which single hover target is forced on, or null. See key examples above. */
  hover: string | null
  /** Which single open/expanded target is forced on, or null. See key examples above. */
  open: string | null
  /** Seeds TreeSelect's applied country filter via its `defaultCountries` prop (Task 9). */
  countries: string[] | null
  set: (patch: Partial<Pick<DemoState, 'hover' | 'open' | 'countries'>>) => void
  /** Resets all three to null. Called by the flow route on every screen change. */
  clear: () => void
}

export const useDemoStore = create<DemoState>((set) => ({
  hover: null,
  open: null,
  countries: null,
  set: (patch) => set(patch),
  clear: () => set({ hover: null, open: null, countries: null }),
}))

/**
 * Typed helper so call sites compare against a key without stringly-typing
 * `useDemoStore((s) => s.hover === key)` at every OR-site. Returns `false`
 * for every key when the store is empty (the default, outside the flow).
 */
export function useForcedHover(key: string): boolean {
  return useDemoStore((s) => s.hover === key)
}

/**
 * Typed helper mirroring {@link useForcedHover} for the `open` slot.
 * Returns `false` for every key when the store is empty.
 */
export function useForcedOpen(key: string): boolean {
  return useDemoStore((s) => s.open === key)
}
