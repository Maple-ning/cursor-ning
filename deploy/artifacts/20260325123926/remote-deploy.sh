set -euo pipefail

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 is required on remote server."
  exit 1
fi

mkdir -p '/home/blog-server/app'
rm -rf '/home/blog-server/app'/*
tar -xzf '/tmp/cursor-deploy-20260325123926/backend.tar.gz' -C '/home/blog-server/app'

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

mkdir -p '/usr/share/nginx/html/blog-admin/current'
rm -rf '/usr/share/nginx/html/blog-admin/current'/*
tar -xzf '/tmp/cursor-deploy-20260325123926/blog-admin-dist.tar.gz' -C '/usr/share/nginx/html/blog-admin/current'
echo 'Frontend deployed: blog-admin -> /usr/share/nginx/html/blog-admin/current/dist'
mkdir -p '/usr/share/nginx/html/blog-front/current'
rm -rf '/usr/share/nginx/html/blog-front/current'/*
tar -xzf '/tmp/cursor-deploy-20260325123926/blog-front-dist.tar.gz' -C '/usr/share/nginx/html/blog-front/current'
echo 'Frontend deployed: blog-front -> /usr/share/nginx/html/blog-front/current/dist'

rm -rf '/tmp/cursor-deploy-20260325123926'
echo 'Deployment finished.'
