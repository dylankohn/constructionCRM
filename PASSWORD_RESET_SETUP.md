

# Password Reset Feature - Setup Guide

## Overview

The password reset feature allows users to reset their passwords via email. Users request a reset link, receive it by email, and can set a new password.

---

## 📋 Setup Steps

### 1. Database Setup

Run these SQL scripts on your RDS database:

```bash
# Add email column to users table
mysql -h YOUR_RDS_ENDPOINT -u admin -p YOUR_DATABASE < add_email_to_users.sql

# Create password reset tokens table
mysql -h YOUR_RDS_ENDPOINT -u admin -p YOUR_DATABASE < create_password_reset_table.sql
```

Or manually in MySQL Workbench:

```sql
-- Add email column
ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE AFTER username;
CREATE INDEX idx_email ON users(email);

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expires (expires_at)
);
```

### 2. Email Service Setup

#### Option A: Gmail (Easiest for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Create an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Add to .env file**:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=Construction CRM
FRONTEND_URL=https://www.beamliner.com
```

#### Option B: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com/
2. Create an API key
3. **Add to .env file**:

```env
# Email Configuration
EMAIL_SERVICE=sendgrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM_NAME=Construction CRM
FRONTEND_URL=https://www.beamliner.com
```

#### Option C: AWS SES (Best for AWS Infrastructure)

1. Set up AWS SES in your region
2. Verify your domain
3. **Add to .env file**:

```env
# Email Configuration
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
EMAIL_FROM_NAME=Construction CRM
FRONTEND_URL=https://www.beamliner.com
```

### 3. Install Dependencies

```bash
# Backend
cd /path/to/constructionCRM
npm install

# Frontend
cd inventory-frontend
npm install
```

### 4. Update Existing Users with Emails

If you have existing users without emails:

```sql
-- Option 1: Update manually
UPDATE users SET email = 'dylan@example.com' WHERE username = 'Dylan';
UPDATE users SET email = 'grant@example.com' WHERE username = 'Grant';

-- Option 2: Set placeholder emails (users will need to update later)
UPDATE users SET email = CONCAT(LOWER(username), '@placeholder.com') WHERE email IS NULL;
```

### 5. Test the Feature

1. **Start the backend** (should automatically restart with new code)
2. **Build frontend**:
   ```bash
   cd inventory-frontend
   REACT_APP_API_URL=https://www.beamliner.com npm run build
   ```
3. **Test flow**:
   - Go to https://www.beamliner.com
   - Click "Forgot Password?"
   - Enter your email
   - Check your inbox for reset email
   - Click the link (valid for 1 hour)
   - Enter new password
   - Log in with new password

---

## 🔒 Security Features

✅ **Tokens are hashed** in database (SHA-256)  
✅ **Tokens expire** after 1 hour  
✅ **Single use tokens** (marked as used after reset)  
✅ **Rate limiting** on reset requests  
✅ **No email enumeration** (same response whether email exists or not)  
✅ **Password strength indicator** on reset page  
✅ **Automatic cleanup** of old tokens  

---

## 📧 Email Templates

The system sends two types of emails:

### 1. Password Reset Request Email
- Sent when user requests password reset
- Contains secure reset link
- Link expires in 1 hour
- Professional HTML and plain text versions

### 2. Password Reset Confirmation Email
- Sent after successful password reset
- Confirms the change
- Alerts user if they didn't make the change

---

## 🔧 Customization

### Change Token Expiration Time

In `server.js`, line ~235:

```javascript
// Current: 1 hour
const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

// Change to 30 minutes:
const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

// Change to 2 hours:
const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
```

### Customize Email Templates

Edit `services/emailService.js`:
- Change colors/styles in the HTML
- Modify text content
- Add company logo
- Change from email name

### Add Password Requirements

In `server.js` and `ResetPassword.js`, add:
- Minimum length requirements
- Special character requirements
- Uppercase/lowercase requirements
- Number requirements

---

## 🐛 Troubleshooting

### Email Not Sending

**Check server logs**:
```bash
pm2 logs server
```

**Common issues**:
- ❌ Wrong email credentials → Check EMAIL_USER and EMAIL_PASSWORD in .env
- ❌ App password not enabled → Use Gmail App Password, not regular password
- ❌ Port blocked → Try SMTP_PORT=465 with secure:true
- ❌ Less secure apps → Gmail requires App Passwords with 2FA

**Test email manually**:
```bash
cd /home/ubuntu/constructionCRM
node -e "
const { sendPasswordResetEmail } = require('./services/emailService');
require('dotenv').config();
sendPasswordResetEmail('your@email.com', 'test-token-123', 'TestUser')
  .then(() => console.log('✅ Email sent!'))
  .catch(err => console.error('❌ Error:', err));
"
```

### Token Invalid/Expired

- Tokens expire after 1 hour
- Tokens can only be used once
- Request a new reset link

### Database Errors

**Table doesn't exist**:
```sql
SHOW TABLES; -- Check if password_reset_tokens exists
```

**Column doesn't exist**:
```sql
DESCRIBE users; -- Check if email column exists
```

---

## 📊 Monitoring

### Clean Up Old Tokens

Add this to a cron job (optional):

```sql
-- Delete expired or used tokens older than 24 hours
DELETE FROM password_reset_tokens 
WHERE (expires_at < NOW() OR used = TRUE) 
AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
```

### Check Recent Reset Requests

```sql
-- See recent password reset requests
SELECT u.username, u.email, rt.created_at, rt.used, rt.expires_at
FROM password_reset_tokens rt
JOIN users u ON rt.user_id = u.id
ORDER BY rt.created_at DESC
LIMIT 20;
```

---

## 🚀 Deployment

The password reset feature is automatically deployed with your GitHub Actions workflow.

Make sure to:
1. ✅ Add email environment variables to `.env` on server
2. ✅ Run database migrations
3. ✅ Restart backend: `pm2 restart server`
4. ✅ Rebuild frontend with new routes

---

## 📝 User Communication

When rolling out this feature, notify users:

> **New Feature: Password Reset** 🔒
> 
> You can now reset your password if you forget it!
> 
> 1. Click "Forgot Password?" on the login page
> 2. Enter your email address
> 3. Check your inbox for a reset link
> 4. Create your new password
> 
> **Important**: Make sure your account has a valid email address. If you need to update your email, contact support.

---

## Need Help?

- Check server logs: `pm2 logs server`
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Test email service with the manual test command above
- Verify database tables and columns exist

---

**Feature Implemented**: January 2026  
**Backend**: Node.js + Express + Nodemailer  
**Frontend**: React + React Router  
**Database**: MySQL (AWS RDS)

