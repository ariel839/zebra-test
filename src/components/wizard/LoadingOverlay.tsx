import { FileText } from 'lucide-react'
import { OVERLAYS_COPY } from '@/content/overlays'

export interface LoadingOverlayProps {
  progress: number
}

export function LoadingOverlay({ progress }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-viq-scrim">
      <div className="w-96 rounded-viq-modal bg-white shadow-lg">
        <div className="flex flex-col items-center px-12 py-12">
          {/* Icon */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center">
            <FileText className="h-16 w-16 text-viq-text-muted" strokeWidth={0.75} />
          </div>

          {/* Title */}
          <h2 className="text-center text-xl font-semibold text-viq-text">
            {OVERLAYS_COPY.loading.title}
          </h2>

          {/* Progress text */}
          <p className="mt-3 text-sm text-viq-text-muted">
            {OVERLAYS_COPY.loading.progress(progress)}
          </p>

          {/* Progress bar */}
          <div className="mt-4 h-1 w-24 overflow-hidden rounded-full bg-viq-border">
            <div
              className="h-full bg-viq-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Subtitle */}
          <p className="mt-6 text-center text-sm text-viq-text-muted">
            {OVERLAYS_COPY.loading.subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}
