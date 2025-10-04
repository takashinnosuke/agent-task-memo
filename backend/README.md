# Backend Overview

このディレクトリでは、FastAPI をベースとした API サーバーを実装します。まだコードは存在しませんが、以下の方針で進めてください。

## 設計方針
- **レイヤードアーキテクチャ**: `api`, `services`, `repositories`, `schemas` といった階層で責務を分割します。
- **型安全性**: Pydantic / SQLModel によるスキーマ定義を徹底し、`mypy` で型検査を行います。
- **依存関係注入**: FastAPI の Depends を活用し、テスト容易性とモジュール性を高めます。

## TODO
- [ ] API エンドポイントのスケルトン作成
- [ ] データモデル（タスク、メモ、エージェント、ワークスペース）の定義
- [ ] テスト基盤（pytest, httpx）とサンプルテストの追加
- [ ] Docker Compose でのローカル起動手順を整備
