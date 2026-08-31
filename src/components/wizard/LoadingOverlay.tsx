import { FileText } from 'lucide-react'
import { OVERLAYS_COPY } from '@/content/overlays'

export interface LoadingOverlayProps {
  progress: number
}

/**
 * B09 (`10489:79600`), measured off the frame: a 630x378 card centred on the
 * 1920x1080 canvas, over a scrim that dims the page from below the 50px top
 * strip down — the form stays readable behind it, which is why the scrim is
 * 10% black rather than the flat opaque `--color-viq-scrim` the modal samples.
 *
 * Order inside the card is illustration, title, progress bar, percentage,
 * description — the percentage sits UNDER the bar in the frame.
 *
 * NOT a match: the frame's illustration is a line-art scanner/printer with a
 * grey blob behind it, a Figma asset we were never given. The `FileText` glyph
 * below stands in at the measured size and colour. Flagged for the client.
 */
export function LoadingOverlay({ progress }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-x-0 top-[50px] bottom-0 bg-black/10" />
      <div className="relative flex w-[630px] flex-col items-center rounded-viq-modal bg-white pt-[69px] pb-[59px] shadow-lg">
        <FileText className="h-[120px] w-[120px] text-viq-border" strokeWidth={0.5} />

        <h2 className="mt-[18px] text-[20px] leading-7 font-semibold text-viq-text">
          {OVERLAYS_COPY.loading.title}
        </h2>

        <div className="mt-[14px] h-1.5 w-[220px] overflow-hidden rounded-full bg-viq-progress-track">
          <div
            className="h-full rounded-full bg-viq-progress transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-[11px] text-[14px] leading-5 text-viq-text-muted">
          {OVERLAYS_COPY.loading.progress(progress)}
        </p>

        <p className="mt-[4px] text-[18px] leading-7 text-viq-text-muted">
          {OVERLAYS_COPY.loading.subtitle}
        </p>
      </div>
    </div>
  )
}
