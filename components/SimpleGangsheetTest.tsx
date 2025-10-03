'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

const SimpleGangsheetTest: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Gangsheet Test</h1>
      <Button 
        onClick={() => console.log('Button clicked')}
        className="cursor-pointer"
        style={{ cursor: 'pointer' }}
      >
        Test Button
      </Button>
    </div>
  )
}

export default SimpleGangsheetTest
