import { Chip } from './Chip'

export interface ChipGroupProps {
  labels: string[]
  /** Chips shown before collapsing into +N. 2 in the form, 4 in review mode. */
  max?: number
  onRemove?: (label: string) => void
  /** Forwarded to every chip. The review panel's chips are `'sm'` (R3). */
  size?: 'xs' | 'sm'
  /** When set, the chip whose label matches gets `forceHover` (additive). */
  forceHoverLabel?: string
}

/**
 * Row of selection chips, spec §4 / Figma B07 (`10489:78667`) —
 * `Euro Car Parts`, `Euro Car Parts Ltd`, `+3`. Anything past `max` labels
 * collapses into a trailing, non-removable `+N` chip; `N` must render as a
 * two-digit count without clipping — the review screens show `+30`.
 *
 * The row **wraps**; it never squeezes. Chips are `shrink-0` and never
 * truncate, so when a hovered chip grows its `×` inside the form's 260px
 * column the overflow moves to a second line instead of chopping labels
 * into `Euro Car P…`. At B07's own content the row still fits one line:
 * 91 + 4 + 111 + 4 + 28 = 238px of a 260px column.
 */
export function ChipGroup({
  labels,
  max = 2,
  onRemove,
  size,
  forceHoverLabel,
}: ChipGroupProps) {
  const shown = labels.slice(0, max)
  const overflow = labels.length - shown.length
  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((l) => (
        <Chip
          key={l}
          label={l}
          onRemove={onRemove && (() => onRemove(l))}
          size={size}
          forceHover={l === forceHoverLabel}
        />
      ))}
      {overflow > 0 && <Chip label={`+${overflow}`} hoverable={false} size={size} />}
    </div>
  )
}
