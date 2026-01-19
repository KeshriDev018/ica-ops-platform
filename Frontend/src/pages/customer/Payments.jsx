import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import useAuthStore from '../../store/authStore'
import subscriptionService from '../../services/subscriptionService'
import { format } from 'date-fns'

const CustomerPayments = () => {
  const { user } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const accountSubscriptions = await subscriptionService.getByAccountId(user.account_id)
        setSubscriptions(accountSubscriptions)
      } catch (error) {
        console.error('Error loading payment data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user?.account_id) {
      loadData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  const activeSubscription = subscriptions.find(s => s.status === 'ACTIVE')
  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Payments</h1>
        <p className="text-gray-600">Manage your subscription and payment history</p>
      </div>

      {/* Active Subscription */}
      {activeSubscription && (
        <Card className="bg-gradient-to-r from-navy to-navy/90 text-white border-none">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-secondary font-bold mb-2">Active Subscription</h2>
              <p className="text-white/80">Your current membership plan</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeSubscription.status === 'ACTIVE' ? 'bg-green-500 text-white' : 
              'bg-gray-500 text-white'
            }`}>
              {activeSubscription.status}
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-white/80 mb-1">Monthly Amount</p>
              <p className="text-3xl font-bold">{formatCurrency(activeSubscription.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-white/80 mb-1">Billing Cycle</p>
              <p className="text-xl font-semibold capitalize">{activeSubscription.billing_cycle}</p>
            </div>
            <div>
              <p className="text-sm text-white/80 mb-1">Next Payment</p>
              <p className="text-xl font-semibold">
                {format(new Date(activeSubscription.next_due_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">Payment History</h2>
        {subscriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Billing Cycle</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Started</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Next Due</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.subscription_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900 capitalize">{subscription.plan_id}</td>
                    <td className="py-3 px-4 text-sm font-medium text-navy">{formatCurrency(subscription.amount)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 capitalize">{subscription.billing_cycle}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        subscription.status === 'PAST_DUE' ? 'bg-red-100 text-red-800' :
                        subscription.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(subscription.started_at), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {subscription.next_due_at ? format(new Date(subscription.next_due_at), 'MMM d, yyyy') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-gray-500 text-lg">No payment history found.</p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default CustomerPayments
