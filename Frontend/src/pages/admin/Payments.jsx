import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import subscriptionService from '../../services/subscriptionService'
import { format } from 'date-fns'

const AdminPayments = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const loadData = async () => {
      try {
        const allSubscriptions = await subscriptionService.getAll()
        setSubscriptions(allSubscriptions)
      } catch (error) {
        console.error('Error loading payments:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-gray-500">Loading...</div></div>
  }

  const filteredSubscriptions = filter === 'all' 
    ? subscriptions 
    : subscriptions.filter(s => s.status === filter)

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Payments</h1>
        <p className="text-gray-600">Manage all subscriptions and payments</p>
      </div>

      <Card>
        <div className="flex gap-2 mb-4">
          {['all', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status ? 'bg-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')} ({status === 'all' ? subscriptions.length : subscriptions.filter(s => s.status === status).length})
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Account ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Next Due</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.subscription_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{sub.account_id}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 capitalize">{sub.plan_id}</td>
                  <td className="py-3 px-4 text-sm font-medium text-navy">{formatCurrency(sub.amount)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      sub.status === 'PAST_DUE' ? 'bg-red-100 text-red-800' :
                      sub.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {sub.next_due_at ? format(new Date(sub.next_due_at), 'MMM d, yyyy') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AdminPayments
