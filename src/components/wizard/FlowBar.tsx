import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export interface FlowScreenSummary {
  id: string
  label: string
}

export interface FlowBarProps {
  screens: FlowScreenSummary[]
  currentIndex: number
  onPrev: () => void
  onNext: () => void
  onJump: (index: number) => void
}

/**
 * Chrome for the `/flow` guided click-through. Rendered by the flow route
 * OUTSIDE `ScaleToFit` (see `src/components/wizard/ScaleToFit.tsx`), so it
 * sits in normal document flow above the scaled 1920x1080 canvas and never
 * shrinks with it.
 *
 * Deliberately styled apart from the product chrome it sits above: the
 * wizard's own top strip (`WizardTopStrip`) is near-black with a green
 * wordmark accent. This bar reuses the same dark surface token (so it still
 * reads as "app-adjacent," not a stray browser toolbar) but accents with
 * `viq-primary` instead of the brand green — a client watching the demo
 * should never mistake this control strip for part of the product itself.
 */
export function FlowBar({ screens, currentIndex, onPrev, onNext, onJump }: FlowBarProps) {
  const [jumpOpen, setJumpOpen] = useState(false)
  const jumpRoot = useRef<HTMLDivElement>(null)
  const current = screens[currentIndex]
  const isFirst = currentIndex <= 0
  const isLast = currentIndex >= screens.length - 1

  // Arrow-key navigation. Skipped while focus is in a text control so typing
  // into a flow screen's own inputs (e.g. the Account Number field) isn't
  // hijacked by cursor movement.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onPrev, onNext])

  useEffect(() => {
    if (!jumpOpen) return
    const onDocDown = (e: MouseEvent) => {
      if (jumpRoot.current && !jumpRoot.current.contains(e.target as Node)) setJumpOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setJumpOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [jumpOpen])

  if (!current) return null

  return (
    <div
      role="toolbar"
      aria-label="Guided flow navigation"
      className="flex h-11 shrink-0 items-center gap-3 bg-viq-strip-dark px-4 text-sm"
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst}
        className={cn(
          'flex items-center gap-1 rounded-viq-control px-2 py-1 font-medium text-white/70',
          'hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/70',
        )}
      >
        <ChevronLeft size={14} aria-hidden="true" />
        Prev
      </button>

      <span className="tabular-nums text-white/50">
        {currentIndex + 1} / {screens.length}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={isLast}
        className={cn(
          'flex items-center gap-1 rounded-viq-control px-2 py-1 font-medium text-white/70',
          'hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/70',
        )}
      >
        Next
        <ChevronRight size={14} aria-hidden="true" />
      </button>

      <span aria-hidden="true" className="h-4 w-px bg-white/15" />

      <span className="min-w-0 truncate font-semibold text-white">
        <span className="text-viq-primary">{current.id}</span>
        <span className="text-white/40"> · </span>
        {current.label}
      </span>

      <div ref={jumpRoot} className="relative ml-auto shrink-0">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={jumpOpen}
          onClick={() => setJumpOpen((o) => !o)}
          className={cn(
            'flex items-center gap-1.5 rounded-viq-control border border-white/15 px-3 py-1.5',
            'text-white/80 hover:bg-white/10 hover:text-white',
          )}
        >
          Jump to…
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={cn('transition-transform', jumpOpen && 'rotate-180')}
          />
        </button>
        {jumpOpen && (
          <ul
            role="listbox"
            className={cn(
              'absolute top-full right-0 z-50 mt-1 max-h-[420px] w-72 overflow-y-auto py-1',
              'rounded-viq-control border border-viq-border bg-white text-viq-text shadow-lg',
            )}
          >
            {screens.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === currentIndex}
                  onClick={() => {
                    onJump(i)
                    setJumpOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-viq-surface-hover',
                    i === currentIndex && 'bg-viq-surface-hover',
                  )}
                >
                  <span className={cn('w-8 shrink-0 text-viq-text-muted', i === currentIndex && 'font-semibold text-viq-text')}>
                    {s.id}
                  </span>
                  <span className="truncate">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
