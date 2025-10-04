# エージェント業務設計メモ

エージェント業務の自動化アイデアを素早く記録し、詳細設計・集計・可視化までをワンストップで行う Next.js + TypeScript 製のメモアプリです。開発環境では SQLite、デプロイ時は Vercel Postgres を利用する構成になっています。

## 主な機能

- **クイックメモ**: 日付自動入力、Enter/Ctrl+S 保存、画面遷移なしで連続入力。
- **タスク詳細フォーム**: 優先度ごとに 22 項目を段階的に入力できるウィザード。
- **タスク一覧**: 検索・フィルタ（自動化可能性/優先度/担当者/日付）・ソート・CSV/Excel エクスポート。
- **集計ダッシュボード**: 自動化率、優先度・機密性の分布、目標完了時間の平均、週次/月次の推移グラフを表示。
- **依存関係可視化**: Mermaid 形式でタスク間の依存関係とクリティカルパスを可視化。

## 技術スタック

- **フロントエンド**: Next.js (App Router) / React / TypeScript / Tailwind CSS / SWR / Chart.js / Mermaid
- **バックエンド**: Next.js API Routes
- **データベース**: SQLite（ローカル開発） / Vercel Postgres（本番）

## フォルダ構成

```
├─ src/
│  ├─ app/                # App Router（ページ・API ルート）
│  │  ├─ api/             # REST API エンドポイント
│  │  ├─ globals.css      # グローバルスタイル
│  │  └─ page.tsx         # メイン画面
│  ├─ components/         # フロントエンド UI コンポーネント
│  ├─ lib/                # DB アクセス・フェッチヘルパー
│  ├─ types/              # 共有型定義
│  └─ utils/              # バリデーション等のユーティリティ
├─ dev.db                 # （初回起動時に生成される）SQLite DB ファイル
├─ next.config.ts         # Next.js 設定（better-sqlite3 の扱いを指定）
└─ README.md              # 本ドキュメント
```

## セットアップ & 開発手順

1. 依存関係をインストールします。
   ```bash
   npm install
   ```
2. 開発サーバーを起動します。
   ```bash
   npm run dev
   ```
3. ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

初回起動時に `dev.db` が作成され、必要なテーブルが自動でマイグレーションされます。リセットしたい場合は `dev.db` を削除してください。

### コード品質チェック

```bash
npm run lint
```

## 環境変数

| 変数名 | 用途 | 備考 |
| ------ | ---- | ---- |
| `SQLITE_DB_PATH` | ローカル開発時に使用する SQLite ファイルパス | 省略時は `dev.db` |
| `DATABASE_URL` / `POSTGRES_URL` | Vercel Postgres 接続文字列 | 設定されている場合は Postgres を使用 |
| `FORCE_SQLITE` | `true` を設定すると Postgres 環境でも SQLite を強制使用 | デバッグ用途 |

## Vercel へのデプロイ手順

1. Vercel 上でプロジェクトを作成し、このリポジトリを連携します。
2. Vercel Postgres を有効化し、`DATABASE_URL`（または `POSTGRES_URL`）をプロジェクトの環境変数に設定します。
3. ビルドコマンドはデフォルト（`npm run build`）で動作します。サーバーレス環境で `better-sqlite3` をバンドルしないよう、`next.config.ts` の設定で外部パッケージとして扱っています。
4. デプロイ後は API Routes 実行時に自動でテーブルが作成されます。

## よくある操作

- **クイックメモ**: タスク名とメモを入力 → Enter で即保存。
- **タスク登録**: フォームを順に進め、最終ステップで保存。依存タスクは複数選択可能。
- **エクスポート**: タスク一覧右上のリンクから CSV / Excel をダウンロード。
- **依存関係図の保存**: 「Mermaidをダウンロード」ボタンから `.mmd` ファイルを取得し、Mermaid 対応ツールで閲覧可能。

## ライセンス

MIT
