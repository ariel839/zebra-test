import { Chip } from './Chip'

export interface ChipGroupProps {
  labels: string[]
  /** Chips shown before collapsing into +N. 2 in the form, 4 in review mode. */
  max?: number
  onRemove?: (label: string) => void
  /** When set, the chip whose label matches gets `forceHover` (additive). */
  forceHoverLabel?: string
}

/**
 * Row of selection chips, spec §4 / Figma B07 (`10489:78667`) —
 * `Euro Car Parts`, `Euro Car Parts Ltd`, `+3`. Anything past `max` labels
 * collapses into a trailing, non-removable `+N` chip; `N` must render as a
 * two-digit count without clipping — the review screens show `+30`.
 */
export function ChipGroup({ labels, max = 2, onRemove, forceHoverLabel }: ChipGroupProps) {
  const shown = labels.slice(0, max)
  const overflow = labels.length - shown.length
  return (
    <div className="flex flex-nowrap items-center gap-2">
      {shown.map((l) => (
        <Chip
          key={l}
          label={l}
          onRemove={onRemove && (() => onRemove(l))}
          forceHover={l === forceHoverLabel}
        />
      ))}
      {overflow > 0 && <Chip label={`+${overflow}`} hoverable={false} />}
    </div>
  )
}
