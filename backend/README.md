# Backend

The backend is a set of server-side API routes in `app/api/` (Next.js Route Handlers).
They run on the server, not in the browser, and talk to Supabase (PostgreSQL + Auth).

| Method | Route | Login needed | What it does |
|---|---|---|---|
| GET | `/api/health` | No | Checks that the server and database are reachable |
| GET | `/api/colleges?q=&state=&type=` | No | Returns colleges, with optional search and filters |
| POST | `/api/counselor` | Yes (Bearer token) | Verifies the user, reads their profile, returns a counselor reply |

Architecture: Browser -> Next.js API routes (server) -> Supabase (Auth + PostgreSQL with Row Level Security).

Profile, saved colleges, roadmap progress and chat history are still saved from the app directly to Supabase,
protected by Row Level Security.

Next step: replace the rule-based reply in `lib/counselor.js` with a Gemini API call using a server-only key.
