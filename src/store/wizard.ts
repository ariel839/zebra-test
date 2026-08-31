import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { accountLookup } from '@/mocks/accountLookup'
import type { LookupResult } from '@/types/dashboard'

/** How long the loading card sits at a full bar before success takes over. */
const FULL_BAR_HOLD = 450
/** How long the success card shows before the wizard advances to review. */
export const SUCCESS_HOLD = 1400

export type WizardMode = 'edit' | 'review'
export type WizardStatus = 'idle' | 'submitting' | 'done'

export interface WizardForm {
  accountNumber: string
  /** CompanyNameOption id, NOT a label — two options share the label 'Euro Car Parts'. */
  companyName: string | null
  displayName: string
  automaticallyAddContracts: 'yes' | 'no'
  /** Leaf ids from COMPANY_TREE. Only leaves are stored; parent state is derived. */
  validCompanyNames: string[]
  contractTypes: string[]
  userEmail: string
  signUpForLearningSeries: boolean
  /**
   * The uploaded logo as a `data:` URL, or null.
   *
   * A `blob:` object URL would be smaller, but it dies with the document:
   * after a reload (a browser refresh, a new tab on `?mode=review`, or a
   * Vite HMR full reload mid-demo) the handle no longer resolves and the
   * review screen falls back to its `logoipsum` placeholder. A data URL is
   * self-contained, so it survives the same `sessionStorage` round-trip as
   * the rest of the form. See `UploadButton`.
   */
  companyLogo: string | null
}

const EMPTY_FORM: WizardForm = {
  accountNumber: '',
  companyName: null,
  displayName: '',
  automaticallyAddContracts: 'yes', // spec §3: default Yes
  validCompanyNames: [],
  contractTypes: [],
  userEmail: '',
  signUpForLearningSeries: false,
  companyLogo: null,
}

export interface WizardState {
  form: WizardForm
  mode: WizardMode
  status: WizardStatus
  /** 0-100 while status === 'submitting'. */
  progress: number
  /** Null until an account number has been looked up. */
  lookup: LookupResult | null
  isModalOpen: boolean
  selectedExistingDashboardId: string | null
  /** Snapshot taken on enterEdit so cancelEdit can restore it. */
  editSnapshot: WizardForm | null

  setField: <K extends keyof WizardForm>(key: K, value: WizardForm[K]) => void
  runLookup: () => void
  dismissModal: () => void
  selectExistingDashboard: (id: string) => void
  createNewDashboard: () => void
  submit: () => void
  /** Ends the success beat once review has taken over. */
  finishSubmit: () => void
  enterEdit: () => void
  cancelEdit: () => void
  saveEdit: () => void
  reset: () => void
}

/**
 * `sessionStorage`, not `localStorage`, and only `form`.
 *
 * The wizard used to live entirely in memory, so ANY full page load threw
 * the whole form away: submitting, landing on `/setup?mode=review`, then
 * refreshing (or opening that URL in a second tab) redrew review with every
 * field blank and the placeholder logo, as if nothing had been filled in.
 * Persisting `form` makes review survive a reload.
 *
 * Scoped to the tab (`sessionStorage`) so a genuinely new browser session
 * still starts on a clean form, and limited to `form` so the transient
 * slices — `status`/`progress` (the submit beat), `isModalOpen`, `lookup`,
 * `editSnapshot` — can never be restored mid-animation or mid-modal.
 * `reset()` writes `EMPTY_FORM` through the same middleware, so the `/flow`
 * loader still clears what was stored.
 */
export const useWizardStore = create<WizardState>()(persist((set, get) => ({
  form: EMPTY_FORM,
  mode: 'edit',
  status: 'idle',
  progress: 0,
  lookup: null,
  isModalOpen: false,
  selectedExistingDashboardId: null,
  editSnapshot: null,

  setField: (key, value) =>
    set((s) => ({ form: { ...s.form, [key]: value } })),

  // Called on account-number blur. The ONLY caller of accountLookup.
  runLookup: () => {
    const result = accountLookup(get().form.accountNumber)
    set({ lookup: result, isModalOpen: result.existing.length > 0 })
  },
  // `result.copy` carries the modal title/body — F and G word them differently.

  dismissModal: () => set({ isModalOpen: false }),

  selectExistingDashboard: (id) => set({ selectedExistingDashboardId: id }),

  // 'Create a New Dashboard' — dismiss and continue as the happy flow.
  createNewDashboard: () =>
    set({ isModalOpen: false, selectedExistingDashboardId: null }),

  // The single seam a real backend would replace. Nothing else may know
  // a network could exist. Spec §5: ~2.5s, progress 0 -> 100.
  submit: () => {
    if (get().status !== 'idle') return
    set({ status: 'submitting', progress: 0 })
    const started = Date.now()
    const DURATION = 2500
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - started
      const pct = Math.min(100, Math.round((elapsed / DURATION) * 100))
      set({ progress: pct })
      if (pct >= 100) {
        window.clearInterval(tick)
        // Hold on a filled bar reading '100% Complete' before the success
        // card replaces it — flipping in the same tick meant the loading
        // overlay never painted 100 and the run looked like it stopped short.
        window.setTimeout(() => set({ status: 'done' }), FULL_BAR_HOLD)
      }
    }, 50)
  },

  // The loading/success cards are a one-shot beat, not a state the wizard
  // lives in. Review calls this as it takes over; leaving `status` on 'done'
  // meant pressing Edit re-mounted the success card over the form and
  // re-armed the timer that bounces back to review.
  finishSubmit: () => set({ status: 'idle', progress: 0 }),

  enterEdit: () => set((s) => ({ mode: 'edit', editSnapshot: s.form })),
  cancelEdit: () =>
    set((s) => ({
      mode: 'review',
      form: s.editSnapshot ?? s.form,
      editSnapshot: null,
    })),
  saveEdit: () => set({ mode: 'review', editSnapshot: null }),

  reset: () =>
    set({
      form: EMPTY_FORM,
      mode: 'edit',
      status: 'idle',
      progress: 0,
      lookup: null,
      isModalOpen: false,
      selectedExistingDashboardId: null,
      editSnapshot: null,
    }),
}), {
  name: 'viq-wizard-form',
  storage: createJSONStorage(() => sessionStorage),
  partialize: (s) => ({ form: s.form }),
}))

/** Spec §3: Submit is disabled until every required field is valid. */
export function selectIsFormValid(state: WizardState): boolean {
  const f = state.form
  return (
    f.accountNumber.trim().length > 0 &&
    f.companyName !== null &&
    f.displayName.trim().length > 0 &&
    // The Valid Company Names tree is only rendered when contracts are added
    // automatically (frame B2 hides it on 'No'). Requiring it while it is
    // hidden left Submit permanently disabled with no field to fill.
    (f.automaticallyAddContracts === 'no' || f.validCompanyNames.length > 0) &&
    f.contractTypes.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.userEmail.trim())
  )
}
