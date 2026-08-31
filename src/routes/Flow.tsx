import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router'
import { FlowBar } from '@/components/wizard/FlowBar'
import { useDemoStore } from '@/flow/demoState'
import { FLOW_SCREENS } from '@/flow/screens'
import { DashboardSettings } from '@/routes/DashboardSettings'
import { DashboardSettingsReview } from '@/routes/DashboardSettingsReview'
import { Overview } from '@/routes/Overview'
import { useWizardStore } from '@/store/wizard'

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
  const { screenId } = useParams<{ screenId?: string }>()
  const navigate = useNavigate()

  const rawIndex = screenId ? FLOW_SCREENS.findIndex((s) => s.id === screenId) : 0
  // Defaults to the first screen: no id (`/flow`) or an id that doesn't
  // match any registry entry (a bad deep link) both fall back to index 0
  // rather than crashing or rendering nothing.
  const index = rawIndex === -1 ? 0 : rawIndex
  const screen = FLOW_SCREENS[index]

  // Drives the app into `screen`'s exact state every time the screen
  // changes. Order matters: reset the wizard store, clear the demo-override
  // store, THEN apply this screen's setup — that's what makes every screen
  // reachable directly by URL in any order (the jump list depends on it),
  // and what stops leftover state (e.g. R3's review data) from bleeding
  // into the next screen visited (e.g. a jump straight to B01).
  //
  // This runs inline during render (guarded by a ref, not in an effect —
  // not even `useLayoutEffect`). That's deliberate, and the previous
  // `useLayoutEffect` version here was a real, verified-by-screenshot bug:
  // `<Page key={screen.id}>` below remounts on every screen change, and
  // TreeSelect's `defaultOpen`/`defaultCountries`/`defaultFilterPanelOpen`/
  // `defaultFilterQuery`/`defaultFilterDraft` only seed *initial* state on
  // that fresh mount. An effect on the PARENT (`Flow`) — layout or
  // otherwise — always fires *after* the child has already committed its
  // first render, because the child had to render before this component's
  // own commit (and therefore its effects) can happen at all. So the old
  // `useLayoutEffect` reliably ran one commit too late: the fresh
  // `TreeSelect` had already locked in `open: false` from the
  // not-yet-cleared/not-yet-set-up store. Mutating the store here, in the
  // render body, guarantees it happens before `<Page key={screen.id}>` is
  // even created below, in the same pass. The `lastAppliedScreenId` guard
  // makes this idempotent (safe under React 19 Strict Mode's double-render)
  // and keeps it running once per screen change, exactly like the effect it
  // replaces.
  const lastAppliedScreenId = useRef<string | null>(null)
  if (lastAppliedScreenId.current !== screen.id) {
    lastAppliedScreenId.current = screen.id
    useWizardStore.getState().reset()
    useDemoStore.getState().clear()
    screen.setup()
  }

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
      {/* `key` forces a full remount per screen — see the comment above. */}
      <Page key={screen.id} />
    </>
  )
}
