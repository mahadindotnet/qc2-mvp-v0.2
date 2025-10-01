'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface PayPalButtonProps {
  amount: number
  orderId: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
}

declare global {
  interface Window {
    paypal?: any
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
          createOrder: (data: any, actions: any) => {
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
          onApprove: async (data: any, actions: any) => {
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
          onError: (err: any) => {
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
