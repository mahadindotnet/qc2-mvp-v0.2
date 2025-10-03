# Universal Checkout System

This document explains the universal checkout system that handles both T-shirt and Color Copies orders through a single, unified interface.

## 🎯 Universal System Architecture

### **Single Checkout Flow**
- **One Checkout Page**: `/checkout` handles both product types
- **One API Endpoint**: `/api/checkout` processes both order types
- **One Success Page**: `/thank-you` confirms all orders
- **Unified Session Storage**: Uses `currentOrder` key for all products

### **Product Detection**
The system automatically detects the product type based on:
```javascript
const isColorCopies = orderData.product_name === 'Color Copies'
```

## 🔄 Order Flow

### **1. Form Submission**
Both T-shirt and Color Copies forms:
- Validate all required fields
- Calculate pricing
- Store order data in `sessionStorage` with key `currentOrder`
- Redirect to `/checkout`

### **2. Universal Checkout** (`/checkout`)
- Loads order from `sessionStorage.getItem('currentOrder')`
- Collects customer information (same for all products)
- Shows product-specific order summary
- Processes payment (COD for all products)

### **3. Order Processing** (`/api/checkout`)
- Detects product type from `product_name`
- Routes to appropriate database table:
  - `tshirt_orders` for T-shirt orders
  - `color_copies_orders` for Color Copies orders
- Returns order ID and total

### **4. Order Confirmation** (`/thank-you`)
- Shows order success for all product types
- Displays order ID and total
- Provides next steps

## 📊 Data Structure

### **Universal Order Format**
```javascript
{
  product_name: 'Color Copies' | 'Custom T-Shirt',
  print_type: 'Print type label',
  print_areas: [{ id, name, price, selected }],
  quantity: number,
  base_price: number,
  turnaround_time: { label, price },
  total_price: number,
  design_proof_required: boolean,
  proof_contact_details: string,
  // Product-specific data
  color_copies_data?: { /* Color Copies specific fields */ },
  shirt_color?: string, // T-shirt specific
  shirt_size?: string,  // T-shirt specific
  // ... other T-shirt fields
}
```

### **Color Copies Specific Data**
```javascript
color_copies_data: {
  printType: string,
  printTypeLabel: string,
  printTypePrice: number,
  frontSideFiles: Array<FileMetadata>,
  frontSideInstructions: string,
  turnaroundTime: string,
  turnaroundTimeLabel: string,
  turnaroundTimePrice: number,
  designProof: string,
  proofContactMethod: string,
  contactDetails: string
}
```

## 🗄️ Database Tables

### **T-shirt Orders** (`tshirt_orders`)
- Standard T-shirt order fields
- Design elements (text, images)
- Print areas configuration
- Shirt details (color, size)

### **Color Copies Orders** (`color_copies_orders`)
- Print type and configuration
- File uploads metadata
- Design instructions
- Turnaround time options
- Design proof settings

## 🔧 API Logic

### **Product Detection**
```javascript
const isColorCopies = orderData.product_name === 'Color Copies'
```

### **T-shirt Order Processing**
- Uses existing `tshirt_orders` table
- Processes design elements
- Handles print areas
- Manages shirt specifications

### **Color Copies Order Processing**
- Uses `color_copies_orders` table
- Processes file uploads
- Handles design instructions
- Manages print configuration

## 🎨 UI Adaptations

### **Order Summary Display**
The checkout page shows different information based on product type:

**T-shirt Orders:**
- Shirt size and color
- Print areas with pricing
- Design elements

**Color Copies Orders:**
- Print type and configuration
- Design instructions preview
- File upload information

### **Form Integration**
Both forms use the same session storage key:
```javascript
sessionStorage.setItem('currentOrder', JSON.stringify(orderData))
```

## ✅ Benefits of Universal System

### **1. Code Reusability**
- Single checkout page for all products
- Unified customer information collection
- Shared payment processing
- Common success flow

### **2. Consistent User Experience**
- Same checkout flow for all products
- Unified customer interface
- Consistent order confirmation
- Standard payment process

### **3. Maintainability**
- Single codebase for checkout
- Unified API endpoint
- Shared validation logic
- Common error handling

### **4. Scalability**
- Easy to add new product types
- Unified order management
- Consistent data structure
- Shared infrastructure

## 🚀 Adding New Products

To add a new product type:

1. **Update Form**: Add product-specific fields
2. **Update Data Structure**: Add product-specific data to universal format
3. **Update API**: Add product detection and processing logic
4. **Update Database**: Create product-specific table if needed
5. **Update UI**: Add product-specific display logic

## 📋 Current Implementation

### **Working Products:**
- ✅ **Custom T-shirts** - Full functionality
- ✅ **Color Copies** - Full functionality

### **Shared Components:**
- ✅ **Checkout Page** - Universal customer form
- ✅ **API Endpoint** - Universal order processing
- ✅ **Success Page** - Universal confirmation
- ✅ **Session Storage** - Universal data persistence

### **Product-Specific Features:**
- ✅ **T-shirt Design** - Custom design elements
- ✅ **Color Copies** - File uploads and instructions
- ✅ **Database Storage** - Separate tables for each product
- ✅ **Order Management** - Product-specific order handling

The universal checkout system provides a scalable, maintainable solution for handling multiple product types through a single, unified interface!
