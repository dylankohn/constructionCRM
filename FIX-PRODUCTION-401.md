# Fix Production 401 Error - Step by Step

You're now SSH'd into your EC2 instance. Follow these steps:

## Step 1: Navigate to the project directory and check .env

```bash
cd ~/constructionCRM
ls -la .env
cat .env
```

## Step 2: Check if backend is running

```bash
pm2 list
pm2 logs server --lines 50
```

## Step 3: Fix the .env file

If `.env` doesn't exist or is missing JWT_SECRET, create/update it:

```bash
cd ~/constructionCRM

# Check current .env content
cat .env

# If it doesn't exist or is missing values, edit it:
nano .env
```

Your `.env` should have AT MINIMUM these values:

```env
DB_HOST=constmang.c5gggomwcn9q.us-east-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-actual-db-password
DB_NAME=construction_crm
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://www.beamliner.com
JWT_SECRET=generate-a-random-secret-here
JWT_EXPIRES_IN=24h
```

### To generate a secure JWT_SECRET:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your JWT_SECRET value.

## Step 4: Verify Database Connection

```bash
# Load environment variables
cd ~/constructionCRM
export $(cat .env | xargs)

# Test database connection
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT 'Database connected!' as status;"
```

## Step 5: Check if users exist and passwords are hashed

```bash
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME \
  -e "SELECT id, username, LEFT(password, 20) as password_prefix FROM users;"
```

**Expected:** Passwords should start with `$2a$` or `$2b$` (bcrypt hash)

**If passwords are plain text**, run this to hash them:

```bash
cd ~/constructionCRM
node scripts/hash-passwords.js
```

## Step 6: Restart the backend

```bash
pm2 restart server
pm2 logs server --lines 20
```

You should see:
- `✅ Successfully connected to MySQL database!`
- `Server running on port 3000`

## Step 7: Test login from EC2

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}'
```

If this works, you'll get a JSON response with a token.

## Step 8: Test from your browser

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

## Common Issues & Solutions

### Issue: No .env file exists
**Solution:** Create it with the template above

### Issue: JWT_SECRET is missing
**Solution:** Generate and add it:
```bash
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
pm2 restart server
```

### Issue: Passwords are not hashed
**Solution:**
```bash
node scripts/hash-passwords.js
```

### Issue: Database connection timeout
**Solution:** Check RDS security group allows EC2 instance IP

### Issue: Backend not running
**Solution:**
```bash
cd ~/constructionCRM
pm2 start server.js --name server
pm2 save
```

## Quick Fix Script

If you want to fix everything at once:

```bash
cd ~/constructionCRM

# Generate JWT_SECRET if missing
if ! grep -q "JWT_SECRET" .env; then
  echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
  echo "✅ Added JWT_SECRET"
fi

# Hash any plain-text passwords
node scripts/hash-passwords.js

# Restart backend
pm2 restart server

# Check logs
pm2 logs server --lines 30
```

