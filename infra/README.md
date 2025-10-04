# Infrastructure Overview

インフラストラクチャ関連の設定やスクリプトを管理します。Docker をベースとしたローカル環境と、クラウド環境へのデプロイを視野に入れて設計してください。

## 設計方針
- **Docker Compose**: バックエンド・フロントエンド・DB をまとめて起動できるようにする。
- **GitHub Actions**: Lint、テスト、コンテナビルドを自動化するワークフローを整備。
- **IaC (Infrastructure as Code)**: 将来的に Terraform などで本番環境をコード管理。

## TODO
- [ ] Dockerfile / docker-compose.yml の雛形を追加
- [ ] GitHub Actions ワークフローのドラフト作成
- [ ] 環境変数の管理方針（例: direnv, dotenv）の文書化
- [ ] IaC 採用候補の調査メモを docs/ に追加
