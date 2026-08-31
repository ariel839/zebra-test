import { cn } from '@/lib/cn'

export interface RadioOption<T extends string> {
  label: string
  value: T
}

export interface RadioGroupProps<T extends string> {
  name: string
  value: T
  options: RadioOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
  className?: string
}

/** Spec §3: `Automatically add contracts` — `No` / `Yes`, default `Yes` (B2 `8135:2690` shows it set to `No`). */
export function RadioGroup<T extends string>({
  name,
  value,
  options,
  onChange,
  disabled,
  className,
}: RadioGroupProps<T>) {
  return (
    <div className={cn('flex items-center gap-16', className)}>
      {options.map((o) => (
        <label
          key={o.value}
          className={cn(
            'flex items-center gap-2 text-sm text-viq-text',
            disabled ? 'cursor-not-allowed text-viq-text-muted' : 'cursor-pointer',
          )}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            disabled={disabled}
            onChange={() => onChange(o.value)}
            className="h-4 w-4 accent-viq-text disabled:cursor-not-allowed"
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}
