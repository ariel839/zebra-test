import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { cn } from '@/lib/cn'
import { rollUpSelection } from './treeSelection'
import { TreeSelectPanel } from './TreeSelectPanel'
import type { CompanyNode } from './types'

export interface TreeSelectProps {
  label: string
  required?: boolean
  tooltip?: string
  value: string[]
  onChange: (ids: string[]) => void
  tree: CompanyNode[]
  placeholder?: string
  /** Seeds the applied country filter. Task 9 implements the filter panel itself. */
  defaultCountries?: string[]
  /** Opens the tree panel on mount. */
  defaultOpen?: boolean
  className?: string
}

/**
 * 3-tier company-name tree select, spec §4 (B6, `10489:78221`). Only leaf
 * ids ever live in `value` — the panel derives every parent's
 * checked/indeterminate state from that set, so an inconsistent state can't
 * be represented.
 *
 * Selected values are chips in the final design (Task 10, Figma
 * `10489:78667`). Here they render as plain comma-separated text beneath
 * the trigger — `<ChipGroup>` swaps in later without touching this file's
 * selection logic.
 *
 * The trigger's own text is a static call-to-action ("Select all valid
 * names" in the Figma), not a live summary of the selection — the frame
 * shows that same label regardless of what's checked.
 */
export function TreeSelect({
  label,
  required,
  tooltip,
  value,
  onChange,
  tree,
  placeholder = 'Select all valid names',
  defaultCountries,
  defaultOpen = false,
  className,
}: TreeSelectProps) {
  const id = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(defaultOpen)
  const [query, setQuery] = useState('')
  // Task 9 adds the country filter panel and the setter that drives it; for
  // now `defaultCountries` only seeds the initial applied filter.
  const [countries] = useState<string[]>(defaultCountries ?? [])

  const selected = useMemo(() => new Set(value), [value])
  const rollUp = useMemo(() => rollUpSelection(tree, selected), [tree, selected])

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  return (
    <div className={cn('flex w-[242px] flex-col', className)} ref={wrapperRef}>
      <FieldLabel label={label} required={required} tooltip={tooltip} htmlFor={id} />
      <div className="relative">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-10 w-full items-center justify-between border border-viq-border bg-white px-3 text-left text-sm',
            'text-viq-text-placeholder hover:border-viq-border-hover',
            open ? 'rounded-t-viq-control border-b-0' : 'rounded-viq-control',
          )}
        >
          <span className="truncate">{placeholder}</span>
          {open ? (
            <ChevronUp size={16} className="shrink-0 text-viq-icon-muted" />
          ) : (
            <ChevronDown size={16} className="shrink-0 text-viq-icon-muted" />
          )}
        </button>
        {open && (
          <TreeSelectPanel
            className="absolute top-full left-0 z-20"
            tree={tree}
            selected={selected}
            onSelectedChange={(next) => onChange([...next])}
            query={query}
            onQueryChange={setQuery}
            countries={countries}
            onFilterClick={() => {
              // Task 9 wires the country filter panel itself; this seam
              // (and the `countries`/`filterCount` state above) exists so
              // that task is a pure addition rather than a rewrite of
              // TreeSelect's internals.
            }}
            filterCount={countries.length}
          />
        )}
      </div>
      {rollUp.length > 0 && (
        <p className="mt-1.5 text-sm text-viq-text-muted">{rollUp.join(', ')}</p>
      )}
    </div>
  )
}
