import { NAV_ITEMS } from '@/content/nav'
import { cn } from '@/lib/cn'

export function SideNav({ activeId }: { activeId: string }) {
  return (
    <nav className="w-[232px] shrink-0 border-r border-viq-border">
      <div className="mx-2 mt-6 flex w-[215px] flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={item.id === activeId ? 'page' : undefined}
            className={cn(
              'h-10 rounded-viq-control px-3 text-left text-sm',
              item.id === activeId && 'bg-viq-nav-active font-medium',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
