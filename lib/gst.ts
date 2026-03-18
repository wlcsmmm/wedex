import { GST_RATE } from './constants'

/** Convert a ++ (before GST + service charge) price to nett */
export function plusPlusToNett(amount: number): number {
  // Singapore restaurants: price ++ means + 10% service charge + 9% GST
  // Applied as: amount × 1.10 × 1.09
  return Math.round(amount * 1.10 * (1 + GST_RATE) * 100) / 100
}

/** Convert a + (before service charge only) price to nett */
export function plusToNett(amount: number): number {
  return Math.round(amount * 1.10 * 100) / 100
}

/** Format SGD amount */
export function formatSGD(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format SGD amount with cents */
export function formatSGDCents(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
  }).format(amount)
}
