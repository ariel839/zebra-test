import type { ReactNode } from 'react'

/**
 * The footer action strip. Height ramps down from its measured 98px via
 * `--viq-footer-h` (a floor, not a fixed height, so a stacked pair of
 * buttons on a phone grows the strip instead of overflowing it).
 *
 * Below `sm` the buttons stretch to share the row: at 375px a right-hugging
 * pair of 120px buttons leaves a large dead gap and puts the primary action
 * against the screen edge, and `min-w-[120px]` alone can't fix that. From
 * `sm` up this is the original right-aligned pair.
 */
export function WizardBottomStrip({ children }: { children: ReactNode }) {
  return (
    <footer
      className={[
        'flex min-h-[var(--viq-footer-h)] shrink-0 items-center border-t border-viq-border',
        'gap-4 px-[var(--viq-gutter)] py-3 sm:gap-8 sm:py-0',
        '[&_button]:flex-1 sm:[&_button]:flex-none sm:[&_button]:min-w-[120px]',
        'justify-stretch sm:justify-end',
      ].join(' ')}
    >
      {children}
    </footer>
  )
}
