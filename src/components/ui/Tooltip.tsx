import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

export interface TooltipProps {
  content: string
  children: ReactNode
  className?: string
  /**
   * Forces the tooltip open, additively — real hover/focus keeps working
   * regardless. Undefined/false forces nothing (today's behaviour).
   */
  forceOpen?: boolean
}

/** Gap between the trigger and the tooltip box, in design px (was `mb-2`). */
const GAP = 8

/** Box width, and the margin it keeps from the canvas's left/right edges. */
const BOX_WIDTH = 220
const EDGE_MARGIN = 8

/**
 * Room the box needs above the trigger before opening upward is safe:
 * ~65px of content (up to 3 lines) plus the gap and a little slack.
 */
const NEEDED_CLEARANCE = 90

interface Placement {
  left: number
  top: number
  /**
   * `translateY(-100%)` for an upward box: a transform resolves against the
   * element's OWN height, so the box can be lifted clear above `top` without
   * measuring it — and, unlike anchoring to the canvas's bottom edge, the
   * result does not depend on the canvas's height. That matters: `ScaleToFit`
   * renders once at its default 1920x1080 and re-measures on the first
   * `ResizeObserver` callback, so a canvas-height-relative offset computed by
   * a tooltip that opens at mount (every forced-open flow screen does) is
   * stale the moment the real height lands — it drops the box ~100px off.
   */
  transform?: string
}

/**
 * Hover-and-focus triggered tooltip. Never `position: fixed`: the app
 * renders inside a CSS-`transform` scale-to-fit canvas (see `ScaleToFit`),
 * so `fixed` would resolve against the wrong box.
 *
 * Positioning matches Row D (`10489:80202`, `10489:80363`, `10489:76248`):
 * pixel-sampling the three tooltip frames shows the box's left edge landing
 * close to the icon's left edge and growing rightward — not centered — and
 * sitting **above** the trigger, overlapping whatever is above it.
 *
 * That upward placement is what makes the portal necessary. Positioned as an
 * ordinary absolute child of the trigger, a box opening upward from the top
 * field row of `DashboardSettingsForm` renders partly outside that form's own
 * `overflow-y-auto` scroll container and is silently clipped (reproduces with
 * a real keyboard focus on `/setup`, not only the forced demo state). An
 * earlier pass worked around the clip by flipping the box downward whenever
 * there wasn't room above — which is why D1/D2/D3 rendered with the tooltip
 * below the icon, covering the field, where every frame shows it above.
 *
 * So this portals the box to the canvas root (`[data-canvas-root]`, the
 * transformed element itself — still inside the canvas, still `absolute`,
 * so the `fixed` ban is respected) and positions it there in design px.
 * Nothing between the trigger and the canvas can clip it, so upward
 * placement holds for every call site, and the frames are reproduced. The
 * downward flip survives only as the genuine last resort: a trigger with
 * less than `NEEDED_CLEARANCE` above it inside the canvas itself, where
 * opening upward would run off the top of the canvas instead.
 *
 * Placement is measured when the tooltip opens. It is not tracked while
 * open, so a scroll underneath an open tooltip would leave the box behind —
 * in practice the tooltip closes on the mouse or focus leaving the trigger,
 * and the guided flow never scrolls a forced-open one.
 */
export function Tooltip({ content, children, className, forceOpen }: TooltipProps) {
  const [localOpen, setOpen] = useState(false)
  const open = localOpen || forceOpen
  const triggerRef = useRef<HTMLSpanElement>(null)
  const [canvas, setCanvas] = useState<HTMLElement | null>(null)
  const [placement, setPlacement] = useState<Placement | null>(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const root = triggerRef.current.closest<HTMLElement>('[data-canvas-root]')
    if (!root) {
      // No canvas (a component rendered in isolation, e.g. the sandbox
      // route): fall back to an in-flow absolute box, positioned below so it
      // can't be clipped by whatever ancestor happens to be scrolling.
      setCanvas(null)
      setPlacement(null)
      return
    }
    const canvasRect = root.getBoundingClientRect()
    const triggerRect = triggerRef.current.getBoundingClientRect()
    // `offsetWidth` is the canvas's untransformed layout width (the design
    // width in canvas mode, and the real viewport width in responsive mode —
    // where the scale below therefore comes out as exactly 1 and all of this
    // arithmetic degenerates to plain px on its own).
    const canvasWidth = root.offsetWidth
    const scale = canvasWidth > 0 ? canvasRect.width / canvasWidth : 1
    const rawLeft = (triggerRect.left - canvasRect.left) / scale
    const spaceAbove = (triggerRect.top - canvasRect.top) / scale

    // The box grows rightward from the trigger, so a trigger near the right
    // edge pushes it off-canvas. At 1920 nothing came close enough for that
    // to show; at 375 the second form column's info icon does. Clamped rather
    // than flipped, so the box stays visually attached to its trigger.
    const maxLeft = Math.max(EDGE_MARGIN, canvasWidth - BOX_WIDTH - EDGE_MARGIN)
    const left = Math.min(Math.max(rawLeft, EDGE_MARGIN), maxLeft)

    setCanvas(root)
    setPlacement(
      spaceAbove >= NEEDED_CLEARANCE
        ? { left, top: spaceAbove - GAP, transform: 'translateY(-100%)' }
        : { left, top: (triggerRect.bottom - canvasRect.top) / scale + GAP },
    )
  }, [open])

  const box = (
    <span
      role="tooltip"
      className={cn(
        // `min()` so the box narrows on a phone rather than being clamped
        // hard against the edge. In canvas mode the viewport is >= 1920, so
        // the 220px term always wins and the frames are unaffected.
        'absolute z-50 w-[min(220px,100vw-2rem)] rounded-viq-control bg-viq-tooltip-bg px-3 py-2.5',
        'text-xs leading-relaxed text-viq-tooltip-text shadow-lg',
        // Fallback placement only — the portalled box positions itself with
        // the inline style below.
        !placement && 'top-full left-0 mt-2',
      )}
      style={placement ?? undefined}
    >
      {content}
    </span>
  )

  return (
    <span
      ref={triggerRef}
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (canvas && placement ? createPortal(box, canvas) : box)}
    </span>
  )
}
