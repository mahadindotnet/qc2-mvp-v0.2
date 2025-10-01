-- Future-Ready Quote System Database Schema
-- This extends the existing tshirt_orders table with comprehensive quote functionality

-- Create quotes table for comprehensive quote management
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Quote Identification
  quote_reference VARCHAR(50) UNIQUE NOT NULL,
  quote_status VARCHAR(20) DEFAULT 'pending' CHECK (quote_status IN ('pending', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
  
  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_address TEXT,
  customer_company VARCHAR(255),
  
  -- Quote Details
  quote_notes TEXT,
  internal_notes TEXT,
  quote_expiry_date TIMESTAMP WITH TIME ZONE,
  quote_sent_at TIMESTAMP WITH TIME ZONE,
  quote_accepted_at TIMESTAMP WITH TIME ZONE,
  quote_rejected_at TIMESTAMP WITH TIME ZONE,
  quote_follow_up_date TIMESTAMP WITH TIME ZONE,
  
  -- Products (JSONB array for multiple products)
  products JSONB NOT NULL DEFAULT '[]',
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  -- Conversion tracking
  converted_to_order_id UUID REFERENCES tshirt_orders(id),
  conversion_date TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  estimated_completion TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create quote_products table for detailed product tracking
CREATE TABLE IF NOT EXISTS quote_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Product Information
  product_id VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_category VARCHAR(100) NOT NULL,
  
  -- Product Specifications
  quantity INTEGER NOT NULL DEFAULT 1,
  size VARCHAR(100),
  custom_size VARCHAR(255),
  color VARCHAR(7),
  print_type VARCHAR(100),
  custom_print_type VARCHAR(255),
  
  -- Print Areas and Design
  print_areas JSONB DEFAULT '[]',
  text_elements JSONB DEFAULT '[]',
  image_elements JSONB DEFAULT '[]',
  area_instructions JSONB DEFAULT '[]',
  
  -- Turnaround and Proof
  turnaround_time JSONB NOT NULL,
  design_proof_required BOOLEAN DEFAULT false,
  proof_contact_method VARCHAR(50),
  proof_contact_details TEXT,
  
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Additional Details
  notes TEXT,
  specifications JSONB DEFAULT '{}'
);

-- Create quote_attachments table for file management
CREATE TABLE IF NOT EXISTS quote_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- File Information
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  
  -- Attachment Details
  attachment_type VARCHAR(50) NOT NULL, -- 'design', 'reference', 'logo', 'document'
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  
  -- Metadata
  uploaded_by VARCHAR(255),
  file_hash VARCHAR(64) -- For duplicate detection
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(quote_status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_email ON quotes(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotes_reference ON quotes(quote_reference);
CREATE INDEX IF NOT EXISTS idx_quotes_expiry ON quotes(quote_expiry_date);

CREATE INDEX IF NOT EXISTS idx_quote_products_quote_id ON quote_products(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_products_category ON quote_products(product_category);

CREATE INDEX IF NOT EXISTS idx_quote_attachments_quote_id ON quote_attachments(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_attachments_type ON quote_attachments(attachment_type);

-- Enable RLS (Row Level Security)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_attachments ENABLE ROW LEVEL SECURITY;

-- Allow public to insert quotes (for form submissions)
CREATE POLICY "Allow public to insert quotes" ON quotes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to insert quote products" ON quote_products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to insert quote attachments" ON quote_attachments
  FOR INSERT WITH CHECK (true);

-- Allow public to read quotes (for customer access)
CREATE POLICY "Allow public to read quotes" ON quotes
  FOR SELECT USING (true);

CREATE POLICY "Allow public to read quote products" ON quote_products
  FOR SELECT USING (true);

CREATE POLICY "Allow public to read quote attachments" ON quote_attachments
  FOR SELECT USING (true);

-- Allow public to update quotes (for status updates)
CREATE POLICY "Allow public to update quotes" ON quotes
  FOR UPDATE USING (true);

CREATE POLICY "Allow public to update quote products" ON quote_products
  FOR UPDATE USING (true);

CREATE POLICY "Allow public to update quote attachments" ON quote_attachments
  FOR UPDATE USING (true);

-- Create function to generate quote reference numbers
CREATE OR REPLACE FUNCTION generate_quote_reference()
RETURNS TEXT AS $$
DECLARE
  reference TEXT;
  counter INTEGER;
BEGIN
  -- Get current date in YYMMDD format
  reference := TO_CHAR(NOW(), 'YYMMDD');
  
  -- Get count of quotes created today
  SELECT COUNT(*) + 1 INTO counter
  FROM quotes
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Format as YYMMDD-XXX
  reference := reference || '-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN reference;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate quote reference
CREATE OR REPLACE FUNCTION set_quote_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_reference IS NULL OR NEW.quote_reference = '' THEN
    NEW.quote_reference := generate_quote_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_quote_reference_trigger
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_quote_reference();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_quotes_updated_at_trigger
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_quotes_updated_at();

-- Create function to calculate quote totals
CREATE OR REPLACE FUNCTION calculate_quote_totals(quote_uuid UUID)
RETURNS VOID AS $$
DECLARE
  quote_subtotal DECIMAL(10,2);
  quote_tax DECIMAL(10,2);
  quote_discount DECIMAL(10,2);
  quote_total DECIMAL(10,2);
BEGIN
  -- Calculate subtotal from quote_products
  SELECT COALESCE(SUM(total_price), 0) INTO quote_subtotal
  FROM quote_products
  WHERE quote_id = quote_uuid;
  
  -- Calculate tax (8.5% for example)
  quote_tax := quote_subtotal * 0.085;
  
  -- No discount for now
  quote_discount := 0.00;
  
  -- Calculate total
  quote_total := quote_subtotal + quote_tax - quote_discount;
  
  -- Update the quote
  UPDATE quotes
  SET 
    subtotal = quote_subtotal,
    tax_amount = quote_tax,
    discount_amount = quote_discount,
    total_amount = quote_total,
    updated_at = NOW()
  WHERE id = quote_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate totals when quote_products change
CREATE OR REPLACE FUNCTION trigger_calculate_quote_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM calculate_quote_totals(NEW.quote_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM calculate_quote_totals(OLD.quote_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_quote_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON quote_products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_quote_totals();

-- Insert sample quote data for testing
INSERT INTO quotes (
  customer_name,
  customer_email,
  customer_phone,
  customer_company,
  quote_notes,
  quote_expiry_date
) VALUES (
  'John Smith',
  'john@example.com',
  '+1234567890',
  'Acme Corp',
  'Custom t-shirt order for company event',
  NOW() + INTERVAL '30 days'
);

-- Insert sample quote products
INSERT INTO quote_products (
  quote_id,
  product_id,
  product_name,
  product_category,
  quantity,
  size,
  color,
  print_type,
  print_areas,
  turnaround_time,
  unit_price,
  total_price
) VALUES (
  (SELECT id FROM quotes WHERE customer_email = 'john@example.com' LIMIT 1),
  'tshirt',
  'T-Shirts',
  'Apparel',
  50,
  'Adult Medium',
  '#FFFFFF',
  'DTF (Direct to Film)',
  '[{"id": "front", "name": "Only Front Side", "price": 20, "selected": true}]',
  '{"label": "Same Day", "price": 15}',
  20.00,
  1000.00
);

-- Verify the setup
SELECT 'Quote system database setup completed successfully!' as status;
SELECT COUNT(*) as total_quotes FROM quotes;
SELECT COUNT(*) as total_quote_products FROM quote_products;
