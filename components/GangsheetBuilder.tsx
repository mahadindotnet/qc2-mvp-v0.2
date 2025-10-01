'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Stage, Layer, Image, Group, Rect, Line } from 'react-konva'
import Konva from 'konva'
import { useImage } from 'react-konva-utils'
import { useDropzone } from 'react-dropzone'
import jsPDF from 'jspdf'
import { 
  Upload, 
  Copy, 
  Trash2, 
  RotateCw, 
  Grid, 
  Calculator,
  FileText,
  Image as ImageIcon
} from 'lucide-react'

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
}

interface GangsheetBuilderProps {
  onPriceChange: (total: number) => void
}

const GangsheetBuilder: React.FC<GangsheetBuilderProps> = ({ onPriceChange }) => {
  const [items, setItems] = useState<GangsheetItem[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [totalPrice, setTotalPrice] = useState(0)
  
  const stageRef = useRef<Konva.Stage>(null)

  // Gangsheet dimensions: 22x24 inches at 300 DPI
  const GANGSHEET_WIDTH = 6600  // 22 inches * 300 DPI
  const GANGSHEET_HEIGHT = 7200 // 24 inches * 300 DPI
  const DISPLAY_WIDTH = 800     // Display width for UI
  const DISPLAY_HEIGHT = 873   // Display height for UI (maintains aspect ratio)

  // Calculate price based on area and number of items
  const calculatePrice = useCallback(() => {
    let price = 0
    items.forEach(item => {
      const area = (item.width * item.height) / (300 * 300) // Convert to square inches
      price += area * 0.5 // $0.50 per square inch
    })
    setTotalPrice(price)
    onPriceChange(price)
  }, [items, onPriceChange])

  useEffect(() => {
    calculatePrice()
  }, [calculatePrice])

  // Handle file upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        const newItem: GangsheetItem = {
          id: `item_${Date.now()}_${Math.random()}`,
          x: Math.random() * (DISPLAY_WIDTH - 100),
          y: Math.random() * (DISPLAY_HEIGHT - 100),
          width: 100,
          height: 100,
          rotation: 0,
          imageUrl,
          name: file.name,
          price: 0
        }
        setItems(prev => [...prev, newItem])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    multiple: true
  })

  // Duplicate item
  const duplicateItem = (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      const newItem: GangsheetItem = {
        ...item,
        id: `item_${Date.now()}_${Math.random()}`,
        x: item.x + 20,
        y: item.y + 20
      }
      setItems(prev => [...prev, newItem])
    }
  }

  // Delete item
  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
    if (selectedItem === id) {
      setSelectedItem(null)
    }
  }

  // Rotate item
  const rotateItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item
    ))
  }


  // Export as PNG
  const exportPNG = async () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 1,
        width: GANGSHEET_WIDTH,
        height: GANGSHEET_HEIGHT
      })
      const link = document.createElement('a')
      link.download = 'gangsheet-design.png'
      link.href = dataURL
      link.click()
    }
  }

  // Export as PDF
  const exportPDF = async () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 1,
        width: GANGSHEET_WIDTH,
        height: GANGSHEET_HEIGHT
      })
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: [22, 24]
      })
      
      pdf.addImage(dataURL, 'PNG', 0, 0, 22, 24)
      pdf.save('gangsheet-design.pdf')
    }
  }

  // Render grid
  const renderGrid = () => {
    if (!showGrid) return null
    
    const lines = []
    const scaleX = DISPLAY_WIDTH / GANGSHEET_WIDTH
    const scaleY = DISPLAY_HEIGHT / GANGSHEET_HEIGHT
    
    // Vertical lines
    for (let i = 0; i <= GANGSHEET_WIDTH; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * scaleX, 0, i * scaleX, DISPLAY_HEIGHT]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      )
    }
    
    // Horizontal lines
    for (let i = 0; i <= GANGSHEET_HEIGHT; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * scaleY, DISPLAY_WIDTH, i * scaleY]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      )
    }
    
    return lines
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex flex-wrap items-center gap-4">
          {/* Upload Area */}
          <div {...getRootProps()} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Upload Images</span>
            <input {...getInputProps()} />
          </div>

          {/* Grid Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showGrid ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Grid</span>
            </button>
            
            <select
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={10}>10px</option>
              <option value={20}>20px</option>
              <option value={50}>50px</option>
              <option value={100}>100px</option>
            </select>
          </div>

          {/* Export Options */}
          <div className="flex items-center space-x-2">
            <button
              onClick={exportPNG}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Export PNG</span>
            </button>
            
            <button
              onClick={exportPDF}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>

          {/* Price Calculator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-orange-100 rounded-lg">
            <Calculator className="h-4 w-4 text-orange-600" />
            <span className="text-orange-800 font-semibold">
              Total: ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Gangsheet Canvas</h4>
          <div className="text-sm text-gray-600">
            {GANGSHEET_WIDTH / 300}&quot; × {GANGSHEET_HEIGHT / 300}&quot; at 300 DPI
          </div>
        </div>

        <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          <Stage
            ref={stageRef}
            width={DISPLAY_WIDTH}
            height={DISPLAY_HEIGHT}
            scaleX={DISPLAY_WIDTH / GANGSHEET_WIDTH}
            scaleY={DISPLAY_HEIGHT / GANGSHEET_HEIGHT}
          >
            <Layer>
              {/* Grid */}
              {renderGrid()}
              
              {/* Gangsheet Items */}
              {items.map((item) => (
                <GangsheetItemComponent
                  key={item.id}
                  item={item}
                  selectedItem={selectedItem}
                  showGrid={showGrid}
                  gridSize={gridSize}
                  onSelect={setSelectedItem}
                  onUpdate={(updatedItem) => {
                    setItems(prev => prev.map(i => 
                      i.id === updatedItem.id ? updatedItem : i
                    ))
                  }}
                />
              ))}
            </Layer>
          </Stage>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-sm text-gray-600">
          <p>• Drag images to position them on the gangsheet</p>
          <p>• Click to select items, then use the controls below</p>
          <p>• Grid helps with precise alignment</p>
        </div>
      </div>

      {/* Item Controls */}
      {selectedItem && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h5 className="font-semibold text-gray-900 mb-4">Selected Item Controls</h5>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => duplicateItem(selectedItem)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>Duplicate</span>
            </button>
            
            <button
              onClick={() => rotateItem(selectedItem)}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              <span>Rotate 90°</span>
            </button>
            
            <button
              onClick={() => deleteItem(selectedItem)}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      {items.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h5 className="font-semibold text-gray-900 mb-4">Items on Gangsheet ({items.length})</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedItem === item.id 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedItem(item.id)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round(item.width / 3)}&quot; × {Math.round(item.height / 3)}&quot;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Separate component for gangsheet items to properly use hooks
const GangsheetItemComponent: React.FC<{
  item: GangsheetItem
  selectedItem: string | null
  showGrid: boolean
  gridSize: number
  onSelect: (id: string) => void
  onUpdate: (item: GangsheetItem) => void
}> = ({ item, selectedItem, showGrid, gridSize, onSelect, onUpdate }) => {
  const [image] = useImage(item.imageUrl)
  
  const snapToGrid = (value: number) => {
    return Math.round(value / gridSize) * gridSize
  }

  return (
    <Group
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      draggable
      onDragEnd={(e) => {
        const newX = showGrid ? snapToGrid(e.target.x()) : e.target.x()
        const newY = showGrid ? snapToGrid(e.target.y()) : e.target.y()
        onUpdate({ ...item, x: newX, y: newY })
      }}
      onClick={() => onSelect(item.id)}
      onTap={() => onSelect(item.id)}
    >
      <Rect
        width={item.width}
        height={item.height}
        fill="transparent"
        stroke={selectedItem === item.id ? '#FFA503' : 'transparent'}
        strokeWidth={2}
      />
      {image && (
        <Image
          image={image}
          width={item.width}
          height={item.height}
          alt={item.name}
        />
      )}
    </Group>
  )
}

export default GangsheetBuilder
