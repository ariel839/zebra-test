import { createPortal } from 'react-dom'
import { useLoaderData, useNavigate } from 'react-router'
import { FlowBar } from '@/components/wizard/FlowBar'
import type { FlowScreen } from '@/flow/screens'
import { FLOW_SCREENS } from '@/flow/screens'
import { DashboardSettings } from '@/routes/DashboardSettings'
import { DashboardSettingsReview } from '@/routes/DashboardSettingsReview'
import { Overview } from '@/routes/Overview'

/** Maps each `FlowScreen.route` to the page component `Flow` mounts for it. */
const ROUTE_PAGES = {
  '/': Overview,
  '/setup': DashboardSettings,
  '/review': DashboardSettingsReview,
} as const

/**
 * `/flow` and `/flow/:screenId` — the client-facing guided click-through
 * (Task 17). Walks every built screen in `FLOW_SCREENS` (canvas order),
 * driving the real app into each one via `screen.setup()`.
 *
 * The store-driving (`reset()` / `clear()` / `screen.setup()`) happens in
 * this route's `loader` (see `router.tsx`), not here — a loader runs before
 * this component (re)renders, which is what a freshly-mounted `TreeSelect`'s
 * `defaultOpen`/`defaultCountries`-style seed props need. `useLoaderData()`
 * just reads the already-resolved `{ screen, index }` back out.
 *
 * The whole app is already wrapped in a single `ScaleToFit` at the root
 * (`src/main.tsx`), so there is no un-scaled document-flow region left for
 * `FlowBar` to render into from inside this component's own tree — it would
 * shrink along with the 1920x1080 canvas on any viewport smaller than that.
 * This portals the bar to `document.body`, outside that transformed
 * subtree entirely, pinned to the top of the real viewport. That also means
 * the `position: fixed` used to pin it is NOT "inside the canvas" (the
 * scaled subtree) that the global constraint bans it from — the portalled
 * node never lives inside that subtree in the DOM, regardless of where it's
 * declared in JSX.
 */
export function Flow() {
  const { screen, index } = useLoaderData() as { screen: FlowScreen; index: number }
  const navigate = useNavigate()

  const Page = ROUTE_PAGES[screen.route]

  const goTo = (i: number) => navigate(`/flow/${FLOW_SCREENS[i].id}`)

  return (
    <>
      {createPortal(
        <div className="fixed inset-x-0 top-0 z-999">
          <FlowBar
            screens={FLOW_SCREENS}
            currentIndex={index}
            onPrev={() => goTo(Math.max(0, index - 1))}
            onNext={() => goTo(Math.min(FLOW_SCREENS.length - 1, index + 1))}
            onJump={goTo}
          />
        </div>,
        document.body,
      )}
      {/* `key` forces a full remount per screen — see `router.tsx`'s loader
          comment for why the store must already reflect this screen's state
          by the time this fresh mount happens. */}
      <Page key={screen.id} />
    </>
  )
}
