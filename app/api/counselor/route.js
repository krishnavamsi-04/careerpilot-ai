import { getUserFromRequest, serverClient } from '@/lib/supabaseServer'
import { counselorReply } from '@/lib/counselor'

export const dynamic = 'force-dynamic'

// POST /api/counselor   body: { "message": "..." }   header: Authorization: Bearer <token>
// Only logged-in students can use it. The server checks the token with Supabase Auth,
// reads that student's profile (Row Level Security applies), and returns a reply.
export async function POST(request) {
  const { user, token } = await getUserFromRequest(request)
  if (!user) return Response.json({ error: 'Please log in first' }, { status: 401 })

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!message) return Response.json({ error: 'Message is required' }, { status: 400 })
  if (message.length > 1000) return Response.json({ error: 'Message is too long (max 1000 characters)' }, { status: 400 })

  const { data: profile } = await serverClient(token)
    .from('profiles').select('interests, goals').eq('id', user.id).maybeSingle()

  return Response.json({ reply: counselorReply(message, profile) })
}
