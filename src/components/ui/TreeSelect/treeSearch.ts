import type { CompanyNode } from './types'

/**
 * Returns a pruned copy of the tree. A node is kept when it matches, or when
 * any descendant matches — so ancestors of a match stay visible. Spec §4.
 * An empty query and an empty country list are both no-ops.
 *
 * A node that matches on its own keeps its **whole** subtree, unpruned.
 * Filtering by `United States` matches the `LKQ Corporation` branch but none
 * of its (UK/CZ/…) subsidiaries; pruning them away would leave a dead-end
 * row that shows nothing and — since `collectLeafIds` treats a childless
 * node as a leaf — would put the branch's own id into the leaf-only
 * selection set. Keeping the subtree makes the match expandable and
 * selectable as the group it is.
 */
export function filterTree(
  tree: CompanyNode[],
  query: string,
  countries: string[],
): CompanyNode[] {
  const q = query.trim().toLowerCase()
  const countrySet = new Set(countries)

  const selfMatches = (n: CompanyNode) =>
    (q === '' || n.label.toLowerCase().includes(q)) &&
    (countrySet.size === 0 || countrySet.has(n.country))

  const prune = (nodes: CompanyNode[]): CompanyNode[] =>
    nodes.flatMap((n): CompanyNode[] => {
      if (selfMatches(n)) return [n]
      const kids = n.children ? prune(n.children) : []
      if (kids.length > 0) return [{ ...n, children: kids }]
      return []
    })

  return prune(tree)
}

export function allCountries(tree: CompanyNode[]): string[] {
  const seen = new Set<string>()
  const walk = (nodes: CompanyNode[]) => {
    for (const n of nodes) {
      seen.add(n.country)
      if (n.children) walk(n.children)
    }
  }
  walk(tree)
  return [...seen].sort()
}
