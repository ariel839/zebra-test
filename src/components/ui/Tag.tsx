import { cn } from '@/lib/cn'

/**
 * Local to this primitive so Tag has no dependency on `@/types/dashboard`
 * (owned by a parallel task). Task 15 reconciles this with the domain
 * `SupportedAction` type — the string literals are identical by design.
 */
export type TagVariant = 'Upgrade' | 'None' | 'Add Licenses'

export interface TagProps {
  variant: TagVariant
  className?: string
}

const VARIANT_CLASSES: Record<TagVariant, string> = {
  Upgrade: 'border-viq-tag-upgrade text-viq-tag-upgrade',
  None: 'border-viq-tag-none text-viq-tag-none',
  'Add Licenses': 'border-viq-tag-add-licenses text-viq-tag-add-licenses',
}

/** Outline-only stadium pill. The variant name is the label text (spec §1 Row F). */
export function Tag({ variant, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-viq-pill border px-2.5 py-0.5',
        'text-xs font-medium leading-4 whitespace-nowrap',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {variant}
    </span>
  )
}
