'use client'

import React, { useEffect, useState } from 'react'

declare global {
  interface Window {
    Square?: any
  }
}

interface SquarePaymentFormProps {
  amount: number
  onPaymentSuccess: (result: any) => void
  onPaymentError: (error: any) => void
}

export default function SquarePaymentForm({
  amount,
  onPaymentSuccess,
  onPaymentError,
}: SquarePaymentFormProps) {
  const [card, setCard] = useState<any>(null)
  const [applePay, setApplePay] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cardErrors, setCardErrors] = useState<string>('')

  useEffect(() => {
    const initializeSquare = async () => {
      if (!window.Square) {
        throw new Error('Square.js failed to load properly')
      }

      const payments = window.Square.payments(
        process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
      )

      // Initialize Card payment
      try {
        const cardInstance = await payments.card({
          style: {
            '.input-container': {
              borderColor: '#D1D5DB',
              borderRadius: '8px',
            },
            '.input-container.is-focus': {
              borderColor: '#D4AF37',
            },
            '.message-text': {
              color: '#DC2626',
            },
          }
        })
        await cardInstance.attach('#card-container')
        setCard(cardInstance)
      } catch (e) {
        console.error('Initializing Card failed', e)
      }

      // Initialize Apple Pay if supported
      try {
        const paymentRequest = payments.paymentRequest({
          countryCode: 'US',
          currencyCode: 'USD',
          total: {
            amount: amount.toFixed(2),
            label: 'Intervised Service',
          },
        })

        const applePayInstance = await payments.applePay(paymentRequest)
        setApplePay(applePayInstance)

        const applePayButton = document.getElementById('apple-pay-button')
        if (applePayButton) {
          applePayButton.addEventListener('click', async (event) => {
            event.preventDefault()
            await handlePaymentMethod(applePayInstance)
          })
        }
      } catch (e) {
        console.log('Apple Pay not available', e)
      }
    }

    initializeSquare()
  }, [amount])

  const handlePaymentMethod = async (paymentMethod: any) => {
    setIsLoading(true)
    setCardErrors('')

    try {
      const result = await paymentMethod.tokenize()

      if (result.status === 'OK') {
        // Send token to backend
        const response = await fetch('/api/square/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: result.token,
            amount: amount,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          onPaymentSuccess(data)
        } else {
          throw new Error(data.error || 'Payment failed')
        }
      } else {
        let errorMessage = 'Tokenization failed'
        if (result.errors) {
          errorMessage = result.errors.map((error: any) => error.message).join(', ')
        }
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      setCardErrors(error.message)
      onPaymentError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardPayment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!card) {
      setCardErrors('Card not initialized')
      return
    }
    await handlePaymentMethod(card)
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="text-center pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-3xl font-bold text-deep-blue">${amount.toFixed(2)}</p>
        </div>

        <form onSubmit={handleCardPayment} className="space-y-4">
          {/* Apple Pay Button */}
          {applePay && (
            <button
              id="apple-pay-button"
              type="button"
              className="w-full h-12 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Pay</span>
            </button>
          )}

          {/* Divider */}
          {applePay && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or pay with card</span>
              </div>
            </div>
          )}

          {/* Card Container */}
          <div
            id="card-container"
            className="min-h-[120px] border border-gray-300 rounded-lg p-4"
          ></div>

          {/* Error Message */}
          {cardErrors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{cardErrors}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !card}
            className="w-full px-6 py-3 bg-deep-blue text-white rounded-lg font-semibold hover:bg-deep-blue-hover transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-deep-blue/30"
          >
            {isLoading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </button>
        </form>
      </div>

      <p className="text-xs text-center text-gray-500">
        Secure payment powered by Square
      </p>
    </div>
  )
}
