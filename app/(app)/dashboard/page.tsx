import { createClient } from '@/lib/supabase/server'
import { formatSGD } from '@/lib/gst'
import type { Wedding } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get the user's wedding via membership
  const { data: memberRaw } = await supabase
    .from('wedding_members')
    .select('wedding_id, weddings(*)')
    .eq('user_id', user!.id)
    .single()

  const member = memberRaw as { wedding_id: string; weddings: Wedding } | null
  const wedding = member?.weddings ?? null

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

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-charcoal mb-2">{wedding.name}</h1>
      <p className="text-charcoal/50 text-sm mb-8">
        Budget: {formatSGD(wedding.total_budget)}
        {wedding.date
          ? ` · ${new Date(wedding.date).toLocaleDateString('en-SG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}`
          : ''}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Budget', value: formatSGD(wedding.total_budget), color: 'text-charcoal' },
          { label: 'Planned', value: formatSGD(0), color: 'text-blush' },
          { label: 'Remaining', value: formatSGD(wedding.total_budget), color: 'text-sage' },
          { label: 'Miles Earned', value: '0 mi', color: 'text-charcoal/60' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-charcoal/8">
            <p className="text-xs text-charcoal/50 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-charcoal">Vendors</h2>
          <a href="/onboarding" className="text-sm text-blush hover:underline">+ Add vendor</a>
        </div>
        <p className="text-sm text-charcoal/40 py-8 text-center">
          No vendors yet. Add your first vendor to get started.
        </p>
      </div>
    </div>
  )
}
