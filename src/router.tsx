import { createBrowserRouter } from 'react-router'
import { DashboardSettings } from '@/routes/DashboardSettings'
import { Overview } from '@/routes/Overview'
import { TreeSelectSandbox } from '@/routes/TreeSelectSandbox'

export const router = createBrowserRouter([
  { path: '/', element: <Overview /> },
  { path: '/setup', element: <DashboardSettings /> },
  { path: '/sandbox/tree-select', element: <TreeSelectSandbox /> },
])
