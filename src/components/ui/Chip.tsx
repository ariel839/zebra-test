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
   * `'xs'` (12px) is the form's chip, B07's own measurement. `'sm'` (14px)
   * is the review panel's — the R3 frame sets `Euro Car Parts Ltd` 82
   * render px wide against B07's 70 for the same string, a 1.171 ratio
   * against 14/12's 1.167. Box metrics (`h-5`, 6px padding) are shared;
   * only the type size differs.
   */
  size?: 'xs' | 'sm'
  /**
   * Forces the hover reveal (× + focus-color border) on, additively — real
   * `hover:`/`group-hover:` keeps working regardless. Undefined/false
   * forces nothing (today's behaviour).
   */
  forceHover?: boolean
}

/**
 * Outline chip, spec §4 / Figma B07 (`10489:78667`) — the resting state is
 * just the label.
 *
 * Geometry measured off the B07 frame (1456px render of the 1920 artboard,
 * scale 0.7583): the `Euro Car Parts` chip is 70 render px wide, `Euro Car
 * Parts Ltd` 85, `IOT Printer` 55 — i.e. 92 / 112 / 72 real px. Roboto 12px
 * sets those three labels at 78 / 98 / 58px, so the box is `text + 12px`:
 * a 1px border plus **6px** of horizontal padding a side. Height is 15.5
 * render px → 20px, hence `h-5` with `leading-none` and centred content.
 * The row gap is 3 render px → `gap-1`.
 *
 * **The chip grows on hover** — spec §4 says so ("a chip on hover grows an
 * `×`"), and B07/B08 measure it: `IOT Mobile Computer` is 96 render px at
 * rest and 113 hovered, and `IOT Printer` next to it shifts right by the
 * same amount. So the `×` is *not* given a reserved slot at rest; it costs
 * `gap-1.5` + a 16px icon on hover, which is the 22px of real growth the
 * two frames differ by. Reserving it instead (the plan's original guess)
 * padded every chip by 16px and truncated the labels — `Euro Car P…` —
 * inside the 260px form column, which is the one thing the chip row must
 * never do.
 *
 * Nothing here truncates and nothing shrinks: a chip is always exactly as
 * wide as its label. `ChipGroup` wraps the row rather than squeezing it.
 */
export function Chip({
  label,
  onRemove,
  hoverable = true,
  className,
  size = 'xs',
  forceHover,
}: ChipProps) {
  return (
    <span
      className={cn(
        'group inline-flex h-5 shrink-0 items-center whitespace-nowrap rounded-viq-control border px-1.5 leading-none text-viq-text',
        size === 'sm' ? 'text-sm' : 'text-xs',
        'border-viq-border',
        hoverable && 'gap-1.5',
        hoverable &&
          'hover:border-viq-border-focus hover:bg-viq-surface-hover focus-within:border-viq-border-focus focus-within:bg-viq-surface-hover',
        hoverable && forceHover && 'border-viq-border-focus bg-viq-surface-hover',
        className,
      )}
    >
      <span>{label}</span>
      {hoverable && (
        <span
          className={cn(
            'shrink-0 items-center justify-center',
            // `cn` is a plain join, not tailwind-merge, so never ship
            // `hidden` and `flex` together and hope the cascade picks right.
            forceHover ? 'flex' : 'hidden group-hover:flex group-focus-within:flex',
          )}
        >
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${label}`}
              className="flex items-center justify-center text-viq-icon-muted hover:text-viq-text"
            >
              <X size={16} />
            </button>
          ) : (
            <X size={16} aria-hidden="true" className="text-viq-icon-muted" />
          )}
        </span>
      )}
    </span>
  )
}
