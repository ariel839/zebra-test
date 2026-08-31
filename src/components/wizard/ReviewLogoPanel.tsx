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
    <div className="flex flex-col items-start gap-2 px-4">
      <div className="flex items-center gap-1">
        <span className="h-8 w-8 shrink-0 rounded-sm bg-emerald-900" aria-hidden="true" />
        <span className="h-8 w-8 shrink-0 rounded-full bg-indigo-700" aria-hidden="true" />
        <span className="h-8 w-8 shrink-0 rounded-full bg-rose-900" aria-hidden="true" />
      </div>
      <span className="text-2xl leading-none font-semibold text-viq-text">
        {REVIEW_COPY.logoPlaceholder.brand}
        <sup className="text-[10px]">°</sup>
      </span>
    </div>
  )
}

/**
 * Left column of the R3 layout, spec `10680:16436` — a bordered 200x200
 * logo card, with the company name (20px bold) and account number (16px
 * muted) stacked beneath it, both centered under the card.
 *
 * Measured off the frame (`tools/fidelity`): card at x289/y179, 200x200;
 * name ink at y397, account number at y427. The 10px top offset is the
 * frame's — the card sits that far below the top of the first review row.
 */
export function ReviewLogoPanel({ logo, companyName, accountNumber }: ReviewLogoPanelProps) {
  return (
    <div className="mt-2.5 w-[200px] shrink-0 text-center">
      <div className="flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded-viq-control border border-viq-border">
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
      <div className="mt-3 text-xl font-bold text-viq-text">{companyName}</div>
      <div className="mt-0.5 text-base text-viq-text-muted">{accountNumber}</div>
    </div>
  )
}
