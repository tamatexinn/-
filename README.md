# 電波祭 Cashier

簡単に使える祭り向けのレジアプリです。会計、在庫管理、購入履歴を分けて管理できます。

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

## Cloudflare Tunnel で公開する

ローカルの開発サーバーを外部公開したい場合は、Cloudflare Tunnel を使います。

```bash
npm run dev
cloudflared tunnel --url http://localhost:3000
```

表示された URL をブラウザで開けば、外部公開された状態で確認できます。

## GitHub で公開する

このアプリは Next.js なので、GitHub をベースに公開する場合は、
Vercel または Cloudflare Pages にデプロイする構成が簡単です。

### 例: Vercel

1. GitHub にこのリポジトリを push
2. Vercel で GitHub リポジトリを接続
3. `next build` を自動で実行
4. 公開 URL を取得

### 例: Cloudflare Pages

1. GitHub に push
2. Cloudflare Pages でプロジェクトを作成
3. Framework preset を Next.js に設定
4. デプロイ

## 補足

- 本番公開用のビルドは `npm run build`
- ローカル確認は `npm run dev`
- `output: "standalone"` を設定して、軽いホスティングにも対応しています
