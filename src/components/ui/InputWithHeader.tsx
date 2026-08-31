import { useId } from 'react'
import { FieldLabel } from './FieldLabel'
import { Input, type InputProps } from './Input'

export interface InputWithHeaderProps extends InputProps {
  label: string
  required?: boolean
  tooltip?: string
  /** Forwarded to `FieldLabel`'s `forceTooltipOpen` (Row D). */
  forceTooltipOpen?: boolean
}

/** A field-grid cell: `FieldLabel` (label + required `*` + info tooltip) stacked over `Input`. */
export function InputWithHeader({
  label,
  required,
  tooltip,
  forceTooltipOpen,
  id,
  ...rest
}: InputWithHeaderProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col">
      <FieldLabel
        label={label}
        required={required}
        tooltip={tooltip}
        htmlFor={inputId}
        forceTooltipOpen={forceTooltipOpen}
      />
      <Input id={inputId} {...rest} />
    </div>
  )
}
