'use client'

import { rankCards } from '@/lib/card-optimizer'
import { formatSGD } from '@/lib/gst'
import type { CreditCard, CardType, WeddingCategory, PaymentStrategy } from '@/lib/types'

type CardWithType = CreditCard & { card_types: CardType }

interface CardRankingProps {
  category: WeddingCategory
  amount: number
  cards: CardWithType[]
  paymentStrategy: PaymentStrategy[]
  onAssignCard: (cardId: string) => void
}

export default function CardRanking({
  category,
  amount,
  cards,
  paymentStrategy,
  onAssignCard,
}: CardRankingProps) {
  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
        <h3 className="font-semibold text-charcoal mb-3">Best Card</h3>
        <p className="text-xs text-charcoal/40 text-center py-4">
          No cards in your wallet.{' '}
          <a href="/cards" className="text-blush hover:underline">Add cards →</a>
        </p>
      </div>
    )
  }

  const mapped = cards.map((c) => ({ ...c, card_type: c.card_types }))
  const ranked = rankCards(mapped, category, amount)

  const allPlannedAssigned = paymentStrategy
    .filter((p) => p.status === 'planned')
    .every((p) => p.card_id === ranked[0]?.card_id)

  return (
    <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
      <h3 className="font-semibold text-charcoal mb-3">Best Card</h3>
      <div className="space-y-2">
        {ranked.slice(0, 4).map((result, i) => {
          const isTop = i === 0
          return (
            <div
              key={result.card_id}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                isTop ? 'bg-sage/10 border border-sage/20' : 'bg-charcoal/3'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isTop ? 'text-charcoal' : 'text-charcoal/70'}`}>
                  {result.card_name}
                </p>
                <p className="text-xs text-charcoal/40 mt-0.5">
                  {result.reward_type === 'miles'
                    ? `${result.rate} mpd · ${Math.round(result.estimated_reward).toLocaleString()} mi`
                    : `${result.rate}% · ${formatSGD(result.estimated_reward)} back`}
                </p>
              </div>
              {isTop && !allPlannedAssigned && (
                <button
                  onClick={() => onAssignCard(result.card_id)}
                  className="text-xs font-medium text-sage hover:text-sage/70 whitespace-nowrap transition-colors"
                >
                  Use this
                </button>
              )}
              {isTop && allPlannedAssigned && (
                <span className="text-xs text-sage font-medium">✓ Assigned</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
