import { useEffect, useId, useRef } from 'react'
import { cn } from '@/lib/cn'

export interface CheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

/**
 * `indeterminate` is a DOM property, not an HTML attribute — React cannot set
 * it via JSX, so it is applied imperatively through a ref in an effect. The
 * 3-tier TreeSelect (Task 8) depends on this actually working for its
 * parent-row "some but not all children selected" display.
 */
export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  label,
  disabled,
  className,
}: CheckboxProps) {
  const id = useId()
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked
  }, [indeterminate, checked])

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-viq-primary disabled:cursor-not-allowed"
      />
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'select-none text-sm text-viq-text',
            disabled ? 'cursor-not-allowed text-viq-text-muted' : 'cursor-pointer',
          )}
        >
          {label}
        </label>
      )}
    </span>
  )
}
