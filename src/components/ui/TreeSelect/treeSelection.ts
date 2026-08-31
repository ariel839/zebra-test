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
 * Chip labels, in tree order: one label per **selected leaf** — an actual
 * company. Branch nodes never get a chip of their own.
 *
 * A branch label would double-count: checking `Rhiag Group` (10 companies)
 * used to emit 14 labels — the group, its three regions, and all ten
 * companies — so the form's overflow chip read `+12` for a selection the
 * user counts as 10. The `+N` now counts companies, which is also what spec
 * §4's own sizing note assumes ("~40 leaves … deep enough that `+30` is
 * reachable").
 *
 * An unchecked subtree is skipped whole; an indeterminate one is descended
 * into and contributes only its checked leaves.
 */
export function selectedLabels(tree: CompanyNode[], selected: Set<string>): string[] {
  const out: string[] = []
  const walk = (nodes: CompanyNode[]) => {
    for (const n of nodes) {
      if (nodeState(n, selected) === 'unchecked') continue
      if (n.children?.length) walk(n.children)
      else out.push(n.label)
    }
  }
  walk(tree)
  return out
}
