import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Forces the hover border treatment on, additively — real `hover:` keeps
   * working regardless. Undefined/false forces nothing (today's behaviour).
   */
  forceHover?: boolean
}

/**
 * Width comes from the form grid, not from here: `w-full` fills whatever
 * slot the `Col` wrapper gives it, which is the spec §2 grid's 260px from
 * `md` up and the full (420px-capped) column width when the grid stacks.
 *
 * Hover: `border-viq-border-hover` is a verified pixel match — B03
 * (`10489:76991`) samples `#a4a9af` on the exact same 183px border-outline
 * run that B01's default state samples as `#d0d8e7`. Real, distinct hover
 * treatment.
 *
 * Focus: B04 (`10489:77480`, "selected field") samples the *identical*
 * `#a4a9af` on that same run — same colour as hover, no blue ring, just a
 * text caret. There is no distinct focus treatment in the rendered Figma
 * frame set. Per the brief, this is NOT faked as a match — the ring below is
 * a conventional focus treatment built from existing tokens
 * (`border-viq-primary` / a primary-tinted ring) so the control is usably
 * accessible, not a transcription of B04.
 */
export function Input({ className, forceHover, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-viq-control border border-viq-border bg-white px-3 text-sm',
        'text-viq-text placeholder:text-viq-text-placeholder',
        'hover:border-viq-border-hover',
        forceHover && 'border-viq-border-hover',
        'focus:border-viq-primary focus:outline-none focus:ring-2 focus:ring-viq-primary/20',
        'disabled:cursor-not-allowed disabled:bg-viq-surface-disabled',
        className,
      )}
      {...rest}
    />
  )
}
