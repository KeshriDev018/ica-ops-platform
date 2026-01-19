import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import FormInput from '../../components/forms/FormInput'
import { paymentSchema } from '../../utils/validationSchemas'
import useAuthStore from '../../store/authStore'
import paymentService from '../../services/paymentService'
import Topbar from '../../components/layout/Topbar'

const Payment = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch
  } = useForm({
    resolver: zodResolver(paymentSchema)
  })

  // Watch card number for formatting
  const cardNumberValue = watch('cardNumber')

  useEffect(() => {
    const loadPlan = async () => {
      if (!user) {
        navigate('/login', { replace: true })
        return
      }

      try {
        const planId = searchParams.get('plan')
        if (!planId) {
          navigate('/customer/payment-check')
          return
        }

        const plans = await paymentService.getPlans()
        const selectedPlan = plans.find(p => p.plan_id === planId)
        
        if (!selectedPlan) {
          navigate('/customer/payment-check')
          return
        }

        setPlan(selectedPlan)
        setLoading(false)
      } catch (error) {
        console.error('Error loading plan:', error)
        navigate('/customer/payment-check')
      }
    }

    loadPlan()
  }, [searchParams, navigate, user])

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted.slice(0, 19) // Max 19 chars (16 digits + 3 spaces)
  }

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
    }
    return cleaned
  }

  const onSubmit = async (data) => {
    if (!plan || !user) return

    try {
      // Process payment (mock - will be replaced with real payment gateway)
      const result = await paymentService.processPayment(
        user.account_id,
        plan.plan_id,
        data
      )

      if (result.success) {
        // Redirect to dashboard after successful payment
        alert('Payment successful! Redirecting to dashboard...')
        navigate('/customer/dashboard', { replace: true })
      } else {
        setError('root', {
          type: 'manual',
          message: 'Payment failed. Please try again.'
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError('root', {
        type: 'manual',
        message: error.message || 'Payment processing failed. Please try again.'
      })
    }
  }

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading payment details...</div>
      </div>
    )
  }

  if (!plan) {
    return null
  }

  return (
    <div className="min-h-screen bg-cream">
      <Topbar />
      <div className="p-6">
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
              Complete Payment
            </h1>
            <p className="text-gray-600">Complete your subscription payment to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Payment Form */}
            <Card>
              <h2 className="text-xl font-secondary font-bold text-navy mb-6">Payment Details</h2>
              
              {errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {errors.root.message}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormInput
                  id="cardholderName"
                  label="Cardholder Name"
                  placeholder="John Doe"
                  error={errors.cardholderName}
                  {...register('cardholderName')}
                />

                <FormInput
                  id="cardNumber"
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  error={errors.cardNumber}
                  {...register('cardNumber', {
                    onChange: (e) => {
                      e.target.value = formatCardNumber(e.target.value)
                    }
                  })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    id="expiryDate"
                    label="Expiry Date (MM/YY)"
                    placeholder="MM/YY"
                    maxLength={5}
                    error={errors.expiryDate}
                    {...register('expiryDate', {
                      onChange: (e) => {
                        e.target.value = formatExpiryDate(e.target.value)
                      }
                    })}
                  />

                  <FormInput
                    id="cvv"
                    label="CVV"
                    placeholder="123"
                    maxLength={4}
                    error={errors.cvv}
                    {...register('cvv')}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing Payment...' : `Pay ${formatCurrency(plan.price)}`}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  🔒 This is a mock payment. In production, this will integrate with a secure payment gateway.
                </p>
              </form>
            </Card>

            {/* Order Summary */}
            <Card className="bg-gray-50">
              <h2 className="text-xl font-secondary font-bold text-navy mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold text-navy">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Billing Cycle</span>
                  <span className="font-semibold text-navy capitalize">{plan.billing_cycle}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-semibold text-navy">Total Amount</span>
                  <span className="text-2xl font-bold text-navy">{formatCurrency(plan.price)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your subscription will start immediately after payment confirmation.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
