import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import useDemoStore from '../../store/demoStore'
import demoAccountService from '../../services/demoAccountService'
import paymentService from '../../services/paymentService'
import { format } from 'date-fns'

const AccessDemoAccount = () => {
  const navigate = useNavigate()
  const { demoData, demoEmail, hasDemoAccess } = useDemoStore()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [meetingLink, setMeetingLink] = useState(null)

  useEffect(() => {
    // Check if user has demo access
    if (!hasDemoAccess()) {
      // Redirect to demo login if no access
      navigate('/demo-login', { replace: true })
      return
    }

    const loadData = async () => {
      try {
        // Load subscription plans
        const availablePlans = await paymentService.getPlans()
        setPlans(availablePlans)

        // Get demo meeting link if available
        if (demoData?.demo_id) {
          const link = await demoAccountService.getDemoMeetingLink(demoData.demo_id)
          setMeetingLink(link)
        }
      } catch (error) {
        console.error('Error loading demo account data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [demoData, demoEmail, hasDemoAccess, navigate])

  const handlePlanSelect = (planId) => {
    // Navigate to demo payment with selected plan
    navigate(`/demo-payment?plan=${planId}`)
  }

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`

  const formatDateTime = (dateString) => {
    if (!dateString) return 'To be confirmed'
    const date = new Date(dateString)
    return format(date, 'EEEE, MMMM d, yyyy • h:mm a')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-gray-500">Loading demo account...</div>
      </div>
    )
  }

  if (!demoData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-secondary font-bold text-navy mb-4">
            No Demo Data Found
          </h2>
          <p className="text-gray-600 mb-6">
            Please book a demo first or login with your demo email.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/book-demo')} className="flex-1">
              Book Demo
            </Button>
            <Button variant="primary" onClick={() => navigate('/demo-login')} className="flex-1">
              Demo Login
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-secondary font-bold text-navy mb-3">
            Your Demo Account
          </h1>
          <p className="text-gray-600 text-lg">
            Access your demo session details and make payment to unlock full features
          </p>
        </div>

        {/* Demo Information */}
        <Card className="bg-gradient-to-r from-navy to-navy/90 text-white">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-secondary font-bold mb-4">Demo Session Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/80 mb-1">Student Name</p>
                  <p className="text-lg font-semibold">{demoData.student_name}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Parent Name</p>
                  <p className="text-lg font-semibold">{demoData.parent_name}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Email</p>
                  <p className="text-lg font-semibold">{demoData.parent_email}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Preferred Language</p>
                  <p className="text-lg font-semibold">{demoData.preferred_language || 'English'}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-secondary font-bold mb-4">Schedule</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/80 mb-1">Demo Date & Time</p>
                  <p className="text-lg font-semibold">{formatDateTime(demoData.scheduled_start)}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Timezone</p>
                  <p className="text-lg font-semibold">{demoData.timezone}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    demoData.status === 'BOOKED' ? 'bg-blue-500 text-white' :
                    demoData.status === 'ATTENDED' ? 'bg-green-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {demoData.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Demo Meeting Link */}
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl">🎓</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-secondary font-bold text-orange-900 mb-2">
                Attend Your Demo Session
              </h3>
              {meetingLink ? (
                <>
                  <p className="text-orange-800 mb-4">
                    Your demo session link is ready. Click below to join at the scheduled time.
                  </p>
                  <a
                    href={meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button variant="primary" size="lg">
                      Join Demo Session
                    </Button>
                  </a>
                </>
              ) : (
                <p className="text-orange-800">
                  Your demo meeting link will be shared by our team before the scheduled session time.
                  Please check your email or contact support.
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Payment Status */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-secondary font-bold text-navy">Payment Status</h3>
              <p className="text-gray-600 text-sm">Complete payment to unlock full account access</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              demoData.payment_status === 'PAID' ? 'bg-green-100 text-green-800' :
              demoData.payment_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {demoData.payment_status || 'PENDING'}
            </span>
          </div>
          {demoData.payment_status !== 'PAID' && (
            <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
              💡 <strong>Tip:</strong> Make payment now to receive your password setup email immediately and get instant access to your learning dashboard!
            </p>
          )}
        </Card>

        {/* Subscription Plans */}
        {demoData.payment_status !== 'PAID' && (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-secondary font-bold text-navy mb-2">
                Choose Your Learning Plan
              </h2>
              <p className="text-gray-600">
                Select a plan and make payment to continue your chess journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.plan_id}
                  className="hover:shadow-lg transition-all cursor-pointer border-2 border-gray-200 hover:border-orange"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-secondary font-bold text-navy mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-4xl font-bold text-navy mb-1">
                      {formatCurrency(plan.price)}
                      <span className="text-lg font-normal text-gray-600">/month</span>
                    </div>
                    <p className="text-sm text-gray-500 capitalize">{plan.billing_cycle} billing</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-olive mr-2 font-bold text-lg flex-shrink-0">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handlePlanSelect(plan.plan_id)}
                    className="w-full"
                  >
                    Select & Pay {formatCurrency(plan.price)}
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Already Paid Message */}
        {demoData.payment_status === 'PAID' && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-4xl">✓</span>
              </div>
              <h3 className="text-2xl font-secondary font-bold text-green-900 mb-3">
                Payment Complete!
              </h3>
              <p className="text-green-800 text-lg mb-4">
                Your account has been activated. Login to access your full dashboard.
              </p>
              <div className="space-y-3 max-w-md mx-auto">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Login to Main Dashboard
                </Button>
                <p className="text-green-700 text-sm">
                  Use your email (<strong>{demoData.parent_email}</strong>) and the password you set up to login.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AccessDemoAccount
