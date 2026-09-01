import type { ReactNode } from 'react'

export interface ReviewFieldBoxProps {
  label: string
  /** Plain text for the scalar fields; a `ChipGroup` for the two multi-select rows. */
  value: ReactNode
}

/**
 * One read-only field of the boxed review layout, spec E1 (`8901:9551`) —
 * a bordered card with the field label above its value. This is the
 * "clear overview of the data" the Figma dev note (`9082:6667`) asks for on
 * re-entry into the self-onboarding area.
 *
 * Metrics measured off the E1/R1 frames with `tools/fidelity` (design px on
 * the 1920x1080 canvas): the box is 684x76 at the content left edge (x288),
 * text inset 24px, label ink at box top + 19 and value ink at + 44 — i.e. a
 * 24px baseline pitch between the two lines. Both lines are 16px: the label
 * regular and muted, the value medium and full-contrast. Those sizes are
 * this layout's own — R3's rows set 16/18 (see `ReviewRow`) and the form's
 * labels 12/14.
 */
export function ReviewFieldBox({ label, value }: ReviewFieldBoxProps) {
  return (
    // Desktop (canvas mode) keeps `h-[76px]` EXACTLY as measured, including
    // its default `flex-shrink: 1`. That shrink is load-bearing for
    // byte-identical rendering: in a window that is short for its width — a
    // 2560x1300 one, say — the canvas leaves the seven boxes less than their
    // 679px and flex squeezes each to ~74.3px instead of scrolling. An
    // earlier revision of this pass used `min-h` here, which is arguably
    // truer to the frame's 76px but visibly changes every desktop render, so
    // it is confined to the sub-`lg` case below.
    //
    // Below `lg` the height goes `auto` with the token as a floor, because a
    // chip row that wraps on a phone has to grow the box rather than spill out
    // of it. `w-full` throughout: the parent column caps at 684px and owns the
    // width, which is the same 684px in canvas mode.
    <div className="h-[var(--viq-review-box-h)] w-full rounded-viq-control border border-viq-border pt-[18px] pr-6 pl-6 max-lg:h-auto max-lg:min-h-[var(--viq-review-box-h)]">
      <div className="text-base leading-none text-viq-text-muted">{label}</div>
      {/* mt-2 puts this line's baseline 24px under the label's, which is also
          where the frame starts the chip row in the two multi-select boxes. */}
      <div className="mt-2 text-base leading-none font-medium text-viq-text">{value}</div>
    </div>
  )
}
