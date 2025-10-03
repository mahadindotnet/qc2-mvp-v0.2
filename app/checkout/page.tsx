'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CreditCard, User, ShoppingCart, ArrowLeft } from 'lucide-react'

interface OrderItem {
  product_name: string
  shirt_color: string
  shirt_size: string
  print_type: string
  print_areas: Array<{
    id: string
    name: string
    price: number
    selected: boolean
  }>
  quantity: number
  base_price: number
  turnaround_time: {
    label: string
    price: number
  }
  total_price: number
  design_proof_required: boolean
  proof_contact_details?: string
  imageElements: Array<{
    id: string
    imageUrl: string
    area: string
    fileName?: string
  }>
  textElements: Array<{
    id: string
    text: string
    area: string
  }>
  areaInstructions: Array<{
    areaId: string
    instructions: string
  }>
}

interface CustomerDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  })
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    // Load order items from session storage or API
    const savedOrder = sessionStorage.getItem('currentOrder')
    if (savedOrder) {
      setOrderItems([JSON.parse(savedOrder)])
    } else {
      // Redirect to home if no order
      router.push('/')
    }
  }, [router])

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!customerDetails.firstName.trim()) errors.firstName = 'First name is required'
    if (!customerDetails.lastName.trim()) errors.lastName = 'Last name is required'
    if (!customerDetails.email.trim()) errors.email = 'Email is required'
    if (!customerDetails.phone.trim()) errors.phone = 'Phone number is required'
    if (!customerDetails.address.trim()) errors.address = 'Address is required'
    if (!customerDetails.city.trim()) errors.city = 'City is required'
    if (!customerDetails.state.trim()) errors.state = 'State is required'
    if (!customerDetails.zipCode.trim()) errors.zipCode = 'ZIP code is required'
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (customerDetails.email && !emailRegex.test(customerDetails.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (customerDetails.phone && !phoneRegex.test(customerDetails.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.total_price, 0)
  }

  const handleCreateOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly')
      return
    }

    setLoading(true)
    
    try {
      // Create order with customer details
      const orderData = {
        ...orderItems[0],
        customerDetails,
        paymentStatus: 'pending',
        status: 'pending'
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Order created! Please complete payment.')
        
        // For COD (Cash on Delivery), redirect directly to thank you page
        // Since we're using COD, no payment processing is needed
        const total = calculateTotal().toFixed(2)
        router.push(`/thank-you?orderId=${result.orderId}&total=${total}`)
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Order creation error:', error)
      toast.error('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No items in cart</h2>
          <p className="text-gray-600 mb-4">Please add items to your cart before checkout.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shopping
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Details Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </h2>
            
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerDetails.firstName}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, firstName: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {validationErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerDetails.lastName}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, lastName: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {validationErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Contact Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (651) 488-1244"
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>

              {/* Address Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    validationErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Main Street"
                />
                {validationErrors.address && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerDetails.city}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, city: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="New York"
                  />
                  {validationErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerDetails.state}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, state: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="NY"
                  />
                  {validationErrors.state && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.state}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerDetails.zipCode}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, zipCode: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      validationErrors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10001"
                  />
                  {validationErrors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Summary
            </h2>

            {orderItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                    {item.product_name === 'Color Copies' ? (
                      <div className="text-sm text-gray-600">
                        <p>Print Type: {item.print_type}</p>
                        {(item as any).color_copies_data?.frontSideInstructions && (
                          <p className="mt-1">Instructions: {(item as any).color_copies_data.frontSideInstructions.substring(0, 50)}...</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <p>{item.shirt_size} • {item.print_type}</p>
                        <p>
                          Color: <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: item.shirt_color }}></span> {item.shirt_color}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${item.total_price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>

                {/* Print Areas - Different display for Color Copies vs T-shirts */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {item.product_name === 'Color Copies' ? 'Print Configuration:' : 'Print Areas:'}
                  </h4>
                  <div className="space-y-1">
                    {item.print_areas
                      .filter(area => area.selected)
                      .map((area) => (
                        <div key={area.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{area.name}</span>
                          <span className="text-gray-900">${area.price.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Turnaround Time */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Turnaround Time:</span>
                    <span className="text-gray-900">{item.turnaround_time.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rush Fee:</span>
                    <span className="text-gray-900">${item.turnaround_time.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Design Proof */}
                {item.design_proof_required && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 font-medium">Design Proof Required</p>
                    <p className="text-sm text-blue-700">Contact: {item.proof_contact_details}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Section */}
            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="w-full mt-6 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Order...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Place Order (Pay on Delivery)
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Cash on Delivery (COD) - Pay when your order arrives. No upfront payment required.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
