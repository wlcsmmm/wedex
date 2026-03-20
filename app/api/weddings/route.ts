import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { VenueTier } from '@/lib/types'

// Server-side wedding creation — uses cookie-based session (reliable after magic link auth)
// The client-side insert can fail RLS if the browser session hasn't fully propagated yet.

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, date, total_budget, venue_tier, guest_count } = body

  if (!total_budget) {
    return NextResponse.json({ error: 'total_budget is required' }, { status: 400 })
  }

  const { data: wedding, error } = await supabase
    .from('weddings')
    .insert({
      name: name || `${user.email?.split('@')[0]}'s Wedding`,
      date: date || null,
      total_budget,
      venue_tier: (venue_tier || null) as VenueTier | null,
      guest_count: guest_count || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: wedding }, { status: 201 })
}
