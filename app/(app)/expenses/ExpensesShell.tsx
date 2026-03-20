'use client'

import { useState, useMemo } from 'react'
import type { Expense, Vendor, CreditCard, CardType, FundedBy, PaymentStrategy } from '@/lib/types'

type CardWithType = CreditCard & { card_types: CardType }
type VendorSummary = Pick<Vendor, 'id' | 'name' | 'category' | 'payment_strategy'>

interface Props {
  weddingId: string
  initialExpenses: Expense[]
  vendors: VendorSummary[]
  cards: CardWithType[]
}

const FUNDED_BY_LABELS: Record<FundedBy, string> = {
  couple: 'Couple',
  bride_family: "Bride's Family",
  groom_family: "Groom's Family",
  other: 'Other',
}

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  deposit: 'Deposit',
  installment: 'Installment',
  balance: 'Balance',
  full: 'Full Payment',
}

export default function ExpensesShell({ weddingId, initialExpenses, vendors: initialVendors, cards }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [vendors, setVendors] = useState<VendorSummary[]>(initialVendors)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [merchantName, setMerchantName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [cardId, setCardId] = useState('')
  const [fundedBy, setFundedBy] = useState<FundedBy>('couple')
  const [vendorId, setVendorId] = useState('')
  const [paymentIndex, setPaymentIndex] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const selectedVendor = useMemo(
    () => vendors.find(v => v.id === vendorId) ?? null,
    [vendors, vendorId]
  )

  const unpaidPayments = useMemo((): PaymentStrategy[] => {
    if (!selectedVendor) return []
    return selectedVendor.payment_strategy.filter(p => p.status !== 'paid')
  }, [selectedVendor])

  const vendorMap = useMemo(() => {
    const map = new Map<string, VendorSummary>()
    for (const v of vendors) map.set(v.id, v)
    return map
  }, [vendors])

  const cardMap = useMemo(() => {
    const map = new Map<string, CardWithType>()
    for (const c of cards) map.set(c.id, c)
    return map
  }, [cards])

  const summary = useMemo(() => {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
    let totalMiles = 0
    for (const v of vendors) {
      for (const p of v.payment_strategy) {
        if (p.expense_id && p.miles_earned) totalMiles += p.miles_earned
      }
    }
    return { totalSpent, totalMiles, count: expenses.length }
  }, [expenses, vendors])

  function resetForm() {
    setMerchantName('')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setCardId('')
    setFundedBy('couple')
    setVendorId('')
    setPaymentIndex('')
    setNotes('')
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    const selectedVendorObj = vendorId ? vendors.find(v => v.id === vendorId) : null
    const category = selectedVendorObj?.category ?? null

    const payload = {
      wedding_id: weddingId,
      amount: parseFloat(amount),
      date,
      merchant_name: merchantName || null,
      card_id: cardId || null,
      funded_by: fundedBy,
      source: 'manual',
      vendor_id: vendorId || null,
      matched_payment_index: paymentIndex !== '' ? paymentIndex : null,
      notes: notes || null,
      category,
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to save expense')

      const newExpense = json.data as Expense
      setExpenses(prev => [newExpense, ...prev])

      // Optimistically update vendor payment_strategy so miles/mismatch show immediately
      if (vendorId && paymentIndex !== '') {
        setVendors(prev => prev.map(v => {
          if (v.id !== vendorId) return v
          return {
            ...v,
            payment_strategy: v.payment_strategy.map((p, i) =>
              i === (paymentIndex as number)
                ? {
                    ...p,
                    status: 'paid' as const,
                    paid_date: date,
                    actual_card_id: cardId || null,
                    miles_earned: json.miles_earned ?? null,
                    expense_id: newExpense.id,
                  }
                : p
            ),
          }
        }))
      }

      resetForm()
      setShowForm(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-charcoal/15 text-sm text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-blush/60 bg-white'

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Expenses</h1>
          <p className="text-sm text-charcoal/50 mt-0.5">Log actual payments made to vendors</p>
        </div>
        <button
          onClick={() => { setShowForm(f => !f); if (showForm) resetForm() }}
          className="px-4 py-2 bg-blush text-white rounded-xl text-sm font-medium hover:bg-blush/90 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Log Expense'}
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Expenses', value: summary.count.toString() },
          {
            label: 'Total Spent',
            value: `SGD ${summary.totalSpent.toLocaleString('en-SG', { minimumFractionDigits: 2 })}`,
          },
          {
            label: 'Miles Earned',
            value: summary.totalMiles > 0 ? summary.totalMiles.toLocaleString() : '—',
          },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-charcoal/8 px-5 py-4">
            <p className="text-xs text-charcoal/50 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-xl font-semibold text-charcoal">{value}</p>
          </div>
        ))}
      </div>

      {/* Log expense form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-charcoal/8 p-6 mb-6">
          <h2 className="text-base font-semibold text-charcoal mb-4">Log Expense</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Merchant */}
            <div>
              <label className="block text-xs text-charcoal/60 mb-1">Merchant name</label>
              <input
                type="text"
                value={merchantName}
                onChange={e => setMerchantName(e.target.value)}
                placeholder="e.g. Grand Hyatt"
                className={inputCls}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs text-charcoal/60 mb-1">Amount (SGD) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className={inputCls}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs text-charcoal/60 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Card used */}
            <div>
              <label className="block text-xs text-charcoal/60 mb-1">Card used</label>
              <select value={cardId} onChange={e => setCardId(e.target.value)} className={inputCls}>
                <option value="">— No card —</option>
                {cards.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nickname ?? c.card_types.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Funded by */}
            <div>
              <label className="block text-xs text-charcoal/60 mb-1">Funded by</label>
              <select
                value={fundedBy}
                onChange={e => setFundedBy(e.target.value as FundedBy)}
                className={inputCls}
              >
                {(Object.entries(FUNDED_BY_LABELS) as [FundedBy, string][]).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
            </div>

            {/* Link to vendor */}
            <div>
              <label className="block text-xs text-charcoal/60 mb-1">Link to vendor</label>
              <select
                value={vendorId}
                onChange={e => { setVendorId(e.target.value); setPaymentIndex('') }}
                className={inputCls}
              >
                <option value="">— Unlinked —</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Match to payment — only when vendor selected with unpaid payments */}
            {vendorId && unpaidPayments.length > 0 && (
              <div className="col-span-2">
                <label className="block text-xs text-charcoal/60 mb-1">Match to planned payment</label>
                <select
                  value={paymentIndex}
                  onChange={e => setPaymentIndex(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className={inputCls}
                >
                  <option value="">— Don't match —</option>
                  {unpaidPayments.map(p => (
                    <option key={p.index} value={p.index}>
                      {PAYMENT_TYPE_LABELS[p.type] ?? p.type} — SGD {p.amount.toLocaleString()}
                      {p.due_date
                        ? ` · due ${new Date(p.due_date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : ''}
                      {p.status === 'overdue' ? ' ⚠ overdue' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-xs text-charcoal/60 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes"
                className={inputCls}
              />
            </div>
          </div>

          {formError && (
            <p className="mt-3 text-sm text-red-600">{formError}</p>
          )}

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={submitting || !amount}
              className="px-5 py-2 bg-charcoal text-warm-white rounded-xl text-sm font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-40"
            >
              {submitting ? 'Saving…' : 'Save Expense'}
            </button>
          </div>
        </form>
      )}

      {/* Expense list */}
      {expenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal/8 px-6 py-12 text-center">
          <p className="text-charcoal/40 text-sm">No expenses logged yet.</p>
          <p className="text-charcoal/30 text-xs mt-1">Log your first payment to start tracking.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/8">
                {['Date', 'Merchant', 'Amount', 'Card', 'Vendor', 'Miles'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-medium text-charcoal/50 uppercase tracking-wide ${i >= 2 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => {
                const card = expense.card_id ? cardMap.get(expense.card_id) : null
                const vendor = expense.vendor_id ? vendorMap.get(expense.vendor_id) : null

                // Detect card mismatch from (potentially updated) vendor state
                let hasMismatch = false
                if (vendor && expense.matched_payment_index !== null && expense.matched_payment_index !== undefined) {
                  const p = vendor.payment_strategy[expense.matched_payment_index]
                  hasMismatch = !!(p && p.actual_card_id && p.card_id && p.actual_card_id !== p.card_id)
                }

                // Miles from vendor payment_strategy
                let milesEarned: number | null = null
                if (vendor && expense.matched_payment_index !== null && expense.matched_payment_index !== undefined) {
                  milesEarned = vendor.payment_strategy[expense.matched_payment_index]?.miles_earned ?? null
                }

                return (
                  <tr
                    key={expense.id}
                    className="border-b border-charcoal/5 last:border-0 hover:bg-warm-white/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-charcoal/60 whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString('en-SG', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-charcoal font-medium">
                      {expense.merchant_name ?? '—'}
                      {expense.notes && (
                        <span className="ml-2 text-xs text-charcoal/40">{expense.notes}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-charcoal font-medium whitespace-nowrap">
                      SGD {expense.amount.toLocaleString('en-SG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-right text-charcoal/70">
                      <span className="flex items-center justify-end gap-1.5">
                        {card ? (card.nickname ?? card.card_types.name) : '—'}
                        {hasMismatch && (
                          <span
                            title="Different card used than planned"
                            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex-shrink-0"
                          >
                            !
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-charcoal/60">
                      {vendor ? vendor.name : '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-charcoal/60">
                      {milesEarned !== null ? milesEarned.toLocaleString() : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
