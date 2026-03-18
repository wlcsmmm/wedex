'use client'

import { formatSGD } from '@/lib/gst'
import type { DashboardMetrics } from '@/lib/dashboard-utils'

export default function MetricsBar({ metrics }: { metrics: DashboardMetrics }) {
  const { totalBudget, committed, remaining, estimatedMiles } = metrics
  const isOverBudget = remaining < 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <MetricCard
        label="Total Budget"
        value={formatSGD(totalBudget)}
        valueClass="text-charcoal"
      />
      <MetricCard
        label="Committed"
        value={formatSGD(committed)}
        valueClass="text-blush"
        sub={committed > 0 ? `${Math.round((committed / totalBudget) * 100)}% of budget` : undefined}
      />
      <MetricCard
        label="Remaining"
        value={formatSGD(Math.abs(remaining))}
        valueClass={isOverBudget ? 'text-red-500' : 'text-sage'}
        sub={isOverBudget ? 'Over budget' : undefined}
        subClass="text-red-400"
      />
      <MetricCard
        label="Est. Miles"
        value={estimatedMiles > 0 ? `${estimatedMiles.toLocaleString()} mi` : '— mi'}
        valueClass="text-charcoal/70"
        sub={estimatedMiles > 0 ? milesHint(estimatedMiles) : undefined}
      />
    </div>
  )
}

function MetricCard({
  label,
  value,
  valueClass,
  sub,
  subClass = 'text-charcoal/40',
}: {
  label: string
  value: string
  valueClass: string
  sub?: string
  subClass?: string
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-charcoal/8">
      <p className="text-xs text-charcoal/50 mb-1">{label}</p>
      <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${subClass}`}>{sub}</p>}
    </div>
  )
}

function milesHint(miles: number): string {
  // SIN-BKK economy ≈ 12,500 KrisFlyer miles
  const bkk = Math.floor(miles / 12500)
  if (bkk >= 1) return `≈ ${bkk}× SIN-BKK economy`
  // SIN-SYD business ≈ 60,000 KrisFlyer miles
  const syd = Math.floor(miles / 60000)
  if (syd >= 1) return `≈ ${syd}× SIN-SYD biz`
  return `towards honeymoon flights`
}
