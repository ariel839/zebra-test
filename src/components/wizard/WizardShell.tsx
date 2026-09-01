import { useState, type ReactNode } from 'react'
import { SideNav } from './SideNav'
import { WizardBottomStrip } from './WizardBottomStrip'
import { WizardTopStrip } from './WizardTopStrip'

export interface WizardShellProps {
  title: string
  subtitle?: string
  footer: ReactNode
  children: ReactNode
  activeNavId?: string
}

export function WizardShell({
  title,
  subtitle,
  footer,
  children,
  activeNavId = 'dashboard-settings',
}: WizardShellProps) {
  // Pure presentation, so it stays local rather than going into the wizard
  // store: nothing outside this subtree needs to know the drawer is open, and
  // the store is mirrored to sessionStorage, where a stuck-open drawer would
  // survive a refresh.
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <WizardTopStrip navOpen={navOpen} onMenuClick={() => setNavOpen((o) => !o)} />
      {/* `relative` so the sub-`lg` nav drawer and its scrim resolve against
          this row rather than the canvas root — which is also why they no
          longer need to know the top strip's height. */}
      <div className="relative flex min-h-0 flex-1">
        <SideNav activeId={activeNavId} open={navOpen} onClose={() => setNavOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col">
            {/* `min-h`, not the measured `h-[88px]`: on a phone the title or
                subtitle can wrap, and a hard height would clip the second
                line. It still resolves to exactly 88px at the design width. */}
            <div className="min-h-[var(--viq-title-h)] shrink-0 px-[var(--viq-gutter)] pt-[var(--viq-block)]">
              <h1 className="text-[28px] leading-none font-semibold text-viq-text">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-viq-text-muted">{subtitle}</p>}
            </div>
            <div className="min-h-0 flex-1 overflow-visible">{children}</div>
          </div>
          <WizardBottomStrip>{footer}</WizardBottomStrip>
        </div>
      </div>
    </div>
  )
}
