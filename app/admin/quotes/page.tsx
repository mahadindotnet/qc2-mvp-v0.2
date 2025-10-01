'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail,
  FileText,
  DollarSign,
  Package,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Quote {
  id: string
  quote_reference: string
  quote_status: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_company: string
  quote_notes: string
  internal_notes: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  created_at: string
  quote_expiry_date: string
  quote_sent_at: string
  quote_accepted_at: string
  quote_rejected_at: string
  quote_follow_up_date: string
  converted_to_order_id: string
  conversion_date: string
  quote_products: Array<{
    id: string
    product_name: string
    product_category: string
    quantity: number
    size: string
    color: string
    print_type: string
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
    description: string
  }>
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
  converted: 'bg-purple-100 text-purple-800'
}

const STATUS_ICONS = {
  pending: Clock,
  sent: Mail,
  accepted: CheckCircle,
  rejected: XCircle,
  expired: AlertCircle,
  converted: Package
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Fetch quotes
  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes')
      const data = await response.json()
      
      if (response.ok) {
        setQuotes(data.quotes || [])
        setLastRefresh(new Date())
      } else {
        toast.error('Failed to fetch quotes')
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
      toast.error('Error fetching quotes')
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh
  useEffect(() => {
    fetchQuotes()
    
    if (autoRefresh) {
      const interval = setInterval(fetchQuotes, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Filter quotes
  useEffect(() => {
    let filtered = quotes

    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.quote_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.customer_company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.quote_status === statusFilter)
    }

    setFilteredQuotes(filtered)
  }, [quotes, searchTerm, statusFilter])

  // Update quote status
  const updateQuoteStatus = async (quoteId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_status: newStatus })
      })

      if (response.ok) {
        toast.success(`Quote status updated to ${newStatus}`)
        fetchQuotes()
      } else {
        toast.error('Failed to update quote status')
      }
    } catch (error) {
      console.error('Error updating quote status:', error)
      toast.error('Error updating quote status')
    }
  }

  // Delete quote
  const deleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return

    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Quote deleted successfully')
        fetchQuotes()
      } else {
        toast.error('Failed to delete quote')
      }
    } catch (error) {
      console.error('Error deleting quote:', error)
      toast.error('Error deleting quote')
    }
  }

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedQuotes.length === 0) {
      toast.error('Please select quotes first')
      return
    }

    try {
      for (const quoteId of selectedQuotes) {
        if (action === 'delete') {
          await deleteQuote(quoteId)
        } else if (action.startsWith('status:')) {
          const newStatus = action.split(':')[1]
          await updateQuoteStatus(quoteId, newStatus)
        }
      }
      
      setSelectedQuotes([])
      setShowBulkActions(false)
      toast.success(`Bulk action completed: ${action}`)
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Error performing bulk action')
    }
  }

  // Export quotes
  const exportQuotes = () => {
    const csvContent = [
      ['Quote Reference', 'Status', 'Customer Name', 'Customer Email', 'Customer Phone', 'Company', 'Total Amount', 'Created At', 'Expiry Date'],
      ...filteredQuotes.map(quote => [
        quote.quote_reference,
        quote.quote_status,
        quote.customer_name,
        quote.customer_email,
        quote.customer_phone,
        quote.customer_company || '',
        quote.total_amount,
        new Date(quote.created_at).toLocaleDateString(),
        new Date(quote.quote_expiry_date).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quotes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock
    return <IconComponent className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quote Management</h1>
              <p className="text-gray-600 mt-2">
                Manage customer quotes and track their progress
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
              <button
                onClick={fetchQuotes}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={exportQuotes}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quotes.filter(q => q.quote_status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quotes.filter(q => q.quote_status === 'sent').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quotes.filter(q => q.quote_status === 'accepted').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(quotes.reduce((sum, q) => sum + q.total_amount, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search quotes by name, email, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedQuotes.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-orange-800 font-medium">
                {selectedQuotes.length} quote(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <select
                  onChange={(e) => handleBulkAction(e.target.value)}
                  className="px-3 py-1 border border-orange-300 rounded text-sm"
                >
                  <option value="">Bulk Actions</option>
                  <option value="status:sent">Mark as Sent</option>
                  <option value="status:accepted">Mark as Accepted</option>
                  <option value="status:rejected">Mark as Rejected</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={() => setSelectedQuotes([])}
                  className="text-orange-600 hover:text-orange-800"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quotes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedQuotes.length === filteredQuotes.length && filteredQuotes.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuotes(filteredQuotes.map(q => q.id))
                        } else {
                          setSelectedQuotes([])
                        }
                      }}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedQuotes.includes(quote.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuotes([...selectedQuotes, quote.id])
                          } else {
                            setSelectedQuotes(selectedQuotes.filter(id => id !== quote.id))
                          }
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {quote.quote_reference}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quote.quote_products.length} product(s)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {quote.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quote.customer_email}
                        </div>
                        {quote.customer_company && (
                          <div className="text-sm text-gray-500">
                            {quote.customer_company}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[quote.quote_status as keyof typeof STATUS_COLORS]}`}>
                        {getStatusIcon(quote.quote_status)}
                        <span className="ml-1 capitalize">{quote.quote_status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(quote.total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(quote.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(quote.quote_expiry_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {/* View quote details */}}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <select
                          value={quote.quote_status}
                          onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="sent">Sent</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="expired">Expired</option>
                          <option value="converted">Converted</option>
                        </select>
                        <button
                          onClick={() => deleteQuote(quote.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Quote"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quotes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No quotes have been submitted yet.'
              }
            </p>
          </div>
        )}

        {/* Last Refresh Info */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
          {autoRefresh && (
            <span className="ml-2 text-green-600">• Auto-refresh active</span>
          )}
        </div>
      </div>
    </div>
  )
}
