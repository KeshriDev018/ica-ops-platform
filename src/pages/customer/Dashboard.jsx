import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
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
import useAuthStore from '../../store/authStore'
import studentService from '../../services/studentService'
import scheduleService from '../../services/scheduleService'
import { format } from 'date-fns'

const CustomerDashboard = () => {
  const { user } = useAuthStore()
  const [students, setStudents] = useState([])
  const [upcomingClasses, setUpcomingClasses] = useState([])
  const [metrics, setMetrics] = useState({
    currentRating: 0,
    ratingChange: 0,
    ratingTrendUp: true,
    classesAttended: 0,
    totalClasses: 0,
    attendancePercentage: 0,
    nextClassDate: null,
    nextClassTime: null,
    nextClassLabel: null
  })
  const [chartData, setChartData] = useState({
    ratingProgression: [],
    monthlyClasses: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const accountStudents = await studentService.getByAccountId(user.account_id)
        setStudents(accountStudents)
        
        if (accountStudents.length > 0) {
          const mainStudent = accountStudents[0]
          const upcoming = await scheduleService.getUpcoming(mainStudent.student_id, 3)
          setUpcomingClasses(upcoming)

          const now = new Date()
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

          const currentRating = mainStudent.rating || 1000
          const ratingThisMonth = currentRating
          const ratingLastMonth = currentRating - Math.floor(Math.random() * 100) + 20
          const ratingChange = ratingThisMonth - ratingLastMonth

          const allSchedules = await scheduleService.getByStudentId(mainStudent.student_id)
          const thisMonthSchedules = allSchedules.filter(s => 
            new Date(s.start) >= thirtyDaysAgo && new Date(s.start) <= now
          )
          const attendedClasses = thisMonthSchedules.filter(s => s.status === 'COMPLETED').length
          const totalClassesThisMonth = thisMonthSchedules.length
          const attendancePercentage = totalClassesThisMonth > 0 
            ? Math.round((attendedClasses / totalClassesThisMonth) * 100) 
            : 0

          const futureClasses = upcoming.filter(c => new Date(c.start) > now)
          const nextClass = futureClasses.length > 0 ? futureClasses[0] : null
          
          let nextClassLabel = 'No upcoming'
          let nextClassTime = null
          if (nextClass) {
            const classDate = new Date(nextClass.start)
            const tomorrow = new Date(now)
            tomorrow.setDate(tomorrow.getDate() + 1)
            
            if (classDate.toDateString() === now.toDateString()) {
              nextClassLabel = 'Today'
            } else if (classDate.toDateString() === tomorrow.toDateString()) {
              nextClassLabel = 'Tomorrow'
            } else {
              nextClassLabel = format(classDate, 'MMM d')
            }
            nextClassTime = format(classDate, 'h:mm a')
          }

          setMetrics({
            currentRating: currentRating,
            ratingChange: ratingChange,
            ratingTrendUp: ratingChange >= 0,
            classesAttended: attendedClasses,
            totalClasses: totalClassesThisMonth,
            attendancePercentage: attendancePercentage,
            nextClassDate: nextClass?.start || null,
            nextClassTime: nextClassTime,
            nextClassLabel: nextClassLabel
          })

          const ratingProgression = []
          const baseRating = currentRating
          for (let i = 5; i >= 0; i--) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            const monthName = date.toLocaleDateString('en-US', { month: 'short' })
            ratingProgression.push({
              month: monthName,
              rating: baseRating - (i * 40) + Math.floor(Math.random() * 30)
            })
          }

          const monthlyClasses = []
          for (let i = 5; i >= 0; i--) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            const monthName = date.toLocaleDateString('en-US', { month: 'short' })
            monthlyClasses.push({
              month: monthName,
              attended: Math.floor(Math.random() * 4) + 6,
              scheduled: Math.floor(Math.random() * 2) + 8
            })
          }

          setChartData({
            ratingProgression,
            monthlyClasses
          })
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
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

  const mainStudent = students[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your chess journey.</p>
        </div>
      </div>

      {/* Demo Account Welcome Banner */}
      {user?.demo_info && user?.linked_from_demo && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">🎉</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-secondary font-bold text-blue-900 mb-2">
                Welcome to Your Full Account!
              </h3>
              <div className="space-y-2 text-blue-800">
                <p className="font-medium">
                  Your demo account has been successfully upgraded. Here's your information:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student Name:</span>
                    <span className="font-semibold text-navy">{user.demo_info.student_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parent Name:</span>
                    <span className="font-semibold text-navy">{user.demo_info.parent_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-navy">{user.demo_info.parent_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Language:</span>
                    <span className="font-semibold text-navy">{user.demo_info.preferred_language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Demo Scheduled:</span>
                    <span className="font-semibold text-navy">
                      {user.demo_info.scheduled_start ? format(new Date(user.demo_info.scheduled_start), 'MMMM d, yyyy • h:mm a') : 'Pending'}
                    </span>
                  </div>
                </div>
                <p className="text-sm mt-3">
                  Your coach will be assigned shortly. Start exploring your dashboard and learning materials!
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white border-2 border-navy transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🎯</span>
            <div className="text-sm font-medium text-gray-600">Current Rating</div>
          </div>
          <div className="text-4xl font-bold text-navy mb-2">
            {metrics.currentRating} ELO
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            metrics.ratingTrendUp ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{metrics.ratingTrendUp ? '↑' : '↓'}</span>
            <span className="font-medium">
              {metrics.ratingTrendUp ? '+' : ''}{metrics.ratingChange} this month
            </span>
          </div>
        </Card>
        
        <Card className="bg-white border-2 border-navy transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📚</span>
            <div className="text-sm font-medium text-gray-600">Classes Attended</div>
          </div>
          <div className="text-4xl font-bold text-navy mb-2">
            {metrics.classesAttended}/{metrics.totalClasses}
          </div>
          <div className="text-sm text-gray-600">
            {metrics.attendancePercentage}% attendance
          </div>
        </Card>
        
        <Card className="bg-white border-2 border-navy transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📅</span>
            <div className="text-sm font-medium text-gray-600">Next Class</div>
          </div>
          <div className="text-4xl font-bold text-navy mb-2">
            {metrics.nextClassLabel}
          </div>
          <div className="text-sm text-gray-600">
            {metrics.nextClassTime || 'Not scheduled'}
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      {mainStudent && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-secondary font-bold text-navy mb-4">Rating Progression</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData.ratingProgression}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#FC8A24"
                  strokeWidth={2}
                  name="Rating"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-xl font-secondary font-bold text-navy mb-4">Monthly Class Attendance</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.monthlyClasses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="scheduled" fill="#003366" name="Scheduled" />
                <Bar dataKey="attended" fill="#6B8E23" name="Attended" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Student Info */}
      {mainStudent && (
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">Student Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Student Name</p>
              <p className="font-semibold text-navy">{mainStudent.student_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Level</p>
              <p className="font-semibold text-navy">{mainStudent.level}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                mainStudent.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {mainStudent.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Program</p>
              <p className="font-semibold text-navy capitalize">{mainStudent.student_type === '1-1' ? '1-on-1 Coaching' : 'Group Coaching'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Upcoming Classes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-secondary font-bold text-navy">Upcoming Classes</h2>
          <Link to="/customer/schedule">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        {upcomingClasses.length > 0 ? (
          <div className="space-y-3">
            {upcomingClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-semibold text-navy mb-1">{classItem.title}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(classItem.start), 'EEEE, MMMM d, yyyy')} at{' '}
                    {format(new Date(classItem.start), 'h:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    classItem.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {classItem.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No upcoming classes scheduled.</p>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/customer/schedule">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-semibold text-navy mb-2">View Schedule</h3>
              <p className="text-sm text-gray-600">Check your upcoming classes</p>
            </Card>
          </Link>
          <Link to="/customer/batch-chat">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-semibold text-navy mb-2">Batch Chat</h3>
              <p className="text-sm text-gray-600">Chat with your coach and batch</p>
            </Card>
          </Link>
          <Link to="/customer/payments">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="font-semibold text-navy mb-2">Payments</h3>
              <p className="text-sm text-gray-600">View subscription and payments</p>
            </Card>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default CustomerDashboard
