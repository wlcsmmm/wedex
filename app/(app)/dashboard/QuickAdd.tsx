'use client'

import { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { CATEGORY_LABELS } from '@/lib/constants'
import { rankCards } from '@/lib/card-optimizer'
import { formatSGD, plusPlusToNett } from '@/lib/gst'
import type { ParseVendorResult, Vendor, CreditCard, CardType, WeddingCategory } from '@/lib/types'

type CardWithType = CreditCard & { card_types: CardType }

interface QuickAddProps {
  weddingId: string
  cards: CardWithType[]
  onVendorAdded: (vendor: Vendor) => void
}

export interface QuickAddHandle {
  focus: () => void
}

interface ParsedState {
  result: ParseVendorResult
  nettAmount: number
  suggestedCardId: string | null
  suggestedCardName: string | null
}

const QuickAdd = forwardRef<QuickAddHandle, QuickAddProps>(
  function QuickAdd({ weddingId, cards, onVendorAdded }, ref) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [parsed, setParsed] = useState<ParsedState | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }))

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || loading) return

      setLoading(true)
      setError(null)
      setParsed(null)

      try {
        const res = await fetch('/api/parse-vendor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: trimmed }),
        })
        if (!res.ok) throw new Error('Failed to parse vendor')
        const result: ParseVendorResult = await res.json()

        const raw = result.total_quoted ?? 0
        const nettAmount = result.is_plus_plus ? plusPlusToNett(raw) : raw

        // Suggest best card for this category
        let suggestedCardId: string | null = null
        let suggestedCardName: string | null = null
        if (result.category && cards.length > 0) {
          // rankCards expects { card_type } but Supabase returns { card_types }
        const mappedCards = cards.map((c) => ({ ...c, card_type: c.card_types }))
        const ranked = rankCards(mappedCards, result.category as WeddingCategory, nettAmount)
          if (ranked.length > 0) {
            suggestedCardId = ranked[0].card_id
            suggestedCardName = ranked[0].card_name
          }
        }

        setParsed({ result, nettAmount, suggestedCardId, suggestedCardName })
      } catch {
        setError('Could not parse vendor. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    async function handleConfirm() {
      if (!parsed) return
      setSaving(true)
      setError(null)

      try {
        const { result, nettAmount, suggestedCardId } = parsed
        const paymentStrategy = suggestedCardId
          ? [{ index: 0, amount: nettAmount, due_date: null, type: 'full' as const, card_id: suggestedCardId, status: 'planned' as const, paid_date: null, actual_card_id: null, miles_earned: null, expense_id: null }]
          : []

        const body = {
          wedding_id: weddingId,
          name: result.vendor_name ?? 'Unnamed vendor',
          category: result.category ?? 'misc_buffer',
          total_quoted: result.total_quoted ?? nettAmount,
          total_nett: result.is_plus_plus ? nettAmount : null,
          status: 'active',
          payment_strategy: paymentStrategy,
          notes: result.payment_notes ?? null,
          funded_by: 'couple',
        }

        const res = await fetch('/api/vendors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Failed to save vendor')
        const vendor: Vendor = await res.json()
        onVendorAdded(vendor)
        setInput('')
        setParsed(null)
      } catch {
        setError('Could not save vendor. Please try again.')
      } finally {
        setSaving(false)
      }
    }

    function handleDiscard() {
      setParsed(null)
      setError(null)
    }

    return (
      <div className="mt-6">
        {/* Confirmation card */}
        {parsed && (
          <div className="bg-white border border-charcoal/10 rounded-2xl p-4 mb-3 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-semibold text-charcoal">
                  {parsed.result.vendor_name ?? 'Unknown vendor'}
                </p>
                {parsed.result.category && (
                  <span className="text-xs text-charcoal/50 mt-0.5 block">
                    {CATEGORY_LABELS[parsed.result.category as WeddingCategory] ?? parsed.result.category}
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-charcoal whitespace-nowrap">
                {formatSGD(parsed.nettAmount)}
                {parsed.result.is_plus_plus && (
                  <span className="text-xs font-normal text-charcoal/40 ml-1">(nett)</span>
                )}
              </p>
            </div>

            {parsed.suggestedCardName && (
              <p className="text-xs text-charcoal/50 mb-3">
                Suggested card:{' '}
                <span className="font-medium text-charcoal/70">{parsed.suggestedCardName}</span>
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex-1 bg-charcoal text-warm-white text-sm font-medium py-2 rounded-xl hover:bg-charcoal/80 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Confirm'}
              </button>
              <button
                onClick={handleDiscard}
                disabled={saving}
                className="flex-1 border border-charcoal/15 text-charcoal/60 text-sm font-medium py-2 rounded-xl hover:bg-warm-white transition-colors disabled:opacity-50"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="bg-white border border-charcoal/12 rounded-2xl flex items-center gap-2 px-4 py-3 shadow-sm focus-within:border-charcoal/30 transition-colors">
          <span className="text-lg">✦</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a vendor — try 'Photography by Studio X, $3500 ++'"
            className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/30 outline-none"
            disabled={loading || saving}
          />
          {loading ? (
            <span className="text-charcoal/30 text-xs animate-pulse">Parsing…</span>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="text-sm font-medium text-blush disabled:text-charcoal/20 transition-colors"
            >
              Add
            </button>
          )}
        </form>

        {error && (
          <p className="text-xs text-red-400 mt-2 px-1">{error}</p>
        )}
      </div>
    )
  }
)

export default QuickAdd
