import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'outline' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-viq-control',
        'px-4 h-10 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'primary' &&
          'bg-viq-primary text-white hover:bg-viq-primary-hover',
        variant === 'outline' &&
          'border border-viq-border text-viq-text hover:bg-viq-surface-hover',
        variant === 'ghost' && 'text-viq-text hover:bg-viq-surface-hover',
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
