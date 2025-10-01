import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tshirt_orders')
      .select('*')
      .eq('id', (await params).id)
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Order not found', error: error.message },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      order: data
    })
    
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, message: 'Error fetching order' },
      { status: 500 }
    )
  }
}