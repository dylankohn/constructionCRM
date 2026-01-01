-- Add dimension fields to job_materials table
-- This allows storing material dimensions (length, width, height, thickness, diameter)
-- Run this migration to enable the material dimensions feature

ALTER TABLE job_materials
ADD COLUMN material_type VARCHAR(50) AFTER material_name,
ADD COLUMN dimensions JSON AFTER description;

-- Optional: Add an index for faster queries on material_type
CREATE INDEX idx_material_type ON job_materials(material_type);

-- Example of how dimensions will be stored:
-- dimensions: {"length": "96", "width": "3.5", "thickness": "1.5"}

