'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    })
    if (!error) setSent(true)
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/dashboard` },
    })
  }

  return (
    <main className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-charcoal mb-1">Welcome back</h1>
        <p className="text-charcoal/60 text-sm mb-8">Sign in to your Wedex account</p>

        {sent ? (
          <div className="bg-sage-50 border border-sage-200 rounded-2xl p-6 text-center">
            <p className="text-sage-700 font-medium">Check your email ✉️</p>
            <p className="text-sage-600 text-sm mt-1">
              We sent a magic link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-white text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-blush/40 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blush text-white py-3 rounded-xl text-sm font-medium hover:bg-blush-600 transition-colors disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-charcoal/10" />
              <span className="text-xs text-charcoal/40">or</span>
              <div className="flex-1 h-px bg-charcoal/10" />
            </div>

            <button
              onClick={handleGoogle}
              className="w-full border border-charcoal/15 bg-white text-charcoal py-3 rounded-xl text-sm font-medium hover:bg-charcoal/5 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}
      </div>
    </main>
  )
}
