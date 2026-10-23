begin;
select plan(7);

insert into auth.users (instance_id, id, aud, role, email)
values ('00000000-0000-0000-0000-000000000000', 'cccccccc-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'carla@hitori.test');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "cccccccc-0000-4000-8000-000000000003", "role": "authenticated"}', true);

insert into public.tasks (id, title, sort_order)
values ('cccccccc-0000-4000-8000-0000000000e1', 'Solo con título', 'a0');

select is(
  (select status::text from public.tasks where id = 'cccccccc-0000-4000-8000-0000000000e1'),
  'todo',
  'a task needs only a title and starts in todo'
);

update public.tasks set status = 'done' where id = 'cccccccc-0000-4000-8000-0000000000e1';
select isnt(
  (select completed_at from public.tasks where id = 'cccccccc-0000-4000-8000-0000000000e1'),
  null,
  'moving to done stamps completed_at'
);

create temporary table first_completion on commit drop as
  select completed_at from public.tasks where id = 'cccccccc-0000-4000-8000-0000000000e1';

update public.tasks
set status = 'done', completed_at = '2000-01-01T00:00:00Z'
where id = 'cccccccc-0000-4000-8000-0000000000e1';
select is(
  (select completed_at from public.tasks where id = 'cccccccc-0000-4000-8000-0000000000e1'),
  (select completed_at from first_completion),
  'completed_at cannot be rewritten while the task stays done'
);

update public.tasks set status = 'in_progress' where id = 'cccccccc-0000-4000-8000-0000000000e1';
select is(
  (select completed_at from public.tasks where id = 'cccccccc-0000-4000-8000-0000000000e1'),
  null,
  'leaving done clears completed_at'
);

select throws_ok(
  $$ insert into public.tasks (title, sort_order) values ('   ', 'a1') $$,
  '23514',
  null,
  'a blank title is rejected'
);

select throws_ok(
  $$ insert into public.tasks (title, sort_order, planned_start, planned_end)
     values ('Bloque al revés', 'a1', '2026-10-23T10:00:00Z', '2026-10-23T09:00:00Z') $$,
  '23514',
  null,
  'a planned block must end after it starts'
);

insert into public.categories (id, name, sort_order)
values ('cccccccc-0000-4000-8000-0000000000c1', 'Temporal', 'a0');
insert into public.subcategories (id, category_id, name, sort_order)
values ('cccccccc-0000-4000-8000-0000000000d1', 'cccccccc-0000-4000-8000-0000000000c1', 'Sub', 'a0');
insert into public.tasks (id, category_id, subcategory_id, title, sort_order)
values ('cccccccc-0000-4000-8000-0000000000e2', 'cccccccc-0000-4000-8000-0000000000c1', 'cccccccc-0000-4000-8000-0000000000d1', 'Sobrevive', 'a2');
delete from public.categories where id = 'cccccccc-0000-4000-8000-0000000000c1';

select results_eq(
  $$ select category_id, subcategory_id from public.tasks where id = 'cccccccc-0000-4000-8000-0000000000e2' $$,
  $$ values (null::uuid, null::uuid) $$,
  'deleting a category keeps its tasks and clears their links'
);

select * from finish();
rollback;
