import { useState } from 'react'
import { TreeSelect } from '@/components/ui/TreeSelect/TreeSelect'
import { rollUpSelection } from '@/components/ui/TreeSelect/treeSelection'
import { WizardShell } from '@/components/wizard/WizardShell'
import { COMPANY_TREE } from '@/mocks/companyTree'

/**
 * Dev-only isolation harness for TreeSelect (Task 8). Not linked from any
 * screen or nav entry — reachable only at /sandbox/tree-select. Exists so
 * the most expensive component in the build (spec §4) can be built and
 * clicked through against Figma B6 (`10489:78221`) before it touches the
 * real Dashboard Settings form.
 */
export function TreeSelectSandbox() {
  const [selected, setSelected] = useState<string[]>([])
  const rollUp = rollUpSelection(COMPANY_TREE, new Set(selected))

  return (
    <WizardShell title="TreeSelect sandbox" footer={null} activeNavId="dashboard-settings">
      <div className="flex gap-16 px-14 py-8">
        <TreeSelect
          label="Valid company names"
          required
          tooltip="Select every company name that should be treated as valid for this account."
          tree={COMPANY_TREE}
          value={selected}
          onChange={setSelected}
          placeholder="Select all valid names"
          defaultOpen
        />
        <pre className="max-w-[480px] rounded-viq-control border border-viq-border bg-viq-surface-search p-4 text-xs text-viq-text">
          {JSON.stringify(
            {
              selectedLeafIds: selected,
              rollUpSelection: rollUp,
            },
            null,
            2,
          )}
        </pre>
      </div>
    </WizardShell>
  )
}
