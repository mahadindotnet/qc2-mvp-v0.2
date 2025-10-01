import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('tshirt_orders')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('Database connection error:', connectionError)
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        error: connectionError.message,
        code: connectionError.code
      }, { status: 500 })
    }
    
    // Test table structure
    let tableInfo = null
    let tableError = null
    try {
      const result = await supabaseAdmin
        .rpc('get_table_info', { table_name: 'tshirt_orders' })
      tableInfo = result.data
      tableError = result.error
    } catch (err) {
      tableError = { message: 'Table info not available' }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      connectionTest,
      tableInfo: tableInfo || 'Table info not available',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
