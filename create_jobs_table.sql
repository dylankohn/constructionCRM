-- Drop existing jobs table if you need to recreate it
-- DROP TABLE IF EXISTS jobs;

-- Create jobs table with comprehensive fields
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  customer_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  
  -- Financial Information
  quote_amount DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  budget DECIMAL(10, 2),
  payment_status ENUM('not_started', 'partial', 'paid', 'overdue') DEFAULT 'not_started',
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  estimated_completion DATE,
  
  -- Location & Contact
  job_site_address TEXT,
  contact_person VARCHAR(255),
  contact_phone VARCHAR(50),
  
  -- Planning & Notes
  planning_notes TEXT,
  materials_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

