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

## 認証

Laravel Sanctum の SPA Cookie/Session 方式を使います。フロントエンドは `credentials: 'include'` を付け、状態変更の前に `/sanctum/csrf-cookie` を呼び出します。

- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`
- `POST /api/auth/sign-out`
- `GET /api/auth/me`

日記 API は認証必須で、`user_id` 単位で自分の日記だけを扱います。

## 開発用データ

Seeder は user、group、person、diary、diary_people を一つのトランザクションで作成します。

```bash
docker compose exec backend php artisan db:seed
```

デフォルトのログイン情報は `demo@example.com` / `password123` です。必要に応じて `.env` の `SEED_USER_EMAIL` と `SEED_USER_PASSWORD` を変更してください。

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
