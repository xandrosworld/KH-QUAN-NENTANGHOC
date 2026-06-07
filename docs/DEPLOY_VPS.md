# Deploy VPS Ubuntu 24.04

Target: Ubuntu 24.04 LTS, Nginx, Node.js 20, PM2, PostgreSQL, app chay local port `3000`.

## 1. DNS

Tao ban ghi DNS:

```text
A     @      103.200.22.74
A     www    103.200.22.74
```

Cho DNS tro xong roi xin SSL.

## 2. Cai server

```bash
ssh root@103.200.22.74
apt update && apt upgrade -y
apt install -y curl git nginx ufw postgresql postgresql-contrib
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

Firewall:

```bash
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable
```

## 3. Tao PostgreSQL

```bash
sudo -u postgres psql
```

Trong `psql`:

```sql
CREATE USER tronx_user WITH PASSWORD 'doi-mat-khau-db-that-dai';
CREATE DATABASE tronx_dashboard OWNER tronx_user;
GRANT ALL PRIVILEGES ON DATABASE tronx_dashboard TO tronx_user;
\q
```

App se tu tao bang `users`, `email_otps`, `import_jobs`, `normalized_records` khi start lan dau.

## 4. Clone source

```bash
mkdir -p /var/www
cd /var/www
git clone <GITHUB_REPO_URL> tronx-ai-dashboard
cd tronx-ai-dashboard
npm ci
cp .env.example .env
nano .env
```

Env can dien:

```env
DATABASE_URL=postgresql://tronx_user:doi-mat-khau-db-that-dai@127.0.0.1:5432/tronx_dashboard
AUTH_SECRET=tao-chuoi-random-dai-it-nhat-32-ky-tu
TRONX_ADMIN_EMAIL=admin@tronx.vn
TRONX_ADMIN_PASSWORD=doi-mat-khau-admin-ban-dau

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM="TronX <no-reply@tronx.vn>"

GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```

Neu chua co SMTP, moi truong production se khong gui duoc OTP dang ky/quen mat khau.

## 5. Build va chay PM2

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Sau `pm2 startup`, chay lai dung command ma PM2 in ra.

Kiem tra:

```bash
pm2 status
curl -I http://127.0.0.1:3000/login
```

## 6. Nginx reverse proxy

```bash
nano /etc/nginx/sites-available/tronx.vn
```

```nginx
server {
    listen 80;
    server_name tronx.vn www.tronx.vn;

    client_max_body_size 60M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/tronx.vn /etc/nginx/sites-enabled/tronx.vn
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

## 7. SSL

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d tronx.vn -d www.tronx.vn
certbot renew --dry-run
```

## 8. Deploy update lan sau

```bash
cd /var/www/tronx-ai-dashboard
git pull
npm ci
npm run build
pm2 restart tronx-ai-dashboard
```

## 9. Debug nhanh

```bash
pm2 logs tronx-ai-dashboard
systemctl status nginx
nginx -t
tail -n 80 /var/log/nginx/error.log
sudo -u postgres psql -d tronx_dashboard -c "\dt"
```
