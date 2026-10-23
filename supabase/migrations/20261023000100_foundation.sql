create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.task_status as enum ('todo', 'in_progress', 'waiting', 'done');
create type public.task_context as enum ('home', 'computer', 'campus', 'office', 'errands');
create type public.energy_level as enum ('low', 'high');
create type public.color_mode as enum ('light', 'dark', 'system');

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
