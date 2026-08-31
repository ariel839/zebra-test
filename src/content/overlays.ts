/**
 * Copy for the loading and success overlays (B9, B10).
 * All user-facing strings for these overlays live here — nothing inline in JSX.
 * Spec: wizard-spec-files/screens/B09_loading__10489-79600.png,
 *       wizard-spec-files/screens/B10_success__10489-79811.png
 */

export const OVERLAYS_COPY = {
  loading: {
    title: 'Scanning Information',
    progress: (pct: number) => `${pct}% Complete`,
    subtitle: 'Scanning and analyzing data, this may take a few moments',
  },
  success: {
    title: "You're All Set",
    // The B10 frame strands '37% Complete' here (spec §7.6, a known designer
    // bug). Client asked for the honest number, so this reads the real
    // progress — which is always 100 by the time success shows.
    progress: (pct: number) => `${pct}% Complete`,
    subtitle: 'Scanning and analysis are complete. Your data is ready.',
  },
} as const
