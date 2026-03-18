import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Props {
  partnerEmail: string
  onChange: (email: string) => void
  onNext: () => void
  onBack: () => void
}

export function Step6Invite({ partnerEmail, onChange, onNext, onBack }: Props) {
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail)

  return (
    <div className="max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold text-charcoal mb-2">Invite your partner</h2>
      <p className="text-charcoal/50 text-sm mb-8">
        Both of you can track the budget, add vendors, and manage payments together.
        We&apos;ll send them a magic link to join.
      </p>

      <Input
        label="Partner's email"
        type="email"
        placeholder="partner@email.com"
        value={partnerEmail}
        onChange={(e) => onChange(e.target.value)}
      />

      {isValidEmail && (
        <p className="mt-2 text-sm text-sage">
          ✓ We&apos;ll send an invite when you complete setup.
        </p>
      )}

      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <div className="flex-1 flex flex-col gap-2">
          <Button onClick={onNext} disabled={partnerEmail.length > 0 && !isValidEmail} className="w-full">
            {isValidEmail ? 'Send invite & continue →' : 'Next →'}
          </Button>
          {!isValidEmail && (
            <button onClick={onNext} className="text-xs text-charcoal/40 hover:text-charcoal/60 text-center">
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
