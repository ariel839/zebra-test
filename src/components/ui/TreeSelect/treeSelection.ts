import type { CompanyNode } from './types'

/**
 * Only leaf ids are ever stored in selection state. Parent checked /
 * indeterminate is always derived from the leaves via `nodeState`, which
 * makes an inconsistent state (a parent checked while a child isn't)
 * unrepresentable.
 */
export function collectLeafIds(node: CompanyNode): string[] {
  if (!node.children?.length) return [node.id]
  return node.children.flatMap(collectLeafIds)
}

/** Checking a parent checks all descendants; unchecking clears them. Spec §4. */
export function toggleNode(
  node: CompanyNode,
  selected: Set<string>,
  checked: boolean,
): Set<string> {
  const next = new Set(selected)
  for (const id of collectLeafIds(node)) {
    if (checked) next.add(id)
    else next.delete(id)
  }
  return next
}

export function nodeState(
  node: CompanyNode,
  selected: Set<string>,
): 'checked' | 'indeterminate' | 'unchecked' {
  const leaves = collectLeafIds(node)
  const hits = leaves.filter((id) => selected.has(id)).length
  if (hits === 0) return 'unchecked'
  if (hits === leaves.length) return 'checked'
  return 'indeterminate'
}

/**
 * Chip labels: the highest fully-selected nodes. Selecting all of
 * 'Euro Car Parts' yields one chip 'Euro Car Parts', not three leaf chips —
 * which is what Figma 10489:78667 shows.
 */
export function rollUpSelection(tree: CompanyNode[], selected: Set<string>): string[] {
  const out: string[] = []
  const walk = (nodes: CompanyNode[]) => {
    for (const n of nodes) {
      const state = nodeState(n, selected)
      if (state === 'checked') out.push(n.label)
      else if (state === 'indeterminate' && n.children) walk(n.children)
    }
  }
  walk(tree)
  return out
}
