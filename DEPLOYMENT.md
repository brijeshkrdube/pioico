# PIOGOLD ICO Platform - VPS Deployment Guide

## Prerequisites
- Ubuntu 20.04+ or Debian 11+ VPS
- Minimum 2GB RAM, 2 CPU cores
- Domain name (optional but recommended)

---

## Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Yarn
npm install -g yarn

# Install Python 3.11+
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## Step 2: Clone/Upload Your Code

```bash
# Create app directory
sudo mkdir -p /var/www/piogold
sudo chown $USER:$USER /var/www/piogold
cd /var/www/piogold

# Option A: Clone from GitHub (if you saved to GitHub)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Option B: Upload via SCP from your local machine
# scp -r /path/to/piogold/* user@your-server:/var/www/piogold/
```

---

## Step 3: Setup Backend

```bash
cd /var/www/piogold/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
MONGO_URL="mongodb://localhost:27017"
DB_NAME="piogold_production"
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
JWT_SECRET="your-super-secure-jwt-secret-change-this-in-production"
AES_SECRET="your-super-secure-aes-secret-change-this-in-production"
WALLETCONNECT_PROJECT_ID="dc07f2192374242b07adb70fa5d5903c"
EOF

# Test backend starts
uvicorn server:app --host 0.0.0.0 --port 8001
# Press Ctrl+C to stop after verifying it works
```

---

## Step 4: Setup Frontend

```bash
cd /var/www/piogold/frontend

# Install dependencies
yarn install

# Create production .env
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=https://yourdomain.com
EOF

# Build for production
yarn build
```

---

## Step 5: Setup Systemd Service for Backend

```bash
sudo cat > /etc/systemd/system/piogold-backend.service << 'EOF'
[Unit]
Description=PIOGOLD ICO Backend
After=network.target mongod.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/piogold/backend
Environment="PATH=/var/www/piogold/backend/venv/bin"
ExecStart=/var/www/piogold/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Fix permissions
sudo chown -R www-data:www-data /var/www/piogold

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable piogold-backend
sudo systemctl start piogold-backend

# Check status
sudo systemctl status piogold-backend
```

---

## Step 6: Configure Nginx

```bash
sudo cat > /etc/nginx/sites-available/piogold << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /var/www/piogold/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/piogold /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 7: Setup SSL (HTTPS) with Let's Encrypt

```bash
# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is automatic, but you can test with:
sudo certbot renew --dry-run
```

---

## Step 8: Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Step 9: Initial Admin Setup

After deployment, access your site and:

1. Go to `https://yourdomain.com/admin`
2. Click "First time? Setup admin"
3. Create your admin account
4. Login and configure:
   - Set Gold Price
   - Set ICO Wallet Address (to receive USDT)
   - Set Private Key (for sending PIO - will be AES-256 encrypted)

---

## Useful Commands

```bash
# View backend logs
sudo journalctl -u piogold-backend -f

# Restart backend
sudo systemctl restart piogold-backend

# Restart Nginx
sudo systemctl restart nginx

# MongoDB shell
mongosh piogold_production

# Update code from GitHub
cd /var/www/piogold
git pull
cd frontend && yarn build
sudo systemctl restart piogold-backend
```

---

## Security Checklist

- [ ] Change JWT_SECRET and AES_SECRET to strong random values
- [ ] Setup MongoDB authentication (optional but recommended)
- [ ] Configure firewall (UFW)
- [ ] Enable fail2ban for SSH protection
- [ ] Regular backups of MongoDB
- [ ] Keep system updated

---

## Troubleshooting

**Backend not starting:**
```bash
sudo journalctl -u piogold-backend -n 50
```

**Nginx errors:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**MongoDB issues:**
```bash
sudo systemctl status mongod
sudo tail -f /var/log/mongodb/mongod.log
```
