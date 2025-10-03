# Supabase Storage Setup for File Uploads

## Issue
The quote form is failing because the Supabase storage bucket for file uploads doesn't exist.

## Solution
You need to create a storage bucket in your Supabase project.

## Steps to Fix

### 1. Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Storage** in the left sidebar

### 2. Create Storage Bucket
1. Click **"New bucket"** button
2. **Bucket name**: `quote-attachments` (or any name you prefer)
3. **Public bucket**: ✅ **Check this box** (important for file access)
4. Click **"Create bucket"**

### 3. Set Up Storage Policies
After creating the bucket, you need to set up Row Level Security (RLS) policies:

1. Go to **Storage** → **Policies** tab
2. Click **"New Policy"** for your bucket
3. Add these policies:

#### Policy 1: Allow Public Uploads
- **Policy name**: `Allow public uploads`
- **Target roles**: `public`
- **Policy definition**:
```sql
(bucket_id = 'quote-attachments'::text) AND (auth.role() = 'anon'::text)
```

#### Policy 2: Allow Public Downloads
- **Policy name**: `Allow public downloads`
- **Target roles**: `public`
- **Policy definition**:
```sql
(bucket_id = 'quote-attachments'::text) AND (auth.role() = 'anon'::text)
```

### 4. Alternative: Use SQL to Create Bucket
If you prefer, you can also create the bucket using SQL in the SQL Editor:

```sql
-- Create storage bucket for quote attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-attachments', 'quote-attachments', true);

-- Create policy for public uploads
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'quote-attachments');

-- Create policy for public downloads
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'quote-attachments');
```

## After Setup
Once the storage bucket is created and policies are set up:
- ✅ Quote form file uploads will work
- ✅ Files will be stored in Supabase Storage
- ✅ Files will be accessible via public URLs
- ✅ Quote form submissions will complete successfully

## Troubleshooting
If you still get errors after setting up storage:
1. Verify the bucket is public
2. Check that RLS policies are correctly set
3. Ensure the bucket name matches what's used in the code
4. Check the browser console for any remaining errors
