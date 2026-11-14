# CareerPilot AI

CareerPilot AI is a polished frontend-only prototype for helping students explore careers, colleges, skills, and learning roadmaps.

## Important scope note

This exported version is the current prototype. It intentionally does **not** include a backend, Supabase, MongoDB, Gemini, external APIs, authentication services, or database tables. Demo authentication, onboarding, saved colleges, comparison, counselor responses, roadmap progress, and profile edits use React state and browser `localStorage`.

The project contains no real student data and no verified college statistics. College content is clearly labeled prototype data.

## Run locally

Requirements:

- Node.js 18 or newer
- Yarn 1.x

Install and start the development server:

```bash
yarn install
yarn dev
```

Then open the local URL shown by Next.js. The app uses the existing Next.js scripts in `package.json`.

Create a production build with:

```bash
yarn build
yarn start
```

## Main product flows

- Landing page
- Demo login and signup
- Five-step onboarding
- Personalized dashboard
- College search and filters
- College details
- Saved colleges
- Comparison of up to three colleges
- AI counselor demo conversation
- Career roadmap milestones
- Editable student profile

## Where to edit

- `app/page.js` and route page files: route entry points
- `components/careerpilot-app.js`: main UI, navigation, state, and prototype flows
- `data/mockData.js`: prototype colleges, careers, roadmap phases, and onboarding options
- `app/globals.css`: global Tailwind styles
- `package.json`: scripts and dependencies
- `tailwind.config.js`: Tailwind configuration

## Database setup for a future backend connection

There is no database setup required for this prototype. To connect a friend's own backend later:

1. Choose a database provider and create a separate project.
2. Design tables for profiles, academic profiles, interests, skills, career goals, colleges, saved colleges, comparisons, conversations, messages, recommendations, roadmaps, and assessments.
3. Add row-level access rules so each student can read and edit only their own private records.
4. Replace the `localStorage` helpers and mock data service boundaries in `components/careerpilot-app.js` with server-side service calls.
5. Keep API credentials in server-side environment variables only. Never place service-role keys or Gemini keys in browser-exposed variables.
6. Add a separate `.env.local` based on `.env.example` for the friend's own local setup.

This export does not create or modify any database schema, and it does not contain any database credentials.

## Future AI counselor setup

The current counselor is explicitly a prototype response experience. For a production version, call Gemini only from a secure backend or Edge Function, store `GEMINI_API_KEY` as a server-side secret, authenticate requests, and persist conversations through the chosen database with row-level access control.

## Export safety

Secrets and runtime artifacts were intentionally excluded from this archive, including `.env`, `node_modules`, `.next`, and generated build output.