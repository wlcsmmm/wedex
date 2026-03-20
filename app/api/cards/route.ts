import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Look up the user's wedding member record
  const { data: member } = await supabase
    .from('wedding_members')
    .select('id, wedding_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'No wedding found' }, { status: 404 })

  const body = await request.json()
  const { card_type_id, nickname } = body

  if (!card_type_id) return NextResponse.json({ error: 'card_type_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('credit_cards')
    .insert({
      wedding_id: member.wedding_id,
      member_id: member.id,
      card_type_id,
      nickname: nickname || null,
    })
    .select('*, card_types(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Verify ownership via wedding_members
  const { data: card } = await supabase
    .from('credit_cards')
    .select('wedding_id')
    .eq('id', id)
    .single()

  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  const { error } = await supabase
    .from('credit_cards')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
