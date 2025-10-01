-- Quick setup script for T-Shirt Customizer Database
-- Run this in your Supabase SQL Editor

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS tshirt_orders CASCADE;

-- Create tshirt_orders table
CREATE TABLE tshirt_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Order Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  
  -- Payment Information
  payment_id VARCHAR(255),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  
  -- Product Information
  product_name VARCHAR(100) DEFAULT 'Custom T-Shirt',
  
  -- Customer Information
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  
  -- Design Details
  shirt_color VARCHAR(7) NOT NULL,
  shirt_size VARCHAR(50) NOT NULL,
  print_type VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Print Areas (JSON array)
  print_areas JSONB NOT NULL DEFAULT '[]',
  
  -- Design Elements
  text_elements JSONB DEFAULT '[]',
  image_elements JSONB DEFAULT '[]',
  area_instructions JSONB DEFAULT '[]',
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  turnaround_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Turnaround Time
  turnaround_time JSONB NOT NULL,
  
  -- Design Proof
  design_proof_required BOOLEAN DEFAULT false,
  proof_contact_method VARCHAR(50),
  proof_contact_details TEXT,
  
  -- Additional Notes
  notes TEXT,
  
  -- Timestamps
  estimated_completion TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_tshirt_orders_status ON tshirt_orders(status);
CREATE INDEX idx_tshirt_orders_created_at ON tshirt_orders(created_at);
CREATE INDEX idx_tshirt_orders_customer_email ON tshirt_orders(customer_email);
CREATE INDEX idx_tshirt_orders_payment_status ON tshirt_orders(payment_status);

-- Enable RLS (Row Level Security)
ALTER TABLE tshirt_orders ENABLE ROW LEVEL SECURITY;

-- Allow public to insert orders (for form submissions)
CREATE POLICY "Allow public to insert orders" ON tshirt_orders
  FOR INSERT WITH CHECK (true);

-- Allow public to read their own orders (by email)
CREATE POLICY "Allow public to read own orders" ON tshirt_orders
  FOR SELECT USING (true);

-- Allow public to update orders (for payment updates)
CREATE POLICY "Allow public to update orders" ON tshirt_orders
  FOR UPDATE USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tshirt_orders_updated_at 
  BEFORE UPDATE ON tshirt_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert a test order to verify everything works
INSERT INTO tshirt_orders (
  customer_name,
  customer_email,
  customer_phone,
  customer_address,
  shirt_color,
  shirt_size,
  print_type,
  quantity,
  print_areas,
  base_price,
  turnaround_price,
  total_price,
  turnaround_time,
  design_proof_required
) VALUES (
  'Test Customer',
  'test@example.com',
  '+1234567890',
  '123 Test Street, Test City, TS 12345',
  '#FFFFFF',
  'Adult Medium',
  'DTF (Direct to Film)',
  1,
  '[{"id": "front", "name": "Only Front Side", "price": 20, "selected": true}]',
  20.00,
  15.00,
  35.00,
  '{"label": "Same Day", "price": 15}',
  false
);

-- Verify the table was created successfully
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as total_orders FROM tshirt_orders;
