'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Palette, Shirt, Plus, Minus } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { toast } from 'sonner'
import FrontBackCustomization from './FrontBackCustomization'

interface PrintArea {
  id: string
  name: string
  price: number
  selected: boolean
}

interface TurnaroundOption {
  label: string
  price: number
}

interface TShirtDesign {
  shirtColor: string
  printAreas: PrintArea[]
  size: string
  printType: string
  quantity: number
  turnaroundTime: TurnaroundOption
  designProof: string
  proofContactMethod: string
  contactDetails: string
  areaInstructions: Array<{
    areaId: string
    instructions: string
  }>
  textElements: Array<{
    id: string
    text: string
    color: string
    fontSize: number
    area: string
  }>
  imageElements: Array<{
    id: string
    imageUrl: string
    area: string
    width: number
    height: number
    fileName?: string
  }>
}

const PRINT_AREAS: PrintArea[] = [
  { id: 'front', name: 'Only Front Side', price: 20.00, selected: false },
  { id: 'back', name: 'Only Back Side', price: 20.00, selected: false },
  { id: 'front-back', name: 'Front & Back', price: 35.00, selected: false },
  { id: 'right-sleeve', name: 'Right Sleeve', price: 5.00, selected: false },
  { id: 'left-sleeve', name: 'Left Sleeve', price: 5.00, selected: false }
]

const SHIRT_SIZES = [
  // Kids Sizes
  'Kids 2T',
  'Kids 3T', 
  'Kids 4T',
  // Youth Sizes
  'Youth X-Small',
  'Youth Small',
  'Youth Medium',
  'Youth Large',
  // Adult Sizes
  'Adult Small',
  'Adult Medium',
  'Adult Large',
  'Adult X-Large',
  'Adult 2XL',
  'Adult 3XL',
  'Adult 4XL',
  'Adult 5XL',
  'Adult 6XL'
]
const PRINT_TYPES = ['DTF (Direct to Film)', 'Sublimation']

const TURNAROUND_OPTIONS = [
  { label: 'Normal', price: 0.00 },
  { label: 'Same Day', price: 15.00 },
  { label: 'Rush (Less than 2 Hours)', price: 25.00 },
  { label: 'Express (Overnight)', price: 35.00 }
]

const DESIGN_PROOF_OPTIONS = [
  'Yes, send design proof before printing',
  'No, proceed directly to printing'
]

const DESIGN_PROOF_CONTACT_OPTIONS = [
  'Your WhatsApp / Phone Number',
  'Email',
  'Messenger',
  'Skype'
]

const DEFAULT_SHIRT_COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
]

export default function TShirtDesigner() {
  const [design, setDesign] = useState<TShirtDesign>({
    shirtColor: '#FFFFFF',
    printAreas: PRINT_AREAS,
    size: 'Adult Medium',
    printType: 'DTF (Direct to Film)',
    quantity: 1,
            turnaroundTime: { label: 'Same Day', price: 15.00 },
            designProof: 'No, proceed directly to printing',
            proofContactMethod: 'Your WhatsApp / Phone Number',
    contactDetails: '',
    areaInstructions: [],
    textElements: [],
    imageElements: []
  })

  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColors, setCustomColors] = useState<string[]>([])
  const [contactValidationError, setContactValidationError] = useState<string>('')
  const [imageUploadErrors, setImageUploadErrors] = useState<{[key: string]: string}>({})
  const [formValidationErrors, setFormValidationErrors] = useState<{[key: string]: string}>({})

  const getContactInputDetails = (method: string) => {
    switch (method) {
      case 'Your WhatsApp / Phone Number':
        return {
          placeholder: '+1 (651) 488-1244 or +16514881244',
          type: 'tel',
          label: 'Phone/WhatsApp Number',
          pattern: '^[+]?[0-9\\s\\-\\(\\)]{10,}$',
          title: 'Enter a valid phone number (e.g., +1 (651) 488-1244)',
          validation: (value: string) => {
            const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/
            return phoneRegex.test(value.trim())
          }
        }
      case 'Email':
        return {
          placeholder: 'your.email@example.com',
          type: 'email',
          label: 'Email Address',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          title: 'Enter a valid email address',
          validation: (value: string) => {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            return emailRegex.test(value.trim())
          }
        }
      case 'Messenger':
        return {
          placeholder: 'your.messenger.username or m.me/yourusername',
          type: 'text',
          label: 'Messenger Username',
          pattern: '^[a-zA-Z0-9._-]+$',
          title: 'Enter your Messenger username (letters, numbers, dots, underscores, hyphens only)',
          validation: (value: string) => {
            const messengerRegex = /^[a-zA-Z0-9._-]+$/
            return messengerRegex.test(value.trim())
          }
        }
      case 'Skype':
        return {
          placeholder: 'your.skype.username',
          type: 'text',
          label: 'Skype Username',
          pattern: '^[a-zA-Z0-9._-]+$',
          title: 'Enter your Skype username (letters, numbers, dots, underscores, hyphens only)',
          validation: (value: string) => {
            const skypeRegex = /^[a-zA-Z0-9._-]+$/
            return skypeRegex.test(value.trim())
          }
        }
      default:
        return {
          placeholder: 'Enter your contact information',
          type: 'text',
          label: 'Contact Information',
          pattern: '.*',
          title: 'Enter your contact information',
          validation: (value: string) => value.trim().length > 0
        }
    }
  }

  const calculateTotalPrice = () => {
    const selectedAreas = design.printAreas.filter(area => area.selected)
    const basePrice = selectedAreas.reduce((total, area) => total + area.price, 0)
    const turnaroundCost = design.turnaroundTime.price
    return (basePrice * design.quantity) + turnaroundCost
  }

  const handlePrintAreaToggle = (areaId: string) => {
    setDesign(prev => {
      const currentArea = prev.printAreas.find(area => area.id === areaId)
      const isCurrentlySelected = currentArea?.selected || false
      
      // If selecting Front & Back, unselect Front and Back
      if (areaId === 'front-back' && !isCurrentlySelected) {
        const updatedDesign = {
          ...prev,
          printAreas: prev.printAreas.map(area => {
            if (area.id === 'front-back') {
              return { ...area, selected: true }
            } else if (area.id === 'front' || area.id === 'back') {
              return { ...area, selected: false }
            }
            return area
          })
        }
        
        // Clear print areas validation error
        if (formValidationErrors.printAreas) {
          setFormValidationErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors.printAreas
            return newErrors
          })
        }
        
        return updatedDesign
      }
      
      // If selecting Front or Back, unselect Front & Back
      if ((areaId === 'front' || areaId === 'back') && !isCurrentlySelected) {
        const updatedDesign = {
          ...prev,
          printAreas: prev.printAreas.map(area => {
            if (area.id === areaId) {
              return { ...area, selected: true }
            } else if (area.id === 'front-back') {
              return { ...area, selected: false }
            }
            return area
          })
        }
        
        // Clear print areas validation error
        if (formValidationErrors.printAreas) {
          setFormValidationErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors.printAreas
            return newErrors
          })
        }
        
        return updatedDesign
      }
      
      // Normal toggle for other areas or deselecting
      const updatedDesign = {
        ...prev,
        printAreas: prev.printAreas.map(area =>
          area.id === areaId ? { ...area, selected: !area.selected } : area
        )
      }
      
      // Clear print areas validation error if at least one area is selected
      const hasSelectedArea = updatedDesign.printAreas.some(area => area.selected)
      if (hasSelectedArea && formValidationErrors.printAreas) {
        setFormValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.printAreas
          return newErrors
        })
      }
      
      return updatedDesign
    })
  }

  const handleQuantityChange = (change: number) => {
    setDesign(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + change)
    }))
  }


  const handleAddToCart = async () => {
    // Clear previous validation errors
    setFormValidationErrors({})
    
    // Validate required fields
    const errors: {[key: string]: string} = {}
    
    // Validate shirt color (always required)
    if (!design.shirtColor || design.shirtColor.trim() === '') {
      errors.shirtColor = 'Please select a shirt color'
    }
    
    // Validate print areas (at least one must be selected)
    const selectedAreas = design.printAreas.filter(area => area.selected)
    if (selectedAreas.length === 0) {
      errors.printAreas = 'Please select at least one print area'
    }
    
    // Validate size (always required)
    if (!design.size || design.size.trim() === '') {
      errors.size = 'Please select a size'
    }
    
    // Validate print type (always required)
    if (!design.printType || design.printType.trim() === '') {
      errors.printType = 'Please select a print type'
    }
    
    // Validate turnaround time (always required)
    if (!design.turnaroundTime || !design.turnaroundTime.label) {
      errors.turnaroundTime = 'Please select a turnaround time'
    }
    
            // Validate that all selected print areas have uploaded images
            const missingImages = selectedAreas.filter(area => {
              if (area.id === 'front-back') {
                // For Front & Back, check both front and back have images
                const frontImages = design.imageElements.filter(el => el.area === 'front').length
                const backImages = design.imageElements.filter(el => el.area === 'back').length
                return frontImages === 0 || backImages === 0
              } else {
                // For individual areas, check the specific area
                return design.imageElements.filter(el => el.area === area.id).length === 0
              }
            })
    
            if (missingImages.length > 0) {
              const areaNames = missingImages.map(area => {
                if (area.id === 'front-back') {
                  return 'Front & Back (both front and back images required)'
                }
                return area.name
              }).join(', ')
              errors.images = `Please upload at least one image for the following print areas: ${areaNames}`
            }
    
    // Validate contact details if design proof is required
    if (design.designProof === 'Yes, send design proof before printing' && !design.contactDetails.trim()) {
      errors.contactDetails = 'Please provide your contact details for design proof delivery'
    }
    
    // If there are validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setFormValidationErrors(errors)
      const errorMessages = Object.values(errors).join('\n')
      toast.error("Please complete all required fields", {
        description: errorMessages,
        duration: 5000,
      })
      return
    }
    
    try {
      // Calculate pricing
      const basePrice = selectedAreas.reduce((total, area) => total + area.price, 0) * design.quantity
      const turnaroundPrice = design.turnaroundTime.price
      const totalPrice = basePrice + turnaroundPrice
      
      // Prepare order data
      const orderData = {
        product_name: 'Custom T-Shirt',
        shirt_color: design.shirtColor,
        shirt_size: design.size,
        print_type: design.printType,
        print_areas: design.printAreas,
        quantity: design.quantity,
        base_price: basePrice,
        turnaround_time: design.turnaroundTime,
        total_price: totalPrice,
        design_proof_required: design.designProof === 'Yes, send design proof before printing',
        proof_contact_details: design.designProof === 'Yes, send design proof before printing' ? design.contactDetails : null,
        imageElements: design.imageElements,
        textElements: design.textElements,
        areaInstructions: design.areaInstructions
      }
      
      // Save to session storage for checkout
      sessionStorage.setItem('currentOrder', JSON.stringify(orderData))
      
      toast.success('Added to cart!', {
        description: 'Redirecting to checkout...',
        duration: 3000,
      })
      
      // Redirect to checkout
      setTimeout(() => {
        window.location.href = '/checkout'
      }, 1000)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Error adding to cart', {
        description: 'Please try again or contact support if the issue persists.',
        duration: 5000,
      })
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
  }

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Custom T-Shirt Designer */}
      <div className="w-full max-w-2xl bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">Order your Custom T-Shirt</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center">
          Send Us Your Concept Through The Form,<br />
          And Our Expert Team Will Craft A Professional Design That's Ready To Print.
        </p>
        
        {/* Shirt Color Selection */}
        <div className="mt-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Shirt Color <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-2 mb-3">
            {[...DEFAULT_SHIRT_COLORS, ...customColors].map((color) => (
              <button
                key={color}
                onClick={() => setDesign(prev => ({ ...prev, shirtColor: color }))}
                className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                  design.shirtColor === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            <Palette className="h-4 w-4" />
            Custom Color
          </button>
          {showColorPicker && (
            <div className="mt-3 p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter custom color code:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={design.shirtColor}
                    onChange={(e) => setDesign(prev => ({ ...prev, shirtColor: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // Add custom color to the color group if it's not already there
                        if (!customColors.includes(design.shirtColor) && !DEFAULT_SHIRT_COLORS.includes(design.shirtColor)) {
                          setCustomColors(prev => [...prev, design.shirtColor])
                        }
                        setShowColorPicker(false)
                      }
                    }}
                    placeholder="#FFFFFF"
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium"
                  />
                  <div 
                    className="w-8 h-8 border-2 border-gray-300 rounded-md"
                    style={{ backgroundColor: design.shirtColor }}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or pick from color picker:
                </label>
                <HexColorPicker
                  color={design.shirtColor}
                  onChange={(color) => setDesign(prev => ({ ...prev, shirtColor: color }))}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Add custom color to the color group if it's not already there
                    if (!customColors.includes(design.shirtColor) && !DEFAULT_SHIRT_COLORS.includes(design.shirtColor)) {
                      setCustomColors(prev => [...prev, design.shirtColor])
                    }
                    setShowColorPicker(false)
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    setDesign(prev => ({ ...prev, shirtColor: '#FFFFFF' }))
                    setShowColorPicker(false)
                  }}
                  className="px-3 py-1 text-sm bg-orange-200 text-orange-700 rounded-md hover:bg-orange-300 cursor-pointer"
                >
                  Reset to White
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Print Areas */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Print Areas <span className="text-red-500">*</span></label>
          {formValidationErrors.printAreas && (
            <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formValidationErrors.printAreas}
            </p>
          )}
          
          {/* Front & Back - Full Width Row */}
          <div className="mb-3">
            {design.printAreas
              .filter(area => area.id === 'front-back')
              .map((area) => {
                // Check if Front & Back should be disabled
                const isDisabled = design.printAreas.find(a => a.id === 'front')?.selected || design.printAreas.find(a => a.id === 'back')?.selected
                
                return (
                  <label key={area.id} className={`flex items-center gap-2 px-3 py-2 border rounded-lg border-2 shadow-md ${
                    isDisabled 
                      ? 'cursor-not-allowed opacity-50 bg-gray-100 border-gray-300'
                      : 'hover:bg-gray-50 cursor-pointer bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={area.selected}
                      onChange={() => handlePrintAreaToggle(area.id)}
                      disabled={isDisabled}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className={`text-sm font-medium whitespace-nowrap font-bold ${
                      isDisabled 
                        ? 'text-gray-500' 
                        : 'text-orange-800'
                    }`}>
                      🎉 {area.name}
                      {!isDisabled && <span className="text-xs text-orange-600 ml-1">(BEST VALUE!)</span>}
                    </span>
                    <span className={`text-sm font-bold ${
                      isDisabled 
                        ? 'text-gray-400' 
                        : 'text-green-600'
                    }`}>
                      ${area.price.toFixed(2)}
                      {!isDisabled && <span className="text-xs text-green-600 ml-1">(Save $5!)</span>}
                    </span>
                  </label>
                )
              })}
          </div>

                  {/* Individual Areas - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {design.printAreas
              .filter(area => area.id !== 'front-back')
              .map((area) => {
                // Check if this area should be disabled (only Front and Back, not sleeves)
                const isDisabled = design.printAreas.find(a => a.id === 'front-back')?.selected && 
                                  (area.id === 'front' || area.id === 'back')
                
                        return (
                          <label key={area.id} className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white ${
                            isDisabled 
                              ? 'cursor-not-allowed opacity-50 bg-gray-100'
                              : 'hover:bg-gray-50 cursor-pointer'
                          }`}>
                            <input
                              type="checkbox"
                              checked={area.selected}
                              onChange={() => handlePrintAreaToggle(area.id)}
                              disabled={isDisabled}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                            />
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      isDisabled ? 'text-gray-500' : 'text-gray-900'
                    }`}>{area.name}</span>
                            <span className={`text-sm font-bold ${
                              isDisabled ? 'text-gray-400' : 'text-green-600'
                            }`}>${area.price.toFixed(2)}</span>
                  </label>
                )
              })}
          </div>
        </div>

        {/* Print Area Customization */}
        {design.printAreas.filter(area => area.selected).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Customize Your Design</h3>
            {design.printAreas
              .filter(area => area.selected)
              .map((area) => {
                // For Front & Back, show separate sections for front and back
                if (area.id === 'front-back') {
                  return (
                    <FrontBackCustomization
                      key={area.id}
                      design={design}
                      setDesign={setDesign}
                      imageUploadErrors={imageUploadErrors}
                      setImageUploadErrors={setImageUploadErrors}
                    />
                  )
                } else {
                  // For individual areas (front, back, sleeves), show single section
                  return (
                    <div key={area.id} className="mb-6 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                      <h4 className="text-md font-bold text-gray-900 mb-3 capitalize">
                        {area.name.replace('Only ', '').replace(' & ', ' & ')}
                      </h4>
                  
                  {/* Personalized Text Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your personalized text for {area.name.toLowerCase()}
                    </label>
                    <textarea
                      placeholder={`Enter your custom text for ${area.name.toLowerCase()}...`}
                      className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium resize-none"
                      rows={3}
                      onChange={(e) => {
                        setDesign(prev => ({
                          ...prev,
                          textElements: prev.textElements.map(el => 
                            el.area === area.id ? { ...el, text: e.target.value } : el
                          ).concat(
                            prev.textElements.find(el => el.area === area.id) 
                              ? [] 
                              : [{ id: `${area.id}-text-${Date.now()}`, text: e.target.value, color: '#000000', fontSize: 16, area: area.id }]
                          )
                        }))
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Keep it short and impactful for best results
                    </p>
                  </div>

                          {/* Multiple Image Upload */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Upload image or design files for {area.name.toLowerCase()} <span className="text-red-500">*</span>
                            </label>
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                              imageUploadErrors[area.id] 
                                ? 'border-red-500 bg-red-50' 
                                : design.imageElements.filter(el => el.area === area.id).length > 0
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-400 hover:border-orange-500'
                            }`}>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                id={`image-upload-${area.id}`}
                                required
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || [])
                                  if (files.length > 0) {
                                    let hasErrors = false
                                    
                                    // Validate all files
                            files.forEach((file, index) => {
                              // Validate file size (10MB limit)
                              if (file.size > 10 * 1024 * 1024) {
                                setImageUploadErrors(prev => ({
                                  ...prev,
                                  [area.id]: `File ${index + 1} size must be less than 10MB`
                                }))
                                hasErrors = true
                                return
                              }
                              
                              // Validate file type - strict image validation
                              const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
                              if (!allowedTypes.includes(file.type)) {
                                setImageUploadErrors(prev => ({
                                  ...prev,
                                  [area.id]: `File ${index + 1} must be a valid image file (JPG, PNG, GIF, WebP, SVG only)`
                                }))
                                hasErrors = true
                                return
                              }
                              
                              // Validate file extension matches MIME type
                              const fileExtension = file.name.split('.').pop()?.toLowerCase()
                              const expectedExtensions = {
                                'image/jpeg': ['jpg', 'jpeg'],
                                'image/png': ['png'],
                                'image/gif': ['gif'],
                                'image/webp': ['webp'],
                                'image/svg+xml': ['svg']
                              }
                              
                              if (fileExtension && expectedExtensions[file.type as keyof typeof expectedExtensions]) {
                                const validExtensions = expectedExtensions[file.type as keyof typeof expectedExtensions]
                                if (!validExtensions.includes(fileExtension)) {
                                  setImageUploadErrors(prev => ({
                                    ...prev,
                                    [area.id]: `File ${index + 1} has invalid extension for its type`
                                  }))
                                  hasErrors = true
                                  return
                                }
                              }
                              
                              // Check for suspicious file names
                              const suspiciousPatterns = [
                                /\.(exe|bat|cmd|scr|pif|com)$/i,
                                /\.(js|vbs|jar|php|asp|jsp)$/i,
                                /\.(sh|ps1|psm1)$/i,
                                /script/i,
                                /virus/i,
                                /malware/i,
                                /trojan/i,
                                /backdoor/i
                              ]
                              
                              if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
                                setImageUploadErrors(prev => ({
                                  ...prev,
                                  [area.id]: `File ${index + 1} has a suspicious name and cannot be uploaded`
                                }))
                                hasErrors = true
                                return
                              }
                              
                              // Check file size is reasonable (not too small for a real image)
                              if (file.size < 100) { // Less than 100 bytes is suspicious
                                setImageUploadErrors(prev => ({
                                  ...prev,
                                  [area.id]: `File ${index + 1} appears to be corrupted or invalid`
                                }))
                                hasErrors = true
                                return
                              }
                            })
                                    
                                    if (hasErrors) return
                                    
                                    // Clear any previous errors
                                    setImageUploadErrors(prev => {
                                      const newErrors = { ...prev }
                                      delete newErrors[area.id]
                                      return newErrors
                                    })
                                    
                                    // Process all files
                                    files.forEach((file, index) => {
                                      const reader = new FileReader()
                                      reader.onload = (event) => {
                                        const newImageElement = {
                                          id: `${area.id}-image-${Date.now()}-${index}`,
                                          imageUrl: event.target?.result as string,
                                          area: area.id,
                                          width: 200,
                                          height: 200,
                                          fileName: file.name
                                        }
                                        
                                        setDesign(prev => ({
                                          ...prev,
                                          imageElements: [...prev.imageElements, newImageElement]
                                        }))
                                      }
                                      reader.readAsDataURL(file)
                                    })
                                  }
                                }}
                              />
                              <label htmlFor={`image-upload-${area.id}`} className="cursor-pointer">
                                <div className="text-gray-500 mb-2">
                                  {design.imageElements.filter(el => el.area === area.id).length > 0 ? (
                                    <svg className="mx-auto h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                  )}
                                </div>
                                {design.imageElements.filter(el => el.area === area.id).length > 0 ? (
                                  <div>
                                    <p className="text-sm text-green-600 font-medium">
                                      ✓ {design.imageElements.filter(el => el.area === area.id).length} image{design.imageElements.filter(el => el.area === area.id).length > 1 ? 's' : ''} uploaded
                                    </p>
                                    <p className="text-xs text-green-500 mt-1">
                                      Click to add more images
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      Click to upload multiple images or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      PNG, JPG, GIF up to 10MB each
                                    </p>
                                  </div>
                                )}
                              </label>
                            </div>
                            
                            {/* Display uploaded images */}
                            {design.imageElements.filter(el => el.area === area.id).length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {design.imageElements
                                    .filter(el => el.area === area.id)
                                    .map((image, index) => (
                                      <div key={image.id} className="relative group">
                                        <img
                                          src={image.imageUrl}
                                          alt={`Upload ${index + 1}`}
                                          className="w-full h-20 object-cover rounded-lg border border-gray-300"
                                        />
                                        <button
                                          onClick={() => {
                                            setDesign(prev => ({
                                              ...prev,
                                              imageElements: prev.imageElements.filter(el => el.id !== image.id)
                                            }))
                                          }}
                                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          ×
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                          {image.fileName || `Image ${index + 1}`}
                                        </p>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                            
                            {imageUploadErrors[area.id] && (
                              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {imageUploadErrors[area.id]}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              💡 High-resolution images with transparent backgrounds work best. You can upload multiple images for this print area.
                            </p>
                          </div>

                          {/* Designer Instructions - Inside Customize Your Design */}
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Designer Instructions for {area.name.replace('Only ', '').replace(' & ', ' & ')}
                            </label>
                            <textarea
                              placeholder={`Provide specific instructions for ${area.name.toLowerCase()} (e.g., font preferences, color schemes, placement details, special effects, etc.)`}
                              className="w-full p-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium resize-none"
                              rows={3}
                              value={design.areaInstructions.find(inst => inst.areaId === area.id)?.instructions || ''}
                              onChange={(e) => {
                                setDesign(prev => ({
                                  ...prev,
                                  areaInstructions: prev.areaInstructions.find(inst => inst.areaId === area.id)
                                    ? prev.areaInstructions.map(inst => 
                                        inst.areaId === area.id 
                                          ? { ...inst, instructions: e.target.value }
                                          : inst
                                      )
                                    : [...prev.areaInstructions, { areaId: area.id, instructions: e.target.value }]
                                }))
                              }}
                            />
                            <p className="text-xs text-green-600 mt-2">
                              💡 Be as specific as possible to help our designers create exactly what you envision for this area
                            </p>
                          </div>
                        </div>
                      )
                }
              })}
                  </div>
                )}

        {/* Print File Requirements - Always Visible */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Print File Requirements
          </h3>
          <div className="text-sm text-gray-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-800 mb-2">📁 File Types</p>
                <p className="text-gray-600">JPG, PNG and SVG file types supported</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-2">📏 File Size</p>
                <p className="text-gray-600">Maximum 100 MiB (JPG, PNG) or 20 MiB (SVG)</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-2">🎯 Print Area Size</p>
                <p className="text-gray-600">3951 × 4800 px (300 DPI)</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-2">🔍 Maximum Resolution</p>
                <p className="text-gray-600">30000 x 30000 px</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-700 font-medium text-sm">
                💡 For best print quality, use high-resolution images (300 DPI) with transparent backgrounds (PNG/SVG)
              </p>
            </div>
          </div>
        </div>

                {/* Size and Print Type Row */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Size Selection */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Size <span className="text-red-500">*</span></label>
                      {formValidationErrors.size && (
                        <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formValidationErrors.size}
                        </p>
                      )}
              <select
                value={design.size}
                onChange={(e) => setDesign(prev => ({ ...prev, size: e.target.value }))}
                className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium cursor-pointer ${
                  formValidationErrors.size ? 'border-red-500' : 'border-gray-400'
                }`}
              >
                {SHIRT_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

                    {/* Print Type */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Print Type <span className="text-red-500">*</span></label>
                      {formValidationErrors.printType && (
                        <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formValidationErrors.printType}
                        </p>
                      )}
              <select
                value={design.printType}
                onChange={(e) => setDesign(prev => ({ ...prev, printType: e.target.value }))}
                className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium cursor-pointer ${
                  formValidationErrors.printType ? 'border-red-500' : 'border-gray-400'
                }`}
              >
                {PRINT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

                {/* Turnaround Time and Design Proof Row */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Turnaround Time */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">Turnaround Time <span className="text-red-500">*</span></label>
                      {formValidationErrors.turnaroundTime && (
                        <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formValidationErrors.turnaroundTime}
                        </p>
                      )}
              <select
                value={JSON.stringify(design.turnaroundTime)}
                onChange={(e) => setDesign(prev => ({ ...prev, turnaroundTime: JSON.parse(e.target.value) }))}
                className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium cursor-pointer ${
                  formValidationErrors.turnaroundTime ? 'border-red-500' : 'border-gray-400'
                }`}
              >
                {TURNAROUND_OPTIONS.map((option) => (
                  <option key={option.label} value={JSON.stringify(option)}>
                    {option.label} (${option.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Design Proof */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">Design Proof Before Printing?</label>
              <select
                value={design.designProof}
                onChange={(e) => setDesign(prev => ({ ...prev, designProof: e.target.value }))}
                className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium cursor-pointer"
              >
                {DESIGN_PROOF_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Conditional: Quick way to send you design proof? */}
        {design.designProof === 'Yes, send design proof before printing' && (
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-800 mb-3">Quick way to send you design proof?</label>
            <select
              value={design.proofContactMethod}
              onChange={(e) => setDesign(prev => ({ ...prev, proofContactMethod: e.target.value, contactDetails: '' }))}
              className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium cursor-pointer"
            >
              {DESIGN_PROOF_CONTACT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            
            {/* Contact Details Input */}
            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                {getContactInputDetails(design.proofContactMethod).label}
              </label>
              <input
                type={getContactInputDetails(design.proofContactMethod).type}
                value={design.contactDetails}
                onChange={(e) => {
                  const value = e.target.value
                  setDesign(prev => ({ ...prev, contactDetails: value }))
                  
                  // Validate input
                  const inputDetails = getContactInputDetails(design.proofContactMethod)
                  if (value.trim() && !inputDetails.validation(value)) {
                    setContactValidationError(`Invalid ${inputDetails.label.toLowerCase()}. Please check the format.`)
                  } else {
                    setContactValidationError('')
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value
                  const inputDetails = getContactInputDetails(design.proofContactMethod)
                  if (value.trim() && !inputDetails.validation(value)) {
                    setContactValidationError(`Invalid ${inputDetails.label.toLowerCase()}. Please check the format.`)
                  } else {
                    setContactValidationError('')
                  }
                }}
                placeholder={getContactInputDetails(design.proofContactMethod).placeholder}
                pattern={getContactInputDetails(design.proofContactMethod).pattern}
                title={getContactInputDetails(design.proofContactMethod).title}
                className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium ${
                  contactValidationError ? 'border-red-500' : 'border-gray-400'
                }`}
                required
              />
              {contactValidationError && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {contactValidationError}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {getContactInputDetails(design.proofContactMethod).title}
              </p>
            </div>
          </div>
        )}

                {/* Detailed Price Breakdown */}
                <div className="mb-6 p-4 bg-gray-100 border-2 border-gray-300 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Price Breakdown
                  </h3>
                  
                  {/* Print Areas Breakdown */}
                  {design.printAreas.filter(area => area.selected).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-800 mb-2">Print Areas:</h4>
                      <div className="space-y-1">
                        {design.printAreas
                          .filter(area => area.selected)
                          .map((area) => (
                            <div key={area.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">{area.name}</span>
                              <span className="font-medium text-gray-900">${area.price.toFixed(2)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Turnaround Time */}
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Turnaround Time:</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{design.turnaroundTime.label}</span>
                      <span className="font-medium text-gray-900">${design.turnaroundTime.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Quantity:</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{design.quantity} item{design.quantity > 1 ? 's' : ''}</span>
                      <span className="font-medium text-gray-900">× 1</span>
                    </div>
                  </div>

                  {/* Subtotal Calculation */}
                  <div className="border-t border-gray-400 pt-3 mb-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-800">Print Areas Total:</span>
                      <span className="font-bold text-gray-900">
                        ${(design.printAreas.filter(area => area.selected).reduce((total, area) => total + area.price, 0) * design.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="font-bold text-gray-800">Turnaround Time (fixed):</span>
                      <span className="font-bold text-gray-900">
                        ${design.turnaroundTime.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-orange-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total ({design.quantity} item{design.quantity > 1 ? 's' : ''}):</span>
                      <span className="text-lg font-bold text-green-600">${calculateTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity and Add to Cart Row */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    {/* Quantity - 30% */}
                    <div className="w-full sm:w-[30%]">
              <label className="block text-sm font-bold text-gray-800 mb-3">Quantity</label>
              <div className="flex items-center border-2 border-gray-400 rounded-lg bg-white">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-3 hover:bg-gray-50 text-gray-700 cursor-pointer rounded-l-lg"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center font-bold text-gray-900 text-lg">{design.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-3 hover:bg-gray-50 text-gray-700 cursor-pointer rounded-r-lg"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
                    {/* Add to Cart Button - 70% */}
                    <div className="w-full sm:w-[70%]">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-gray-400 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-bold cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                ADD TO CART
              </button>
            </div>
          </div>
        </div>

        {/* Buy Now Button */}
        <div>
          <button
            onClick={handleBuyNow}
            className="w-full p-4 text-white rounded-lg hover:opacity-90 transition-all duration-300 font-bold cursor-pointer relative overflow-hidden"
            style={{
              background: 'linear-gradient(-45deg, #FFA503, #FF8C00, #FFA503, #FFB84D)',
              backgroundSize: '400% 400%',
              animation: 'gradientShift 3s ease infinite'
            }}
          >
            <span className="relative z-10">Buy Now</span>
            <style jsx>{`
              @keyframes gradientShift {
                0% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
                100% {
                  background-position: 0% 50%;
                }
              }
            `}</style>
          </button>
        </div>
      </div>
    </div>
  )
}