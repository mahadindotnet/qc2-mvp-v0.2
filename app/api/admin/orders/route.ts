import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch T-shirt orders
    const { data: tshirtOrders, error: tshirtError } = await supabaseAdmin
      .from('tshirt_orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (tshirtError) {
      console.error('T-shirt orders error:', tshirtError)
    }
    
    // Fetch Color Copies orders
    const { data: colorCopiesOrders, error: colorCopiesError } = await supabaseAdmin
      .from('color_copies_orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (colorCopiesError) {
      console.error('Color Copies orders error:', colorCopiesError)
    }
    
    // Combine both order types
    const allOrders = [
      ...(tshirtOrders || []),
      ...(colorCopiesOrders || [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    return NextResponse.json({
      success: true,
      orders: allOrders
    })
    
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, message: 'Error fetching orders' },
      { status: 500 }
    )
  }
}
