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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const orderId = (await params).id
    
    // First, try to delete from tshirt_orders
    const { error: tshirtError } = await supabaseAdmin
      .from('tshirt_orders')
      .delete()
      .eq('id', orderId)
    
    // If not found in tshirt_orders, try color_copies_orders
    if (tshirtError && tshirtError.code === 'PGRST116') {
      const { error: colorCopiesError } = await supabaseAdmin
        .from('color_copies_orders')
        .delete()
        .eq('id', orderId)
      
      if (colorCopiesError) {
        console.error('Database error:', colorCopiesError)
        return NextResponse.json(
          { success: false, message: 'Error deleting order', error: colorCopiesError.message },
          { status: 500 }
        )
      }
    } else if (tshirtError) {
      console.error('Database error:', tshirtError)
      return NextResponse.json(
        { success: false, message: 'Error deleting order', error: tshirtError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { success: false, message: 'Error deleting order' },
      { status: 500 }
    )
  }
}
