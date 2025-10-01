'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Palette, Plus, Minus } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { toast } from 'sonner'

interface ProductConfig {
  name: string
  defaultColors: string[]
  sizes: string[]
  printTypes: string[]
  printAreas: Array<{
    id: string
    name: string
    price: number
  }>
  turnaroundOptions: Array<{
    label: string
    price: number
  }>
}

interface ProductDesign {
  productColor: string
  printAreas: Array<{
    id: string
    name: string
    price: number
    selected: boolean
  }>
  size: string
  printType: string
  quantity: number
  turnaroundTime: {
    label: string
    price: number
  }
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

interface ProductDesignerProps {
  config: ProductConfig
  productName: string
  heading: string
  subheading: string
}

export default function ProductDesigner({ config, productName, heading, subheading }: ProductDesignerProps) {
  const [design, setDesign] = useState<ProductDesign>({
    productColor: config.defaultColors[0],
    printAreas: config.printAreas.map(area => ({ ...area, selected: false })),
    size: config.sizes[0],
    printType: config.printTypes[0],
    quantity: 1,
    turnaroundTime: config.turnaroundOptions[1], // Default to second option (usually "Same Day")
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

  const getContactInputDetails = (method: string) => {
    switch (method) {
      case 'Your WhatsApp / Phone Number':
        return {
          placeholder: '+1 (555) 123-4567 or +1234567890',
          type: 'tel',
          label: 'Phone/WhatsApp Number',
          pattern: '^[+]?[0-9\\s\\-\\(\\)]{10,}$',
          title: 'Enter a valid phone number (e.g., +1 (555) 123-4567)',
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
          setFormValidationErrors(prevErrors => {
            const newErrors = { ...prevErrors }
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
          setFormValidationErrors(prevErrors => {
            const newErrors = { ...prevErrors }
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
        setFormValidationErrors(prevErrors => {
          const newErrors = { ...prevErrors }
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
    
    // Validate product color (always required)
    if (!design.productColor || design.productColor.trim() === '') {
      errors.productColor = 'Please select a product color'
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
    const missingImages = selectedAreas.filter(area => 
      design.imageElements.filter(el => el.area === area.id).length === 0
    )
    
    if (missingImages.length > 0) {
      const areaNames = missingImages.map(area => area.name).join(', ')
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
        product_name: productName,
        product_color: design.productColor,
        product_size: design.size,
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
      <div className="w-full max-w-2xl bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">{heading}</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center">
          {subheading}
        </p>
        
        {/* Product Color Selection */}
        <div className="mt-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Product Color <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-2 mb-3">
            {[...config.defaultColors, ...customColors].map((color) => (
              <button
                key={color}
                onClick={() => setDesign(prev => ({ ...prev, productColor: color }))}
                className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                  design.productColor === color ? 'border-gray-800' : 'border-gray-300'
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
                    value={design.productColor}
                    onChange={(e) => setDesign(prev => ({ ...prev, productColor: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (!customColors.includes(design.productColor) && !config.defaultColors.includes(design.productColor)) {
                          setCustomColors(prev => [...prev, design.productColor])
                        }
                        setShowColorPicker(false)
                      }
                    }}
                    placeholder="#FFFFFF"
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium"
                  />
                  <div 
                    className="w-8 h-8 border-2 border-gray-300 rounded-md"
                    style={{ backgroundColor: design.productColor }}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or pick from color picker:
                </label>
                <HexColorPicker
                  color={design.productColor}
                  onChange={(color) => setDesign(prev => ({ ...prev, productColor: color }))}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!customColors.includes(design.productColor) && !config.defaultColors.includes(design.productColor)) {
                      setCustomColors(prev => [...prev, design.productColor])
                    }
                    setShowColorPicker(false)
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    setDesign(prev => ({ ...prev, productColor: config.defaultColors[0] }))
                    setShowColorPicker(false)
                  }}
                  className="px-3 py-1 text-sm bg-orange-200 text-orange-700 rounded-md hover:bg-orange-300 cursor-pointer"
                >
                  Reset to Default
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {design.printAreas.map((area) => (
              <label key={area.id} className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={area.selected}
                  onChange={() => handlePrintAreaToggle(area.id)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium whitespace-nowrap text-gray-900">{area.name}</span>
                <span className="text-sm font-bold text-orange-600">${area.price.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Size and Print Type */}
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">Size <span className="text-red-500">*</span></label>
              <select
                value={design.size}
                onChange={(e) => setDesign(prev => ({ ...prev, size: e.target.value }))}
                className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium cursor-pointer"
              >
                {config.sizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">Print Type <span className="text-red-500">*</span></label>
              <select
                value={design.printType}
                onChange={(e) => setDesign(prev => ({ ...prev, printType: e.target.value }))}
                className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium cursor-pointer"
              >
                {config.printTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Turnaround Time */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-3">Turnaround Time <span className="text-red-500">*</span></label>
          <select
            value={JSON.stringify(design.turnaroundTime)}
            onChange={(e) => setDesign(prev => ({ ...prev, turnaroundTime: JSON.parse(e.target.value) }))}
            className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium cursor-pointer"
          >
            {config.turnaroundOptions.map((option) => (
              <option key={option.label} value={JSON.stringify(option)}>
                {option.label} (${option.price.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        {/* Design Proof */}
        <div className="mb-6">
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
            </div>
          </div>
        )}

        {/* Print Area Customization */}
        {design.printAreas.filter(area => area.selected).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Customize Your Design</h3>
            
            {design.printAreas
              .filter(area => area.selected)
              .map((area) => (
                <div key={area.id} className="mb-6 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                  <h4 className="text-md font-bold text-gray-900 mb-3 capitalize">
                    {area.name}
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
                  </div>

                  {/* Image Upload */}
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
                            
                            files.forEach((file, index) => {
                              if (file.size > 10 * 1024 * 1024) {
                                setImageUploadErrors(prev => ({
                                  ...prev,
                                  [area.id]: `File ${index + 1} size must be less than 10MB`
                                }))
                                hasErrors = true
                                return
                              }
                              
                              if (!file.type.startsWith('image/')) {
                                setImageUploadErrors(prev => ({
                                  ...prev,
                                  [area.id]: `File ${index + 1} must be a valid image file`
                                }))
                                hasErrors = true
                                return
                              }
                            })
                            
                            if (hasErrors) return
                            
                            setImageUploadErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors[area.id]
                              return newErrors
                            })
                            
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
                    
                    {imageUploadErrors[area.id] && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {imageUploadErrors[area.id]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="mb-6 p-4 bg-gray-100 border-2 border-gray-300 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Price Breakdown
          </h3>
          
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

          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-800 mb-2">Turnaround Time:</h4>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">{design.turnaroundTime.label}</span>
              <span className="font-medium text-gray-900">${design.turnaroundTime.price.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-800 mb-2">Quantity:</h4>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">{design.quantity} item{design.quantity > 1 ? 's' : ''}</span>
              <span className="font-medium text-gray-900">× 1</span>
            </div>
          </div>

          <div className="border-t-2 border-orange-300 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total ({design.quantity} item{design.quantity > 1 ? 's' : ''}):</span>
              <span className="text-lg font-bold text-orange-600">${calculateTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
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
