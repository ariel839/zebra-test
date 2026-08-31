import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface ChipProps {
  label: string
  onRemove?: () => void
  /**
   * The `+N` overflow chip is static — no border change, no `×`, ever.
   * Every other chip defaults to `true`: B08 shows the hover affordance
   * regardless of whether removal is actually wired at the call site.
   */
  hoverable?: boolean
  className?: string
  /**
   * Forces the hover reveal (× + focus-color border) on, additively — real
   * `hover:`/`group-hover:` keeps working regardless. Undefined/false
   * forces nothing (today's behaviour).
   */
  forceHover?: boolean
}

/**
 * Outline chip, spec §4 / Figma B07 (`10489:78667`) — the resting state is
 * just the label. Hover (or keyboard focus, for parity) grows an `×`,
 * swaps the border to the focus/primary blue and fills the chip with the
 * hover grey, per B08 (`10489:79003`, "IOT Mobile Computer ×").
 *
 * The `×`'s slot is always in the DOM at a fixed width; only its opacity
 * changes on hover. That's deliberate — a chip that widens on hover makes
 * a whole row reflow under the mouse, which reads as broken in a client
 * demo. When `onRemove` isn't supplied the slot still reveals a
 * (non-interactive) `×` on hover, so the visual treatment from B08 is
 * consistent everywhere a hoverable chip appears, whether or not this
 * particular call site has wired removal.
 */
export function Chip({ label, onRemove, hoverable = true, className, forceHover }: ChipProps) {
  return (
    <span
      className={cn(
        'group inline-flex min-w-0 items-center gap-1 whitespace-nowrap rounded-viq-control border px-2 py-1 text-xs text-viq-text',
        'border-viq-border',
        hoverable &&
          'hover:border-viq-border-focus hover:bg-viq-surface-hover focus-within:border-viq-border-focus focus-within:bg-viq-surface-hover',
        hoverable && forceHover && 'border-viq-border-focus bg-viq-surface-hover',
        className,
      )}
    >
      <span className="truncate">{label}</span>
      {hoverable && (
        <span className="flex w-3 shrink-0 items-center justify-center">
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${label}`}
              className={cn(
                'flex items-center justify-center text-viq-icon-muted opacity-0',
                'hover:text-viq-text group-hover:opacity-100 group-focus-within:opacity-100',
                forceHover && 'opacity-100',
              )}
            >
              <X size={12} />
            </button>
          ) : (
            <X
              size={12}
              aria-hidden="true"
              className={cn(
                'text-viq-icon-muted opacity-0 group-hover:opacity-100',
                forceHover && 'opacity-100',
              )}
            />
          )}
        </span>
      )}
    </span>
  )
}
