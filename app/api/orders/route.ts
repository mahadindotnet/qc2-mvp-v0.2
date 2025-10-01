import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET orders (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    let query = supabaseAdmin
      .from('tshirt_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Error fetching orders', error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      orders: data,
      total: count,
      pagination: {
        limit,
        offset,
        hasMore: data && data.length === limit
      }
    })
    
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, message: 'Error fetching orders' },
      { status: 500 }
    )
  }
}
