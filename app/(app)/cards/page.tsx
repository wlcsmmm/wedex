import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Wedding, Vendor, CreditCard, CardType } from '@/lib/types'
import CardsShell from './CardsShell'

type CardWithType = CreditCard & { card_types: CardType }

export default async function CardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberRaw } = await supabase
    .from('wedding_members')
    .select('wedding_id, weddings(*)')
    .eq('user_id', user.id)
    .single()

  const wedding = (memberRaw as { wedding_id: string; weddings: Wedding } | null)?.weddings ?? null
  if (!wedding) redirect('/onboarding')

  const [{ data: cardsRaw }, { data: vendorsRaw }, { data: cardTypesRaw }] = await Promise.all([
    supabase
      .from('credit_cards')
      .select('*, card_types(*)')
      .eq('wedding_id', wedding.id),
    supabase
      .from('vendors')
      .select('*')
      .eq('wedding_id', wedding.id),
    supabase
      .from('card_types')
      .select('*')
      .order('bank'),
  ])

  return (
    <CardsShell
      weddingId={wedding.id}
      initialCards={(cardsRaw ?? []) as CardWithType[]}
      vendors={(vendorsRaw ?? []) as Vendor[]}
      cardTypes={(cardTypesRaw ?? []) as CardType[]}
    />
  )
}
