'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { CardType } from '@/lib/types'

export interface CardEntry {
  card_type_id: string
  nickname: string
  owner: 'me' | 'partner'
}

interface Props {
  cards: CardEntry[]
  cardTypes: CardType[]
  onChange: (cards: CardEntry[]) => void
  onNext: () => void
  onBack: () => void
}

export function Step5Cards({ cards, cardTypes, onChange, onNext, onBack }: Props) {
  const [selectedId, setSelectedId] = useState('')
  const [nickname, setNickname] = useState('')
  const [owner, setOwner] = useState<'me' | 'partner'>('me')

  function addCard() {
    if (!selectedId) return
    onChange([...cards, { card_type_id: selectedId, nickname, owner }])
    setSelectedId('')
    setNickname('')
    setOwner('me')
  }

  function removeCard(idx: number) {
    onChange(cards.filter((_, i) => i !== idx))
  }

  const selectedType = cardTypes.find((c) => c.id === selectedId)

  // Group by bank
  const banks = Array.from(new Set(cardTypes.map((c) => c.bank))).sort()

  return (
    <div className="max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold text-charcoal mb-2">Your credit cards</h2>
      <p className="text-charcoal/50 text-sm mb-6">
        Add the cards you&apos;ll use for wedding payments. We&apos;ll recommend the best card per vendor.
      </p>

      {/* Added cards */}
      {cards.length > 0 && (
        <div className="space-y-2 mb-5">
          {cards.map((card, idx) => {
            const ct = cardTypes.find((c) => c.id === card.card_type_id)
            return (
              <div key={idx} className="flex items-center justify-between px-4 py-3 bg-white border border-charcoal/10 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-charcoal">{ct?.name}</p>
                  <p className="text-xs text-charcoal/50">
                    {card.nickname ? `"${card.nickname}" · ` : ''}{card.owner === 'me' ? 'Mine' : "Partner's"} · {ct ? (ct.reward_type === 'miles' ? `${ct.fallback_rate} mpd` : `${ct.fallback_rate}% cashback`) : ''}
                  </p>
                </div>
                <button onClick={() => removeCard(idx)} className="text-charcoal/30 hover:text-red-400 text-lg leading-none">×</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add card form */}
      <div className="bg-white border border-charcoal/10 rounded-2xl p-4 mb-6">
        <p className="text-sm font-medium text-charcoal mb-3">Add a card</p>

        <div className="space-y-3">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-blush/30"
          >
            <option value="">Select a card…</option>
            {banks.map((bank) => (
              <optgroup key={bank} label={bank}>
                {cardTypes.filter((c) => c.bank === bank).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            ))}
          </select>

          {selectedType && (
            <div className="flex items-center gap-2 px-3 py-2 bg-sage-50 rounded-lg">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                selectedType.reward_type === 'miles' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {selectedType.reward_type === 'miles' ? `${selectedType.fallback_rate} mpd` : `${selectedType.fallback_rate}% cashback`}
              </span>
              {selectedType.program && (
                <span className="text-xs text-charcoal/50">{selectedType.program}</span>
              )}
            </div>
          )}

          <input
            type="text"
            placeholder="Nickname (optional, e.g. DBS Miles)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-charcoal/15 bg-white text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-blush/30"
          />

          <div className="flex gap-2">
            {(['me', 'partner'] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOwner(o)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  owner === o ? 'bg-blush text-white' : 'bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10'
                }`}
              >
                {o === 'me' ? 'Mine' : 'Partner\'s'}
              </button>
            ))}
          </div>

          <button
            onClick={addCard}
            disabled={!selectedId}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-charcoal/20 text-sm text-charcoal/50 hover:border-blush/40 hover:text-blush transition-colors disabled:opacity-40"
          >
            + Add card
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">
          {cards.length === 0 ? 'Skip for now' : 'Next →'}
        </Button>
      </div>
    </div>
  )
}
