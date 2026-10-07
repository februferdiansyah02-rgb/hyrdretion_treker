-- ============================================================
-- Hydration Tracker - Supabase schema
-- Jalankan file ini di: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================

-- 1. Tabel public.profiles ------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text        not null default '',
  email      text        not null default '',
  age        integer,
  gender     text        not null default 'Other',
  photo      text,          -- base64 (hasil resize 400px)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Fungsi sinkronisasi auth.users -> public.profiles ---------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email      = excluded.email,
        full_name  = excluded.full_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Auto-update updated_at -----------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 4. Row Level Security ---------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Insert dilakukan oleh trigger (security definer), jadi client
-- tidak perlu insert policy.

-- 5. Realtime supaya perubahan profile ter-update live ---------
alter publication supabase_realtime add table public.profiles;
