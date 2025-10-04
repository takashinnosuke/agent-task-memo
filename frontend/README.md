# Frontend Overview

ここでは TypeScript + React を用いた Web フロントエンドを実装します。情報可視化と操作性を重視し、エージェントタスクの状態を一目で把握できる UI を提供します。

## 設計方針
- **Next.js/React** を前提に、Server Components を活用した効率的なデータフェッチを検討。
- **UI コンポーネントの再利用**: Storybook を活用してデザインシステムを共有します。
- **状態管理**: タスクやメモのリアルタイム更新を見据えて、React Query もしくは Zustand を採用予定。

## TODO
- [ ] Next.js プロジェクトの初期化と ESLint/Prettier 設定
- [ ] グローバルレイアウトとナビゲーションのデザイン
- [ ] タスク一覧・詳細モジュールのワイヤーフレーム作成
- [ ] モック API との統合テスト
