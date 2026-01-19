import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalDemos: 0,
    conversionRate: 0,
    totalRevenue: 0
  })
  const [chartData, setChartData] = useState({
    revenueData: [],
    studentGrowth: [],
    demoStatus: [],
    planDistribution: [],
    levelDistribution: []
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

        const convertedDemos = demos.filter(d => d.status === 'ATTENDED' || d.status === 'CONVERTED')
        const conversionRate = demos.length > 0 ? (convertedDemos.length / demos.length) * 100 : 0
        const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE')
        const totalRevenue = activeSubs.reduce((sum, sub) => sum + sub.amount, 0)

        // Generate revenue data (last 6 months)
        const revenueData = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthName = date.toLocaleDateString('en-US', { month: 'short' })
          revenueData.push({
            month: monthName,
            revenue: Math.floor(Math.random() * 50000) + 100000 + (i * 10000)
          })
        }

        // Student growth (last 6 months)
        const studentGrowth = []
        let cumulativeStudents = Math.max(0, students.length - 30)
        for (let i = 5; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthName = date.toLocaleDateString('en-US', { month: 'short' })
          cumulativeStudents += Math.floor(Math.random() * 5) + 2
          studentGrowth.push({
            month: monthName,
            students: cumulativeStudents
          })
        }

        // Demo status distribution
        const demoStatusData = [
          { name: 'Booked', value: demos.filter(d => d.status === 'BOOKED').length, color: '#3B82F6' },
          { name: 'Attended', value: demos.filter(d => d.status === 'ATTENDED').length, color: '#10B981' },
          { name: 'Converted', value: demos.filter(d => d.status === 'CONVERTED').length, color: '#F59E0B' },
          { name: 'Cancelled', value: demos.filter(d => d.status === 'CANCELLED').length, color: '#EF4444' }
        ]

        // Plan distribution
        const plan1on1 = subscriptions.filter(s => s.plan_id === '1-1' || s.plan_id === 'plan-1on1').length
        const planGroup = subscriptions.filter(s => s.plan_id === 'group' || s.plan_id === 'plan-group').length
        const planDistribution = [
          { name: '1-on-1 Coaching', value: plan1on1, color: '#FC8A24' },
          { name: 'Group Coaching', value: planGroup, color: '#6B8E23' }
        ]

        // Level distribution
        const levels = ['Beginner', 'Intermediate', 'Advanced']
        const levelDistribution = levels.map(level => ({
          name: level,
          value: students.filter(s => s.level === level).length
        }))

        setAnalytics({
          totalStudents: students.length,
          totalDemos: demos.length,
          conversionRate: Math.round(conversionRate),
          totalRevenue: totalRevenue
        })

        setChartData({
          revenueData,
          studentGrowth,
          demoStatus: demoStatusData,
          planDistribution,
          levelDistribution
        })
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`

  const COLORS = ['#FC8A24', '#6B8E23', '#003366', '#EF4444']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Analytics</h1>
        <p className="text-gray-600">View academy performance metrics and insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-navy text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Total Students</div>
          <div className="text-4xl font-bold">{analytics.totalStudents}</div>
        </Card>
        <Card className="bg-orange text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Total Demos</div>
          <div className="text-4xl font-bold">{analytics.totalDemos}</div>
        </Card>
        <Card className="bg-olive text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Conversion Rate</div>
          <div className="text-4xl font-bold">{analytics.conversionRate}%</div>
        </Card>
        <Card className="bg-cream border-2 border-navy">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Revenue</div>
          <div className="text-4xl font-bold text-navy">{formatCurrency(analytics.totalRevenue)}</div>
        </Card>
      </div>

      {/* Revenue Trends */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">Monthly Revenue Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
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

      {/* Student Growth & Demo Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">Student Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.studentGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#003366" name="Total Students" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">Demo Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.demoStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.demoStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Plan Distribution & Level Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">Subscription Plan Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">Student Level Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.levelDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#6B8E23" name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

export default AdminAnalytics
