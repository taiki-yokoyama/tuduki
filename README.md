# Tuduki

React + Laravel API + MySQL の開発環境です。Docker Compose だけで起動できます。

## 起動

```bash
cp .env.example .env
docker compose up --build
```

起動後の URL:

- フロントエンド: http://localhost:5173
- Laravel API: http://localhost:8081/api/health
- MySQL: localhost:3306
- OpenAPI 定義: [docs/openapi.yaml](docs/openapi.yaml)
- ユビキタス言語: [docs/ユビキタス.md](docs/ユビキタス.md)

初回起動時は Laravel の依存関係をイメージにインストールし、MySQL が healthy になってからマイグレーションを実行します。

## よく使うコマンド

```bash
docker compose logs -f
docker compose exec backend php artisan migrate
docker compose exec backend php artisan route:list
docker compose down
docker compose down -v # DB データも削除する場合
```

## 構成

```text
frontend/       React + Vite + TypeScript
backend/        Laravel API
docs/           OpenAPI 定義
docker/         PHP-FPM / Nginx の設定
docker-compose.yml
```
