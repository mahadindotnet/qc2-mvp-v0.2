import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface TShirtDesign {
  shirtColor: string
  printAreas: Array<{
    id: string
    name: string
    price: number
    selected: boolean
  }>
  size: string
  printType: string
  quantity: number
  turnaroundTime: {
    label: string
    price: number
  }
  designProof: string
  proofContactMethod: string
  contactDetails: string
  areaInstructions: Array<{
    areaId: string
    instructions: string
  }>
  textElements: Array<{
    id: string
    text: string
    color: string
    fontSize: number
    area: string
  }>
  imageElements: Array<{
    id: string
    imageUrl: string
    area: string
    width: number
    height: number
  }>
}

function calculateTotalPrice(designData: TShirtDesign): {
  basePrice: number
  turnaroundPrice: number
  totalPrice: number
} {
  const selectedAreas = designData.printAreas.filter(area => area.selected)
  const basePrice = selectedAreas.reduce((total, area) => total + area.price, 0) * designData.quantity
  const turnaroundPrice = designData.turnaroundTime.price
  const totalPrice = basePrice + turnaroundPrice
  
  return {
    basePrice: Number(basePrice.toFixed(2)),
    turnaroundPrice: Number(turnaroundPrice.toFixed(2)),
    totalPrice: Number(totalPrice.toFixed(2))
  }
}

export async function POST(request: NextRequest) {
  try {
    const designData: TShirtDesign = await request.json()
    
    // Calculate pricing
    const pricing = calculateTotalPrice(designData)
    
    // Prepare data for database
    const orderData = {
      // Product Information
      product_name: 'Custom T-Shirt',
      
      // Design Details
      shirt_color: designData.shirtColor,
      shirt_size: designData.size,
      print_type: designData.printType,
      quantity: designData.quantity,
      
      // Print Areas (store as JSONB)
      print_areas: designData.printAreas,
      
      // Design Elements
      text_elements: designData.textElements,
      image_elements: designData.imageElements,
      area_instructions: designData.areaInstructions,
      
      // Pricing
      base_price: pricing.basePrice,
      turnaround_price: pricing.turnaroundPrice,
      total_price: pricing.totalPrice,
      
      // Turnaround Time
      turnaround_time: designData.turnaroundTime,
      
      // Design Proof
      design_proof_required: designData.designProof === 'Yes, send design proof before printing',
      proof_contact_method: designData.designProof === 'Yes, send design proof before printing' ? designData.proofContactMethod : null,
      proof_contact_details: designData.designProof === 'Yes, send design proof before printing' ? designData.contactDetails : null,
      
      // Order Status
      status: 'pending',
      payment_status: 'pending'
    }
    
    // Insert into database
    const { data, error } = await supabaseAdmin
      .from('tshirt_orders')
      .insert([orderData])
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Error saving to database', error: error.message },
        { status: 500 }
      )
    }
    
    console.log('T-Shirt Order saved successfully:', data.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order saved successfully',
      orderId: data.id,
      totalPrice: pricing.totalPrice
    })
    
  } catch (error) {
    console.error('Error saving t-shirt design:', error)
    return NextResponse.json(
      { success: false, message: 'Error saving design' },
      { status: 500 }
    )
  }
}
