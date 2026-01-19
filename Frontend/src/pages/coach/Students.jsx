import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import useAuthStore from '../../store/authStore'
import coachService from '../../services/coachService'

const CoachStudents = () => {
  const { user } = useAuthStore()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', '1-1', 'group'

  useEffect(() => {
    const loadData = async () => {
      try {
        const coachStudents = await coachService.getStudents('coach-1')
        setStudents(coachStudents)
      } catch (error) {
        console.error('Error loading students:', error)
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

  const filteredStudents = filter === 'all' 
    ? students 
    : students.filter(s => s.student_type === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Students</h1>
          <p className="text-gray-600">View all your assigned students</p>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({students.length})
          </button>
          <button
            onClick={() => setFilter('1-1')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === '1-1'
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1-on-1 ({students.filter(s => s.student_type === '1-1').length})
          </button>
          <button
            onClick={() => setFilter('group')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'group'
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Group ({students.filter(s => s.student_type === 'group').length})
          </button>
        </div>
      </Card>

      {/* Students Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Card key={student.student_id} hover>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-navy">{student.student_name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {student.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Age: {student.student_age} years</p>
                <p>Level: {student.level}</p>
                <p>Rating: {student.rating || 'N/A'}</p>
                <p className="capitalize">Type: {student.student_type === '1-1' ? '1-on-1' : 'Group'}</p>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <p className="text-gray-500 text-center py-8">No students found.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoachStudents
