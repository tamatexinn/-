# 電波祭 Cashier

簡単に使える祭り向けのレジアプリです。会計、在庫管理、購入履歴を分けて管理できます。

同じ Supabase アカウントでログインした端末間で、商品・在庫・会計履歴を共有します。

## 使い方

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## ページ構成

- `/` : 会計
- `/inventory` : 在庫管理
- `/history` : 購入履歴

## Supabase の設定

1. Supabase でプロジェクトを作成します。
2. SQL Editor で [`supabase/schema.sql`](supabase/schema.sql) の内容を一度実行します。ユーザー別 RLS と在庫・会計用 DB 関数も作成されます。
3. Authentication > URL Configuration の Site URL を `https://tamatexinn.github.io/-/` に設定し、Redirect URLs に `https://tamatexinn.github.io/-/**` と `http://localhost:3000/**` を追加します。
4. Project Settings > API から Project URL と publishable/anon key を取得します。`service_role` key は使わないでください。

## ローカル実行

`.env.example` を `.env.local` にコピーし、Supabase の Project URL と publishable/anon key を設定します。

```bash
npm install
npm run dev
```

初回はアプリでアカウントを作成します。同じメールアドレスとパスワードで別端末にログインしてください。メール確認が有効な場合は、確認メールのリンクを開いてからログインします。

## GitHub Pages で公開する

リポジトリの Settings > Secrets and variables > Actions > Variables に以下を登録します。値は公開クライアント用の URL と publishable/anon key です。DB の安全性は SQL の RLS で担保します。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`main` に push すると GitHub Actions がビルド・公開します。既存サイトへ設定を反映するには Actions の `Deploy to GitHub Pages` を再実行するか、変更を push してください。

公開 URL は `https://tamatexinn.github.io/-/` です。

## 補足

- 本番公開用のビルドは `npm run build`（出力先: `out/`）
- ローカル確認は `npm run dev`
- 商品・在庫・会計履歴は Supabase に保存され、同じアカウントでログインした端末に同期されます
- 接続値が未設定の場合は、アプリに Supabase 設定の案内が表示されます
