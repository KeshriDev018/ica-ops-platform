import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/common/Card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import useAuthStore from '../../store/authStore'
import coachService from '../../services/coachService'
import scheduleService from '../../services/scheduleService'
import { format } from 'date-fns'

const CoachDashboard = () => {
  const { user } = useAuthStore()
  const [batches, setBatches] = useState([])
  const [students, setStudents] = useState([])
  const [todayClasses, setTodayClasses] = useState([])
  const [chartData, setChartData] = useState({
    studentProgress: [],
    weeklySchedule: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get coach by account
        const coach = await coachService.getById('coach-1') // Mock coach ID
        
        // Get batches and students
        const coachBatches = await coachService.getBatches('coach-1')
        const coachStudents = await coachService.getStudents('coach-1')
        
        setBatches(coachBatches)
        setStudents(coachStudents)
        
        // Get today's classes
        const today = new Date()
        const todaySchedules = await scheduleService.getByCoachId('coach-1')
        const todayOnly = todaySchedules.filter(s => {
          const scheduleDate = new Date(s.start)
          return scheduleDate.toDateString() === today.toDateString()
        })
        setTodayClasses(todayOnly)

        // Generate student progress data
        const studentProgress = coachStudents.slice(0, 5).map((student, index) => ({
          name: student.student_name.split(' ')[0],
          rating: student.rating || 800 + index * 100,
          sessions: Math.floor(Math.random() * 10) + 15
        }))

        // Weekly schedule utilization
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const weeklySchedule = days.map(day => ({
          day,
          scheduled: Math.floor(Math.random() * 4) + 2,
          completed: Math.floor(Math.random() * 3) + 1
        }))

        setChartData({
          studentProgress,
          weeklySchedule
        })
      } catch (error) {
        console.error('Error loading coach dashboard:', error)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Coach Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your coaching overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-orange text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Assigned Batches</div>
          <div className="text-4xl font-bold">{batches.length}</div>
        </Card>
        <Card className="bg-navy text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Total Students</div>
          <div className="text-4xl font-bold">{students.length}</div>
        </Card>
        <Card className="bg-olive text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Today's Classes</div>
          <div className="text-4xl font-bold">{todayClasses.length}</div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">Student Progress</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.studentProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="rating" fill="#FC8A24" name="Rating" />
              <Bar yAxisId="right" dataKey="sessions" fill="#003366" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">Weekly Schedule Utilization</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.weeklySchedule}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="scheduled"
                stroke="#003366"
                strokeWidth={2}
                name="Scheduled"
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#6B8E23"
                strokeWidth={2}
                name="Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Today's Classes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-secondary font-bold text-navy">Today's Classes</h2>
          <Link to="/coach/calendar">
            <button className="text-sm text-orange hover:underline">View Calendar</button>
          </Link>
        </div>
        {todayClasses.length > 0 ? (
          <div className="space-y-3">
            {todayClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-semibold text-navy mb-1">{classItem.title}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(classItem.start), 'h:mm a')} - {format(new Date(classItem.end), 'h:mm a')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  classItem.type === '1-1' ? 'bg-orange/20 text-orange' : 'bg-olive/20 text-olive'
                }`}>
                  {classItem.type === '1-1' ? '1-on-1' : 'Group'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No classes scheduled for today.</p>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/coach/batches">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold text-navy mb-2">Manage Batches</h3>
              <p className="text-sm text-gray-600">View and manage your batches</p>
            </Card>
          </Link>
          <Link to="/coach/students">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-semibold text-navy mb-2">View Students</h3>
              <p className="text-sm text-gray-600">See all your assigned students</p>
            </Card>
          </Link>
          <Link to="/coach/calendar">
            <Card hover className="text-center p-6 cursor-pointer">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-semibold text-navy mb-2">Calendar</h3>
              <p className="text-sm text-gray-600">View your full schedule</p>
            </Card>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default CoachDashboard
