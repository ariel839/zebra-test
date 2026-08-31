import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { ScaleToFit } from '@/components/wizard/ScaleToFit'
import { router } from '@/router'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScaleToFit>
      <RouterProvider router={router} />
    </ScaleToFit>
  </StrictMode>,
)
