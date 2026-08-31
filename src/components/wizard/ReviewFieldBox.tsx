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
    <div className="h-[76px] w-[684px] rounded-viq-control border border-viq-border pt-[18px] pl-6">
      <div className="text-base leading-none text-viq-text-muted">{label}</div>
      {/* mt-2 puts this line's baseline 24px under the label's, which is also
          where the frame starts the chip row in the two multi-select boxes. */}
      <div className="mt-2 text-base leading-none font-medium text-viq-text">{value}</div>
    </div>
  )
}
