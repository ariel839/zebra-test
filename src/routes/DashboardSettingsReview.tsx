import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { ChipGroup } from '@/components/ui/ChipGroup'
import { Checkbox } from '@/components/ui/Checkbox'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { InputWithHeader } from '@/components/ui/InputWithHeader'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { Select, type SelectOption } from '@/components/ui/Select'
import { TreeSelect } from '@/components/ui/TreeSelect/TreeSelect'
import { selectedLabels } from '@/components/ui/TreeSelect/treeSelection'
import { UploadButton } from '@/components/ui/UploadButton'
import { ReviewLogoPanel } from '@/components/wizard/ReviewLogoPanel'
import { ReviewRow } from '@/components/wizard/ReviewRow'
import { WizardShell } from '@/components/wizard/WizardShell'
import { REVIEW_COPY } from '@/content/review'
import { COMPANY_NAMES, COMPANY_NAME_BADGE_TONES } from '@/mocks/companyNames'
import { COMPANY_TREE } from '@/mocks/companyTree'
import { CONTRACT_TYPES } from '@/mocks/contractTypes'
import { useWizardStore } from '@/store/wizard'

const { rows, contractsAutoAddedNote, buttons, fields } = REVIEW_COPY

/** `Select` is keyed by option id (two options share the label 'Euro Car Parts'). */
const COMPANY_NAME_OPTIONS: SelectOption[] = COMPANY_NAMES.map((c) => ({
  id: c.id,
  label: c.label,
  badge: c.kind,
  badgeTone: COMPANY_NAME_BADGE_TONES[c.kind],
}))

const AUTO_ADD_CONTRACTS_OPTIONS = [
  { label: fields.radio.no, value: 'no' as const },
  { label: fields.radio.yes, value: 'yes' as const },
]

/** Mirrors the two-column field grid used by the initial Dashboard Settings form. */
function Strip({ children }: { children: ReactNode }) {
  return <div className="mb-6 flex gap-8">{children}</div>
}

function Col({ children }: { children: ReactNode }) {
  return <div className="w-[260px] shrink-0">{children}</div>
}

/**
 * Review mode (R3) and edit-from-review mode (E2/E3) — Task 16.
 *
 * Self-contained: reads/writes `useWizardStore` directly and switches its
 * own body + footer on `mode`. Nothing outside this file needs to know
 * which of R3/E2/E3 is showing; the caller only needs to mount
 * `<DashboardSettingsReview />` when review mode is active.
 *
 * R3 ships with only a "Done" footer button in the Figma frame, but E2/E3
 * (edit mode) are otherwise unreachable, so an "Edit" control is added to
 * the left of "Done" — a deliberate, approved addition, not an oversight
 * (see docs/figma-capture.md and the task 16 report).
 */
export function DashboardSettingsReview() {
  const navigate = useNavigate()
  const mode = useWizardStore((s) => s.mode)
  const form = useWizardStore((s) => s.form)
  const setField = useWizardStore((s) => s.setField)
  const enterEdit = useWizardStore((s) => s.enterEdit)
  const cancelEdit = useWizardStore((s) => s.cancelEdit)
  const saveEdit = useWizardStore((s) => s.saveEdit)

  const companyLabel = COMPANY_NAMES.find((c) => c.id === form.companyName)?.label ?? ''

  if (mode === 'edit') {
    return (
      <WizardShell
        title={REVIEW_COPY.title}
        footer={
          <>
            <Button variant="outline" leftIcon={<X size={16} />} onClick={cancelEdit}>
              {buttons.cancel}
            </Button>
            {/* Verbatim Figma copy — the primary button reads "Edit", not "Save". */}
            <Button variant="primary" onClick={saveEdit}>
              {buttons.saveEdit}
            </Button>
          </>
        }
      >
        <div className="h-full overflow-y-auto px-14 pt-8 pb-8">
          <Strip>
            <Col>
              <InputWithHeader
                label={fields.labels.accountNumber}
                required
                tooltip={fields.tooltips.accountNumber}
                placeholder={fields.placeholders.accountNumber}
                value={form.accountNumber}
                onChange={(e) => setField('accountNumber', e.target.value)}
              />
            </Col>
            <Col>
              <Select
                label={fields.labels.companyName}
                required
                tooltip={fields.tooltips.companyName}
                placeholder={fields.placeholders.companyName}
                value={form.companyName}
                onChange={(id) => setField('companyName', id)}
                options={COMPANY_NAME_OPTIONS}
              />
            </Col>
          </Strip>

          <Strip>
            <Col>
              <InputWithHeader
                label={fields.labels.displayName}
                required
                tooltip={fields.tooltips.displayName}
                placeholder={fields.placeholders.displayName}
                value={form.displayName}
                onChange={(e) => setField('displayName', e.target.value)}
              />
            </Col>
            <Col>
              <div className="flex flex-col">
                <FieldLabel
                  label={fields.labels.automaticallyAddContracts}
                  tooltip={fields.tooltips.automaticallyAddContracts}
                />
                <div className="flex h-10 items-center">
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
                  label={fields.labels.validCompanyNames}
                  required
                  tooltip={fields.tooltips.validCompanyNames}
                  value={form.validCompanyNames}
                  onChange={(ids) => setField('validCompanyNames', ids)}
                  tree={COMPANY_TREE}
                  placeholder={fields.placeholders.validCompanyNames}
                />
              </Col>
            )}
            <Col>
              <MultiSelect
                label={fields.labels.contractType}
                required
                tooltip={fields.tooltips.contractType}
                value={form.contractTypes}
                onChange={(v) => setField('contractTypes', v)}
                options={CONTRACT_TYPES}
                placeholder={fields.placeholders.contractType}
              />
            </Col>
          </Strip>

          <Strip>
            <Col>
              <InputWithHeader
                type="email"
                label={fields.labels.userEmail}
                required
                tooltip={fields.tooltips.userEmail}
                placeholder={fields.placeholders.userEmail}
                value={form.userEmail}
                onChange={(e) => setField('userEmail', e.target.value)}
              />
            </Col>
            <Col>
              <div className="flex h-10 items-end pb-2.5">
                <Checkbox
                  checked={form.signUpForLearningSeries}
                  onChange={(checked) => setField('signUpForLearningSeries', checked)}
                  label={fields.labels.signUpForLearningSeries}
                />
              </div>
            </Col>
          </Strip>

          <Strip>
            <Col>
              <UploadButton
                value={form.companyLogo}
                onChange={(url) => setField('companyLogo', url)}
                label={fields.uploadLogo}
              />
            </Col>
          </Strip>
        </div>
      </WizardShell>
    )
  }

  return (
    <WizardShell
      title={REVIEW_COPY.title}
      footer={
        <>
          <Button variant="outline" onClick={enterEdit}>
            {buttons.enterEdit}
          </Button>
          <Button variant="primary" onClick={() => navigate('/')}>
            {buttons.done}
          </Button>
        </>
      }
    >
      <div className="flex h-full gap-10 overflow-y-auto px-14 pt-8 pb-8">
        <ReviewLogoPanel
          logo={form.companyLogo}
          companyName={companyLabel}
          accountNumber={form.accountNumber}
        />
        <div className="min-w-0 flex-1">
          <ReviewRow
            label={rows.displayName}
            value={form.displayName}
            note={form.automaticallyAddContracts === 'yes' ? contractsAutoAddedNote : undefined}
          />
          <ReviewRow
            label={rows.validCompanyNames}
            value={
              <ChipGroup
                labels={selectedLabels(COMPANY_TREE, new Set(form.validCompanyNames))}
                max={4}
              />
            }
          />
          <ReviewRow
            label={rows.contractType}
            value={<ChipGroup labels={form.contractTypes} />}
          />
          {/* Rendered verbatim — do not normalise casing, the frames only differ by what was typed. */}
          <ReviewRow label={rows.userEmail} value={form.userEmail} />
        </div>
      </div>
    </WizardShell>
  )
}
