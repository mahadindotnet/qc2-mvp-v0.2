-- Color Copies Database Schema
-- Run this in your Supabase SQL Editor

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS color_copies_orders CASCADE;

-- Create color_copies_orders table
CREATE TABLE color_copies_orders (
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
  product_name VARCHAR(100) DEFAULT 'Color Copies',
  
  -- Print Options
  print_type VARCHAR(100) NOT NULL, -- e.g., '8.5x11-single', '11x14-single', etc.
  print_type_label VARCHAR(200), -- e.g., '8.5x11 - Single side'
  print_type_price DECIMAL(10,2) NOT NULL,
  
  -- Quantity
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- File Uploads (stored as JSON array of file info)
  front_side_files JSONB DEFAULT '[]', -- Array of file objects with name, size, type, url
  
  -- Design Instructions
  front_side_instructions TEXT,
  
  -- Turnaround Time
  turnaround_time VARCHAR(100) NOT NULL, -- e.g., 'normal', 'same-day', etc.
  turnaround_time_label VARCHAR(200), -- e.g., 'Normal ($0.00)'
  turnaround_time_price DECIMAL(10,2) NOT NULL,
  
  -- Design Proof
  design_proof_required BOOLEAN DEFAULT false,
  design_proof VARCHAR(100), -- e.g., 'Yes, send design proof before printing'
  proof_contact_method VARCHAR(50), -- e.g., 'whatsapp', 'email', etc.
  proof_contact_details TEXT, -- Phone number, email, etc.
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL, -- Print type price
  turnaround_price DECIMAL(10,2) NOT NULL, -- Turnaround time price
  total_price DECIMAL(10,2) NOT NULL, -- Final total (base + turnaround) * quantity
  
  -- Additional Notes
  notes TEXT,
  
  -- Timestamps
  estimated_completion TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_color_copies_orders_status ON color_copies_orders(status);
CREATE INDEX idx_color_copies_orders_created_at ON color_copies_orders(created_at);
CREATE INDEX idx_color_copies_orders_payment_status ON color_copies_orders(payment_status);
CREATE INDEX idx_color_copies_orders_print_type ON color_copies_orders(print_type);

-- Enable RLS (Row Level Security)
ALTER TABLE color_copies_orders ENABLE ROW LEVEL SECURITY;

-- Allow public to insert orders (for form submissions)
CREATE POLICY "Allow public to insert color copies orders" ON color_copies_orders
  FOR INSERT WITH CHECK (true);

-- Allow public to read orders
CREATE POLICY "Allow public to read color copies orders" ON color_copies_orders
  FOR SELECT USING (true);

-- Allow public to update orders (for payment updates)
CREATE POLICY "Allow public to update color copies orders" ON color_copies_orders
  FOR UPDATE USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_color_copies_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_color_copies_orders_updated_at 
  BEFORE UPDATE ON color_copies_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_color_copies_updated_at_column();

-- Insert a test order to verify everything works
INSERT INTO color_copies_orders (
  print_type,
  print_type_label,
  print_type_price,
  quantity,
  front_side_instructions,
  turnaround_time,
  turnaround_time_label,
  turnaround_time_price,
  design_proof_required,
  design_proof,
  base_price,
  turnaround_price,
  total_price
) VALUES (
  '11x14-single',
  '11x14 - Single side',
  1.00,
  1,
  'Please make the text bold and centered',
  'normal',
  'Normal ($0.00)',
  0.00,
  false,
  'No, proceed directly to printing',
  1.00,
  0.00,
  1.00
);

-- Verify the table was created successfully
SELECT 'Color Copies database setup completed successfully!' as status;
SELECT COUNT(*) as total_orders FROM color_copies_orders;
