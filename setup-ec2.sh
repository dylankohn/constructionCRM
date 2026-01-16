#!/bin/bash

# Initial setup script for Construction CRM on EC2
# Run this once when setting up a new EC2 instance

set -e  # Exit on error

echo "🚀 Setting up Construction CRM on EC2..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running on Ubuntu
if [ ! -f /etc/lsb-release ]; then
    echo -e "${RED}This script is designed for Ubuntu. Please modify for your OS.${NC}"
    exit 1
fi

# Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js via NVM
echo -e "${BLUE}📦 Installing Node.js 20...${NC}"
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

source ~/.bashrc
nvm install 20
nvm use 20

# Install PM2
echo -e "${BLUE}📦 Installing PM2...${NC}"
npm install -g pm2

# Install Nginx
echo -e "${BLUE}📦 Installing Nginx...${NC}"
sudo apt install nginx -y

# Install Git
echo -e "${BLUE}📦 Installing Git...${NC}"
sudo apt install git -y

# Start Nginx
echo -e "${BLUE}🔄 Starting Nginx...${NC}"
sudo systemctl start nginx
sudo systemctl enable nginx

# Prompt for configuration
echo ""
echo -e "${YELLOW}⚙️  Configuration needed:${NC}"
echo "Please provide the following information:"
read -p "RDS Database Host: " DB_HOST
read -p "Database Username: " DB_USER
read -sp "Database Password: " DB_PASSWORD
echo ""
read -p "Database Name: " DB_NAME
read -p "Google Maps API Key: " GOOGLE_MAPS_KEY

# Create .env for backend
echo -e "${BLUE}📝 Creating backend .env file...${NC}"
cat > .env << EOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
PORT=3000
NODE_ENV=production
EOF

# Get EC2 public IP
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
npm install

# Test backend connection
echo -e "${BLUE}🧪 Testing database connection...${NC}"
timeout 10 node server.js &
sleep 5
if pm2 list | grep -q "server"; then
    pm2 delete server
fi

# Start backend with PM2
echo -e "${BLUE}🚀 Starting backend with PM2...${NC}"
pm2 start server.js --name server

# Configure PM2 startup
echo -e "${BLUE}⚙️  Configuring PM2 to start on boot...${NC}"
pm2 startup ubuntu -u $USER --hp $HOME
pm2 save

# Build frontend
echo -e "${BLUE}🏗️  Building frontend...${NC}"
cd inventory-frontend

# Install frontend dependencies
npm install

# Create .env.production for frontend
echo -e "${BLUE}📝 Creating frontend .env.production file...${NC}"
cat > .env.production << EOF
REACT_APP_API_URL=http://$EC2_PUBLIC_IP
REACT_APP_GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_KEY
EOF

# Build frontend
npm run build

# Configure Nginx
echo -e "${BLUE}⚙️  Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/construction-crm > /dev/null << EOF
server {
    listen 80;
    server_name $EC2_PUBLIC_IP;

    # Serve React frontend
    root /home/ubuntu/constructionCRM/inventory-frontend/build;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to backend
    location /auth/ {
        proxy_pass http://localhost:3000/auth/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /customers/ {
        proxy_pass http://localhost:3000/customers/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /jobs/ {
        proxy_pass http://localhost:3000/jobs/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /materials/ {
        proxy_pass http://localhost:3000/materials/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /inventory/ {
        proxy_pass http://localhost:3000/inventory/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /areas/ {
        proxy_pass http://localhost:3000/areas/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/construction-crm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo -e "${BLUE}🧪 Testing Nginx configuration...${NC}"
sudo nginx -t

# Restart Nginx
echo -e "${BLUE}🔄 Restarting Nginx...${NC}"
sudo systemctl restart nginx

# Display status
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Construction CRM is now running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "🌐 Access your app at: ${BLUE}http://$EC2_PUBLIC_IP${NC}"
echo ""
echo "Backend status:"
pm2 status
echo ""
echo "Nginx status:"
sudo systemctl status nginx --no-pager
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT NEXT STEPS:${NC}"
echo ""
echo "1. Update your RDS Security Group to allow connections from this EC2:"
echo "   - Go to AWS Console > RDS > Your Database > Security Group"
echo "   - Add inbound rule for MySQL/Aurora (port 3306)"
echo "   - Source: This EC2's security group or IP"
echo ""
echo "2. Test your application in the browser"
echo ""
echo "3. For HTTPS, set up a domain and run:"
echo "   sudo apt install certbot python3-certbot-nginx -y"
echo "   sudo certbot --nginx -d yourdomain.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

