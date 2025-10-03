'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const SimpleFabricGangsheetBuilder: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const initFabric = async () => {
      try {
        if (canvasRef.current && !fabricCanvasRef.current) {
          const fabric = await import('fabric').then(module => module.fabric || module.default || module)
          
          const canvas = new fabric.Canvas(canvasRef.current, {
            width: 600,
            height: 400,
            backgroundColor: '#f9fafb'
          })

          // Add a simple rectangle
          const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: '#FFA503',
            stroke: '#000',
            strokeWidth: 2
          })

          canvas.add(rect)
          fabricCanvasRef.current = canvas
          setIsLoaded(true)
          
          toast.success('Fabric.js canvas initialized!')
        }
      } catch (error) {
        console.error('Error initializing Fabric.js:', error)
        toast.error('Failed to initialize canvas')
      }
    }

    initFabric()

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
      }
    }
  }, [])

  const addRectangle = async () => {
    try {
      if (fabricCanvasRef.current) {
        const fabric = await import('fabric').then(module => module.fabric || module.default || module)
        
        const rect = new fabric.Rect({
          left: Math.random() * 400,
          top: Math.random() * 200,
          width: 80,
          height: 80,
          fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
          stroke: '#000',
          strokeWidth: 2
        })

        fabricCanvasRef.current.add(rect)
        toast.success('Rectangle added!')
      }
    } catch (error) {
      console.error('Error adding rectangle:', error)
      toast.error('Failed to add rectangle')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Simple Fabric.js Test</h2>
        
        <div className="mb-4">
          <Button onClick={addRectangle} disabled={!isLoaded}>
            Add Rectangle
          </Button>
        </div>
        
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        
        {!isLoaded && (
          <div className="text-center py-8 text-gray-500">
            Loading Fabric.js...
          </div>
        )}
      </div>
    </div>
  )
}

export default SimpleFabricGangsheetBuilder
