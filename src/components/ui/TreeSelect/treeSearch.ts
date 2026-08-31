import type { CompanyNode } from './types'

/**
 * Returns a pruned copy of the tree. A node is kept when it matches, or when
 * any descendant matches — so ancestors of a match stay visible. Spec §4.
 * An empty query and an empty country list are both no-ops.
 *
 * When a branch matches by its own name but none of its children match, the
 * branch is kept with `children: []` rather than its full child list — a
 * name match shows the branch itself, not an unrelated subtree. No search
 * frame in wizard-spec-files/screens/ exercises company-name text search
 * (C-row covers only the country filter), so this default is unverified
 * against a screenshot; swap to `children: n.children` if a future frame
 * shows otherwise.
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
      return [{ ...n, children: n.children ? [] : undefined }]
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
