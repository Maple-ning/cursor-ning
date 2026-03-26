# Blog Server

Express + MySQL backend for:
- `blog-front`（博客前台）
- `blog-admin` (content management panel)

## 1) Install

```bash
npm install
```

## 2) Configure env

Copy `.env.example` to `.env` and set DB connection:

```bash
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=blog_db
```

## 3) Init database

Run SQL in `sql/init.sql`.

If your existing data has Chinese garbled text, also run:

```bash
sql/fix-utf8mb4.sql
```

If your `posts` table was created before `status` field was introduced, run:

```bash
sql/add-post-status.sql
```

## 4) Run server

```bash
npm run dev
```

## API

- `GET /health`
- `GET /api/posts?category=tech|review`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/profile`
- `PUT /api/profile`
