import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveRate } from '@/lib/card-optimizer'
import type { Vendor, PaymentStrategy, CardType } from '@/lib/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const wedding_id = searchParams.get('wedding_id')
  if (!wedding_id) return NextResponse.json({ error: 'wedding_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('wedding_id', wedding_id)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { vendor_id, matched_payment_index, card_id, amount, date } = body

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({ source: 'manual', ...body })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let card_mismatch = false
  let miles_earned: number | null = null

  // If linked to a vendor payment, update that payment_strategy entry
  if (vendor_id && matched_payment_index !== null && matched_payment_index !== undefined) {
    const { data: vendorRaw } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendor_id)
      .single()

    if (vendorRaw) {
      const vendor = vendorRaw as Vendor

      // Compute miles earned if a card was used
      if (card_id) {
        const { data: cardRaw } = await supabase
          .from('credit_cards')
          .select('*, card_types(*)')
          .eq('id', card_id)
          .single()

        if (cardRaw) {
          const cardType = (cardRaw as { card_types: CardType }).card_types
          const rate = getEffectiveRate(cardType, vendor.category, amount)
          miles_earned = Math.round(amount * (rate / 100) * 100) / 100
        }
      }

      // Detect card mismatch (planned card vs actual card)
      const plannedCardId = vendor.payment_strategy[matched_payment_index]?.card_id
      card_mismatch = !!plannedCardId && plannedCardId !== (card_id ?? null)

      const updatedStrategy: PaymentStrategy[] = vendor.payment_strategy.map((p, i) =>
        i === matched_payment_index
          ? {
              ...p,
              status: 'paid' as const,
              paid_date: date ?? new Date().toISOString().split('T')[0],
              actual_card_id: card_id ?? null,
              miles_earned,
              expense_id: expense.id,
            }
          : p
      )

      await supabase
        .from('vendors')
        .update({ payment_strategy: updatedStrategy, updated_at: new Date().toISOString() })
        .eq('id', vendor_id)
    }
  }

  return NextResponse.json({ data: expense, card_mismatch, miles_earned }, { status: 201 })
}
