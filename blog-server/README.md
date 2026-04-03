# blog-server（博客后端服务）

`Express + MySQL` 后端服务，提供以下前端项目的数据接口：

- `blog-front`（博客前台）
- `blog-admin`（博客后台）

## 环境要求

- Node.js（建议与前端版本保持一致）
- MySQL 5.7+ / 8.x

## 1. 安装依赖

```bash
npm install
```

## 2. 配置环境变量

复制 `.env.example` 为 `.env`，并按实际环境填写：

```bash
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=blog_db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

## 3. 初始化数据库

执行 `sql/init.sql` 初始化表结构和基础数据。

如历史数据出现中文乱码，再执行：

```bash
sql/fix-utf8mb4.sql
```

如 `posts` 表缺少 `status` 字段，再执行：

```bash
sql/add-post-status.sql
```

如需要「好站」收藏功能，执行：

```bash
sql/add-good-sites.sql
```

若需**好站分类排序**（`good_site_category_order` 表），在已有库上再执行：

```bash
sql/add-good-site-category-order.sql
```

若需给 `projects` 增加源码地址字段（`source_code_url`），在已有库上再执行：

```bash
sql/add-project-source-code-url.sql
```

若需给 `profile` 增加扩展字段（`tagline`、`focus_points`），在已有库上再执行：

```bash
sql/add-profile-extended-fields.sql
```

## 4. 启动服务

```bash
npm run dev
```

## 5. 接口列表

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
- `GET /api/good-sites`
- `POST /api/good-sites`（需登录）
- `PUT /api/good-sites/:id`（需登录）
- `DELETE /api/good-sites/:id`（需登录）
- `PUT /api/profile/good-sites/category-order`（需登录，body: `{ order: string[] }`）
