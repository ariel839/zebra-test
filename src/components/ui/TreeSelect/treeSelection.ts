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
 * Chip labels, in tree order: **every** node whose whole subtree is selected
 * gets its own label — a fully-checked parent AND each of its descendants.
 *
 * This is deliberately NOT a roll-up. Figma B07 (`10489:78667`) shows the
 * chips `Euro Car Parts` · `Euro Car Parts Ltd` · `+3`, and `Euro Car Parts
 * Ltd` is a *child* of `Euro Car Parts` — a pair a "highest fully-selected
 * node only" rule can never produce (a checked parent would swallow it, an
 * indeterminate parent would emit no chip of its own). Selecting the whole
 * `Euro Car Parts` branch plus one more leaf yields exactly the five labels
 * that frame's `+3` implies.
 *
 * An unchecked subtree is skipped whole; an indeterminate one emits no label
 * for itself but is still descended into.
 */
export function selectedLabels(tree: CompanyNode[], selected: Set<string>): string[] {
  const out: string[] = []
  const walk = (nodes: CompanyNode[]) => {
    for (const n of nodes) {
      const state = nodeState(n, selected)
      if (state === 'unchecked') continue
      if (state === 'checked') out.push(n.label)
      if (n.children) walk(n.children)
    }
  }
  walk(tree)
  return out
}
