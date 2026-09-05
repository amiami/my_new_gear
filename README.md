# 僕のMyNewGear...

- マイニューギアを簡単に登録して、Xにも呟ける、後から簡単に見返せるアプリです。
  

## My new gearって？

- SNSで新しいガジェットを買った時に、よく呟かれる単語です。「My New Gear...」単体で呟かれることが多く、写真がついています。ガジェットを買ったことをドヤる意味合い等承認欲求を満たすような割合が多いと言われています。
  

- 何かを買った時、My New Gearした！でも後から見返す。他の人の呟きがいっぱい出てくる。自分のだけ見たい。ハッシュタグでもできるけど、それも完璧ではないし…ということで簡単に登録、呟き、見返しができるアプリを作りました。

## 開発環境

Node.js 22と、Supabase CLIを利用できる環境が必要です。

`.env.local` に次の値を設定します。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=SupabaseプロジェクトのURL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SupabaseのPublishable key
SUPABASE_SECRET_KEY=SupabaseのSecret key
```

`SUPABASE_SECRET_KEY` は公開ページから公開中のガジェットだけを取得するために、
サーバー上でのみ使用します。`NEXT_PUBLIC_` を付けたり、ブラウザへ渡したりしないでください。

依存パッケージをインストールし、開発サーバーを起動します。

```sh
npm install
npm run dev
```

開発サーバーは `http://localhost:3001` で起動します。

## Supabase

ローカル環境を起動し、マイグレーションを適用します。

```sh
npx supabase start
npx supabase migration up --local
```

本番プロジェクトへ反映するときは、対象プロジェクトへのリンクを確認してから適用します。

```sh
npx supabase migration list
npx supabase db push
```

ガジェットの元画像は非公開の `gear-images` バケットに保存されます。画像はユーザーIDごとのフォルダに分離され、所有者だけが期限付きURLで閲覧できます。対応形式はJPEG、PNG、WebP、GIFで、上限は10MBです。

公開したガジェットは `/gadgets/{share_id}` で個別に閲覧できます。公開画像も
公開状態を毎回確認するサーバー経路から配信され、Storageバケット自体は非公開のままです。
公開を解除して再公開すると、新しい共有URLが発行されます。

以前のlocalStorageに保存されたデータは自動移行されません。必要な記録はログイン後に手動で再登録してください。
