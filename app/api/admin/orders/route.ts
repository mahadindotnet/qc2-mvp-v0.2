import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tshirt_orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Error fetching orders', error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      orders: data
    })
    
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, message: 'Error fetching orders' },
      { status: 500 }
    )
  }
}
