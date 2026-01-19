import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import useAuthStore from '../../store/authStore'
import studentService from '../../services/studentService'

const CustomerProfile = () => {
  const { user } = useAuthStore()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const accountStudents = await studentService.getByAccountId(user.account_id)
        setStudents(accountStudents)
      } catch (error) {
        console.error('Error loading profile data:', error)
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
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Profile</h1>
        <p className="text-gray-600">View and manage your student profile information</p>
      </div>

      {mainStudent && (
        <>
          {/* Student Information */}
          <Card>
            <h2 className="text-xl font-secondary font-bold text-navy mb-4">Student Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Student Name</label>
                <p className="text-lg font-semibold text-navy">{mainStudent.student_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                <p className="text-lg font-semibold text-navy">{mainStudent.student_age} years</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Level</label>
                <p className="text-lg font-semibold text-navy">{mainStudent.level}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Program Type</label>
                <p className="text-lg font-semibold text-navy capitalize">
                  {mainStudent.student_type === '1-1' ? '1-on-1 Coaching' : 'Group Coaching'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Current Rating</label>
                <p className="text-lg font-semibold text-navy">{mainStudent.rating || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  mainStudent.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                  mainStudent.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {mainStudent.status}
                </span>
              </div>
            </div>
          </Card>

          {/* Parent Information */}
          <Card>
            <h2 className="text-xl font-secondary font-bold text-navy mb-4">Parent Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Parent Name</label>
                <p className="text-lg font-semibold text-navy">{mainStudent.parent_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Parent Email</label>
                <p className="text-lg text-navy">{mainStudent.parent_email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Timezone</label>
                <p className="text-lg text-navy">{mainStudent.timezone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                <p className="text-lg text-navy">{mainStudent.country}</p>
              </div>
            </div>
          </Card>

          {/* Chess Accounts */}
          {mainStudent.chess_usernames && Object.keys(mainStudent.chess_usernames).length > 0 && (
            <Card>
              <h2 className="text-xl font-secondary font-bold text-navy mb-4">Chess Accounts</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(mainStudent.chess_usernames).map(([platform, username]) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                      {platform.replace('_', ' ')}
                    </label>
                    <p className="text-lg font-semibold text-navy">{username}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Coach Assignment */}
          {mainStudent.assigned_coach_id && (
            <Card>
              <h2 className="text-xl font-secondary font-bold text-navy mb-4">Assigned Coach</h2>
              <p className="text-lg text-navy">Coach ID: {mainStudent.assigned_coach_id}</p>
            </Card>
          )}
        </>
      )}

      {!mainStudent && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No student profile found.</p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default CustomerProfile
