# 一键部署说明

该脚本会自动完成以下流程：

1. 在本地构建前端项目；
2. 打包前端 `dist` 与后端源码；
3. 通过 `scp` 上传到服务器；
4. 使用 PM2 部署后端并更新前端静态文件。

## 前置条件

- 本地（Windows）：终端可用 `ssh`、`scp`、`tar`、`npm`；
- 服务器（Linux）：已安装 `tar`、`npm`、`pm2`；
- **Nginx 的 `alias` 必须与 `RemotePath` 指向同一目录。**
  - 默认会将 `dist` 直接解压到 `RemotePath`；
  - 仅当你希望使用 `${RemotePath}/current/dist` 时，再设置 `PublishFlat = $false`。

## 配置步骤

1. 复制配置模板：

```powershell
copy .\deploy\deploy.config.example.ps1 .\deploy\deploy.config.ps1
```

2. 编辑 `deploy.config.ps1`，重点配置：
   - `Server.Host`、`Server.User`、`Server.Port`、`Server.SshKeyPath`
   - `Backend.RemotePath`、`Backend.ProcessName`、`Backend.StartScript`
   - `Frontends[*].LocalPath`、`Frontends[*].RemotePath`

### 不使用 SSH 密钥登录（如阿里云密码登录）

- 设置 `SshKeyPath = $null`；
- **不要**把服务器密码写进任何文件；
- 脚本执行 `ssh/scp` 时按终端提示输入密码（上传时可能会多次提示）；
- 建议后续改为密钥登录，减少重复输入。

3. 在服务器提前准备后端环境变量文件（示例）：
   - `${Backend.RemotePath}/shared/.env`
   - 例如：`/home/blog-server/shared/.env`

## 执行部署

在工作区根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy.ps1
```

指定自定义配置文件：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy.ps1 -ConfigPath .\deploy\deploy.config.ps1
```

## Nginx 配置示例（默认平铺发布）

本仓库一键部署仅包含 **blog-admin**、**blog-front**。二者 Vite 生产环境 `base` 一般为 `/admin/`、`/blog/`。`chat-room` 与 `json-formatter` 已迁出本仓库（例如单独目录维护），不再由 `deploy.ps1` 构建上传；若服务器上仍托管其静态资源，需自行构建后部署，并可保留下方 `location /chat/`、`/json-format/` 等配置。

```nginx
# 见下方「静态资源与 index.html」说明；完整片段见 deploy/nginx/locations.example.conf
location ^~ /admin/assets/ {
    alias /usr/share/nginx/html/blog-admin/assets/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
location = /admin/index.html {
    alias /usr/share/nginx/html/blog-admin/index.html;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
location /admin/ {
    alias /usr/share/nginx/html/blog-admin/;
    try_files $uri $uri/ /admin/index.html;
}
location ^~ /blog/assets/ {
    alias /usr/share/nginx/html/blog-front/assets/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
location = /blog/index.html {
    alias /usr/share/nginx/html/blog-front/index.html;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
location /blog/ {
    alias /usr/share/nginx/html/blog-front/;
    try_files $uri $uri/ /blog/index.html;
}
# 以下为聊天室 / JSON 工具静态站（非本脚本发布时可按需保留）
# location /chat/ {
#     alias /usr/share/nginx/html/chat-room/;
#     try_files $uri $uri/ /chat/index.html;
# }
# location /json-format/ {
#     alias /usr/share/nginx/html/json-format/;
#     try_files $uri $uri/ /json-format/index.html;
# }
# 聊天室 HTTP API（独立 chat-room-server，默认端口 3002；前端 VITE_API_BASE_URL 一般为 /api-chat）
location ^~ /api-chat/ {
    proxy_pass http://127.0.0.1:3002/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
# 聊天室 WebSocket（Socket.io，chat-room-server）
# 务必写在 location /api/ 之前，或使用 ^~，否则 /api/chat-socket/ 会被 /api/ 抢走并错误转发到错误上游
location ^~ /api/chat-socket/ {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
}
```

更完整的可复制片段（含 `/api-blog/`、`/admin/`、`/blog/`）见仓库内 **`deploy/nginx/locations.example.conf`**。服务器上若使用 `deploy/scripts/remote-insert-chat-socket-nginx.sh`，会在标记行前自动插入 **`/api-chat/`** 与 **`/api/chat-socket/`** 两段（依赖配置中存在与脚本内一致的 `MARKER` 行）。

### 静态资源与 index.html（避免「MIME type text/html」与动态 import 失败）

Vite 打包后 **JS 文件名带内容 hash**，每次部署会换一批新文件、删掉旧文件。若浏览器或 CDN 仍缓存了**旧的** `index.html`，里面的 `<script src="/blog/assets/index-旧hash.js">` 已不存在；此时若 Nginx 对「找不到的文件」仍用 `try_files` 回退到 **`index.html`**，则请求 `.js` 实际返回的是 **HTML**，浏览器按 ES module 加载就会报：`Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`。随后前端代码拿到非预期数据，还可能出现 **`.map is not a function`** 等连锁错误。

**建议：**

1. 为 **`/blog/assets/`**、**`/admin/assets/`** 单独写 `location ^~ ...`，**不要**对缺失的 chunk 回退到 SPA 的 `index.html`（缺失应 **404**）。
2. 对 **`/blog/index.html`**、**`/admin/index.html`** 设置 **`Cache-Control: no-cache`**（或很短 max-age），让入口页在部署后能尽快更新。
3. 对带 hash 的静态资源可长期缓存（`immutable`），与上一条不冲突。

按上文修改 Nginx 后执行 `nginx -t && systemctl reload nginx`。用户端可硬刷新或清空站点缓存一次。

聊天室后端与上传目录见 **`E:\Ning\Project\chat-room-server`**，可与博客共用同一 MySQL 库（表 `chat_rooms`、`chat_messages`），由该服务的 `sql/init.sql` 初始化。

## 备注

- 后端代码发布到 `${Backend.RemotePath}/app`；
- 脚本会在服务器后端目录执行 `npm ci --omit=dev`；
- 若 PM2 进程已存在则重启，不存在则新建；
- 前端默认发布到 `${Frontends[*].RemotePath}`，若 `PublishFlat = $false` 则发布到 `${RemotePath}/current/dist`。
