'use client'

import { formatSGD } from '@/lib/gst'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { Budget, WeddingCategory } from '@/lib/types'

interface BudgetBreakdownProps {
  budgets: Budget[]
  categoryCommitted: Record<string, number>
}

export default function BudgetBreakdown({ budgets, categoryCommitted }: BudgetBreakdownProps) {
  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-charcoal/8 p-5 w-full md:w-72 shrink-0">
        <h2 className="font-semibold text-charcoal mb-4">Budget Breakdown</h2>
        <p className="text-xs text-charcoal/40 text-center py-6">
          No budget allocations found. Complete onboarding to set budgets.
        </p>
      </div>
    )
  }

  // Sort by allocated amount descending, show top categories first
  const sorted = [...budgets].sort((a, b) => b.allocated_amount - a.allocated_amount)

  return (
    <div className="bg-white rounded-2xl border border-charcoal/8 p-5 w-full md:w-72 shrink-0">
      <h2 className="font-semibold text-charcoal mb-4">Budget Breakdown</h2>
      <div className="space-y-4">
        {sorted.map((budget) => {
          const committed = categoryCommitted[budget.category] ?? 0
          const pct = budget.allocated_amount > 0
            ? Math.min((committed / budget.allocated_amount) * 100, 100)
            : 0
          const isOver = committed > budget.allocated_amount
          const isNearCap = !isOver && pct >= 80

          let barColor = 'bg-sage'
          if (isOver) barColor = 'bg-red-400'
          else if (isNearCap) barColor = 'bg-amber-400'

          return (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-charcoal/70 truncate pr-2">
                  {CATEGORY_LABELS[budget.category as WeddingCategory] ?? budget.category}
                </span>
                {isOver && (
                  <span className="text-xs text-red-400 font-medium whitespace-nowrap">Over</span>
                )}
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-charcoal/8 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {/* Amounts */}
              <div className="flex justify-between mt-1">
                <span className="text-xs text-charcoal/40">
                  {committed > 0 ? formatSGD(committed) : '—'}
                </span>
                <span className="text-xs text-charcoal/30">
                  {formatSGD(budget.allocated_amount)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
