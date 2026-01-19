import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import useAuthStore from '../../store/authStore'
import paymentService from '../../services/paymentService'
import SubscriptionSelection from './SubscriptionSelection'
import Topbar from '../../components/layout/Topbar'

const PaymentCheck = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSubscriptionSelection, setShowSubscriptionSelection] = useState(false)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        if (!user?.account_id) {
          navigate('/login')
          return
        }

        const status = await paymentService.checkStatus(user.account_id)
        setPaymentStatus(status)

        // If already has active subscription, redirect to dashboard
        if (status.hasSubscription) {
          navigate('/customer/dashboard', { replace: true })
          return
        }

        // If demo completed, show subscription selection
        if (status.demoCompleted) {
          setShowSubscriptionSelection(true)
        }

        setLoading(false)
      } catch (error) {
        console.error('Error checking payment status:', error)
        setLoading(false)
      }
    }

    checkPaymentStatus()
  }, [user, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Checking payment status...</div>
      </div>
    )
  }

  // If demo completed, show subscription selection
  if (showSubscriptionSelection && paymentStatus?.demoCompleted) {
    return <SubscriptionSelection paymentStatus={paymentStatus} />
  }

  // If no demo completed, show message to complete demo first
  return (
    <div className="min-h-screen bg-cream">
      <Topbar />
      <div className="p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          <Card className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-yellow-600 text-4xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-4">
            Complete Demo First
          </h1>
          <p className="text-gray-600 mb-6 text-lg">
            To access your dashboard and start learning, please complete your free demo session first.
          </p>
          <p className="text-gray-500 mb-8">
            After attending your demo, you'll be able to select a subscription plan and begin your chess journey with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" onClick={() => navigate('/book-demo')}>
              Book a Demo
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </Card>
        </div>
      </div>
    </div>
  )
}

export default PaymentCheck
