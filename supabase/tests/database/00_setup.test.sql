begin;
select plan(3);

select has_extension('pgtap', 'pgTAP is available');

select is(
  (
    select count(*)::int
    from pg_catalog.pg_class
    where relnamespace = 'public'::regnamespace
      and relkind = 'r'
      and not relrowsecurity
  ),
  0,
  'every public table has row level security enabled'
);

select is(
  (
    select count(*)::int
    from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'
  ),
  0,
  'anon has no privileges on public tables'
);

select * from finish();
rollback;
