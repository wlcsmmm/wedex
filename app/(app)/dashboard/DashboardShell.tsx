'use client'

import { useRef, useState, useMemo } from 'react'
import { computeMetrics, getCategoryCommitted } from '@/lib/dashboard-utils'
import type { Wedding, Vendor, Budget, CreditCard, CardType } from '@/lib/types'
import MetricsBar from './MetricsBar'
import VendorList from './VendorList'
import BudgetBreakdown from './BudgetBreakdown'
import QuickAdd, { type QuickAddHandle } from './QuickAdd'

type CardWithType = CreditCard & { card_types: CardType }

interface DashboardShellProps {
  wedding: Wedding
  initialVendors: Vendor[]
  budgets: Budget[]
  cards: CardWithType[]
}

export default function DashboardShell({
  wedding,
  initialVendors,
  budgets,
  cards,
}: DashboardShellProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const quickAddRef = useRef<QuickAddHandle>(null)

  const metrics = useMemo(
    () => computeMetrics(wedding, vendors, cards),
    [wedding, vendors, cards]
  )

  const categoryCommitted = useMemo(
    () => getCategoryCommitted(vendors),
    [vendors]
  )

  function handleVendorAdded(vendor: Vendor) {
    setVendors((prev) => [vendor, ...prev])
  }

  function focusQuickAdd() {
    quickAddRef.current?.focus()
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal">{wedding.name}</h1>
        <p className="text-charcoal/50 text-sm mt-1">
          {wedding.date
            ? new Date(wedding.date).toLocaleDateString('en-SG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Date not set'}
          {wedding.guest_count ? ` · ${wedding.guest_count} guests` : ''}
        </p>
      </div>

      {/* Metrics */}
      <MetricsBar metrics={metrics} />

      {/* Main content: vendor list + budget breakdown */}
      <div className="flex flex-col md:flex-row gap-4">
        <VendorList
          vendors={vendors}
          cards={cards}
          onAddClick={focusQuickAdd}
        />
        <BudgetBreakdown
          budgets={budgets}
          categoryCommitted={categoryCommitted}
        />
      </div>

      {/* Quick add */}
      <QuickAdd
        ref={quickAddRef}
        weddingId={wedding.id}
        cards={cards}
        onVendorAdded={handleVendorAdded}
      />
    </div>
  )
}
