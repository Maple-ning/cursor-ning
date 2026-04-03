#!/usr/bin/env bash
# 在 MARKER 行前插入聊天室 HTTP + WebSocket 反代（chat-room-server 默认 3002）。
# 若配置里已有 location ^~ /api-chat/，视为已插入，直接 nginx -t 后退出。
# 若仅有旧的 chat-socket 而无 api-chat，请从 deploy/nginx/locations.example.conf
# 手动补上 api-chat 段，或删掉旧块后重新运行本脚本。
set -euo pipefail
CONF=/etc/nginx/nginx.conf
MARKER='    # 旧 API（如果你还用，保留）'
if grep -q 'location \^~ /api-chat/' "$CONF" 2>/dev/null; then
  echo 'api-chat block already present'
  nginx -t && systemctl reload nginx
  exit 0
fi
tmp=$(mktemp)
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" == "$MARKER" ]]; then
    cat <<'BLOCK'
    location ^~ /api-chat/ {
        proxy_pass http://127.0.0.1:3002/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

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

BLOCK
  fi
  printf '%s\n' "$line"
done <"$CONF" >"$tmp"
mv "$tmp" "$CONF"
echo 'inserted api-chat + chat-socket locations'
nginx -t
systemctl reload nginx
echo 'nginx reloaded'
