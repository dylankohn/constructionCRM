# 🎉 AWS EC2 Deployment - Ready!

Your Construction CRM is now ready to deploy to AWS EC2!

## 📦 What's Been Set Up

### ✅ Configuration Files Updated

1. **Backend (server.js)**
   - ✅ Updated CORS to accept EC2 IP addresses
   - ✅ Configured to use environment variables

2. **Frontend API Config**
   - ✅ Updated to use `REACT_APP_API_URL` environment variable
   - ✅ Falls back to localhost for development

### ✅ Deployment Scripts Created

1. **`setup-ec2.sh`** - Initial server setup
   - Installs Node.js, PM2, Nginx, Git
   - Prompts for database credentials
   - Builds and deploys everything
   - Configures automatic startup

2. **`deploy.sh`** - Quick update script
   - Pulls latest code
   - Rebuilds frontend and backend
   - Restarts services
   - Shows deployment status

3. **`monitoring.sh`** - Health check script
   - System resources (CPU, memory, disk)
   - Service status (PM2, Nginx)
   - Recent logs and errors
   - API health check

### ✅ Documentation Created

1. **`EC2-QUICKSTART.md`** - 15-minute quick start guide
2. **`deploy-to-ec2.md`** - Complete step-by-step deployment guide
3. **`TROUBLESHOOTING.md`** - Common issues and solutions
4. **`README.md`** - Updated with deployment section

### ✅ Configuration Templates

1. **`env.example`** - Backend environment variables template
2. **`inventory-frontend/env.production.example`** - Frontend environment template

### ✅ CI/CD Setup

1. **`.github/workflows/deploy.yml`** - Automated GitHub Actions deployment
   - Auto-deploys on push to main branch
   - Can also trigger manually

### ✅ Git Configuration

1. **`.gitignore`** - Updated to exclude:
   - Environment files (.env)
   - SSH keys (.pem)
   - Production builds
   - Logs

---

## 🚀 Quick Deploy Instructions

### Option 1: Automated Setup (Recommended)

```bash
# 1. Launch Ubuntu EC2 instance on AWS
# 2. SSH into your instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# 3. Clone and setup
git clone https://github.com/YOUR_USERNAME/constructionCRM.git
cd constructionCRM
chmod +x setup-ec2.sh deploy.sh monitoring.sh
./setup-ec2.sh
```

The script will guide you through everything!

### Option 2: Manual Step-by-Step

Follow the complete guide in `deploy-to-ec2.md`

---

## 📋 Pre-Deployment Checklist

Before you start, make sure you have:

- [ ] AWS account with EC2 access
- [ ] RDS MySQL database already running (you have this!)
- [ ] Database credentials (host, username, password, database name)
- [ ] Google Maps API key
- [ ] Your code pushed to GitHub (if using CI/CD)
- [ ] Domain name (optional, for HTTPS)

---

## 🎯 Next Steps

1. **Launch EC2 Instance**
   - Go to AWS Console > EC2
   - Choose Ubuntu 22.04 LTS
   - Select t3.small or t2.micro
   - Configure security group (ports 22, 80, 443, 3000)
   - Download your SSH key

2. **Run Setup Script**
   ```bash
   ssh -i your-key.pem ubuntu@YOUR_EC2_IP
   git clone YOUR_REPO_URL
   cd constructionCRM
   ./setup-ec2.sh
   ```

3. **Configure RDS Security Group**
   - Allow MySQL connections from EC2 security group
   - See `EC2-QUICKSTART.md` for details

4. **Access Your App**
   - Open `http://YOUR_EC2_IP` in browser
   - Test all features

5. **Set Up HTTPS (Optional)**
   - Configure domain in Route 53
   - Run Certbot for SSL certificate
   - See guide in `deploy-to-ec2.md`

---

## 📚 Documentation Reference

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **EC2-QUICKSTART.md** | Fast setup guide | First time deploying |
| **deploy-to-ec2.md** | Complete manual | Detailed step-by-step |
| **TROUBLESHOOTING.md** | Problem solving | When issues occur |
| **setup-ec2.sh** | Automated setup | Run on new EC2 |
| **deploy.sh** | Quick updates | After code changes |
| **monitoring.sh** | Health checks | Regular monitoring |

---

## 🛠️ Useful Commands

Once deployed, you can use these commands on your EC2 instance:

```bash
# Monitor your app
./monitoring.sh

# View backend logs
pm2 logs construction-crm-api

# Restart services
pm2 restart construction-crm-api
sudo systemctl restart nginx

# Update your app
git pull
./deploy.sh

# Check everything
pm2 status
sudo systemctl status nginx
df -h  # disk space
free -h  # memory
```

---

## 💰 Expected Costs

Monthly costs (approximate):
- **EC2 t3.small**: $15-18
- **EC2 t2.micro** (free tier): $0 (first year)
- **RDS**: Already covered by your existing setup
- **Data transfer**: $1-5
- **Total**: $16-23/month (or $1-5 if using free tier EC2)

You can reduce costs by:
- Using t2.micro (free tier eligible)
- Stopping EC2 when not in use (development)
- Using Reserved Instances for long-term

---

## 🔒 Security Considerations

✅ **Already configured:**
- Environment variables for sensitive data
- CORS restrictions
- Security group isolation

🔜 **Recommended additions:**
- SSL/TLS certificate (free with Let's Encrypt)
- Regular security updates
- Automated backups
- CloudWatch monitoring
- Password hashing for user authentication (future update)

---

## 🚨 Important Notes

### RDS Security Group
**This is the #1 cause of deployment issues!**

You MUST update your RDS security group to allow connections from your EC2 instance:
1. AWS Console > RDS > Your Database > Security Group
2. Add inbound rule: MySQL/Aurora, Port 3306, Source: EC2's security group
3. Save

### Environment Variables
Never commit `.env` files to Git! Use the example files as templates.

### First Deployment
The setup script will ask for:
- RDS host endpoint
- Database username and password
- Database name
- Google Maps API key

Have these ready before running `./setup-ec2.sh`

---

## 🎓 Learning Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt SSL](https://letsencrypt.org/getting-started/)

---

## ✨ Features of This Deployment

✅ **Zero-downtime updates** with PM2
✅ **Automatic restart** on server reboot
✅ **Production-optimized** React build
✅ **Reverse proxy** with Nginx
✅ **Gzip compression** for faster loading
✅ **Static asset caching**
✅ **Easy monitoring** with custom scripts
✅ **CI/CD ready** with GitHub Actions
✅ **Comprehensive error logging**

---

## 🤝 Support

If you run into issues:

1. Check `TROUBLESHOOTING.md` first
2. Run `./monitoring.sh` to diagnose
3. Check logs: `pm2 logs construction-crm-api`
4. Review error logs: `sudo tail -f /var/log/nginx/error.log`

Common issues and solutions are all documented in `TROUBLESHOOTING.md`

---

## 🎯 Ready to Deploy?

**Start here:** `EC2-QUICKSTART.md`

Good luck with your deployment! 🚀

---

*Last updated: January 2026*

