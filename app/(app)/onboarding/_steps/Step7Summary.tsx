import { Button } from '@/components/ui/Button'
import { WEDDING_CATEGORIES, CATEGORY_LABELS } from '@/lib/constants'
import { formatSGD } from '@/lib/gst'
import type { WeddingCategory, VenueTier, CardType } from '@/lib/types'
import type { CardEntry } from './Step5Cards'

interface Props {
  weddingName: string
  weddingDate: string
  guestCount: string
  venueTier: VenueTier | ''
  totalBudget: number
  allocations: Record<WeddingCategory, number>
  cards: CardEntry[]
  cardTypes: CardType[]
  submitting: boolean
  onSubmit: () => void
  onBack: () => void
}

const VENUE_LABELS: Record<VenueTier, string> = {
  luxury_hotel: 'Luxury Hotel',
  premium_hotel: 'Premium Hotel',
  restaurant: 'Restaurant',
  garden: 'Garden / Outdoor',
  other: 'Other',
}

export function Step7Summary({
  weddingName,
  weddingDate,
  guestCount,
  venueTier,
  totalBudget,
  allocations,
  cards,
  cardTypes,
  submitting,
  onSubmit,
  onBack,
}: Props) {
  // Top 5 categories by allocation
  const topCategories = [...WEDDING_CATEGORIES]
    .sort((a, b) => (allocations[b] || 0) - (allocations[a] || 0))
    .slice(0, 6)

  const formattedDate = weddingDate
    ? new Date(weddingDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'TBD'

  return (
    <div className="max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold text-charcoal mb-2">Your wedding at a glance</h2>
      <p className="text-charcoal/50 text-sm mb-6">Everything looks great. Here&apos;s your plan.</p>

      {/* Wedding overview */}
      <div className="bg-white border border-charcoal/10 rounded-2xl p-5 mb-4">
        <h3 className="text-base font-semibold text-charcoal mb-3">
          {weddingName || 'Your Wedding'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-charcoal/50 mb-0.5">Total budget</p>
            <p className="text-lg font-bold text-charcoal">{formatSGD(totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-charcoal/50 mb-0.5">Date</p>
            <p className="text-sm font-medium text-charcoal">{formattedDate}</p>
          </div>
          <div>
            <p className="text-xs text-charcoal/50 mb-0.5">Guests</p>
            <p className="text-sm font-medium text-charcoal">{guestCount || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-charcoal/50 mb-0.5">Venue type</p>
            <p className="text-sm font-medium text-charcoal">
              {venueTier ? VENUE_LABELS[venueTier] : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Budget breakdown */}
      <div className="bg-white border border-charcoal/10 rounded-2xl p-5 mb-4">
        <p className="text-sm font-semibold text-charcoal mb-3">Top budget categories</p>
        <div className="space-y-2">
          {topCategories.map((cat) => {
            const pct = allocations[cat] || 0
            const amount = Math.round(totalBudget * pct / 100)
            return (
              <div key={cat} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs text-charcoal/70">{CATEGORY_LABELS[cat]}</span>
                    <span className="text-xs text-charcoal/50">{formatSGD(amount)}</span>
                  </div>
                  <div className="h-1.5 bg-charcoal/8 rounded-full overflow-hidden">
                    <div className="h-full bg-blush rounded-full" style={{ width: `${(pct / 50) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-charcoal w-8 text-right">{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cards */}
      {cards.length > 0 && (
        <div className="bg-white border border-charcoal/10 rounded-2xl p-5 mb-4">
          <p className="text-sm font-semibold text-charcoal mb-3">
            {cards.length} card{cards.length > 1 ? 's' : ''} added
          </p>
          <div className="space-y-1">
            {cards.map((card, idx) => {
              const ct = cardTypes.find((c) => c.id === card.card_type_id)
              return (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal/70">{ct?.name}</span>
                  <span className="text-xs text-charcoal/40">
                    {card.owner === 'me' ? 'Mine' : 'Partner\'s'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Button variant="secondary" onClick={onBack} className="flex-1" disabled={submitting}>Back</Button>
        <Button onClick={onSubmit} disabled={submitting} className="flex-1">
          {submitting ? 'Setting up…' : 'Launch my plan 🎉'}
        </Button>
      </div>
    </div>
  )
}
