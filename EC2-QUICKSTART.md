# AWS EC2 Deployment - Quick Start Guide

## 🚀 Quick Start (15 minutes)

### 1. Launch EC2 Instance
- Go to AWS Console > EC2 > Launch Instance
- Choose **Ubuntu 22.04 LTS**
- Select **t3.small** (or t2.micro for testing)
- Configure security group (ports 22, 80, 443, 3000)
- Launch and save your `.pem` key file

### 2. Connect to EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### 3. Clone and Run Setup Script
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/constructionCRM.git
cd constructionCRM

# Make scripts executable
chmod +x setup-ec2.sh deploy.sh monitoring.sh

# Run the setup script (will prompt for database credentials)
./setup-ec2.sh
```

The setup script will:
✅ Install Node.js, PM2, Nginx, and Git
✅ Configure your backend and frontend
✅ Set up environment variables
✅ Build and deploy everything
✅ Configure automatic startup

### 4. Update RDS Security Group
⚠️ **CRITICAL STEP**
1. Go to AWS Console > RDS > Your Database
2. Click on the VPC security group
3. Add inbound rule:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: Your EC2's security group

### 5. Access Your App
Open your browser: `http://YOUR_EC2_IP`

---

## 📋 Manual Setup (if you prefer step-by-step)

See the full guide in `deploy-to-ec2.md`

---

## 🔄 Updating Your App

After making code changes:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Navigate to project and run deploy script
cd constructionCRM
git pull
./deploy.sh
```

---

## 🔍 Monitoring

Check your app status:
```bash
./monitoring.sh
```

Common commands:
```bash
pm2 logs construction-crm-api  # View backend logs
pm2 restart construction-crm-api  # Restart backend
sudo systemctl restart nginx  # Restart web server
sudo tail -f /var/log/nginx/error.log  # View Nginx errors
```

---

## 🔒 Setting Up HTTPS (Recommended)

If you have a domain:
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🤖 Automated Deployments (Optional)

Set up GitHub Actions for automatic deployments:

1. Add these secrets to your GitHub repository:
   - `EC2_HOST`: Your EC2 public IP
   - `EC2_USERNAME`: ubuntu
   - `EC2_SSH_KEY`: Contents of your .pem file

2. Every push to main will auto-deploy!

---

## 💰 Estimated Costs

- **EC2 t3.small**: ~$15/month
- **RDS**: Already covered
- **Data Transfer**: ~$1-5/month
- **Total**: ~$16-20/month

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect to database | Check RDS security group allows EC2 |
| 502 Bad Gateway | Backend is down: `pm2 restart construction-crm-api` |
| Blank frontend | Check build: `ls inventory-frontend/build` |
| API errors | Check CORS in server.js |

Full troubleshooting guide in `deploy-to-ec2.md`

---

## 📚 Files Reference

- `deploy-to-ec2.md` - Complete step-by-step guide
- `setup-ec2.sh` - Initial setup script
- `deploy.sh` - Update/deployment script
- `monitoring.sh` - Health check script
- `env.example` - Backend environment template
- `inventory-frontend/env.production.example` - Frontend environment template

---

## ✅ Pre-Deployment Checklist

- [ ] AWS account created
- [ ] EC2 instance launched (Ubuntu 22.04)
- [ ] Security group configured (ports 22, 80, 443, 3000)
- [ ] SSH key downloaded and secured
- [ ] RDS database running
- [ ] Database credentials available
- [ ] Google Maps API key ready
- [ ] Code pushed to GitHub

Ready? Run `./setup-ec2.sh` on your EC2 instance!

