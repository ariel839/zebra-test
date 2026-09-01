import { REVIEW_COPY } from '@/content/review'

export interface ReviewLogoCardProps {
  logo: string | null
  companyName: string
}

/**
 * Placeholder mark for the empty card, reproducing the `logoipsum` stand-in
 * the frames use. Deliberately not shared with `ReviewLogoPanel`'s copy of
 * it: that one is tuned to R3's 200px card, this one to E1/R1's 240px card,
 * and both are mock-logo *content* rather than app chrome, so keeping them
 * independent lets either be re-measured without disturbing the other.
 */
function LogoPlaceholder() {
  return (
    <div className="flex flex-col items-start gap-2.5 px-5">
      <div className="flex items-center gap-1.5">
        <span className="h-10 w-10 shrink-0 rounded-sm bg-emerald-900" aria-hidden="true" />
        <span className="h-10 w-10 shrink-0 rounded-full bg-indigo-700" aria-hidden="true" />
        <span className="h-10 w-10 shrink-0 rounded-full bg-rose-900" aria-hidden="true" />
      </div>
      <span className="text-[28px] leading-none font-semibold text-viq-text">
        {REVIEW_COPY.logoPlaceholder.brand}
        <sup className="text-[12px]">°</sup>
      </span>
    </div>
  )
}

/**
 * Right-hand column of the boxed review layout, spec E1 (`8901:9551`) — a
 * 240x240 bordered logo card with a two-line caption beside it, not beneath
 * it (that is R3's arrangement, see `ReviewLogoPanel`).
 *
 * Measured off the E1/R1 frames: card at x1148/y178 — top-aligned with the
 * first field box, 176px right of the box column — caption inset 26px from
 * the card's right edge, its two lines carrying the same 16px muted / 16px
 * medium pairing and 24px baseline pitch as `ReviewFieldBox`.
 *
 * The second caption line is the frame's literal `File Name`: the wizard
 * stores an uploaded logo as an object URL with no filename attached (and
 * there is no backend to ask), so there is no real name to show here. Copy
 * lives in `REVIEW_COPY.logoCard`.
 */
export function ReviewLogoCard({ logo, companyName }: ReviewLogoCardProps) {
  return (
    // `flex-wrap` so that when this card is stacked under the review rows on a
    // 375px phone, the caption drops below the card instead of overflowing the
    // 240px + 26px + caption width. A no-op from `sm` up.
    //
    // The card keeps its EXPLICIT 240x240. An earlier revision of this pass
    // swapped the height for `aspect-square`, which broke it: this card is a
    // flex item of the review row, whose default `align-items: stretch` gave
    // it the full height of the row (~770px), and the aspect ratio only
    // applies where one axis is auto. Do not remove `h-[240px]`.
    <div className="flex shrink-0 flex-wrap gap-[26px]">
      <div className="flex h-[240px] w-[240px] shrink-0 items-center justify-center overflow-hidden rounded-viq-control border border-viq-border">
        {logo ? (
          <img src={logo} alt={`${companyName} logo`} className="h-full w-full object-contain" />
        ) : (
          <LogoPlaceholder />
        )}
      </div>
      <div className="pt-[2px]">
        <div className="text-base leading-none text-viq-text-muted">
          {REVIEW_COPY.logoCard.label}
        </div>
        <div className="mt-2 text-base leading-none font-medium text-viq-text">
          {REVIEW_COPY.logoCard.fileName}
        </div>
      </div>
    </div>
  )
}
