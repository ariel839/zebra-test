import type { Dashboard, LookupResult } from '@/types/dashboard'

/**
 * THE ONLY PLACE IN THE APP THAT BRANCHES ON AN ACCOUNT NUMBER.
 * Components must never compare an account number themselves — call this.
 *
 * Demo numbers (also printed in docs/demo-card.md):
 *   189189189  no match          -> happy flow, rows B-E
 *   333333333  three dashboards  -> row F
 *   111111111  one direct OneCare-> row G
 */

const THREE_RESULTS: Dashboard[] = [
  { id: 'ah', company: 'Albert Heijn', partner: 'Zebra', supportedAction: 'Upgrade', region: 'EMEA', contractType: 'OneCare' },
  { id: 'acz', company: 'Albert CZ', partner: 'Kodys', supportedAction: 'None', region: 'EMEA', contractType: 'OneCare' },
  { id: 'ad', company: 'Ahold Delhaize', partner: 'Zebra', supportedAction: 'Add Licenses', region: 'EMEA', contractType: 'Foresight IOT' },
]

const SINGLE_RESULT: Dashboard[] = [
  { id: 'ah', company: 'Albert Heijn', partner: 'Zebra', supportedAction: 'Upgrade', region: 'EMEA', contractType: 'OneCare' },
]

// Verbatim from the frames. F and G say different things — that is why copy
// travels with the result rather than living in the modal component.
const F_COPY = {
  title: 'Existing Dashboards Detected',
  body:
    'Select an existing dashboard to continue with upgrades or license changes, ' +
    'or create a new dashboard from scratch.',
}

const G_COPY = {
  title: 'Existing Direct OneCare Dashboard Detected',
  body:
    'A direct OneCare dashboard already exists for this customer account. ' +
    'Upgrade it to Foresight to use existing data, or create a new dashboard.',
}

const SEEDED: Record<string, LookupResult> = {
  '189189189': { existing: [], copy: null },
  '333333333': { existing: THREE_RESULTS, copy: F_COPY },
  '111111111': { existing: SINGLE_RESULT, copy: G_COPY },
}

export function accountLookup(accountNumber: string): LookupResult {
  return SEEDED[accountNumber.trim()] ?? { existing: [], copy: null }
}
