import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import useAuthStore from '../../store/authStore'
import paymentService from '../../services/paymentService'
import { mockDemos } from '../../services/mockData'
import Topbar from '../../components/layout/Topbar'

const SubscriptionSelection = ({ paymentStatus }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [demoInfo, setDemoInfo] = useState(null)
  
  // Get paymentStatus from location state or props
  const paymentStatusData = paymentStatus || location.state?.paymentStatus

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load subscription plans
        const availablePlans = await paymentService.getPlans()
        setPlans(availablePlans)

        // Load demo information if available
        if (user?.email) {
          const demo = mockDemos.find(d => d.parent_email === user.email && d.status === 'ATTENDED')
          if (demo) {
            setDemoInfo(demo)
            // Auto-select recommended plan if available
            if (demo.recommended_student_type) {
              const recommendedPlanId = demo.recommended_student_type === '1-1' ? '1-1' : 'group'
              setSelectedPlan(recommendedPlanId)
            }
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading plans:', error)
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId)
  }

  const handleProceedToPayment = async () => {
    if (!selectedPlan) {
      alert('Please select a subscription plan')
      return
    }

    setProcessing(true)
    try {
      // Navigate to payment page with selected plan
      navigate(`/customer/payment?plan=${selectedPlan}`)
    } catch (error) {
      console.error('Error proceeding to payment:', error)
      setProcessing(false)
    }
  }

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`
  
  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isRecommendedPlan = (planId) => {
    if (!demoInfo?.recommended_student_type) return false
    return (planId === '1-1' && demoInfo.recommended_student_type === '1-1') ||
           (planId === 'group' && demoInfo.recommended_student_type === 'group')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-gray-500">Loading subscription plans...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Topbar />
      <div className="p-6">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
              Choose Your Subscription Plan
            </h1>
            <p className="text-gray-600">
              Great! Your demo is complete. Select a plan to continue your chess journey.
            </p>
          </div>

          {/* Enhanced Demo Status Display */}
          {paymentStatusData?.demoCompleted && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-secondary font-bold text-green-800 mb-2">
                    Demo Session Completed
                  </h3>
                  
                  {demoInfo && (
                    <div className="space-y-2 text-sm">
                      {demoInfo.scheduled_start && (
                        <p className="text-green-700">
                          <span className="font-semibold">Completed on:</span>{' '}
                          {formatDate(demoInfo.scheduled_start)}
                        </p>
                      )}
                      
                      {demoInfo.recommended_student_type && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                          <p className="font-semibold text-green-900 mb-1">
                            🎯 Recommendation from Demo:
                          </p>
                          <p className="text-green-800">
                            <span className="font-medium">
                              {demoInfo.recommended_student_type === '1-1' 
                                ? '1-on-1 Coaching' 
                                : 'Group Coaching'}
                            </span>
                            {demoInfo.recommended_level && (
                              <> • Recommended Level: <span className="font-medium">{demoInfo.recommended_level}</span></>
                            )}
                          </p>
                        </div>
                      )}
                      
                      {demoInfo.admin_notes && (
                        <div className="mt-2 p-3 bg-white rounded-lg border border-green-200">
                          <p className="font-semibold text-green-900 mb-1">📝 Notes:</p>
                          <p className="text-green-800 italic">{demoInfo.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {paymentStatusData?.demoCompletedAt && !demoInfo && (
                    <p className="text-green-700">
                      Completed on: {formatDate(paymentStatusData.demoCompletedAt)}
                    </p>
                  )}
                  
                  <p className="text-green-700 mt-3 font-medium">
                    Now choose a subscription plan to get started with your chess learning journey!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Subscription Plans with Recommendations */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isRecommended = isRecommendedPlan(plan.plan_id)
              const isSelected = selectedPlan === plan.plan_id
              
              return (
                <Card
                  key={plan.plan_id}
                  className={`cursor-pointer transition-all relative ${
                    isSelected
                      ? 'ring-4 ring-orange border-2 border-orange shadow-lg'
                      : 'hover:shadow-medium border-2 border-transparent'
                  } ${isRecommended ? 'bg-gradient-to-br from-orange-50 to-white' : ''}`}
                  onClick={() => handlePlanSelect(plan.plan_id)}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                        RECOMMENDED
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6 pt-4">
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

                  {/* Selection Indicator */}
                  <div className="text-center pt-4 border-t border-gray-200">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mx-auto transition-all ${
                        isSelected
                          ? 'bg-orange border-orange'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    {isSelected && (
                      <p className="text-sm text-orange font-medium mt-2">Selected</p>
                    )}
                    {isRecommended && !isSelected && (
                      <p className="text-sm text-gray-500 mt-2">Recommended for you</p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Action Section */}
          <div className="text-center max-w-2xl mx-auto">
            {selectedPlan && (
              <div className="mb-4 p-4 bg-navy text-white rounded-lg">
                <p className="font-semibold">
                  Selected Plan: {plans.find(p => p.plan_id === selectedPlan)?.name}
                </p>
                <p className="text-sm text-white/80 mt-1">
                  Total: {formatCurrency(plans.find(p => p.plan_id === selectedPlan)?.price || 0)}/month
                </p>
              </div>
            )}
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleProceedToPayment}
              disabled={!selectedPlan || processing}
              className="px-12"
            >
              {processing ? 'Processing...' : 'Proceed to Payment'}
            </Button>
            
            {!selectedPlan && (
              <p className="text-sm text-gray-500 mt-4">
                Please select a subscription plan to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionSelection