# Color Copies Database Setup

This document outlines the complete database setup for the Color Copies ordering system.

## Database Schema

### Table: `color_copies_orders`

The main table for storing Color Copies orders with all form fields:

#### Core Fields
- `id` - UUID primary key
- `created_at` - Timestamp when order was created
- `updated_at` - Timestamp when order was last updated
- `status` - Order status (pending, processing, completed, cancelled)
- `product_name` - Always "Color Copies"

#### Payment Fields
- `payment_id` - Payment processor ID
- `payment_status` - Payment status (pending, paid, failed, refunded)
- `payment_method` - Payment method used

#### Print Configuration
- `print_type` - Selected print type (e.g., '11x14-single')
- `print_type_label` - Display label (e.g., '11x14 - Single side')
- `print_type_price` - Price for print type
- `quantity` - Number of copies ordered

#### File Uploads
- `front_side_files` - JSONB array of uploaded files with metadata

#### Design Instructions
- `front_side_instructions` - Customer's design instructions

#### Turnaround Time
- `turnaround_time` - Selected turnaround option (e.g., 'normal')
- `turnaround_time_label` - Display label (e.g., 'Normal ($0.00)')
- `turnaround_time_price` - Price for turnaround option

#### Design Proof
- `design_proof_required` - Boolean if proof is required
- `design_proof` - Proof option selected
- `proof_contact_method` - Contact method (whatsapp, email, etc.)
- `proof_contact_details` - Contact details (phone, email, etc.)

#### Pricing
- `base_price` - Print type price
- `turnaround_price` - Turnaround time price
- `total_price` - Final total (base + turnaround) * quantity

#### Additional
- `notes` - Additional notes
- `estimated_completion` - Estimated completion date
- `completed_at` - Actual completion date

## Setup Instructions

### 1. Run Database Schema
Execute the SQL file in your Supabase SQL Editor:
```sql
-- Run the contents of lib/color-copies-database-schema.sql
```

### 2. Verify Setup
Check that the table was created successfully:
```sql
SELECT * FROM color_copies_orders LIMIT 1;
```

### 3. Test API Endpoint
The API endpoint `/api/color-copies` handles:
- `POST` - Create new Color Copies orders
- `GET` - Retrieve all orders (for admin)

## Form Fields Mapping

All Color Copies form fields are stored in the database:

| Form Field | Database Column | Type | Description |
|------------|----------------|------|-------------|
| Print Type | `print_type` | VARCHAR | Selected print option |
| Print Type Label | `print_type_label` | VARCHAR | Display label |
| Print Type Price | `print_type_price` | DECIMAL | Price for print type |
| Quantity | `quantity` | INTEGER | Number of copies |
| Front Side Files | `front_side_files` | JSONB | Array of file objects |
| Front Side Instructions | `front_side_instructions` | TEXT | Design instructions |
| Turnaround Time | `turnaround_time` | VARCHAR | Selected turnaround |
| Turnaround Time Label | `turnaround_time_label` | VARCHAR | Display label |
| Turnaround Time Price | `turnaround_time_price` | DECIMAL | Price for turnaround |
| Design Proof | `design_proof` | VARCHAR | Proof option |
| Proof Contact Method | `proof_contact_method` | VARCHAR | Contact method |
| Proof Contact Details | `proof_contact_details` | TEXT | Contact details |

## File Storage

Files are uploaded to Supabase Storage:
- **Bucket**: `uploads`
- **Path**: `color-copies/{timestamp}-{random}.{extension}`
- **Metadata**: Stored in `front_side_files` JSONB column

## Security

- **RLS Enabled**: Row Level Security is enabled
- **Public Insert**: Allows form submissions
- **Public Read**: Allows order retrieval
- **Public Update**: Allows payment updates

## Indexes

Performance indexes created:
- `status` - For filtering by order status
- `created_at` - For chronological ordering
- `payment_status` - For payment filtering
- `print_type` - For print type filtering

## API Integration

The ColorCopiesForm component now:
1. Collects all form data
2. Uploads files to Supabase Storage
3. Submits data to `/api/color-copies` endpoint
4. Stores complete order in database
5. Shows success message with order ID and total

## Testing

Test the complete flow:
1. Fill out Color Copies form
2. Upload files
3. Submit order
4. Check database for stored data
5. Verify file uploads in Supabase Storage

## Admin Access

Orders can be retrieved via:
```javascript
const response = await fetch('/api/color-copies')
const { orders } = await response.json()
```

This provides complete order management for the Color Copies system.
