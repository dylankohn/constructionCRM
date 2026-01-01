# AWS EC2 Deployment Guide for Construction CRM

## Prerequisites
- AWS Account
- SSH key pair from AWS
- Domain name (optional but recommended)

---

## Step 1: Launch EC2 Instance

### 1.1 Go to AWS Console
1. Navigate to **EC2 Dashboard**
2. Click **Launch Instance**

### 1.2 Configure Instance
- **Name**: `construction-crm-server`
- **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
- **Instance Type**: t3.small (recommended) or t2.micro (free tier)
- **Key Pair**: Create new or select existing key pair (download and save it!)

### 1.3 Configure Security Group
Click "Edit" next to Network Settings and add these rules:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | My IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure web traffic |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Backend API (temporary) |

### 1.4 Configure Storage
- Set to at least **20 GB** (recommended for logs and dependencies)

### 1.5 Launch
- Click **Launch Instance**
- Wait for instance to be in "running" state
- Note your **Public IPv4 address** (e.g., 3.87.123.45)

---

## Step 2: Connect to Your EC2 Instance

```bash
# Make your key file secure
chmod 400 ~/Downloads/your-key-pair.pem

# SSH into your instance
ssh -i ~/Downloads/your-key-pair.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Step 3: Set Up Server Environment

Run these commands on your EC2 instance:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Verify Node installation
node --version  # Should show v20.x.x
npm --version

# Install PM2 globally (process manager)
npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Step 4: Clone and Set Up Your Application

```bash
# Create app directory
cd ~
git clone https://github.com/YOUR_USERNAME/constructionCRM.git
cd constructionCRM

# Install backend dependencies
npm install

# Create .env file for backend
nano .env
```

Add these values to `.env`:
```
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-database-name
PORT=3000
NODE_ENV=production
```

Save with `Ctrl+O`, then `Enter`, then `Ctrl+X`

---

## Step 5: Update RDS Security Group

**IMPORTANT**: Your EC2 needs to access your RDS database!

1. Go to **AWS Console > RDS > Databases**
2. Click your database instance
3. Click the **VPC security group** link
4. Click **Edit inbound rules**
5. Add rule:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: Security group of your EC2 instance (or EC2's Private IP)
6. Save rules

---

## Step 6: Test Backend Connection

```bash
# Test the backend
node server.js

# You should see:
# ✅ Successfully connected to MySQL database!
# Server running on port 3000

# Press Ctrl+C to stop
```

---

## Step 7: Start Backend with PM2

```bash
# Start backend with PM2
pm2 start server.js --name construction-crm-api

# View logs
pm2 logs construction-crm-api

# Configure PM2 to start on system reboot
pm2 startup
# Copy and run the command it outputs (starts with sudo)

pm2 save

# Check status
pm2 status
```

---

## Step 8: Build and Deploy Frontend

```bash
cd ~/constructionCRM/inventory-frontend

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

Add:
```
REACT_APP_API_URL=http://YOUR_EC2_PUBLIC_IP
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

```bash
# Build production version
npm run build

# Verify build was created
ls -la build/
```

---

## Step 9: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/construction-crm
```

Paste this configuration (update YOUR_EC2_PUBLIC_IP):

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;  # Replace with your IP or domain

    # Serve React frontend
    root /home/ubuntu/constructionCRM/inventory-frontend/build;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /auth/ {
        proxy_pass http://localhost:3000/auth/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /customers/ {
        proxy_pass http://localhost:3000/customers/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /jobs/ {
        proxy_pass http://localhost:3000/jobs/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /materials/ {
        proxy_pass http://localhost:3000/materials/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /inventory/ {
        proxy_pass http://localhost:3000/inventory/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /areas/ {
        proxy_pass http://localhost:3000/areas/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Save and exit.

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/construction-crm /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

---

## Step 10: Update CORS in Backend

Your backend needs to accept requests from your EC2 IP. This was already done in the preparation script, but verify:

```bash
nano ~/constructionCRM/server.js
```

Make sure the CORS configuration includes your EC2 IP:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3001',
    'http://YOUR_EC2_PUBLIC_IP',
    'https://YOUR_DOMAIN_IF_YOU_HAVE_ONE'
  ],
  credentials: true
};
```

If you made changes:
```bash
pm2 restart construction-crm-api
```

---

## Step 11: Test Your Deployment

Open your browser and go to:
```
http://YOUR_EC2_PUBLIC_IP
```

You should see your Construction CRM application!

---

## Step 12: Set Up SSL (Optional but Recommended)

If you have a domain name:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (follow the prompts)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will automatically configure Nginx for HTTPS
# Certificates auto-renew, but you can test with:
sudo certbot renew --dry-run
```

---

## Useful Commands

### Backend Management
```bash
# View backend logs
pm2 logs construction-crm-api

# Restart backend
pm2 restart construction-crm-api

# Stop backend
pm2 stop construction-crm-api

# View backend status
pm2 status
```

### Nginx Management
```bash
# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory
free -h

# Check running processes
top
# Press 'q' to exit

# Check port 3000 (backend)
sudo netstat -tlnp | grep 3000

# Check port 80 (nginx)
sudo netstat -tlnp | grep 80
```

---

## Troubleshooting

### Can't Connect to Database
1. Check RDS security group allows EC2 IP
2. Verify credentials in `.env`
3. Check backend logs: `pm2 logs construction-crm-api`

### Frontend Shows Blank Page
1. Check browser console for errors
2. Verify build completed: `ls ~/constructionCRM/inventory-frontend/build`
3. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### API Calls Failing
1. Check backend is running: `pm2 status`
2. Check CORS settings in `server.js`
3. Verify REACT_APP_API_URL in `.env.production`

### 502 Bad Gateway
1. Backend might be down: `pm2 restart construction-crm-api`
2. Check port 3000 is listening: `sudo netstat -tlnp | grep 3000`

---

## Updating Your Application

When you make code changes:

```bash
# SSH into your EC2
ssh -i ~/Downloads/your-key-pair.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Pull latest changes
cd ~/constructionCRM
git pull

# Update backend
npm install
pm2 restart construction-crm-api

# Update frontend
cd inventory-frontend
npm install
npm run build
sudo systemctl restart nginx
```

---

## Cost Estimation

**Monthly costs (approximate):**
- EC2 t3.small: ~$15
- RDS (existing): Variable
- Data transfer: ~$1-5
- **Total: ~$16-20/month**

---

## Next Steps

1. ✅ Set up custom domain with Route 53
2. ✅ Configure SSL with Let's Encrypt
3. ✅ Set up CloudWatch monitoring
4. ✅ Configure automated backups
5. ✅ Set up CI/CD with GitHub Actions

---

## Support

If you encounter issues:
1. Check logs first (PM2 and Nginx)
2. Verify all ports in security groups
3. Test backend directly: `curl http://localhost:3000/customers/1`
4. Check this guide's troubleshooting section

