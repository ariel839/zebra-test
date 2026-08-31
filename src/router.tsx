import { createBrowserRouter } from 'react-router'
import { useDemoStore } from '@/flow/demoState'
import { FLOW_SCREENS } from '@/flow/screens'
import { DashboardSettings } from '@/routes/DashboardSettings'
import { DashboardSettingsReview } from '@/routes/DashboardSettingsReview'
import { Flow } from '@/routes/Flow'
import { Overview } from '@/routes/Overview'
import { TreeSelectSandbox } from '@/routes/TreeSelectSandbox'
import { useWizardStore } from '@/store/wizard'

/**
 * Drives the app into a `/flow` screen's exact state — a router `loader`
 * runs BEFORE the route's element (re)renders, and entirely outside React's
 * render cycle, which is exactly what this needs: it resets the wizard
 * store, clears the demo-override store, then runs the resolved screen's
 * `setup()`, so that by the time `Flow` (and the page it mounts) render for
 * this navigation, every store read during that render — including a
 * freshly-mounted `TreeSelect`'s `defaultOpen`/`defaultCountries`-style seed
 * props, which only read their initial value once, at mount — already sees
 * the new screen's state.
 *
 * This used to be a `useLayoutEffect` inside `Flow` itself, keyed on the
 * resolved screen. That doesn't work: `Flow`'s effects (layout or not) only
 * fire *after* `Flow`'s own render has produced and committed its child
 * tree, so a freshly-mounted `TreeSelect` had already locked in `open:
 * false` from the not-yet-reset store by the time the effect ran — one
 * commit too late. Nor can `Flow` just mutate the store directly in its own
 * render body: the demo store's subscribers (`DashboardSettingsForm`, via
 * `useForcedHover`/`useForcedOpen`) are still-mounted components from the
 * *previous* screen at that point, and forcing them to update while `Flow`
 * itself is mid-render trips React's "Cannot update a component while
 * rendering a different component" rule. A loader runs before any of this
 * component's rendering starts, so neither problem applies.
 */
function flowLoader({ params }: { params: { screenId?: string } }) {
  const rawIndex = params.screenId ? FLOW_SCREENS.findIndex((s) => s.id === params.screenId) : 0
  // Defaults to the first screen: no id (`/flow`) or an id that doesn't
  // match any registry entry (a bad deep link) both fall back to index 0
  // rather than crashing or rendering nothing.
  const index = rawIndex === -1 ? 0 : rawIndex
  const screen = FLOW_SCREENS[index]

  useWizardStore.getState().reset()
  useDemoStore.getState().clear()
  screen.setup()

  return { screen, index }
}

export const router = createBrowserRouter([
  { path: '/', element: <Overview /> },
  { path: '/setup', element: <DashboardSettings /> },
  // Review mode (R3) and edit-from-review mode (E2/E3) — DashboardSettingsForm
  // never reads `mode`, so review/edit is its own route rather than a query
  // param on /setup. Reachable directly (not just via /flow) for completeness.
  { path: '/review', element: <DashboardSettingsReview /> },
  { path: '/sandbox/tree-select', element: <TreeSelectSandbox /> },
  // The guided click-through (Task 17) — every built screen, one route.
  { path: '/flow', element: <Flow />, loader: flowLoader },
  { path: '/flow/:screenId', element: <Flow />, loader: flowLoader },
])
