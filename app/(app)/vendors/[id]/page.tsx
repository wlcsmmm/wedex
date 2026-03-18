import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Vendor, CreditCard, CardType } from '@/lib/types'
import VendorDetailShell from './VendorDetailShell'

type CardWithType = CreditCard & { card_types: CardType }

export default async function VendorDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!vendor) redirect('/dashboard')

  const { data: cardsRaw } = await supabase
    .from('credit_cards')
    .select('*, card_types(*)')
    .eq('wedding_id', (vendor as Vendor).wedding_id)

  const cards = (cardsRaw ?? []) as CardWithType[]

  return (
    <VendorDetailShell
      initialVendor={vendor as Vendor}
      cards={cards}
    />
  )
}
