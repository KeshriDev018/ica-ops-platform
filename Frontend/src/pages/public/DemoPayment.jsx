import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import FormInput from '../../components/forms/FormInput'
import { paymentSchema } from '../../utils/validationSchemas'
import useDemoStore from '../../store/demoStore'
import demoAccountService from '../../services/demoAccountService'
import paymentService from '../../services/paymentService'
import Topbar from '../../components/layout/Topbar'

const DemoPayment = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { demoData, updateDemoPaymentStatus } = useDemoStore()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  
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
      if (!demoData) {
        navigate('/demo-login', { replace: true })
        return
      }

      try {
        const planId = searchParams.get('plan')
        if (!planId) {
          navigate('/demo-access')
          return
        }

        const plans = await paymentService.getPlans()
        const selectedPlan = plans.find(p => p.plan_id === planId)
        
        if (!selectedPlan) {
          navigate('/demo-access')
          return
        }

        setPlan(selectedPlan)
        setLoading(false)
      } catch (error) {
        console.error('Error loading plan:', error)
        navigate('/demo-access')
      }
    }

    loadPlan()
  }, [searchParams, navigate, demoData])

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
    if (!plan || !demoData) return

    setPaymentProcessing(true)

    try {
      // TODO: When backend is connected, use Razorpay integration
      // Step 1: Create Razorpay order
      // const razorpayOrder = await demoAccountService.initiateRazorpayPayment(
      //   demoData.parent_email,
      //   plan.plan_id,
      //   plan.price
      // )
      
      // Step 2: Open Razorpay checkout
      // const options = {
      //   key: razorpayOrder.razorpay_key,
      //   amount: razorpayOrder.amount,
      //   currency: razorpayOrder.currency,
      //   order_id: razorpayOrder.order_id,
      //   name: 'Indian Chess Academy',
      //   description: plan.name,
      //   handler: async function (response) {
      //     // Verify payment on backend
      //     await demoAccountService.verifyRazorpayPayment(response)
      //   }
      // }
      // const razorpay = new window.Razorpay(options)
      // razorpay.open()

      // Mock payment processing
      const result = await demoAccountService.processDemoPayment(
        demoData.parent_email,
        plan.plan_id,
        data
      )

      if (result.success) {
        // Update demo payment status in store
        updateDemoPaymentStatus('PAID')
        
        // Show success message
        alert('Payment successful! Password setup email has been sent to your email address.')
        
        // Navigate to confirmation page
        navigate('/demo-payment-success', { 
          state: { 
            email: demoData.parent_email,
            planName: plan.name 
          } 
        })
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
    } finally {
      setPaymentProcessing(false)
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

  if (!plan || !demoData) {
    return null
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-navy text-white py-4 px-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-secondary font-bold">Demo Payment</h1>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-secondary font-bold text-navy mb-2">
              Complete Your Payment
            </h2>
            <p className="text-gray-600">
              After payment, you'll receive a password setup email to activate your account
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Payment Form */}
            <Card>
              <h3 className="text-xl font-secondary font-bold text-navy mb-6">Payment Details</h3>
              
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
                    disabled={isSubmitting || paymentProcessing}
                  >
                    {paymentProcessing ? 'Processing Payment...' : `Pay ${formatCurrency(plan.price)}`}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  🔒 This is a mock payment. In production, this will integrate with Razorpay payment gateway.
                </p>
              </form>
            </Card>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="bg-gray-50">
                <h3 className="text-xl font-secondary font-bold text-navy mb-6">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold text-navy">{plan.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="font-semibold text-navy capitalize">{plan.billing_cycle}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-600">Email</span>
                    <span className="font-semibold text-navy text-sm">{demoData.parent_email}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-lg font-semibold text-navy">Total Amount</span>
                    <span className="text-2xl font-bold text-navy">{formatCurrency(plan.price)}</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📧</span>
                  What Happens Next?
                </h4>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">1.</span>
                    <span>Payment confirmation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">2.</span>
                    <span>Password setup email sent to <strong>{demoData.parent_email}</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">3.</span>
                    <span>Click email link to set your password</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">4.</span>
                    <span>Access your full account dashboard</span>
                  </li>
                </ol>
              </Card>

              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/demo-access')}
                  disabled={paymentProcessing}
                >
                  ← Back to Demo Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoPayment
