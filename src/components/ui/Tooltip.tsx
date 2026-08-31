import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
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

/**
 * Hover-and-focus triggered tooltip, absolutely positioned against a
 * `relative` wrapper — never `position: fixed`. The app renders inside a
 * CSS-`transform` scale-to-fit canvas (see ScaleToFit), so `fixed` would
 * resolve against the wrong box.
 *
 * Positioning matches Row D (`10489:80202`, `10489:80363`, `10489:76248`):
 * pixel-sampling the three tooltip frames shows the box's left edge landing
 * close to the icon's left edge and growing rightward — not centered above
 * the trigger — so this opens above-and-right rather than above-and-centered.
 *
 * That above-right placement is only safe when there's room above the
 * trigger: the top row of `DashboardSettingsForm`'s fields (Account Number,
 * Company Name — D1/D2) sits close enough to the top of the form's own
 * `overflow-y-auto` scroll container that a tooltip opening upward from
 * there renders partly outside that container and gets silently clipped
 * (reproduces with a real keyboard focus on `/setup`, not just the forced
 * demo state — this was never visually verified before D1/D2 existed to
 * expose it). So this measures, each time the tooltip opens, how much room
 * there actually is between the trigger and the nearest scrolling ancestor's
 * own top edge (not the viewport's — the viewport is usually not what's
 * doing the clipping) and flips to open downward instead when that's not
 * enough, rather than hardcoding a direction that only works for some call
 * sites.
 */
function nearestScrollAncestorTop(el: HTMLElement): number {
  let node = el.parentElement
  while (node) {
    const style = getComputedStyle(node)
    if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflowY === 'hidden') {
      return node.getBoundingClientRect().top
    }
    node = node.parentElement
  }
  return 0
}

export function Tooltip({ content, children, className, forceOpen }: TooltipProps) {
  const [localOpen, setOpen] = useState(false)
  const open = localOpen || forceOpen
  const triggerRef = useRef<HTMLSpanElement>(null)
  const [openUpward, setOpenUpward] = useState(true)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    // ~65px of content (up to 3 lines) plus the 8px gap and a little slack —
    // enough to decide, not a pixel-exact box measurement.
    const NEEDED_CLEARANCE = 90
    const triggerTop = triggerRef.current.getBoundingClientRect().top
    const ceiling = nearestScrollAncestorTop(triggerRef.current)
    setOpenUpward(triggerTop - ceiling >= NEEDED_CLEARANCE)
  }, [open])

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
      {open && (
        <span
          role="tooltip"
          className={cn(
            'absolute left-0 z-50 w-[220px] rounded-viq-control bg-viq-tooltip-bg px-3 py-2.5',
            'text-xs leading-relaxed text-viq-tooltip-text shadow-lg',
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}
