'use client'

import { useState, useRef } from 'react'
import { ShoppingCart, Upload, X, FileImage, Calculator } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'


interface ColorCopiesDesign {
  printOptions: string
  frontSideFiles: File[]
  frontSideInstructions: string
  turnaroundTime: string
  designProof: string
  proofContactMethod: string
  contactDetails: string
  quantity: number
}

const printOptions = [
  { value: '8.5x11-single', label: '8.5x11 - Single side', price: 0.49 },
  { value: '8.5x11-double', label: '8.5x11 - Double Side', price: 0.75 },
  { value: '8.5x11-glossy', label: '8.5x11 - Glossy', price: 0.98 },
  { value: '8.5x11-glossy-double', label: '8.5x11 - Glossy Double Side', price: 1.50 },
  { value: '11x14-single', label: '11x14 - Single side', price: 1.00 },
  { value: '11x14-double', label: '11x14 - Double sided', price: 1.49 },
  { value: '11x17-poster-single', label: '11x17 - Poster Single Side', price: 1.49 },
  { value: '11x17-poster-double', label: '11x17 - Poster Double Side', price: 2.50 },
  { value: '11x17-poster-glossy-single', label: '11x17 Poster Glossy Single Side', price: 5.00 },
  { value: '11x17-poster-glossy-double', label: '11x17 - Poster Glossy Double Side', price: 7.50 }
]

const turnaroundOptions = [
  { value: 'normal', label: 'Normal', price: 0 },
  { value: 'same-day', label: 'Same Day', price: 15 },
  { value: 'rush', label: 'Rush (Less than 2 Hours)', price: 25 },
  { value: 'express', label: 'Express (Overnight)', price: 35 }
]

const designProofOptions = [
  { value: 'Yes, send design proof before printing', label: 'Yes, send me a proof' },
  { value: 'No, proceed directly to printing', label: 'No, proceed directly to printing' }
]


export default function ColorCopiesForm() {
  const [design, setDesign] = useState<ColorCopiesDesign>({
    printOptions: '',
    frontSideFiles: [],
    frontSideInstructions: '',
    turnaroundTime: '',
    designProof: '',
    proofContactMethod: '',
    contactDetails: '',
    quantity: 1
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedPrintOption = printOptions.find(option => option.value === design.printOptions)
  const selectedTurnaround = turnaroundOptions.find(option => option.value === design.turnaroundTime)
  const basePrice = selectedPrintOption ? selectedPrintOption.price : 0
  const turnaroundPrice = selectedTurnaround ? selectedTurnaround.price : 0
  const printTypeTotal = basePrice * design.quantity  // Quantity only applies to print type
  const totalPrice = printTypeTotal + turnaroundPrice  // Turnaround is fixed fee

  const handleInputChange = (field: keyof ColorCopiesDesign, value: any) => {
    setDesign(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (files: FileList | null, side: 'front' | 'back') => {
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
      setDesign(prev => ({
        ...prev,
        [`${side}SideFiles`]: [...prev[`${side}SideFiles` as keyof typeof prev] as File[], ...validFiles]
      }))
      toast.success(`${validFiles.length} file(s) uploaded successfully!`)
    }
  }

  const removeFile = (index: number, side: 'front' | 'back') => {
    setDesign(prev => ({
      ...prev,
      [`${side}SideFiles`]: (prev[`${side}SideFiles` as keyof typeof prev] as File[]).filter((_, i) => i !== index)
    }))
  }

  const handleDrop = (e: React.DragEvent, side: 'front' | 'back') => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files, side)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get selected options
      const selectedPrintOption = printOptions.find(option => option.value === design.printOptions)
      const selectedTurnaround = turnaroundOptions.find(option => option.value === design.turnaroundTime)
      
      if (!selectedPrintOption || !selectedTurnaround) {
        toast.error('Please select all required options')
        return
      }
      
      // Calculate pricing
      const basePrice = selectedPrintOption.price
      const turnaroundPrice = selectedTurnaround.price
      const printTypeTotal = basePrice * design.quantity  // Quantity only applies to print type
      const totalPrice = printTypeTotal + turnaroundPrice  // Turnaround is fixed fee
      
      // Prepare order data for checkout
      const orderData = {
        printType: design.printOptions,
        printTypeLabel: selectedPrintOption.label,
        printTypePrice: selectedPrintOption.price,
        quantity: design.quantity,
        frontSideFiles: await Promise.all(design.frontSideFiles.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
          console.log(`Converting file ${file.name}: ${base64.substring(0, 50)}...`)
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            data: base64
          }
        })),
        frontSideInstructions: design.frontSideInstructions,
        turnaroundTime: design.turnaroundTime,
        turnaroundTimeLabel: selectedTurnaround.label,
        turnaroundTimePrice: selectedTurnaround.price,
        designProof: design.designProof,
        proofContactMethod: design.proofContactMethod,
        contactDetails: design.contactDetails,
        basePrice: printTypeTotal,
        turnaroundPrice: turnaroundPrice,
        totalPrice: totalPrice
      }
      
      // Prepare order data in the same format as T-shirt orders
      const universalOrderData = {
        product_name: 'Color Copies',
        print_type: selectedPrintOption.label,
        print_areas: [{
          id: 'front',
          name: selectedPrintOption.label,
          price: selectedPrintOption.price,
          selected: true
        }],
        quantity: design.quantity,
        base_price: printTypeTotal,
        turnaround_time: {
          label: selectedTurnaround.label,
          price: selectedTurnaround.price
        },
        total_price: totalPrice,
        design_proof_required: design.designProof === 'Yes, send design proof before printing',
        proof_contact_details: design.contactDetails,
        // Color Copies specific fields
        color_copies_data: {
          printType: design.printOptions,
          printTypeLabel: selectedPrintOption.label,
          printTypePrice: selectedPrintOption.price,
          frontSideFiles: orderData.frontSideFiles,
          frontSideInstructions: design.frontSideInstructions,
          turnaroundTime: design.turnaroundTime,
          turnaroundTimeLabel: selectedTurnaround.label,
          turnaroundTimePrice: selectedTurnaround.price,
          designProof: design.designProof,
          proofContactMethod: design.proofContactMethod,
          contactDetails: design.contactDetails
        }
      }
      
      // Store in session storage using the same key as T-shirt orders
      sessionStorage.setItem('currentOrder', JSON.stringify(universalOrderData))
      
      toast.success('Redirecting to checkout...', {
        description: 'Please complete your order details',
        duration: 3000
      })

      // Redirect to universal checkout
      window.location.href = '/checkout'

    } catch (error) {
      toast.error('Failed to submit order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Color Copies Order Form */}
      <div className="w-full max-w-2xl bg-white/60 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">Order your Color Copies</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center">
          Professional Color Printing Services<br />
          High-quality prints with competitive pricing
        </p>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* Print Options */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Print Type *</label>
              <Select
                value={design.printOptions}
                onValueChange={(value) => handleInputChange('printOptions', value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose print option" />
                </SelectTrigger>
                <SelectContent>
                  {printOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} - ${option.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Front Side Customization */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload image or design files *</label>
              <div
                className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer bg-orange-50"
                onDrop={(e) => handleDrop(e, 'front')}
                onDragOver={handleDragOver}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.multiple = true
                  input.accept = 'image/*,.pdf,.ai,.psd,.eps'
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    handleFileUpload(files, 'front')
                  }
                  input.click()
                }}
              >
                {design.frontSideFiles.length === 0 ? (
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
                      {design.frontSideFiles.length} images uploaded
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
                  High-resolution images with transparent backgrounds work best. You can upload multiple images for this print area.
                </p>
              </div>

              {/* Uploaded Files List for Front */}
              {design.frontSideFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {design.frontSideFiles.map((file, index) => (
                      <div key={index} className="relative bg-gray-100 rounded-lg p-2">
                        <div className="aspect-square bg-gray-200 rounded flex items-center justify-center">
                          <FileImage className="h-6 w-6 text-gray-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'front')}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <span className="mr-1">💡</span>
                    High-resolution images with transparent backgrounds work best. You can upload multiple images for this print area.
                  </p>
                </div>
              )}
            </div>

            {/* Designer Instructions for Front Side */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-green-600 mr-2">✓</span>
                <h4 className="text-sm font-semibold text-gray-900">Designer Instructions</h4>
              </div>
              <textarea
                value={design.frontSideInstructions}
                onChange={(e) => handleInputChange('frontSideInstructions', e.target.value)}
                placeholder="Provide specific instructions for only front side (e.g., font preferences, color schemes, placement details, special effects, etc.)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <span className="mr-1">💡</span>
                Be as specific as possible to help our designers create exactly what you envision for this area
              </p>
            </div>
          </div>

          {/* Turnaround Time and Design Proof - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Turnaround Time */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Turnaround Time *</label>
              <Select
                value={design.turnaroundTime}
                onValueChange={(value) => handleInputChange('turnaroundTime', value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select turnaround time" />
                </SelectTrigger>
                <SelectContent>
                  {turnaroundOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} {option.price > 0 && `($${option.price.toFixed(2)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Design Proof */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Design Proof Before Printing?</label>
              <Select
                value={design.designProof}
                onValueChange={(value) => handleInputChange('designProof', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {designProofOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Details for Design Proof - Conditional */}
          {design.designProof === 'Yes, send design proof before printing' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick way to send you design proof?</label>
                <Select
                  value={design.proofContactMethod}
                  onValueChange={(value) => handleInputChange('proofContactMethod', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Your WhatsApp / Phone Number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">Your WhatsApp / Phone Number</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="messenger">Messenger</SelectItem>
                    <SelectItem value="skype">Skype</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {design.proofContactMethod === 'whatsapp' && 'Phone/WhatsApp Number'}
                  {design.proofContactMethod === 'email' && 'Email Address'}
                  {design.proofContactMethod === 'messenger' && 'Messenger Username'}
                  {design.proofContactMethod === 'skype' && 'Skype Username'}
                  {!design.proofContactMethod && 'Contact Details'}
                </label>
                <Input
                  type={design.proofContactMethod === 'email' ? 'email' : 'text'}
                  value={design.contactDetails}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contactDetails', e.target.value)}
                  placeholder={
                    design.proofContactMethod === 'whatsapp' ? '+1 (651) 488-1244 or +16514881244' :
                    design.proofContactMethod === 'email' ? 'your.email@example.com' :
                    design.proofContactMethod === 'messenger' ? 'your.messenger.username' :
                    design.proofContactMethod === 'skype' ? 'your.skype.username' :
                    'Enter your contact details'
                  }
                  className="w-full border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {design.proofContactMethod === 'whatsapp' && 'Enter a valid phone number (e.g., +1 (651) 488-1244)'}
                  {design.proofContactMethod === 'email' && 'Enter a valid email address (e.g., your.email@example.com)'}
                  {design.proofContactMethod === 'messenger' && 'Enter your Messenger username or profile link'}
                  {design.proofContactMethod === 'skype' && 'Enter your Skype username or profile link'}
                  {!design.proofContactMethod && 'Enter your contact details based on the selected method above'}
                </p>
              </div>
            </div>
          )}






          {/* Price Breakdown */}
          {selectedPrintOption && (
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-400">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-gray-700" />
                <h3 className="font-bold text-gray-800">Price Breakdown</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                {/* Quantity Section */}
                <div>
                  <div className="font-bold text-gray-800">Quantity:</div>
                  <div className="flex justify-between items-center ml-4">
                    <span className="text-gray-700">{design.quantity} item{design.quantity > 1 ? 's' : ''}</span>
                    <span className="text-gray-700">× {design.quantity}</span>
                  </div>
                </div>

                {/* Divider */}
                <hr className="border-gray-300 border-t" />

                {/* Print Areas Total */}
                <div className="flex justify-between">
                  <span className="text-gray-700">Print Areas Total:</span>
                  <span className="text-gray-700">${printTypeTotal.toFixed(2)}</span>
                </div>

                {/* Turnaround Time (fixed) */}
                <div className="flex justify-between">
                  <span className="text-gray-700">Turnaround Time (fixed):</span>
                  <span className="text-gray-700">${turnaroundPrice.toFixed(2)}</span>
                </div>

                {/* Orange Divider */}
                <hr className="border-orange-400 border-t-2" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-base">Total ({design.quantity} item{design.quantity > 1 ? 's' : ''}):</span>
                  <span className="font-bold text-green-600 text-base">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector and Action Buttons */}
          <div className="space-y-4">
            {/* Quantity Label at Top */}
            <div>
              <label className="text-sm font-medium text-gray-700">Quantity</label>
            </div>

            {/* Quantity Selector and Add to Cart - 30/70 Split */}
            <div className="flex items-center gap-4">
              {/* Quantity Selector - 30% */}
              <div className="w-[30%] flex items-center border border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDesign(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-gray-800 min-w-[3rem] text-center flex-1">
                  {design.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setDesign(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button - 70% */}
              <button
                type="button"
                disabled={isSubmitting || !design.printOptions || design.frontSideFiles.length === 0 || !design.turnaroundTime}
                className="w-[70%] flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-bold transition-colors duration-200"
              >
                <ShoppingCart className="h-4 w-4" />
                ADD TO CART
              </button>
            </div>

            {/* Buy Now Button - Full Width with Gradient Animation */}
            <button
              type="submit"
              disabled={isSubmitting || !design.printOptions || design.frontSideFiles.length === 0 || !design.turnaroundTime}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all duration-300 bg-[length:200%_100%] hover:bg-[length:200%_100%] animate-gradient-x"
            >
              {isSubmitting ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}