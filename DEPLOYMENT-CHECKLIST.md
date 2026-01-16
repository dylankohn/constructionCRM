# AWS EC2 Deployment Checklist

Use this checklist to ensure a smooth deployment. Check off items as you complete them.

## 📋 Pre-Deployment Preparation

### AWS Account Setup
- [ ] AWS account created and verified
- [ ] Payment method added to AWS account
- [ ] Have access to AWS Console
- [ ] Understand basic AWS billing

### Database Information
- [ ] RDS MySQL database is running
- [ ] Have RDS endpoint URL (e.g., `xxx.rds.amazonaws.com`)
- [ ] Have database username
- [ ] Have database password
- [ ] Have database name
- [ ] Can connect to RDS from local machine (test)

### API Keys & Credentials
- [ ] Have Google Maps API key
- [ ] Google Maps API key is enabled for:
  - [ ] Maps JavaScript API
  - [ ] Geocoding API
  - [ ] Places API
- [ ] Have GitHub account (if using CI/CD)
- [ ] Code is pushed to GitHub repository

### Domain (Optional)
- [ ] Domain purchased (if using custom domain)
- [ ] Have access to domain DNS settings
- [ ] Know how to create A records

---

## 🚀 EC2 Instance Setup

### Launch Instance
- [ ] Logged into AWS Console
- [ ] Navigated to EC2 Dashboard
- [ ] Clicked "Launch Instance"
- [ ] Named instance: `construction-crm-server`
- [ ] Selected OS: Ubuntu Server 22.04 LTS
- [ ] Selected instance type: t3.small or t2.micro
- [ ] Created or selected SSH key pair
- [ ] **IMPORTANT**: Downloaded .pem key file
- [ ] Saved .pem file in secure location: `~/Downloads/construction-crm-key.pem`

### Configure Security Group
- [ ] Created security group: `construction-crm-sg`
- [ ] Added inbound rule: SSH (port 22) from My IP
- [ ] Added inbound rule: HTTP (port 80) from 0.0.0.0/0
- [ ] Added inbound rule: HTTPS (port 443) from 0.0.0.0/0
- [ ] Added inbound rule: Custom TCP (port 3000) from 0.0.0.0/0 (optional)

### Storage Configuration
- [ ] Set root volume to at least 20 GB
- [ ] Volume type: gp3 (General Purpose SSD)

### Launch and Verify
- [ ] Clicked "Launch Instance"
- [ ] Waited for instance state: "running"
- [ ] Copied Public IPv4 address: `________________`
- [ ] Copied Instance ID: `________________`

---

## 🔐 Initial Connection

### Prepare SSH Key
```bash
chmod 400 ~/Downloads/construction-crm-key.pem
```
- [ ] Made key file secure (chmod 400)
- [ ] Tested SSH key permissions

### Connect to Instance
```bash
ssh -i ~/Downloads/construction-crm-key.pem ubuntu@YOUR_EC2_IP
```
- [ ] Successfully connected to EC2 via SSH
- [ ] Accepted SSH fingerprint prompt
- [ ] Saw Ubuntu welcome message

---

## 📦 Server Setup

### Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/constructionCRM.git
cd constructionCRM
```
- [ ] Cloned repository successfully
- [ ] Changed to project directory
- [ ] Verified files are present: `ls -la`

### Make Scripts Executable
```bash
chmod +x setup-ec2.sh deploy.sh monitoring.sh
```
- [ ] Made setup script executable
- [ ] Made deploy script executable
- [ ] Made monitoring script executable

### Run Setup Script
```bash
./setup-ec2.sh
```
- [ ] Started setup script
- [ ] Script installed Node.js successfully
- [ ] Script installed PM2 successfully
- [ ] Script installed Nginx successfully
- [ ] Script installed Git successfully

### Provide Configuration During Setup
When prompted, entered:
- [ ] RDS Database Host: `________________`
- [ ] Database Username: `________________`
- [ ] Database Password: `________________`
- [ ] Database Name: `________________`
- [ ] Google Maps API Key: `________________`

### Verify Setup Completion
- [ ] Setup script completed without errors
- [ ] Saw "Setup complete!" message
- [ ] Backend status shows "online"
- [ ] Nginx status shows "active (running)"

---

## 🔗 Database Connection

### Update RDS Security Group
- [ ] Opened AWS Console in new tab
- [ ] Navigated to RDS > Databases
- [ ] Clicked on your database instance
- [ ] Clicked on "Connectivity & Security" tab
- [ ] Clicked on the VPC security group
- [ ] Clicked "Edit inbound rules"
- [ ] Clicked "Add rule"
- [ ] Selected Type: "MySQL/Aurora"
- [ ] Selected Port: 3306
- [ ] Selected Source: EC2 security group (construction-crm-sg)
- [ ] Clicked "Save rules"

### Test Database Connection
```bash
pm2 logs server
```
- [ ] Saw "Successfully connected to MySQL database!" in logs
- [ ] No database connection errors
- [ ] Backend is running properly

---

## 🌐 Access Your Application

### Test in Browser
- [ ] Opened browser
- [ ] Navigated to: `http://YOUR_EC2_IP`
- [ ] Frontend loaded successfully
- [ ] No console errors (press F12 to check)
- [ ] Login page appeared

### Test Functionality
- [ ] Created test account
- [ ] Logged in successfully
- [ ] Created test customer
- [ ] Created test job
- [ ] Added test material
- [ ] Tested Area Calculator
- [ ] All features work correctly

---

## 📊 Post-Deployment Verification

### Run Monitoring Script
```bash
./monitoring.sh
```
- [ ] System resources look healthy
- [ ] Backend status: online
- [ ] Nginx status: running
- [ ] Ports 80 and 3000 are listening
- [ ] No recent errors in logs

### Manual Checks
```bash
pm2 status
sudo systemctl status nginx
df -h
free -h
```
- [ ] PM2 shows server online
- [ ] Nginx is active and running
- [ ] Disk space has 50%+ free
- [ ] Memory has 30%+ free

---

## 🔒 Security Hardening (Optional but Recommended)

### Set Up SSL Certificate (if you have domain)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
- [ ] Domain DNS pointing to EC2 IP
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] HTTPS working
- [ ] HTTP redirects to HTTPS

### Update Security Group (after testing)
- [ ] Removed port 3000 from security group (no longer needed)
- [ ] Restricted SSH to specific IP (changed from 0.0.0.0/0 to My IP)

### Update Credentials
- [ ] Changed RDS master password (optional)
- [ ] Updated .env file with new password
- [ ] Restarted backend: `pm2 restart server`

---

## 🤖 CI/CD Setup (Optional)

### Configure GitHub Secrets
In GitHub repository settings:
- [ ] Navigated to Settings > Secrets and variables > Actions
- [ ] Added secret: `EC2_HOST` (your EC2 public IP)
- [ ] Added secret: `EC2_USERNAME` (ubuntu)
- [ ] Added secret: `EC2_SSH_KEY` (contents of .pem file)

### Test GitHub Actions
- [ ] Made small code change
- [ ] Committed and pushed to main branch
- [ ] Workflow triggered successfully
- [ ] Deployment completed automatically
- [ ] Changes visible on website

---

## 📝 Documentation

### Save Important Information
Created a secure note with:
- [ ] EC2 Instance ID: `________________`
- [ ] EC2 Public IP: `________________`
- [ ] EC2 Private Key location: `________________`
- [ ] RDS Endpoint: `________________`
- [ ] AWS Region: `________________`
- [ ] Application URL: `http://________________`

### Document for Team (if applicable)
- [ ] Shared deployment guide with team
- [ ] Documented environment setup
- [ ] Created runbook for common tasks
- [ ] Documented troubleshooting procedures

---

## 📈 Monitoring & Maintenance Setup

### Set Up CloudWatch (Optional)
- [ ] Enabled detailed monitoring for EC2
- [ ] Set up CPU utilization alarm (>80%)
- [ ] Set up disk space alarm (<20% free)
- [ ] Set up status check alarm

### Schedule Regular Tasks
- [ ] Set up weekly monitoring: `crontab -e`
  ```
  0 9 * * 1 cd ~/constructionCRM && ./monitoring.sh > ~/weekly-status.log
  ```
- [ ] Plan monthly RDS snapshots
- [ ] Plan monthly security updates

---

## 🎉 Final Verification

### Complete Testing
- [ ] Tested all major features
- [ ] Tested on different browsers (Chrome, Firefox, Safari)
- [ ] Tested on mobile device
- [ ] Load tested (if expecting high traffic)
- [ ] All features work as expected

### Performance Check
- [ ] Page loads quickly (<3 seconds)
- [ ] API responses are fast
- [ ] No memory leaks (check `free -h` after use)
- [ ] No error logs building up

### Backup Verification
- [ ] RDS automated backups are enabled
- [ ] Took manual RDS snapshot
- [ ] Backed up .env files securely
- [ ] Documented all credentials in secure location

---

## ✅ Deployment Complete!

Congratulations! Your Construction CRM is now live on AWS EC2.

### Next Steps:
1. Monitor application for first few days
2. Set up domain and SSL (if not done)
3. Configure automated backups
4. Plan for scaling if traffic grows
5. Keep dependencies updated monthly

### Maintenance Schedule:
- **Daily**: Check monitoring script output
- **Weekly**: Review logs for errors
- **Monthly**: Update packages and dependencies
- **Quarterly**: Review costs and optimize

### Important URLs:
- Application: `http://YOUR_EC2_IP`
- AWS Console: https://console.aws.amazon.com/
- GitHub Repository: https://github.com/YOUR_USERNAME/constructionCRM

### Quick Reference Commands:
```bash
# SSH into server
ssh -i ~/Downloads/construction-crm-key.pem ubuntu@YOUR_EC2_IP

# Check status
./monitoring.sh

# View logs
pm2 logs server

# Deploy updates
git pull && ./deploy.sh

# Restart services
pm2 restart server
sudo systemctl restart nginx
```

---

## 📞 Support Resources

- [ ] Bookmarked: AWS EC2 Documentation
- [ ] Bookmarked: PM2 Documentation  
- [ ] Bookmarked: Nginx Documentation
- [ ] Saved: TROUBLESHOOTING.md locally
- [ ] Know where to find deployment guides

---

**Deployment Date**: _______________
**Deployed By**: _______________
**EC2 Instance**: _______________
**Version/Commit**: _______________

🎊 **Your Construction CRM is now live!** 🎊

