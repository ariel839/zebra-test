import type { ReactNode } from 'react'
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
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <WizardTopStrip />
      <div className="flex min-h-0 flex-1">
        <SideNav activeId={activeNavId} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="h-[97px] shrink-0 px-14 pt-8">
              <h1 className="text-[33px] leading-none font-semibold text-viq-text">{title}</h1>
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
