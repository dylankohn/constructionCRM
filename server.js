const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'inventory-frontend/build')));
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('✅ Successfully connected to MySQL database!');
});

// -------------------------
// AUTH ROUTES
// -------------------------

// Create account
app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Account created', userId: results.insertId });
    }
  );
});

// Login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
      res.json({ message: 'Login successful', user: results[0] });
    }
  );
});

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
app.post('/customers', (req, res) => {
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
app.post('/jobs', (req, res) => {
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
app.put('/jobs/:id/:userId', (req, res) => {
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
app.post('/materials', (req, res) => {
  const { user_id, job_id, customer_id, material_name, description, quantity, unit, unit_cost, status, location, supplier, order_date, expected_delivery, actual_delivery, notes } = req.body;
  db.query(
    `INSERT INTO job_materials 
    (user_id, job_id, customer_id, material_name, description, quantity, unit, unit_cost, status, location, supplier, order_date, expected_delivery, actual_delivery, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, job_id, customer_id, material_name, description || null, quantity, unit || null, unit_cost || null, status || 'needed', location || null, supplier || null, order_date || null, expected_delivery || null, actual_delivery || null, notes || null],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update job's actual_cost
      updateJobActualCost(job_id, user_id);
      
      res.json({ message: 'Material added', materialId: results.insertId });
    }
  );
});

// Update a material
app.put('/materials/:id/:userId', (req, res) => {
  const { id, userId } = req.params;
  const { material_name, description, quantity, unit, unit_cost, status, location, supplier, order_date, expected_delivery, actual_delivery, notes, job_id } = req.body;
  
  db.query(
    `UPDATE job_materials SET 
      material_name = ?,
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
      notes = ?
    WHERE id = ? AND user_id = ?`,
    [material_name, description || null, quantity, unit || null, unit_cost || null, status || 'needed', location || null, supplier || null, order_date || null, expected_delivery || null, actual_delivery || null, notes || null, id, userId],
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
// CATCH-ALL ROUTE FOR SPA (Production Only)
// -------------------------
// This must be AFTER all API routes
// Only applies when serving the built React app
if (process.env.NODE_ENV === 'production') {
  app.get('/:path(*)', (req, res) => {
    res.sendFile(path.join(__dirname, 'inventory-frontend/build', 'index.html'));
  });
}

// -------------------------
// START SERVER
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
