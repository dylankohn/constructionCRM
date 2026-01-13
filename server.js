const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// CORS configuration - allow only trusted origins
const allowedOrigins = [
  // Production domains
  'https://beamliner.com',
  'https://www.beamliner.com',
  'http://beamliner.com',
  'http://www.beamliner.com',
  
  // Development (only in non-production)
  process.env.NODE_ENV !== 'production' ? 'http://localhost:3001' : null,
  process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : null,
  process.env.NODE_ENV !== 'production' ? 'http://localhost:19000' : null,
  process.env.NODE_ENV !== 'production' ? 'http://localhost:19001' : null,
  process.env.NODE_ENV !== 'production' ? 'http://localhost:19002' : null,
].filter(Boolean);

// CORS origin validator function
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // In development, allow localhost with any port
    if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Block all other origins
    console.warn(`⚠️  CORS blocked: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Security headers with Helmet
app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (needed for React)
      scriptSrc: ["'self'"], 
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // HTTP Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
  // X-Frame-Options (prevent clickjacking)
  frameguard: {
    action: 'deny'
  },
  // X-Content-Type-Options (prevent MIME sniffing)
  noSniff: true,
  // X-XSS-Protection (legacy but still useful)
  xssFilter: true,
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  // Remove X-Powered-By header
  hidePoweredBy: true
}));

app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  // SSL configuration (optional - see SECURITY.md Step 1 for setup)
  // ssl: {
  //   rejectUnauthorized: true,
  //   ca: fs.readFileSync('./rds-ca-bundle.pem')
  // }
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('✅ Successfully connected to MySQL database!');
  connection.release();
});

// -------------------------
// IMPORTS FOR AUTH & VALIDATION
// -------------------------

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateToken, authRateLimiter, apiRateLimiter } = require('./middleware/auth');
const validate = require('./middleware/validation');

// Apply generous rate limiter to all API endpoints (1000 req/min)
app.use(apiRateLimiter);

// -------------------------
// AUTH ROUTES
// -------------------------

// Create account - Apply strict rate limiter (10 attempts/min)
app.post('/auth/register', authRateLimiter, validate.register, async (req, res) => {
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  try {
    // Hash the password before storing
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      (err, results) => {
        if (err) {
          // Check for duplicate username
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Account created', userId: results.insertId });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error creating account' });
  }
});

// Login endpoint (generate JWT)
// Login - Apply strict rate limiter (10 attempts/min)
app.post('/auth/login', authRateLimiter, validate.login, async (req, res) => {
  const { username, password } = req.body;
  
  console.log('🔐 Login attempt:', { username, passwordLength: password?.length });
  
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) {
        console.error('❌ DB error:', err.message);
        return res.status(500).json({ error: err.message });
      }
      
      if (results.length === 0) {
        console.log('❌ User not found:', username);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = results[0];
      console.log('✓ User found:', { 
        id: user.id, 
        username: user.username, 
        hasPassword: !!user.password,
        passwordPrefix: user.password?.substring(0, 10)
      });
      
      // Compare hashed password
      const validPassword = await bcrypt.compare(password, user.password);
      console.log('🔑 Password comparison result:', validPassword);
      
      if (!validPassword) {
        console.log('❌ Invalid password for user:', username);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      console.log('✅ Login successful:', username);
      
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

// Password reset - Request reset token
app.post('/auth/forgot-password', authRateLimiter, validate.email, async (req, res) => {
  const { email } = req.body;
  
  try {
    // Find user by email (assuming email column exists, or use username)
    db.query(
      'SELECT id, username, email FROM users WHERE email = ? OR username = ?',
      [email, email],
      async (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Server error' });
        }
        
        // Always return success to prevent email enumeration
        if (results.length === 0) {
          return res.json({ 
            message: 'If an account exists with that email, a password reset link has been sent.' 
          });
        }
        
        const user = results[0];
        
        // Generate secure reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Set expiration (1 hour from now)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        
        // Store hashed token in database
        db.query(
          'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [user.id, hashedToken, expiresAt],
          async (err) => {
            if (err) {
              console.error('Error storing reset token:', err);
              return res.status(500).json({ error: 'Error processing request' });
            }
            
            // Send email with reset token
            try {
              const { sendPasswordResetEmail } = require('./services/emailService');
              await sendPasswordResetEmail(
                user.email || email, 
                resetToken, 
                user.username
              );
              
              res.json({ 
                message: 'If an account exists with that email, a password reset link has been sent.' 
              });
            } catch (emailError) {
              console.error('Error sending email:', emailError);
              // Don't reveal email sending failure to user
              res.json({ 
                message: 'If an account exists with that email, a password reset link has been sent.' 
              });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Password reset - Reset password with token
app.post('/auth/reset-password', authRateLimiter, validate.resetPassword, async (req, res) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  try {
    // Hash the provided token to match stored hash
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find valid, unused token
    db.query(
      `SELECT rt.*, u.id as user_id, u.username, u.email 
       FROM password_reset_tokens rt 
       JOIN users u ON rt.user_id = u.id 
       WHERE rt.token = ? AND rt.expires_at > NOW() AND rt.used = FALSE`,
      [hashedToken],
      async (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Server error' });
        }
        
        if (results.length === 0) {
          return res.status(400).json({ 
            error: 'Invalid or expired reset token' 
          });
        }
        
        const tokenRecord = results[0];
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update user password
        db.query(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, tokenRecord.user_id],
          async (err) => {
            if (err) {
              console.error('Error updating password:', err);
              return res.status(500).json({ error: 'Error updating password' });
            }
            
            // Mark token as used
            db.query(
              'UPDATE password_reset_tokens SET used = TRUE WHERE id = ?',
              [tokenRecord.id],
              () => {} // Don't wait for this
            );
            
            // Send confirmation email
            try {
              const { sendPasswordResetConfirmation } = require('./services/emailService');
              await sendPasswordResetConfirmation(
                tokenRecord.email,
                tokenRecord.username
              );
            } catch (emailError) {
              console.error('Error sending confirmation:', emailError);
              // Don't fail the reset if email fails
            }
            
            res.json({ 
              message: 'Password reset successful. You can now log in with your new password.' 
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error in reset-password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protect all routes (add after login route)
app.use(authenticateToken);


// -------------------------
// CUSTOMER ROUTES
// -------------------------

// Get all customers for a specific user
app.get('/customers/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM customers WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new customer for a specific user
app.post('/customers', validate.customer, (req, res) => {
  const { user_id, name } = req.body;
  db.query(
    'INSERT INTO customers (user_id, name) VALUES (?, ?)',
    [user_id, name],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Customer added', customerId: results.insertId, name });
    }
  );
});

// Update a customer name (only if it belongs to the user)
app.put('/customers/:id/:userId', validate.customerUpdate, (req, res) => {
  const { id, userId } = req.params;
  const { name } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Customer name is required' });
  }
  
  db.query(
    'UPDATE customers SET name = ? WHERE id = ? AND user_id = ?',
    [name.trim(), id, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Customer not found or access denied' });
      }
      res.json({ message: 'Customer updated', name: name.trim() });
    }
  );
});

// Delete a customer (only if it belongs to the user)
app.delete('/customers/:id/:userId', (req, res) => {
  const { id, userId } = req.params;
  db.query('DELETE FROM customers WHERE id = ? AND user_id = ?', [id, userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Customer deleted' });
  });
});

// -------------------------
// JOB ROUTES
// -------------------------

// Get all jobs for a specific customer
app.get('/jobs/customer/:customerId/:userId', (req, res) => {
  const { customerId, userId } = req.params;
  db.query(
    'SELECT * FROM jobs WHERE customer_id = ? AND user_id = ? ORDER BY created_at DESC',
    [customerId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Get a single job by ID
app.get('/jobs/:jobId/:userId', (req, res) => {
  const { jobId, userId } = req.params;
  db.query(
    'SELECT * FROM jobs WHERE id = ? AND user_id = ?',
    [jobId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Job not found' });
      res.json(results[0]);
    }
  );
});

// Add a new job for a customer
app.post('/jobs', validate.job, (req, res) => {
  const { user_id, customer_id, name, description, status } = req.body;
  db.query(
    'INSERT INTO jobs (user_id, customer_id, name, description, status) VALUES (?, ?, ?, ?, ?)',
    [user_id, customer_id, name, description || null, status || 'pending'],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Job added', jobId: results.insertId, name });
    }
  );
});

// Update a job
app.put('/jobs/:id/:userId', validate.job, (req, res) => {
  const { id, userId } = req.params;
  const { 
    name, 
    description, 
    status,
    quote_amount,
    actual_cost,
    budget,
    payment_status,
    start_date,
    end_date,
    estimated_completion,
    job_site_address,
    contact_person,
    contact_phone,
    planning_notes,
    materials_notes
  } = req.body;
  
  db.query(
    `UPDATE jobs SET 
      name = ?, 
      description = ?, 
      status = ?,
      quote_amount = ?,
      actual_cost = ?,
      budget = ?,
      payment_status = ?,
      start_date = ?,
      end_date = ?,
      estimated_completion = ?,
      job_site_address = ?,
      contact_person = ?,
      contact_phone = ?,
      planning_notes = ?,
      materials_notes = ?
    WHERE id = ? AND user_id = ?`,
    [
      name, 
      description, 
      status,
      quote_amount || null,
      actual_cost || null,
      budget || null,
      payment_status || 'not_started',
      start_date || null,
      end_date || null,
      estimated_completion || null,
      job_site_address || null,
      contact_person || null,
      contact_phone || null,
      planning_notes || null,
      materials_notes || null,
      id,
      userId
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Job updated' });
    }
  );
});

// Delete a job
app.delete('/jobs/:id/:userId', (req, res) => {
  const { id, userId } = req.params;
  db.query('DELETE FROM jobs WHERE id = ? AND user_id = ?', [id, userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Job deleted' });
  });
});

// -------------------------
// MATERIALS ROUTES
// -------------------------

// Get all materials for a specific job
app.get('/materials/job/:jobId/:userId', (req, res) => {
  const { jobId, userId } = req.params;
  db.query(
    'SELECT * FROM job_materials WHERE job_id = ? AND user_id = ? ORDER BY created_at DESC',
    [jobId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Add a new material to a job
app.post('/materials', validate.material, (req, res) => {
  const { user_id, job_id, customer_id, material_name, description, quantity, unit, unit_cost, status, location, supplier, order_date, expected_delivery, actual_delivery, notes, material_type, dimensions } = req.body;
  
  // Convert dimensions object to JSON string if provided
  const dimensionsJson = dimensions ? JSON.stringify(dimensions) : null;
  
  db.query(
    `INSERT INTO job_materials 
    (user_id, job_id, customer_id, material_name, material_type, description, quantity, unit, unit_cost, status, location, supplier, order_date, expected_delivery, actual_delivery, notes, dimensions) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, job_id, customer_id, material_name, material_type || null, description || null, quantity, unit || null, unit_cost || null, status || 'needed', location || null, supplier || null, order_date || null, expected_delivery || null, actual_delivery || null, notes || null, dimensionsJson],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update job's actual_cost
      updateJobActualCost(job_id, user_id);
      
      res.json({ message: 'Material added', materialId: results.insertId });
    }
  );
});

// Update a material
app.put('/materials/:id/:userId', validate.material, (req, res) => {
  const { id, userId } = req.params;
  const { material_name, description, quantity, unit, unit_cost, status, location, supplier, order_date, expected_delivery, actual_delivery, notes, job_id, material_type, dimensions } = req.body;
  
  // Convert dimensions object to JSON string if provided
  const dimensionsJson = dimensions ? JSON.stringify(dimensions) : null;
  
  db.query(
    `UPDATE job_materials SET 
      material_name = ?,
      material_type = ?,
      description = ?,
      quantity = ?,
      unit = ?,
      unit_cost = ?,
      status = ?,
      location = ?,
      supplier = ?,
      order_date = ?,
      expected_delivery = ?,
      actual_delivery = ?,
      notes = ?,
      dimensions = ?
    WHERE id = ? AND user_id = ?`,
    [material_name, material_type || null, description || null, quantity, unit || null, unit_cost || null, status || 'needed', location || null, supplier || null, order_date || null, expected_delivery || null, actual_delivery || null, notes || null, dimensionsJson, id, userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update job's actual_cost
      if (job_id) {
        updateJobActualCost(job_id, userId);
      }
      
      res.json({ message: 'Material updated' });
    }
  );
});

// Delete a material
app.delete('/materials/:id/:userId/:jobId', (req, res) => {
  const { id, userId, jobId } = req.params;
  db.query('DELETE FROM job_materials WHERE id = ? AND user_id = ?', [id, userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Update job's actual_cost
    updateJobActualCost(jobId, userId);
    
    res.json({ message: 'Material deleted' });
  });
});

// Helper function to update job's actual cost based on materials
function updateJobActualCost(jobId, userId) {
  db.query(
    'SELECT SUM(total_cost) as total FROM job_materials WHERE job_id = ? AND user_id = ?',
    [jobId, userId],
    (err, results) => {
      if (err) {
        console.error('Error calculating total cost:', err);
        return;
      }
      const totalCost = results[0].total || 0;
      db.query(
        'UPDATE jobs SET actual_cost = ? WHERE id = ? AND user_id = ?',
        [totalCost, jobId, userId],
        (err) => {
          if (err) console.error('Error updating job actual_cost:', err);
        }
      );
    }
  );
}

// -------------------------
// INVENTORY ROUTES
// -------------------------

// Get inventory for a user
app.get('/inventory/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM inventory WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add an inventory item for a user
app.post('/inventory', (req, res) => {
  const { user_id, item_name, quantity } = req.body;
  db.query(
    'INSERT INTO inventory (user_id, item_name, quantity) VALUES (?, ?, ?)',
    [user_id, item_name, quantity],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item added', itemId: results.insertId });
    }
  );
});

// Update inventory item quantity
app.put('/inventory/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  db.query('UPDATE inventory SET quantity = ? WHERE id = ?', [quantity, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Quantity updated' });
  });
});

// Delete an inventory item
app.delete('/inventory/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM inventory WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item deleted' });
  });
});

// -------------------------
// AREA ROUTES
// -------------------------

// Save area to a job
app.post('/areas', (req, res) => {
  const { user_id, job_id, customer_id, area_name, area_value, unit, shape_data } = req.body;
  
  db.query(
    'INSERT INTO job_areas (user_id, job_id, customer_id, area_name, area_value, unit, shape_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
    [user_id, job_id, customer_id, area_name, area_value, unit, shape_data],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Area saved successfully', areaId: results.insertId });
    }
  );
});

// Get all areas for a user
app.get('/areas/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.query(
    `SELECT ja.*, j.name as job_name, c.name as customer_name 
     FROM job_areas ja 
     LEFT JOIN jobs j ON ja.job_id = j.id 
     LEFT JOIN customers c ON ja.customer_id = c.id 
     WHERE ja.user_id = ? 
     ORDER BY ja.created_at DESC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Get all areas for a job
app.get('/areas/job/:jobId/:userId', (req, res) => {
  const { jobId, userId } = req.params;
  
  db.query(
    'SELECT * FROM job_areas WHERE job_id = ? AND user_id = ? ORDER BY created_at DESC',
    [jobId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Delete an area
app.delete('/areas/:id/:userId', (req, res) => {
  const { id, userId } = req.params;
  
  db.query(
    'DELETE FROM job_areas WHERE id = ? AND user_id = ?',
    [id, userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Area deleted' });
    }
  );
});

// -------------------------
// START SERVER
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
