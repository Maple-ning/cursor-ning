#!/usr/bin/env bash
set -euo pipefail
CONF=/etc/nginx/nginx.conf
MARKER='    # 旧 API（如果你还用，保留）'
if grep -q 'location \^~ /api/chat-socket/' "$CONF" 2>/dev/null; then
  echo 'chat-socket block already present'
  nginx -t && systemctl reload nginx
  exit 0
fi
tmp=$(mktemp)
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" == "$MARKER" ]]; then
    cat <<'BLOCK'
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

BLOCK
  fi
  printf '%s\n' "$line"
done <"$CONF" >"$tmp"
mv "$tmp" "$CONF"
echo 'inserted chat-socket location'
nginx -t
systemctl reload nginx
echo 'nginx reloaded'
