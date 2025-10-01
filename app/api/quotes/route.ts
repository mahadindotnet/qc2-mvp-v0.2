import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateFileSecurity } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const formData = await request.formData()
    
    // Extract form data
    const customerInfo = {
      name: formData.get('customerInfo.name') as string,
      email: formData.get('customerInfo.email') as string,
      phone: formData.get('customerInfo.phone') as string,
      company: formData.get('customerInfo.company') as string || '',
      address: formData.get('customerInfo.address') as string || '',
    }
    
    const quoteNotes = formData.get('quoteNotes') as string || ''
    const internalNotes = formData.get('internalNotes') as string || ''
    
    // Parse products data
    const productsData = JSON.parse(formData.get('products') as string || '[]')
    
    // Validate required fields
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return NextResponse.json(
        { error: 'Missing required customer information' },
        { status: 400 }
      )
    }
    
    if (!productsData || productsData.length === 0) {
      return NextResponse.json(
        { error: 'No products selected' },
        { status: 400 }
      )
    }
    
    // Process file uploads and validate security
    const processedAttachments = []
    const fileFields = ['images', 'designFiles', 'referenceFiles']
    
    for (const field of fileFields) {
      const files = formData.getAll(field) as File[]
      for (const file of files) {
        if (file && file.size > 0) {
          // Validate file security
          const securityCheck = validateFileSecurity(file)
          if (!securityCheck.isValid) {
            return NextResponse.json(
              { error: `File security validation failed: ${securityCheck.error}` },
              { status: 400 }
            )
          }
          
          // Upload file to Supabase Storage
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `quotes/${fileName}`
          
          const { error: uploadError } = await supabase.storage
            .from('quote-attachments')
            .upload(filePath, file)
          
          if (uploadError) {
            console.error('File upload error:', uploadError)
            return NextResponse.json(
              { error: 'Failed to upload file' },
              { status: 500 }
            )
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('quote-attachments')
            .getPublicUrl(filePath)
          
          processedAttachments.push({
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: urlData.publicUrl,
            attachment_type: field === 'images' ? 'design' : 'reference',
            description: `Uploaded via quote form - ${field}`,
            is_primary: false
          })
        }
      }
    }
    
    // Create quote record
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        customer_company: customerInfo.company,
        quote_notes: quoteNotes,
        internal_notes: internalNotes,
        quote_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        quote_status: 'pending'
      })
      .select()
      .single()
    
    if (quoteError) {
      console.error('Quote creation error:', quoteError)
      return NextResponse.json(
        { error: 'Failed to create quote' },
        { status: 500 }
      )
    }
    
    // Create quote products
    const quoteProducts = []
    for (const product of productsData) {
      const { data: productData, error: productError } = await supabase
        .from('quote_products')
        .insert({
          quote_id: quoteData.id,
          product_id: product.product.id,
          product_name: product.product.name,
          product_category: product.product.category,
          quantity: product.quantity,
          size: product.size || null,
          custom_size: product.customSize || null,
          color: product.color,
          print_type: product.printType,
          custom_print_type: product.customPrintType || null,
          print_areas: JSON.stringify(product.printAreas || []),
          text_elements: JSON.stringify([{ text: product.text, area: 'general' }]),
          image_elements: JSON.stringify([]), // Will be populated from attachments
          area_instructions: JSON.stringify([]),
          turnaround_time: JSON.stringify(product.turnaroundTime),
          design_proof_required: product.designProof === 'Yes, send design proof before printing',
          proof_contact_method: product.proofContactMethod || null,
          proof_contact_details: product.contactDetails || null,
          unit_price: 0, // Will be calculated based on product and options
          total_price: 0, // Will be calculated
          notes: product.notes || '',
          specifications: JSON.stringify({
            customSize: product.customSize,
            customPrintType: product.customPrintType,
            printAreas: product.printAreas
          })
        })
        .select()
        .single()
      
      if (productError) {
        console.error('Product creation error:', productError)
        return NextResponse.json(
          { error: 'Failed to create quote product' },
          { status: 500 }
        )
      }
      
      quoteProducts.push(productData)
    }
    
    // Create quote attachments
    if (processedAttachments.length > 0) {
      const attachmentsWithQuoteId = processedAttachments.map(attachment => ({
        ...attachment,
        quote_id: quoteData.id
      }))
      
      const { error: attachmentError } = await supabase
        .from('quote_attachments')
        .insert(attachmentsWithQuoteId)
      
      if (attachmentError) {
        console.error('Attachment creation error:', attachmentError)
        // Don't fail the entire request for attachment errors
      }
    }
    
    // Calculate totals (this will trigger the database function)
    const { error: calcError } = await supabase.rpc('calculate_quote_totals', {
      quote_uuid: quoteData.id
    })
    
    if (calcError) {
      console.error('Total calculation error:', calcError)
      // Don't fail the request for calculation errors
    }
    
    // Get the final quote data with totals
    const { data: finalQuote, error: fetchError } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_products (*),
        quote_attachments (*)
      `)
      .eq('id', quoteData.id)
      .single()
    
    if (fetchError) {
      console.error('Final quote fetch error:', fetchError)
    }
    
    return NextResponse.json({
      success: true,
      quote: finalQuote || quoteData,
      message: 'Quote submitted successfully! We will review your request and send you a detailed quote within 24 hours.'
    })
    
  } catch (error) {
    console.error('Quote submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerEmail = searchParams.get('customerEmail')
    
    let query = supabase
      .from('quotes')
      .select(`
        *,
        quote_products (*),
        quote_attachments (*)
      `)
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('quote_status', status)
    }
    
    if (customerEmail) {
      query = query.eq('customer_email', customerEmail)
    }
    
    const { data: quotes, error } = await query
    
    if (error) {
      console.error('Quotes fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch quotes' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ quotes })
    
  } catch (error) {
    console.error('Quotes fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
