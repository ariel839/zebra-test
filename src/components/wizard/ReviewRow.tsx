import type { ReactNode } from 'react'

export interface ReviewRowProps {
  label: string
  value: ReactNode
  /** Right-aligned note on the value line. R3 uses it for 'Contracts automatically added'. */
  note?: string
}

/**
 * Label-above-value row with a hairline rule beneath it, spec R3
 * (`10680:16436`). No per-row pencil icon — R3 has none; editing is reached
 * from the footer's Edit control instead.
 */
export function ReviewRow({ label, value, note }: ReviewRowProps) {
  return (
    <div className="border-b border-viq-border py-3">
      <div className="text-xs text-viq-text-muted">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-4">
        <div className="text-sm font-medium text-viq-text">{value}</div>
        {note && <span className="text-xs text-viq-text-muted">{note}</span>}
      </div>
    </div>
  )
}
