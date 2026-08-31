/**
 * Company Name single-select options, from screens/B05_regular-selection-dropdown__10489-77782.png.
 * Each option carries a TYPE BADGE, and two options share the label 'Euro Car Parts' —
 * the badge is the only thing distinguishing them, so the list is keyed by id, never by label.
 *
 * 'LKG Corporation' is spelled with a G in this dropdown while the tree (§4) says 'LKQ'.
 * Reproduce both as drawn and add it to the copy-bug list.
 */
import type { BadgeTone } from '@/components/ui/Select'

export type CompanyNameKind = 'Standard' | 'Subsidiary' | 'Account'

/**
 * Badge fill per kind, as drawn in B05: three distinct tones, not two. Lives here
 * rather than in each route because both the form and the review screen render this
 * same list — an inline `kind === 'Account' ? 'blue' : 'grey'` in each of them is how
 * 'Subsidiary' came to render as dark grey in the first place.
 */
export const COMPANY_NAME_BADGE_TONES: Record<CompanyNameKind, BadgeTone> = {
  Standard: 'grey',
  Subsidiary: 'grey-light',
  Account: 'blue',
}

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
