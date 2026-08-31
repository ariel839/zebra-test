import { useRef, useState } from 'react'
import { Upload, Pencil } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/cn'
import { useForcedHover } from '@/flow/demoState'

export interface UploadButtonProps {
  value: string | null
  onChange: (url: string | null) => void
  label: string
}

export function UploadButton({ value, onChange, label }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previousUrlRef = useRef<string | null>(null)
  const [localHovered, setIsHovered] = useState(false)
  const forced = useForcedHover('logo')
  const isHovered = localHovered || forced

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) {
      // Revoke previous object URL to avoid memory leak
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current)
      }

      // Create new object URL
      const newUrl = URL.createObjectURL(file)
      previousUrlRef.current = newUrl
      onChange(newUrl)
    }

    // Reset input so the same file can be selected again
    e.currentTarget.value = ''
  }

  const handleCardClick = () => {
    inputRef.current?.click()
  }

  // Empty state: show button
  if (!value) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        <Button
          variant="outline"
          rightIcon={<Upload size={16} />}
          onClick={() => inputRef.current?.click()}
        >
          {label}
        </Button>
      </>
    )
  }

  // Uploaded state: show thumbnail card
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <div
        className={cn(
          'relative w-28 h-28 rounded-viq-control border border-viq-border overflow-hidden',
          'transition-all cursor-pointer',
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <img
          src={value}
          alt="Logo preview"
          className="w-full h-full object-cover transition-all duration-200"
        />

        {/* Scrim overlay on hover — B08 (`10489:79003`) shows the logo still
            fully colourful under the pencil icon, just faintly washed out,
            not hidden: `--color-viq-logo-scrim` is a flat, fully-opaque
            sample, so painted at full strength (as a previous pass did,
            paired with `opacity-50` on the image above) it completely hid
            the logo instead of dimming it. Low opacity here reproduces the
            frame; the token itself stays untouched since it's still the
            right hue, just needs to be used translucently. */}
        {isHovered && (
          <div className="absolute inset-0 bg-viq-logo-scrim/20 transition-all duration-200" />
        )}

        {/* Pencil icon on hover */}
        {isHovered && (
          <div className="absolute top-1 right-1 text-viq-text">
            <Pencil size={16} />
          </div>
        )}
      </div>
    </>
  )
}
