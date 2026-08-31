import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { FieldLabel } from './FieldLabel'

/**
 * Generic single-select option. Deliberately keyed by `id`, not `label` —
 * B05's Company Name list has two rows both labelled "Euro Car Parts"
 * (a Subsidiary and an Account), distinguished only by `badge`. Keying by
 * label would make those two rows impossible to select independently.
 */
export interface SelectOption {
  id: string
  label: string
  /** Optional right-hand type badge, e.g. 'Standard' | 'Subsidiary' | 'Account'. */
  badge?: string
  /** 'Account' renders blue (B05); every other badge renders dark grey. */
  badgeTone?: 'blue' | 'grey'
}

export interface SelectProps {
  label: string
  required?: boolean
  tooltip?: string
  /** Selected option id, not a label. */
  value: string | null
  onChange: (id: string) => void
  options: SelectOption[]
  placeholder: string
  /** Forces the dropdown open, additively. See `Tooltip`'s `forceOpen` for the pattern. */
  forceOpen?: boolean
  /** Forwarded to `FieldLabel`'s `forceTooltipOpen` (Row D). */
  forceTooltipOpen?: boolean
}

const BADGE_TONE_CLASSES: Record<'blue' | 'grey', string> = {
  blue: 'bg-viq-primary text-white',
  grey: 'bg-viq-text-muted text-white',
}

/**
 * Regular selection dropdown, B05. Panel is `absolute` (never `fixed` — this
 * app renders inside a CSS transform), chevron flips when open, closes on
 * outside click and on Escape.
 */
export function Select({
  label,
  required,
  tooltip,
  value,
  onChange,
  options,
  placeholder,
  forceOpen,
  forceTooltipOpen,
}: SelectProps) {
  const [localOpen, setOpen] = useState(false)
  const open = localOpen || forceOpen
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

  const selected = options.find((o) => o.id === value)

  return (
    <div className="flex flex-col" ref={root}>
      <FieldLabel
        label={label}
        required={required}
        tooltip={tooltip}
        forceTooltipOpen={forceTooltipOpen}
      />
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-9 w-[260px] items-center justify-between border border-viq-border bg-white px-3',
            'text-sm hover:border-viq-border-hover',
            open ? 'rounded-t-viq-control border-b-0' : 'rounded-viq-control',
          )}
        >
          <span className={selected ? 'text-viq-text' : 'text-viq-text-placeholder'}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            size={16}
            className={cn('shrink-0 text-viq-icon-muted transition-transform', open && 'rotate-180')}
          />
        </button>
        {open && (
          <ul
            role="listbox"
            className={cn(
              'absolute top-full left-0 z-40 max-h-[390px] w-[260px] overflow-y-auto',
              'rounded-b-viq-control border border-t-0 border-viq-border bg-white py-1 shadow-lg',
            )}
          >
            {options.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.id === value}
                  onClick={() => {
                    onChange(o.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-2',
                    'text-left text-sm text-viq-text hover:bg-viq-surface-hover',
                    o.id === value && 'bg-viq-surface-hover',
                  )}
                >
                  <span>{o.label}</span>
                  {o.badge && (
                    <span
                      className={cn(
                        'shrink-0 rounded-viq-pill px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
                        BADGE_TONE_CLASSES[o.badgeTone ?? 'grey'],
                      )}
                    >
                      {o.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
