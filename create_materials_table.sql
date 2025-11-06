-- Create materials table for job materials tracking
CREATE TABLE IF NOT EXISTS job_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_id INT NOT NULL,
  customer_id INT NOT NULL,
  
  -- Material Information
  material_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(50), -- e.g., "pieces", "sq ft", "lbs", "gallons"
  
  -- Cost Information
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * IFNULL(unit_cost, 0)) STORED,
  
  -- Status & Location
  status ENUM('needed', 'ordered', 'in_transit', 'delivered', 'installed') DEFAULT 'needed',
  location VARCHAR(255), -- warehouse, job site, supplier, etc.
  
  -- Supplier Information
  supplier VARCHAR(255),
  order_date DATE,
  expected_delivery DATE,
  actual_delivery DATE,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

