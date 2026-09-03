-- Gearの記録を保存するテーブル
create table public.gears (
  id uuid primary key default gen_random_uuid(),

  -- auth.usersのユーザーがこのGearを所有する
  user_id uuid not null
    default auth.uid()
    references auth.users (id)
    on delete cascade,

  name text not null
    check (char_length(btrim(name)) between 1 and 200),

  bought_at date,
  bought_location text not null default '',
  comment text not null default '',
  image_path text,

  is_disposed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ユーザーごとの一覧を登録日時順に取得しやすくする
create index gears_user_id_created_at_idx
  on public.gears (user_id, created_at desc);

-- ブラウザからアクセスするテーブルなのでRLSを有効にする
alter table public.gears enable row level security;

-- 未ログインユーザーには権限を与えない
revoke all on table public.gears from anon;

-- ログインユーザーにはCRUD操作を許可する
-- 実際に操作できる行は、以下のRLSポリシーで制限する
grant select, insert, update, delete
  on table public.gears
  to authenticated;

-- 自分のGearだけ取得できる
create policy "Users can select their own gears"
  on public.gears
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 自分のGearだけ登録できる
create policy "Users can insert their own gears"
  on public.gears
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- 自分のGearだけ更新できる
create policy "Users can update their own gears"
  on public.gears
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 自分のGearだけ削除できる
create policy "Users can delete their own gears"
  on public.gears
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);