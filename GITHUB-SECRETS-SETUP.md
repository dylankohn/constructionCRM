# GitHub Secrets Setup Guide

## What are GitHub Secrets?

GitHub Secrets are encrypted environment variables that you store in your GitHub repository settings. They're used for:
1. **CI/CD automated deployments** (GitHub Actions)
2. **Sensitive credentials** that shouldn't be in your code
3. **SSH keys, API keys, database passwords**, etc.

## 🔐 Required GitHub Secrets for This Project

### For Automated Deployment (GitHub Actions)

Go to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret Name | Description | Where to Get It | Example |
|------------|-------------|-----------------|---------|
| `EC2_HOST` | Your EC2 public IP or domain | AWS EC2 Console | `3.87.123.45` or `beamliner.com` |
| `EC2_USERNAME` | SSH username for EC2 | Always `ubuntu` for Ubuntu EC2 | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key (.pem file) | The `.pem` file you downloaded from AWS | (entire contents of .pem file) |
| `DB_HOST` | RDS database endpoint | AWS RDS Console | `constmang.c5gggomwcn9q.us-east-2.rds.amazonaws.com` |
| `DB_USER` | Database username | Your RDS credentials | `admin` |
| `DB_PASSWORD` | Database password | Your RDS credentials | `your-db-password` |
| `DB_NAME` | Database name | Your RDS database name | `construction_crm` |
| `JWT_SECRET` | Secret for JWT tokens | Generate with `openssl rand -base64 32` | Random 32-char string |

### Optional Secrets

| Secret Name | Description | When Needed |
|------------|-------------|-------------|
| `GOOGLE_MAPS_API_KEY` | For area calculator/maps | If using Google Maps features |
| `EMAIL_USER` | SMTP email for password resets | If using email features |
| `EMAIL_PASS` | SMTP email password | If using email features |
| `EMAIL_HOST` | SMTP server | If using email features |

## 📝 How to Add Secrets to GitHub

### Step 1: Go to Repository Settings
1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/constructionCRM`
2. Click **Settings** (top right)
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Add Each Secret

For each secret above:
1. Enter the **Name** (e.g., `EC2_HOST`)
2. Enter the **Value** (e.g., `3.87.123.45`)
3. Click **Add secret**

### Step 3: Special Instructions for EC2_SSH_KEY

Your `.pem` file needs to be copied as a secret:

```bash
# On your local machine, display the entire .pem file
cat ~/Downloads/your-ec2-key.pem
```

Copy the **entire output** (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) and paste it as the value for `EC2_SSH_KEY`.

## 🤖 GitHub Actions Workflow

Once secrets are set up, create this file to enable automated deployment:

**`.github/workflows/deploy.yml`**

```yaml
name: Deploy to EC2

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # Allows manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to EC2
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ${{ secrets.EC2_USERNAME }}
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd ~/constructionCRM
          git pull origin main
          npm install --production
          pm2 restart construction-crm-api
          cd inventory-frontend
          npm install
          npm run build
          sudo systemctl restart nginx
          pm2 logs construction-crm-api --lines 10
```

## ⚠️ IMPORTANT: What NOT to Put in GitHub

**NEVER commit these to your repository:**
- `.env` files
- `.pem` SSH key files
- Any file containing passwords, API keys, or secrets
- `node_modules/`
- `build/` folders

Your `.gitignore` should already have these excluded.

## 🔍 Verify Your Secrets

After adding secrets, you can verify they're set by:
1. Go to **Settings → Secrets and variables → Actions**
2. You should see a list of secret names (values are hidden)
3. You should see green checkmarks next to each

## 🚀 How to Use Secrets in GitHub Actions

Secrets are accessed in workflows using:
```yaml
${{ secrets.SECRET_NAME }}
```

Example:
```yaml
- name: SSH Deploy
  env:
    DB_HOST: ${{ secrets.DB_HOST }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

## 🛠️ Immediate Fix: Create .env on EC2

**You mentioned there's no .env file on your EC2 instance.** Here's how to create it:

### SSH into your EC2:
```bash
ssh -i ~/Downloads/your-key.pem ubuntu@YOUR_EC2_IP
```

### Create the .env file:
```bash
cd ~/constructionCRM

# Create and edit .env file
nano .env
```

### Paste this content (replace with your actual values):
```env
DB_HOST=constmang.c5gggomwcn9q.us-east-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-actual-db-password
DB_NAME=construction_crm
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://www.beamliner.com
JWT_SECRET=your-generated-jwt-secret-here
JWT_EXPIRES_IN=24h
```

### Generate JWT_SECRET:
```bash
# Generate a secure random secret
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET` value.

### Save the file:
- Press `Ctrl + O` (save)
- Press `Enter` (confirm)
- Press `Ctrl + X` (exit)

### Restart your backend:
```bash
pm2 restart construction-crm-api
pm2 logs construction-crm-api --lines 20
```

You should now see:
- ✅ Successfully connected to MySQL database!
- Server running on port 3000

## 🔑 Summary: Your GitHub Secrets Checklist

Minimum required for deployment automation:
- [ ] `EC2_HOST`
- [ ] `EC2_USERNAME` 
- [ ] `EC2_SSH_KEY`
- [ ] `DB_HOST`
- [ ] `DB_USER`
- [ ] `DB_PASSWORD`
- [ ] `DB_NAME`
- [ ] `JWT_SECRET`

Optional but recommended:
- [ ] `GOOGLE_MAPS_API_KEY`
- [ ] Email settings (if using password reset feature)

## 🎯 Next Steps

1. **Immediate:** Create `.env` file on EC2 (see above)
2. **Short-term:** Add secrets to GitHub repository
3. **Optional:** Set up GitHub Actions for automated deployment

The 401 error should be fixed once you create the `.env` file with the correct `JWT_SECRET` on your EC2 instance!

