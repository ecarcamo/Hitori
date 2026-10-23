begin;
select plan(13);

insert into auth.users (instance_id, id, aud, role, email)
values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'ana@hitori.test'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'beto@hitori.test');

select is(
  (select count(*)::int from public.profiles where id in ('aaaaaaaa-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000002')),
  2,
  'signing up creates one profile per user'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "aaaaaaaa-0000-4000-8000-000000000001", "role": "authenticated"}', true);

insert into public.categories (id, name, sort_order)
values ('aaaaaaaa-0000-4000-8000-0000000000c1', 'U', 'a0');
insert into public.subcategories (id, category_id, name, sort_order)
values ('aaaaaaaa-0000-4000-8000-0000000000d1', 'aaaaaaaa-0000-4000-8000-0000000000c1', 'Cursos', 'a0');
insert into public.tasks (id, category_id, subcategory_id, title, sort_order)
values ('aaaaaaaa-0000-4000-8000-0000000000e1', 'aaaaaaaa-0000-4000-8000-0000000000c1', 'aaaaaaaa-0000-4000-8000-0000000000d1', 'Entregar tarea', 'a0');
insert into public.checklist_items (task_id, label, sort_order)
values ('aaaaaaaa-0000-4000-8000-0000000000e1', 'Revisar rúbrica', 'a0');

select is(
  (select user_id from public.tasks where id = 'aaaaaaaa-0000-4000-8000-0000000000e1'),
  'aaaaaaaa-0000-4000-8000-000000000001'::uuid,
  'user_id defaults to the caller'
);

select set_config('request.jwt.claims', '{"sub": "bbbbbbbb-0000-4000-8000-000000000002", "role": "authenticated"}', true);

select is_empty($$ select id from public.tasks $$, 'another user cannot read the tasks');
select is_empty($$ select id from public.categories $$, 'another user cannot read the categories');
select is_empty($$ select id from public.checklist_items $$, 'another user cannot read the checklist');
select is_empty($$ select id from public.profiles where id = 'aaaaaaaa-0000-4000-8000-000000000001' $$, 'another user cannot read the profile');

update public.tasks set title = 'cambiado por otro' where id = 'aaaaaaaa-0000-4000-8000-0000000000e1';
delete from public.categories where id = 'aaaaaaaa-0000-4000-8000-0000000000c1';

select throws_ok(
  $$ insert into public.tasks (user_id, title, sort_order) values ('aaaaaaaa-0000-4000-8000-000000000001', 'suplantar', 'a0') $$,
  '42501',
  null,
  'nobody can create rows for someone else'
);

select throws_ok(
  $$ insert into public.tasks (category_id, title, sort_order) values ('aaaaaaaa-0000-4000-8000-0000000000c1', 'colarse', 'a0') $$,
  '23503',
  null,
  'a task cannot point to a category of another user'
);

select throws_ok(
  $$ insert into public.checklist_items (task_id, label, sort_order) values ('aaaaaaaa-0000-4000-8000-0000000000e1', 'colarse', 'a0') $$,
  '23503',
  null,
  'a checklist item cannot point to a task of another user'
);

select set_config('request.jwt.claims', '{"sub": "aaaaaaaa-0000-4000-8000-000000000001", "role": "authenticated"}', true);

select is(
  (select title from public.tasks where id = 'aaaaaaaa-0000-4000-8000-0000000000e1'),
  'Entregar tarea',
  'updates from another user do not reach the task'
);

select isnt_empty(
  $$ select id from public.categories where id = 'aaaaaaaa-0000-4000-8000-0000000000c1' $$,
  'deletes from another user do not reach the category'
);

insert into public.categories (id, name, sort_order)
values ('aaaaaaaa-0000-4000-8000-0000000000c2', 'Trabajo', 'a1');

select throws_ok(
  $$ update public.tasks set category_id = 'aaaaaaaa-0000-4000-8000-0000000000c2' where id = 'aaaaaaaa-0000-4000-8000-0000000000e1' $$,
  '23503',
  null,
  'a task subcategory must belong to its category'
);

reset role;
set local role anon;

select throws_ok(
  $$ select id from public.tasks $$,
  '42501',
  null,
  'anonymous visitors cannot read tasks'
);

select * from finish();
rollback;
