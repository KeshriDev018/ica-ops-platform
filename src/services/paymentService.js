// Mock payment service - matches backend API structure
import { mockAccounts, mockSubscriptions, mockDemos } from './mockData'

const paymentService = {
  // Check payment status for an account
  checkStatus: async (accountId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const account = mockAccounts.find(acc => acc.account_id === accountId)
    if (!account) {
      throw new Error('Account not found')
    }
    
    // Find subscription for this account
    const subscription = mockSubscriptions.find(sub => sub.account_id === accountId)
    
    // Find demo for this account (by email)
    const demo = mockDemos.find(d => d.parent_email === account.email)
    
    return {
      account_id: accountId,
      status: subscription?.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING_PAYMENT',
      hasSubscription: !!subscription && subscription.status === 'ACTIVE',
      demoCompleted: demo?.status === 'ATTENDED' || demo?.status === 'CONVERTED',
      demoCompletedAt: demo?.status === 'ATTENDED' ? demo.scheduled_start : null,
      subscription: subscription || null
    }
  },
  
  // Get subscription plans
  getPlans: async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [
      {
        plan_id: '1-1',
        name: 'Personalized 1-on-1 Coaching',
        price: 2999,
        billing_cycle: 'monthly',
        features: [
          '8 personalized sessions per month',
          'Customized learning plan',
          'Dedicated coach assignment',
          'Flexible scheduling',
          'Progress tracking & reports',
          'Tournament preparation'
        ]
      },
      {
        plan_id: 'group',
        name: 'Engaging Group Coaching',
        price: 1499,
        billing_cycle: 'monthly',
        features: [
          '12 group sessions per month',
          'Small batches (max 6 students)',
          'Age & skill-based grouping',
          'Interactive learning environment',
          'Peer learning & practice games',
          'Monthly tournaments'
        ]
      }
    ]
  },
  
  // Create subscription (after payment)
  createSubscription: async (accountId, planId) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const plans = await paymentService.getPlans()
    const plan = plans.find(p => p.plan_id === planId)
    
    if (!plan) {
      throw new Error('Invalid plan selected')
    }
    
    const newSubscription = {
      subscription_id: `sub-${Date.now()}`,
      account_id: accountId,
      plan_id: planId,
      amount: plan.price,
      billing_cycle: plan.billing_cycle,
      status: 'ACTIVE',
      started_at: new Date().toISOString(),
      next_due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    }
    
    // In real app, this would be saved to backend
    // For mock, we'll simulate success
    return newSubscription
  },
  
  // Process demo account payment
  processDemoPayment: async (email, planId, paymentDetails) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // TODO: Backend integration
    // const response = await api.post('/api/payments/demo-payment', {
    //   email,
    //   plan_id: planId,
    //   payment_details: paymentDetails
    // })
    // return response.data
    
    // Mock payment processing
    return {
      success: true,
      payment_id: `PAY_${Date.now()}`,
      message: 'Payment successful'
    }
  },

  // Send password setup email after payment
  sendPasswordSetupEmail: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // TODO: Backend integration
    // const response = await api.post('/api/auth/send-password-setup', { email })
    // return response.data
    
    // Mock email sending
    return {
      success: true,
      message: 'Password setup email sent',
      token: `TOKEN_${Date.now()}`
    }
  },

  // Process payment (mock - will be replaced with real payment gateway)
  processPayment: async (accountId, planId, paymentDetails) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate payment processing
    // In real app, this would call payment gateway (Razorpay, Stripe, etc.)
    
    // Create subscription after successful payment
    const subscription = await paymentService.createSubscription(accountId, planId)
    
    return {
      success: true,
      payment_id: `pay-${Date.now()}`,
      subscription: subscription,
      message: 'Payment processed successfully'
    }
  }
}

export default paymentService
