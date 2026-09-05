begin;

create extension if not exists pgtap with schema extensions;
select plan(16);

select has_table('public', 'gear_shares', 'gear_sharesテーブルが存在する');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.gear_shares'::regclass),
  'gear_sharesでRLSが有効'
);
select ok(
  not has_table_privilege('anon', 'public.gear_shares', 'select'),
  'anonにSELECT権限がない'
);
select ok(
  not has_table_privilege('authenticated', 'public.gear_shares', 'update'),
  'authenticatedにUPDATE権限がない'
);
select ok(
  has_table_privilege('service_role', 'public.gear_shares', 'select'),
  '公開ページ用のservice_roleは共有行を参照できる'
);
select ok(
  not has_table_privilege('service_role', 'public.gear_shares', 'insert, update, delete'),
  '公開ページ用のservice_roleは共有行を変更できない'
);
select ok(
  has_table_privilege('service_role', 'public.gears', 'select'),
  '公開ページ用のservice_roleはGearを参照できる'
);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'share-owner@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'other-owner@example.com');

insert into public.gears (id, user_id, name)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', '公開済み'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', '未公開'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '22222222-2222-4222-8222-222222222222', '他人のGear');

insert into public.gear_shares (share_id, gear_id)
values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select results_eq(
  'select count(*) from public.gear_shares',
  array[1::bigint],
  '所有者は自分の共有行だけ参照できる'
);
select lives_ok(
  $$insert into public.gear_shares (gear_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2')$$,
  '所有者は自分のGearを公開できる'
);
select throws_ok(
  $$insert into public.gear_shares (gear_id) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1')$$,
  '42501',
  'new row violates row-level security policy for table "gear_shares"',
  '他人のGearは公開できない'
);
select results_eq(
  $$delete from public.gear_shares where gear_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1' returning share_id$$,
  $$values (null::uuid) limit 0$$,
  '他人の共有行は削除できない'
);
select lives_ok(
  $$delete from public.gear_shares where gear_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'$$,
  '所有者は自分のGearを非公開にできる'
);

reset role;

select throws_ok(
  $$insert into public.gear_shares (gear_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2')$$,
  '23505',
  null,
  '同じGearに共有行を重複作成できない'
);

delete from public.gears
where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';

select is(
  (select count(*) from public.gear_shares where share_id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1'),
  0::bigint,
  'Gear削除時に共有行も削除される'
);

insert into public.gear_shares (gear_id)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1');

select isnt(
  (select share_id from public.gear_shares where gear_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  'cccccccc-cccc-4ccc-8ccc-ccccccccccc1'::uuid,
  '再公開時は以前とは異なる共有IDになる'
);

set local role anon;
select throws_ok(
  $$select * from public.gear_shares$$,
  '42501',
  'permission denied for table gear_shares',
  'anonは共有テーブルを直接参照できない'
);

select * from finish();
rollback;
