'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const FabricGangsheetBuilderV2: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const initFabric = async () => {
      try {
        if (canvasRef.current && !fabricCanvasRef.current) {
          // Check if the canvas element is already being used by Fabric.js
          const existingCanvas = canvasRef.current.getContext('2d')
          if (existingCanvas && existingCanvas.canvas === canvasRef.current) {
            console.log('Canvas already has context, skipping initialization')
            return
          }
          // Try different import methods
          let fabric
          
          try {
            // Method 1: Direct import
            const fabricModule = await import('fabric')
            fabric = fabricModule.fabric || fabricModule.default || fabricModule
          } catch (error) {
            console.log('Method 1 failed, trying method 2')
            
            // Method 2: Dynamic import with different syntax
            const fabricModule = await import('fabric/fabric-impl')
            fabric = fabricModule.fabric || fabricModule.default || fabricModule
          }
          
          if (!fabric || !fabric.Canvas) {
            throw new Error('Fabric.js not loaded properly')
          }
          
          // Check if canvas is already initialized by Fabric.js
          if (canvasRef.current.getContext('2d') && canvasRef.current.getContext('2d').canvas === canvasRef.current) {
            console.log('Canvas already has Fabric.js context, disposing first')
            // Try to dispose any existing Fabric.js canvas
            try {
              if (fabricCanvasRef.current) {
                fabricCanvasRef.current.dispose()
                fabricCanvasRef.current = null
              }
            } catch (error) {
              console.log('Error disposing existing canvas:', error)
            }
          }
          
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
        toast.error('Failed to initialize canvas: ' + error.message)
      }
    }

    initFabric()

    return () => {
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose()
          fabricCanvasRef.current = null
        } catch (error) {
          console.log('Error disposing canvas:', error)
        }
      }
    }
  }, [])

  const addRectangle = async () => {
    try {
      if (fabricCanvasRef.current) {
        let fabric
        
        try {
          const fabricModule = await import('fabric')
          fabric = fabricModule.fabric || fabricModule.default || fabricModule
        } catch (error) {
          const fabricModule = await import('fabric/fabric-impl')
          fabric = fabricModule.fabric || fabricModule.default || fabricModule
        }
        
        if (!fabric || !fabric.Rect) {
          throw new Error('Fabric.js not available')
        }
        
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
      toast.error('Failed to add rectangle: ' + error.message)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Fabric.js Test V2</h2>
        
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
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Status: {isLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
          <p>Canvas: {fabricCanvasRef.current ? '✅ Ready' : '❌ Not ready'}</p>
        </div>
      </div>
    </div>
  )
}

export default FabricGangsheetBuilderV2
