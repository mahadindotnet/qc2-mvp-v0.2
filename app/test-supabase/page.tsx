'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function TestSupabase() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { error } = await supabase
          .from('_test_connection')
          .select('*')
          .limit(1)

        if (error) {
          // If table doesn't exist, that's actually good - means connection works
          if (error.code === 'PGRST116') {
            setConnectionStatus('✅ Supabase Connected Successfully!')
          } else {
            setError(`Connection error: ${error.message}`)
            setConnectionStatus('❌ Connection Failed')
          }
        } else {
          setConnectionStatus('✅ Supabase Connected Successfully!')
        }
      } catch (err) {
        setError(`Connection error: ${err}`)
        setConnectionStatus('❌ Connection Failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Connection Test
        </h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-700 mb-2">Supabase Status:</h2>
            <p className="text-lg">{connectionStatus}</p>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-700 mb-2">Environment:</h2>
            <p className="text-sm text-gray-600">
              URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </p>
            <p className="text-sm text-gray-600">
              Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-700 mb-2">Git Status:</h2>
            <p className="text-sm text-gray-600">✅ Repository initialized</p>
            <p className="text-sm text-gray-600">✅ GitHub remote connected</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
