import { useEffect, useState } from 'react'

/**
 * Subscribes to a CSS media query from JS.
 *
 * Used only where a breakpoint changes *structure* rather than styling — a
 * component that has to portal to a different positioning root, or render a
 * different element tree, at one size and not another. Anything expressible
 * as a Tailwind `lg:` prefix belongs in the class list instead: CSS applies
 * before the first paint and costs no re-render.
 *
 * The initial value is read synchronously in the `useState` initialiser, not
 * defaulted to `false` and corrected in the effect, so the first paint is
 * already on the right side of the breakpoint and no layout flash occurs.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    // Re-read on subscribe: the query can have flipped between the initial
    // render and this effect running.
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * `ScaleToFit`'s canvas threshold — the boundary between canvas mode (the
 * 1920 design layout, scaled uniformly) and responsive mode. Anything whose
 * geometry was measured in absolute design coordinates is valid in canvas
 * mode and only there, so that is the threshold it must key off.
 *
 * Must stay equal to `CANVAS_MIN_WIDTH` in `ScaleToFit`. Duplicated as a
 * string rather than imported, so this hook module stays free of component
 * imports; if one changes, change both.
 */
export const CANVAS_QUERY = '(min-width: 1024px)'
