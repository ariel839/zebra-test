/**
 * Suggestion source for the FilterPanel's "By Country" typeahead — a plain
 * general country list, deliberately separate from the `country` values
 * that actually appear on tree nodes (`src/mocks/companyTree.ts`).
 *
 * C3 (`suggested-search-results`) types `Ca` and expects exactly `Canada`,
 * `Cambodia`, `Cameroon`, `Cape Verde` to follow the raw-query row, **in
 * that order** — not alphabetical (alphabetically `Cambodia` sorts before
 * `Canada`). `FilterPanel` filters this array with a prefix match and
 * preserves array order rather than sorting, so those four entries are
 * listed first, in this exact order, to reproduce the frame. The remaining
 * ~50 entries pad the fixture out so the typeahead feels real for other
 * queries; none of them start with "Ca", so they never disturb the C3 match.
 */
export const COUNTRIES: string[] = [
  'Canada',
  'Cambodia',
  'Cameroon',
  'Cape Verde',
  'Czechia',
  'France',
  'Germany',
  'Ireland',
  'Italy',
  'Netherlands',
  'Poland',
  'Slovakia',
  'Spain',
  'United Kingdom',
  'United States',
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Bolivia',
  'Brazil',
  'Bulgaria',
  'Chile',
  'China',
  'Colombia',
  'Croatia',
  'Denmark',
  'Ecuador',
  'Egypt',
  'Estonia',
  'Finland',
  'Greece',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Israel',
  'Japan',
  'Kenya',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malaysia',
  'Malta',
  'Mexico',
  'Morocco',
  'New Zealand',
  'Nigeria',
  'Norway',
  'Peru',
  'Philippines',
  'Portugal',
  'Romania',
  'Serbia',
  'Singapore',
  'South Africa',
  'South Korea',
  'Sweden',
  'Switzerland',
  'Thailand',
  'Turkey',
  'Ukraine',
  'Vietnam',
]
