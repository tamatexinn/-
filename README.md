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

## GitHub Pages で公開する

`main` に push すると GitHub Actions が静的サイトをビルドして公開します。
GitHub リポジトリの Settings > Pages で Build and deployment の Source を GitHub Actions に設定してください。

公開 URL は `https://tamatexinn.github.io/-/` です。

## 補足

- 本番公開用のビルドは `npm run build`（出力先: `out/`）
- ローカル確認は `npm run dev`
- GitHub Pages は静的サイトのため、会計や在庫の変更はブラウザー内だけで保持されます
