import { Info } from 'lucide-react'
import { Tooltip } from './Tooltip'

export interface FieldLabelProps {
  label: string
  required?: boolean
  tooltip?: string
  htmlFor?: string
  /**
   * Threaded down to the info-icon `Tooltip`'s own `forceOpen` — lets a
   * call site force open just this field's tooltip (Row D) without
   * `FieldLabel`/`Tooltip` hardcoding which field key that is.
   */
  forceTooltipOpen?: boolean
}

/**
 * Spec §3: required fields carry a red `*` after the label; every label
 * carries a 16px info icon.
 *
 * The icon is drawn whether or not there is tooltip copy for the field,
 * because every B- and D-row frame shows one on every label — `B01` has
 * seven, one per field. Only two of those tooltips are legible in any frame
 * (`D1`, `D2`), and unverified copy is not shipped (see
 * `src/content/dashboardSettings.ts`), so on the other five the icon is
 * decorative: `aria-hidden` and not focusable, since there is nothing for it
 * to reveal. Passing `tooltip` is what turns it into a real hover/focus
 * target. Dropping the icon instead would have been a visible deviation from
 * the frames.
 */
export function FieldLabel({
  label,
  required,
  tooltip,
  htmlFor,
  forceTooltipOpen,
}: FieldLabelProps) {
  return (
    <span className="mb-[3px] flex items-center gap-1.5 pl-[7px]">
      <label htmlFor={htmlFor} className="text-xs font-normal text-viq-text-muted">
        {label}
        {required && <span className="ml-[3px] text-viq-danger">*</span>}
      </label>
      {tooltip ? (
        <Tooltip content={tooltip} forceOpen={forceTooltipOpen}>
          <Info
            size={16}
            tabIndex={0}
            aria-label={`${label} info`}
            className="cursor-help text-viq-icon-muted outline-none"
          />
        </Tooltip>
      ) : (
        <Info size={16} aria-hidden className="text-viq-icon-muted" />
      )}
    </span>
  )
}
