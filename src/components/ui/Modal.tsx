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
      className="absolute inset-0 z-50 bg-viq-scrim"
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
          'absolute top-1/2 left-1/2 flex max-h-[85%] w-[1200px] -translate-x-1/2 -translate-y-1/2',
          'flex-col overflow-hidden rounded-viq-modal bg-white shadow-xl',
          className,
        )}
      >
        <div className="shrink-0 border-b border-viq-border px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-viq-text">
            {title}
          </h2>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-6 py-4">{children}</div>
        {footer && <div className="shrink-0 border-t border-viq-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}
