-- Custom Gangsheet Database Schema
-- Run this in your Supabase SQL Editor

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS gangsheet_orders CASCADE;

-- Create gangsheet_orders table
CREATE TABLE gangsheet_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Order Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  
  -- Payment Information
  payment_id VARCHAR(255),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  
  -- Customer Information
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  
  -- Product Information
  product_name VARCHAR(100) DEFAULT 'Custom Gangsheet',
  
  -- Gangsheet Specifications
  gangsheet_height INTEGER NOT NULL, -- Height in feet
  gangsheet_width INTEGER DEFAULT 22, -- Fixed width in inches
  setup_type VARCHAR(20) NOT NULL CHECK (setup_type IN ('full_setup', 'element_only')),
  
  -- Full Setup Files (stored as JSON array of file info)
  full_setup_files JSONB DEFAULT '[]', -- Array of file objects with name, size, type, url
  
  -- Design Elements (for element_only setup)
  design_elements JSONB DEFAULT '[]', -- Array of element objects with name, quantity, files, notes
  
  -- Special Instructions
  special_instructions TEXT,
  
  -- Turnaround Time
  turnaround_time VARCHAR(100) NOT NULL, -- e.g., 'normal', 'rush', 'express', 'same_day'
  turnaround_time_label VARCHAR(200), -- e.g., 'Normal (5-7 business days)'
  turnaround_time_price DECIMAL(10,2) NOT NULL,
  
  -- Design Proof
  design_proof_required BOOLEAN DEFAULT false,
  design_proof VARCHAR(100), -- e.g., 'Yes, send design proof before printing'
  proof_contact_method VARCHAR(50), -- e.g., 'whatsapp', 'email', 'phone'
  proof_contact_details TEXT, -- Phone number, email, etc.
  
  -- Pricing
  gangsheet_area DECIMAL(10,2) NOT NULL, -- Total area in square inches (width * height * 12)
  cost_per_square_inch DECIMAL(10,2) DEFAULT 0.50,
  base_price DECIMAL(10,2) NOT NULL, -- Area * cost_per_square_inch
  turnaround_price DECIMAL(10,2) NOT NULL, -- Turnaround time price
  total_price DECIMAL(10,2) NOT NULL, -- Final total (base + turnaround)
  
  -- Additional Notes
  notes TEXT,
  
  -- Timestamps
  estimated_completion TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_gangsheet_orders_status ON gangsheet_orders(status);
CREATE INDEX idx_gangsheet_orders_created_at ON gangsheet_orders(created_at);
CREATE INDEX idx_gangsheet_orders_payment_status ON gangsheet_orders(payment_status);
CREATE INDEX idx_gangsheet_orders_setup_type ON gangsheet_orders(setup_type);
CREATE INDEX idx_gangsheet_orders_gangsheet_height ON gangsheet_orders(gangsheet_height);

-- Enable RLS (Row Level Security)
ALTER TABLE gangsheet_orders ENABLE ROW LEVEL SECURITY;

-- Allow public to insert orders (for form submissions)
CREATE POLICY "Allow public to insert gangsheet orders" ON gangsheet_orders
  FOR INSERT WITH CHECK (true);

-- Allow public to read orders
CREATE POLICY "Allow public to read gangsheet orders" ON gangsheet_orders
  FOR SELECT USING (true);

-- Allow public to update orders (for payment updates)
CREATE POLICY "Allow public to update gangsheet orders" ON gangsheet_orders
  FOR UPDATE USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_gangsheet_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_gangsheet_orders_updated_at 
  BEFORE UPDATE ON gangsheet_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_gangsheet_updated_at_column();

-- Insert a test order to verify everything works
INSERT INTO gangsheet_orders (
  gangsheet_height,
  setup_type,
  full_setup_files,
  design_elements,
  special_instructions,
  turnaround_time,
  turnaround_time_label,
  turnaround_time_price,
  design_proof_required,
  design_proof,
  gangsheet_area,
  base_price,
  turnaround_price,
  total_price
) VALUES (
  5, -- 5 feet height
  'full_setup',
  '[{"name": "test-file.pdf", "size": 1024000, "type": "application/pdf", "url": "https://example.com/test-file.pdf"}]',
  '[]',
  'Please ensure high quality printing',
  'normal',
  'Normal (5-7 business days)',
  0.00,
  false,
  'No, proceed directly to printing',
  1320.00, -- 22 * 5 * 12 = 1320 square inches
  660.00, -- 1320 * 0.50 = $660
  0.00,
  660.00
);

-- Verify the table was created successfully
SELECT 'Custom Gangsheet database setup completed successfully!' as status;
SELECT COUNT(*) as total_orders FROM gangsheet_orders;
