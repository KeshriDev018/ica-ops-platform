import { mockDemos } from './mockData'

const demoAccountService = {
  // Verify if demo exists for given email
  verifyDemoByEmail: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // TODO: Backend integration - Check if demo exists for this email
    // const response = await api.post('/api/demo-account/verify', { email })
    
    const demo = mockDemos.find(d => d.parent_email === email)
    
    if (!demo) {
      throw new Error('No demo booking found for this email')
    }
    
    return demo
  },
  
  // Get demo details by email
  getDemoByEmail: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // TODO: Backend integration
    // const response = await api.get(`/api/demo-account/${email}`)
    
    const demo = mockDemos.find(d => d.parent_email === email)
    
    if (!demo) {
      throw new Error('Demo not found')
    }
    
    return {
      ...demo,
      payment_status: demo.payment_status || 'PENDING',
      meeting_link: demo.meeting_link || null
    }
  },
  
  // Get demo meeting link
  getDemoMeetingLink: async (demoId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // TODO: Backend integration
    // const response = await api.get(`/api/demo-account/${demoId}/meeting-link`)
    
    const demo = mockDemos.find(d => d.demo_id === demoId)
    return demo?.meeting_link || null
  },
  
  // Process demo payment
  processDemoPayment: async (email, planId, paymentDetails) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // TODO: Backend integration - Razorpay payment
    // const response = await api.post('/api/demo-account/payment', {
    //   email,
    //   plan_id: planId,
    //   payment_details: paymentDetails
    // })
    
    // Mock successful payment
    return {
      success: true,
      payment_id: `pay-demo-${Date.now()}`,
      message: 'Payment processed successfully. Password setup email sent.',
      email_sent: true
    }
  },
  
  // Initiate Razorpay payment (stub for backend)
  initiateRazorpayPayment: async (email, planId, amount) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // TODO: Backend integration - Create Razorpay order
    // const response = await api.post('/api/demo-account/razorpay/create-order', {
    //   email,
    //   plan_id: planId,
    //   amount
    // })
    
    // Mock Razorpay order
    return {
      order_id: `order-demo-${Date.now()}`,
      amount: amount,
      currency: 'INR',
      razorpay_key: 'RAZORPAY_KEY_FROM_BACKEND' // Will come from backend
    }
  },
  
  // Verify Razorpay payment
  verifyRazorpayPayment: async (paymentData) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // TODO: Backend integration - Verify Razorpay signature
    // const response = await api.post('/api/demo-account/razorpay/verify', paymentData)
    
    return {
      success: true,
      verified: true,
      message: 'Payment verified successfully'
    }
  },

  // Upgrade demo account to full customer account
  upgradeDemoToFullAccount: async (email) => {
    try {
      // TODO: Backend integration
      // const response = await api.post('/api/demos/upgrade-account', { email })
      // return response.data
      
      // Mock account upgrade
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        success: true,
        account_id: `ACC_${Date.now()}`,
        message: 'Demo account upgraded to full account successfully'
      }
    } catch (error) {
      console.error('Error upgrading demo account:', error)
      throw error
    }
  }
}

export default demoAccountService
