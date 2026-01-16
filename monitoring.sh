#!/bin/bash

# Monitoring script for Construction CRM
# Run this to check the health of your application

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Construction CRM - System Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check system resources
echo -e "${BLUE}💾 System Resources:${NC}"
echo "Disk Usage:"
df -h / | tail -n 1 | awk '{print "  Used: " $3 " / " $2 " (" $5 ")"}'
echo ""
echo "Memory Usage:"
free -h | grep Mem | awk '{print "  Used: " $3 " / " $2}'
echo ""

# Check PM2 status
echo -e "${BLUE}🚀 Backend Status (PM2):${NC}"
pm2 status | grep -E "server|id|status"
echo ""

# Check Nginx status
echo -e "${BLUE}🌐 Nginx Status:${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "  ${GREEN}✓ Running${NC}"
else
    echo -e "  ${RED}✗ Not running${NC}"
fi
echo ""

# Check if port 3000 is listening
echo -e "${BLUE}🔌 Port Status:${NC}"
if sudo netstat -tlnp | grep -q ":3000"; then
    echo -e "  Port 3000 (Backend): ${GREEN}✓ Listening${NC}"
else
    echo -e "  Port 3000 (Backend): ${RED}✗ Not listening${NC}"
fi

if sudo netstat -tlnp | grep -q ":80"; then
    echo -e "  Port 80 (HTTP): ${GREEN}✓ Listening${NC}"
else
    echo -e "  Port 80 (HTTP): ${RED}✗ Not listening${NC}"
fi
echo ""

# Check recent logs
echo -e "${BLUE}📋 Recent Backend Logs (last 10 lines):${NC}"
pm2 logs server --lines 10 --nostream
echo ""

# Check Nginx error logs
echo -e "${BLUE}⚠️  Recent Nginx Errors (last 5):${NC}"
sudo tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "  No recent errors"
echo ""

# Check API health
echo -e "${BLUE}🏥 API Health Check:${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/customers/1 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo -e "  API Response: ${GREEN}✓ Responding (HTTP $HTTP_CODE)${NC}"
else
    echo -e "  API Response: ${RED}✗ Not responding (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Get public IP
echo -e "${BLUE}🌍 Public Access:${NC}"
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "Unable to fetch")
echo "  Your app: http://$PUBLIC_IP"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Quick Commands:${NC}"
echo "  View backend logs:     pm2 logs server"
echo "  Restart backend:       pm2 restart server"
echo "  Restart nginx:         sudo systemctl restart nginx"
echo "  View nginx errors:     sudo tail -f /var/log/nginx/error.log"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

