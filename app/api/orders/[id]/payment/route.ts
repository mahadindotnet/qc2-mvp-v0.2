import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { paymentId, status, paymentMethod, transactionId } = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('tshirt_orders')
      .update({
        payment_id: paymentId,
        payment_status: status,
        payment_method: paymentMethod,
        status: status === 'paid' ? 'processing' : 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Error updating payment status', error: error.message },
        { status: 500 }
      )
    }
    
    console.log(`Payment updated for order ${params.id}:`, { paymentId, status, paymentMethod, transactionId })
    
    // TODO: Send confirmation email
    // TODO: Update inventory
    // TODO: Notify admin of new paid order
    
    return NextResponse.json({
      success: true,
      order: data
    })
    
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { success: false, message: 'Error updating payment' },
      { status: 500 }
    )
  }
}
