#!/bin/bash

# Deployment script for Construction CRM on EC2
# Run this script after git pull to update both frontend and backend

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Update backend
echo -e "${BLUE}📦 Updating backend dependencies...${NC}"
npm install --production

# Restart backend with PM2
echo -e "${BLUE}🔄 Restarting backend...${NC}"
pm2 restart construction-crm-api || pm2 start server.js --name construction-crm-api

# Update frontend
echo -e "${BLUE}📦 Building frontend...${NC}"
cd inventory-frontend
npm install

# Get EC2 public IP for frontend build
echo -e "${BLUE}🌐 Detecting EC2 public IP...${NC}"
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "localhost")
echo -e "${BLUE}   Using API URL: http://$EC2_IP${NC}"

# Build frontend with environment variable
echo -e "${BLUE}🏗️  Building React app...${NC}"
REACT_APP_API_URL=http://$EC2_IP npm run build

# Restart Nginx
echo -e "${BLUE}🔄 Restarting Nginx...${NC}"
sudo systemctl restart nginx

# Check status
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Backend status:"
pm2 status construction-crm-api
echo ""
echo "Nginx status:"
sudo systemctl status nginx --no-pager -l

echo ""
echo -e "${GREEN}🎉 Your application has been updated!${NC}"

