import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin
    const { id } = await params
    
    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_products (*),
        quote_attachments (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Quote fetch error:', error)
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ quote })
    
  } catch (error) {
    console.error('Quote fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin
    const { id } = await params
    const body = await request.json()
    
    // Validate allowed fields for updates
    const allowedFields = [
      'quote_status',
      'quote_notes',
      'internal_notes',
      'quote_expiry_date',
      'quote_sent_at',
      'quote_accepted_at',
      'quote_rejected_at',
      'quote_follow_up_date',
      'converted_to_order_id',
      'conversion_date'
    ]
    
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    const { data: quote, error } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        quote_products (*),
        quote_attachments (*)
      `)
      .single()
    
    if (error) {
      console.error('Quote update error:', error)
      return NextResponse.json(
        { error: 'Failed to update quote' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ quote })
    
  } catch (error) {
    console.error('Quote update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseAdmin
    const { id } = await params
    
    // Check if quote exists
    const { data: existingQuote, error: fetchError } = await supabase
      .from('quotes')
      .select('id, quote_status')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }
    
    // Don't allow deletion of converted quotes
    if (existingQuote.quote_status === 'converted') {
      return NextResponse.json(
        { error: 'Cannot delete converted quotes' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Quote deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete quote' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Quote deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
