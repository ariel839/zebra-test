import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface IconButtonProps {
  icon: ReactNode
  /** Accessible name. Required — icon-only buttons must have one. */
  label: string
  /** Rendered as a corner badge when > 0. Figma shows `1` and `3`. */
  badge?: number
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function IconButton({ icon, label, badge, onClick, disabled, className }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-8 w-8 items-center justify-center rounded-viq-control',
        'text-viq-icon-muted hover:bg-viq-surface-hover disabled:opacity-40',
        className,
      )}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] rounded-full bg-viq-primary px-1
                         text-[10px] leading-4 text-white">
          {badge}
        </span>
      )}
    </button>
  )
}
