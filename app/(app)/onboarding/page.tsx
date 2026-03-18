'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WEDDING_CATEGORIES, BUDGET_BENCHMARKS } from '@/lib/constants'
import type { CardType, VenueTier, WeddingCategory } from '@/lib/types'

import { Step1Welcome } from './_steps/Step1Welcome'
import { Step2Budget } from './_steps/Step2Budget'
import { Step3Basics } from './_steps/Step3Basics'
import { Step4Split } from './_steps/Step4Split'
import { Step5Cards, type CardEntry } from './_steps/Step5Cards'
import { Step6Invite } from './_steps/Step6Invite'
import { Step7Summary } from './_steps/Step7Summary'

const TOTAL_STEPS = 7

interface WizardState {
  totalBudget: string
  weddingName: string
  weddingDate: string
  guestCount: string
  venueTier: VenueTier | ''
  allocations: Record<WeddingCategory, number>
  cards: CardEntry[]
  partnerEmail: string
}

const EMPTY_ALLOCATIONS = Object.fromEntries(
  WEDDING_CATEGORIES.map((c) => [c, 0])
) as Record<WeddingCategory, number>

function getInitialAllocations(tier: VenueTier): Record<WeddingCategory, number> {
  const benchmarks = BUDGET_BENCHMARKS[tier]
  return Object.fromEntries(
    WEDDING_CATEGORIES.map((c) => [c, Math.round((benchmarks[c] || 0) * 100)])
  ) as Record<WeddingCategory, number>
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [cardTypes, setCardTypes] = useState<CardType[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [state, setState] = useState<WizardState>({
    totalBudget: '',
    weddingName: '',
    weddingDate: '',
    guestCount: '',
    venueTier: '',
    allocations: EMPTY_ALLOCATIONS,
    cards: [],
    partnerEmail: '',
  })

  // Fetch card types from Supabase on mount
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('card_types')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setCardTypes(data as CardType[])
      })
  }, [])

  function update(fields: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...fields }))
  }

  function next() {
    // When advancing from step 3, initialise allocations from venue tier
    if (step === 3 && state.venueTier) {
      const hasAllocations = WEDDING_CATEGORIES.some((c) => (state.allocations[c] || 0) > 0)
      if (!hasAllocations) {
        update({ allocations: getInitialAllocations(state.venueTier as VenueTier) })
      }
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const budget = parseFloat(state.totalBudget)

    // 1. Create wedding
    const { data: wedding, error: wErr } = await supabase
      .from('weddings')
      .insert({
        name: state.weddingName || `${user.email?.split('@')[0]}'s Wedding`,
        date: state.weddingDate || null,
        total_budget: budget,
        venue_tier: (state.venueTier || null) as VenueTier | null,
        guest_count: state.guestCount ? parseInt(state.guestCount) : null,
        created_by: user.id,
      })
      .select()
      .single()

    if (wErr || !wedding) {
      setError(wErr?.message || 'Failed to create wedding')
      setSubmitting(false)
      return
    }

    // 2. Create owner wedding_member
    const { data: member, error: mErr } = await supabase
      .from('wedding_members')
      .insert({
        wedding_id: wedding.id,
        user_id: user.id,
        role: 'owner',
        display_name: user.email?.split('@')[0] || 'You',
      })
      .select()
      .single()

    if (mErr || !member) {
      setError(mErr?.message || 'Failed to create member')
      setSubmitting(false)
      return
    }

    // 3. Create budget category allocations
    const budgetRows = WEDDING_CATEGORIES.map((cat) => ({
      wedding_id: wedding.id,
      category: cat,
      allocated_amount: Math.round(budget * (state.allocations[cat] || 0) / 100),
      allocated_pct: state.allocations[cat] || 0,
    }))
    await supabase.from('budgets').insert(budgetRows)

    // 4. Create credit cards
    if (state.cards.length > 0) {
      const cardRows = state.cards.map((c) => ({
        wedding_id: wedding.id,
        member_id: member.id,
        card_type_id: c.card_type_id,
        nickname: c.nickname || null,
      }))
      await supabase.from('credit_cards').insert(cardRows)
    }

    // 5. Invite partner via magic link
    if (state.partnerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.partnerEmail)) {
      await supabase.auth.signInWithOtp({
        email: state.partnerEmail,
        options: { emailRedirectTo: `${location.origin}/dashboard` },
      })
    }

    router.push('/dashboard')
  }

  const budget = parseFloat(state.totalBudget) || 0

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-warm-white/90 backdrop-blur-sm border-b border-charcoal/8 px-6 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div className="flex-1 h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blush rounded-full transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <span className="text-xs text-charcoal/50 whitespace-nowrap">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
      </div>

      {/* Step content */}
      <div className="px-6 py-10">
        {step === 1 && <Step1Welcome onNext={next} />}

        {step === 2 && (
          <Step2Budget
            totalBudget={state.totalBudget}
            onChange={(v) => update({ totalBudget: v })}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 3 && (
          <Step3Basics
            weddingName={state.weddingName}
            weddingDate={state.weddingDate}
            guestCount={state.guestCount}
            venueTier={state.venueTier}
            onChange={(field, value) => update({ [field]: value })}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 4 && (
          <Step4Split
            allocations={state.allocations}
            totalBudget={budget}
            onChange={(allocations) => update({ allocations })}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 5 && (
          <Step5Cards
            cards={state.cards}
            cardTypes={cardTypes}
            onChange={(cards) => update({ cards })}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 6 && (
          <Step6Invite
            partnerEmail={state.partnerEmail}
            onChange={(partnerEmail) => update({ partnerEmail })}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 7 && (
          <Step7Summary
            weddingName={state.weddingName}
            weddingDate={state.weddingDate}
            guestCount={state.guestCount}
            venueTier={state.venueTier}
            totalBudget={budget}
            allocations={state.allocations}
            cards={state.cards}
            cardTypes={cardTypes}
            submitting={submitting}
            onSubmit={handleSubmit}
            onBack={back}
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center max-w-md mx-auto">{error}</p>
        )}
      </div>
    </div>
  )
}
