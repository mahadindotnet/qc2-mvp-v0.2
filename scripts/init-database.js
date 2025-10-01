#!/usr/bin/env node

/**
 * Database Initialization Script
 * Run this to set up the database tables in Supabase
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please check your .env.local file contains:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function initDatabase() {
  try {
    console.log('🚀 Initializing database...')
    
    // Read the SQL setup file
    const sqlPath = path.join(__dirname, '..', 'lib', 'setup-database.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.warn(`⚠️  Statement ${i + 1} had an issue:`, error.message)
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      }
    }
    
    // Test the table exists
    console.log('🧪 Testing table creation...')
    const { data, error } = await supabase
      .from('tshirt_orders')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Table test failed:', error.message)
      throw error
    }
    
    console.log('✅ Database initialization completed successfully!')
    console.log('🎉 Your T-shirt customizer is ready to use!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    console.error('\n📋 Manual Setup Instructions:')
    console.error('1. Go to your Supabase dashboard')
    console.error('2. Navigate to SQL Editor')
    console.error('3. Copy and paste the contents of lib/setup-database.sql')
    console.error('4. Click "Run" to execute the SQL')
    process.exit(1)
  }
}

// Run the initialization
initDatabase()
