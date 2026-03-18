'use client'

import { Button } from '@/components/ui/Button'
import { WEDDING_CATEGORIES, CATEGORY_LABELS } from '@/lib/constants'
import { formatSGD } from '@/lib/gst'
import type { WeddingCategory } from '@/lib/types'

interface Props {
  allocations: Record<WeddingCategory, number>
  totalBudget: number
  onChange: (allocations: Record<WeddingCategory, number>) => void
  onNext: () => void
  onBack: () => void
}

/** Adjust one category's allocation and redistribute the delta proportionally */
function adjustAllocation(
  current: Record<WeddingCategory, number>,
  changedCat: WeddingCategory,
  newPct: number
): Record<WeddingCategory, number> {
  const clamped = Math.max(0, Math.min(100, newPct))
  const delta = clamped - current[changedCat]
  const others = WEDDING_CATEGORIES.filter((c) => c !== changedCat)
  const sumOthers = others.reduce((s, c) => s + current[c], 0)

  const next = { ...current, [changedCat]: clamped }

  if (sumOthers === 0 || delta === 0) return next

  // Distribute -delta proportionally
  let distributed = 0
  for (let i = 0; i < others.length - 1; i++) {
    const cat = others[i]
    const share = (current[cat] / sumOthers) * -delta
    next[cat] = Math.max(0, Math.round((current[cat] + share) * 10) / 10)
    distributed += next[cat] - current[cat]
  }
  // Last category absorbs rounding drift
  const lastCat = others[others.length - 1]
  next[lastCat] = Math.max(0, Math.round((-delta - distributed + current[lastCat]) * 10) / 10)

  // Final correction to ensure exact sum = 100
  const sum = WEDDING_CATEGORIES.reduce((s, c) => s + next[c], 0)
  const drift = Math.round((100 - sum) * 10) / 10
  if (drift !== 0) next[changedCat] = Math.max(0, next[changedCat] + drift)

  return next
}

const CATEGORY_COLORS: Record<WeddingCategory, string> = {
  venue_banquet: 'bg-blush',
  bridal_attire: 'bg-blush-300',
  photography: 'bg-sage',
  videography: 'bg-sage-300',
  decor_florals: 'bg-yellow-300',
  hair_makeup: 'bg-pink-300',
  rings_jewelry: 'bg-purple-300',
  wedding_car: 'bg-blue-300',
  dowry_guodali: 'bg-orange-300',
  invitations_stationery: 'bg-teal-300',
  entertainment: 'bg-indigo-300',
  favors_gifts: 'bg-rose-300',
  misc_buffer: 'bg-gray-300',
}

export function Step4Split({ allocations, totalBudget, onChange, onNext, onBack }: Props) {
  const total = WEDDING_CATEGORIES.reduce((s, c) => s + (allocations[c] || 0), 0)
  const rounded = Math.round(total)

  return (
    <div className="max-w-lg mx-auto w-full">
      <h2 className="text-2xl font-bold text-charcoal mb-2">Budget split</h2>
      <p className="text-charcoal/50 text-sm mb-2">
        AI-suggested based on your venue type. Drag to adjust.
      </p>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-6">
        {WEDDING_CATEGORIES.map((cat) => (
          <div
            key={cat}
            className={`${CATEGORY_COLORS[cat]} transition-all`}
            style={{ width: `${allocations[cat] || 0}%` }}
          />
        ))}
      </div>

      <div className="space-y-3 mb-6 max-h-[45vh] overflow-y-auto pr-1">
        {WEDDING_CATEGORIES.map((cat) => {
          const pct = allocations[cat] || 0
          const amount = Math.round(totalBudget * pct / 100)
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[cat]}`} />
                  <span className="text-xs font-medium text-charcoal">{CATEGORY_LABELS[cat]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-charcoal/50">{formatSGD(amount)}</span>
                  <span className="text-xs font-semibold text-charcoal w-10 text-right">{pct}%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                step={1}
                value={pct}
                onChange={(e) => onChange(adjustAllocation(allocations, cat, Number(e.target.value)))}
                className="w-full h-1.5 rounded-full appearance-none bg-charcoal/10 accent-blush cursor-pointer"
              />
            </div>
          )
        })}
      </div>

      {rounded !== 100 && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
          Total is {rounded}% — adjust sliders to reach 100%
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} disabled={rounded !== 100} className="flex-1">Next →</Button>
      </div>
    </div>
  )
}
