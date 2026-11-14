import { serverClient } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

// GET /api/health - checks that the server and the database are reachable
export async function GET() {
  const { error } = await serverClient().from('colleges').select('id', { count: 'exact', head: true })
  return Response.json(
    { status: error ? 'degraded' : 'ok', database: error ? 'unreachable' : 'connected' },
    { status: error ? 503 : 200 }
  )
}
