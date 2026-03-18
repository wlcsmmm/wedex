'use client'

import { formatSGD } from '@/lib/gst'
import type { PaymentStrategy, CreditCard, CardType, PaymentType } from '@/lib/types'

type CardWithType = CreditCard & { card_types: CardType }

interface PaymentStrategyEditorProps {
  strategy: PaymentStrategy[]
  cards: CardWithType[]
  onChange: (updated: PaymentStrategy[]) => void
}

const TYPE_LABELS: Record<PaymentType, string> = {
  deposit: 'Deposit',
  installment: 'Installment',
  balance: 'Balance',
  full: 'Full payment',
}

const STATUS_STYLES: Record<string, string> = {
  planned: 'bg-charcoal/8 text-charcoal/50',
  paid: 'bg-sage/15 text-sage',
  overdue: 'bg-red-100 text-red-500',
}

export default function PaymentStrategyEditor({
  strategy,
  cards,
  onChange,
}: PaymentStrategyEditorProps) {
  function updateRow(index: number, patch: Partial<PaymentStrategy>) {
    const updated = strategy.map((p) =>
      p.index === index ? { ...p, ...patch } : p
    )
    onChange(updated)
  }

  function markPaid(index: number) {
    updateRow(index, {
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
    })
  }

  function addInstallment() {
    const next: PaymentStrategy = {
      index: strategy.length,
      amount: 0,
      due_date: null,
      type: 'installment',
      card_id: null,
      status: 'planned',
      paid_date: null,
      actual_card_id: null,
      miles_earned: null,
      expense_id: null,
    }
    onChange([...strategy, next])
  }

  function removeRow(index: number) {
    const updated = strategy
      .filter((p) => p.index !== index)
      .map((p, i) => ({ ...p, index: i }))
    onChange(updated)
  }

  return (
    <div className="bg-white rounded-2xl border border-charcoal/8 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal">Payment Schedule</h3>
        <button
          onClick={addInstallment}
          className="text-sm text-blush hover:text-blush/70 font-medium transition-colors"
        >
          + Add
        </button>
      </div>

      {strategy.length === 0 ? (
        <p className="text-xs text-charcoal/40 text-center py-6">
          No payments scheduled.{' '}
          <button onClick={addInstallment} className="text-blush hover:underline">
            Add one →
          </button>
        </p>
      ) : (
        <div className="space-y-3">
          {strategy.map((payment) => (
            <div
              key={payment.index}
              className="border border-charcoal/8 rounded-xl p-3 space-y-2"
            >
              {/* Row 1: type + amount + status */}
              <div className="flex items-center gap-2">
                <select
                  value={payment.type}
                  onChange={(e) => updateRow(payment.index, { type: e.target.value as PaymentType })}
                  className="text-xs font-medium text-charcoal bg-charcoal/5 border-0 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blush/30"
                >
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>

                <div className="flex-1 flex items-center gap-1">
                  <span className="text-xs text-charcoal/40">S$</span>
                  <input
                    type="number"
                    value={payment.amount || ''}
                    onChange={(e) => updateRow(payment.index, { amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-24 text-sm font-semibold text-charcoal bg-transparent border-0 focus:outline-none focus:border-b focus:border-blush/50"
                  />
                </div>

                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[payment.status] ?? STATUS_STYLES.planned}`}>
                  {payment.status === 'paid' ? 'Paid' : payment.status === 'overdue' ? 'Overdue' : 'Planned'}
                </span>
              </div>

              {/* Row 2: due date + card */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-xs text-charcoal/40">Due</span>
                  <input
                    type="date"
                    value={payment.due_date ?? ''}
                    onChange={(e) => updateRow(payment.index, { due_date: e.target.value || null })}
                    className="text-xs text-charcoal/70 bg-transparent border-0 focus:outline-none focus:border-b focus:border-blush/50"
                  />
                </div>

                <select
                  value={payment.card_id ?? ''}
                  onChange={(e) => updateRow(payment.index, { card_id: e.target.value || null })}
                  className="text-xs text-charcoal/70 bg-charcoal/5 border-0 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blush/30 max-w-[140px] truncate"
                >
                  <option value="">No card</option>
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.card_types?.name ?? c.nickname ?? 'Card'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 3: actions */}
              <div className="flex items-center gap-3 pt-1">
                {payment.status !== 'paid' && (
                  <button
                    onClick={() => markPaid(payment.index)}
                    className="text-xs text-sage font-medium hover:text-sage/70 transition-colors"
                  >
                    ✓ Mark paid
                  </button>
                )}
                {payment.paid_date && (
                  <span className="text-xs text-charcoal/30">
                    Paid {new Date(payment.paid_date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                <button
                  onClick={() => removeRow(payment.index)}
                  className="text-xs text-charcoal/30 hover:text-red-400 transition-colors ml-auto"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {strategy.length > 1 && (
        <div className="mt-4 pt-3 border-t border-charcoal/8 flex justify-between">
          <span className="text-xs text-charcoal/50">Total scheduled</span>
          <span className="text-sm font-semibold text-charcoal">
            {formatSGD(strategy.reduce((sum, p) => sum + (p.amount || 0), 0))}
          </span>
        </div>
      )}
    </div>
  )
}
