#!/bin/bash

# Construction CRM Deployment Script
# Run this on your EC2 instance to deploy updates

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Navigate to project directory
cd ~/constructionCRM

# Pull latest changes
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Update backend
echo "🔧 Updating backend..."
npm install --production
pm2 restart construction-crm-api

# Update frontend
echo "🎨 Rebuilding frontend..."
cd inventory-frontend
npm install

# Clean build artifacts
rm -rf build/ node_modules/.cache/

# Build with domain name (no CORS issues when API is on same domain)
API_URL="https://www.beamliner.com"

echo "📦 Building with API URL: $API_URL"
REACT_APP_API_URL=$API_URL npm run build

# Restart nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

# Show PM2 status
cd ~/constructionCRM
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Backend status:"
pm2 list

echo ""
echo "🌐 Your site is live at: $API_URL"
