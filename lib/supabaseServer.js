import { createClient } from '@supabase/supabase-js'

// Server-side Supabase helper. Runs only inside API routes (never in the browser).
// If a user token is given, Supabase applies that user's Row Level Security rules.
export function serverClient(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    }
  )
}

// Reads "Authorization: Bearer <token>" and asks Supabase Auth whether it is valid.
export async function getUserFromRequest(request) {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return { user: null, token: null }
  const { data, error } = await serverClient(token).auth.getUser(token)
  if (error || !data?.user) return { user: null, token: null }
  return { user: data.user, token }
}
