import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rankCards } from '@/lib/card-optimizer'
import type { WeddingCategory } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { wedding_id, category, amount } = await request.json()

    const { data: cards } = await supabase
      .from('credit_cards')
      .select('*, card_type:card_types(*)')
      .eq('wedding_id', wedding_id)

    if (!cards || cards.length === 0) {
      return NextResponse.json({ ranked: [] })
    }

    const ranked = rankCards(cards as Parameters<typeof rankCards>[0], category as WeddingCategory, amount)
    return NextResponse.json({ ranked })
  } catch (error) {
    console.error('optimize-cards error:', error)
    return NextResponse.json({ error: 'Failed to optimize cards' }, { status: 500 })
  }
}
