import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  /**
   * Forces the button's hover treatment on, additively — real `hover:`
   * keeps working regardless. Undefined/false forces nothing (today's
   * behaviour).
   */
  forceHover?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  forceHover,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-viq-control',
        'text-sm font-medium transition-colors',
        size === 'md' && 'px-3 h-10',
        size === 'sm' && 'px-3 h-7',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'primary' &&
          cn('bg-viq-primary text-white hover:bg-viq-primary-hover', forceHover && 'bg-viq-primary-hover'),
        variant === 'outline' &&
          cn(
            'border border-viq-border text-viq-text hover:bg-viq-surface-hover',
            forceHover && 'bg-viq-surface-hover',
          ),
        variant === 'ghost' &&
          cn('text-viq-text hover:bg-viq-surface-hover', forceHover && 'bg-viq-surface-hover'),
        className,
      )}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  )
}
