-- 公開URLはGear本体と分離し、非公開化時に共有行を削除する。
-- 再公開は新しい行になるため、以前の共有URLは復活しない。
create table public.gear_shares (
  share_id uuid primary key default gen_random_uuid(),
  gear_id uuid not null unique
    references public.gears (id)
    on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.gear_shares enable row level security;

-- 未ログインの利用者はData APIから共有情報やGear本体を直接読めない。
-- 公開ページは、サーバー専用クライアントを通して必要な項目だけを返す。
revoke all on table public.gear_shares from anon, authenticated, service_role;

-- 2026年以降のSupabaseでは新規テーブルがData APIへ自動公開されない
-- 構成があるため、所有者が必要とする操作だけを明示する。
grant select, insert, delete
  on table public.gear_shares
  to authenticated;

grant select
  on table public.gear_shares
  to service_role;

-- 公開ページのサーバー処理は、共有IDと結び付くGearを取得する。
-- Secret key以外のクライアントには既存RLSが引き続き適用される。
grant select
  on table public.gears
  to service_role;

create policy "Users can select shares for their own gears"
  on public.gear_shares
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.gears
      where gears.id = gear_shares.gear_id
        and gears.user_id = (select auth.uid())
    )
  );

create policy "Users can publish their own gears"
  on public.gear_shares
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.gears
      where gears.id = gear_shares.gear_id
        and gears.user_id = (select auth.uid())
    )
  );

create policy "Users can unpublish their own gears"
  on public.gear_shares
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.gears
      where gears.id = gear_shares.gear_id
        and gears.user_id = (select auth.uid())
    )
  );
