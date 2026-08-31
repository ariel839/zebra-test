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
    progress: '37% Complete', // Spec §7.6: Known designer bug — reproduced verbatim.
    subtitle: 'Scanning and analysis are complete. Your data is ready.',
  },
} as const
