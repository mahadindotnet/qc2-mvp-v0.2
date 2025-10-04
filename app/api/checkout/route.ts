import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface CustomerDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface OrderData {
  product_name: string
  shirt_color: string
  shirt_size: string
  print_type: string
  print_areas: Array<{
    id: string
    name: string
    price: number
    selected: boolean
  }>
  quantity: number
  base_price: number
  turnaround_time: {
    label: string
    price: number
  }
  total_price: number
  design_proof_required: boolean
  proof_contact_details?: string
  imageElements: Array<{
    id: string
    imageUrl: string
    area: string
    fileName?: string
  }>
  textElements: Array<{
    id: string
    text: string
    area: string
  }>
  areaInstructions: Array<{
    areaId: string
    instructions: string
  }>
  customerDetails: CustomerDetails
  paymentStatus: string
  status: string
}

export async function POST(request: NextRequest) {
  try {
    const orderData: any = await request.json()
    console.log('Received order data:', JSON.stringify(orderData, null, 2))
    
    // Determine order type
    const isColorCopies = orderData.product_name === 'Color Copies'
    const isGangsheet = orderData.product_name === 'Custom Gangsheet'
    console.log('Is Color Copies order:', isColorCopies)
    console.log('Is Custom Gangsheet order:', isGangsheet)
    
    if (isColorCopies) {
      // Handle Color Copies order
      const colorCopiesData = orderData.color_copies_data
      console.log('Color Copies data:', JSON.stringify(colorCopiesData, null, 2))
      
      if (!colorCopiesData) {
        throw new Error('Color Copies data is missing')
      }
      
      // Calculate pricing for Color Copies
      const basePrice = colorCopiesData.printTypePrice * orderData.quantity
      const turnaroundPrice = colorCopiesData.turnaroundTimePrice * orderData.quantity
      const totalPrice = basePrice + turnaroundPrice
      
      console.log('Color Copies pricing:', { basePrice, turnaroundPrice, totalPrice })
      
      // Prepare Color Copies order record
      const orderRecord = {
        // Product Information
        product_name: 'Color Copies',
        
        // Print Configuration
        print_type: colorCopiesData.printType,
        print_type_label: colorCopiesData.printTypeLabel,
        print_type_price: colorCopiesData.printTypePrice,
        quantity: orderData.quantity,
        
        // File Uploads
        front_side_files: colorCopiesData.frontSideFiles,
        
        // Design Instructions
        front_side_instructions: colorCopiesData.frontSideInstructions,
        
        // Turnaround Time
        turnaround_time: colorCopiesData.turnaroundTime,
        turnaround_time_label: colorCopiesData.turnaroundTimeLabel,
        turnaround_time_price: colorCopiesData.turnaroundTimePrice,
        
        // Design Proof
        design_proof_required: colorCopiesData.designProof === 'Yes, send design proof before printing',
        design_proof: colorCopiesData.designProof,
        proof_contact_method: colorCopiesData.proofContactMethod,
        proof_contact_details: colorCopiesData.contactDetails,
        
        // Pricing
        base_price: basePrice,
        turnaround_price: turnaroundPrice,
        total_price: totalPrice,
        
        // Customer Information
        customer_name: `${orderData.customerDetails.firstName} ${orderData.customerDetails.lastName}`,
        customer_email: orderData.customerDetails.email,
        customer_phone: orderData.customerDetails.phone,
        customer_address: `${orderData.customerDetails.address}, ${orderData.customerDetails.city}, ${orderData.customerDetails.state} ${orderData.customerDetails.zipCode}, ${orderData.customerDetails.country}`,
        
        // Order Status
        status: orderData.status,
        payment_status: orderData.paymentStatus,
        
        // Additional Notes
        notes: `Color Copies order placed via checkout system. Customer: ${orderData.customerDetails.firstName} ${orderData.customerDetails.lastName}`
      }
      
      // Insert into color_copies_orders table
      console.log('Inserting Color Copies order record:', JSON.stringify(orderRecord, null, 2))
      
      const { data, error } = await supabaseAdmin
        .from('color_copies_orders')
        .insert([orderRecord])
        .select()
        .single()
      
      if (error) {
        console.error('Color Copies database error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        
        // Check if the table doesn't exist
        if (error.message && error.message.includes('relation "color_copies_orders" does not exist')) {
          return NextResponse.json(
            { success: false, message: 'Color Copies table not found. Please run the database schema setup first.', error: error.message },
            { status: 500 }
          )
        }
        
        return NextResponse.json(
          { success: false, message: 'Error saving Color Copies order to database', error: error.message },
          { status: 500 }
        )
      }
      
      console.log('Color Copies order created successfully:', data.id)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Color Copies order created successfully',
        orderId: data.id,
        totalPrice: totalPrice
      })
      
    } else if (isGangsheet) {
      // Handle Custom Gangsheet order
      const gangsheetData = orderData.gangsheet_data
      console.log('Custom Gangsheet data:', JSON.stringify(gangsheetData, null, 2))
      
      if (!gangsheetData) {
        throw new Error('Custom Gangsheet data is missing')
      }
      
      // Calculate pricing for Custom Gangsheet
      const gangsheetArea = gangsheetData.gangsheet_width * gangsheetData.gangsheet_height * 12 // Convert feet to inches
      const basePrice = gangsheetArea * gangsheetData.cost_per_square_inch
      const turnaroundPrice = gangsheetData.turnaround_time_price
      const totalPrice = basePrice + turnaroundPrice
      
      console.log('Custom Gangsheet pricing:', { gangsheetArea, basePrice, turnaroundPrice, totalPrice })
      
      // Prepare Custom Gangsheet order record
      const orderRecord = {
        // Product Information
        product_name: 'Custom Gangsheet',
        
        // Gangsheet Specifications
        gangsheet_height: gangsheetData.gangsheet_height,
        gangsheet_width: gangsheetData.gangsheet_width,
        setup_type: gangsheetData.setup_type,
        
        // File Uploads
        full_setup_files: gangsheetData.full_setup_files || [],
        design_elements: gangsheetData.design_elements || [],
        
        // Special Instructions
        special_instructions: gangsheetData.special_instructions || '',
        
        // Turnaround Time
        turnaround_time: gangsheetData.turnaround_time,
        turnaround_time_label: gangsheetData.turnaround_time_label,
        turnaround_time_price: gangsheetData.turnaround_time_price,
        
        // Design Proof
        design_proof_required: gangsheetData.design_proof === 'Yes, send design proof before printing',
        design_proof: gangsheetData.design_proof,
        proof_contact_method: gangsheetData.proof_contact_method,
        proof_contact_details: gangsheetData.contact_details,
        
        // Pricing
        gangsheet_area: gangsheetArea,
        cost_per_square_inch: gangsheetData.cost_per_square_inch,
        base_price: basePrice,
        turnaround_price: turnaroundPrice,
        total_price: totalPrice,
        
        // Customer Information
        customer_name: `${orderData.customerDetails.firstName} ${orderData.customerDetails.lastName}`,
        customer_email: orderData.customerDetails.email,
        customer_phone: orderData.customerDetails.phone,
        customer_address: `${orderData.customerDetails.address}, ${orderData.customerDetails.city}, ${orderData.customerDetails.state} ${orderData.customerDetails.zipCode}, ${orderData.customerDetails.country}`,
        
        // Order Status
        status: orderData.status,
        payment_status: orderData.paymentStatus,
        
        // Additional Notes
        notes: `Custom Gangsheet order placed via checkout system. Customer: ${orderData.customerDetails.firstName} ${orderData.customerDetails.lastName}`
      }
      
      // Insert into gangsheet_orders table
      console.log('Inserting Custom Gangsheet order record:', JSON.stringify(orderRecord, null, 2))
      
      const { data, error } = await supabaseAdmin
        .from('gangsheet_orders')
        .insert([orderRecord])
        .select()
        .single()
      
      if (error) {
        console.error('Custom Gangsheet database error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        
        // Check if the table doesn't exist
        if (error.message && error.message.includes('relation "gangsheet_orders" does not exist')) {
          return NextResponse.json(
            { success: false, message: 'Custom Gangsheet table not found. Please run the database schema setup first.', error: error.message },
            { status: 500 }
          )
        }
        
        return NextResponse.json(
          { success: false, message: 'Error saving Custom Gangsheet order to database', error: error.message },
          { status: 500 }
        )
      }
      
      console.log('Custom Gangsheet order created successfully:', data.id)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Custom Gangsheet order created successfully',
        orderId: data.id,
        totalPrice: totalPrice
      })
      
    } else {
      // Handle T-shirt order (existing logic)
      const selectedAreas = orderData.print_areas.filter((area: any) => area.selected)
      const basePrice = selectedAreas.reduce((total: number, area: any) => total + area.price, 0) * orderData.quantity
      const turnaroundPrice = orderData.turnaround_time.price
      const totalPrice = basePrice + turnaroundPrice
      
      // Prepare data for database
      const orderRecord = {
        // Product Information
        product_name: orderData.product_name,
        
        // Design Details
        shirt_color: orderData.shirt_color,
        shirt_size: orderData.shirt_size,
        print_type: orderData.print_type,
        quantity: orderData.quantity,
        
        // Print Areas (store as JSONB)
        print_areas: orderData.print_areas,
        
        // Design Elements
        text_elements: orderData.textElements,
        image_elements: orderData.imageElements,
        area_instructions: orderData.areaInstructions,
        
        // Pricing
        base_price: basePrice,
        turnaround_price: turnaroundPrice,
        total_price: totalPrice,
        
        // Turnaround Time
        turnaround_time: orderData.turnaround_time,
        
        // Design Proof
        design_proof_required: orderData.design_proof_required,
        proof_contact_details: orderData.proof_contact_details,
        
        // Customer Information
        customer_name: `${orderData.customerDetails.firstName} ${orderData.customerDetails.lastName}`,
        customer_email: orderData.customerDetails.email,
        customer_phone: orderData.customerDetails.phone,
        customer_address: `${orderData.customerDetails.address}, ${orderData.customerDetails.city}, ${orderData.customerDetails.state} ${orderData.customerDetails.zipCode}, ${orderData.customerDetails.country}`,
        
        // Order Status
        status: orderData.status,
        payment_status: orderData.paymentStatus,
        
        // Additional Notes
        notes: `Order placed via checkout system. Customer: ${orderData.customerDetails.firstName} ${orderData.customerDetails.lastName}`
      }
      
      // Insert into tshirt_orders table
      const { data, error } = await supabaseAdmin
        .from('tshirt_orders')
        .insert([orderRecord])
        .select()
        .single()
      
      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { success: false, message: 'Error saving order to database', error: error.message },
          { status: 500 }
        )
      }
      
      console.log('T-shirt order created successfully:', data.id)
      
      return NextResponse.json({ 
        success: true, 
        message: 'T-shirt order created successfully',
        orderId: data.id,
        totalPrice: totalPrice
      })
    }
    
  } catch (error) {
    console.error('Error processing checkout:', error)
    return NextResponse.json(
      { success: false, message: 'Error processing checkout' },
      { status: 500 }
    )
  }
}
