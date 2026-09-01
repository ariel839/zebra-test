import { Filter, Search } from 'lucide-react'
import { Checkbox } from '@/components/ui/Checkbox'
import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/cn'
import { collectLeafIds, toggleNode } from './treeSelection'
import { filterTree } from './treeSearch'
import { TreeNodeRow } from './TreeNodeRow'
import type { CompanyNode } from './types'

export interface TreeSelectPanelProps {
  tree: CompanyNode[]
  selected: Set<string>
  onSelectedChange: (next: Set<string>) => void
  query: string
  onQueryChange: (q: string) => void
  countries: string[]
  onFilterClick: () => void
  /** Badge count on the funnel. Task 9 supplies it. */
  filterCount: number
  className?: string
}

/**
 * Spec §4 anatomy, top to bottom: search bar with magnifier + funnel,
 * `Select All`, then the tree — all inside one 242px-wide, ~390px-max-height
 * scroll region with its own scrollbar. The search bar and `Select All` row
 * stick to the top of that region so they stay reachable while the tree
 * itself scrolls; at rest (unscrolled) this renders identically to the
 * static Figma frame.
 *
 * The country filter panel is NOT a child of this panel (v4 corrected this)
 * — it floats to the right of the form and `TreeSelect` owns it. Task 9
 * wires the funnel; here it is rendered but inert.
 */
export function TreeSelectPanel({
  tree,
  selected,
  onSelectedChange,
  query,
  onQueryChange,
  countries,
  onFilterClick,
  filterCount,
  className,
}: TreeSelectPanelProps) {
  const visible = filterTree(tree, query, countries)
  const forceExpanded = query.trim() !== '' || countries.length > 0

  const allVisibleLeaves = visible.flatMap(collectLeafIds)
  const hits = allVisibleLeaves.filter((id) => selected.has(id)).length
  const selectAllState: 'checked' | 'indeterminate' | 'unchecked' =
    allVisibleLeaves.length === 0
      ? 'unchecked'
      : hits === 0
        ? 'unchecked'
        : hits === allVisibleLeaves.length
          ? 'checked'
          : 'indeterminate'

  function toggleSelectAll(checked: boolean) {
    let next = selected
    for (const node of visible) next = toggleNode(node, next, checked)
    onSelectedChange(next)
  }

  return (
    <div
      className={cn(
        // 242px is the measured design width, deliberately 18px narrower than
        // the 260px trigger. Below `md` the trigger is full-width and a fixed
        // 242px panel would hang short of it, so the panel matches the trigger
        // (`w-full` against the trigger's own positioned wrapper) instead.
        'w-full rounded-b-viq-control border border-t-0 border-viq-border bg-white shadow-lg md:w-[242px]',
        className,
      )}
    >
      <div className="max-h-[390px] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white">
          <div className="flex h-9 items-center gap-2 bg-viq-surface-search px-3">
            <Search size={14} className="shrink-0 text-viq-icon-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-sm text-viq-text outline-none placeholder:text-viq-text-placeholder"
            />
            <IconButton
              icon={<Filter size={14} />}
              label="Filter by country"
              badge={filterCount}
              onClick={onFilterClick}
              className="h-6 w-6 shrink-0"
            />
          </div>
          {/*
            `Select All` sits at the same x as a depth-0 node in Figma
            10489:78221 (both checkboxes measure to x=250 in the frame), so it
            takes `TreeNodeRow`'s depth-0 padding and puts its chevron-width
            spacer on the trailing edge, exactly as a row does.
          */}
          <div
            className="flex h-8 items-center gap-0 pr-1 hover:bg-viq-surface-hover"
            style={{ paddingLeft: 8 }}
          >
            <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
              <Checkbox
                checked={selectAllState === 'checked'}
                indeterminate={selectAllState === 'indeterminate'}
                label="Select All"
                onChange={toggleSelectAll}
              />
            </div>
            <span className="w-2.5 shrink-0" />
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="px-3 py-3 text-sm text-viq-text-muted">No matches found</p>
        ) : (
          <ul>
            {visible.map((node, i) => (
              <TreeNodeRow
                key={node.id}
                node={node}
                depth={0}
                selected={selected}
                onSelectedChange={onSelectedChange}
                forceExpanded={forceExpanded}
                isFirstChild={i === 0}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
