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
      {/* A1 starts its intro at y=124, 14px under the heading — above where the
          shell's 88px title block hands over at y=138 — so this pulls up into
          that block rather than starting below it. */}
      <div className="-mt-[14px] h-full overflow-y-auto px-14 pb-8">
        {/* Figma inspect reports line-height 100% for A1's copy, but that is
            Figma's "Auto": the frame itself measures a 17.5px pitch on the
            intro (3 lines spanning y128..174) and 17px on the item bodies, so
            those measured values are used instead of a literal 100%. The intro
            wraps after "confgure your", which puts its column at ~700px. */}
        <p className="max-w-[700px] text-sm leading-[17.5px] text-viq-text-muted">
          {OVERVIEW_COPY.intro}
        </p>
        {/* A1's item grid is inset 12px from the intro (icons at x=300, text at
            x=321) and the right column's text starts at x=1163, which puts the
            column gap at 120px. */}
        <div className="mt-[76px] ml-[12px] grid grid-cols-2 gap-x-[120px] gap-y-[78px]">
          {OVERVIEW_COPY.fields.map(({ id, label, icon: Icon, body }) => (
            <div key={id} className="flex gap-[7px] self-start">
              {/* strokeWidth 1.5 and the green are the Figma icon spec: `1.5px solid #7CB824`;
                  the glyph is drawn at 20px rather than Figma's 18px by request.
                  It is centered on the 16px label line, so it sits 2px above the
                  label's box, and the -6px pull is paired with a widened gap so
                  only the icon shifts left and the text column stays on its
                  Figma x. */}
              <Icon
                size={20}
                strokeWidth={1.5}
                className="-ml-[6px] -mt-0.5 shrink-0 text-viq-icon-green"
              />
              <div className="max-w-175">
                {/* Label: Roboto 600 / 16px / line-height 100% / capitalize (Figma inspect). */}
                <h2 className="text-base font-semibold capitalize leading-none text-viq-text">
                  {label}
                </h2>
                <p className="mt-[8px] text-sm font-normal leading-[17px] text-viq-text-muted">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WizardShell>
  )
}
