import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Add them to your Vercel project settings or .env.local.'
    )
  }

  return createBrowserClient<Database>(url, key)
}
