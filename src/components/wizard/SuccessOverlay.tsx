import { FileCheck2 } from 'lucide-react'
import { OVERLAYS_COPY } from '@/content/overlays'

/**
 * B10 (`10489:79811`) — the same 630x378 card and dimmed page as
 * `LoadingOverlay`, with no progress bar: illustration, title, the frame's
 * stranded `37% Complete` line (spec §7.6, reproduced verbatim), description.
 *
 * Same illustration caveat as `LoadingOverlay`.
 */
export function SuccessOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-x-0 top-[50px] bottom-0 bg-black/10" />
      <div className="relative flex w-[630px] flex-col items-center rounded-viq-modal bg-white pt-[79px] pb-[71px] shadow-lg">
        <FileCheck2 className="h-[100px] w-[100px] text-viq-border" strokeWidth={0.5} />

        <h2 className="mt-[9px] text-[20px] leading-7 font-semibold text-viq-text">
          {OVERLAYS_COPY.success.title}
        </h2>

        <p className="mt-[25px] text-[16px] leading-6 text-viq-text-muted">
          {OVERLAYS_COPY.success.progress}
        </p>

        <p className="mt-[13px] text-[18px] leading-7 text-viq-text-muted">
          {OVERLAYS_COPY.success.subtitle}
        </p>
      </div>
    </div>
  )
}
