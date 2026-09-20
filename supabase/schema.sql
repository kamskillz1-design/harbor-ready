-- Harbor schema (migrated from Base44 entities).
-- Run ONCE in the Supabase SQL Editor.
-- Re-running CREATE TABLE without IF NOT EXISTS will fail; drop/reset first if needed.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles  (auth.users + Base44 User + UserProfile)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('admin', 'user')),
  display_name text,
  timezone text,
  language text default 'es' check (language is null or language in ('en', 'es', 'eu')),
  goals text[] not null default '{}',
  reminder_enabled boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_display_name_len check (display_name is null or char_length(display_name) <= 80),
  constraint profiles_goals_max check (cardinality(goals) <= 5)
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- consent_records  (ConsentRecord)
-- ---------------------------------------------------------------------------
create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  policy_version text not null,
  consented_at timestamptz not null,
  withdrawn_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint consent_records_user_policy unique (user_id, policy_version)
);

drop trigger if exists consent_records_set_updated_at on public.consent_records;
create trigger consent_records_set_updated_at
  before update on public.consent_records
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- mood_check_ins  (MoodCheckIn) — one per user per local date
-- ---------------------------------------------------------------------------
create table if not exists public.mood_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_date date not null,
  checked_in_at timestamptz,
  mood_score integer not null check (mood_score between 1 and 5),
  stress_score integer not null check (stress_score between 1 and 5),
  energy_score integer not null check (energy_score between 1 and 5),
  sleep_score integer not null check (sleep_score between 1 and 5),
  emotion_tags text[] not null default '{}',
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint mood_check_ins_user_date unique (user_id, local_date),
  constraint mood_check_ins_note_len check (note is null or char_length(note) <= 1000),
  constraint mood_check_ins_tags_max check (cardinality(emotion_tags) <= 5)
);

drop trigger if exists mood_check_ins_set_updated_at on public.mood_check_ins;
create trigger mood_check_ins_set_updated_at
  before update on public.mood_check_ins
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- journal_entries  (JournalEntry)
-- ---------------------------------------------------------------------------
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  body text not null,
  prompt_type text check (prompt_type is null or prompt_type in (
    'gratitude', 'reflection', 'challenge', 'intention', 'self_compassion'
  )),
  mood_score integer check (mood_score is null or mood_score between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint journal_entries_title_len check (title is null or char_length(title) <= 160),
  constraint journal_entries_body_len check (char_length(body) <= 10000)
);

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- wellness_goals  (WellnessGoal)
-- ---------------------------------------------------------------------------
create table if not exists public.wellness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  title text not null,
  weekly_target integer check (weekly_target is null or weekly_target between 1 and 7),
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  completions_count integer not null default 0,
  week_start_date text,
  last_completion_at timestamptz,
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint wellness_goals_title_len check (char_length(title) <= 120)
);

drop trigger if exists wellness_goals_set_updated_at on public.wellness_goals;
create trigger wellness_goals_set_updated_at
  before update on public.wellness_goals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- companion_messages  (CompanionMessage)
-- ---------------------------------------------------------------------------
create table if not exists public.companion_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'companion')),
  content text,
  mode text check (mode is null or mode in ('normal', 'elevated', 'crisis')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint companion_messages_content_len check (content is null or char_length(content) <= 4000)
);

drop trigger if exists companion_messages_set_updated_at on public.companion_messages;
create trigger companion_messages_set_updated_at
  before update on public.companion_messages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- exercise_templates  (ExerciseTemplate) — public catalog
-- ---------------------------------------------------------------------------
create table if not exists public.exercise_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text,
  title_key text not null,
  description_key text,
  steps text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists exercise_templates_set_updated_at on public.exercise_templates;
create trigger exercise_templates_set_updated_at
  before update on public.exercise_templates
  for each row execute function public.set_updated_at();

insert into public.exercise_templates (slug, category, title_key, description_key, active)
values
  ('grounding-54321', 'grounding', 'exercises.grounding-54321.title', 'exercises.grounding-54321.description', true),
  ('slow-breathing', 'breathing', 'exercises.slow-breathing.title', 'exercises.slow-breathing.description', true),
  ('thought-record', 'cbt', 'exercises.thought-record.title', 'exercises.thought-record.description', true),
  ('evidence-check', 'cbt', 'exercises.evidence-check.title', 'exercises.evidence-check.description', true),
  ('small-step-planner', 'action', 'exercises.small-step-planner.title', 'exercises.small-step-planner.description', true),
  ('self-compassion', 'compassion', 'exercises.self-compassion.title', 'exercises.self-compassion.description', true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- exercise_sessions  (ExerciseSession)
-- ---------------------------------------------------------------------------
create table if not exists public.exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_slug text not null,
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  duration_seconds integer,
  reflection text,
  helpfulness_score integer check (helpfulness_score is null or helpfulness_score between 1 and 5),
  action_text text,
  action_completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint exercise_sessions_reflection_len check (reflection is null or char_length(reflection) <= 4000),
  constraint exercise_sessions_action_len check (action_text is null or char_length(action_text) <= 500)
);

drop trigger if exists exercise_sessions_set_updated_at on public.exercise_sessions;
create trigger exercise_sessions_set_updated_at
  before update on public.exercise_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- thought_records  (ThoughtRecord)
-- ---------------------------------------------------------------------------
create table if not exists public.thought_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_session_id uuid references public.exercise_sessions(id) on delete set null,
  situation text,
  automatic_thought text,
  emotions jsonb not null default '[]'::jsonb,
  evidence_for text,
  evidence_against text,
  balanced_thought text,
  action_plan text,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists thought_records_set_updated_at on public.thought_records;
create trigger thought_records_set_updated_at
  before update on public.thought_records
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.consent_records enable row level security;
alter table public.mood_check_ins enable row level security;
alter table public.journal_entries enable row level security;
alter table public.wellness_goals enable row level security;
alter table public.companion_messages enable row level security;
alter table public.exercise_templates enable row level security;
alter table public.exercise_sessions enable row level security;
alter table public.thought_records enable row level security;

-- profiles: owner read/update; insert via trigger (security definer)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

-- owner-only private tables
drop policy if exists "consent_select_own" on public.consent_records;
create policy "consent_select_own" on public.consent_records
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "consent_insert_own" on public.consent_records;
create policy "consent_insert_own" on public.consent_records
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "consent_update_own" on public.consent_records;
create policy "consent_update_own" on public.consent_records
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "checkins_select_own" on public.mood_check_ins;
create policy "checkins_select_own" on public.mood_check_ins
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "checkins_insert_own" on public.mood_check_ins;
create policy "checkins_insert_own" on public.mood_check_ins
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "checkins_update_own" on public.mood_check_ins;
create policy "checkins_update_own" on public.mood_check_ins
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
drop policy if exists "checkins_delete_own" on public.mood_check_ins;
create policy "checkins_delete_own" on public.mood_check_ins
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "journal_select_own" on public.journal_entries;
create policy "journal_select_own" on public.journal_entries
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "journal_insert_own" on public.journal_entries;
create policy "journal_insert_own" on public.journal_entries
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "journal_update_own" on public.journal_entries;
create policy "journal_update_own" on public.journal_entries
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
drop policy if exists "journal_delete_own" on public.journal_entries;
create policy "journal_delete_own" on public.journal_entries
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "goals_select_own" on public.wellness_goals;
create policy "goals_select_own" on public.wellness_goals
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "goals_insert_own" on public.wellness_goals;
create policy "goals_insert_own" on public.wellness_goals
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "goals_update_own" on public.wellness_goals;
create policy "goals_update_own" on public.wellness_goals
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
drop policy if exists "goals_delete_own" on public.wellness_goals;
create policy "goals_delete_own" on public.wellness_goals
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "companion_select_own" on public.companion_messages;
create policy "companion_select_own" on public.companion_messages
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "companion_insert_own" on public.companion_messages;
create policy "companion_insert_own" on public.companion_messages
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "companion_update_own" on public.companion_messages;
create policy "companion_update_own" on public.companion_messages
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
drop policy if exists "companion_delete_own" on public.companion_messages;
create policy "companion_delete_own" on public.companion_messages
  for delete to authenticated using (user_id = (select auth.uid()));

-- templates: public read (anon + authenticated); writes admin-only via role
drop policy if exists "templates_select_public" on public.exercise_templates;
create policy "templates_select_public" on public.exercise_templates
  for select to anon, authenticated
  using (true);

drop policy if exists "templates_write_admin" on public.exercise_templates;
create policy "templates_write_admin" on public.exercise_templates
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  ));

drop policy if exists "sessions_select_own" on public.exercise_sessions;
create policy "sessions_select_own" on public.exercise_sessions
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "sessions_insert_own" on public.exercise_sessions;
create policy "sessions_insert_own" on public.exercise_sessions
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "sessions_update_own" on public.exercise_sessions;
create policy "sessions_update_own" on public.exercise_sessions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
drop policy if exists "sessions_delete_own" on public.exercise_sessions;
create policy "sessions_delete_own" on public.exercise_sessions
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "thoughts_select_own" on public.thought_records;
create policy "thoughts_select_own" on public.thought_records
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "thoughts_insert_own" on public.thought_records;
create policy "thoughts_insert_own" on public.thought_records
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "thoughts_update_own" on public.thought_records;
create policy "thoughts_update_own" on public.thought_records
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
drop policy if exists "thoughts_delete_own" on public.thought_records;
create policy "thoughts_delete_own" on public.thought_records
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on table public.exercise_templates to anon, authenticated;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.consent_records to authenticated;
grant select, insert, update, delete on table public.mood_check_ins to authenticated;
grant select, insert, update, delete on table public.journal_entries to authenticated;
grant select, insert, update, delete on table public.wellness_goals to authenticated;
grant select, insert, update, delete on table public.companion_messages to authenticated;
grant select, insert, update, delete on table public.exercise_sessions to authenticated;
grant select, insert, update, delete on table public.thought_records to authenticated;
grant insert, update, delete on table public.exercise_templates to authenticated;

-- ---------------------------------------------------------------------------
-- Storage (optional — this app has no user uploads today)
-- Create bucket "harbor-media" in the Dashboard if you add avatars later.
--
-- Example policies (uncomment after creating the bucket):
--
-- drop policy if exists "harbor_media_public_read" on storage.objects;
-- create policy "harbor_media_public_read" on storage.objects
--   for select to anon, authenticated
--   using (bucket_id = 'harbor-media');
--
-- drop policy if exists "harbor_media_auth_upload" on storage.objects;
-- create policy "harbor_media_auth_upload" on storage.objects
--   for insert to authenticated
--   with check (bucket_id = 'harbor-media' and (select auth.uid()) is not null);
--
-- drop policy if exists "harbor_media_owner_delete" on storage.objects;
-- create policy "harbor_media_owner_delete" on storage.objects
--   for delete to authenticated
--   using (bucket_id = 'harbor-media' and owner = (select auth.uid()));
