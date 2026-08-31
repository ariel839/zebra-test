import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { nodeState, toggleNode } from './treeSelection'
import type { CompanyNode } from './types'

const INDENT_PX = 19

export interface TreeNodeRowProps {
  node: CompanyNode
  depth: number
  selected: Set<string>
  onSelectedChange: (next: Set<string>) => void
  /** Forces every branch open while a search or filter is active. */
  forceExpanded: boolean
  /** True when this node is the first child of its parent (or a root). */
  isFirstChild: boolean
}

/**
 * Recursive tree row. Figma 10489:78221: `LKQ Corporation` and `Euro Car
 * Parts` are expanded by default; `Auto Kelly` and `Auto Kelly Ltd` —
 * siblings of `Euro Car Parts` at the *same* depth — are collapsed. Depth
 * alone can't produce that (they're all depth 1), so the default follows
 * the leftmost path from the root: only the first child at each level opens
 * by default, `depth < 2` bounds how deep that goes.
 */
export function TreeNodeRow({
  node,
  depth,
  selected,
  onSelectedChange,
  forceExpanded,
  isFirstChild,
}: TreeNodeRowProps) {
  const [open, setOpen] = useState(depth < 2 && isFirstChild)
  const expanded = forceExpanded || open
  const hasChildren = Boolean(node.children?.length)
  const state = nodeState(node, selected)

  return (
    <li>
      <div
        className="flex h-8 min-w-0 items-center gap-0 pr-1 hover:bg-viq-surface-hover"
        style={{ paddingLeft: 8 + depth * INDENT_PX }}
      >
        <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
          <Checkbox
            checked={state === 'checked'}
            indeterminate={state === 'indeterminate'}
            label={node.label}
            onChange={(checked) => onSelectedChange(toggleNode(node, selected, checked))}
          />
        </div>
        {hasChildren ? (
          <button
            type="button"
            aria-label={expanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
            onClick={() => setOpen((o) => !o)}
            className="flex w-2.5 shrink-0 items-center justify-center text-viq-icon-muted"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-2.5 shrink-0" />
        )}
      </div>
      {hasChildren && expanded && (
        <ul>
          {node.children!.map((child, i) => (
            <TreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              onSelectedChange={onSelectedChange}
              forceExpanded={forceExpanded}
              isFirstChild={i === 0}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
