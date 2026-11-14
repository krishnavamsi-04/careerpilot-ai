import { getUserFromRequest, serverClient } from '@/lib/supabaseServer'
import { counselorReply } from '@/lib/counselor'

export const dynamic = 'force-dynamic'

// POST /api/counselor
// body: { "message": "...", "history": [{ "role": "user" | "assistant", "text": "..." }] }
// header: Authorization: Bearer <token>
export async function POST(request) {
  const { user, token } = await getUserFromRequest(request)
  if (!user) return Response.json({ error: 'Please log in first' }, { status: 401 })

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!message) return Response.json({ error: 'Message is required' }, { status: 400 })
  if (message.length > 1000) return Response.json({ error: 'Message is too long (max 1000 characters)' }, { status: 400 })
  const history = Array.isArray(body?.history) ? body.history.slice(-10) : []

  // The profile is read from the database (not from the browser), so it cannot be faked.
  const { data: profile } = await serverClient(token)
    .from('profiles')
    .select('name, education, branch, interests, skills, goals')
    .eq('id', user.id)
    .maybeSingle()

  try {
    const reply = await counselorReply(message, profile, history)
    return Response.json({ reply })
  } catch (error) {
    console.error('Counselor error:', error.message)
    const notConfigured = error.message.includes('GEMINI_API_KEY')
    return Response.json(
      { error: notConfigured ? 'The AI counselor is not set up on this server yet.' : 'The AI counselor is busy right now. Please try again in a moment.' },
      { status: notConfigured ? 503 : 502 }
    )
  }
}