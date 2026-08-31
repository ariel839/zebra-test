import { FileCheck2 } from 'lucide-react'
import { OVERLAYS_COPY } from '@/content/overlays'

export function SuccessOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-viq-scrim">
      <div className="w-96 rounded-viq-modal bg-white shadow-lg">
        <div className="flex flex-col items-center px-12 py-12">
          {/* Icon */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center">
            <FileCheck2 className="h-16 w-16 text-viq-text-muted" strokeWidth={0.75} />
          </div>

          {/* Title */}
          <h2 className="text-center text-xl font-semibold text-viq-text">
            {OVERLAYS_COPY.success.title}
          </h2>

          {/* Progress text (the known bug per spec §7.6) */}
          <p className="mt-3 text-sm text-viq-text-muted">
            {OVERLAYS_COPY.success.progress}
          </p>

          {/* Subtitle */}
          <p className="mt-6 text-center text-sm text-viq-text-muted">
            {OVERLAYS_COPY.success.subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}
