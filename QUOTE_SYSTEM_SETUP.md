# Quote System Database Setup

## Issue
The quote form is failing because the `quotes` table doesn't exist in the database.

## Solution
You need to run the SQL schema in your Supabase database.

## Steps to Fix

### 1. Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** in the left sidebar

### 2. Run the SQL Schema
1. Copy the entire contents of `lib/quotes-database-schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the SQL

### 3. Verify Setup
After running the SQL, you should see:
- ✅ `Quote system database setup completed successfully!`
- ✅ `total_quotes: 1` (sample data)
- ✅ `total_quote_products: 1` (sample data)

## What This Creates

### Tables Created:
- ✅ `quotes` - Main quotes table
- ✅ `quote_products` - Individual products in quotes
- ✅ `quote_attachments` - File attachments for quotes

### Features Added:
- ✅ **Auto-generated quote references** (format: YYMMDD-XXX)
- ✅ **Automatic total calculations**
- ✅ **Row Level Security (RLS) policies**
- ✅ **Sample data** for testing

## After Setup
Once the database is set up, the quote form should work properly and you'll be able to:
- ✅ Submit quotes through the form
- ✅ View quotes in the admin dashboard
- ✅ Download quote data as CSV
- ✅ Manage quote status and follow-ups

## Troubleshooting
If you still get errors after running the SQL:
1. Check that all tables were created successfully
2. Verify RLS policies are enabled
3. Check the browser console for any remaining errors
