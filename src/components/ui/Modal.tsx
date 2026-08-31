import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Rendered as a ReactNode so this primitive never has to import Button. */
  footer?: ReactNode
  className?: string
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Absolute scrim + absolutely-positioned, centred panel — never `fixed`, never a
 * portal. The app renders inside a CSS `transform: scale()` canvas (see
 * ScaleToFit), so `position: fixed` would resolve against the viewport instead
 * of the canvas and a portal to `document.body` would escape it entirely.
 */
export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  // Move focus into the panel on open, and restore it to the trigger on close.
  useEffect(() => {
    if (!open) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    const panel = panelRef.current
    const focusables = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    const first = focusables && focusables.length > 0 ? focusables[0] : panel
    first?.focus()

    return () => {
      previouslyFocusedRef.current?.focus()
    }
  }, [open])

  // Escape to close, Tab/Shift+Tab trapped within the panel.
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last || !panel.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      // The frame (F2) shows the whole wizard page still legible behind the
      // modal, but DARKENED, not washed out: measured on F2, a white area goes
      // 255 -> 231 while the page heading's own row goes 136 -> 132. Solving
      // those two gives ~16% of a mid grey (#6b6b6b) — a white wash lightens
      // the page instead and an opaque fill hides it. The top strip is left
      // alone: it samples #111b02 on F2, identical to B01's unscrimmed strip.
      className="absolute inset-x-0 top-[50px] bottom-0 z-50 bg-[#6b6b6b]/16 backdrop-blur-[1px]"
      onMouseDown={onClose}
      data-testid="modal-scrim"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          // 1437x(auto) at x=242 on every Row F / Row G frame: F2 and F3 span
          // x 242..1678, and G2 (one row) is the same width but shorter, so
          // the width is fixed and the height follows the table.
          'absolute top-[calc(50%-25px)] left-1/2 flex max-h-[85%] w-[1437px] -translate-x-1/2 -translate-y-1/2',
          'flex-col overflow-hidden rounded-viq-modal bg-white shadow-xl',
          className,
        )}
      >
        {/* F2's vertical stack, measured from the modal's own top edge (277):
            title box 329..357, body 366..390, section heading 449..473, table
            header 503..525, three 48px rows to 669, footer button 709..750,
            modal bottom 804 — i.e. 52 top padding, 54 bottom, 56 sides. */}
        <div className="shrink-0 px-14 pt-[52px]">
          <h2 id={titleId} className="text-[20px] leading-7 font-semibold text-viq-text">
            {title}
          </h2>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-14 pt-[9px]">{children}</div>
        {footer && <div className="shrink-0 px-14 pt-[39px] pb-[54px]">{footer}</div>}
      </div>
    </div>
  )
}
