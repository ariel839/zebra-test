import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export const DESIGN_WIDTH = 1920
export const DESIGN_HEIGHT = 1080

/**
 * Below this viewport width the app lays out responsively; at it and above,
 * it is the 1920 design canvas, scaled.
 *
 * 1024 is Tailwind's `lg`, and that is not a coincidence — it HAS to be a
 * breakpoint, because CSS media queries measure the VIEWPORT and know nothing
 * about the canvas. In canvas mode at a 1190px window the layout is 1920
 * design px wide while every `lg:`/`md:`/`sm:` query still evaluates against
 * 1190. Pinning the switch to `lg` makes all of those prefixes true for the
 * whole of canvas mode, so desktop is unconditionally the design. A prefix
 * keyed to a WIDER breakpoint than this would fire late and reflow a canvas
 * that has plenty of room — which is why the review layouts carry `lg:`, not
 * `2xl:`, and why `CANVAS_QUERY` in `lib/useMediaQuery` must equal this.
 */
export const CANVAS_MIN_WIDTH = 1024

/**
 * Two-mode canvas host. Which mode is active depends only on how wide the
 * host is, and the switch is at `CANVAS_MIN_WIDTH`:
 *
 * - **>= 1024 (canvas mode).** Children are laid out on a 1920-wide canvas
 *   and uniformly scaled by `hostWidth / 1920`. Height is whatever the
 *   viewport works out to in design units, so there are no letterbox bars on
 *   either axis. **This is the app's original, unmodified behaviour**, and it
 *   covers every desktop and laptop size on purpose: the composition, the
 *   spacing and the proportions are the Figma frames exactly, scaled
 *   uniformly, so nothing reflows and nothing scrolls that would not also
 *   scroll at 1920x1080. At exactly 1920 the scale is 1 and the app is
 *   pixel-identical to the frames; that is where `tools/fidelity` captures.
 *
 * - **< 1024 (responsive mode).** No transform at all. Children lay out
 *   against the real viewport and the fluid `--viq-*` tokens in `tokens.css`,
 *   plus the structural breakpoints in the shell, do the work. The Figma has
 *   no frames below 1024, so this range is the responsive pass's own design —
 *   and it has to exist: at 375px the 1920 canvas scales to 0.195, which puts
 *   14px body text under 3px.
 *
 * The transform used to be unconditional, which is why the codebase carries
 * a ban on `position: fixed` (a transformed ancestor makes `fixed` resolve
 * against that element, not the viewport). **That ban still stands**, even
 * though responsive mode would technically permit `fixed`: the two modes
 * differ by one CSS property and nothing else, so every overlay, modal,
 * dropdown and tooltip has exactly one code path and cannot be correct in
 * one mode and broken in the other. To make that work, this element is
 * `position: absolute` and carries `data-canvas-root` in **both** modes — so
 * it is always the positioning root that `absolute` descendants resolve
 * against, and `Tooltip`'s portal target always exists.
 *
 * `Tooltip` needs no mode awareness for the same reason: it recovers the
 * scale as `boundingRect.width / offsetWidth`, which is the real scale in
 * canvas mode and exactly 1 in responsive mode, so its design-px arithmetic
 * degenerates to plain px on its own.
 */
export function ScaleToFit({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null)
  // `null` until measured, and null means responsive mode. Seeding this with
  // the design size instead would render one frame in canvas mode on every
  // load and then flip, which reads as a flash of oversized layout on any
  // sub-1024 screen.
  const [box, setBox] = useState<{ width: number; height: number } | null>(null)

  // Measures the host element rather than `window`, so the canvas still fills
  // exactly the space it's given if anything is ever placed around it.
  // `useLayoutEffect`, not `useEffect`: the first measurement then lands
  // before paint, so the flash described above cannot happen at all.
  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    const update = () => setBox({ width: host.clientWidth, height: host.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  const scaled = box !== null && box.width >= CANVAS_MIN_WIDTH
  const scale = scaled ? box.width / DESIGN_WIDTH : 1
  const canvasHeight = scaled ? box.height / scale : DESIGN_HEIGHT

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden bg-white">
      <div
        // Marks the positioning root for overlays that must escape a
        // scrolling ancestor's clip without leaving the canvas — see
        // `Tooltip`, which portals into this element and positions itself
        // against it. Present in both modes, on purpose (see above).
        data-canvas-root
        style={
          scaled
            ? {
                position: 'absolute',
                left: 0,
                top: 0,
                width: DESIGN_WIDTH,
                height: canvasHeight,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }
            : // Responsive mode: same positioning root, no transform, and
              // sized to the host so the shell's `h-full` flex column still
              // gets a definite height to divide up.
              { position: 'absolute', inset: 0 }
        }
        className="bg-white"
      >
        {children}
      </div>
    </div>
  )
}
