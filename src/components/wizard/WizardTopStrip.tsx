import { Menu, X } from 'lucide-react'

export interface WizardTopStripProps {
  /** Supplied by `WizardShell`; renders the sub-`lg` drawer toggle. */
  onMenuClick?: () => void
  navOpen?: boolean
}

export function WizardTopStrip({ onMenuClick, navOpen = false }: WizardTopStripProps) {
  return (
    <header className="relative z-50 flex h-[50px] shrink-0 items-center justify-between bg-viq-strip-dark pr-6 pl-4">
      <div className="flex min-w-0 items-center gap-3">
        {/* `lg:hidden` — the rail is permanently visible from `lg` up, so the
            toggle would have nothing to do there. */}
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navOpen}
            className="-ml-1 shrink-0 rounded p-1 text-white/80 hover:text-white lg:hidden"
          >
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        {/* Truncates rather than wraps: the strip is a fixed 50px tall and a
            second line of the wordmark would be clipped mid-glyph on a phone. */}
        <span className="truncate text-[16px] font-semibold">
          <span className="text-viq-brand-green">VisibilityIQ Foresight</span>
          <span className="text-white"> Guided Setup</span>
        </span>
      </div>
      <button
        type="button"
        aria-label="Close setup"
        className="ml-3 shrink-0 text-white/80 hover:text-white"
      >
        <X size={20} />
      </button>
    </header>
  )
}
