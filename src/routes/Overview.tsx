import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { WizardShell } from '@/components/wizard/WizardShell'
import { OVERVIEW_COPY } from '@/content/overview'

export function Overview() {
  const navigate = useNavigate()

  return (
    <WizardShell
      title={OVERVIEW_COPY.title}
      footer={
        <>
          <Button variant="ghost" disabled leftIcon={<ArrowLeft size={16} />}>
            Back
          </Button>
          <Button
            variant="primary"
            rightIcon={<ArrowRight size={16} />}
            onClick={() => navigate('/setup')}
          >
            Next
          </Button>
        </>
      }
    >
      <div className="h-full overflow-y-auto px-14 pb-8">
        <p className="max-w-180 text-sm leading-relaxed text-viq-text-muted">
          {OVERVIEW_COPY.intro}
        </p>
        <div className="mt-10 grid grid-cols-2 auto-rows-39 gap-x-20">
          {OVERVIEW_COPY.fields.map(({ id, label, icon: Icon, body }) => (
            <div key={id} className="flex gap-2 self-start">
              <Icon size={18} className="mt-0.5 shrink-0 text-viq-brand-green" />
              <div className="max-w-175">
                <h2 className="text-sm font-semibold text-viq-text">{label}</h2>
                <p className="mt-1 text-sm leading-relaxed text-viq-text-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WizardShell>
  )
}
