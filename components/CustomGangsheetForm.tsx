"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Upload, FileText, Grid3X3, Plus, Minus, Trash2, Download, ChevronDown, Search, X } from 'lucide-react'
import Image from 'next/image'
// import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface GangsheetElement {
  id: string
  name: string
  quantity: number
  files?: File[]
  notes?: string
}

interface GangsheetFormData {
  gangsheetHeight: number // in feet
  setupType: 'full_setup' | 'element_only'
  elements: GangsheetElement[]
  fullSetupFiles?: File[]
  specialInstructions: string
  turnaroundTime: string
  designProof: boolean
  contactMethod: string
  contactDetails: string
}

const GANGSHEET_WIDTH = 22 // Fixed width in inches
const COST_PER_SQUARE_INCH = 0.50 // Cost per square inch

export default function CustomGangsheetForm() {
  const [formData, setFormData] = useState<GangsheetFormData>({
    gangsheetHeight: 1,
    setupType: 'full_setup',
    elements: [],
    fullSetupFiles: [],
    specialInstructions: '',
    turnaroundTime: 'normal',
    designProof: false,
    contactMethod: 'email',
    contactDetails: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isHeightDropdownOpen, setIsHeightDropdownOpen] = useState(false)
  const [heightSearchTerm, setHeightSearchTerm] = useState('')
  const heightDropdownRef = useRef<HTMLDivElement>(null)

  // Filter heights based on search term
  const filteredHeights = Array.from({ length: 328 }, (_, i) => i + 1).filter(height => 
    height.toString().includes(heightSearchTerm) || 
    heightSearchTerm === ''
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (heightDropdownRef.current && !heightDropdownRef.current.contains(event.target as Node)) {
        setIsHeightDropdownOpen(false)
        setHeightSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate pricing
  const calculatePricing = () => {
    const heightInInches = formData.gangsheetHeight * 12 // Convert feet to inches
    const totalSquareInches = GANGSHEET_WIDTH * heightInInches
    const basePrice = totalSquareInches * COST_PER_SQUARE_INCH
    const setupFee = 0 // No additional setup fees
    const totalPrice = basePrice + setupFee

    return {
      totalSquareInches,
      basePrice,
      setupFee,
      totalPrice
    }
  }

  const pricing = calculatePricing()

  // Add new element
  const addElement = () => {
    const newElement: GangsheetElement = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      file: undefined,
      fileUrl: undefined,
      notes: ''
    }
    setFormData(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }))
  }

  // Update element
  const updateElement = (id: string, field: keyof GangsheetElement, value: any) => {
    setFormData(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, [field]: value } : el
      )
    }))
  }

  // Remove element
  const removeElement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }))
  }

  // Handle file upload
  const handleFileUpload = (files: FileList | null, elementId: string) => {
    if (!files) return

    const validFiles: File[] = []
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/postscript', 'application/illustrator', 'image/vnd.adobe.photoshop']

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`)
        return
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} has an unsupported format.`)
        return
      }
      validFiles.push(file)
    })

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        elements: prev.elements.map(el =>
          el.id === elementId
            ? { ...el, files: [...(el.files || []), ...validFiles] }
            : el
        ),
      }))
      toast.success(`${validFiles.length} file(s) uploaded successfully!`)
    }
  }

  const handleDrop = (e: React.DragEvent, elementId: string) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files, elementId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeFile = (elementId: string, fileIndex: number) => {
    setFormData(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === elementId
          ? { ...el, files: (el.files || []).filter((_, index) => index !== fileIndex) }
          : el
      ),
    }))
    toast.info('File removed successfully!')
  }

  // Handle full setup file upload
  const handleFullSetupFileUpload = (files: FileList | null) => {
    if (!files) return

    const validFiles: File[] = []
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/postscript', 'application/illustrator', 'image/vnd.adobe.photoshop']

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`)
        return
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} has an unsupported format.`)
        return
      }
      validFiles.push(file)
    })

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        fullSetupFiles: [...(prev.fullSetupFiles || []), ...validFiles]
      }))
      toast.success(`${validFiles.length} file(s) uploaded successfully!`)
    }
  }

  const handleFullSetupDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFullSetupFileUpload(e.dataTransfer.files)
  }

  const removeFullSetupFile = (fileIndex: number) => {
    setFormData(prev => ({
      ...prev,
      fullSetupFiles: (prev.fullSetupFiles || []).filter((_, index) => index !== fileIndex)
    }))
    toast.info('File removed successfully!')
  }

  // Helper functions for turnaround time
  const getTurnaroundLabel = (turnaroundTime: string) => {
    const labels: { [key: string]: string } = {
      'normal': 'Normal (5-7 business days)',
      'rush': 'Rush (2-3 business days) (+$15)',
      'express': 'Express (1-2 business days) (+$25)',
      'same_day': 'Same Day (if ordered before 2 PM) (+$40)'
    }
    return labels[turnaroundTime] || 'Normal (5-7 business days)'
  }

  const getTurnaroundPrice = (turnaroundTime: string) => {
    const prices: { [key: string]: number } = {
      'normal': 0,
      'rush': 15,
      'express': 25,
      'same_day': 40
    }
    return prices[turnaroundTime] || 0
  }

  // Form validation
  const validateForm = () => {
    if (formData.setupType === 'full_setup' && (!formData.fullSetupFiles || formData.fullSetupFiles.length === 0)) {
      toast.error('Please upload your gangsheet file for full setup')
      return false
    }
    if (formData.setupType === 'element_only' && formData.elements.length === 0) {
      toast.error('Please add at least one element')
      return false
    }
    if (formData.designProof && !formData.contactDetails.trim()) {
      toast.error('Contact details are required for design proof')
      return false
    }
    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Prepare gangsheet data for checkout API
      const gangsheetData = {
        gangsheet_height: formData.gangsheetHeight,
        gangsheet_width: GANGSHEET_WIDTH,
        setup_type: formData.setupType,
        full_setup_files: formData.fullSetupFiles || [],
        design_elements: formData.elements.map(element => ({
          name: element.name,
          quantity: element.quantity,
          files: element.files || [],
          notes: element.notes || ''
        })),
        special_instructions: formData.specialInstructions,
        turnaround_time: formData.turnaroundTime,
        turnaround_time_label: getTurnaroundLabel(formData.turnaroundTime),
        turnaround_time_price: getTurnaroundPrice(formData.turnaroundTime),
        design_proof: formData.designProof ? 'Yes, send design proof before printing' : 'No, proceed directly to printing',
        proof_contact_method: formData.contactMethod,
        contact_details: formData.contactDetails,
        cost_per_square_inch: COST_PER_SQUARE_INCH
      }

      // Calculate pricing
      const gangsheetArea = GANGSHEET_WIDTH * formData.gangsheetHeight * 12 // Convert feet to inches
      const basePrice = gangsheetArea * COST_PER_SQUARE_INCH
      const turnaroundPrice = getTurnaroundPrice(formData.turnaroundTime)
      const totalPrice = basePrice + turnaroundPrice

      // Prepare order data for checkout
      const orderData = {
        product_name: 'Custom Gangsheet',
        gangsheet_data: gangsheetData,
        quantity: 1, // Gangsheet orders are always quantity 1
        total_price: totalPrice,
        base_price: basePrice,
        turnaround_price: turnaroundPrice,
        status: 'pending',
        paymentStatus: 'pending'
      }

      // Store in sessionStorage for checkout
      sessionStorage.setItem('currentOrder', JSON.stringify(orderData))
      
      // Show success message
      toast.success('Order prepared successfully! Redirecting to checkout...')
      
      // Redirect to checkout
      window.location.href = '/checkout'
    } catch (error) {
      console.error('Error preparing order:', error)
      toast.error('Failed to prepare order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Grid3X3 className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Custom Gangsheet Order</CardTitle>
            <p className="text-gray-600">Professional gangsheet printing with flexible sizing</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Gangsheet Specifications */}
              <Card className="border-0 bg-gray-50">
                <CardHeader>
                  <CardTitle>Gangsheet Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="gangsheet-height" className="text-sm font-medium">
                        Gangsheet Height *
                      </Label>
                      <div className="relative" ref={heightDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsHeightDropdownOpen(!isHeightDropdownOpen)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-left flex items-center justify-between"
                        >
                          <span className={formData.gangsheetHeight ? 'text-gray-900' : 'text-gray-500'}>
                            {formData.gangsheetHeight ? `${formData.gangsheetHeight} foot${formData.gangsheetHeight !== 1 ? 's' : ''}` : 'Select gangsheet height'}
                          </span>
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isHeightDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isHeightDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                            <div className="p-2 border-b border-gray-200">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search height..."
                                  value={heightSearchTerm}
                                  onChange={(e) => setHeightSearchTerm(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredHeights.length > 0 ? (
                                filteredHeights.map(height => (
                                  <button
                                    key={height}
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, gangsheetHeight: height }))
                                      setIsHeightDropdownOpen(false)
                                      setHeightSearchTerm('')
                                    }}
                                    className={`w-full px-4 py-2 text-left hover:bg-orange-50 hover:text-orange-700 transition-colors ${
                                      formData.gangsheetHeight === height ? 'bg-orange-100 text-orange-700' : 'text-gray-700'
                                    }`}
                                  >
                                    {height} foot{height !== 1 ? 's' : ''}
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-gray-500 text-sm">
                                  No heights found matching "{heightSearchTerm}"
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Width is fixed at 22 inches
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Setup Type *
                      </Label>
                      <div className="space-y-2 mt-2">
                        <Label className="flex items-center">
                          <input
                            type="radio"
                            name="setupType"
                            value="full_setup"
                            checked={formData.setupType === 'full_setup'}
                            onChange={(e) => setFormData(prev => ({ ...prev, setupType: e.target.value as 'full_setup' | 'element_only' }))}
                            className="mr-3 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-sm">Full setup gangsheet ready to print</span>
                        </Label>
                        <Label className="flex items-center">
                          <input
                            type="radio"
                            name="setupType"
                            value="element_only"
                            checked={formData.setupType === 'element_only'}
                            onChange={(e) => setFormData(prev => ({ ...prev, setupType: e.target.value as 'full_setup' | 'element_only' }))}
                            className="mr-3 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-sm">Provide elements and quantities (we'll setup)</span>
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Full Setup File Upload (only show if full_setup) */}
              {formData.setupType === 'full_setup' && (
              <Card className="border-0 bg-gray-50">
                <CardHeader>
                  <CardTitle>Upload Gangsheet File</CardTitle>
                </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Gangsheet Files *
                        </Label>
                        <div
                          className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer bg-orange-50"
                          onDrop={handleFullSetupDrop}
                          onDragOver={handleDragOver}
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.multiple = true
                            input.accept = 'image/*,.pdf,.ai,.psd,.eps'
                            input.onchange = (e) => {
                              const files = (e.target as HTMLInputElement).files
                              handleFullSetupFileUpload(files)
                            }
                            input.click()
                          }}
                        >
                          {!formData.fullSetupFiles || formData.fullSetupFiles.length === 0 ? (
                            <>
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-1">
                                Click to upload multiple files or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF, PDF, AI, PSD, EPS up to 10MB each
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="text-green-600 text-2xl mb-2">✓</div>
                              <p className="text-sm text-green-700 mb-1">
                                {formData.fullSetupFiles.length} files uploaded
                              </p>
                              <p className="text-xs text-green-600 underline">
                                Click to add more files
                              </p>
                            </>
                          )}
                        </div>
                        
                        {/* Hint section below upload area */}
                        <div className="mt-3 flex items-start">
                          <span className="text-yellow-500 mr-2 mt-0.5">💡</span>
                          <p className="text-xs text-gray-600">
                            High-resolution files with transparent backgrounds work best. You can upload multiple files for your gangsheet.
                          </p>
                        </div>

                        {/* Uploaded Files List */}
                        {formData.fullSetupFiles && formData.fullSetupFiles.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
                            <div className="grid grid-cols-4 gap-1">
                              {formData.fullSetupFiles.map((file, index) => (
                                <div key={index} className="relative bg-gray-100 rounded p-1">
                                  <div 
                                    className="aspect-square bg-gray-200 rounded flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-300 transition-colors"
                                    onClick={() => {
                                      if (file.type.startsWith('image/')) {
                                        setSelectedImage(URL.createObjectURL(file))
                                      }
                                    }}
                                  >
                                    {file.type.startsWith('image/') ? (
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <FileText className="h-6 w-6 text-gray-500" />
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFullSetupFile(index)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                  <p className="text-xs text-gray-600 mt-1 truncate" title={file.name}>
                                    {file.name}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">File Requirements:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• File should be ready for printing at the specified dimensions</li>
                          <li>• High resolution (300 DPI recommended)</li>
                          <li>• All design elements should be properly positioned</li>
                          <li>• Include any special instructions in the notes below</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Elements Section (only show if element_only) */}
              {formData.setupType === 'element_only' && (
                <Card className="border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Design Elements</CardTitle>
                      <Button
                        type="button"
                        onClick={addElement}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600"
                      >
                        <Plus className="h-4 w-4" />
                        Add Element
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {formData.elements.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No elements added yet. Click "Add Element" to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.elements.map((element, index) => (
                          <div key={element.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900">Element {index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeElement(element.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                  Element Name *
                                </Label>
                                <Input
                                  value={element.name}
                                  onChange={(e) => updateElement(element.id, 'name', e.target.value)}
                                  placeholder="e.g., Logo, Text, Design"
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                  Quantity *
                                </Label>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => updateElement(element.id, 'quantity', Math.max(1, element.quantity - 1))}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <Input
                                    type="number"
                                    value={element.quantity}
                                    onChange={(e) => updateElement(element.id, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-20 text-center"
                                    min="1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateElement(element.id, 'quantity', element.quantity + 1)}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                  Design Files
                                </Label>
                                <div
                                  className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer bg-orange-50"
                                  onDrop={(e) => handleDrop(e, element.id)}
                                  onDragOver={handleDragOver}
                                  onClick={() => {
                                    const input = document.createElement('input')
                                    input.type = 'file'
                                    input.multiple = true
                                    input.accept = 'image/*,.pdf,.ai,.psd,.eps'
                                    input.onchange = (e) => {
                                      const files = (e.target as HTMLInputElement).files
                                      handleFileUpload(files, element.id)
                                    }
                                    input.click()
                                  }}
                                >
                                  {!element.files || element.files.length === 0 ? (
                                    <>
                                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                      <p className="text-sm text-gray-600 mb-1">
                                        Click to upload multiple images or drag and drop
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 10MB each
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <div className="text-green-600 text-2xl mb-2">✓</div>
                                      <p className="text-sm text-green-700 mb-1">
                                        {element.files.length} images uploaded
                                      </p>
                                      <p className="text-xs text-green-600 underline">
                                        Click to add more images
                                      </p>
                                    </>
                                  )}
                                </div>
                                
                                {/* Hint section below upload area */}
                                <div className="mt-3 flex items-start">
                                  <span className="text-yellow-500 mr-2 mt-0.5">💡</span>
                                  <p className="text-xs text-gray-600">
                                    High-resolution images with transparent backgrounds work best. You can upload multiple images for this element.
                                  </p>
                                </div>

                                {/* Uploaded Files List */}
                                {element.files && element.files.length > 0 && (
                                  <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</h4>
                                    <div className="grid grid-cols-4 gap-1">
                                      {element.files.map((file, index) => (
                                        <div key={index} className="relative bg-gray-100 rounded p-1">
                                          <div 
                                            className="aspect-square bg-gray-200 rounded flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-300 transition-colors"
                                            onClick={() => {
                                              if (file.type.startsWith('image/')) {
                                                setSelectedImage(URL.createObjectURL(file))
                                              }
                                            }}
                                          >
                                            {file.type.startsWith('image/') ? (
                                              <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <FileText className="h-6 w-6 text-gray-500" />
                                            )}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => removeFile(element.id, index)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                          <p className="text-xs text-gray-600 mt-1 truncate" title={file.name}>
                                            {file.name}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="md:col-span-2">
                                <Label className="block text-sm font-medium text-gray-700 mb-2">
                                  Notes
                                </Label>
                                <textarea
                                  value={element.notes || ''}
                                  onChange={(e) => updateElement(element.id, 'notes', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                  placeholder="Any specific instructions for this element..."
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Additional Options */}
              <Card className="border-0 bg-gray-50">
                <CardHeader>
                  <CardTitle>Additional Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Turnaround Time
                      </Label>
                      <select
                        value={formData.turnaroundTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, turnaroundTime: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      >
                        <option value="normal">Normal (5-7 business days)</option>
                        <option value="rush">Rush (2-3 business days) (+$15)</option>
                        <option value="express">Express (1-2 business days) (+$25)</option>
                        <option value="same_day">Same Day (if ordered before 2 PM) (+$40)</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.designProof}
                          onChange={(e) => setFormData(prev => ({ ...prev, designProof: e.target.checked }))}
                          className="mr-3 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium">Design Proof Before Printing?</span>
                      </Label>
                    </div>

                    {formData.designProof && (
                      <div className="space-y-4 pl-6 border-l-2 border-orange-200">
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Quick way to send you design proof?
                          </Label>
                          <select
                            value={formData.contactMethod}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactMethod: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                          >
                            <option value="email">Email</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="phone">Phone Call</option>
                          </select>
                        </div>
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            {formData.contactMethod === 'email' ? 'Email Address' : 
                             formData.contactMethod === 'whatsapp' ? 'WhatsApp Number' : 'Phone Number'} *
                          </Label>
                          <Input
                            type={formData.contactMethod === 'email' ? 'email' : 'tel'}
                            value={formData.contactDetails}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactDetails: e.target.value }))}
                            className="w-full border-gray-300 focus:border-orange-500"
                            placeholder={formData.contactMethod === 'email' ? 'your@email.com' : 
                                       formData.contactMethod === 'whatsapp' ? '+1234567890' : '123-456-7890'}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.contactMethod === 'email' ? 'We\'ll send the proof to this email address' :
                             formData.contactMethod === 'whatsapp' ? 'We\'ll send the proof via WhatsApp' : 
                             'We\'ll call you to discuss the proof'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions
                      </Label>
                      <textarea
                        value={formData.specialInstructions}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Any special requirements or instructions..."
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card className="bg-orange-50 border-0">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-orange-900">Price Breakdown</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gangsheet Size:</span>
                      <span className="font-medium">{GANGSHEET_WIDTH}" × {formData.gangsheetHeight} ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Square Inches:</span>
                      <span className="font-medium">{pricing.totalSquareInches} sq in</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost per Square Inch:</span>
                      <span className="font-medium">${COST_PER_SQUARE_INCH.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-medium text-green-600">${pricing.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Setup Fee:</span>
                      <span className="font-medium text-green-600">$0.00</span>
                    </div>
                    <div className="border-t border-orange-200 pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900">Total Price:</span>
                        <span className="text-green-600">${pricing.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="text-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-4 px-6 h-auto"
                  size="lg"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Grid3X3 className="h-5 w-5 mr-2" />
                      Order Custom Gangsheet
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <Image
              src={selectedImage}
              alt="Full size preview"
              width={800}
              height={600}
              className="max-h-[80vh] w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}