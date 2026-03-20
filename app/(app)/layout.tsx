import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-warm-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-charcoal/8 px-4 py-6 gap-1">
        <Link href="/dashboard" className="text-lg font-semibold text-charcoal mb-6 px-3">
          Wedex
        </Link>
        {[
          { href: '/dashboard', label: 'Dashboard', icon: '◈' },
          { href: '/vendors', label: 'Vendors', icon: '🏪' },
          { href: '/cards', label: 'Cards', icon: '💳' },
          { href: '/expenses', label: 'Expenses', icon: '🧾' },
          { href: '/settings', label: 'Settings', icon: '⚙' },
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-charcoal/70 hover:bg-warm-white hover:text-charcoal transition-colors"
          >
            <span>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
