# Database (Supabase / PostgreSQL)

1. Create a Supabase project.
2. Run `database/schema.sql` once in the SQL Editor.
3. In Authentication settings, turn OFF "Confirm email" for demos (or keep it on and confirm by email).
4. Copy `.env.example` to `.env.local` and add the project URL and anon key.

Tables: `colleges`, `profiles`, `saved_colleges`, `roadmap_progress`, `counselor_chats`.
Every user table has Row Level Security, so a student can only read and edit their own rows.
The compare list stays in the browser because it is only a temporary selection.
College rows are prototype data, not verified facts.
