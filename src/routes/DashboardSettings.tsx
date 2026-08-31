import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { DashboardSettingsForm } from '@/routes/DashboardSettingsForm'
import { DashboardSettingsReview } from '@/routes/DashboardSettingsReview'
import { useWizardStore } from '@/store/wizard'

/**
 * `/setup` is the form; `/setup?mode=review` is review mode (spec §5).
 * The `?mode=review` URL is the one published in docs/demo-card.md and the
 * README, so it has to work; `/review` stays as a bare alias in the router.
 *
 * Once in review the store owns `mode`, so pressing Edit switches to the
 * editable form without the URL changing under the client mid-demo.
 */
export function DashboardSettings() {
  const [params] = useSearchParams()
  const wantsReview = params.get('mode') === 'review'
  const mode = useWizardStore((s) => s.mode)

  useEffect(() => {
    if (wantsReview && useWizardStore.getState().mode !== 'review') {
      useWizardStore.setState({ mode: 'review' })
    }
  }, [wantsReview])

  if (wantsReview && mode === 'review') return <DashboardSettingsReview />
  return <DashboardSettingsForm />
}
