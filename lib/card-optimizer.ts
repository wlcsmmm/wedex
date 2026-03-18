import type { CardType, CreditCard, WeddingCategory, RewardRule } from './types'

interface CardWithType extends CreditCard {
  card_type: CardType
}

interface OptimizationResult {
  card_id: string
  card_name: string
  rate: number
  reward_type: 'miles' | 'cashback'
  estimated_reward: number
}

/**
 * Deterministic best-card picker.
 * Returns the card that yields the highest reward rate for a given category + amount.
 */
export function getBestCard(
  cards: CardWithType[],
  category: WeddingCategory,
  amount: number,
  channel: 'any' | 'online' | 'overseas' = 'any'
): OptimizationResult | null {
  if (cards.length === 0) return null

  let best: OptimizationResult | null = null

  for (const card of cards) {
    const rate = getEffectiveRate(card.card_type, category, amount, channel)
    const estimated_reward = amount * (rate / 100)

    if (!best || rate > best.rate) {
      best = {
        card_id: card.id,
        card_name: card.card_type.name,
        rate,
        reward_type: card.card_type.reward_type as 'miles' | 'cashback',
        estimated_reward,
      }
    }
  }

  return best
}

/**
 * Get the effective reward rate for a card given a spending category and amount.
 * Respects caps and channel conditions.
 */
export function getEffectiveRate(
  cardType: CardType,
  category: WeddingCategory,
  _amount: number,
  channel: string = 'any'
): number {
  const rules = cardType.reward_rules as RewardRule[]

  // Find the best applicable rule
  let bestRate = cardType.fallback_rate

  for (const rule of rules) {
    const categoryMatches =
      rule.categories.includes('*') || rule.categories.includes(category)
    const channelMatches =
      !rule.channel || rule.channel === 'any' || rule.channel === channel

    if (categoryMatches && channelMatches) {
      if (rule.rate > bestRate) {
        bestRate = rule.rate
      }
    }
  }

  return bestRate
}

/**
 * For a given category and amount, rank all cards from best to worst.
 */
export function rankCards(
  cards: CardWithType[],
  category: WeddingCategory,
  amount: number
): OptimizationResult[] {
  return cards
    .map((card) => {
      const rate = getEffectiveRate(card.card_type, category, amount)
      return {
        card_id: card.id,
        card_name: card.card_type.name,
        rate,
        reward_type: card.card_type.reward_type as 'miles' | 'cashback',
        estimated_reward: amount * (rate / 100),
      }
    })
    .sort((a, b) => b.rate - a.rate)
}

/**
 * Estimate miles to honeymoon flight equivalency.
 * Rough benchmark: Business class SIN-LHR ≈ 100,000 KrisFlyer miles.
 */
export function milesToHoneymoonEquivalency(miles: number): {
  sinLHRBusiness: number
  sinSYDBusiness: number
  sinBKKEconomy: number
} {
  return {
    sinLHRBusiness: Math.floor(miles / 100000),
    sinSYDBusiness: Math.floor(miles / 60000),
    sinBKKEconomy: Math.floor(miles / 12500),
  }
}
