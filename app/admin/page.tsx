'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Eye, CheckCircle, XCircle, Clock, Package, FileText, Archive, Edit3, CheckSquare, Square, DollarSign, TrendingUp, Bell, RefreshCw } from 'lucide-react'
import JSZip from 'jszip'
import { toast } from 'sonner'
import { Howl } from 'howler'

interface Order {
  id: string
  created_at: string
  status: string
  payment_status: string
  payment_method?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  total_price: number
  base_price: number
  turnaround_price: number
  product_name: string
  shirt_color: string
  shirt_size: string
  print_type: string
  quantity: number
  print_areas: Array<{
    id: string
    name: string
    price: number
    selected: boolean
  }>
  turnaround_time: {
    label: string
    price: number
  }
  design_proof_required: boolean
  proof_contact_method?: string
  proof_contact_details?: string
  text_elements: Array<{
    id: string
    text: string
    area: string
  }>
  image_elements: Array<{
    id: string
    imageUrl: string
    area: string
    fileName?: string
  }>
  area_instructions: Array<{
    areaId: string
    instructions: string
  }>
  notes?: string
  estimated_completion?: string
  completed_at?: string
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  
  // Bulk selection and editing
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkPaymentStatus, setBulkPaymentStatus] = useState('')
  const [isSelectAll, setIsSelectAll] = useState(false)
  
  // Auto-update and notifications
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [statusUpdatesCount, setStatusUpdatesCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastNotificationTime, setLastNotificationTime] = useState<Date>(new Date(0))
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    fetchOrders()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        checkForUpdates()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [autoRefresh])

  // Check for updates and show notifications
  const checkForUpdates = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      
      if (data.success) {
        const newOrders = data.orders
        const previousOrderIds = orders.map(order => order.id)
        const currentOrderIds = newOrders.map((order: Order) => order.id)
        
        // Skip notifications on initial load
        if (isInitialLoad) {
          setIsInitialLoad(false)
          setOrders(newOrders)
          setLastUpdate(new Date())
          return
        }

        // Check for new orders - only notify if there are actually new orders
        const newOrderIds = currentOrderIds.filter((id: string) => !previousOrderIds.includes(id))
        if (newOrderIds.length > 0) {
          // Debounce notifications - only show if enough time has passed since last notification
          const now = new Date()
          const timeSinceLastNotification = now.getTime() - lastNotificationTime.getTime()
          const minNotificationInterval = 5000 // 5 seconds minimum between notifications
          
          if (timeSinceLastNotification >= minNotificationInterval) {
            setNewOrdersCount(prev => prev + newOrderIds.length)
            playNotificationSound('money') // Special coin money sound for new orders! 💰
            toast.success(`${newOrderIds.length} new order${newOrderIds.length > 1 ? 's' : ''} received!`, {
              description: 'Click to view details',
              duration: 5000,
            })
            setLastNotificationTime(now)
          }
        }
        
        // Check for status updates - only notify if there are actual status changes
        let statusChanges = 0
        const actualStatusChanges: string[] = []
        
        newOrders.forEach((newOrder: Order) => {
          const oldOrder = orders.find(order => order.id === newOrder.id)
          if (oldOrder && oldOrder.status !== newOrder.status) {
            statusChanges++
            actualStatusChanges.push(newOrder.id)
          }
        })
        
        // Only show status update notification if there are actual changes and enough time has passed
        if (statusChanges > 0 && actualStatusChanges.length > 0) {
          const now = new Date()
          const timeSinceLastNotification = now.getTime() - lastNotificationTime.getTime()
          const minNotificationInterval = 5000 // 5 seconds minimum between notifications
          
          if (timeSinceLastNotification >= minNotificationInterval) {
            setStatusUpdatesCount(prev => prev + statusChanges)
            playNotificationSound('info')
            toast.info(`${statusChanges} order${statusChanges > 1 ? 's' : ''} status updated`, {
              description: 'Orders have been updated',
              duration: 4000,
            })
            setLastNotificationTime(now)
          }
        }
        
        // Update orders if there are changes
        if (newOrderIds.length > 0 || statusChanges > 0) {
          setOrders(newOrders)
          setLastUpdate(new Date())
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error)
    }
  }

  // Calculate earnings
  const calculateEarnings = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0)
    const completedRevenue = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total_price, 0)
    const pendingRevenue = orders
      .filter(order => order.status === 'pending')
      .reduce((sum, order) => sum + order.total_price, 0)
    const processingRevenue = orders
      .filter(order => order.status === 'processing')
      .reduce((sum, order) => sum + order.total_price, 0)
    
    return {
      total: totalRevenue,
      completed: completedRevenue,
      pending: pendingRevenue,
      processing: processingRevenue
    }
  }

  const earnings = calculateEarnings()

  // High-quality sound notification functions using Howler.js
  const playNotificationSound = (type: 'success' | 'info' | 'warning' | 'error' | 'money') => {
    if (!soundEnabled) return

    try {
      if (type === 'money') {
        // Special coin money sound for new orders using Howler
        playCoinMoneySound()
        return
      }

      // Create different sound patterns using Howler
      const soundPatterns = {
        success: { 
          frequency: 800, 
          duration: 0.3, 
          volume: 0.3,
          pattern: [1, 0.5, 1] 
        },
        info: { 
          frequency: 600, 
          duration: 0.2, 
          volume: 0.3,
          pattern: [1, 0.3, 1] 
        },
        warning: { 
          frequency: 400, 
          duration: 0.4, 
          volume: 0.3,
          pattern: [1, 0.2, 1, 0.2, 1] 
        },
        error: { 
          frequency: 200, 
          duration: 0.5, 
          volume: 0.3,
          pattern: [1, 0.1, 1, 0.1, 1, 0.1, 1] 
        }
      }

      const pattern = soundPatterns[type]
      
      // Create a Howl instance for the notification sound
      const sound = new Howl({
        src: [], // We'll generate the sound programmatically
        volume: pattern.volume,
        onload: () => {
          sound.play()
        },
        onend: () => {
          sound.unload()
        }
      })

      // Generate the sound using Web Audio API but with Howler's better handling
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(pattern.frequency, audioContext.currentTime)

      // Create the sound pattern
      let currentTime = audioContext.currentTime
      pattern.pattern.forEach((volume) => {
        gainNode.gain.setValueAtTime(0, currentTime)
        gainNode.gain.linearRampToValueAtTime(volume * pattern.volume, currentTime + 0.05)
        gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.1)
        currentTime += 0.15
      })

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + pattern.duration)

    } catch (error) {
      console.warn("Error playing notification sound:", error)
    }
  }

  // Enhanced coin money sound using Howler.js
  const playCoinMoneySound = () => {
    try {
      // Create a more realistic coin sound using multiple Howl instances
      const coinSounds = []
      
      // Coin drop sequence with different frequencies
      const coinFrequencies = [1200, 1000, 800, 600, 400]
      const coinVolumes = [0.4, 0.35, 0.3, 0.25, 0.2]
      
      coinFrequencies.forEach((freq, index) => {
        const coinSound = new Howl({
          src: [], // Generate programmatically
          volume: coinVolumes[index],
          rate: 1 + (index * 0.1), // Slightly different rates for variety
          onload: () => {
            setTimeout(() => {
              coinSound.play()
            }, index * 50) // Stagger the sounds
          },
          onend: () => {
            coinSound.unload()
          }
        })

        // Generate the coin drop sound
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
        
        const startTime = audioContext.currentTime + (index * 0.05)
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(coinVolumes[index], startTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + 0.1)
        
        coinSounds.push(coinSound)
      })
      
      // Add the "cha-ching" finale after a delay
      setTimeout(() => {
        try {
          const chingSound = new Howl({
            src: [],
            volume: 0.3,
            rate: 1.2,
            onload: () => {
              chingSound.play()
            },
            onend: () => {
              chingSound.unload()
            }
          })

          // Generate the cha-ching sound
          const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.type = 'triangle'
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.1)
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime)
          gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.2)
          
        } catch (error) {
          console.warn("Error playing ching sound:", error)
        }
      }, 250)
      
    } catch (error) {
      console.warn("Error playing coin money sound:", error)
    }
  }

  // Clear notification counts when user interacts
  const clearNotifications = () => {
    setNewOrdersCount(0)
    setStatusUpdatesCount(0)
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  // Bulk selection functions
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (isSelectAll) {
      setSelectedOrders(new Set())
      setIsSelectAll(false)
    } else {
      const allOrderIds = new Set(filteredOrders.map(order => order.id))
      setSelectedOrders(allOrderIds)
      setIsSelectAll(true)
    }
  }

  const clearSelection = () => {
    setSelectedOrders(new Set())
    setIsSelectAll(false)
  }

  // Bulk actions
  const handleBulkAction = async () => {
    if (selectedOrders.size === 0) return

    try {
      const promises = Array.from(selectedOrders).map(async (orderId) => {
        const updateData: Record<string, unknown> = {}
        
        if (bulkAction === 'status' && bulkStatus) {
          updateData.status = bulkStatus
        }
        if (bulkAction === 'payment' && bulkPaymentStatus) {
          updateData.payment_status = bulkPaymentStatus
        }

        if (Object.keys(updateData).length > 0) {
          const response = await fetch(`/api/admin/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          })
          return response.ok
        }
        return false
      })

      const results = await Promise.all(promises)
      const successCount = results.filter(Boolean).length

              if (successCount > 0) {
                // Refresh orders
                await fetchOrders()
                clearSelection()
                setShowBulkEditModal(false)
                setBulkAction('')
                setBulkStatus('')
                setBulkPaymentStatus('')
                playNotificationSound('success')
                toast.success(`Successfully updated ${successCount} order${successCount > 1 ? 's' : ''}!`, {
                  duration: 3000,
                })
              }
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  // Export selected orders as CSV
  const exportSelectedOrders = async () => {
    if (selectedOrders.size === 0) return

    try {
      const selectedOrdersData = orders.filter(order => selectedOrders.has(order.id))
      
      // CSV headers
      const headers = [
        'Order ID',
        'Order Date',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Customer Address',
        'Product Name',
        'Shirt Color',
        'Shirt Size',
        'Print Type',
        'Quantity',
        'Print Areas',
        'Base Price',
        'Turnaround Price',
        'Total Price',
        'Status',
        'Payment Status',
        'Design Proof Required',
        'Proof Contact Method',
        'Proof Contact Details',
        'Text Elements',
        'Image Elements Count',
        'Area Instructions'
      ]

      // Convert orders to CSV rows
      const csvRows = selectedOrdersData.map(order => {
        const printAreas = order.print_areas
          .filter(area => area.selected)
          .map(area => area.name)
          .join('; ')
        
        const textElements = order.text_elements
          .map(el => `${el.area}: ${el.text}`)
          .join('; ')
        
        const areaInstructions = order.area_instructions
          .map(inst => `${inst.areaId}: ${inst.instructions}`)
          .join('; ')

        return [
          order.id,
          new Date(order.created_at).toLocaleDateString(),
          `"${order.customer_name}"`,
          order.customer_email,
          order.customer_phone,
          `"${order.customer_address}"`,
          order.product_name,
          order.shirt_color,
          order.shirt_size,
          order.print_type,
          order.quantity,
          `"${printAreas}"`,
          order.base_price,
          order.turnaround_price,
          order.total_price,
          order.status,
          order.payment_status,
          order.design_proof_required ? 'Yes' : 'No',
          order.proof_contact_method || '',
          order.proof_contact_details || '',
          `"${textElements}"`,
          order.image_elements.length,
          `"${areaInstructions}"`
        ].join(',')
      })

      // Combine headers and rows
      const csvContent = [headers.join(','), ...csvRows].join('\n')
      
      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `orders_export_${selectedOrders.size}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      playNotificationSound('success')
      toast.success(`Exported ${selectedOrders.size} order${selectedOrders.size > 1 ? 's' : ''} to CSV!`, {
        duration: 3000,
      })
    } catch (error) {
      console.error('Error exporting selected orders:', error)
      playNotificationSound('error')
      toast.error('Export failed', {
        description: 'Please try again or contact support',
        duration: 4000,
      })
    }
  }

  // Export all orders as CSV
  const exportAllOrders = async () => {
    try {
      // CSV headers
      const headers = [
        'Order ID',
        'Order Date',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Customer Address',
        'Product Name',
        'Shirt Color',
        'Shirt Size',
        'Print Type',
        'Quantity',
        'Print Areas',
        'Base Price',
        'Turnaround Price',
        'Total Price',
        'Status',
        'Payment Status',
        'Design Proof Required',
        'Proof Contact Method',
        'Proof Contact Details',
        'Text Elements',
        'Image Elements Count',
        'Area Instructions'
      ]

      // Convert all orders to CSV rows
      const csvRows = orders.map(order => {
        const printAreas = order.print_areas
          .filter(area => area.selected)
          .map(area => area.name)
          .join('; ')
        
        const textElements = order.text_elements
          .map(el => `${el.area}: ${el.text}`)
          .join('; ')
        
        const areaInstructions = order.area_instructions
          .map(inst => `${inst.areaId}: ${inst.instructions}`)
          .join('; ')

        return [
          order.id,
          new Date(order.created_at).toLocaleDateString(),
          `"${order.customer_name}"`,
          order.customer_email,
          order.customer_phone,
          `"${order.customer_address}"`,
          order.product_name,
          order.shirt_color,
          order.shirt_size,
          order.print_type,
          order.quantity,
          `"${printAreas}"`,
          order.base_price,
          order.turnaround_price,
          order.total_price,
          order.status,
          order.payment_status,
          order.design_proof_required ? 'Yes' : 'No',
          order.proof_contact_method || '',
          order.proof_contact_details || '',
          `"${textElements}"`,
          order.image_elements.length,
          `"${areaInstructions}"`
        ].join(',')
      })

      // Combine headers and rows
      const csvContent = [headers.join(','), ...csvRows].join('\n')
      
      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `all_orders_export_${orders.length}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      playNotificationSound('success')
      toast.success(`Exported all ${orders.length} order${orders.length > 1 ? 's' : ''} to CSV!`, {
        duration: 3000,
      })
    } catch (error) {
      console.error('Error exporting all orders:', error)
      playNotificationSound('error')
      toast.error('Export failed', {
        description: 'Please try again or contact support',
        duration: 4000,
      })
    }
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  // Download individual image
  const downloadImage = (imageUrl: string, fileName: string, area: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${area}_${fileName || 'image'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Download all images as ZIP
  const downloadAllImages = async (order: Order) => {
    try {
      const zip = new JSZip()
      const imagesFolder = zip.folder('images')
      
      // Add each image to the ZIP
      for (const element of order.image_elements) {
        try {
          // Convert base64 to blob
          const response = await fetch(element.imageUrl)
          const blob = await response.blob()
          
          // Add to ZIP with proper naming
          const fileName = `${element.area}_${element.fileName || 'image'}.png`
          imagesFolder?.file(fileName, blob)
        } catch (error) {
          console.error(`Error processing image ${element.id}:`, error)
        }
      }
      
      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `order_${order.id.slice(0, 8)}_images.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error creating ZIP:', error)
    }
  }

  // Download order text data as JSON
  const downloadOrderText = (order: Order) => {
    const textData = {
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      customerAddress: order.customer_address,
      productDetails: {
        productName: order.product_name,
        shirtColor: order.shirt_color,
        shirtSize: order.shirt_size,
        printType: order.print_type,
        quantity: order.quantity
      },
      printAreas: order.print_areas.filter(area => area.selected),
      textElements: order.text_elements,
      areaInstructions: order.area_instructions,
      designProof: {
        required: order.design_proof_required,
        contactMethod: order.proof_contact_method,
        contactDetails: order.proof_contact_details
      },
      pricing: {
        basePrice: order.base_price,
        turnaroundPrice: order.turnaround_price,
        totalPrice: order.total_price,
        turnaroundTime: order.turnaround_time
      },
      orderDate: order.created_at,
      status: order.status,
      paymentStatus: order.payment_status
    }

    const dataStr = JSON.stringify(textData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `order_${order.id.slice(0, 8)}_details.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Download complete order package (images + text)
  const downloadOrderPackage = async (order: Order) => {
    try {
      const zip = new JSZip()
      
      // Add order details JSON
      const textData = {
        orderId: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        customerAddress: order.customer_address,
        productDetails: {
          productName: order.product_name,
          shirtColor: order.shirt_color,
          shirtSize: order.shirt_size,
          printType: order.print_type,
          quantity: order.quantity
        },
        printAreas: order.print_areas.filter(area => area.selected),
        textElements: order.text_elements,
        areaInstructions: order.area_instructions,
        designProof: {
          required: order.design_proof_required,
          contactMethod: order.proof_contact_method,
          contactDetails: order.proof_contact_details
        },
        pricing: {
          basePrice: order.base_price,
          turnaroundPrice: order.turnaround_price,
          totalPrice: order.total_price,
          turnaroundTime: order.turnaround_time
        },
        orderDate: order.created_at,
        status: order.status,
        paymentStatus: order.payment_status
      }
      
      zip.file('order_details.json', JSON.stringify(textData, null, 2))
      
      // Add images folder
      const imagesFolder = zip.folder('images')
      
      // Add each image to the ZIP
      for (const element of order.image_elements) {
        try {
          const response = await fetch(element.imageUrl)
          const blob = await response.blob()
          const fileName = `${element.area}_${element.fileName || 'image'}.png`
          imagesFolder?.file(fileName, blob)
        } catch (error) {
          console.error(`Error processing image ${element.id}:`, error)
        }
      }
      
      // Add text elements as separate files
      if (order.text_elements.length > 0) {
        const textFolder = zip.folder('text_elements')
        order.text_elements.forEach((element, index) => {
          textFolder?.file(`${element.area}_text_${index + 1}.txt`, element.text)
        })
      }
      
      // Add area instructions
      if (order.area_instructions.length > 0) {
        const instructionsFolder = zip.folder('instructions')
        order.area_instructions.forEach((instruction) => {
          instructionsFolder?.file(`${instruction.areaId}_instructions.txt`, instruction.instructions)
        })
      }
      
      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `order_${order.id.slice(0, 8)}_complete_package.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error creating complete package:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600 mt-2">Manage and track customer orders</p>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
                {autoRefresh && (
                  <span className="ml-2 text-green-600 font-medium">
                    • Auto-refresh active (notifications debounced)
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sound toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSoundEnabled(!soundEnabled)
                    if (!soundEnabled) {
                      playNotificationSound('money') // Test with coin money sound! 💰
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    soundEnabled 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  {soundEnabled ? 'Sound ON' : 'Sound OFF'}
                </button>
              </div>

              {/* Auto-refresh toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                  Auto-refresh
                </button>
              </div>
              
              {/* Manual refresh - only show when auto-refresh is disabled */}
              {!autoRefresh && (
                <button
                onClick={() => {
                  fetchOrders()
                  setLastUpdate(new Date())
                  setLastNotificationTime(new Date()) // Reset notification debounce
                  playNotificationSound('success')
                  toast.success('Orders refreshed!', {
                    duration: 2000,
                  })
                }}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Now
                </button>
              )}
              
              {/* Notification indicators */}
              {(newOrdersCount > 0 || statusUpdatesCount > 0) && (
                <div className="flex items-center gap-2">
                  {newOrdersCount > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 transition-colors cursor-pointer"
                    >
                      <Bell className="h-3 w-3" />
                      {newOrdersCount} new
                    </button>
                  )}
                  {statusUpdatesCount > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                    >
                      <Bell className="h-3 w-3" />
                      {statusUpdatesCount} updated
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${earnings.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Completed Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${earnings.completed.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search orders, customers, emails..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            <div className="flex items-end">
                <button 
                  onClick={exportAllOrders}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Export All
                </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.size > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Clear selection
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBulkEditModal(true)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="h-3 w-3" />
                    Bulk Edit
                  </button>
                  
                  <button
                    onClick={exportSelectedOrders}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 cursor-pointer flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Export Selected
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2 hover:text-gray-700 cursor-pointer"
                    >
                      {isSelectAll ? (
                        <CheckSquare className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                      Select All
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={`hover:bg-gray-50 ${selectedOrders.has(order.id) ? 'bg-orange-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.product_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.shirt_size} • {order.quantity} qty
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => viewOrderDetails(order)}
                          className="text-orange-600 hover:text-orange-900 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadOrderPackage(order)}
                          className="text-purple-600 hover:text-purple-900 cursor-pointer"
                          title="Download Order Package"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer"
                            title="Mark as Processing"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="text-green-600 hover:text-green-900 cursor-pointer"
                            title="Mark as Completed"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details - #{selectedOrder.id.slice(0, 8)}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.customer_phone}</p>
                    <p><span className="font-medium">Address:</span> {selectedOrder.customer_address}</p>
                  </div>
                </div>

                {/* Order Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Order ID:</span> {selectedOrder.id}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Payment:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                        {selectedOrder.payment_status}
                      </span>
                    </p>
                    {selectedOrder.payment_method && (
                      <p><span className="font-medium">Payment Method:</span> {selectedOrder.payment_method}</p>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Product:</span> {selectedOrder.product_name}</p>
                    <p><span className="font-medium">Size:</span> {selectedOrder.shirt_size}</p>
                    <p><span className="font-medium">Color:</span> 
                      <span className="ml-2 inline-block w-4 h-4 rounded-full border border-gray-300" 
                            style={{ backgroundColor: selectedOrder.shirt_color }}></span>
                      {selectedOrder.shirt_color}
                    </p>
                    <p><span className="font-medium">Print Type:</span> {selectedOrder.print_type}</p>
                    <p><span className="font-medium">Quantity:</span> {selectedOrder.quantity}</p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Base Price:</span> ${selectedOrder.base_price.toFixed(2)}</p>
                    <p><span className="font-medium">Turnaround Fee:</span> ${selectedOrder.turnaround_price.toFixed(2)}</p>
                    <p><span className="font-medium">Total:</span> <span className="font-bold text-lg">${selectedOrder.total_price.toFixed(2)}</span></p>
                    <p><span className="font-medium">Turnaround Time:</span> {selectedOrder.turnaround_time.label}</p>
                  </div>
                </div>
              </div>

              {/* Print Areas */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Print Areas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOrder.print_areas
                    .filter(area => area.selected)
                    .map((area) => (
                      <div key={area.id} className="bg-white rounded-lg p-3 border">
                        <p className="font-medium">{area.name}</p>
                        <p className="text-sm text-gray-600">${area.price.toFixed(2)}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Design Elements */}
              {(selectedOrder.text_elements.length > 0 || selectedOrder.image_elements.length > 0) && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Elements</h3>
                  
                  {selectedOrder.text_elements.length > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">Text Elements:</h4>
                        <button
                          onClick={() => downloadOrderText(selectedOrder)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 cursor-pointer flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          Download Text
                        </button>
                      </div>
                      {selectedOrder.text_elements.map((element, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border mb-2">
                          <p className="font-medium">{element.text}</p>
                          <p className="text-sm text-gray-600">Area: {element.area}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedOrder.image_elements.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">Image Elements:</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadAllImages(selectedOrder)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 cursor-pointer flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            All Images
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedOrder.image_elements.map((element, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border">
                            <img 
                              src={element.imageUrl} 
                              alt={`Design ${index + 1}`}
                              className="w-full h-20 object-cover rounded mb-2"
                            />
                            <p className="text-sm font-medium">{element.fileName || `Image ${index + 1}`}</p>
                            <p className="text-xs text-gray-600">Area: {element.area}</p>
                            <button
                              onClick={() => downloadImage(element.imageUrl, element.fileName || `image_${index + 1}`, element.area)}
                              className="mt-2 w-full px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Design Proof */}
              {selectedOrder.design_proof_required && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Design Proof Required</h3>
                  <p className="text-blue-800">
                    <span className="font-medium">Contact Method:</span> {selectedOrder.proof_contact_method}
                  </p>
                  {selectedOrder.proof_contact_details && (
                    <p className="text-blue-800">
                      <span className="font-medium">Contact Details:</span> {selectedOrder.proof_contact_details}
                    </p>
                  )}
                </div>
              )}

              {/* Area Instructions */}
              {selectedOrder.area_instructions.length > 0 && (
                <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Designer Instructions</h3>
                  {selectedOrder.area_instructions.map((instruction, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border mb-2">
                      <p className="font-medium text-gray-900">Area: {instruction.areaId}</p>
                      <p className="text-gray-700">{instruction.instructions}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Additional Notes</h3>
                  <p className="text-yellow-800">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadOrderPackage(selectedOrder)}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer flex items-center gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Download Complete Package
                  </button>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 cursor-pointer"
                  >
                    Close
                  </button>
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'processing')
                        setShowOrderModal(false)
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                    >
                      Mark as Processing
                    </button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'completed')
                        setShowOrderModal(false)
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Bulk Edit Orders
                </h2>
                <button
                  onClick={() => setShowBulkEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Type
                  </label>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select action...</option>
                    <option value="status">Update Status</option>
                    <option value="payment">Update Payment Status</option>
                  </select>
                </div>

                {bulkAction === 'status' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Status
                    </label>
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select status...</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}

                {bulkAction === 'payment' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Payment Status
                    </label>
                    <select
                      value={bulkPaymentStatus}
                      onChange={(e) => setBulkPaymentStatus(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select payment status...</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This will update {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''}. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBulkEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || (bulkAction === 'status' && !bulkStatus) || (bulkAction === 'payment' && !bulkPaymentStatus)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}