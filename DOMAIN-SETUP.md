# Domain Setup Guide for Construction CRM

## Prerequisites
- Domain name purchased from a registrar (Namecheap, GoDaddy, etc.)
- EC2 instance running and accessible via IP: `3.144.139.149`

---

## Option 1: AWS Route 53 (Recommended)

### Step 1: Create a Hosted Zone
1. Go to AWS Console → **Route 53**
2. Click **Create hosted zone**
3. Enter your domain name (e.g., `yourdomain.com`)
4. Click **Create hosted zone**

### Step 2: Update Nameservers at Your Registrar
1. Route 53 will give you 4 nameserver addresses (e.g., `ns-123.awsdns-12.com`)
2. Go to your domain registrar (Namecheap, GoDaddy, etc.)
3. Find **Nameservers** or **DNS Settings**
4. Change from default to **Custom Nameservers**
5. Enter the 4 nameservers from Route 53
6. Save (can take 1-48 hours to propagate, usually ~1 hour)

### Step 3: Create DNS Records
In Route 53 Hosted Zone, create these records:

#### A Record (for `yourdomain.com`)
- **Record name**: Leave blank or `@`
- **Type**: A - IPv4 address
- **Value**: `3.144.139.149`
- **TTL**: 300

#### A Record (for `www.yourdomain.com`)
- **Record name**: `www`
- **Type**: A - IPv4 address
- **Value**: `3.144.139.149`
- **TTL**: 300

---

## Option 2: Direct DNS at Your Registrar (Easier, No Route 53)

Go to your domain registrar's DNS management and create:

### A Records
| Type | Name/Host | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| A    | @         | 3.144.139.149   | 300 |
| A    | www       | 3.144.139.149   | 300 |

**Common Registrar DNS Locations:**
- **Namecheap**: Domain List → Manage → Advanced DNS
- **GoDaddy**: My Products → DNS → Manage Zones
- **Google Domains**: DNS → Custom records

---

## Step 4: Update Your Application Configuration

### 4.1 Update Backend CORS (server.js)
```bash
# SSH into your EC2 instance
ssh -i /path/to/your-key.pem ubuntu@3.144.139.149

# Edit server.js
cd ~/constructionCRM
nano server.js
```

Find the CORS configuration and add your domain:
```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://3.144.139.149',
    'http://yourdomain.com',      // Add this
    'https://yourdomain.com',     // Add this
    'http://www.yourdomain.com',  // Add this
    'https://www.yourdomain.com'  // Add this
  ],
  credentials: true
}));
```

Save and restart:
```bash
pm2 restart construction-crm-api
```

### 4.2 Rebuild Frontend with New Domain
```bash
cd ~/constructionCRM/inventory-frontend

# Rebuild with your domain
rm -rf build/ node_modules/.cache/
REACT_APP_API_URL=http://yourdomain.com npm run build

# Restart nginx
sudo systemctl restart nginx
```

---

## Step 5: Set Up SSL/HTTPS (Highly Recommended!)

### Install Certbot (Let's Encrypt - FREE SSL)
```bash
# SSH into EC2
ssh -i /path/to/your-key.pem ubuntu@3.144.139.149

# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with YOUR domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# 1. Enter email address
# 2. Agree to terms
# 3. Choose "2" to redirect HTTP to HTTPS (recommended)
```

Certbot will automatically:
- Get an SSL certificate
- Configure Nginx to use HTTPS
- Set up auto-renewal

### Update Frontend for HTTPS
```bash
cd ~/constructionCRM/inventory-frontend

# Rebuild with HTTPS URL
rm -rf build/ node_modules/.cache/
REACT_APP_API_URL=https://yourdomain.com npm run build

sudo systemctl restart nginx
```

---

## Step 6: Test Your Setup

1. **DNS Propagation**: Check if DNS is working
   ```bash
   # On your local machine
   nslookup yourdomain.com
   # Should show: 3.144.139.149
   ```

2. **Website Access**: Open browser and go to:
   - `http://yourdomain.com` (should work)
   - `https://yourdomain.com` (if you set up SSL)

3. **API Test**: Check if backend is accessible
   ```bash
   curl http://yourdomain.com/api/health
   # or
   curl https://yourdomain.com/api/health
   ```

---

## Troubleshooting

### DNS Not Resolving
- Wait up to 24-48 hours for full DNS propagation
- Clear your DNS cache: `sudo dscacheutil -flushcache` (Mac) or `ipconfig /flushdns` (Windows)
- Check DNS with: `dig yourdomain.com` or `nslookup yourdomain.com`

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --dry-run

# Check nginx configuration
sudo nginx -t
```

### CORS Errors After Domain Setup
- Make sure you added all domain variations to `server.js` CORS config
- Restart PM2: `pm2 restart construction-crm-api`
- Clear browser cache with hard refresh

---

## Auto-Renewal of SSL Certificate

Certbot automatically sets up a cron job to renew certificates. Verify it's working:
```bash
# Test renewal (doesn't actually renew, just tests)
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

---

## Summary

✅ Domain purchased  
✅ DNS records pointing to EC2 IP  
✅ Backend CORS updated with domain  
✅ Frontend rebuilt with domain URL  
✅ SSL certificate installed (optional but recommended)  
✅ Auto-renewal configured  

Your app should now be accessible at:
- **http://yourdomain.com** (or https if SSL configured)
- **http://www.yourdomain.com**

---

## Need Help?

- DNS not working? Check registrar DNS settings
- SSL issues? Run `sudo certbot certificates` and check status
- App not loading? Check `pm2 logs` and `sudo systemctl status nginx`

