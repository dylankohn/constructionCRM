# 🔒 Security Guide - Construction CRM

## Current Security Status

### ✅ Already Implemented
- Environment variables for sensitive data
- `.env` in `.gitignore`
- Parameterized SQL queries (SQL injection prevention)
- HTTPS on production (beamliner.com)
- CORS configuration

### ⚠️ Needs Improvement
- [ ] Database SSL/TLS encryption
- [ ] API authentication (JWT)
- [ ] Rate limiting
- [ ] Input validation
- [ ] Password hashing (for user passwords)
- [ ] AWS security groups tightened
- [ ] Security headers

---

## 1. Database Security (AWS RDS)

### A. Enable SSL/TLS Connections

Update `server.js` database connection:

```javascript
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  // Add SSL configuration
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('./rds-ca-bundle.pem')  // Download from AWS
  }
});
```

**Download RDS CA Certificate:**
```bash
cd ~/constructionCRM
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O rds-ca-bundle.pem
```

### B. Restrict Database Access (AWS Console)

1. Go to **AWS RDS Console** → Your Database → **Security Groups**
2. **Edit Inbound Rules:**
   - **Remove:** `0.0.0.0/0` (if present)
   - **Add:** Your EC2 instance security group
   - **Add:** Your local IP (for development only)

### C. Strong Database Password

```bash
# Update .env with a strong password (20+ characters)
DB_PASSWORD=Xy9#mK2$pL8@nQ4!wR7^tY5&hJ3*bN6
```

**Generate strong password:**
```bash
openssl rand -base64 32
```

---

## 2. API Authentication (JWT)

### Install Dependencies

```bash
npm install jsonwebtoken bcryptjs
```

### Update `.env`

```bash
JWT_SECRET=your-256-bit-secret-here
JWT_EXPIRES_IN=24h
```

**Generate JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Update Login Endpoint in `server.js`

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateToken, rateLimiter } = require('./middleware/auth');

// Apply rate limiter globally
app.use(rateLimiter);

// Login endpoint (generate JWT)
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = results[0];
      
      // Compare hashed password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
    }
  );
});

// Protect all routes (add after login route)
app.use(authenticateToken);

// Now all routes below require authentication
```

### Update Frontend to Send JWT

In `inventory-frontend/src/api/api.js`:

```javascript
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
};
```

---

## 3. Password Hashing

### Hash User Passwords

**One-time migration script** (`scripts/hash-passwords.js`):

```javascript
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function hashExistingPasswords() {
  db.query('SELECT id, password FROM users', async (err, users) => {
    if (err) throw err;
    
    for (const user of users) {
      // Only hash if password isn't already hashed
      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        db.query(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, user.id],
          (err) => {
            if (err) console.error(err);
            else console.log(`✅ Hashed password for user ${user.id}`);
          }
        );
      }
    }
  });
}

hashExistingPasswords();
```

**Run once:**
```bash
node scripts/hash-passwords.js
```

---

## 4. Input Validation & Sanitization

### Install Validator

```bash
npm install validator express-validator
```

### Add Validation Middleware

```javascript
const { body, validationResult } = require('express-validator');

// Example: Validate customer creation
app.post('/customers',
  authenticateToken,
  [
    body('name').trim().isLength({ min: 1, max: 255 }).escape(),
    body('user_id').isInt()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Proceed with database insertion
    const { user_id, name } = req.body;
    db.query(
      'INSERT INTO customers (user_id, name) VALUES (?, ?)',
      [user_id, name],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Customer added', customerId: results.insertId, name });
      }
    );
  }
);
```

---

## 5. Security Headers

### Install Helmet

```bash
npm install helmet
```

### Add to `server.js`

```javascript
const helmet = require('helmet');

// Add security headers
app.use(helmet());

// Or customize:
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## 6. CORS Hardening

### Update `server.js` CORS Configuration

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://beamliner.com',
      'https://www.beamliner.com',
      'http://localhost:3001'  // Development only
    ];
    
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## 7. AWS Security Checklist

### EC2 Security Group (Inbound Rules)
```
Port 22 (SSH):    Your IP only (not 0.0.0.0/0)
Port 80 (HTTP):   0.0.0.0/0 (redirects to HTTPS)
Port 443 (HTTPS): 0.0.0.0/0
Port 3000:        DENY (backend should not be publicly accessible)
```

### RDS Security Group (Inbound Rules)
```
Port 3306 (MySQL): EC2 Security Group only (NOT 0.0.0.0/0)
```

### IAM Best Practices
- Use IAM roles for EC2 (not access keys)
- Enable MFA on root account
- Use least privilege principle

---

## 8. Environment Variables Checklist

### Production `.env` (EC2)
```bash
# Database
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=<strong-password-here>
DB_NAME=construction_crm

# JWT
JWT_SECRET=<64-character-random-string>
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://beamliner.com
```

### Local `.env` (Development)
```bash
# Database (local or dev RDS)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-local-password
DB_NAME=construction_crm_dev

# JWT
JWT_SECRET=<different-secret-for-dev>
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3001
```

---

## 9. Regular Security Maintenance

### Weekly
- [ ] Review access logs for suspicious activity
- [ ] Check for failed login attempts

### Monthly
- [ ] Update npm dependencies: `npm audit fix`
- [ ] Review and rotate JWT secrets
- [ ] Check SSL certificate expiry

### Quarterly
- [ ] Update Node.js and system packages
- [ ] Review and update security groups
- [ ] Audit user accounts and permissions

---

## 10. Additional Security Tools

### A. npm audit
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Force fix (breaking changes possible)
npm audit fix --force
```

### B. Snyk (Optional)
```bash
npm install -g snyk
snyk test
```

### C. AWS Secrets Manager (Advanced)
Instead of `.env` files, use AWS Secrets Manager for production:
```bash
aws secretsmanager get-secret-value --secret-id construction-crm-db
```

---

## Quick Security Wins (Do These First!)

1. **Strong passwords everywhere** (DB, AWS, users)
2. **Enable MFA on AWS account**
3. **Tighten security groups** (RDS & EC2)
4. **Keep dependencies updated** (`npm audit`)
5. **Enable HTTPS** (already done ✅)
6. **Restrict CORS origins** (production only)

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

**Need Help?** Ask me about any of these security measures! 🔒

