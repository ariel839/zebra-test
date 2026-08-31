import { createBrowserRouter } from 'react-router'
import { DashboardSettings } from '@/routes/DashboardSettings'
import { DashboardSettingsReview } from '@/routes/DashboardSettingsReview'
import { Flow } from '@/routes/Flow'
import { Overview } from '@/routes/Overview'
import { TreeSelectSandbox } from '@/routes/TreeSelectSandbox'

export const router = createBrowserRouter([
  { path: '/', element: <Overview /> },
  { path: '/setup', element: <DashboardSettings /> },
  // Review mode (R3) and edit-from-review mode (E2/E3) — DashboardSettingsForm
  // never reads `mode`, so review/edit is its own route rather than a query
  // param on /setup. Reachable directly (not just via /flow) for completeness.
  { path: '/review', element: <DashboardSettingsReview /> },
  { path: '/sandbox/tree-select', element: <TreeSelectSandbox /> },
  // The guided click-through (Task 17) — every built screen, one route.
  { path: '/flow', element: <Flow /> },
  { path: '/flow/:screenId', element: <Flow /> },
])
