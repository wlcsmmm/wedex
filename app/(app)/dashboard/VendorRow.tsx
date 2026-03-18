'use client'

import Link from 'next/link'
import { formatSGD } from '@/lib/gst'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { Vendor, CreditCard, CardType, WeddingCategory } from '@/lib/types'

type CardWithType = CreditCard & { card_types: CardType }

interface VendorRowProps {
  vendor: Vendor
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
  cancelled: 'bg-red-100 text-red-400 line-through',
}

export default function VendorRow({ vendor, cards }: VendorRowProps) {
  const assignedCardId = vendor.payment_strategy?.find((p) => p.card_id)?.card_id
  const assignedCard = assignedCardId ? cards.find((c) => c.id === assignedCardId) : null
  const cardName = assignedCard?.card_types?.name ?? assignedCard?.nickname ?? null

  const amount = vendor.total_nett ?? vendor.total_quoted
  const catColor = CATEGORY_COLORS[vendor.category] ?? 'bg-charcoal/8 text-charcoal/60'
  const statusStyle = STATUS_STYLES[vendor.status] ?? 'bg-charcoal/8 text-charcoal/50'

  return (
    <Link href={`/vendors/${vendor.id}`} className="flex items-center gap-3 py-3 px-4 hover:bg-warm-white rounded-xl transition-colors group">
      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal truncate">{vendor.name}</p>
        <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>
          {CATEGORY_LABELS[vendor.category]}
        </span>
      </div>

      {/* Card */}
      <div className="hidden sm:block text-xs text-charcoal/40 text-right min-w-0 max-w-[120px] truncate">
        {cardName ?? <span className="italic">No card</span>}
      </div>

      {/* Amount */}
      <div className="text-sm font-semibold text-charcoal/80 text-right whitespace-nowrap">
        {formatSGD(amount)}
      </div>

      {/* Status */}
      <span className={`hidden md:inline-block text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusStyle}`}>
        {vendor.status === 'fully_paid' ? 'Paid' : vendor.status === 'cancelled' ? 'Cancelled' : 'Active'}
      </span>
    </Link>
  )
}
