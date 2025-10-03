# Database Setup Instructions

## 🚨 IMPORTANT: Database Setup Required

The Color Copies order system requires the `color_copies_orders` table to be created in your Supabase database.

## 📋 Setup Steps

### 1. **Access Supabase SQL Editor**
- Go to your Supabase project dashboard
- Navigate to the "SQL Editor" tab
- Click "New Query"

### 2. **Run the Database Schema**
Copy and paste the entire contents of `lib/color-copies-database-schema.sql` into the SQL Editor and execute it.

### 3. **Verify Table Creation**
Run this query to verify the table was created:
```sql
SELECT * FROM color_copies_orders LIMIT 1;
```

### 4. **Test the System**
- Fill out a Color Copies form
- Complete the checkout process
- Check that the order appears in the database

## 🔧 Database Schema

The `color_copies_orders` table includes:

### **Core Fields:**
- `id` - UUID primary key
- `created_at` - Order timestamp
- `updated_at` - Last update timestamp
- `status` - Order status

### **Customer Information:**
- `customer_name` - Full name
- `customer_email` - Email address
- `customer_phone` - Phone number
- `customer_address` - Full address

### **Color Copies Specific:**
- `print_type` - Selected print option
- `print_type_label` - Display label
- `print_type_price` - Print type price
- `quantity` - Number of copies
- `front_side_files` - JSONB array of file metadata
- `front_side_instructions` - Design instructions
- `turnaround_time` - Selected turnaround option
- `design_proof_required` - Boolean for proof requirement
- `proof_contact_method` - Contact method
- `proof_contact_details` - Contact details

### **Pricing:**
- `base_price` - Print type price
- `turnaround_price` - Turnaround time price
- `total_price` - Final total

## 🚨 Error Resolution

### **"relation color_copies_orders does not exist"**
This error means the table hasn't been created yet. Run the database schema SQL to create it.

### **"Error saving Color Copies order to database"**
Check the server logs for detailed error information. Common issues:
- Missing required fields
- Data type mismatches
- Permission issues

## ✅ Verification

After setup, you should be able to:
1. Fill out Color Copies form
2. Complete checkout process
3. See order in database
4. Receive order confirmation

## 📞 Support

If you encounter issues:
1. Check Supabase logs for detailed errors
2. Verify table structure matches schema
3. Ensure RLS policies are set correctly
4. Test with a simple order first

The database setup is required for the Color Copies order system to function properly!
