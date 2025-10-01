'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface PayPalButtonProps {
  amount: number
  orderId: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
}

interface PayPalActions {
  order: {
    create: (orderData: PayPalOrderData) => Promise<string>
    capture: () => Promise<PayPalOrder>
  }
}

interface PayPalOrderData {
  purchase_units: Array<{
    amount: {
      value: string
      currency_code: string
    }
    description: string
  }>
}

interface PayPalOrder {
  id: string
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string
      }>
    }
  }>
}

interface PayPalButtonConfig {
  createOrder: (data: unknown, actions: PayPalActions) => Promise<string>
  onApprove: (data: unknown, actions: PayPalActions) => Promise<void>
  onError: (err: unknown) => void
  style: {
    layout: string
    color: string
    shape: string
    label: string
  }
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: PayPalButtonConfig) => {
        render: (element: HTMLDivElement) => void
      }
    }
  }
}

export default function PayPalButton({ amount, orderId, onSuccess, onError }: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`
    script.async = true
    
    script.onload = () => {
      if (window.paypal && paypalRef.current) {
        window.paypal.Buttons({
          createOrder: async (data: unknown, actions: PayPalActions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount.toFixed(2),
                  currency_code: 'USD'
                },
                description: `Custom T-Shirt Order #${orderId}`
              }]
            })
          },
          onApprove: async (data: unknown, actions: PayPalActions) => {
            try {
              const order = await actions.order.capture()
              
              // Update order with payment details
              const response = await fetch(`/api/orders/${orderId}/payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  paymentId: order.id,
                  status: 'paid',
                  paymentMethod: 'PayPal',
                  transactionId: order.purchase_units[0].payments.captures[0].id
                })
              })
              
              if (response.ok) {
                onSuccess(order.id)
                toast.success('Payment successful!', {
                  description: 'Your order has been confirmed and payment processed.',
                  duration: 5000,
                })
              } else {
                throw new Error('Failed to update order payment status')
              }
            } catch (error) {
              console.error('Payment error:', error)
              onError('Payment processing failed. Please try again.')
              toast.error('Payment failed', {
                description: 'There was an error processing your payment. Please try again.',
                duration: 5000,
              })
            }
          },
          onError: (err: unknown) => {
            console.error('PayPal error:', err)
            onError('Payment was cancelled or failed.')
            toast.error('Payment cancelled', {
              description: 'Payment was cancelled or failed. Please try again.',
              duration: 5000,
            })
          },
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          }
        }).render(paypalRef.current)
      }
    }
    
    document.body.appendChild(script)
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [amount, orderId, onSuccess, onError])

  return (
    <div className="w-full">
      <div ref={paypalRef} className="w-full"></div>
    </div>
  )
}
