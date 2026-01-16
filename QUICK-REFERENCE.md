# Quick Reference Card - AWS EC2 Deployment

## 🚀 FIRST TIME SETUP

```bash
# 1. Connect to EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# 2. Clone and setup
git clone https://github.com/YOUR_USERNAME/constructionCRM.git
cd constructionCRM
chmod +x *.sh
./setup-ec2.sh
```

---

## 🔄 DEPLOY UPDATES

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd constructionCRM
git pull
./deploy.sh
```

---

## 📊 MONITORING

```bash
# Quick health check
./monitoring.sh

# Backend logs (live)
pm2 logs server

# Nginx errors
sudo tail -f /var/log/nginx/error.log

# System resources
df -h        # Disk space
free -h      # Memory
top          # CPU & processes
```

---

## 🔧 COMMON FIXES

### Backend not responding
```bash
pm2 restart server
pm2 logs server
```

### Nginx issues
```bash
sudo nginx -t                    # Test config
sudo systemctl restart nginx     # Restart
sudo systemctl status nginx      # Check status
```

### Database connection issues
```bash
# Check RDS security group allows EC2
# AWS Console > RDS > Security Group > Add rule
# Type: MySQL/Aurora, Port: 3306, Source: EC2 security group
```

### Out of disk space
```bash
pm2 flush                                    # Clear PM2 logs
sudo truncate -s 0 /var/log/nginx/*.log     # Clear Nginx logs
```

---

## 🆘 EMERGENCY COMMANDS

```bash
# Restart everything
pm2 restart all
sudo systemctl restart nginx

# Stop everything
pm2 stop all
sudo systemctl stop nginx

# Check what's running
pm2 status
sudo netstat -tlnp | grep -E ":(80|3000)"

# Reboot server (last resort)
sudo reboot
```

---

## 📁 IMPORTANT FILE LOCATIONS

```
/home/ubuntu/constructionCRM/
├── server.js                    # Backend
├── .env                         # Backend config (SECRET!)
├── inventory-frontend/build/    # Frontend files
└── inventory-frontend/.env.production  # Frontend config

/etc/nginx/sites-available/construction-crm  # Nginx config
/var/log/nginx/error.log        # Nginx errors
/var/log/nginx/access.log       # Nginx access logs
```

---

## 🔑 KEY INFORMATION

**EC2 Public IP**: ________________
**SSH Command**: 
```bash
ssh -i ~/Downloads/________.pem ubuntu@________________
```

**Application URL**: http://________________

**RDS Endpoint**: ________________

**Instance ID**: ________________

**AWS Region**: ________________

---

## ⚙️ PM2 COMMANDS

```bash
pm2 status                       # Show all processes
pm2 logs server    # View logs
pm2 restart server # Restart backend
pm2 stop server    # Stop backend
pm2 start server   # Start backend
pm2 delete server  # Remove process
pm2 flush                        # Clear logs
pm2 monit                        # Live monitoring
```

---

## 🌐 NGINX COMMANDS

```bash
sudo systemctl status nginx      # Check status
sudo systemctl start nginx       # Start
sudo systemctl stop nginx        # Stop
sudo systemctl restart nginx     # Restart
sudo systemctl reload nginx      # Reload config
sudo nginx -t                    # Test configuration
```

---

## 🔍 DEBUGGING CHECKLIST

1. ✅ Is EC2 running? (AWS Console)
2. ✅ Can you SSH into EC2?
3. ✅ Is backend running? (`pm2 status`)
4. ✅ Is Nginx running? (`sudo systemctl status nginx`)
5. ✅ Is port 3000 listening? (`sudo netstat -tlnp | grep 3000`)
6. ✅ Is port 80 listening? (`sudo netstat -tlnp | grep 80`)
7. ✅ Can backend reach database? (check pm2 logs)
8. ✅ RDS security group allows EC2?
9. ✅ Any errors in logs? (`pm2 logs`, nginx error log)
10. ✅ Disk space available? (`df -h`)

---

## 📈 PERFORMANCE MONITORING

```bash
# CPU usage
top
# Press 'q' to quit

# Memory usage
free -h

# Disk usage
df -h

# Check specific process
ps aux | grep node
ps aux | grep nginx

# Network connections
sudo netstat -tlnp
```

---

## 🔐 SECURITY GROUP PORTS

**EC2 Security Group:**
- 22 (SSH) - Your IP only
- 80 (HTTP) - 0.0.0.0/0
- 443 (HTTPS) - 0.0.0.0/0
- 3000 (API) - Optional, can close after setup

**RDS Security Group:**
- 3306 (MySQL) - EC2 security group

---

## 📚 DOCUMENTATION FILES

- `EC2-QUICKSTART.md` - Fast setup guide
- `deploy-to-ec2.md` - Complete manual
- `TROUBLESHOOTING.md` - Problem solutions
- `ARCHITECTURE.md` - System design
- `DEPLOYMENT-CHECKLIST.md` - Step-by-step checklist
- `DEPLOYMENT-SUMMARY.md` - Overview

---

## 💰 COST TRACKING

**Check current costs:**
AWS Console > Billing Dashboard > Cost Explorer

**Expected monthly cost:** $16-20

**Cost alerts:** Set up billing alarms in CloudWatch

---

## 🔄 UPDATE WORKFLOW

1. Develop locally
2. Test thoroughly
3. Commit: `git commit -am "Description"`
4. Push: `git push origin main`
5. SSH to EC2
6. Pull and deploy: `git pull && ./deploy.sh`
7. Test on production
8. Monitor for issues

**OR** use GitHub Actions for auto-deploy!

---

## 🆘 HELP RESOURCES

- **Troubleshooting**: Read `TROUBLESHOOTING.md`
- **Architecture**: Read `ARCHITECTURE.md`
- **AWS Docs**: https://docs.aws.amazon.com/ec2/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **Nginx Docs**: https://nginx.org/en/docs/

---

## ☎️ EMERGENCY CONTACTS

**AWS Support**: https://console.aws.amazon.com/support/
**Your Team**: ________________
**Database Admin**: ________________

---

## ✅ MAINTENANCE SCHEDULE

- **Daily**: Run `./monitoring.sh`
- **Weekly**: Check logs for errors
- **Monthly**: Update packages (`sudo apt update && sudo apt upgrade`)
- **Quarterly**: Review and optimize costs

---

**Last Updated**: ________________
**Printed**: ________________

═══════════════════════════════════════════════
Keep this card handy during deployment!
═══════════════════════════════════════════════

