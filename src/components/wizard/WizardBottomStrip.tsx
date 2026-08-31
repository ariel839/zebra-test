import type { ReactNode } from 'react'

export function WizardBottomStrip({ children }: { children: ReactNode }) {
  return (
    <footer className="flex h-[98px] shrink-0 items-center justify-end gap-3 border-t border-viq-border px-14">
      {children}
    </footer>
  )
}
