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
 *
 * Metrics measured off the R3 frame (design px, `tools/fidelity`): the rule
 * spans the full 684px column while the text is inset 24px from it, rows
 * pitch at ~103px (dividers land on y270/372/476/580), the label is 16px
 * muted and the value 18px. Those sizes are specific to the review screen —
 * the form's own labels are 12/14px.
 */
export function ReviewRow({ label, value, note }: ReviewRowProps) {
  return (
    <div className="border-b border-viq-border px-6 pt-[var(--viq-review-row-pt)] pb-[var(--viq-review-row-pb)]">
      <div className="text-base text-viq-text-muted">{label}</div>
      {/* min-h-7 keeps a chip row exactly as tall as a text row: every R3
          row pitches at ~103px whether its value is text or chips. */}
      {/* Wraps below `sm`: the value and the right-aligned note (R3's
          'Contracts automatically added') do not both fit on a phone line.
          `min-h` still equalises a chip row against a text row — it just does
          it at a height that tracks the window, so seven of these rows fit a
          900px-tall browser window without a scrollbar. */}
      <div className="mt-[var(--viq-review-value-mt)] flex min-h-[var(--viq-review-value-h)] flex-wrap items-center justify-between gap-x-4 gap-y-1 sm:flex-nowrap">
        <div className="min-w-0 text-lg font-medium text-viq-text">{value}</div>
        {note && <span className="shrink-0 text-base text-viq-text-muted">{note}</span>}
      </div>
    </div>
  )
}
