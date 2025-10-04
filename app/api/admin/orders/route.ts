import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch both order types in parallel for better performance
    const [tshirtResult, colorCopiesResult] = await Promise.all([
      supabaseAdmin
        .from('tshirt_orders')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('color_copies_orders')
        .select('*')
        .order('created_at', { ascending: false })
    ])
    
    const { data: tshirtOrders, error: tshirtError } = tshirtResult
    const { data: colorCopiesOrders, error: colorCopiesError } = colorCopiesResult
    
    if (tshirtError) {
      console.error('T-shirt orders error:', tshirtError)
    }
    
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
