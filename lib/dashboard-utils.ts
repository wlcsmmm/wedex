import type { Wedding, Vendor, Budget, CreditCard, CardType, WeddingCategory } from './types'
import { getEffectiveRate } from './card-optimizer'

export interface DashboardMetrics {
  totalBudget: number
  committed: number
  remaining: number
  estimatedMiles: number
}

type CardWithType = CreditCard & { card_types: CardType }

export function computeMetrics(
  wedding: Wedding,
  vendors: Vendor[],
  cards: CardWithType[]
): DashboardMetrics {
  const committed = vendors
    .filter((v) => v.status !== 'cancelled')
    .reduce((sum, v) => sum + (v.total_nett ?? v.total_quoted), 0)

  const remaining = wedding.total_budget - committed

  let estimatedMiles = 0
  for (const vendor of vendors) {
    if (vendor.status === 'cancelled') continue
    // Find the card assigned via payment_strategy (first installment with a card)
    const assignedCardId = vendor.payment_strategy?.find((p) => p.card_id)?.card_id
    if (!assignedCardId) continue

    const card = cards.find((c) => c.id === assignedCardId) as CardWithType | undefined
    if (!card?.card_types) continue

    if (card.card_types.reward_type !== 'miles') continue

    const amount = vendor.total_nett ?? vendor.total_quoted
    const rate = getEffectiveRate(card.card_types, vendor.category as WeddingCategory, amount)
    estimatedMiles += amount * (rate / 100)
  }

  return {
    totalBudget: wedding.total_budget,
    committed,
    remaining,
    estimatedMiles: Math.round(estimatedMiles),
  }
}

export function getCategoryCommitted(vendors: Vendor[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const vendor of vendors) {
    if (vendor.status === 'cancelled') continue
    const cat = vendor.category
    result[cat] = (result[cat] ?? 0) + (vendor.total_nett ?? vendor.total_quoted)
  }
  return result
}
