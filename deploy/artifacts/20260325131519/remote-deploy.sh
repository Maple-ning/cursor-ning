set -euo pipefail

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 is required on remote server."
  exit 1
fi

mkdir -p '/home/blog-server/app'
rm -rf '/home/blog-server/app'/*
tar -xzf '/tmp/cursor-deploy-20260325131519/backend.tar.gz' -C '/home/blog-server/app'

if [ -f '/home/blog-server/shared/.env' ]; then
  cp '/home/blog-server/shared/.env' '/home/blog-server/app/.env'
  echo 'Loaded backend env from shared/.env'
else
  echo 'Warning: backend shared/.env not found, skip env copy'
fi

cd '/home/blog-server/app'
npm ci --omit=dev

if pm2 describe 'blog-server' >/dev/null 2>&1; then
  pm2 restart 'blog-server' --update-env
else
  pm2 start npm --name 'blog-server' -- run 'start'
fi
pm2 save

mkdir -p '/usr/share/nginx/html/blog-admin'
rm -rf '/usr/share/nginx/html/blog-admin'/*
tar -xzf '/tmp/cursor-deploy-20260325131519/blog-admin-dist.tar.gz' -C '/usr/share/nginx/html/blog-admin' --strip-components=1
echo 'Frontend deployed (flat): blog-admin -> /usr/share/nginx/html/blog-admin'
mkdir -p '/usr/share/nginx/html/blog-front'
rm -rf '/usr/share/nginx/html/blog-front'/*
tar -xzf '/tmp/cursor-deploy-20260325131519/blog-front-dist.tar.gz' -C '/usr/share/nginx/html/blog-front' --strip-components=1
echo 'Frontend deployed (flat): blog-front -> /usr/share/nginx/html/blog-front'

rm -rf '/tmp/cursor-deploy-20260325131519'
echo 'Deployment finished.'
