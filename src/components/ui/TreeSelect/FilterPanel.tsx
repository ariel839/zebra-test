import { Search, X } from 'lucide-react'
import { useCallback, useMemo, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { CANVAS_QUERY, useMediaQuery } from '@/lib/useMediaQuery'
import { COUNTRIES } from '@/mocks/countries'

export interface FilterPanelProps {
  open: boolean
  onClose: () => void
  /** Committed countries. The panel stages a draft and only emits on Apply. */
  value: string[]
  onApply: (countries: string[]) => void
  onClearAll: () => void
  className?: string
  /**
   * Seeds the search box on first mount (demo flow only — C2/C3, 'Ca' typed
   * but not yet added). Only affects *initial* state, same caveat as
   * `TreeSelect`'s `defaultOpen`/`defaultCountries`.
   */
  defaultQuery?: string
  /** Seeds the staged (not-yet-applied) draft on first mount (demo flow only — C4). */
  defaultDraft?: string[]
}

type FilterProperty = 'country' | 'region'

/**
 * Country/region filter panel, spec §4 (v4-corrected anatomy) — Row C
 * (`C1`-`C5`). **Not** a panel inside the tree-select dropdown: it is a
 * standalone floating panel that opens to the right of the form while the
 * tree stays open underneath.
 *
 * Geometry is measured off the `C2`/`C3`/`C4` renders, not off the spec's
 * "roughly x 960-1400, y 100-365": those numbers are *PNG* coordinates of
 * the 1456x832 export, which carries Figma's selection chrome — the 1920
 * design frame sits at (21.5, 11.5) inside it at scale 1410/1920 = 0.7344.
 * Converted, the panel is 600x360 at design (1276, 120), and every value
 * below (280px properties column, 32px rows, 120x34 footer buttons) comes
 * from the same conversion. It is anchored off the tree-select trigger it
 * renders next to, hence the negative `top`. `TreeSelect` renders this as a sibling of `TreeSelectPanel`,
 * absolutely positioned — never `fixed`, per the app's CSS-transform canvas
 * (see `Modal.tsx` for the same convention).
 *
 * **Two presentations, one component.** The geometry above puts the panel's
 * right edge at design x1876, so it only fits when there is a full 1920 of
 * canvas to hold it — i.e. in `ScaleToFit`'s canvas mode and nowhere else.
 * The threshold is therefore the design width, NOT `lg`: at 1024-1919 the
 * hardcoded `left-[987px]` offset pushed the panel clean off the right of
 * the viewport, where it was invisible and unreachable
 * (`tools/responsive/sweep.mjs` catches exactly this). This is the app's only
 * hardcoded absolute design coordinate, and it is the reason it needs one.
 *
 * Below the design width the same panel becomes a centred sheet, capped at
 * its measured 600x360. That is the one breakpoint in the responsive pass
 * that cannot be pure CSS — the sheet needs a different positioning root
 * (the canvas root, reached by portal) than the popover (the trigger's own
 * wrapper), so it goes through `useMediaQuery` rather than a class prefix.
 *
 * The panel's own two-pane split stays CSS, but keyed to `sm` rather than
 * `lg`: the sheet is 600px wide whenever the viewport clears ~632px, and the
 * 280px properties column beside the country search needs that width — the
 * viewport beyond it is irrelevant.
 *
 * That wiring is a separate (deferred) pass — see the Task 9 report. This
 * component is fully self-contained and props-driven: it stages its own
 * draft from `value` and only calls `onApply`/`onClearAll` on explicit user
 * action. Closing via `×` discards whatever draft was in progress — reset
 * back to `value` (and the search box cleared) right there in that close
 * handler, not in a "re-seed on reopen" effect: an effect keyed on `open`
 * would also fire (twice, in dev Strict Mode) the moment this panel first
 * mounts already forced open by the demo flow's `defaultQuery`/`defaultDraft`,
 * wiping the very seed it's meant to show (C2-C4) before it ever painted.
 * Resetting at close time instead means a fresh mount's seeded state is
 * never touched unless the user actually cancels.
 */
export function FilterPanel({
  open,
  onClose,
  value,
  onApply,
  onClearAll,
  className,
  defaultQuery,
  defaultDraft,
}: FilterPanelProps) {
  const [property, setProperty] = useState<FilterProperty>('country')
  const [query, setQuery] = useState(defaultQuery ?? '')
  const [draft, setDraft] = useState<string[]>(defaultDraft ?? value)
  const onCanvas = useMediaQuery(CANVAS_QUERY)
  /**
   * Portal target for the sheet, found by walking up from this component's own
   * position in the DOM — the same technique `Tooltip` uses.
   *
   * It has to come from a ref callback, which React invokes in the commit
   * phase once the host tree is attached. Reading it during render does NOT
   * work: on a cold load of a flow screen that opens this panel at mount
   * (C4/C5, via `defaultFilterPanelOpen`) the whole tree renders in one pass
   * and commits together, so at the moment this component first renders, the
   * canvas root that will become its ancestor is not in the document yet. A
   * `document.querySelector` in a `useState` initialiser therefore returned
   * `null`, the code fell back to rendering the sheet in place, and a sheet
   * styled with `inset-4` against the 343x36 trigger wrapper painted its
   * header, body and footer straight over the open tree.
   *
   * `useCallback` with no deps keeps the callback's identity stable, so React
   * attaches it exactly once and this sets state exactly once.
   */
  const [canvasRoot, setCanvasRoot] = useState<HTMLElement | null>(null)
  const anchorRef = useCallback((el: HTMLSpanElement | null) => {
    if (el) setCanvasRoot(el.closest<HTMLElement>('[data-canvas-root]'))
  }, [])

  // C3 shows five rows for the query `Ca` — `Ca`, `Canada`, `Cambodia`,
  // `Cameroon`, `Cape Verde` — but the first of those IS the input row
  // (same magnifier + text as C2's), not a suggestion: the box measures
  // 5 x 32px and the input lives inside it. So the list is the matches
  // only. Matches preserve COUNTRIES' declared order rather than sorting,
  // and exclude an exact (case-insensitive) echo of the query itself, or
  // anything already staged in the draft.
  const suggestions = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    const lower = q.toLowerCase()
    return COUNTRIES.filter(
      (c) => c.toLowerCase().startsWith(lower) && c.toLowerCase() !== lower && !draft.includes(c),
    )
  }, [query, draft])

  if (!open) return null

  function addCountry(name: string) {
    setDraft((d) => (d.includes(name) ? d : [...d, name]))
    setQuery('')
  }

  function removeCountry(name: string) {
    setDraft((d) => d.filter((c) => c !== name))
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault()
      addCountry(suggestions[0])
    } else if (e.key === 'Escape' && query) {
      e.preventDefault()
      setQuery('')
    }
  }

  function handleClearAll() {
    setDraft([])
    setQuery('')
    onClearAll()
  }

  function handleApply() {
    onApply(draft)
    setQuery('')
    setProperty('country')
    onClose()
  }

  /** The `×` close — discards the in-progress draft/search, unlike Apply. */
  function handleCancel() {
    setDraft(value)
    setQuery('')
    setProperty('country')
    onClose()
  }

  const panel = (
    <div
      className={cn(
        'z-30 flex flex-col rounded-viq-modal border border-viq-border bg-white shadow-xl',
        onCanvas
          ? // Anchored off the trigger's wrapper: the trigger's top-left is
            // design (289, 367) in every Row B/C frame, and the panel's is
            // (1276, 120) — so 987 right and 246 *up* from where it renders.
            'absolute top-[-246px] left-[987px] h-[360px] w-[600px]'
          : // Sheet, centred in the canvas root and inset from its edges, so
            // it fits a 375px phone and still caps at the design 600x360 from
            // ~632px up. `max-h`, not `h`, because the stacked properties row
            // makes the sheet taller than 360px at the narrowest sizes.
            'absolute inset-4 z-50 m-auto h-fit max-h-[calc(100%-2rem)] w-auto max-w-[600px]',
        className,
      )}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-viq-border px-5">
        <h2 className="text-base font-semibold text-viq-text">Filter</h2>
        <button
          type="button"
          aria-label="Close filter panel"
          onClick={handleCancel}
          className="text-viq-icon-muted hover:text-viq-text"
        >
          <X size={18} />
        </button>
      </div>

      {/* Side-by-side panes once the sheet reaches its full 600px (`sm`),
          stacked below that: a 280px properties column beside the content
          leaves ~60px for the country search on a 375px sheet. Stacked, the
          two property buttons sit in a row instead of a column. */}
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <div className="w-full shrink-0 border-b border-viq-border p-4 sm:w-[280px] sm:border-r sm:border-b-0 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-viq-text">Filter Properties</h3>
          <div className="flex w-full flex-row gap-2 sm:w-[220px] sm:flex-col sm:gap-1">
            <button
              type="button"
              aria-pressed={property === 'country'}
              onClick={() => setProperty('country')}
              className={cn(
                'flex h-8 items-center rounded-viq-control px-2 text-left text-sm',
                property === 'country'
                  ? 'bg-viq-nav-active text-viq-text'
                  : 'text-viq-text-muted hover:bg-viq-surface-hover',
              )}
            >
              By Country
            </button>
            <button
              type="button"
              aria-pressed={property === 'region'}
              onClick={() => setProperty('region')}
              className={cn(
                'flex h-8 items-center rounded-viq-control px-2 text-left text-sm',
                property === 'region'
                  ? 'bg-viq-nav-active text-viq-text'
                  : 'text-viq-text-muted hover:bg-viq-surface-hover',
              )}
            >
              By Region
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4 sm:overflow-visible sm:p-5">
          {property === 'country' ? (
            <>
              <div className="mb-3 flex h-5 items-center justify-between">
                <h3 className="text-sm font-semibold text-viq-text">Select Countries</h3>
                {draft.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraft([])
                      setQuery('')
                    }}
                    className="text-xs font-medium text-viq-primary hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* One bordered box holding the input row and, once there are
                  matches, the suggestion rows — no divider between them
                  (C3 draws a single outline around all five 32px rows). */}
              <div
                className={cn(
                  'rounded-viq-control border border-viq-border bg-white',
                  'focus-within:border-viq-primary focus-within:ring-2 focus-within:ring-viq-primary/20',
                )}
              >
                <div className="flex h-8 items-center gap-2 px-3">
                  <Search size={18} className="shrink-0 text-viq-icon-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Type a country name"
                    aria-label="Type a country name"
                    className="min-w-0 flex-1 bg-transparent text-sm text-viq-text outline-none placeholder:text-viq-text-placeholder"
                  />
                </div>
                {suggestions.length > 0 && (
                  <ul className="max-h-[160px] overflow-y-auto">
                    {suggestions.map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => addCountry(s)}
                          className="flex h-8 w-full items-center gap-2 px-3 text-left text-sm text-viq-text-muted hover:bg-viq-surface-hover"
                        >
                          <Search size={18} className="shrink-0 text-viq-icon-muted" />
                          <span className="truncate">{s}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {draft.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {draft.map((c) => (
                    <span
                      key={c}
                      className="inline-flex h-[22px] items-center gap-2.5 rounded-full bg-viq-nav-active px-3 text-xs text-viq-text"
                    >
                      <button
                        type="button"
                        onClick={() => removeCountry(c)}
                        aria-label={`Remove ${c}`}
                        className="text-viq-icon-muted hover:text-viq-text"
                      >
                        <X size={12} />
                      </button>
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="mb-3 flex h-5 items-center text-sm font-semibold text-viq-text">
                Select Regions
              </h3>
              <div className="flex flex-1 items-center justify-center py-8">
                <p className="max-w-[220px] text-center text-sm text-viq-text-muted">
                  Region filtering isn&apos;t available yet.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 120x34 buttons, both outlined/filled in the primary blue — smaller
          than the wizard's own 40px `Button`, so they are local. */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-t border-viq-border px-4 sm:px-5">
        <button
          type="button"
          onClick={handleClearAll}
          className={cn(
            'h-[34px] w-full max-w-[120px] rounded-viq-control border border-viq-primary bg-white sm:w-[120px]',
            'text-sm font-medium text-viq-primary transition-colors hover:bg-viq-nav-active',
          )}
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={handleApply}
          className={cn(
            'h-[34px] w-full max-w-[120px] rounded-viq-control bg-viq-primary sm:w-[120px]',
            'text-sm font-medium text-white transition-colors hover:bg-viq-primary-hover',
          )}
        >
          Apply Filters
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Zero-size, in place: this is what locates the canvas root, so it has
          to stay in the normal tree even when the panel portals away. */}
      <span ref={anchorRef} hidden />

      {onCanvas ? (
        // Popover: an in-place sibling of the tree panel, exactly as before.
        panel
      ) : canvasRoot ? (
        // Sheet: portalled to the canvas root so it escapes the trigger's
        // wrapper (and the form's scroll clip), with a scrim of its own.
        // Tapping the scrim cancels — same as the `×` — so an in-progress
        // draft is discarded rather than silently applied.
        createPortal(
          <>
            <div
              aria-hidden="true"
              onClick={handleCancel}
              className="absolute inset-0 z-40 bg-black/30"
            />
            {panel}
          </>,
          canvasRoot,
        )
      ) : (
        // One frame, before the ref callback has run. Drawing the sheet in
        // place instead would be worse than drawing nothing: its positioning
        // is meaningless outside the canvas root.
        null
      )}
    </>
  )
}
