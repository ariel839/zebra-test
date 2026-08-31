import { Search, X } from 'lucide-react'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
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
 * standalone floating panel that opens to the right of the form (frame
 * coords roughly x 960-1400, y 100-365) while the tree stays open
 * underneath. `TreeSelect` renders this as a sibling of `TreeSelectPanel`,
 * absolutely positioned — never `fixed`, per the app's CSS-transform canvas
 * (see `Modal.tsx` for the same convention).
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

  // C3: the raw query is the FIRST row (`Ca`, then `Canada`, `Cambodia`,
  // `Cameroon`, `Cape Verde`) — unusual, and reproduced verbatim. Matches
  // preserve COUNTRIES' declared order rather than sorting, and exclude a
  // match that's an exact (case-insensitive) echo of the query itself, or
  // already staged in the draft.
  const suggestions = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    const lower = q.toLowerCase()
    const matches = COUNTRIES.filter(
      (c) => c.toLowerCase().startsWith(lower) && c.toLowerCase() !== lower && !draft.includes(c),
    )
    return [q, ...matches]
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

  return (
    <div
      className={cn(
        'absolute top-[100px] left-[960px] z-30 flex w-[440px] flex-col',
        'rounded-viq-modal border border-viq-border bg-white shadow-xl',
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-viq-border px-5 py-4">
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

      <div className="flex min-h-[210px] flex-1">
        <div className="w-[150px] shrink-0 border-r border-viq-border p-4">
          <h3 className="mb-2 text-sm font-semibold text-viq-text">Filter Properties</h3>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              aria-pressed={property === 'country'}
              onClick={() => setProperty('country')}
              className={cn(
                'rounded-viq-control px-3 py-2 text-left text-sm',
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
                'rounded-viq-control px-3 py-2 text-left text-sm',
                property === 'region'
                  ? 'bg-viq-nav-active text-viq-text'
                  : 'text-viq-text-muted hover:bg-viq-surface-hover',
              )}
            >
              By Region
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          {property === 'country' ? (
            <>
              <div className="mb-3 flex items-center justify-between">
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

              <div
                className={cn(
                  'rounded-viq-control border border-viq-border bg-white',
                  'focus-within:border-viq-primary focus-within:ring-2 focus-within:ring-viq-primary/20',
                )}
              >
                <div className="flex h-10 items-center gap-2 px-3">
                  <Search size={14} className="shrink-0 text-viq-icon-muted" />
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
                  <ul className="max-h-[220px] overflow-y-auto border-t border-viq-border">
                    {suggestions.map((s, i) => (
                      <li key={`${s}-${i}`}>
                        <button
                          type="button"
                          onClick={() => addCountry(s)}
                          className="flex h-10 w-full items-center gap-2 px-3 text-left text-sm text-viq-text-muted hover:bg-viq-surface-hover"
                        >
                          <Search size={14} className="shrink-0 text-viq-icon-muted" />
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
                      className="inline-flex items-center gap-1.5 rounded-viq-control bg-viq-surface-hover px-2 py-1 text-xs text-viq-text"
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
              <h3 className="mb-3 text-sm font-semibold text-viq-text">Select Regions</h3>
              <div className="flex flex-1 items-center justify-center py-8">
                <p className="max-w-[220px] text-center text-sm text-viq-text-muted">
                  Region filtering isn&apos;t available yet.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-viq-border px-5 py-4">
        <Button variant="outline" onClick={handleClearAll}>
          Clear All
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
