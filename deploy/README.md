# One-click Deploy

This script does:

1. Build frontend projects locally.
2. Package frontend `dist` and backend source.
3. Upload artifacts to your server by `scp`.
4. Deploy backend with PM2 and refresh frontend static files.

## Prerequisites

- Local (Windows): `ssh`, `scp`, `tar`, `npm` available in terminal.
- Server (Linux): `tar`, `npm`, `pm2` installed.
- **Nginx `alias` and `RemotePath` must be the same directory.** By default, `dist` is unpacked **directly** into `RemotePath` (e.g. `blog-admin/index.html` under `/usr/share/nginx/html/`). Set `PublishFlat = $false` only if you want `${RemotePath}/current/dist` instead.

## Setup

1. Copy config template:

```powershell
copy .\deploy\deploy.config.example.ps1 .\deploy\deploy.config.ps1
```

2. Edit `deploy.config.ps1`:
   - `Server.Host`, `Server.User`, `Server.Port`, `Server.SshKeyPath`
   - `Backend.RemotePath`, `Backend.ProcessName`, `Backend.StartScript`
   - `Frontends[*].LocalPath`, `Frontends[*].RemotePath`

**Login without SSH key (Alibaba Cloud instance password)**

- Set `SshKeyPath = $null`.
- **Do not put the password in any file.** When the script runs `ssh` / `scp`, enter the password in the terminal prompts (you may be prompted multiple times per upload step).
- Optional: generate a key pair later and switch to key-based login for fewer prompts.

3. On your server, prepare backend env file (example layout: upload/extract under `/home`):
   - `${Backend.RemotePath}/shared/.env` (e.g. `/home/blog-server/shared/.env`)

## Run Deployment

From workspace root:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy.ps1
```

Custom config path:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy\deploy.ps1 -ConfigPath .\deploy\deploy.config.ps1
```

## Nginx example (default flat layout)

Vite uses `base: '/admin/'` and `base: '/blog/'`. Example:

```nginx
location /admin/ {
    alias /usr/share/nginx/html/blog-admin/;
    try_files $uri $uri/ /admin/index.html;
}
location /blog/ {
    alias /usr/share/nginx/html/blog-front/;
    try_files $uri $uri/ /blog/index.html;
}
```

## Notes

- Backend code is deployed to `${Backend.RemotePath}/app`.
- Script will run `npm ci --omit=dev` on server backend path.
- If PM2 process exists, it restarts; otherwise it creates one.
- Frontend: default files under `${Frontends[*].RemotePath}`; with `PublishFlat = $false`, under `${RemotePath}/current/dist`.
