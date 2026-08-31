import type { CompanyNode } from './types'

/**
 * Returns a pruned copy of the tree. A node is kept when it matches, or when
 * any descendant matches — so ancestors of a match stay visible. Spec §4.
 * An empty query and an empty country list are both no-ops.
 *
 * A branch never survives as a dead end. When it matches on its own but no
 * descendant does — filtering by `United States` matches `LKQ Corporation`
 * while every subsidiary under it is UK/CZ/… — it keeps its **whole**
 * subtree instead of an empty child list. An empty one would render a row
 * that expands to nothing and, since `collectLeafIds` treats a childless
 * node as a leaf, would put the branch's own id into the leaf-only selection
 * set. When descendants do match, only those stay: the visible tree is the
 * filter's actual result, and checking the branch selects exactly it.
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
      const kids = n.children ? prune(n.children) : []
      if (kids.length > 0) return [{ ...n, children: kids }]
      if (!selfMatches(n)) return []
      return [n]
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
