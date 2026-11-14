-- =====================================================================
-- CareerPilot AI - complete database schema (Supabase / PostgreSQL)
-- Run this whole file once in: Supabase -> SQL Editor -> New query -> Run
-- It is safe to run again (it will not duplicate data).
-- =====================================================================

-- 1) COLLEGES: public reference data (anyone can read, nobody can edit from the website)
create table if not exists colleges (
  id          text primary key,
  name        text not null,
  city        text,
  state       text,
  type        text,
  courses     text[] default '{}',
  description text,
  facilities  text[] default '{}',
  tags        text[] default '{}'
);

-- 2) PROFILES: one row per student, linked to Supabase Auth
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text default '',
  education     text default '',
  location      text default '',
  branch        text default '',
  cgpa          text default '',
  tenth         text default '',
  intermediate  text default '',
  graduation    text default '',
  interests     text[] default '{}',
  skills        text[] default '{}',
  goals         text[] default '{}',
  work_location text default '',
  college_type  text default '',
  budget        text default '',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 3) SAVED COLLEGES: which student saved which college
create table if not exists saved_colleges (
  user_id    uuid references auth.users(id) on delete cascade,
  college_id text references colleges(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, college_id)
);

-- 4) ROADMAP PROGRESS: status of each roadmap phase per student
create table if not exists roadmap_progress (
  user_id     uuid references auth.users(id) on delete cascade,
  phase_index int  not null check (phase_index >= 0),
  status      text not null check (status in ('complete', 'progress', 'upcoming')),
  updated_at  timestamptz default now(),
  primary key (user_id, phase_index)
);

-- 5) COUNSELOR CHATS: conversation history per student (stored as JSON)
create table if not exists counselor_chats (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  conversations jsonb not null default '[]'::jsonb,
  updated_at    timestamptz default now()
);

-- =====================================================================
-- ROW LEVEL SECURITY: each student can only touch their own rows
-- =====================================================================
alter table colleges         enable row level security;
alter table profiles         enable row level security;
alter table saved_colleges   enable row level security;
alter table roadmap_progress enable row level security;
alter table counselor_chats  enable row level security;

drop policy if exists "Anyone can read colleges" on colleges;
create policy "Anyone can read colleges" on colleges
  for select using (true);

drop policy if exists "Own profile: read" on profiles;
drop policy if exists "Own profile: insert" on profiles;
drop policy if exists "Own profile: update" on profiles;
create policy "Own profile: read"   on profiles for select using ((select auth.uid()) = id);
create policy "Own profile: insert" on profiles for insert with check ((select auth.uid()) = id);
create policy "Own profile: update" on profiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Own saved colleges" on saved_colleges;
create policy "Own saved colleges" on saved_colleges for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Own roadmap progress" on roadmap_progress;
create policy "Own roadmap progress" on roadmap_progress for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Own counselor chats" on counselor_chats;
create policy "Own counselor chats" on counselor_chats for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- =====================================================================
-- AUTO-CREATE A PROFILE ROW WHEN A STUDENT SIGNS UP
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- SEED DATA: 10 prototype colleges (NOT verified real-world data)
-- =====================================================================
insert into colleges (id, name, city, state, type, courses, description, facilities, tags) values
('iit-hyderabad', 'IIT Hyderabad', 'Hyderabad', 'Telangana', 'Public institute', array['Computer Science', 'Artificial Intelligence', 'Electrical Engineering'], 'A prototype profile for a technology-focused institute with a strong research and engineering identity.', array['Research labs', 'Innovation hub', 'Hostel support'], array['AI & ML', 'Research', 'Engineering']),
('nit-warangal', 'NIT Warangal', 'Warangal', 'Telangana', 'Public institute', array['Computer Science', 'Electronics', 'Mechanical Engineering'], 'A prototype profile for a nationally recognised engineering campus with a broad technical community.', array['Technical clubs', 'Central library', 'Campus housing'], array['Software', 'Core engineering', 'Campus life']),
('iiit-hyderabad', 'IIIT Hyderabad', 'Hyderabad', 'Telangana', 'Private institute', array['Computer Science', 'AI & Machine Learning', 'Computational Linguistics'], 'A prototype profile for a research-led computing institute built around focused technical learning.', array['AI labs', 'Research groups', 'Student residences'], array['Computing', 'Research', 'AI & ML']),
('srm-ap', 'SRM University AP', 'Amaravati', 'Andhra Pradesh', 'Private university', array['Computer Science', 'Electronics', 'Business Analytics'], 'A prototype profile for a modern multidisciplinary university with technology and entrepreneurship pathways.', array['Makerspace', 'Startup centre', 'Sports complex'], array['Innovation', 'Technology', 'Business']),
('vit-vellore', 'VIT Vellore', 'Vellore', 'Tamil Nadu', 'Private university', array['Software Engineering', 'Data Science', 'Cybersecurity'], 'A prototype profile for a large engineering university with a diverse catalogue of technology courses.', array['Tech parks', 'Libraries', 'Student clubs'], array['Software', 'Data science', 'Cybersecurity']),
('bits-pilani', 'BITS Pilani', 'Pilani', 'Rajasthan', 'Private institute', array['Computer Science', 'Mathematics', 'Electronics'], 'A prototype profile for an interdisciplinary institute known for flexible learning and technical communities.', array['Innovation labs', 'Libraries', 'Student communities'], array['Interdisciplinary', 'Technology', 'Research']),
('iit-bhubaneswar', 'IIT Bhubaneswar', 'Bhubaneswar', 'Odisha', 'Public institute', array['Computer Science', 'Electrical Engineering', 'Data Science'], 'A prototype profile for an engineering institute with technology, science, and research pathways.', array['Labs', 'Learning commons', 'Hostel support'], array['Engineering', 'Data science', 'Research']),
('manipal-institute', 'Manipal Institute of Technology', 'Manipal', 'Karnataka', 'Private institute', array['Information Technology', 'Robotics', 'Electronics'], 'A prototype profile for a technology campus with project-based communities and interdisciplinary options.', array['Robotics lab', 'Design studio', 'Campus services'], array['Robotics', 'Electronics', 'Projects']),
('anna-university', 'Anna University', 'Chennai', 'Tamil Nadu', 'Public university', array['Computer Science', 'Information Technology', 'Civil Engineering'], 'A prototype profile for a public university with a wide engineering and applied sciences ecosystem.', array['Departments', 'Libraries', 'Technical societies'], array['Public', 'Engineering', 'Software']),
('pes-university', 'PES University', 'Bengaluru', 'Karnataka', 'Private university', array['Computer Science', 'Product Design', 'Electrical Engineering'], 'A prototype profile for a Bengaluru-based university with technology, design, and entrepreneurship interests.', array['Design labs', 'Incubation centre', 'Student clubs'], array['Product', 'Design', 'Software'])
on conflict (id) do nothing;
