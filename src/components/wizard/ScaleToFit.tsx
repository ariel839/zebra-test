import { useEffect, useRef, useState, type ReactNode } from 'react'

export const DESIGN_WIDTH = 1920
export const DESIGN_HEIGHT = 1080

/**
 * Renders children on a 1920-wide design canvas that fills the viewport
 * completely: the canvas is uniformly scaled by `viewportWidth / 1920`, and
 * its height is whatever the viewport height works out to in design units
 * (`viewportHeight / scale`), so there are no letterbox bars on either axis.
 *
 * The design is fixed-*width* by decision (1920 design px); height is free
 * because the shell below is flex-based (`WizardShell`: `h-full` + `flex-1`),
 * so a taller or shorter canvas just gives the content area more or less
 * room — exactly what a real browser window does.
 *
 * WARNING: the CSS transform here makes `position: fixed` descendants resolve
 * against this element, not the viewport. Everything inside must use
 * `position: absolute`. See Global Constraints.
 */
export function ScaleToFit({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ width: DESIGN_WIDTH, height: DESIGN_HEIGHT })

  // Measures the host element rather than `window`, so the canvas still fills
  // exactly the space it's given if anything is ever placed around it.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const update = () =>
      setBox({ width: host.clientWidth, height: host.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  const scale = box.width / DESIGN_WIDTH
  const canvasHeight = scale > 0 ? box.height / scale : DESIGN_HEIGHT

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden bg-white">
      <div
        // Marks the transformed canvas as the positioning root for overlays
        // that must escape a scrolling ancestor's clip without leaving the
        // canvas — see `Tooltip`, which portals into this element and
        // positions itself in design px against it.
        data-canvas-root
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: DESIGN_WIDTH,
          height: canvasHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="bg-white"
      >
        {children}
      </div>
    </div>
  )
}
