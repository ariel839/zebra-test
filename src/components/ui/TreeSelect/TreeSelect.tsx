import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChipGroup } from '@/components/ui/ChipGroup'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { cn } from '@/lib/cn'
import { FilterPanel } from './FilterPanel'
import { collectLeafIds, rollUpSelection } from './treeSelection'
import { TreeSelectPanel } from './TreeSelectPanel'
import type { CompanyNode } from './types'

/**
 * Depth-first search for the node whose `label` matches a roll-up chip.
 * Roll-up labels are only ever produced (by `rollUpSelection`) for nodes
 * that are fully checked, so a match here always exists for a chip that
 * came from this tree — but the lookup is written defensively (`undefined`
 * on a miss) rather than assuming that invariant.
 */
function findNodeByLabel(nodes: CompanyNode[], label: string): CompanyNode | undefined {
  for (const node of nodes) {
    if (node.label === label) return node
    if (node.children) {
      const hit = findNodeByLabel(node.children, label)
      if (hit) return hit
    }
  }
  return undefined
}

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
  /** Opens the country filter panel on mount (demo flow only — C1-C5). */
  defaultFilterPanelOpen?: boolean
  /** Forwarded to `FilterPanel`'s `defaultQuery` (demo flow only — C2/C3). */
  defaultFilterQuery?: string
  /** Forwarded to `FilterPanel`'s `defaultDraft` (demo flow only — C4). */
  defaultFilterDraft?: string[]
  className?: string
}

/**
 * 3-tier company-name tree select, spec §4 (B6, `10489:78221`). Only leaf
 * ids ever live in `value` — the panel derives every parent's
 * checked/indeterminate state from that set, so an inconsistent state can't
 * be represented.
 *
 * Selected values render as chips beneath the trigger via `<ChipGroup>`,
 * spec §4 (Figma `10489:78667`) — the trigger itself never reflects the
 * selection.
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
  defaultFilterPanelOpen = false,
  defaultFilterQuery,
  defaultFilterDraft,
  className,
}: TreeSelectProps) {
  const id = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(defaultOpen)
  const [query, setQuery] = useState('')
  const [countries, setCountries] = useState<string[]>(defaultCountries ?? [])
  const [filterPanelOpen, setFilterPanelOpen] = useState(defaultFilterPanelOpen)

  const selected = useMemo(() => new Set(value), [value])
  const rollUp = useMemo(() => rollUpSelection(tree, selected), [tree, selected])

  function handleChipRemove(label: string) {
    const node = findNodeByLabel(tree, label)
    if (!node) return
    const toRemove = new Set(collectLeafIds(node))
    onChange(value.filter((id) => !toRemove.has(id)))
  }

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
    <div className={cn('flex w-[260px] flex-col', className)} ref={wrapperRef}>
      <FieldLabel label={label} required={required} tooltip={tooltip} htmlFor={id} />
      <div className="relative">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-9 w-full items-center justify-between border border-viq-border bg-white px-3 text-left text-sm',
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
            onFilterClick={() => setFilterPanelOpen((o) => !o)}
            filterCount={countries.length}
          />
        )}
        {/* Sibling of TreeSelectPanel, not nested inside it — the country
            filter is a separate floating panel that sits to the right of
            the form while the tree stays open underneath (spec §4 v4,
            frames C1-C5). */}
        <FilterPanel
          open={filterPanelOpen}
          onClose={() => setFilterPanelOpen(false)}
          value={countries}
          onApply={(next) => setCountries(next)}
          onClearAll={() => setCountries([])}
          defaultQuery={defaultFilterQuery}
          defaultDraft={defaultFilterDraft}
        />
      </div>
      {rollUp.length > 0 && (
        <div className="mt-1.5">
          <ChipGroup labels={rollUp} max={2} onRemove={handleChipRemove} />
        </div>
      )}
    </div>
  )
}
