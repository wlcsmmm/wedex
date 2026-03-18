import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { VenueTier } from '@/lib/types'

interface Props {
  weddingName: string
  weddingDate: string
  guestCount: string
  venueTier: VenueTier | ''
  onChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

const VENUE_TIERS: { value: VenueTier; label: string; desc: string }[] = [
  { value: 'luxury_hotel', label: 'Luxury Hotel', desc: 'Fullerton, Capella, MBS — S$1,500+ per table' },
  { value: 'premium_hotel', label: 'Premium Hotel', desc: 'Shangri-La, Marriott — S$1,000–1,500 per table' },
  { value: 'restaurant', label: 'Restaurant', desc: 'Private dining, Chinese restaurant — S$600–1,000' },
  { value: 'garden', label: 'Garden / Outdoor', desc: 'Botanic Gardens, fort, rooftop' },
  { value: 'other', label: 'Other / Not sure yet', desc: 'We\'ll use a balanced split' },
]

export function Step3Basics({ weddingName, weddingDate, guestCount, venueTier, onChange, onNext, onBack }: Props) {
  const isValid = venueTier !== ''

  return (
    <div className="max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold text-charcoal mb-2">Wedding basics</h2>
      <p className="text-charcoal/50 text-sm mb-8">
        These details help us suggest the right budget split.
      </p>

      <div className="space-y-4 mb-6">
        <Input
          label="Couple name (optional)"
          placeholder="Sarah & James"
          value={weddingName}
          onChange={(e) => onChange('weddingName', e.target.value)}
        />
        <div className="flex gap-3">
          <Input
            label="Wedding date"
            type="date"
            value={weddingDate}
            onChange={(e) => onChange('weddingDate', e.target.value)}
            className="flex-1"
          />
          <Input
            label="Guest count"
            type="number"
            min={10}
            max={2000}
            placeholder="150"
            value={guestCount}
            onChange={(e) => onChange('guestCount', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div className="mb-2">
        <p className="text-sm font-medium text-charcoal mb-3">Venue type <span className="text-red-400">*</span></p>
        <div className="space-y-2">
          {VENUE_TIERS.map((tier) => (
            <button
              key={tier.value}
              type="button"
              onClick={() => onChange('venueTier', tier.value)}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                venueTier === tier.value
                  ? 'border-blush bg-blush-50'
                  : 'border-charcoal/10 bg-white hover:border-charcoal/20'
              }`}
            >
              <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                venueTier === tier.value ? 'border-blush bg-blush' : 'border-charcoal/30'
              }`} />
              <div>
                <p className="text-sm font-medium text-charcoal">{tier.label}</p>
                <p className="text-xs text-charcoal/50">{tier.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} disabled={!isValid} className="flex-1">Next →</Button>
      </div>
    </div>
  )
}
