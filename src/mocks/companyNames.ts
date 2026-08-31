/**
 * Company Name single-select options, from screens/B05_regular-selection-dropdown__10489-77782.png.
 * Each option carries a TYPE BADGE, and two options share the label 'Euro Car Parts' —
 * the badge is the only thing distinguishing them, so the list is keyed by id, never by label.
 *
 * 'LKG Corporation' is spelled with a G in this dropdown while the tree (§4) says 'LKQ'.
 * Reproduce both as drawn and add it to the copy-bug list.
 */
export type CompanyNameKind = 'Standard' | 'Subsidiary' | 'Account'

export interface CompanyNameOption {
  id: string
  label: string
  kind: CompanyNameKind
}

export const COMPANY_NAMES: CompanyNameOption[] = [
  { id: 'lkg-standard', label: 'LKG Corporation', kind: 'Standard' },
  { id: 'ecp-subsidiary', label: 'Euro Car Parts', kind: 'Subsidiary' },
  { id: 'ecp-account', label: 'Euro Car Parts', kind: 'Account' },
]
