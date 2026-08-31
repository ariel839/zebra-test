import { Download, Filter, Info, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { IconButton } from '@/components/ui/IconButton'
import { Modal } from '@/components/ui/Modal'
import { Tag } from '@/components/ui/Tag'
import { EXISTING_DASHBOARDS_COPY } from '@/content/existingDashboards'
import { useDemoStore, useForcedHover } from '@/flow/demoState'
import type { Dashboard } from '@/types/dashboard'

export interface ExistingDashboardsModalProps {
  open: boolean
  title: string
  body: string
  rows: Dashboard[]
  onAction: (row: Dashboard) => void
  onCreateNew: () => void
  onClose: () => void
  /**
   * Action icon group on the section-heading line. Every Row F / Row G frame
   * (F2b, F2-F6, G2, G3) shows search + download only, so those default on;
   * `showFilter` exists for parity with the spec's generic icon group but is
   * off by default since no frame in this modal's data uses it.
   */
  showFilter?: boolean
  filterBadge?: number
  showSearch?: boolean
  showDownload?: boolean
}

const { columns: COLUMN_LABELS } = EXISTING_DASHBOARDS_COPY

const COLUMNS: Column<Dashboard>[] = [
  {
    key: 'company',
    header: COLUMN_LABELS.company,
    render: (row) => row.company,
  },
  {
    key: 'partner',
    header: COLUMN_LABELS.partner,
    render: (row) => row.partner,
  },
  {
    key: 'supportedAction',
    header: COLUMN_LABELS.supportedActions,
    headerIcon: <Info size={16} className="text-viq-icon-muted" aria-hidden="true" />,
    render: (row) => <Tag variant={row.supportedAction} />,
  },
  {
    key: 'region',
    header: COLUMN_LABELS.region,
    render: (row) => row.region,
  },
  {
    key: 'contractType',
    header: COLUMN_LABELS.contractType,
    render: (row) => row.contractType,
  },
]

/**
 * One component for Row F (three-result) and Row G (single-result) — spec and
 * CLAUDE.md both forbid forking on `rows.length`. F and G differ only in the
 * `title`/`body` copy supplied by the caller (from `accountLookup`'s
 * per-result `copy`) and in how many rows come through; the markup below
 * never branches on the count, and the modal's height follows its content
 * rather than a hard-coded value, so a one-row G result renders shorter than
 * a three-row F result with no layout collapse.
 */
export function ExistingDashboardsModal({
  open,
  title,
  body,
  rows,
  onAction,
  onCreateNew,
  onClose,
  showFilter = false,
  filterBadge,
  showSearch = true,
  showDownload = true,
}: ExistingDashboardsModalProps) {
  // Additive OR-site: the flow forces at most one row's key ('row:<id>') at
  // a time, so resolve it against this modal's own rows rather than
  // hardcoding a specific id here.
  const forcedHoverKeys = useDemoStore((s) => s.hover)
  const forceHoverRowId = rows.find((r) => forcedHoverKeys.includes(`row:${r.id}`))?.id ?? null
  const forceCreateNewHover = useForcedHover('button:createNew')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="min-w-[180px]"
            onClick={onCreateNew}
            forceHover={forceCreateNewHover}
          >
            {EXISTING_DASHBOARDS_COPY.createNew}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col">
        <p className="text-[16px] leading-6 text-viq-text-muted">{body}</p>

        <div className="mt-[59px] flex items-center justify-between">
          <h3 className="text-[16px] leading-6 font-semibold text-viq-text">
            {EXISTING_DASHBOARDS_COPY.sectionHeading}
          </h3>
          <div className="flex items-center gap-1">
            {showFilter && (
              <IconButton icon={<Filter size={20} />} label="Filter" badge={filterBadge} />
            )}
            {showSearch && <IconButton icon={<Search size={20} />} label="Search" />}
            {showDownload && <IconButton icon={<Download size={20} />} label="Download" />}
          </div>
        </div>

        <DataTable
          className="mt-[30px]"
          columns={COLUMNS}
          rows={rows}
          forceHoverRowId={forceHoverRowId}
          rowAction={(row) =>
            row.supportedAction === 'None' ? null : (
              <Button
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  onAction(row)
                }}
              >
                {row.supportedAction}
              </Button>
            )
          }
        />
      </div>
    </Modal>
  )
}
