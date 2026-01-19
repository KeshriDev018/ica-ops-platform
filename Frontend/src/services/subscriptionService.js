import { mockSubscriptions } from './mockData'

let subscriptions = [...mockSubscriptions]

const subscriptionService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return subscriptions
  },
  
  getByAccountId: async (accountId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return subscriptions.filter(s => s.account_id === accountId)
  },
  
  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const subscription = subscriptions.find(s => s.subscription_id === id)
    if (!subscription) throw new Error('Subscription not found')
    return subscription
  },
  
  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newSubscription = {
      subscription_id: `sub-${Date.now()}`,
      ...data
    }
    subscriptions.push(newSubscription)
    return newSubscription
  },
  
  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const subscription = subscriptions.find(s => s.subscription_id === id)
    if (!subscription) throw new Error('Subscription not found')
    Object.assign(subscription, data)
    return subscription
  }
}

export default subscriptionService
