import { Info } from 'lucide-react'
import { Tooltip } from './Tooltip'

export interface FieldLabelProps {
  label: string
  required?: boolean
  tooltip?: string
  htmlFor?: string
}

/**
 * Spec §3: required fields carry a red `*` after the label; every label
 * carries a 16px info icon that opens a Tooltip on hover or keyboard focus.
 */
export function FieldLabel({ label, required, tooltip, htmlFor }: FieldLabelProps) {
  return (
    <span className="mb-1.5 flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-normal text-viq-text-muted">
        {label}
        {required && <span className="text-viq-danger"> *</span>}
      </label>
      {tooltip && (
        <Tooltip content={tooltip}>
          <Info
            size={16}
            tabIndex={0}
            aria-label={`${label} info`}
            className="cursor-help text-viq-icon-muted outline-none"
          />
        </Tooltip>
      )}
    </span>
  )
}
