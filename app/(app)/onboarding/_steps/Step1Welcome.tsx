import { Button } from '@/components/ui/Button'

interface Props {
  onNext: () => void
}

export function Step1Welcome({ onNext }: Props) {
  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-blush-100 flex items-center justify-center text-3xl mb-6">
        💍
      </div>
      <h1 className="text-3xl font-bold text-charcoal mb-3">
        Welcome to Wedex
      </h1>
      <p className="text-charcoal/60 text-base mb-2 leading-relaxed">
        Your AI-powered wedding budget planner for Singapore couples.
      </p>
      <p className="text-charcoal/50 text-sm mb-10 leading-relaxed">
        We&apos;ll help you plan your budget, assign the right credit card to each vendor,
        and make every dollar work harder — taking 5 minutes to set up.
      </p>

      <div className="w-full space-y-2 mb-10">
        {[
          { icon: '📊', text: 'AI-suggested budget split by venue type' },
          { icon: '💳', text: 'Miles optimisation across your credit cards' },
          { icon: '🏪', text: 'Vendor tracker with payment schedules' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-charcoal/8 text-sm text-charcoal/70">
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <Button size="lg" onClick={onNext} className="w-full">
        Let&apos;s start →
      </Button>
    </div>
  )
}
