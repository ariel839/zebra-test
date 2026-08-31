import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface Column<T> {
  key: string
  header: string
  /** Optional header adornment — the Supported Actions column carries an Info icon. */
  headerIcon?: ReactNode
  render: (row: T) => ReactNode
}

export interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  rows: T[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  /** Rendered in a trailing cell on row hover. Return null to show nothing. */
  rowAction?: (row: T) => ReactNode
  /**
   * Forces one row's hover/reveal treatment on, additively — real
   * `:hover` / `:focus-within` keeps working regardless. `null`/`undefined`
   * forces nothing (today's behaviour).
   */
  forceHoverRowId?: string | null
  className?: string
}

/**
 * There is no data-bearing trailing column — `rowAction` renders into a
 * hover-revealed cell whose width (`w-12`) is reserved unconditionally, on
 * every row, whether or not a row supplies an action. That keeps the reveal
 * purely visual (opacity) so no row ever reflows on hover.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  selectedId,
  onSelect,
  rowAction,
  forceHoverRowId,
  className,
}: DataTableProps<T>) {
  return (
    <table className={cn('w-full border-collapse text-left text-sm text-viq-text', className)}>
      <thead>
        <tr className="border-b border-viq-border">
          {columns.map((column) => (
            <th key={column.key} className="px-4 py-3 font-medium text-viq-text-muted">
              <span className="inline-flex items-center gap-1.5">
                {column.header}
                {column.headerIcon}
              </span>
            </th>
          ))}
          {/* Reserved width for the hover-revealed action cell — no header label. */}
          <th className="w-12 px-2 py-3" aria-hidden="true" />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const selected = row.id === selectedId
          const forced = row.id === forceHoverRowId
          return (
            <tr
              key={row.id}
              onClick={onSelect ? () => onSelect(row.id) : undefined}
              className={cn(
                'group border-b border-viq-border last:border-b-0 hover:bg-viq-surface-hover',
                onSelect && 'cursor-pointer',
                selected && 'bg-viq-nav-active',
                forced && 'bg-viq-surface-hover',
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3">
                  {column.render(row)}
                </td>
              ))}
              <td className="w-12 px-2 py-3">
                <div
                  className={cn(
                    'opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100',
                    forced && 'opacity-100',
                  )}
                >
                  {rowAction?.(row)}
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
