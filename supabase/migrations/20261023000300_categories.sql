create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  color_slot smallint not null default 1 check (color_slot between 1 and 8),
  aliases text[] not null default '{}' check (cardinality(aliases) <= 20),
  sort_order text collate "C" not null,
  important_by_default boolean not null default false,
  urgency_days smallint check (urgency_days between 0 and 60),
  max_in_progress smallint check (max_in_progress between 1 and 20),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index categories_user_name_active_key
  on public.categories (user_id, lower(name))
  where archived_at is null;
create index categories_user_sort_idx on public.categories (user_id, sort_order);

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  category_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  aliases text[] not null default '{}' check (cardinality(aliases) <= 20),
  sort_order text collate "C" not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (id, category_id),
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete cascade
);

create unique index subcategories_category_name_active_key
  on public.subcategories (category_id, lower(name))
  where archived_at is null;
create index subcategories_category_user_idx on public.subcategories (category_id, user_id);
create index subcategories_user_sort_idx on public.subcategories (user_id, sort_order);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function private.set_updated_at();

create trigger subcategories_set_updated_at
  before update on public.subcategories
  for each row execute function private.set_updated_at();

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;

create policy categories_select_own on public.categories
  for select to authenticated using (user_id = (select auth.uid()));
create policy categories_insert_own on public.categories
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy categories_update_own on public.categories
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy categories_delete_own on public.categories
  for delete to authenticated using (user_id = (select auth.uid()));

create policy subcategories_select_own on public.subcategories
  for select to authenticated using (user_id = (select auth.uid()));
create policy subcategories_insert_own on public.subcategories
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy subcategories_update_own on public.subcategories
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy subcategories_delete_own on public.subcategories
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on public.categories, public.subcategories from anon, authenticated;
grant select, insert, update, delete on public.categories, public.subcategories to authenticated;
