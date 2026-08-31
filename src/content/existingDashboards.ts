// src/content/existingDashboards.ts
// Shared chrome for the Existing Dashboards modal (spec Row F / Row G, screens F1-F6, G1-G3).
// The modal's title and body differ between F and G, so they live with the lookup result in
// `src/mocks/accountLookup.ts` and travel in as props — only copy shared by both variants
// belongs here.
export const EXISTING_DASHBOARDS_COPY = {
  sectionHeading: 'Existing Dashboards',
  createNew: 'Create a New Dashboard',
  columns: {
    company: 'Company',
    partner: 'Partner',
    supportedActions: 'Supported Actions',
    region: 'Region',
    contractType: 'Contract type', // lowercase 't', as drawn in the Figma frame
  },
  icons: {
    filter: 'Filter',
    search: 'Search',
    download: 'Download',
  },
} as const
