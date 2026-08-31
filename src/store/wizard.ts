import { create } from 'zustand'
import { accountLookup } from '@/mocks/accountLookup'
import type { LookupResult } from '@/types/dashboard'

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
  /** Object URL of the uploaded file, or null. Never persisted. */
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
  enterEdit: () => void
  cancelEdit: () => void
  saveEdit: () => void
  reset: () => void
}

export const useWizardStore = create<WizardState>((set, get) => ({
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
        set({ status: 'done' })
      }
    }, 50)
  },

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
}))

/** Spec §3: Submit is disabled until every required field is valid. */
export function selectIsFormValid(state: WizardState): boolean {
  const f = state.form
  return (
    f.accountNumber.trim().length > 0 &&
    f.companyName !== null &&
    f.displayName.trim().length > 0 &&
    f.validCompanyNames.length > 0 &&
    f.contractTypes.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.userEmail.trim())
  )
}
