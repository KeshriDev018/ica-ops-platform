import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import studentService from '../../services/studentService'
import demoService from '../../services/demoService'
import subscriptionService from '../../services/subscriptionService'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeDemos: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  })
  const [recentDemos, setRecentDemos] = useState([])
  const [chartData, setChartData] = useState({
    weeklyRevenue: [],
    demoConversions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [students, demos, subscriptions] = await Promise.all([
          studentService.getAll(),
          demoService.getAll(),
          subscriptionService.getAll()
        ])

        const activeDemos = demos.filter(d => 
          d.status === 'BOOKED' || d.status === 'ATTENDED' || d.status === 'PAYMENT_PENDING'
        )
        const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE')
        const totalRevenue = activeSubs.reduce((sum, sub) => sum + sub.amount, 0)

        // Generate weekly revenue data (last 7 days)
        const weeklyRevenue = []
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]
          weeklyRevenue.push({
            day: dayName,
            revenue: Math.floor(Math.random() * 20000) + 50000
          })
        }

        // Demo conversion trends (last 7 days)
        const demoConversions = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]
          const booked = Math.floor(Math.random() * 5) + 3
          const converted = Math.floor(booked * 0.6)
          demoConversions.push({
            day: dayName,
            booked,
            converted
          })
        }

        setStats({
          totalStudents: students.length,
          activeDemos: activeDemos.length,
          totalRevenue: totalRevenue,
          activeSubscriptions: activeSubs.length
        })

        setChartData({
          weeklyRevenue,
          demoConversions
        })

        setRecentDemos(demos.slice(0, 5))
      } catch (error) {
        console.error('Error loading admin dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of academy operations and metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-navy text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Total Students</div>
          <div className="text-4xl font-bold">{stats.totalStudents}</div>
        </Card>
        <Card className="bg-orange text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Active Demos</div>
          <div className="text-4xl font-bold">{stats.activeDemos}</div>
        </Card>
        <Card className="bg-olive text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Active Subscriptions</div>
          <div className="text-4xl font-bold">{stats.activeSubscriptions}</div>
        </Card>
        <Card className="bg-cream border-2 border-navy">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Revenue</div>
          <div className="text-4xl font-bold text-navy">{formatCurrency(stats.totalRevenue)}</div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">Weekly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FC8A24"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">Demo Conversion Trends</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.demoConversions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="booked" fill="#3B82F6" name="Booked" />
              <Bar dataKey="converted" fill="#10B981" name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Demos */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-secondary font-bold text-navy">Recent Demos</h2>
          <Link to="/admin/demos">
            <button className="text-sm text-orange hover:underline">View All</button>
          </Link>
        </div>
        {recentDemos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Parent</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentDemos.map((demo) => (
                  <tr key={demo.demo_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{demo.student_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{demo.parent_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(demo.scheduled_start).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        demo.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
                        demo.status === 'ATTENDED' ? 'bg-green-100 text-green-800' :
                        demo.status === 'PAYMENT_PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {demo.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/admin/demos`} className="text-sm text-orange hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No demos found.</p>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Link to="/admin/students">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-semibold text-navy mb-2">Students</h3>
              <p className="text-sm text-gray-600">Manage students</p>
            </Card>
          </Link>
          <Link to="/admin/demos">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-semibold text-navy mb-2">Demos</h3>
              <p className="text-sm text-gray-600">Manage demos</p>
            </Card>
          </Link>
          <Link to="/admin/coaches">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold text-navy mb-2">Coaches</h3>
              <p className="text-sm text-gray-600">Manage coaches</p>
            </Card>
          </Link>
          <Link to="/admin/analytics">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="font-semibold text-navy mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">View reports</p>
            </Card>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default AdminDashboard
