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
    const orderData: OrderData = await request.json()
    
    // Calculate pricing
    const selectedAreas = orderData.print_areas.filter(area => area.selected)
    const basePrice = selectedAreas.reduce((total, area) => total + area.price, 0) * orderData.quantity
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
    
    // Insert into database
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
    
    console.log('Order created successfully:', data.id)
    
    // TODO: Send confirmation email
    // TODO: Process payment (PayPal integration)
    // TODO: Update inventory if needed
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order created successfully',
      orderId: data.id,
      totalPrice: totalPrice
    })
    
  } catch (error) {
    console.error('Error processing checkout:', error)
    return NextResponse.json(
      { success: false, message: 'Error processing checkout' },
      { status: 500 }
    )
  }
}
