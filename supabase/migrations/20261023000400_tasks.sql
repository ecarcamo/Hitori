create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category_id uuid,
  subcategory_id uuid,
  title text not null check (char_length(btrim(title)) between 1 and 300),
  notes text check (char_length(notes) <= 10000),
  status public.task_status not null default 'todo',
  is_important boolean not null default false,
  due_at timestamptz,
  planned_start timestamptz,
  planned_end timestamptz,
  duration_min smallint check (duration_min between 1 and 1440),
  context public.task_context,
  energy public.energy_level,
  blocked_by text check (char_length(blocked_by) <= 300),
  sort_order text collate "C" not null,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (category_id, user_id)
    references public.categories (id, user_id) on delete set null (category_id),
  foreign key (subcategory_id, user_id)
    references public.subcategories (id, user_id) on delete set null (subcategory_id),
  foreign key (subcategory_id, category_id) references public.subcategories (id, category_id),
  constraint tasks_planned_range
    check (planned_start is null or planned_end is null or planned_end > planned_start),
  constraint tasks_completion_matches_status
    check ((status = 'done') = (completed_at is not null))
);

create index tasks_user_status_sort_idx on public.tasks (user_id, status, sort_order);
create index tasks_user_due_open_idx on public.tasks (user_id, due_at) where completed_at is null;
create index tasks_category_user_idx on public.tasks (category_id, user_id);
create index tasks_subcategory_user_idx on public.tasks (subcategory_id, user_id);
create index tasks_subcategory_category_idx on public.tasks (subcategory_id, category_id);

create function private.sync_task_completion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'done' then
    new.completed_at := null;
  elsif tg_op = 'UPDATE' and old.status = 'done' then
    new.completed_at := old.completed_at;
  else
    new.completed_at := now();
  end if;
  return new;
end;
$$;

create trigger tasks_sync_completion
  before insert or update of status, completed_at on public.tasks
  for each row execute function private.sync_task_completion();

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function private.set_updated_at();

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  task_id uuid not null,
  label text not null check (char_length(btrim(label)) between 1 and 300),
  is_done boolean not null default false,
  sort_order text collate "C" not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade
);

create index checklist_items_task_user_idx on public.checklist_items (task_id, user_id);
create index checklist_items_user_idx on public.checklist_items (user_id);

create trigger checklist_items_set_updated_at
  before update on public.checklist_items
  for each row execute function private.set_updated_at();

create table public.recurrence_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  task_id uuid not null unique,
  rrule text not null check (char_length(rrule) <= 500 and rrule ~ '^(RRULE:)?FREQ='),
  next_occurrence timestamptz,
  creates_blocks boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade
);

create index recurrence_rules_task_user_idx on public.recurrence_rules (task_id, user_id);
create index recurrence_rules_user_next_idx on public.recurrence_rules (user_id, next_occurrence);

create trigger recurrence_rules_set_updated_at
  before update on public.recurrence_rules
  for each row execute function private.set_updated_at();

alter table public.tasks enable row level security;
alter table public.checklist_items enable row level security;
alter table public.recurrence_rules enable row level security;

create policy tasks_select_own on public.tasks
  for select to authenticated using (user_id = (select auth.uid()));
create policy tasks_insert_own on public.tasks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy tasks_update_own on public.tasks
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy tasks_delete_own on public.tasks
  for delete to authenticated using (user_id = (select auth.uid()));

create policy checklist_items_select_own on public.checklist_items
  for select to authenticated using (user_id = (select auth.uid()));
create policy checklist_items_insert_own on public.checklist_items
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy checklist_items_update_own on public.checklist_items
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy checklist_items_delete_own on public.checklist_items
  for delete to authenticated using (user_id = (select auth.uid()));

create policy recurrence_rules_select_own on public.recurrence_rules
  for select to authenticated using (user_id = (select auth.uid()));
create policy recurrence_rules_insert_own on public.recurrence_rules
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy recurrence_rules_update_own on public.recurrence_rules
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy recurrence_rules_delete_own on public.recurrence_rules
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on public.tasks, public.checklist_items, public.recurrence_rules from anon, authenticated;
grant select, insert, update, delete
  on public.tasks, public.checklist_items, public.recurrence_rules
  to authenticated;
