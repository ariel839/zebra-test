import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Checkbox } from './Checkbox'
import { ChipGroup } from './ChipGroup'
import { FieldLabel } from './FieldLabel'

export interface MultiSelectProps {
  label: string
  required?: boolean
  tooltip?: string
  value: string[]
  onChange: (value: string[]) => void
  options: readonly string[]
  placeholder: string
}

/**
 * Multi-select dropdown, B05/B07. Same shell as `Select`, but the trigger
 * NEVER shows the selection — per B07_filled, the closed control keeps
 * showing its placeholder, and the selected values render as a row beneath
 * it instead. Panel stays open across selections; rows are `Checkbox`.
 *
 * Selected labels render as chips below the trigger via `<ChipGroup>`.
 */
export function MultiSelect({
  label,
  required,
  tooltip,
  value,
  onChange,
  options,
  placeholder,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = (option: string, checked: boolean) => {
    onChange(checked ? [...value, option] : value.filter((v) => v !== option))
  }

  return (
    <div className="flex flex-col" ref={root}>
      <FieldLabel label={label} required={required} tooltip={tooltip} />
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-10 w-[260px] items-center justify-between border border-viq-border bg-white px-3',
            'text-sm hover:border-viq-border-hover',
            open ? 'rounded-t-viq-control border-b-0' : 'rounded-viq-control',
          )}
        >
          <span className="text-viq-text-placeholder">{placeholder}</span>
          <ChevronDown
            size={16}
            className={cn('shrink-0 text-viq-icon-muted transition-transform', open && 'rotate-180')}
          />
        </button>
        {open && (
          <ul
            role="listbox"
            aria-multiselectable="true"
            className={cn(
              'absolute top-full left-0 z-40 max-h-[390px] w-[260px] overflow-y-auto',
              'rounded-b-viq-control border border-t-0 border-viq-border bg-white py-1 shadow-lg',
            )}
          >
            {options.map((option) => {
              const checked = value.includes(option)
              return (
                <li key={option}>
                  <div
                    role="option"
                    aria-selected={checked}
                    className="flex w-full items-center px-3 py-2 hover:bg-viq-surface-hover"
                  >
                    <Checkbox
                      checked={checked}
                      onChange={(next) => toggle(option, next)}
                      label={option}
                      className="w-full text-sm"
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {value.length > 0 && (
        <div className="mt-1.5">
          <ChipGroup
            labels={value}
            max={2}
            onRemove={(label) => onChange(value.filter((v) => v !== label))}
          />
        </div>
      )}
    </div>
  )
}
