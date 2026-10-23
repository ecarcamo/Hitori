begin;
select plan(4);

insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-000000000000',
  'dddddddd-0000-4000-8000-000000000004',
  'authenticated',
  'authenticated',
  'dani@hitori.test',
  '{"full_name": "Dani"}'
);

select is(
  (select display_name from public.profiles where id = 'dddddddd-0000-4000-8000-000000000004'),
  'Dani',
  'the profile takes the name from the sign-up metadata'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "dddddddd-0000-4000-8000-000000000004", "role": "authenticated"}', true);

select lives_ok(
  $$ update public.profiles set timezone = 'America/Guatemala' where id = 'dddddddd-0000-4000-8000-000000000004' $$,
  'a valid IANA timezone is accepted'
);

select throws_ok(
  $$ update public.profiles set timezone = 'Marte/Olympus' where id = 'dddddddd-0000-4000-8000-000000000004' $$,
  '22023',
  null,
  'an unknown timezone is rejected'
);

select throws_ok(
  $$ update public.profiles set id = gen_random_uuid() where id = 'dddddddd-0000-4000-8000-000000000004' $$,
  '42501',
  null,
  'the profile id cannot be changed'
);

select * from finish();
rollback;
