export type SupportedAction = 'Upgrade' | 'None' | 'Add Licenses'

export interface Dashboard {
  id: string
  company: string
  partner: string
  supportedAction: SupportedAction
  region: string
  contractType: string
}

export interface ExistingDashboardsCopy {
  title: string
  body: string
}

export interface LookupResult {
  existing: Dashboard[]
  /** Modal copy for this match. Null when there is nothing to show. */
  copy: ExistingDashboardsCopy | null
}
