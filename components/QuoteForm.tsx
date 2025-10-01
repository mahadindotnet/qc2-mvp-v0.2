'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Upload, Plus, Minus, X, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

// Product database with all printing products
const PRINTING_PRODUCTS = [
  // Apparel
  { id: 'tshirt', name: 'T-Shirts', category: 'Apparel', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'polo', name: 'Polo Shirts', category: 'Apparel', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'hoodie', name: 'Hoodies', category: 'Apparel', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'tank', name: 'Tank Tops', category: 'Apparel', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'longsleeve', name: 'Long Sleeve Shirts', category: 'Apparel', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'sweatshirt', name: 'Sweatshirts', category: 'Apparel', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'dress', name: 'Dresses', category: 'Apparel', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'apron', name: 'Aprons', category: 'Apparel', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  
  // Accessories
  { id: 'hat', name: 'Hats & Caps', category: 'Accessories', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'bag', name: 'Tote Bags', category: 'Accessories', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'backpack', name: 'Backpacks', category: 'Accessories', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'mug', name: 'Mugs', category: 'Accessories', fields: ['color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'bottle', name: 'Water Bottles', category: 'Accessories', fields: ['color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'keychain', name: 'Keychains', category: 'Accessories', fields: ['color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  
  // Promotional Items
  { id: 'pen', name: 'Pens', category: 'Promotional', fields: ['color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'notebook', name: 'Notebooks', category: 'Promotional', fields: ['color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'mousepad', name: 'Mouse Pads', category: 'Promotional', fields: ['color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'sticker', name: 'Stickers', category: 'Promotional', fields: ['color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'poster', name: 'Posters', category: 'Promotional', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'banner', name: 'Banners', category: 'Promotional', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  
  // Business Items
  { id: 'businesscard', name: 'Business Cards', category: 'Business', fields: ['color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'flyer', name: 'Flyers', category: 'Business', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'brochure', name: 'Brochures', category: 'Business', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'booklet', name: 'Booklets', category: 'Business', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'menu', name: 'Menus', category: 'Business', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] },
  { id: 'invitation', name: 'Invitations', category: 'Business', fields: ['size', 'color', 'printType', 'printAreas', 'turnaroundTime', 'designProof', 'images', 'text'] }
]

const SIZES = {
  apparel: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'],
  accessories: ['One Size', 'Small', 'Medium', 'Large'],
  promotional: ['8.5" x 11"', '11" x 17"', '18" x 24"', '24" x 36"', 'Custom'],
  business: ['3.5" x 2"', '4" x 6"', '5" x 7"', '8.5" x 11"', '11" x 17"', 'Custom']
}

const COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
  '#808080', '#C0C0C0', '#FFD700', '#008000', '#000080', '#800000'
]

const PRINT_TYPES = ['DTF (Direct to Film)', 'Sublimation', 'Screen Print', 'Vinyl', 'Embroidery', 'Heat Transfer', 'Custom']

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

interface QuoteFormData {
  selectedProducts: Array<{
    product: typeof PRINTING_PRODUCTS[0]
    quantity: number
    size?: string
    customSize?: string
    color: string
    printType: string
    customPrintType?: string
    printAreas: string[]
    turnaroundTime: { label: string; price: number }
    designProof: string
    proofContactMethod: string
    contactDetails: string
    images: File[]
    text: string
  }>
  customerInfo: {
    name: string
    email: string
    phone: string
    company?: string
    message: string
  }
}

export default function QuoteForm() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState(PRINTING_PRODUCTS)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState<QuoteFormData>({
    selectedProducts: [],
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      company: '',
      message: ''
    }
  })
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  // Sound effect function - Same as checkout thank you page
  const playSuccessSound = () => {
    try {
      // Create an excited celebration sound - like people shouting with joy!
      const createCelebrationSound = () => {
        const sampleRate = 44100;
        const duration = 2.0; // Longer for more excitement
        const length = sampleRate * duration;
        
        const buffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset: number, string: string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);
        
        // Multiple excited melodies playing simultaneously
        const melodies = [
          // Main celebration melody - ascending excitement
          { freq: 440, start: 0, duration: 0.3, vol: 0.3 },      // A4
          { freq: 523.25, start: 0.1, duration: 0.3, vol: 0.3 }, // C5
          { freq: 659.25, start: 0.2, duration: 0.3, vol: 0.3 },  // E5
          { freq: 783.99, start: 0.3, duration: 0.3, vol: 0.3 },  // G5
          { freq: 1046.50, start: 0.4, duration: 0.4, vol: 0.4 }, // C6
          { freq: 1318.51, start: 0.6, duration: 0.4, vol: 0.4 },  // E6
          { freq: 1567.98, start: 0.8, duration: 0.4, vol: 0.4 },   // G6
          { freq: 2093.00, start: 1.0, duration: 0.5, vol: 0.5 }, // C7
          
          // Shouting "YAY!" effect - quick bursts
          { freq: 880, start: 0.2, duration: 0.1, vol: 0.2 },    // A5
          { freq: 1174.66, start: 0.3, duration: 0.1, vol: 0.2 }, // D6
          { freq: 1760, start: 0.4, duration: 0.1, vol: 0.2 },   // A6
          { freq: 2349.32, start: 0.5, duration: 0.1, vol: 0.2 },  // D7
          
          // Crowd cheering - lower frequencies
          { freq: 220, start: 0.5, duration: 0.8, vol: 0.2 },     // A3
          { freq: 330, start: 0.6, duration: 0.8, vol: 0.2 },     // E4
          { freq: 440, start: 0.7, duration: 0.8, vol: 0.2 },     // A4
          
          // Final excited burst
          { freq: 1046.50, start: 1.2, duration: 0.3, vol: 0.4 }, // C6
          { freq: 1318.51, start: 1.3, duration: 0.3, vol: 0.4 }, // E6
          { freq: 1567.98, start: 1.4, duration: 0.3, vol: 0.4 }, // G6
          { freq: 2093.00, start: 1.5, duration: 0.5, vol: 0.5 }, // C7
        ];
        
        for (let i = 0; i < length; i++) {
          const time = i / sampleRate;
          let sample = 0;
          
          // Add all melodies
          melodies.forEach(note => {
            if (time >= note.start && time < note.start + note.duration) {
              const noteTime = time - note.start;
              const envelope = Math.exp(-noteTime * 2) * (1 - noteTime / note.duration);
              const noteSample = Math.sin(2 * Math.PI * note.freq * time) * envelope * note.vol;
              sample += noteSample;
            }
          });
          
          // Add excited crowd noise (white noise with envelope)
          if (time > 0.5 && time < 1.5) {
            const crowdNoise = (Math.random() - 0.5) * 0.1 * Math.exp(-Math.abs(time - 1.0) * 2);
            sample += crowdNoise;
          }
          
          // Add some excitement with frequency modulation
          const excitement = Math.sin(2 * Math.PI * 10 * time) * 0.05;
          sample += excitement;
          
          // Apply overall envelope for natural sound
          const overallEnvelope = Math.exp(-time * 0.8);
          sample *= overallEnvelope;
          
          // Clamp the sample
          sample = Math.max(-1, Math.min(1, sample));
          view.setInt16(44 + i * 2, sample * 32767, true);
        }
        
        const blob = new Blob([buffer], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
      };
      
      // Play the celebration sound
      const audio = new Audio();
      audio.src = createCelebrationSound();
      audio.volume = 1.0;
      
      // Try to play immediately
      audio.play().catch((error) => {
        console.log('Autoplay blocked:', error);
      });
      
      // Clean up the object URL after playing
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audio.src);
      });
      
    } catch (error) {
      console.log('Audio not available:', error);
    }
  }

  // Enhanced confetti effect
  const triggerConfetti = () => {
    // Main confetti burst
    confetti({
      particleCount: 200,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFA503', '#FF6B35', '#F7931E', '#FFD700', '#FF69B4', '#00CED1', '#32CD32', '#FF1493']
    })
    
    // Secondary burst after a short delay
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#FFA503', '#FF6B35', '#F7931E', '#FFD700', '#FF69B4', '#00CED1', '#32CD32', '#FF1493']
      })
    }, 200)
    
    // Third burst for extra celebration
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.8 },
        colors: ['#FFA503', '#FF6B35', '#F7931E', '#FFD700', '#FF69B4', '#00CED1', '#32CD32', '#FF1493']
      })
    }, 400)
  }

  // Filter products based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(PRINTING_PRODUCTS)
    } else {
      const filtered = PRINTING_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm])

  const addProduct = (product: typeof PRINTING_PRODUCTS[0]) => {
    const newProduct = {
      product,
      quantity: 1,
      color: '#FFFFFF',
      printType: 'DTF (Direct to Film)',
      printAreas: [],
      turnaroundTime: { label: 'Same Day', price: 15.00 },
      designProof: 'No, proceed directly to printing',
      proofContactMethod: 'Your WhatsApp / Phone Number',
      contactDetails: '',
      images: [],
      text: ''
    }
    
    setFormData(prev => ({
      ...prev,
      selectedProducts: [...prev.selectedProducts, newProduct]
    }))
    
    toast.success(`${product.name} added to quote`)
  }

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((_, i) => i !== index)
    }))
  }

  const updateProduct = (index: number, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }))
  }

  const handleImageUpload = (productIndex: number, files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files)
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((product, i) => 
        i === productIndex 
          ? { ...product, images: [...product.images, ...newFiles] }
          : product
      )
    }))
  }

  const removeImage = (productIndex: number, imageIndex: number) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((product, i) => 
        i === productIndex 
          ? { ...product, images: product.images.filter((_, idx) => idx !== imageIndex) }
          : product
      )
    }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const errors: {[key: string]: string} = {}
    
    if (!formData.customerInfo.name.trim()) {
      errors.name = 'Name is required'
    }
    if (!formData.customerInfo.email.trim()) {
      errors.email = 'Email is required'
    }
    if (!formData.customerInfo.phone.trim()) {
      errors.phone = 'Phone is required'
    }
    if (formData.selectedProducts.length === 0) {
      errors.products = 'Please select at least one product'
    }
    
    setValidationErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      // Prepare form data for API submission
      const submitData = new FormData()
      
      // Add customer information
      submitData.append('customerInfo.name', formData.customerInfo.name)
      submitData.append('customerInfo.email', formData.customerInfo.email)
      submitData.append('customerInfo.phone', formData.customerInfo.phone)
      submitData.append('customerInfo.company', formData.customerInfo.company || '')
      submitData.append('customerInfo.address', formData.customerInfo.address || '')
      
      // Add quote notes
      submitData.append('quoteNotes', formData.customerInfo.message || '')
      
      // Add products data
      submitData.append('products', JSON.stringify(formData.selectedProducts))
      
      // Add file uploads
      formData.selectedProducts.forEach((product) => {
        product.images.forEach((file) => {
          submitData.append('images', file)
        })
      })
      
      // Submit to API
      const response = await fetch('/api/quotes', {
        method: 'POST',
        body: submitData
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit quote')
      }
      
      // Play success sound and trigger confetti
      playSuccessSound()
      triggerConfetti()
      
      // Show confirmation popup
      setShowConfirmation(true)
      
      // Reset form
      setFormData({
        selectedProducts: [],
        customerInfo: {
          name: '',
          email: '',
          phone: '',
          company: '',
          message: ''
        }
      })
      
    } catch (error) {
      console.error('Error submitting quote:', error)
      toast.error('Error submitting quote request', {
        description: 'Please try again or contact us directly.',
        duration: 5000,
      })
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
          Get A Quote
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          Select products and provide details for a personalized quote
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Search and Selection */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Products</h3>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products (e.g., t-shirt, mug, business card)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Product Grid - Only show when searching */}
            {searchTerm.trim() !== '' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-orange-500 cursor-pointer transition-colors"
                    onClick={() => addProduct(product)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">{product.name}</h4>
                      <span className="text-sm text-gray-500">{product.category}</span>
                    </div>
                    <p className="text-gray-600 text-sm">Click to add to quote</p>
                  </div>
                ))}
              </div>
            )}

            {validationErrors.products && (
              <p className="text-red-500 text-sm mb-4 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {validationErrors.products}
              </p>
            )}
          </div>

          {/* Selected Products */}
          {formData.selectedProducts.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Selected Products</h3>
              <div className="space-y-6">
                {formData.selectedProducts.map((item, index) => (
                  <div key={index} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-gray-900">{item.product.name}</h4>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateProduct(index, 'quantity', Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateProduct(index, 'quantity', item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Size (if applicable) */}
                      {item.product.fields.includes('size') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                          <select
                            value={item.size || ''}
                            onChange={(e) => updateProduct(index, 'size', e.target.value)}
                            className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">Select Size</option>
                            {SIZES[item.product.category.toLowerCase() as keyof typeof SIZES]?.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                          {item.size === 'Custom' && (
                            <input
                              type="text"
                              placeholder="Enter custom size (e.g., 12x18 inches)"
                              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mt-2"
                              onChange={(e) => updateProduct(index, 'customSize', e.target.value)}
                            />
                          )}
                        </div>
                      )}

                      {/* Color */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {COLORS.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => updateProduct(index, 'color', color)}
                              className={`w-6 h-6 rounded-full border-2 ${
                                item.color === color ? 'border-gray-800' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Or enter custom color (e.g., #FF5733, Navy Blue, Pantone 186C)"
                          className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          onChange={(e) => updateProduct(index, 'color', e.target.value)}
                          value={item.color}
                        />
                      </div>

                      {/* Print Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Print Type</label>
                        <select
                          value={item.printType}
                          onChange={(e) => updateProduct(index, 'printType', e.target.value)}
                          className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {PRINT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {item.printType === 'Custom' && (
                          <input
                            type="text"
                            placeholder="Enter custom print type (e.g., Foil Stamping, Laser Engraving)"
                            className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mt-2"
                            onChange={(e) => updateProduct(index, 'customPrintType', e.target.value)}
                          />
                        )}
                      </div>

                      {/* Turnaround Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Turnaround Time</label>
                        <select
                          value={JSON.stringify(item.turnaroundTime)}
                          onChange={(e) => updateProduct(index, 'turnaroundTime', JSON.parse(e.target.value))}
                          className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {TURNAROUND_OPTIONS.map(option => (
                            <option key={option.label} value={JSON.stringify(option)}>
                              {option.label} (${option.price.toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Design Proof */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Design Proof</label>
                        <select
                          value={item.designProof}
                          onChange={(e) => updateProduct(index, 'designProof', e.target.value)}
                          className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {DESIGN_PROOF_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Contact Details for Design Proof */}
                    {item.designProof === 'Yes, send design proof before printing' && (
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-orange-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Method</label>
                            <select
                              value={item.proofContactMethod}
                              onChange={(e) => updateProduct(index, 'proofContactMethod', e.target.value)}
                              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                              {DESIGN_PROOF_CONTACT_OPTIONS.map(method => (
                                <option key={method} value={method}>{method}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Details</label>
                            <input
                              type="text"
                              value={item.contactDetails}
                              onChange={(e) => updateProduct(index, 'contactDetails', e.target.value)}
                              placeholder="Enter your contact information"
                              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image Upload */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images/Designs</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e.target.files)}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <label htmlFor={`image-upload-${index}`} className="cursor-pointer">
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">JPG, PNG, SVG, PDF, AI, PSD, EPS up to 50MB each</p>
                          </div>
                        </label>
                      </div>
                      
                      {/* Display uploaded images */}
                      {item.images.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.images.map((image, imgIndex) => (
                            <div key={imgIndex} className="relative">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Upload ${imgIndex + 1}`}
                                className="w-16 h-16 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index, imgIndex)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Text Input */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Text/Instructions</label>
                      <textarea
                        value={item.text}
                        onChange={(e) => updateProduct(index, 'text', e.target.value)}
                        placeholder="Enter any additional text or special instructions..."
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.customerInfo.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, name: e.target.value }
                  }))}
                  className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Your full name"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.customerInfo.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, email: e.target.value }
                  }))}
                  className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.customerInfo.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, phone: e.target.value }
                  }))}
                  className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company (Optional)</label>
                <input
                  type="text"
                  value={formData.customerInfo.company}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customerInfo: { ...prev.customerInfo, company: e.target.value }
                  }))}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Your company name"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Message</label>
              <textarea
                value={formData.customerInfo.message}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  customerInfo: { ...prev.customerInfo, message: e.target.value }
                }))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Any additional information or special requirements..."
                rows={4}
              />
            </div>
          </div>


          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 cursor-pointer"
            >
              Submit Quote Request
            </button>
          </div>
        </form>
      </motion.div>

      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center"
          >
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Quote Request Submitted!
              </h3>
              <p className="text-gray-600">
                Thank you for your interest! We will contact you within 24 hours with a detailed quote.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 cursor-pointer text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false)
                  // Scroll to top of form
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-300 cursor-pointer text-sm"
              >
                Submit Another Quote
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
