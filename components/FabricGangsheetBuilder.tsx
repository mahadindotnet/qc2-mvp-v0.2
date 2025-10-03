'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Grid, 
  Trash2, 
  Copy, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Settings,
  Layers,
  Ruler,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  RotateCw,
  RotateCcw,
  Move,
  Palette,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Save,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
// Dynamic import for Fabric.js to avoid SSR issues

// Constants
const DISPLAY_WIDTH = 660 // 22 inches at 30 DPI
const DISPLAY_HEIGHT = 720 // 24 inches at 30 DPI
const CANVAS_WIDTH = 660
const CANVAS_HEIGHT = 720

// Types
interface GangsheetItem {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  imageUrl: string
  name: string
  price: number
  locked: boolean
  visible: boolean
  layer: number
  opacity: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
}

interface GangsheetBuilderProps {
  onPriceChange?: (price: number) => void
}

const FabricGangsheetBuilder: React.FC<GangsheetBuilderProps> = ({ 
  onPriceChange 
}) => {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  
  // State
  const [items, setItems] = useState<GangsheetItem[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [zoom, setZoom] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize Fabric.js canvas
  useEffect(() => {
    const initFabric = async () => {
      if (canvasRef.current && !fabricCanvasRef.current) {
        const { fabric } = await import('fabric')
        const canvas = new fabric.Canvas(canvasRef.current, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: '#f9fafb',
        selection: true,
        preserveObjectStacking: true,
        allowTouchScrolling: true,
        fireRightClick: true,
        fireMiddleClick: true,
        stopContextMenu: true,
        enableRetinaScaling: true,
        imageSmoothingEnabled: true,
        renderOnAddRemove: true,
        skipTargetFind: false,
        uniScaleKey: 'shiftKey',
        centeredScaling: false,
        centeredRotation: false,
        allowRotation: true,
        snapAngle: 15,
        snapThreshold: 5,
        snap: {
          snapToGrid: snapToGrid,
          snapToObject: true,
          snapToPixel: true
        }
      })

      // Enable multi-selection
      canvas.selection = true
      canvas.selectionColor = 'rgba(255, 165, 3, 0.3)'
      canvas.selectionBorderColor = '#FFA503'
      canvas.selectionLineWidth = 2

      // Grid functionality
      const drawGrid = async () => {
        if (!showGrid) return
        
        const { fabric } = await import('fabric')
        const grid = new fabric.Group([], {
          selectable: false,
          evented: false,
          excludeFromExport: true
        })

        // Vertical lines
        for (let i = 0; i <= CANVAS_WIDTH; i += gridSize) {
          const line = new fabric.Line([i, 0, i, CANVAS_HEIGHT], {
            stroke: '#9ca3af',
            strokeWidth: 1,
            opacity: 0.3,
            selectable: false,
            evented: false
          })
          grid.add(line)
        }

        // Horizontal lines
        for (let i = 0; i <= CANVAS_HEIGHT; i += gridSize) {
          const line = new fabric.Line([0, i, CANVAS_WIDTH, i], {
            stroke: '#9ca3af',
            strokeWidth: 1,
            opacity: 0.3,
            selectable: false,
            evented: false
          })
          grid.add(line)
        }

        canvas.add(grid)
        canvas.sendToBack(grid)
      }

      // Event handlers
      canvas.on('selection:created', (e) => {
        if (e.selected && e.selected.length > 0) {
          const selectedIds = e.selected.map((obj: any) => obj.id).filter(Boolean)
          if (selectedIds.length > 0) {
            setSelectedItem(selectedIds[0])
          }
        }
      })

      canvas.on('selection:updated', (e) => {
        if (e.selected && e.selected.length > 0) {
          const selectedIds = e.selected.map((obj: any) => obj.id).filter(Boolean)
          if (selectedIds.length > 0) {
            setSelectedItem(selectedIds[0])
          }
        }
      })

      canvas.on('selection:cleared', () => {
        setSelectedItem(null)
      })

      canvas.on('object:added', (e) => {
        if (e.target && e.target.id) {
          const item = items.find(i => i.id === e.target.id)
          if (item) {
            // Update item position from fabric object
            const updatedItem = {
              ...item,
              x: e.target.left || 0,
              y: e.target.top || 0,
              rotation: e.target.angle || 0,
              scaleX: e.target.scaleX || 1,
              scaleY: e.target.scaleY || 1
            }
            setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i))
          }
        }
      })

      canvas.on('object:modified', (e) => {
        if (e.target && e.target.id) {
          const item = items.find(i => i.id === e.target.id)
          if (item) {
            const updatedItem = {
              ...item,
              x: e.target.left || 0,
              y: e.target.top || 0,
              rotation: e.target.angle || 0,
              scaleX: e.target.scaleX || 1,
              scaleY: e.target.scaleY || 1,
              width: (e.target.width || 0) * (e.target.scaleX || 1),
              height: (e.target.height || 0) * (e.target.scaleY || 1)
            }
            setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i))
          }
        }
      })

      // Initial grid
      drawGrid()

      fabricCanvasRef.current = canvas

        return () => {
          canvas.dispose()
        }
      }
    }
    
    initFabric()
  }, [showGrid, gridSize, snapToGrid, items])

  // Update grid when settings change
  useEffect(() => {
    const updateGrid = async () => {
      if (fabricCanvasRef.current) {
        // Remove existing grid
        const objects = fabricCanvasRef.current.getObjects()
        objects.forEach(obj => {
          if (obj.type === 'group' && obj.excludeFromExport) {
            fabricCanvasRef.current?.remove(obj)
          }
        })

        // Draw new grid
        if (showGrid) {
          const { fabric } = await import('fabric')
          const grid = new fabric.Group([], {
          selectable: false,
          evented: false,
          excludeFromExport: true
        })

        // Vertical lines
        for (let i = 0; i <= CANVAS_WIDTH; i += gridSize) {
          const line = new fabric.Line([i, 0, i, CANVAS_HEIGHT], {
            stroke: '#9ca3af',
            strokeWidth: 1,
            opacity: 0.3,
            selectable: false,
            evented: false
          })
          grid.add(line)
        }

        // Horizontal lines
        for (let i = 0; i <= CANVAS_HEIGHT; i += gridSize) {
          const line = new fabric.Line([0, i, CANVAS_WIDTH, i], {
            stroke: '#9ca3af',
            strokeWidth: 1,
            opacity: 0.3,
            selectable: false,
            evented: false
          })
          grid.add(line)
        }

          fabricCanvasRef.current.add(grid)
          fabricCanvasRef.current.sendToBack(grid)
        }
      }
    }
    
    updateGrid()
  }, [showGrid, gridSize])

  // Handle file upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const maxFiles = 20
    const maxFileSize = 50 * 1024 * 1024 // 50MB
    
    if (acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    acceptedFiles.forEach((file) => {
      if (file.size > maxFileSize) {
        toast.error(`File ${file.name} is too large (max 50MB)`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        const img = new Image()
        img.onload = async () => {
          if (fabricCanvasRef.current) {
            const { fabric } = await import('fabric')
            const fabricImage = new fabric.Image(img, {
              left: Math.random() * (CANVAS_WIDTH - 100),
              top: Math.random() * (CANVAS_HEIGHT - 100),
              scaleX: 0.5,
              scaleY: 0.5,
              id: `item_${Date.now()}_${Math.random()}`,
              name: file.name,
              price: 0,
              locked: false,
              visible: true,
              layer: items.length,
              opacity: 1,
              scaleX: 1,
              scaleY: 1,
              skewX: 0,
              skewY: 0
            })

            const newItem: GangsheetItem = {
              id: fabricImage.id!,
              x: fabricImage.left || 0,
              y: fabricImage.top || 0,
              width: (fabricImage.width || 0) * (fabricImage.scaleX || 1),
              height: (fabricImage.height || 0) * (fabricImage.scaleY || 1),
              rotation: fabricImage.angle || 0,
              imageUrl,
              name: file.name,
              price: 0,
              locked: false,
              visible: true,
              layer: items.length,
              opacity: 1,
              scaleX: 1,
              scaleY: 1,
              skewX: 0,
              skewY: 0
            }

            fabricCanvasRef.current?.add(fabricImage)
            setItems(prev => [...prev, newItem])
            toast.success(`Added ${file.name}`)
          }
        }
        img.src = imageUrl
      }
      reader.readAsDataURL(file)
    })
  }, [items.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    multiple: true,
    disabled: isLoading
  })

  // Handle item deletion
  const handleItemDelete = useCallback(() => {
    if (fabricCanvasRef.current) {
      const activeObjects = fabricCanvasRef.current.getActiveObjects()
      if (activeObjects.length > 0) {
        fabricCanvasRef.current.remove(...activeObjects)
        const deletedIds = activeObjects.map(obj => obj.id).filter(Boolean)
        setItems(prev => prev.filter(item => !deletedIds.includes(item.id)))
        setSelectedItem(null)
        toast.success('Items deleted')
      }
    }
  }, [])

  // Handle item duplication
  const handleItemDuplicate = useCallback(() => {
    if (fabricCanvasRef.current) {
      const activeObjects = fabricCanvasRef.current.getActiveObjects()
      if (activeObjects.length > 0) {
        activeObjects.forEach(obj => {
          obj.clone((cloned: fabric.Object) => {
            cloned.set({
              left: (obj.left || 0) + 20,
              top: (obj.top || 0) + 20,
              id: `item_${Date.now()}_${Math.random()}`
            })
            fabricCanvasRef.current?.add(cloned)
            
            const newItem: GangsheetItem = {
              id: cloned.id!,
              x: cloned.left || 0,
              y: cloned.top || 0,
              width: (cloned.width || 0) * (cloned.scaleX || 1),
              height: (cloned.height || 0) * (cloned.scaleY || 1),
              rotation: cloned.angle || 0,
              imageUrl: obj.get('src') || '',
              name: obj.get('name') || 'Duplicated Item',
              price: 0,
              locked: false,
              visible: true,
              layer: items.length,
              opacity: 1,
              scaleX: 1,
              scaleY: 1,
              skewX: 0,
              skewY: 0
            }
            
            setItems(prev => [...prev, newItem])
          })
        })
        toast.success('Items duplicated')
      }
    }
  }, [items.length])

  // Handle zoom
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (fabricCanvasRef.current) {
      const zoomFactor = 0.1
      const newZoom = direction === 'in' 
        ? Math.min(zoom + zoomFactor, 3)
        : Math.max(zoom - zoomFactor, 0.1)
      
      setZoom(newZoom)
      fabricCanvasRef.current.setZoom(newZoom)
    }
  }, [zoom])

  // Handle export
  const handleExport = useCallback((format: 'png' | 'pdf') => {
    if (fabricCanvasRef.current) {
      if (format === 'png') {
        const dataURL = fabricCanvasRef.current.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2
        })
        
        const link = document.createElement('a')
        link.download = `gangsheet-${Date.now()}.png`
        link.href = dataURL
        link.click()
        
        toast.success('Gangsheet exported as PNG')
      } else if (format === 'pdf') {
        // PDF export would require additional library
        toast.info('PDF export coming soon')
      }
    }
  }, [])

  // Calculate total price
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.price, 0)
    setTotalPrice(total)
    onPriceChange?.(total)
  }, [items, onPriceChange])

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gangsheet Builder</h2>
          <p className="text-gray-600">Create professional gangsheets with drag & drop</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {items.length} items
          </Badge>
          <Badge variant="outline" className="text-sm">
            Total: ${totalPrice.toFixed(2)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Tools */}
        <div className="lg:col-span-1 space-y-4">
          {/* File Upload */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-900 mb-3">Upload Images</h3>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive ? 'Drop files here' : 'Drag & drop images or click to browse'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, SVG up to 50MB each
              </p>
            </div>
          </div>

          {/* Tools */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-900 mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleItemDuplicate}
                disabled={!selectedItem}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleItemDelete}
                disabled={!selectedItem}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* View Controls */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-900 mb-3">View</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="grid-toggle" className="text-sm">Show Grid</Label>
                <Switch
                  id="grid-toggle"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Grid Size</Label>
                <Select value={gridSize.toString()} onValueChange={(value) => setGridSize(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                    <SelectItem value="50">50px</SelectItem>
                    <SelectItem value="100">100px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="snap-toggle" className="text-sm">Snap to Grid</Label>
                <Switch
                  id="snap-toggle"
                  checked={snapToGrid}
                  onCheckedChange={setSnapToGrid}
                />
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-900 mb-3">Zoom</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('out')}
                disabled={zoom <= 0.1}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 flex-1 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('in')}
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Export */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-900 mb-3">Export</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('png')}
                className="w-full flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Design Canvas</h3>
              <div className="text-sm text-gray-500">
                {DISPLAY_WIDTH} × {DISPLAY_HEIGHT}px
              </div>
            </div>
            
            <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              <canvas
                ref={canvasRef}
                className="block"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              
              {items.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-2">No items yet</p>
                    <p className="text-sm text-gray-500">
                      Upload images to start building your gangsheet
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>• <strong>Click</strong> to select items</p>
              <p>• <strong>Ctrl/Cmd + Click</strong> for multi-selection</p>
              <p>• <strong>Drag</strong> to move items</p>
              <p>• <strong>Corner handles</strong> to resize</p>
              <p>• <strong>Rotation handle</strong> to rotate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FabricGangsheetBuilder
