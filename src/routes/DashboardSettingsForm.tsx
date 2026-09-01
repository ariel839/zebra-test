import { ArrowLeft } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { InputWithHeader } from '@/components/ui/InputWithHeader'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { Select, type SelectOption } from '@/components/ui/Select'
import { TreeSelect } from '@/components/ui/TreeSelect/TreeSelect'
import { UploadButton } from '@/components/ui/UploadButton'
import { ExistingDashboardsModal } from '@/components/wizard/ExistingDashboardsModal'
import { LoadingOverlay } from '@/components/wizard/LoadingOverlay'
import { SuccessOverlay } from '@/components/wizard/SuccessOverlay'
import { WizardShell } from '@/components/wizard/WizardShell'
import { DASHBOARD_SETTINGS_COPY } from '@/content/dashboardSettings'
import { useDemoStore, useForcedHover, useForcedOpen } from '@/flow/demoState'
import { cn } from '@/lib/cn'
import { COMPANY_NAMES, COMPANY_NAME_BADGE_TONES } from '@/mocks/companyNames'
import { COMPANY_TREE } from '@/mocks/companyTree'
import { CONTRACT_TYPES } from '@/mocks/contractTypes'
import { SUCCESS_HOLD, selectIsFormValid, useWizardStore } from '@/store/wizard'

const { labels, placeholders, tooltips, buttons, radio } = DASHBOARD_SETTINGS_COPY

/** `Select` is keyed by option id (two options share the label 'Euro Car Parts'). */
const COMPANY_NAME_OPTIONS: SelectOption[] = COMPANY_NAMES.map((c) => ({
  id: c.id,
  label: c.label,
  badge: c.kind,
  badgeTone: COMPANY_NAME_BADGE_TONES[c.kind],
}))

const AUTO_ADD_CONTRACTS_OPTIONS = [
  { label: radio.no, value: 'no' as const },
  { label: radio.yes, value: 'yes' as const },
]

/**
 * Spec §2 form grid: a row of two 260px-wide slots, 32px gap between columns,
 * 32px gap between rows. Implemented as rows of columns rather than a single
 * CSS grid so a row can render only one slot (see Automatically Add Contracts
 * = No, B02) without the other slot's space collapsing into the next row.
 *
 * Responsive: the two slots stack below `md` — the other structural
 * breakpoint of the pass, since two 260px fields plus their gap need 552px of
 * content width and a 375px phone has ~343px. The column gap rides
 * `--viq-gap-field`, which caps at the measured 32px, so from `md` up this is
 * the original `flex gap-8` row with 260px slots and nothing has moved.
 *
 * Stacked, the slots take the full width but cap at 420px: a single field
 * spanning the whole 767px of a large phone in landscape reads as a mistake,
 * and none of these inputs benefit from the extra width.
 */
function Strip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'mb-[var(--viq-row-gap)] flex flex-col gap-[var(--viq-gap-field)] md:flex-row',
        className,
      )}
    >
      {children}
    </div>
  )
}

function Col({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-w-0 max-w-[420px] md:w-[260px] md:max-w-none md:shrink-0">
      {children}
    </div>
  )
}

export function DashboardSettingsForm() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const form = useWizardStore((s) => s.form)
  const setField = useWizardStore((s) => s.setField)
  const runLookup = useWizardStore((s) => s.runLookup)
  const submit = useWizardStore((s) => s.submit)
  const finishSubmit = useWizardStore((s) => s.finishSubmit)
  const isValid = useWizardStore(selectIsFormValid)

  const status = useWizardStore((s) => s.status)
  const progress = useWizardStore((s) => s.progress)

  // Submit -> loading -> success -> review, the spec §5 chain. The success
  // card is a beat, not a destination, so it advances itself.
  //
  // Skipped inside `/flow`: B10 is a captured still there, and navigating
  // would walk the demo off its own route mid-screen.
  const inFlow = pathname.startsWith('/flow')
  useEffect(() => {
    if (status !== 'done' || inFlow) return
    const t = window.setTimeout(() => {
      finishSubmit()
      navigate('/setup?mode=review')
    }, SUCCESS_HOLD)
    return () => window.clearTimeout(t)
  }, [status, inFlow, navigate, finishSubmit])

  const lookup = useWizardStore((s) => s.lookup)
  const isModalOpen = useWizardStore((s) => s.isModalOpen)
  const dismissModal = useWizardStore((s) => s.dismissModal)
  const selectExistingDashboard = useWizardStore((s) => s.selectExistingDashboard)
  const createNewDashboard = useWizardStore((s) => s.createNewDashboard)

  // Demo-flow OR-sites (Row B/C/D). Every one of these is `false` outside
  // `/flow` (the store is never written to there), so every prop below
  // reduces to its normal default and real interaction is unaffected.
  const forceAccountNumberHover = useForcedHover('field:accountNumber')
  const forceAccountNumberTooltip = useForcedOpen('tooltip:accountNumber')
  const forceCompanyNameOpen = useForcedOpen('select:companyName')
  const forceCompanyNameTooltip = useForcedOpen('tooltip:companyName')
  const forceTreeOpen = useForcedOpen('tree')
  const forceFilterPanelOpen = useForcedOpen('filterPanel')
  const demoCountries = useDemoStore((s) => s.countries)
  const demoFilterQuery = useDemoStore((s) => s.filterQuery)
  const demoFilterDraft = useDemoStore((s) => s.filterDraft)
  const forceChipHover = useForcedHover('chip:ecp')
  // D3's frame shows Submit in its hover state (with the Company name
  // tooltip open beside it) — a hover override, not a tooltip on Submit.
  const forceSubmitHover = useForcedHover('button:submit')

  // Display Name defaults to the chosen Company Name's label, but must never
  // clobber something the user typed. Compare against the LABEL of the
  // previously selected option (not its id) — two Company Name options share
  // the label 'Euro Car Parts', so switching between them must not wipe a
  // typed value that happens to match that shared label either way.
  const handleCompanyNameChange = (id: string) => {
    const previousLabel = COMPANY_NAMES.find((c) => c.id === form.companyName)?.label
    const nextLabel = COMPANY_NAMES.find((c) => c.id === id)?.label ?? ''

    setField('companyName', id)
    if (form.displayName.trim().length === 0 || form.displayName === previousLabel) {
      setField('displayName', nextLabel)
    }
  }

  return (
    <>
      <WizardShell
        title={DASHBOARD_SETTINGS_COPY.title}
        footer={
          <>
            <Button
              variant="outline"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/')}
            >
              {buttons.back}
            </Button>
            <Button
              variant="primary"
              // D3's frame renders Submit fully enabled and hovered against
              // this step's otherwise-empty form, so the forced-hover state
              // also briefly lifts `disabled` — for that forced state only.
              // Real interaction (forceSubmitHover is always false outside
              // the flow) still gates entirely on `isValid`.
              disabled={!isValid && !forceSubmitHover}
              forceHover={forceSubmitHover}
              onClick={submit}
            >
              {buttons.submit}
            </Button>
          </>
        }
      >
        <div className="h-full overflow-y-auto px-[var(--viq-gutter)] pt-[var(--viq-form-pt)] pb-[var(--viq-block)]">
          <Strip>
            <Col>
              <InputWithHeader
                label={labels.accountNumber}
                required
                tooltip={tooltips.accountNumber}
                forceTooltipOpen={forceAccountNumberTooltip}
                forceHover={forceAccountNumberHover}
                placeholder={placeholders.accountNumber}
                value={form.accountNumber}
                onChange={(e) => setField('accountNumber', e.target.value)}
                onBlur={runLookup}
              />
            </Col>
            <Col>
              <Select
                label={labels.companyName}
                required
                tooltip={tooltips.companyName}
                forceTooltipOpen={forceCompanyNameTooltip}
                forceOpen={forceCompanyNameOpen}
                placeholder={placeholders.companyName}
                value={form.companyName}
                onChange={handleCompanyNameChange}
                options={COMPANY_NAME_OPTIONS}
              />
            </Col>
          </Strip>

          <Strip>
            <Col>
              <InputWithHeader
                label={labels.displayName}
                required
                placeholder={placeholders.displayName}
                value={form.displayName}
                onChange={(e) => setField('displayName', e.target.value)}
              />
            </Col>
            <Col>
              <div className="mt-[9px] flex flex-col">
                <FieldLabel
                  label={labels.automaticallyAddContracts}
                />
                <div className="flex h-5 items-center">
                  <RadioGroup
                    name="automaticallyAddContracts"
                    value={form.automaticallyAddContracts}
                    options={AUTO_ADD_CONTRACTS_OPTIONS}
                    onChange={(v) => setField('automaticallyAddContracts', v)}
                  />
                </div>
              </div>
            </Col>
          </Strip>

          <Strip>
            {form.automaticallyAddContracts === 'yes' && (
              <Col>
                <TreeSelect
                  label={labels.validCompanyNames}
                  required
                  value={form.validCompanyNames}
                  onChange={(ids) => setField('validCompanyNames', ids)}
                  tree={COMPANY_TREE}
                  placeholder={placeholders.validCompanyNames}
                  defaultOpen={forceTreeOpen}
                  defaultCountries={demoCountries ?? undefined}
                  defaultFilterPanelOpen={forceFilterPanelOpen}
                  defaultFilterQuery={demoFilterQuery ?? undefined}
                  defaultFilterDraft={demoFilterDraft ?? undefined}
                />
              </Col>
            )}
            <Col>
              <MultiSelect
                label={labels.contractType}
                required
                value={form.contractTypes}
                onChange={(v) => setField('contractTypes', v)}
                options={CONTRACT_TYPES}
                placeholder={placeholders.contractType}
                forceChipHoverLabel={forceChipHover ? 'IOT Mobile Computer' : undefined}
              />
            </Col>
          </Strip>

          <Strip>
            <Col>
              <InputWithHeader
                type="email"
                label={labels.userEmail}
                required
                placeholder={placeholders.userEmail}
                value={form.userEmail}
                onChange={(e) => setField('userEmail', e.target.value)}
              />
            </Col>
            <Col>
              <div className="mt-[18px] flex">
                <Checkbox
                  checked={form.signUpForLearningSeries}
                  onChange={(checked) => setField('signUpForLearningSeries', checked)}
                  label={labels.signUpForLearningSeries}
                />
              </div>
            </Col>
          </Strip>

          <Strip>
            <Col>
              <UploadButton
                value={form.companyLogo}
                onChange={(url) => setField('companyLogo', url)}
                label={buttons.uploadLogo}
              />
            </Col>
          </Strip>
        </div>
      </WizardShell>

      {status === 'submitting' && <LoadingOverlay progress={progress} />}
      {status === 'done' && <SuccessOverlay progress={progress} />}

      <ExistingDashboardsModal
        open={isModalOpen}
        title={lookup?.copy?.title ?? ''}
        body={lookup?.copy?.body ?? ''}
        rows={lookup?.existing ?? []}
        onAction={(row) => selectExistingDashboard(row.id)}
        onCreateNew={createNewDashboard}
        onClose={dismissModal}
      />
    </>
  )
}
