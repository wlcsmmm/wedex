import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Wedding, Vendor, Budget, CreditCard, CardType } from '@/lib/types'
import DashboardShell from './DashboardShell'

type CardWithType = CreditCard & { card_types: CardType }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: memberRaw } = await supabase
    .from('wedding_members')
    .select('wedding_id, weddings(*)')
    .eq('user_id', user.id)
    .single()

  const wedding = (memberRaw as { wedding_id: string; weddings: Wedding } | null)?.weddings ?? null

  if (!wedding) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-charcoal/60 mb-4">No wedding found.</p>
          <a href="/onboarding" className="text-blush font-medium hover:underline">
            Set up your wedding →
          </a>
        </div>
      </div>
    )
  }

  // Parallel data fetches
  const [{ data: vendorsRaw }, { data: budgetsRaw }, { data: cardsRaw }] = await Promise.all([
    supabase
      .from('vendors')
      .select('*')
      .eq('wedding_id', wedding.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('budgets')
      .select('*')
      .eq('wedding_id', wedding.id),
    supabase
      .from('credit_cards')
      .select('*, card_types(*)')
      .eq('wedding_id', wedding.id),
  ])

  const vendors = (vendorsRaw ?? []) as Vendor[]
  const budgets = (budgetsRaw ?? []) as Budget[]
  const cards = (cardsRaw ?? []) as CardWithType[]

  return (
    <DashboardShell
      wedding={wedding}
      initialVendors={vendors}
      budgets={budgets}
      cards={cards}
    />
  )
}
