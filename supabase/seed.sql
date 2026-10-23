insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'dev@hitori.test',
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Esteban"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
values (
  gen_random_uuid(),
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  '{"sub": "00000000-0000-4000-8000-000000000001", "email": "dev@hitori.test", "email_verified": true}',
  'email',
  now(),
  now()
);

update public.profiles
set timezone = 'America/Guatemala', onboarded_at = now()
where id = '00000000-0000-4000-8000-000000000001';

insert into public.categories (id, user_id, name, color_slot, aliases, sort_order, important_by_default)
values
  ('00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000001', 'U', 1, '{uvg,u}', 'a0', true),
  ('00000000-0000-4000-8000-0000000000c2', '00000000-0000-4000-8000-000000000001', 'Trabajo', 2, '{sento,trabajo}', 'a1', true),
  ('00000000-0000-4000-8000-0000000000c3', '00000000-0000-4000-8000-000000000001', 'Internship', 3, '{htec,intern}', 'a2', true),
  ('00000000-0000-4000-8000-0000000000c4', '00000000-0000-4000-8000-000000000001', 'Personal', 4, '{}', 'a3', false);

insert into public.subcategories (id, user_id, category_id, name, aliases, sort_order)
values
  ('00000000-0000-4000-8000-0000000000d1', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c1', 'Cursos', '{ingsoft,so}', 'a0'),
  ('00000000-0000-4000-8000-0000000000d2', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c1', 'Auxiliaturas', '{iot,aux}', 'a1'),
  ('00000000-0000-4000-8000-0000000000d3', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c2', 'Administrativo', '{}', 'a0'),
  ('00000000-0000-4000-8000-0000000000d4', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c2', 'Código', '{}', 'a1'),
  ('00000000-0000-4000-8000-0000000000d5', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c3', 'Administrativo', '{}', 'a0'),
  ('00000000-0000-4000-8000-0000000000d6', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c3', 'Código', '{}', 'a1');

insert into public.tasks (
  user_id, category_id, subcategory_id, title, status, is_important, due_at, duration_min, context, energy, blocked_by, sort_order
) values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000d2', 'Publicar notas del Lab 4', 'todo', true, now() - interval '2 days', 20, 'computer', 'low', null, 'a0'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000d1', 'Entregar Tarea 6', 'todo', true, now() + interval '5 days', 90, 'computer', 'high', null, 'a1'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000d2', 'Calificar entregas del Lab 5', 'in_progress', true, now() + interval '6 hours', 90, 'computer', 'high', null, 'a0'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-0000000000d1', 'Estudiar parcial 2', 'done', true, null, null, null, null, null, 'a0'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c2', '00000000-0000-4000-8000-0000000000d4', 'Afinar flujo del agente de voz', 'todo', true, now() + interval '9 days', 120, 'computer', 'high', null, 'a0'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c2', '00000000-0000-4000-8000-0000000000d3', 'Llenar hoja de horas', 'todo', false, now() + interval '8 hours', 10, 'computer', 'low', null, 'a1'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c2', '00000000-0000-4000-8000-0000000000d4', 'Revisar PR de la integración', 'in_progress', true, now() - interval '1 day', 45, 'computer', 'high', null, 'a1'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c2', '00000000-0000-4000-8000-0000000000d4', 'Desplegar a staging', 'waiting', true, null, 30, 'computer', null, 'Acceso de DevOps', 'a0'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c3', '00000000-0000-4000-8000-0000000000d6', 'Leer datasheet del microcontrolador', 'todo', true, now() + interval '7 days', 60, 'computer', 'high', null, 'a0'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c3', '00000000-0000-4000-8000-0000000000d5', 'Firmar convenio de práctica', 'waiting', true, null, null, null, null, 'Recursos Humanos', 'a0'),
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000c4', null, 'Renovar licencia', 'todo', false, now() + interval '20 days', 60, 'errands', 'low', null, 'a0'),
  ('00000000-0000-4000-8000-000000000001', null, null, 'Idea: app de recetas', 'todo', false, null, null, null, null, null, 'a0');
