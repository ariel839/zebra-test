import type { ReactNode } from 'react'
import { Pencil, X } from 'lucide-react'
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
import { ReviewFieldBox } from '@/components/wizard/ReviewFieldBox'
import { ReviewLogoCard } from '@/components/wizard/ReviewLogoCard'
import { ReviewLogoPanel } from '@/components/wizard/ReviewLogoPanel'
import { ReviewRow } from '@/components/wizard/ReviewRow'
import { WizardShell } from '@/components/wizard/WizardShell'
import { REVIEW_COPY } from '@/content/review'
import { useDemoStore } from '@/flow/demoState'
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

/**
 * Mirrors the two-column field grid used by the initial Dashboard Settings
 * form, including its responsive behaviour: the two slots stack below `md`
 * and the column gap rides `--viq-gap-field`, which caps at the measured
 * 32px, so from `md` up this is the original `flex gap-8` row.
 */
function Strip({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-[var(--viq-gap-field)] md:flex-row">{children}</div>
  )
}

function Col({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-w-0 max-w-[420px] md:w-[260px] md:max-w-none md:shrink-0">
      {children}
    </div>
  )
}

/**
 * Review mode (E1, R3) and edit-from-review mode (E2/E3) — Task 16.
 *
 * Self-contained: reads/writes `useWizardStore` directly and switches its
 * own body + footer on `mode`. Nothing outside this file needs to know
 * which of E1/R3/E2/E3 is showing; the caller only needs to mount
 * `<DashboardSettingsReview />` when review mode is active.
 *
 * **Three review arrangements ship, of the same seven fields.**
 * `'dividers'` (R2, `10680:15949`) is the app's own review screen — the one
 * Submit lands on and the one the Figma dev note `9082:6667` describes for
 * re-entry into the self-onboarding area: no stepper, each field a
 * hairline-ruled read-only row with the logo card to its right, editing
 * reached through the Edit button. `'boxed'` (E1/R1, `8901:9551`) draws the
 * same seven fields as bordered cards, and `'logoLeft'` (R3, `10680:16436`)
 * moves the logo to a left panel beside a shorter set of rows. Both
 * alternates stay reachable through the flow's own `E1` and `R3` entries via
 * `useDemoStore().reviewLayout`, so their frames can still be compared
 * side-by-side. Outside the flow that override is null and the app gets the
 * dividers layout.
 *
 * **Footer deviates from every frame, deliberately.** R2 and R3 each draw a
 * single "Done" button and E1 a single "Edit"; every layout here carries
 * both, because a click-through demo needs an exit from review *and* a way
 * into edit mode (E2/E3), which is otherwise unreachable. This is the same
 * approved addition already recorded for R3 — see docs/figma-capture.md and
 * the task 16 report.
 */
export function DashboardSettingsReview() {
  const navigate = useNavigate()
  const mode = useWizardStore((s) => s.mode)
  const form = useWizardStore((s) => s.form)
  const setField = useWizardStore((s) => s.setField)
  const enterEdit = useWizardStore((s) => s.enterEdit)
  const cancelEdit = useWizardStore((s) => s.cancelEdit)
  const saveEdit = useWizardStore((s) => s.saveEdit)
  const reset = useWizardStore((s) => s.reset)

  /**
   * Done ends the round, so it has to clear the wizard — not just navigate.
   * The store (and its `sessionStorage` mirror) outlives this route, so
   * leaving it filled meant walking back in through Overview -> Next redrew
   * the form with the dashboard that was just created still in every field,
   * logo included, instead of a blank one for the next dashboard.
   */
  const finishAndExit = () => {
    reset()
    navigate('/')
  }
  // Null everywhere outside the guided flow, which is what makes 'dividers'
  // the app's review screen. Read unconditionally — the edit-mode early
  // return below must not change the hook order.
  const layout = useDemoStore((s) => s.reviewLayout) ?? 'dividers'

  const companyLabel = COMPANY_NAMES.find((c) => c.id === form.companyName)?.label ?? ''

  /**
   * The seven read-only fields, shared by the `'dividers'` and `'boxed'`
   * arrangements — they show the same data in the same order and differ only
   * in how one field is drawn, so the list lives here rather than being
   * written out twice and drifting.
   */
  const reviewFields: { key: string; label: string; value: ReactNode }[] = [
    { key: 'accountNumber', label: fields.labels.accountNumber, value: form.accountNumber },
    { key: 'companyName', label: fields.labels.companyName, value: companyLabel },
    { key: 'displayName', label: fields.labels.displayName, value: form.displayName },
    {
      key: 'automaticallyAddContracts',
      label: fields.labels.automaticallyAddContracts,
      value: form.automaticallyAddContracts === 'yes' ? fields.radio.yes : fields.radio.no,
    },
    // Dropped when contracts are not auto-added, matching the form: there is
    // no valid-names selection to review in that case.
    ...(form.automaticallyAddContracts === 'yes'
      ? [
          {
            key: 'validCompanyNames',
            label: fields.labels.validCompanyNames,
            value: (
              <ChipGroup
                labels={selectedLabels(COMPANY_TREE, new Set(form.validCompanyNames))}
                max={4}
                size="sm"
              />
            ),
          },
        ]
      : []),
    {
      key: 'contractType',
      label: fields.labels.contractType,
      value: <ChipGroup labels={form.contractTypes} size="sm" />,
    },
    // Rendered verbatim — do not normalise casing, the frames only differ by what was typed.
    { key: 'userEmail', label: fields.labels.userEmail, value: form.userEmail },
  ]

  if (mode === 'edit') {
    return (
      <WizardShell
        title={REVIEW_COPY.title}
        footer={
          <>
            <Button variant="outline" leftIcon={<X size={16} />} onClick={cancelEdit}>
              {buttons.cancel}
            </Button>
            {/* Reads "Save", not the frame's "Edit" — client-approved fix to
                the §7.6 designer slip. See REVIEW_COPY.buttons.saveEdit. */}
            <Button variant="primary" onClick={saveEdit}>
              {buttons.saveEdit}
            </Button>
          </>
        }
      >
        <div className="h-full overflow-y-auto px-[var(--viq-gutter)] pt-[var(--viq-block)] pb-[var(--viq-block)]">
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

  /* Both right-logo arrangements carry the same footer: E1's "Edit ✎"
     control beside the Done that leaves review. */
  const rightLogoFooter = (
    <>
      <Button variant="outline" rightIcon={<Pencil size={16} />} onClick={enterEdit}>
        {buttons.enterEdit}
      </Button>
      <Button variant="primary" onClick={finishAndExit}>
        {buttons.done}
      </Button>
    </>
  )

  if (layout === 'dividers') {
    return (
      <WizardShell title={REVIEW_COPY.title} footer={rightLogoFooter}>
        {/*
          R2 geometry, measured off the frame (`tools/fidelity`, design px):
          px-14 puts the 684px row column at x288, its rules running to x971
          and no further, and the logo card 176px right of that at x1147.
          pt-7 lands the first rule at y268 against the frame's y267, with the
          rows' own ~103px pitch carrying the rest (y371/475/579/682/785/889).
          The card sits 9px lower than the rows start — hence mt-[9px], not a
          shared container offset.
        */}
        {/* Stacks below `lg` — the third structural breakpoint of the pass.
            `lg` is the canvas threshold, so side-by-side is on for every
            desktop size: the canvas is 1920 design px wide there and the 684px
            row column, 176px gutter and 240px logo card fit it exactly as the
            frame does. A wider prefix (`2xl`) would reflow a canvas that has
            room, because media queries see the 1190px window and not the 1920
            layout. Below `lg` there is no canvas, and 1080px of content has
            nowhere to go, so it stacks.

            The rows stay FIRST when stacked: they are the content being
            reviewed, and putting the 240px logo card above them would make a
            phone scroll past a decoration to reach the data. */}
        <div className="flex h-full flex-col gap-8 overflow-y-auto px-[var(--viq-gutter)] pt-[var(--viq-review-row-pt)] pb-[var(--viq-block)] lg:flex-row lg:gap-[var(--viq-gap-review)]">
          {/* `flex-1 max-w`, never a fixed `w-[684px]`: the column reaches its
              measured 684px whenever there is room (the whole of canvas mode,
              where the layout is 1920 wide) but can give ground instead of
              overflowing if the content beside it ever grows. */}
          <div className="w-full max-w-[684px] lg:flex-1">
            {reviewFields.map((f) => (
              <ReviewRow key={f.key} label={f.label} value={f.value} />
            ))}
          </div>
          {/* The 9px drop is the frame's own row-to-card offset, so it only
              applies where the card actually sits beside the rows. */}
          <div className="shrink-0 lg:mt-[9px]">
            <ReviewLogoCard logo={form.companyLogo} companyName={companyLabel} />
          </div>
        </div>
      </WizardShell>
    )
  }

  if (layout === 'boxed') {
    return (
      <WizardShell title={REVIEW_COPY.title} footer={rightLogoFooter}>
        {/*
          E1 geometry, measured off the E1/R1 frames (`tools/fidelity`, design
          px): px-14 puts the box column at x288 and pt-10 its first box at
          y178, level with the logo card; the column is a fixed 684px wide and
          the card sits 176px right of it. Box pitch is 100.67 (76 tall + a
          24.5px gap splits the difference to under 2px across all seven).
        */}
        <div className="flex h-full flex-col gap-8 overflow-y-auto px-[var(--viq-gutter)] pt-10 pb-[var(--viq-block)] lg:flex-row lg:gap-[var(--viq-gap-review)]">
          <div className="flex w-full max-w-[684px] flex-col gap-[var(--viq-review-box-gap)] lg:flex-1">
            {reviewFields.map((f) => (
              <ReviewFieldBox key={f.key} label={f.label} value={f.value} />
            ))}
          </div>
          <ReviewLogoCard logo={form.companyLogo} companyName={companyLabel} />
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
          <Button variant="primary" onClick={finishAndExit}>
            {buttons.done}
          </Button>
        </>
      }
    >
      {/*
        R3 geometry, measured off the frame (`tools/fidelity`): px-14 puts the
        logo card at x288, the 89px gutter puts the review column at x577, and
        the column is a fixed 684px — the rules stop there, they do not run to
        the edge of the window.
      */}
      {/* R3 already puts the logo first, so stacking below `lg` naturally
          gives the logo-above-rows reading its own layout is built around.
          The row gap (89px) and the column gap (32px) are on different axes,
          so switching between them produces no visible step. Same `2xl`
          threshold as the other two arrangements — R3's 200px logo panel
          would technically fit from ~1300px, but three review layouts that
          reflow at different widths read as arbitrary while resizing. */}
      <div className="flex h-full flex-col gap-8 overflow-y-auto px-[var(--viq-gutter)] pt-[var(--viq-block)] pb-[var(--viq-block)] lg:flex-row lg:gap-[89px]">
        <ReviewLogoPanel
          logo={form.companyLogo}
          companyName={companyLabel}
          accountNumber={form.accountNumber}
        />
        <div className="w-full max-w-[684px] lg:flex-1">
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
                size="sm"
              />
            }
          />
          <ReviewRow
            label={rows.contractType}
            value={<ChipGroup labels={form.contractTypes} size="sm" />}
          />
          {/* Rendered verbatim — do not normalise casing, the frames only differ by what was typed. */}
          <ReviewRow label={rows.userEmail} value={form.userEmail} />
        </div>
      </div>
    </WizardShell>
  )
}
