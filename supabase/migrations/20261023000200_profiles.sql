create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  timezone text not null default 'UTC',
  locale text not null default 'es' check (char_length(locale) between 2 and 10),
  max_in_progress smallint not null default 3 check (max_in_progress between 1 and 20),
  urgency_days smallint not null default 3 check (urgency_days between 0 and 60),
  daily_digest_time time,
  theme text not null default 'templo' check (theme ~ '^[a-z0-9-]{1,32}$'),
  color_mode public.color_mode not null default 'dark',
  custom_theme jsonb check (custom_theme is null or jsonb_typeof(custom_theme) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function private.validate_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'invalid timezone: %', new.timezone using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger profiles_validate_timezone
  before insert or update of timezone on public.profiles
  for each row execute function private.validate_timezone();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 80)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (
  display_name,
  timezone,
  locale,
  max_in_progress,
  urgency_days,
  daily_digest_time,
  theme,
  color_mode,
  custom_theme
) on public.profiles to authenticated;
