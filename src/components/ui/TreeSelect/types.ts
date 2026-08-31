export interface CompanyNode {
  id: string
  label: string
  /** Drives the Row C country filter. Every node carries one, including branches. */
  country: string
  children?: CompanyNode[]
}
