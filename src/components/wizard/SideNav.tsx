import { NAV_ITEMS } from '@/content/nav'
import { cn } from '@/lib/cn'

export interface SideNavProps {
  activeId: string
  /** Drawer state. Ignored at `lg` and up, where the nav is a static rail. */
  open?: boolean
  onClose?: () => void
}

/**
 * The 232px navigation rail, and — below `lg` — the slide-in drawer it turns
 * into. One of the four structural breakpoints of the responsive pass: at
 * `lg` and up this is a column of the shell's flex row exactly as it always
 * was; below `lg` a 232px rail would eat a third of a phone screen, so it
 * leaves the flow entirely and becomes an overlay panel opened from
 * `WizardTopStrip`'s menu button.
 *
 * Both the scrim and the panel are `position: absolute`, never `fixed` — see
 * `ScaleToFit` for why that ban holds in responsive mode too. They resolve
 * against `WizardShell`'s `relative` content row, which already starts below
 * the top strip, so `inset-0` is the correct span: the strip stays uncovered
 * and its menu button stays clickable while the drawer is open.
 *
 * The scrim is always mounted and cross-fades, and the panel always renders
 * and slides, so opening and closing the drawer is animated in both
 * directions; mounting on `open` would make the close instant.
 */
export function SideNav({ activeId, open = false, onClose }: SideNavProps) {
  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'absolute inset-0 z-40 bg-black/30 transition-opacity duration-200 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <nav
        className={cn(
          'absolute inset-y-0 left-0 z-40 w-[232px] shrink-0 overflow-y-auto',
          'border-r border-viq-border bg-white transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:inset-y-auto lg:z-auto lg:translate-x-0 lg:transition-none',
        )}
      >
        <div className="mx-2 mt-[22px] flex w-[215px] flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.id === activeId ? 'page' : undefined}
              // Dismisses the drawer on any pick. The items are inert (only
              // Dashboard Settings is built), but leaving the drawer open over
              // the page after a tap reads as a broken control.
              onClick={onClose}
              className={cn(
                'h-10 shrink-0 rounded-viq-control px-[18px] text-left text-sm',
                item.id === activeId && 'bg-viq-nav-active font-medium',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
