'use client'

import type { Vendor, CreditCard, CardType } from '@/lib/types'
import VendorRow from './VendorRow'

type CardWithType = CreditCard & { card_types: CardType }

interface VendorListProps {
  vendors: Vendor[]
  cards: CardWithType[]
  onAddClick: () => void
}

export default function VendorList({ vendors, cards, onAddClick }: VendorListProps) {
  return (
    <div className="bg-white rounded-2xl border border-charcoal/8 flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-charcoal/6">
        <h2 className="font-semibold text-charcoal">
          Vendors
          {vendors.length > 0 && (
            <span className="ml-2 text-xs font-normal text-charcoal/40">{vendors.length}</span>
          )}
        </h2>
        <button
          onClick={onAddClick}
          className="text-sm text-blush hover:text-blush/70 font-medium transition-colors"
        >
          + Add vendor
        </button>
      </div>

      {/* List */}
      {vendors.length === 0 ? (
        <div className="py-14 px-6 text-center">
          <p className="text-3xl mb-3">🌸</p>
          <p className="text-sm font-medium text-charcoal/60 mb-1">No vendors yet</p>
          <p className="text-xs text-charcoal/40 mb-4">
            Add your first vendor to start tracking your wedding budget
          </p>
          <button
            onClick={onAddClick}
            className="text-sm text-blush hover:underline font-medium"
          >
            Add a vendor →
          </button>
        </div>
      ) : (
        <div className="divide-y divide-charcoal/5">
          {vendors.map((vendor) => (
            <VendorRow key={vendor.id} vendor={vendor} cards={cards} />
          ))}
        </div>
      )}
    </div>
  )
}
