import { useEffect, useState, type ReactNode } from 'react'

export const DESIGN_WIDTH = 1920
export const DESIGN_HEIGHT = 1080

/**
 * Renders children on a fixed 1920x1080 canvas, uniformly scaled to fit the
 * viewport and centred. The design is fixed-width by decision; this is the only
 * concession to smaller screens.
 *
 * WARNING: the CSS transform here makes `position: fixed` descendants resolve
 * against this element, not the viewport. Everything inside must use
 * `position: absolute`. See Global Constraints.
 */
export function ScaleToFit({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () =>
      setScale(
        Math.min(
          window.innerWidth / DESIGN_WIDTH,
          window.innerHeight / DESIGN_HEIGHT,
        ),
      )
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
        className="bg-white"
      >
        {children}
      </div>
    </div>
  )
}
