'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const SimpleFabricTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [fabric, setFabric] = useState<any>(null)
  const [canvas, setCanvas] = useState<any>(null)

  useEffect(() => {
    const loadFabric = async () => {
      try {
        // Load Fabric.js
        const fabricModule = await import('fabric')
        const fabricInstance = fabricModule.fabric || fabricModule.default || fabricModule
        
        if (!fabricInstance || !fabricInstance.Canvas) {
          throw new Error('Fabric.js not loaded properly')
        }
        
        setFabric(fabricInstance)
        setIsLoaded(true)
        toast.success('Fabric.js loaded successfully!')
      } catch (error) {
        console.error('Error loading Fabric.js:', error)
        toast.error('Failed to load Fabric.js: ' + error.message)
      }
    }

    loadFabric()
  }, [])

  const initializeCanvas = () => {
    if (!fabric || !canvasRef.current || canvas) return

    try {
      const newCanvas = new fabric.Canvas(canvasRef.current, {
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

      newCanvas.add(rect)
      setCanvas(newCanvas)
      toast.success('Canvas initialized!')
    } catch (error) {
      console.error('Error initializing canvas:', error)
      toast.error('Failed to initialize canvas: ' + error.message)
    }
  }

  const addRectangle = () => {
    if (!canvas || !fabric) return

    try {
      const rect = new fabric.Rect({
        left: Math.random() * 400,
        top: Math.random() * 200,
        width: 80,
        height: 80,
        fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
        stroke: '#000',
        strokeWidth: 2
      })

      canvas.add(rect)
      toast.success('Rectangle added!')
    } catch (error) {
      console.error('Error adding rectangle:', error)
      toast.error('Failed to add rectangle: ' + error.message)
    }
  }

  const clearCanvas = () => {
    if (!canvas) return

    try {
      canvas.clear()
      toast.success('Canvas cleared!')
    } catch (error) {
      console.error('Error clearing canvas:', error)
      toast.error('Failed to clear canvas: ' + error.message)
    }
  }

  useEffect(() => {
    return () => {
      if (canvas) {
        try {
          canvas.dispose()
        } catch (error) {
          console.log('Error disposing canvas:', error)
        }
      }
    }
  }, [canvas])

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Simple Fabric.js Test</h2>
        
        <div className="mb-4 flex gap-2">
          <Button onClick={initializeCanvas} disabled={!isLoaded || !!canvas}>
            Initialize Canvas
          </Button>
          <Button onClick={addRectangle} disabled={!canvas}>
            Add Rectangle
          </Button>
          <Button onClick={clearCanvas} disabled={!canvas}>
            Clear Canvas
          </Button>
        </div>
        
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>Fabric.js: {isLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
          <p>Canvas: {canvas ? '✅ Initialized' : '❌ Not initialized'}</p>
          <p>Objects: {canvas ? canvas.getObjects().length : 0}</p>
        </div>
      </div>
    </div>
  )
}

export default SimpleFabricTest
