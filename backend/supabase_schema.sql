-- ============================================================
-- Mobile-Based Crop Disease Detection - Supabase Schema
-- Updated to match user table definitions for profiles and diagnosis_history
-- ============================================================

-- ---------- 1. Farmer profile table ----------
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key references auth.users(id) on delete cascade,
  full_name text default '',
  phone text default null,
  location text default null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---------- 2. Diagnosis History table ----------
create table if not exists public.diagnosis_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  crop_name text default null,
  disease_name text default null,
  confidence numeric default null,
  severity_stage text default null,
  image_url text default null,
  created_at timestamptz default now()
);

alter table public.diagnosis_history enable row level security;

create policy "Users can view own diagnosis history"
  on public.diagnosis_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own diagnosis history"
  on public.diagnosis_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own diagnosis history"
  on public.diagnosis_history for delete
  using (auth.uid() = user_id);

-- ---------- 3. Crop registry (static reference data) ----------
create table if not exists public.crops (
  id serial primary key,
  name text not null unique,          -- e.g. 'Tomato'
  scientific_name text,
  supported_diseases text[]           -- e.g. {'Early Blight','Late Blight','Healthy'}
);

alter table public.crops enable row level security;

create policy "Anyone can read crops"
  on public.crops for select
  to authenticated, anon
  using (true);

-- ---------- 4. Legacy/Detailed Diagnoses (Optional alias/extended storage) ----------
create table if not exists public.diagnoses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid() references auth.users(id) on delete cascade not null,
  crop_id int references public.crops(id),
  image_url text not null,
  is_valid_leaf boolean not null default true,
  rejection_reason text,
  predicted_disease text,
  confidence numeric(5,2),
  severity_stage text check (severity_stage in ('G0','G1','G2','G3')),
  severity_percent numeric(5,2),
  treatment_recommendation text,
  prevention_tips text,
  created_at timestamptz default now()
);

alter table public.diagnoses enable row level security;

create policy "Users can view own diagnoses"
  on public.diagnoses for select
  using (auth.uid() = user_id);

create policy "Users can insert own diagnoses"
  on public.diagnoses for insert
  with check (auth.uid() = user_id);

-- ---------- 5. Treatment knowledge base ----------
create table if not exists public.treatment_guidelines (
  id serial primary key,
  disease_name text not null,
  severity_stage text check (severity_stage in ('G0','G1','G2','G3')) not null,
  recommendation text not null,
  prevention_tips text,
  unique(disease_name, severity_stage)
);

alter table public.treatment_guidelines enable row level security;

create policy "Anyone can read treatment guidelines"
  on public.treatment_guidelines for select
  to authenticated, anon
  using (true);

-- ---------- 6. Crop calendar / reminders ----------
create table if not exists public.reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid() references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  reminder_date timestamptz not null,
  is_recurring boolean default false,
  recurrence_interval text,
  is_completed boolean default false,
  created_at timestamptz default now()
);

alter table public.reminders enable row level security;

create policy "Users manage own reminders"
  on public.reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- 7. AI assistant chat history ----------
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid() references auth.users(id) on delete cascade not null,
  role text check (role in ('user','assistant')) not null,
  content text not null,
  related_diagnosis_id uuid references public.diagnosis_history(id),
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

create policy "Users manage own chat history"
  on public.chat_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- 8. Storage bucket for leaf images ----------
insert into storage.buckets (id, name, public)
values ('leaf-images', 'leaf-images', true)
on conflict (id) do nothing;

create policy "Users upload own images"
  on storage.objects for insert
  with check (bucket_id = 'leaf-images');

create policy "Users view own images"
  on storage.objects for select
  using (bucket_id = 'leaf-images');

-- ---------- 9. Indexes ----------
create index if not exists idx_diagnosis_history_user_created on public.diagnosis_history (user_id, created_at desc);
create index if not exists idx_profiles_id on public.profiles (id);
create index if not exists idx_reminders_user_date on public.reminders (user_id, reminder_date);
create index if not exists idx_chat_messages_user_created on public.chat_messages (user_id, created_at);
