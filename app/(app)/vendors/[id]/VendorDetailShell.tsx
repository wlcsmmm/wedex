'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { formatSGD } from '@/lib/gst'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { Vendor, CreditCard, CardType, PaymentStrategy, WeddingCategory } from '@/lib/types'
import PaymentStrategyEditor from './PaymentStrategyEditor'
import CardRanking from './CardRanking'

type CardWithType = CreditCard & { card_types: CardType }

interface VendorDetailShellProps {
  initialVendor: Vendor
  cards: CardWithType[]
}

const CATEGORY_COLORS: Record<WeddingCategory, string> = {
  venue_banquet: 'bg-blush/20 text-blush',
  photography: 'bg-blush/20 text-blush',
  videography: 'bg-blush/20 text-blush',
  bridal_attire: 'bg-purple-100 text-purple-600',
  hair_makeup: 'bg-purple-100 text-purple-600',
  decor_florals: 'bg-sage/20 text-sage',
  rings_jewelry: 'bg-amber-100 text-amber-600',
  wedding_car: 'bg-charcoal/8 text-charcoal/60',
  dowry_guodali: 'bg-orange-100 text-orange-600',
  invitations_stationery: 'bg-charcoal/8 text-charcoal/60',
  entertainment: 'bg-sky-100 text-sky-600',
  favors_gifts: 'bg-pink-100 text-pink-600',
  misc_buffer: 'bg-charcoal/8 text-charcoal/50',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-sage/15 text-sage',
  fully_paid: 'bg-charcoal/8 text-charcoal/50',
  cancelled: 'bg-red-100 text-red-400',
}

export default function VendorDetailShell({ initialVendor, cards }: VendorDetailShellProps) {
  const [vendor, setVendor] = useState<Vendor>(initialVendor)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState(vendor.notes ?? '')

  const handlePatch = useCallback(async (partial: Partial<Vendor>) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      })
      if (!res.ok) throw new Error('Update failed')
      const updated: Vendor = await res.json()
      setVendor(updated)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }, [vendor.id])

  function handleStrategyChange(updated: PaymentStrategy[]) {
    // Optimistic update, then persist
    setVendor((v) => ({ ...v, payment_strategy: updated }))
    handlePatch({ payment_strategy: updated })
  }

  function handleAssignCard(cardId: string) {
    const updated = vendor.payment_strategy.map((p) =>
      p.status === 'planned' ? { ...p, card_id: cardId } : p
    )
    setVendor((v) => ({ ...v, payment_strategy: updated }))
    handlePatch({ payment_strategy: updated })
  }

  const quoted = vendor.total_quoted
  const nett = vendor.total_nett ?? vendor.total_quoted
  const isGST = vendor.total_nett !== null && vendor.total_nett !== vendor.total_quoted
  const gstDiff = nett - quoted

  const catColor = CATEGORY_COLORS[vendor.category] ?? 'bg-charcoal/8 text-charcoal/60'
  const statusStyle = STATUS_STYLES[vendor.status] ?? STATUS_STYLES.active

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Back link */}
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-charcoal/40 hover:text-charcoal mb-6 transition-colors">
        ← Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 mb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-charcoal mb-2">{vendor.name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${catColor}`}>
              {CATEGORY_LABELS[vendor.category]}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle}`}>
              {vendor.status === 'fully_paid' ? 'Fully paid' : vendor.status === 'cancelled' ? 'Cancelled' : 'Active'}
            </span>
            {saving && <span className="text-xs text-charcoal/30 italic">Saving…</span>}
          </div>
        </div>

        {/* Status actions */}
        {vendor.status === 'active' && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handlePatch({ status: 'fully_paid' })}
              className="text-xs font-medium text-sage border border-sage/30 px-3 py-1.5 rounded-lg hover:bg-sage/10 transition-colors"
            >
              Mark fully paid
            </button>
            <button
              onClick={() => handlePatch({ status: 'cancelled' })}
              className="text-xs font-medium text-charcoal/40 border border-charcoal/15 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        {vendor.status !== 'active' && (
          <button
            onClick={() => handlePatch({ status: 'active' })}
            className="text-xs font-medium text-charcoal/40 border border-charcoal/15 px-3 py-1.5 rounded-lg hover:bg-charcoal/5 transition-colors shrink-0"
          >
            Reactivate
          </button>
        )}
      </div>

      {/* Main grid */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left column */}
        <div className="flex-1 space-y-4">
          {/* Amount card */}
          <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
            <h3 className="font-semibold text-charcoal mb-4">Amount</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-charcoal/50">Quoted{isGST ? ' (before GST)' : ''}</span>
                <span className="text-sm font-medium text-charcoal">{formatSGD(quoted)}</span>
              </div>
              {isGST && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-charcoal/50">GST + service charge</span>
                    <span className="text-sm text-charcoal/60">+{formatSGD(gstDiff)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-charcoal/8">
                    <span className="text-sm font-semibold text-charcoal">Nett total</span>
                    <span className="text-sm font-bold text-charcoal">{formatSGD(nett)}</span>
                  </div>
                </>
              )}
              {!isGST && (
                <div className="flex justify-between pt-2 border-t border-charcoal/8">
                  <span className="text-sm font-semibold text-charcoal">Total</span>
                  <span className="text-sm font-bold text-charcoal">{formatSGD(nett)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment strategy */}
          <PaymentStrategyEditor
            strategy={vendor.payment_strategy ?? []}
            cards={cards}
            onChange={handleStrategyChange}
          />
        </div>

        {/* Right column */}
        <div className="w-full md:w-72 shrink-0 space-y-4">
          {/* Card ranking */}
          <CardRanking
            category={vendor.category}
            amount={nett}
            cards={cards}
            paymentStrategy={vendor.payment_strategy ?? []}
            onAssignCard={handleAssignCard}
          />

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
            <h3 className="font-semibold text-charcoal mb-3">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => handlePatch({ notes: notes || null })}
              placeholder="Contract details, contact info, special requirements…"
              rows={4}
              className="w-full text-sm text-charcoal/80 placeholder:text-charcoal/30 bg-transparent resize-none focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
