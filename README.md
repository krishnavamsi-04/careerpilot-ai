# CareerPilot AI

CareerPilot AI helps students explore careers and colleges, follow a learning roadmap, and chat with an AI career counselor.

The UI prototype was generated with Emergent. This repository adds a real backend and database:
Supabase Auth and PostgreSQL, plus server-side API routes.

## Architecture

```
Browser (Next.js app)  ->  API routes (server)  ->  Supabase (Auth + PostgreSQL)
```

- **Frontend:** Next.js 15, React, Tailwind CSS
- **Backend:** Next.js Route Handlers in `app/api/` (they run on the server)
- **Database and auth:** Supabase (PostgreSQL) with Row Level Security, so each student can only read and edit their own rows

## API routes

| Method | Route | Login needed | What it does |
|---|---|---|---|
| GET | `/api/health` | No | Checks that the server and database are reachable |
| GET | `/api/colleges?q=&state=&type=` | No | Returns colleges, with optional search and filters |
| POST | `/api/counselor` | Yes (Bearer token) | Verifies the user, reads their profile, returns a counselor reply |

## Database tables

| Table | Purpose |
|---|---|
| `colleges` | Public reference data (10 prototype colleges) |
| `profiles` | One row per student, created automatically on signup by a trigger |
| `saved_colleges` | Which student saved which college |
| `roadmap_progress` | Status of each roadmap phase per student |
| `counselor_chats` | Chat history per student (JSON) |

The full schema, security rules and seed data are in `database/schema.sql`.

## Run it locally

Requirements: Node.js 18 or newer, Yarn 1.x

1. Create a free project at supabase.com.
2. In Supabase, open **SQL Editor** and run `database/schema.sql` once.
3. In Supabase, open **Authentication** settings and turn off "Confirm email" for demos.
4. Copy `.env.example` to `.env.local` and fill in the Project URL and the anon / publishable key
   (Project Settings -> API). Never use the service_role key.
5. Install and start:

```
yarn install
yarn dev:webpack
```

(`yarn dev` also works on Mac, Linux and Git Bash. On Windows PowerShell use `yarn dev:webpack`.)

Open http://localhost:3000. Check http://localhost:3000/api/health: it should say `ok`.

## Where to edit

- `components/careerpilot-app.js`: main UI, navigation and data loading/saving
- `app/api/`: backend routes
- `lib/supabase.js`: browser Supabase client
- `lib/supabaseServer.js`: server-side Supabase helper and token check
- `lib/counselor.js`: counselor reply logic
- `data/mockData.js`: prototype careers, roadmap phases and onboarding options
- `database/schema.sql`: tables, security rules, trigger and seed data

## Current limits and next steps

- College data is **prototype data**, not verified. Next step: import verified data from an official source.
- The counselor reply is rule-based. Next step: call Gemini from `app/api/counselor/route.js`
  with a server-only `GEMINI_API_KEY`.
- The compare list is kept in the browser on purpose (it is only a temporary selection).
- Not built yet: password reset, Google sign-in, automated tests.

## Security

- Keys live in `.env.local`, which is ignored by Git.
- Only the public anon key is used in this project.
- Row Level Security is enabled on every table.