'use client'

import { useState, useMemo } from 'react'
import type { CreditCard, CardType, Vendor, WeddingCategory } from '@/lib/types'
import { getEffectiveRate } from '@/lib/card-optimizer'
import { formatSGD } from '@/lib/gst'

type CardWithType = CreditCard & { card_types: CardType }

interface CardStats {
  assignedVendors: { name: string; amount: number; category: WeddingCategory }[]
  totalSpend: number
  projectedReward: number
}

interface Props {
  weddingId: string
  initialCards: CardWithType[]
  vendors: Vendor[]
  cardTypes: CardType[]
}

function computeCardStats(card: CardWithType, vendors: Vendor[]): CardStats {
  const assignedVendors: CardStats['assignedVendors'] = []

  for (const vendor of vendors) {
    if (vendor.status === 'cancelled') continue
    const isAssigned = (vendor.payment_strategy ?? []).some((p) => p.card_id === card.id)
    if (!isAssigned) continue
    const amount = vendor.total_nett ?? vendor.total_quoted
    assignedVendors.push({ name: vendor.name, amount, category: vendor.category })
  }

  const totalSpend = assignedVendors.reduce((s, v) => s + v.amount, 0)

  // Compute projected reward using per-vendor category rate for accuracy
  let projectedReward = 0
  for (const v of assignedVendors) {
    const rate = getEffectiveRate(card.card_types, v.category, v.amount)
    projectedReward += v.amount * (rate / 100)
  }

  return { assignedVendors, totalSpend, projectedReward }
}

export default function CardsShell({ weddingId: _weddingId, initialCards, vendors, cardTypes }: Props) {
  const [cards, setCards] = useState<CardWithType[]>(initialCards)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedTypeId, setSelectedTypeId] = useState('')
  const [nickname, setNickname] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const cardStats = useMemo(() => {
    const map = new Map<string, CardStats>()
    for (const card of cards) map.set(card.id, computeCardStats(card, vendors))
    return map
  }, [cards, vendors])

  const summary = useMemo(() => {
    let totalMiles = 0
    let totalCashback = 0
    for (const card of cards) {
      const stats = cardStats.get(card.id)
      if (!stats) continue
      if (card.card_types.reward_type === 'miles') totalMiles += stats.projectedReward
      else totalCashback += stats.projectedReward
    }
    return { totalMiles: Math.round(totalMiles), totalCashback }
  }, [cards, cardStats])

  // Available card types not yet in wallet
  const existingTypeIds = new Set(cards.map((c) => c.card_type_id))
  const availableTypes = cardTypes.filter((ct) => !existingTypeIds.has(ct.id))
  const banks = Array.from(new Set(availableTypes.map((c) => c.bank))).sort()
  const selectedType = cardTypes.find((c) => c.id === selectedTypeId)

  function closeAddForm() {
    setShowAddForm(false)
    setSelectedTypeId('')
    setNickname('')
    setAddError(null)
  }

  async function handleAddCard() {
    if (!selectedTypeId || adding) return
    setAdding(true)
    setAddError(null)
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_type_id: selectedTypeId, nickname: nickname.trim() || null }),
      })
      if (!res.ok) throw new Error()
      const newCard: CardWithType = await res.json()
      setCards((prev) => [...prev, newCard])
      closeAddForm()
    } catch {
      setAddError('Failed to add card. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveCard(cardId: string, vendorCount: number) {
    if (vendorCount > 0) {
      const ok = confirm(
        `This card is assigned to ${vendorCount} vendor${vendorCount !== 1 ? 's' : ''}. Removing it will unassign it from their payment plans. Continue?`
      )
      if (!ok) return
    }
    try {
      const res = await fetch(`/api/cards?id=${cardId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setCards((prev) => prev.filter((c) => c.id !== cardId))
    } catch {
      alert('Failed to remove card. Please try again.')
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Card Wallet</h1>
          <p className="text-charcoal/50 text-sm mt-1">Cards used for your wedding payments</p>
        </div>
        {!showAddForm && availableTypes.length > 0 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm font-medium text-blush hover:text-blush/70 transition-colors"
          >
            + Add card
          </button>
        )}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <SummaryTile label="Cards" value={String(cards.length)} />
        <SummaryTile
          label="Projected Miles"
          value={summary.totalMiles > 0 ? `${summary.totalMiles.toLocaleString()} mi` : '— mi'}
          sub={summary.totalMiles > 0 ? milesHint(summary.totalMiles) : undefined}
        />
        <SummaryTile
          label="Projected Cashback"
          value={summary.totalCashback > 0 ? formatSGD(summary.totalCashback) : '—'}
        />
      </div>

      {/* Add card form */}
      {showAddForm && (
        <div className="bg-white border border-charcoal/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-charcoal text-sm">Add a card</p>
            <button
              onClick={closeAddForm}
              className="text-charcoal/30 hover:text-charcoal/60 text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <select
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-blush/30"
            >
              <option value="">Select a card…</option>
              {banks.map((bank) => (
                <optgroup key={bank} label={bank}>
                  {availableTypes.filter((c) => c.bank === bank).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            {selectedType && (
              <div className="flex items-center gap-2 px-3 py-2 bg-warm-white rounded-lg">
                <RewardBadge cardType={selectedType} />
                {selectedType.program && (
                  <span className="text-xs text-charcoal/50 capitalize">{selectedType.program}</span>
                )}
              </div>
            )}

            <input
              type="text"
              placeholder="Nickname (optional)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal/15 bg-white text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-blush/30"
            />

            {addError && <p className="text-xs text-red-400">{addError}</p>}

            <button
              onClick={handleAddCard}
              disabled={!selectedTypeId || adding}
              className="w-full py-2.5 bg-charcoal text-warm-white text-sm font-medium rounded-xl hover:bg-charcoal/80 transition-colors disabled:opacity-40"
            >
              {adding ? 'Adding…' : 'Add to wallet'}
            </button>
          </div>
        </div>
      )}

      {/* Card list */}
      {cards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal/8 py-14 px-6 text-center">
          <p className="text-3xl mb-3">💳</p>
          <p className="text-sm font-medium text-charcoal/60 mb-1">No cards in wallet</p>
          <p className="text-xs text-charcoal/40 mb-4">
            Add cards to get smart payment suggestions for each vendor
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm text-blush hover:underline font-medium"
          >
            Add a card →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => {
            const stats = cardStats.get(card.id)!
            return (
              <CardTile
                key={card.id}
                card={card}
                stats={stats}
                onRemove={() => handleRemoveCard(card.id, stats.assignedVendors.length)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-charcoal/8">
      <p className="text-xs text-charcoal/50 mb-1">{label}</p>
      <p className="text-xl font-bold text-charcoal">{value}</p>
      {sub && <p className="text-xs text-charcoal/40 mt-1">{sub}</p>}
    </div>
  )
}

function RewardBadge({ cardType }: { cardType: CardType }) {
  const isMiles = cardType.reward_type === 'miles'
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        isMiles ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
      }`}
    >
      {isMiles ? `${cardType.fallback_rate} mpd` : `${cardType.fallback_rate}% cashback`}
    </span>
  )
}

function CardTile({
  card,
  stats,
  onRemove,
}: {
  card: CardWithType
  stats: CardStats
  onRemove: () => void
}) {
  const ct = card.card_types
  const isMiles = ct.reward_type === 'miles'

  return (
    <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
      {/* Card header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-charcoal/40 mb-0.5">{ct.bank}</p>
          <p className="font-semibold text-charcoal text-sm truncate">
            {card.nickname ? `${ct.name} · "${card.nickname}"` : ct.name}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="text-charcoal/20 hover:text-red-400 transition-colors text-xl leading-none ml-3 flex-shrink-0"
          title="Remove card"
        >
          ×
        </button>
      </div>

      {/* Reward badge */}
      <div className="flex items-center gap-2 mb-4">
        <RewardBadge cardType={ct} />
        {ct.program && (
          <span className="text-xs text-charcoal/40 capitalize">{ct.program}</span>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <StatRow
          label="Assigned spend"
          value={formatSGD(stats.totalSpend)}
          valueClass="text-charcoal"
        />
        <StatRow
          label={isMiles ? 'Projected miles' : 'Projected cashback'}
          value={
            isMiles
              ? stats.projectedReward > 0
                ? `${Math.round(stats.projectedReward).toLocaleString()} mi`
                : '—'
              : stats.projectedReward > 0
                ? formatSGD(stats.projectedReward)
                : '—'
          }
          valueClass={isMiles ? 'text-blue-600' : 'text-green-600'}
        />
      </div>

      {/* Assigned vendors */}
      {stats.assignedVendors.length > 0 && (
        <div className="mt-3 pt-3 border-t border-charcoal/6">
          <p className="text-xs text-charcoal/40 mb-2">
            {stats.assignedVendors.length} vendor{stats.assignedVendors.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-1">
            {stats.assignedVendors.slice(0, 4).map((v, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-xs text-charcoal/60 truncate">{v.name}</span>
                <span className="text-xs text-charcoal/50 flex-shrink-0">{formatSGD(v.amount)}</span>
              </div>
            ))}
            {stats.assignedVendors.length > 4 && (
              <p className="text-xs text-charcoal/35">
                +{stats.assignedVendors.length - 4} more
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatRow({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-charcoal/50">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  )
}

function milesHint(miles: number): string {
  const bkk = Math.floor(miles / 12500)
  if (bkk >= 1) return `≈ ${bkk}× SIN-BKK economy`
  const syd = Math.floor(miles / 60000)
  if (syd >= 1) return `≈ ${syd}× SIN-SYD biz`
  return 'towards honeymoon flights'
}
