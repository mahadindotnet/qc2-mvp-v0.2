import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('tshirt_orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', (await params).id)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Error updating order', error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      order: data
    })
    
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, message: 'Error updating order' },
      { status: 500 }
    )
  }
}
