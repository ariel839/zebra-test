import { REVIEW_COPY } from '@/content/review'

export interface ReviewLogoPanelProps {
  logo: string | null
  companyName: string
  accountNumber: string
}

/**
 * Placeholder mark shown inside the logo card when no file has been
 * uploaded, reproducing the `logoipsum` stand-in logo used in the R3 frame
 * (three colour marks over a wordmark). Not a design token — this is
 * mock-logo content, not app chrome.
 */
function LogoPlaceholder() {
  return (
    <div className="flex flex-col items-start gap-1.5 px-3">
      <div className="flex items-center gap-1">
        <span className="h-3.5 w-3.5 shrink-0 rounded-sm bg-emerald-900" aria-hidden="true" />
        <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-indigo-700" aria-hidden="true" />
        <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-rose-900" aria-hidden="true" />
      </div>
      <span className="text-sm leading-none font-semibold text-viq-text">
        {REVIEW_COPY.logoPlaceholder.brand}
        <sup className="text-[8px]">°</sup>
      </span>
    </div>
  )
}

/**
 * Left column of the R3 layout, spec `10680:16436` — a bordered ~130x130
 * logo card, with the company name (bold) and account number stacked
 * beneath it, both centered under the card.
 */
export function ReviewLogoPanel({ logo, companyName, accountNumber }: ReviewLogoPanelProps) {
  return (
    <div className="w-[130px] shrink-0 text-center">
      <div className="flex h-[130px] w-[130px] items-center justify-center overflow-hidden rounded-viq-control border border-viq-border">
        {logo ? (
          <img
            src={logo}
            alt={`${companyName} logo`}
            className="h-full w-full object-cover"
          />
        ) : (
          <LogoPlaceholder />
        )}
      </div>
      <div className="mt-3 text-sm font-bold text-viq-text">{companyName}</div>
      <div className="text-sm text-viq-text-muted">{accountNumber}</div>
    </div>
  )
}
