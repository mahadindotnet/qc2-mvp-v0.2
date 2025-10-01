# Database Setup Guide

## Quick Setup (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### Step 2: Run SQL Setup
1. Navigate to **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Copy and paste the entire contents of `lib/setup-database.sql`
4. Click **"Run"** to execute the SQL

### Step 3: Verify Setup
1. Go to **Table Editor** in the left sidebar
2. You should see a `tshirt_orders` table
3. Check that it has the correct columns

## Manual Setup (If Quick Setup Fails)

### Step 1: Create Table
```sql
CREATE TABLE tshirt_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  payment_id VARCHAR(255),
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  product_name VARCHAR(100) DEFAULT 'Custom T-Shirt',
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  shirt_color VARCHAR(7) NOT NULL,
  shirt_size VARCHAR(50) NOT NULL,
  print_type VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  print_areas JSONB NOT NULL DEFAULT '[]',
  text_elements JSONB DEFAULT '[]',
  image_elements JSONB DEFAULT '[]',
  area_instructions JSONB DEFAULT '[]',
  base_price DECIMAL(10,2) NOT NULL,
  turnaround_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  turnaround_time JSONB NOT NULL,
  design_proof_required BOOLEAN DEFAULT false,
  proof_contact_method VARCHAR(50),
  proof_contact_details TEXT,
  notes TEXT,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);
```

### Step 2: Create Indexes
```sql
CREATE INDEX idx_tshirt_orders_status ON tshirt_orders(status);
CREATE INDEX idx_tshirt_orders_created_at ON tshirt_orders(created_at);
CREATE INDEX idx_tshirt_orders_customer_email ON tshirt_orders(customer_email);
CREATE INDEX idx_tshirt_orders_payment_status ON tshirt_orders(payment_status);
```

### Step 3: Enable RLS
```sql
ALTER TABLE tshirt_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to insert orders" ON tshirt_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to read own orders" ON tshirt_orders
  FOR SELECT USING (true);

CREATE POLICY "Allow public to update orders" ON tshirt_orders
  FOR UPDATE USING (true);
```

### Step 4: Create Update Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tshirt_orders_updated_at 
  BEFORE UPDATE ON tshirt_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## Testing the Setup

### Test Database Connection
Visit: `http://localhost:3000/api/test-db`

You should see:
```json
{
  "success": true,
  "message": "Database connection successful"
}
```

### Test Order Creation
1. Go to your T-shirt designer
2. Fill out the form completely
3. Click "Add to Cart"
4. Complete the checkout process

## Troubleshooting

### Error: "Could not find the table 'public.tshirt_orders'"
- The table doesn't exist yet
- Follow the setup steps above

### Error: "Permission denied"
- Check your RLS policies
- Make sure the policies allow public access

### Error: "Invalid JSON"
- Check that JSONB columns are properly formatted
- Ensure all required fields are provided

## Environment Variables Required

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Support

If you're still having issues:
1. Check the Supabase logs in your dashboard
2. Verify your environment variables
3. Test the database connection endpoint
4. Check the browser console for errors