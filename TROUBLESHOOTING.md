# AWS EC2 Deployment Troubleshooting Guide

## Common Issues and Solutions

### 🚫 Cannot Connect to EC2 via SSH

**Symptoms**: `Connection timed out` or `Permission denied`

**Solutions**:
1. Check your security group allows SSH (port 22) from your IP
   ```bash
   # AWS Console > EC2 > Security Groups > Inbound Rules
   # Add rule: SSH, Port 22, Source: My IP
   ```

2. Verify SSH key permissions
   ```bash
   chmod 400 your-key.pem
   ```

3. Use correct username
   - Ubuntu: `ubuntu@YOUR_EC2_IP`
   - Amazon Linux: `ec2-user@YOUR_EC2_IP`

---

### 🔴 Backend Cannot Connect to Database

**Symptoms**: Backend logs show `Error connecting to MySQL` or `ECONNREFUSED`

**Solutions**:

1. **Check RDS Security Group** (Most common issue)
   ```
   AWS Console > RDS > Your Database > Connectivity & Security
   Click on VPC security group
   Inbound Rules > Edit > Add Rule:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: Custom -> Select EC2's security group
   ```

2. **Verify .env file**
   ```bash
   cat ~/.env
   # Make sure all credentials are correct
   ```

3. **Test database connection**
   ```bash
   # Install MySQL client
   sudo apt install mysql-client -y
   
   # Test connection
   mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p
   ```

4. **Check backend logs**
   ```bash
   pm2 logs construction-crm-api
   ```

---

### 🌐 502 Bad Gateway Error

**Symptoms**: Nginx shows "502 Bad Gateway"

**Solutions**:

1. **Backend is not running**
   ```bash
   pm2 status
   pm2 restart construction-crm-api
   ```

2. **Port 3000 not listening**
   ```bash
   sudo netstat -tlnp | grep 3000
   # If nothing shows, backend crashed
   pm2 logs construction-crm-api --lines 50
   ```

3. **Check Nginx proxy configuration**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

### 📄 Blank Page / Frontend Not Loading

**Symptoms**: Browser shows blank page or "Cannot GET /"

**Solutions**:

1. **Build not completed**
   ```bash
   cd ~/constructionCRM/inventory-frontend
   npm run build
   ls -la build/  # Should show index.html
   ```

2. **Wrong Nginx root path**
   ```bash
   sudo nano /etc/nginx/sites-available/construction-crm
   # Verify root path is correct:
   # root /home/ubuntu/constructionCRM/inventory-frontend/build;
   ```

3. **Check browser console**
   - Open Developer Tools (F12)
   - Look for errors in Console tab
   - Common: API URL not set correctly

---

### 🔗 API Calls Failing / CORS Errors

**Symptoms**: Browser console shows CORS errors or "Failed to fetch"

**Solutions**:

1. **Update CORS in backend**
   ```bash
   nano ~/constructionCRM/server.js
   ```
   Verify CORS includes your EC2 IP:
   ```javascript
   const corsOptions = {
     origin: [
       'http://localhost:3001',
       'http://YOUR_EC2_IP',
       process.env.FRONTEND_URL
     ],
     credentials: true
   };
   ```
   Restart backend:
   ```bash
   pm2 restart construction-crm-api
   ```

2. **Check frontend API URL**
   ```bash
   cat ~/constructionCRM/inventory-frontend/.env.production
   # Should show: REACT_APP_API_URL=http://YOUR_EC2_IP
   ```
   Rebuild if needed:
   ```bash
   cd ~/constructionCRM/inventory-frontend
   npm run build
   sudo systemctl restart nginx
   ```

---

### 🚀 PM2 Not Starting on Reboot

**Symptoms**: After EC2 restart, backend is not running

**Solutions**:

1. **Configure PM2 startup**
   ```bash
   pm2 startup
   # Copy and run the command it outputs
   pm2 save
   ```

2. **Verify startup script**
   ```bash
   systemctl status pm2-ubuntu
   ```

---

### 💾 Running Out of Disk Space

**Symptoms**: `No space left on device` errors

**Solutions**:

1. **Check disk usage**
   ```bash
   df -h
   ```

2. **Clear PM2 logs**
   ```bash
   pm2 flush
   ```

3. **Clear Nginx logs**
   ```bash
   sudo truncate -s 0 /var/log/nginx/access.log
   sudo truncate -s 0 /var/log/nginx/error.log
   ```

4. **Remove old node_modules**
   ```bash
   cd ~/constructionCRM
   rm -rf node_modules
   npm install --production
   ```

5. **Expand EBS volume** (if needed)
   - AWS Console > EC2 > Volumes
   - Modify volume size
   - Run `sudo growpart /dev/xvda 1` and `sudo resize2fs /dev/xvda1`

---

### 📦 npm install Fails

**Symptoms**: `npm install` errors or dependency conflicts

**Solutions**:

1. **Clear npm cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node version**
   ```bash
   node --version  # Should be v20.x
   nvm use 20
   ```

---

### 🔒 SSL Certificate Issues

**Symptoms**: Certbot fails or HTTPS not working

**Solutions**:

1. **Ensure DNS points to EC2**
   ```bash
   dig yourdomain.com
   # Should show your EC2 IP
   ```

2. **Check port 80 is open**
   ```bash
   sudo netstat -tlnp | grep :80
   ```

3. **Run Certbot again**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Diagnostic Commands

### Check Everything At Once
```bash
./monitoring.sh
```

### Manual Checks

**Backend Status**
```bash
pm2 status
pm2 logs construction-crm-api --lines 50
```

**Nginx Status**
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -n 50 /var/log/nginx/error.log
```

**Port Checks**
```bash
sudo netstat -tlnp | grep -E ":(80|443|3000)"
```

**Database Connection**
```bash
mysql -h your-rds-endpoint -u admin -p -e "SHOW DATABASES;"
```

**Disk and Memory**
```bash
df -h
free -h
top
```

**Process Check**
```bash
ps aux | grep node
ps aux | grep nginx
```

---

## Getting Help

### View Real-time Logs

**Backend logs (live)**
```bash
pm2 logs construction-crm-api
```

**Nginx error logs (live)**
```bash
sudo tail -f /var/log/nginx/error.log
```

**System logs**
```bash
sudo journalctl -u nginx -f
```

### Test API Directly

```bash
# Test backend directly on server
curl http://localhost:3000/customers/1

# Test from outside
curl http://YOUR_EC2_IP/customers/1
```

### Export Logs for Support

```bash
# Save all logs to a file
{
  echo "=== PM2 Status ==="
  pm2 status
  echo "=== PM2 Logs ==="
  pm2 logs construction-crm-api --lines 100 --nostream
  echo "=== Nginx Error Log ==="
  sudo tail -n 100 /var/log/nginx/error.log
  echo "=== Nginx Access Log ==="
  sudo tail -n 100 /var/log/nginx/access.log
  echo "=== System Info ==="
  df -h
  free -h
} > debug-logs.txt

# Download to your local machine
# On your local machine:
scp -i your-key.pem ubuntu@YOUR_EC2_IP:~/debug-logs.txt .
```

---

## Emergency Recovery

### Restart Everything

```bash
# Restart backend
pm2 restart construction-crm-api

# Restart Nginx
sudo systemctl restart nginx

# Reboot entire server (last resort)
sudo reboot
```

### Rollback to Previous Version

```bash
cd ~/constructionCRM
git log --oneline -5  # See recent commits
git checkout PREVIOUS_COMMIT_HASH
./deploy.sh
```

---

## Prevention

### Set Up Monitoring

1. **Enable CloudWatch** (AWS Console)
   - EC2 > Monitoring
   - Enable detailed monitoring

2. **Set up alarms**
   - CPU utilization > 80%
   - Disk space < 20%
   - Status check failures

3. **Regular backups**
   ```bash
   # Add to crontab (crontab -e)
   0 2 * * * mysqldump -h RDS_HOST -u USER -pPASSWORD DB_NAME > ~/backup.sql
   ```

### Best Practices

✅ Always test locally before deploying
✅ Keep logs for at least 7 days
✅ Monitor disk space weekly
✅ Update packages monthly
✅ Take RDS snapshots before major changes
✅ Use `git tag` for production releases

---

## Still Stuck?

1. Run `./monitoring.sh` and review all outputs
2. Check all error logs
3. Verify all AWS security groups
4. Try a fresh deployment on a new EC2 instance
5. Review the complete guide in `deploy-to-ec2.md`

