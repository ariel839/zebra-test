import { X } from 'lucide-react'

export function WizardTopStrip() {
  return (
    <header className="flex h-[50px] shrink-0 items-center justify-between bg-viq-strip-dark px-6">
      <span className="text-sm font-semibold">
        <span className="text-viq-brand-green">VisibilityIQ Foresight</span>
        <span className="text-white"> Guided Setup</span>
      </span>
      <button type="button" aria-label="Close setup" className="text-white/80 hover:text-white">
        <X size={20} />
      </button>
    </header>
  )
}
