import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Wedding, Vendor, Expense, CreditCard, CardType } from '@/lib/types'
import ExpensesShell from './ExpensesShell'

type CardWithType = CreditCard & { card_types: CardType }
type VendorSummary = Pick<Vendor, 'id' | 'name' | 'category' | 'payment_strategy'>

export default async function ExpensesPage() {
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

  const [{ data: expensesRaw }, { data: vendorsRaw }, { data: cardsRaw }] = await Promise.all([
    supabase
      .from('expenses')
      .select('*')
      .eq('wedding_id', (wedding as Wedding).id)
      .order('date', { ascending: false }),
    supabase
      .from('vendors')
      .select('id, name, category, payment_strategy')
      .eq('wedding_id', (wedding as Wedding).id)
      .order('name', { ascending: true }),
    supabase
      .from('credit_cards')
      .select('*, card_types(*)')
      .eq('wedding_id', (wedding as Wedding).id),
  ])

  return (
    <ExpensesShell
      weddingId={(wedding as Wedding).id}
      initialExpenses={(expensesRaw ?? []) as Expense[]}
      vendors={(vendorsRaw ?? []) as VendorSummary[]}
      cards={(cardsRaw ?? []) as CardWithType[]}
    />
  )
}
