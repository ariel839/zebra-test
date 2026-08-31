import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface TooltipProps {
  content: string
  children: ReactNode
  className?: string
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
 */
export function Tooltip({ content, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <span
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
          className="absolute bottom-full left-0 z-50 mb-2 w-[220px]
                     rounded-viq-control bg-viq-tooltip-bg px-3 py-2.5 text-xs
                     leading-relaxed text-viq-tooltip-text shadow-lg"
        >
          {content}
        </span>
      )}
    </span>
  )
}
