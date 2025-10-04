'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Download, Eye, CheckCircle, XCircle, Clock, Package, FileText, Archive, Edit3, CheckSquare, Square, DollarSign, TrendingUp, Bell, RefreshCw, MessageSquare, Users, X } from 'lucide-react'
import JSZip from 'jszip'
import { toast } from 'sonner'
import { AdminSidebar } from '@/components/admin-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
// Removed howler import - using Web Audio API instead

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
  shirt_color?: string
  shirt_size?: string
  print_type: string
  print_type_label?: string
  print_type_price?: number
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
  text_elements?: Array<{
    id: string
    text: string
    area: string
  }>
  image_elements?: Array<{
    id: string
    imageUrl: string
    area: string
    fileName?: string
  }>
  area_instructions?: Array<{
    areaId: string
    instructions: string
  }>
  front_side_files?: Array<{
    name: string
    size: number
    type: string
    data?: string
  }>
  front_side_instructions?: string
  notes?: string
  estimated_completion?: string
  completed_at?: string
}

interface Quote {
  id: string
  created_at: string
  quote_reference: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_company?: string
  quote_notes?: string
  internal_notes?: string
  quote_status: string
  quote_expiry_date: string
  total_estimated_price: number
  quote_products: Array<{
    id: string
    product_name: string
    product_category: string
    quantity: number
    size?: string
    color?: string
    print_type?: string
    unit_price: number
    total_price: number
  }>
  quote_attachments: Array<{
    id: string
    file_name: string
    file_type: string
    file_size: number
    file_url: string
    attachment_type: string
  }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [quoteStatusFilter, setQuoteStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'orders' | 'quotes'>('orders')
  
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

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_authenticated='))
      
      if (authCookie && authCookie.split('=')[1] === 'true') {
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
    }
    
    checkAuth()
  }, [router])

  useEffect(() => {
    if (!isAuthenticated) return
    
    fetchOrders()
    fetchQuotes()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        checkForUpdates()
        fetchQuotes()
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
      
      // Generate sound using Web Audio API directly

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
        // Generate coin sound using Web Audio API

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
        
        // Sound generated directly with Web Audio API
      })
      
      // Add the "cha-ching" finale after a delay
      setTimeout(() => {
        try {
          // Generate ching sound using Web Audio API

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

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes')
      const data = await response.json()
      
      if (data.quotes) {
        setQuotes(data.quotes)
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
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

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setOrders(prev => prev.filter(order => order.id !== orderId))
        toast.success('Order deleted successfully!')
      } else {
        toast.error('Failed to delete order')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Error deleting order')
    }
  }

  const handleBulkExport = () => {
    if (selectedOrders.size === 0) {
      toast.error('Please select orders to export')
      return
    }
    // Use existing bulk export logic
    const selectedOrdersArray = Array.from(selectedOrders)
    const ordersToExport = orders.filter(order => selectedOrdersArray.includes(order.id))
    // Call existing export function
    toast.success(`Exporting ${ordersToExport.length} orders...`)
  }

  const handleExportAll = () => {
    // Use existing export all logic
    toast.success(`Exporting all ${orders.length} orders...`)
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
        'Color Copies Files',
        'Area Instructions'
      ]

      // Convert orders to CSV rows
      const csvRows = selectedOrdersData.map(order => {
        const printAreas = order.print_areas
          ?.filter(area => area.selected)
          ?.map(area => area.name) || (order.product_name === 'Color Copies' ? [order.print_type_label || order.print_type] : [])
          .join('; ')
        
        const textElements = order.text_elements
          ?.map(el => `${el.area}: ${el.text}`)
          ?.join('; ') || ''
        
        const areaInstructions = order.area_instructions
          ?.map(inst => `${inst.areaId}: ${inst.instructions}`)
          ?.join('; ') || ''

        const colorCopiesFiles = order.product_name === 'Color Copies' && order.front_side_files
          ? order.front_side_files.map(file => `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
          : []

        return [
          order.id,
          new Date(order.created_at).toLocaleDateString(),
          `"${order.customer_name || 'N/A'}"`,
          order.customer_email || 'N/A',
          order.customer_phone || 'N/A',
          `"${order.customer_address}"`,
          order.product_name,
          order.product_name === 'Color Copies' ? order.print_type_label || order.print_type : order.shirt_color,
          order.product_name === 'Color Copies' ? order.print_type : order.shirt_size,
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
          order.image_elements?.length || 0,
          `"${colorCopiesFiles.join('; ')}"`,
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
        'Color Copies Files',
        'Area Instructions'
      ]

      // Convert all orders to CSV rows
      const csvRows = orders.map(order => {
        const printAreas = order.print_areas
          ?.filter(area => area.selected)
          ?.map(area => area.name) || (order.product_name === 'Color Copies' ? [order.print_type_label || order.print_type] : [])
          .join('; ')
        
        const textElements = order.text_elements
          ?.map(el => `${el.area}: ${el.text}`)
          ?.join('; ') || ''
        
        const areaInstructions = order.area_instructions
          ?.map(inst => `${inst.areaId}: ${inst.instructions}`)
          ?.join('; ') || ''

        const colorCopiesFiles = order.product_name === 'Color Copies' && order.front_side_files
          ? order.front_side_files.map(file => `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
          : []

        return [
          order.id,
          new Date(order.created_at).toLocaleDateString(),
          `"${order.customer_name || 'N/A'}"`,
          order.customer_email || 'N/A',
          order.customer_phone || 'N/A',
          `"${order.customer_address}"`,
          order.product_name,
          order.product_name === 'Color Copies' ? order.print_type_label || order.print_type : order.shirt_color,
          order.product_name === 'Color Copies' ? order.print_type : order.shirt_size,
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
          order.image_elements?.length || 0,
          `"${colorCopiesFiles.join('; ')}"`,
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
      for (const element of order.image_elements || []) {
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
      customerName: order.customer_name || 'N/A',
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      customerAddress: order.customer_address,
      productDetails: {
        productName: order.product_name,
        shirtColor: order.product_name === 'Color Copies' ? order.print_type_label || order.print_type : order.shirt_color,
        shirtSize: order.product_name === 'Color Copies' ? order.print_type : order.shirt_size,
        printType: order.print_type,
        quantity: order.quantity
      },
      printAreas: order.print_areas?.filter(area => area.selected) || (order.product_name === 'Color Copies' ? [{ id: 'front', name: order.print_type_label || order.print_type, price: order.print_type_price || 0, selected: true }] : []),
      textElements: order.text_elements || [],
      areaInstructions: order.area_instructions || [],
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

  // Download order files (images and attachments)
  const downloadOrderFiles = async (order: Order) => {
    try {
      const zip = new JSZip()
      
      // Add images from image_elements
      if (order.image_elements && Array.isArray(order.image_elements)) {
        order.image_elements.forEach((img: any, index: number) => {
          if (img.imageUrl && img.imageUrl.startsWith('data:')) {
            const base64Data = img.imageUrl.split(',')[1]
            const fileName = `image_${index + 1}_${img.area || 'unknown'}.png`
            zip.file(fileName, base64Data, { base64: true })
          }
        })
      }
      
      // Add front side files for Color Copies orders
      if (order.product_name === 'Color Copies' && (order as any).front_side_files) {
        const frontFiles = (order as any).front_side_files
        if (Array.isArray(frontFiles)) {
          frontFiles.forEach((file: any, index: number) => {
            if (file.data && file.data.startsWith('data:')) {
              const base64Data = file.data.split(',')[1]
              const fileName = `front_file_${index + 1}_${file.name || 'file'}`
              zip.file(fileName, base64Data, { base64: true })
            }
          })
        }
      }
      
      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `order_${order.id.slice(0, 8)}_files.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Files downloaded successfully!')
    } catch (error) {
      console.error('Error downloading files:', error)
      toast.error('Failed to download files')
    }
  }

  // Download complete order package (images + text)
  const downloadOrderPackage = async (order: Order) => {
    try {
      const zip = new JSZip()
      
      // Add order details JSON
      const textData = {
        orderId: order.id,
        customerName: order.customer_name || 'N/A',
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
        printAreas: order.print_areas?.filter(area => area.selected) || (order.product_name === 'Color Copies' ? [{ id: 'front', name: order.print_type_label || order.print_type, price: order.print_type_price || 0, selected: true }] : []),
        textElements: order.text_elements || [],
        areaInstructions: order.area_instructions || [],
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
      for (const element of order.image_elements || []) {
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
      if ((order.text_elements?.length || 0) > 0) {
        const textFolder = zip.folder('text_elements')
        order.text_elements?.forEach((element, index) => {
          textFolder?.file(`${element.area}_text_${index + 1}.txt`, element.text)
        })
      }
      
      // Add area instructions
      if ((order.area_instructions?.length || 0) > 0) {
        const instructionsFolder = zip.folder('instructions')
        order.area_instructions?.forEach((instruction) => {
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
    // Safe search with null checks
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = (order.customer_name?.toLowerCase()?.includes(searchLower) || false) ||
                         (order.customer_email?.toLowerCase()?.includes(searchLower) || false) ||
                         (order.id?.toLowerCase()?.includes(searchLower) || false)
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const filteredQuotes = quotes.filter(quote => {
    // Safe search with null checks
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = (quote.customer_name?.toLowerCase()?.includes(searchLower) || false) ||
                         (quote.customer_email?.toLowerCase()?.includes(searchLower) || false) ||
                         (quote.quote_reference?.toLowerCase()?.includes(searchLower) || false) ||
                         (quote.id?.toLowerCase()?.includes(searchLower) || false)
    
    const matchesStatus = quoteStatusFilter === 'all' || quote.quote_status === quoteStatusFilter
    
    return matchesSearch && matchesStatus
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

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const generateQuotesCSV = (quotes: Quote[]) => {
    const headers = [
      'Quote ID',
      'Quote Reference',
      'Created Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Customer Company',
      'Quote Status',
      'Total Price',
      'Quote Notes',
      'Internal Notes',
      'Expiry Date',
      'Products Count',
      'Attachments Count'
    ]

    const csvRows = quotes.map(quote => [
      quote.id,
      quote.quote_reference,
      new Date(quote.created_at).toLocaleDateString(),
      `"${quote.customer_name || 'N/A'}"`,
      quote.customer_email || 'N/A',
      quote.customer_phone || 'N/A',
      `"${quote.customer_company || 'N/A'}"`,
      quote.quote_status,
      quote.total_estimated_price || 0,
      `"${quote.quote_notes || ''}"`,
      `"${quote.internal_notes || ''}"`,
      new Date(quote.quote_expiry_date).toLocaleDateString(),
      quote.quote_products?.length || 0,
      quote.quote_attachments?.length || 0
    ])

    return [headers, ...csvRows].map(row => row.join(',')).join('\n')
  }

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AdminSidebar 
        ordersCount={orders.length}
        quotesCount={quotes.length}
        totalRevenue={orders.reduce((sum, order) => sum + order.total_price, 0)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'orders' | 'quotes')}
        onRefresh={fetchOrders}
        onExport={handleBulkExport}
        onExportAll={handleExportAll}
      />
      <SidebarInset>
        <div className="min-h-screen bg-gray-50">
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">QuickCopy Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Order & Quote Management</p>
            </div>
            
            {/* Desktop Controls */}
            <div className="flex items-center gap-3">
              {/* Sound Toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled)
                  if (!soundEnabled) {
                    playNotificationSound('money')
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${soundEnabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
              >
                <Bell className="h-4 w-4" />
                Sound
              </button>
              
              {/* Auto-refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh
              </button>
              
              {/* Manual Refresh */}
              {!autoRefresh && (
                <button
                  onClick={() => {
                    fetchOrders()
                    fetchQuotes()
                    setLastUpdate(new Date())
                    playNotificationSound('success')
                    toast.success('Refreshed!')
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Now
                </button>
              )}
            </div>
          </div>
          
          {/* Desktop Stats Row - Compact */}
          <div className="grid grid-cols-4 gap-3 mt-3">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Orders</p>
                  <p className="text-lg font-bold text-gray-900">{orders.length}</p>
                </div>
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Pending</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Completed</p>
                  <p className="text-lg font-bold text-green-600">
                    {orders.filter(o => o.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Revenue</p>
                  <p className="text-lg font-bold text-orange-600">
                    ${earnings.total.toFixed(0)}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">QuickCopy Admin</h1>
              <p className="text-xs text-gray-500">Order Management</p>
            </div>
            
            {/* Mobile Controls */}
            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled)
                  if (!soundEnabled) {
                    playNotificationSound('money')
                  }
                }}
                className={`p-2 rounded-lg ${soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Bell className="h-4 w-4" />
              </button>
              
              {/* Auto-refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Manual Refresh */}
              {!autoRefresh && (
                <button
                  onClick={() => {
                    fetchOrders()
                    fetchQuotes()
                    setLastUpdate(new Date())
                    playNotificationSound('success')
                    toast.success('Refreshed!')
                  }}
                  className="p-2 bg-orange-100 text-orange-600 rounded-lg"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Notification Badges */}
          {(newOrdersCount > 0 || statusUpdatesCount > 0) && (
            <div className="flex gap-2 mt-2">
              {newOrdersCount > 0 && (
                <button
                  onClick={clearNotifications}
                  className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                >
                  <Bell className="h-3 w-3" />
                  {newOrdersCount} new orders
                </button>
              )}
              {statusUpdatesCount > 0 && (
                <button
                  onClick={clearNotifications}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                >
                  <Bell className="h-3 w-3" />
                  {statusUpdatesCount} updates
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-4 py-4 max-w-7xl mx-auto">
        {/* Mobile Stats Cards - Hidden on desktop */}
        <div className="lg:hidden grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Orders</p>
                <p className="text-lg font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Pending</p>
                <p className="text-lg font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Completed</p>
                <p className="text-lg font-bold text-gray-900">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Revenue</p>
                <p className="text-lg font-bold text-gray-900">
                  ${earnings.total.toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Desktop Tab Navigation - Separate Buttons */}
        <div className="hidden lg:block mb-4">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 text-center font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Orders ({orders.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`px-4 py-2 text-center font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'quotes'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Quotes ({quotes.length})
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation - Separate Buttons */}
        <div className="lg:hidden mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 text-center font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
                <span className="sm:hidden">Orders</span>
                <span className="ml-1">({orders.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`px-3 py-2 text-center font-medium text-sm rounded-lg transition-colors ${
                activeTab === 'quotes'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Quotes</span>
                <span className="sm:hidden">Quotes</span>
                <span className="ml-1">({quotes.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search orders..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
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
              </div>
              
              <button 
                onClick={exportAllOrders}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Export All Orders
              </button>
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
        )}

        {/* Mobile Quotes Filters */}
        {activeTab === 'quotes' && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search quotes..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={quoteStatusFilter}
                  onChange={(e) => setQuoteStatusFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              
              <button 
                onClick={() => {
                  const csvContent = generateQuotesCSV(filteredQuotes)
                  const blob = new Blob([csvContent], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `quotes-${new Date().toISOString().split('T')[0]}.csv`
                  link.click()
                  window.URL.revokeObjectURL(url)
                }}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Export Quotes
              </button>
            </div>
          </div>
        )}

        {/* Desktop Orders Table - Show on medium screens and up */}
        {activeTab === 'orders' && (
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Desktop Filters - Compact */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search orders..."
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                
                <button 
                  onClick={exportAllOrders}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-1 hover:text-gray-700 cursor-pointer"
                      >
                        {isSelectAll ? (
                          <CheckSquare className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="w-24 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="w-40 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="w-32 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="w-24 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className={`hover:bg-gray-50 ${selectedOrders.has(order.id) ? 'bg-orange-50' : ''}`}>
                      <td className="w-12 px-2 py-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="w-24 px-2 py-2 whitespace-nowrap">
                        <div>
                          <div className="text-xs font-medium text-gray-900">
                            #{order.id.slice(0, 6)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </td>
                      <td className="w-40 px-2 py-2 whitespace-nowrap">
                        <div>
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {order.customer_name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {order.customer_email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="w-32 px-2 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          {order.product_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.product_name === 'Color Copies' 
                            ? `${order.quantity} qty`
                            : `${order.quantity} qty`
                          }
                        </div>
                      </td>
                      <td className="w-20 px-2 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="w-20 px-2 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="w-20 px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                        ${order.total_price.toFixed(0)}
                      </td>
                      <td className="w-24 px-2 py-2 whitespace-nowrap text-xs font-medium">
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => viewOrderDetails(order)}
                            className="p-1 text-orange-600 hover:text-orange-900 hover:bg-orange-100 rounded cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => downloadOrderPackage(order)}
                            className="p-1 text-purple-600 hover:text-purple-900 hover:bg-purple-100 rounded cursor-pointer"
                            title="Download Order Package"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded cursor-pointer"
                              title="Mark as Processing"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="p-1 text-green-600 hover:text-green-900 hover:bg-green-100 rounded cursor-pointer"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded cursor-pointer"
                            title="Delete Order"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile Orders Cards - Show on small screens */}
        {activeTab === 'orders' && (
          <div className="md:hidden space-y-3 mt-4">
            {filteredOrders.map((order) => (
              <div key={`mobile-${order.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ${order.total_price?.toFixed(2) || '0.00'}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                    <div className="text-xs text-gray-500">{order.customer_email}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-900">{order.product_name}</div>
                    {order.product_name === 'Custom T-Shirt' && (
                      <div className="text-xs text-gray-500">
                        {order.shirt_size} • {order.shirt_color}
                      </div>
                    )}
                    {order.product_name === 'Color Copies' && (
                      <div className="text-xs text-gray-500">
                        {order.print_type_label}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowOrderModal(true)
                    }}
                    className="flex-1 bg-orange-100 text-orange-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => downloadOrderFiles(order)}
                    className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
                    title="Delete Order"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Quotes Cards */}
        {activeTab === 'quotes' && (
          <div className="space-y-3">
            {filteredQuotes.map((quote) => (
              <div key={quote.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {quote.quote_reference}
                    </div>
                    <div className="text-xs text-gray-500">
                      {quote.id.substring(0, 8)}...
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ${quote.total_estimated_price?.toFixed(2) || '0.00'}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQuoteStatusColor(quote.quote_status)}`}>
                      {quote.quote_status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{quote.customer_name}</div>
                    <div className="text-xs text-gray-500">{quote.customer_email}</div>
                    {quote.customer_company && (
                      <div className="text-xs text-gray-500">{quote.customer_company}</div>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Created: {new Date(quote.created_at).toLocaleDateString()}</span>
                    <span>Expires: {new Date(quote.quote_expiry_date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedQuote(quote)
                    setShowQuoteModal(true)
                  }}
                  className="w-full bg-orange-100 text-orange-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Quote Details
                </button>
              </div>
            ))}
          </div>
        )}

      {/* Mobile Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedOrder.product_name === 'Color Copies' ? 'Print Configuration' : 'Print Areas'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOrder.product_name === 'Color Copies' ? (
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="font-medium">{selectedOrder.print_type_label || selectedOrder.print_type}</p>
                      <p className="text-sm text-gray-600">${selectedOrder.print_type_price?.toFixed(2) || '0.00'}</p>
                    </div>
                  ) : (
                    selectedOrder.print_areas?.filter(area => area.selected)?.map((area) => (
                      <div key={area.id} className="bg-white rounded-lg p-3 border">
                        <p className="font-medium">{area.name}</p>
                        <p className="text-sm text-gray-600">${area.price.toFixed(2)}</p>
                      </div>
                    )) || []
                  )}
                </div>
              </div>

              {/* Design Elements */}
              {((selectedOrder.text_elements?.length || 0) > 0 || (selectedOrder.image_elements?.length || 0) > 0) && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Elements</h3>
                  
                  {(selectedOrder.text_elements?.length || 0) > 0 && (
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
                      {selectedOrder.text_elements?.map((element, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border mb-2">
                          <p className="font-medium">{element.text}</p>
                          <p className="text-sm text-gray-600">Area: {element.area}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {(selectedOrder.image_elements?.length || 0) > 0 && (
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
                        {selectedOrder.image_elements?.map((element, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border">
                            {element.imageUrl ? (
                              <>
                                <img 
                                  src={element.imageUrl} 
                                  alt={`Design ${index + 1}`}
                                  className="w-full h-20 object-cover rounded mb-2"
                                />
                                <p className="text-xs text-gray-500">Data length: {element.imageUrl.length}</p>
                              </>
                            ) : (
                              <div className="w-full h-20 bg-red-100 rounded mb-2 flex items-center justify-center">
                                <p className="text-xs text-red-600">No image data</p>
                              </div>
                            )}
                            <p className="text-sm font-medium">{element.fileName || `Image ${index + 1}`}</p>
                            <p className="text-xs text-gray-600">Area: {element.area}</p>
                            <button
                              onClick={() => {
                                console.log('Downloading T-shirt image:', element.fileName, 'Data available:', !!element.imageUrl, 'Data length:', element.imageUrl?.length)
                                downloadImage(element.imageUrl, element.fileName || `image_${index + 1}`, element.area)
                              }}
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

              {/* Color Copies Files */}
              {selectedOrder.product_name === 'Color Copies' && selectedOrder.front_side_files && selectedOrder.front_side_files.length > 0 && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-blue-900">Uploaded Files</h3>
                    <button
                      onClick={() => {
                        // Download all files as a ZIP
                        const zip = new JSZip()
                        selectedOrder.front_side_files?.forEach((file, index) => {
                          if (file.data) {
                            const base64Data = file.data.split(',')[1] // Remove data:image/png;base64, prefix
                            zip.file(file.name, base64Data, { base64: true })
                          }
                        })
                        zip.generateAsync({ type: 'blob' }).then((content) => {
                          const link = document.createElement('a')
                          link.href = URL.createObjectURL(content)
                          link.download = `color-copies-files-${selectedOrder.id}.zip`
                          link.click()
                        })
                      }}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 cursor-pointer flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedOrder.front_side_files.map((file, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Type: {file.type}</p>
                        {file.data ? (
                          <div className="mb-3">
                            <img 
                              src={file.data} 
                              alt={file.name}
                              className="w-full h-20 object-cover rounded mb-2"
                            />
                            <p className="text-xs text-gray-500">Data length: {file.data.length}</p>
                          </div>
                        ) : (
                          <div className="mb-3 p-2 bg-red-100 rounded">
                            <p className="text-xs text-red-600">No image data available</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              console.log('Downloading file:', file.name, 'Data available:', !!file.data, 'Data length:', file.data?.length)
                              // Create a download link for the file
                              const link = document.createElement('a')
                              link.href = file.data || `data:${file.type};base64,`
                              link.download = file.name
                              link.click()
                            }}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 cursor-pointer flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Copies Instructions */}
              {selectedOrder.product_name === 'Color Copies' && selectedOrder.front_side_instructions && (
                <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Designer Instructions</h3>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-gray-700">{selectedOrder.front_side_instructions}</p>
                  </div>
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
              {(selectedOrder.area_instructions?.length || 0) > 0 && (
                <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Designer Instructions</h3>
                  {selectedOrder.area_instructions?.map((instruction, index) => (
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

      {/* Mobile Quote Details Modal */}
      {showQuoteModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Quote Details</h2>
                  <p className="text-gray-600 mt-1">Quote Reference: {selectedQuote.quote_reference}</p>
                </div>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{selectedQuote.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedQuote.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedQuote.customer_phone}</p>
                  </div>
                  {selectedQuote.customer_company && (
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium text-gray-900">{selectedQuote.customer_company}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">{selectedQuote.customer_address}</p>
                  </div>
                </div>
              </div>

              {/* Quote Information */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Quote Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-600">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQuoteStatusColor(selectedQuote.quote_status)}`}>
                      {selectedQuote.quote_status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Total Price</p>
                    <p className="font-medium text-blue-900">${selectedQuote.total_estimated_price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Expires</p>
                    <p className="font-medium text-blue-900">{new Date(selectedQuote.quote_expiry_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Quote Notes */}
              {selectedQuote.quote_notes && (
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Quote Notes</h3>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-gray-700">{selectedQuote.quote_notes}</p>
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              {selectedQuote.internal_notes && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4">Internal Notes</h3>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-gray-700">{selectedQuote.internal_notes}</p>
                  </div>
                </div>
              )}

              {/* Products */}
              {selectedQuote.quote_products && selectedQuote.quote_products.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
                  <div className="space-y-4">
                    {selectedQuote.quote_products.map((product, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{product.product_name}</h4>
                            <p className="text-sm text-gray-600">Category: {product.product_category}</p>
                            <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                            {product.size && <p className="text-sm text-gray-600">Size: {product.size}</p>}
                            {product.color && <p className="text-sm text-gray-600">Color: {product.color}</p>}
                            {product.print_type && <p className="text-sm text-gray-600">Print Type: {product.print_type}</p>}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${product.total_price.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">${product.unit_price.toFixed(2)} each</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedQuote.quote_attachments && selectedQuote.quote_attachments.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedQuote.quote_attachments.map((attachment, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{attachment.file_name}</p>
                            <p className="text-sm text-gray-600">
                              {(attachment.file_size / 1024 / 1024).toFixed(2)} MB • {attachment.attachment_type}
                            </p>
                          </div>
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
        </div>      </SidebarInset>
    </SidebarProvider>
  )
}