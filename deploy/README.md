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
location /admin/ {
    alias /usr/share/nginx/html/blog-admin/;
    try_files $uri $uri/ /admin/index.html;
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
# 聊天室 WebSocket（Socket.io，在 blog-server 端口，默认 3001）
# 务必写在 location /api/ 之前，或使用 ^~，否则 /api/chat-socket/ 会被 /api/ 抢走并错误转发到 3000
location ^~ /api/chat-socket/ {
    proxy_pass http://127.0.0.1:3001;
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

聊天图片与接口仍走已有 `location /api-blog/` 即可（`/api-blog/chat/...` 会转发到后端的 `/api/chat/...`）。

## 备注

- 后端代码发布到 `${Backend.RemotePath}/app`；
- 脚本会在服务器后端目录执行 `npm ci --omit=dev`；
- 若 PM2 进程已存在则重启，不存在则新建；
- 前端默认发布到 `${Frontends[*].RemotePath}`，若 `PublishFlat = $false` 则发布到 `${RemotePath}/current/dist`。
