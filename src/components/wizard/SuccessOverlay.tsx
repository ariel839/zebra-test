import { FileCheck2 } from 'lucide-react'
import { OVERLAYS_COPY } from '@/content/overlays'

export interface SuccessOverlayProps {
  /** Always 100 in the real flow; passed through so the card can't strand a stale number. */
  progress: number
}

/**
 * B10 (`10489:79811`) — the same 630x378 card and dimmed page as
 * `LoadingOverlay`, with no progress bar: illustration, title, percentage,
 * description. The frame's percentage line reads `37% Complete`; see
 * `OVERLAYS_COPY.success.progress` for why this shows the real value.
 *
 * Same illustration caveat as `LoadingOverlay`.
 */
export function SuccessOverlay({ progress }: SuccessOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-x-0 top-[50px] bottom-0 bg-black/10 backdrop-blur-[3px]" />
      <div className="relative flex w-[min(630px,100%-2*var(--viq-gutter))] flex-col items-center rounded-viq-modal bg-white pt-[79px] pb-[71px] shadow-lg">
        <FileCheck2 className="h-[100px] w-[100px] text-viq-border" strokeWidth={0.5} />

        <h2 className="mt-[9px] text-[20px] leading-7 font-semibold text-viq-text">
          {OVERLAYS_COPY.success.title}
        </h2>

        <p className="mt-[25px] text-[14px] leading-5 text-viq-text-muted">
          {OVERLAYS_COPY.success.progress(progress)}
        </p>

        <p className="mt-[13px] text-[18px] leading-7 text-viq-text-muted">
          {OVERLAYS_COPY.success.subtitle}
        </p>
      </div>
    </div>
  )
}
