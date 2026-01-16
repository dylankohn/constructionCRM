# Production 401 Login Error - Debug Checklist

## Issue
Getting 401 Unauthorized on beamliner.com login, but same credentials work locally.

## Most Likely Causes

### 1. Password Hash Mismatch
**Problem:** Production database has different password hashes than local database.

**Check on EC2:**
```bash
# SSH into your EC2 instance
ssh ubuntu@your-ec2-ip

# Connect to production database
cd ~/constructionCRM
source .env  # or set DB variables manually

# Check if user exists and password format
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME \
  -e "SELECT id, username, LEFT(password, 20) as password_prefix FROM users;"
```

**Expected:** Password should start with `$2a$` or `$2b$` (bcrypt hash)

**Fix if needed:**
```bash
cd ~/constructionCRM
node scripts/hash-passwords.js
```

### 2. Missing JWT_SECRET in Production
**Problem:** JWT_SECRET not set or different between environments.

**Check on EC2:**
```bash
cd ~/constructionCRM
grep JWT_SECRET .env
```

**Expected:** Should have `JWT_SECRET=some-random-string`

**Fix if missing:**
```bash
# Add to .env file
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
pm2 restart server
```

### 3. Database Connection Issue
**Problem:** Backend can't connect to RDS database.

**Check on EC2:**
```bash
pm2 logs server --lines 50
```

**Look for:**
- Database connection errors
- Login attempt logs (🔐 Login attempt:)
- User not found errors (❌ User not found:)
- Password validation errors (❌ Invalid password)

### 4. CORS or Proxy Issue
**Problem:** Request not reaching backend properly.

**Check nginx logs:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Check backend is running:**
```bash
pm2 list
curl http://localhost:3000/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}'
```

## Quick Fix Commands

### If password is the issue (most likely):
```bash
cd ~/constructionCRM
# This will hash any plain-text passwords in production DB
node scripts/hash-passwords.js

# Check PM2 logs to verify backend is working
pm2 logs server --lines 20
```

### If JWT_SECRET is missing:
```bash
cd ~/constructionCRM
# Check .env file
cat .env | grep JWT

# If missing, add it
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
pm2 restart server
pm2 logs server --lines 10
```

### If user doesn't exist in production:
```bash
cd ~/constructionCRM
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME

# In MySQL prompt:
-- Check users
SELECT * FROM users;

-- Create a test user (password will be 'test123')
-- First, generate a bcrypt hash locally, then insert
```

## Test Login from Browser Console

Open browser console on beamliner.com and run:

```javascript
fetch('https://www.beamliner.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    username: 'your-username', 
    password: 'your-password' 
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

This will show you the exact error message from the server.

## Environment Variable Checklist

Your production `.env` should have:
```bash
DB_HOST=constmang.c5gggomwcn9q.us-east-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-db-password
DB_NAME=construction_crm
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://www.beamliner.com
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=24h
```

## Next Steps

1. SSH into EC2
2. Check PM2 logs first: `pm2 logs server --lines 50`
3. Look for login attempt logs when you try to login
4. Check if JWT_SECRET exists in .env
5. Verify user exists in production database with proper password hash
6. Run hash-passwords.js script if needed
7. Check that the .env DB credentials match your RDS instance

