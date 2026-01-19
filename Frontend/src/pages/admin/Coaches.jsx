import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import coachService from '../../services/coachService'

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const allCoaches = await coachService.getAll()
        setCoaches(allCoaches)
      } catch (error) {
        console.error('Error loading coaches:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-gray-500">Loading...</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Coaches</h1>
          <p className="text-gray-600">Manage academy coaches</p>
        </div>
        <Button variant="primary" size="md">Add Coach</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => (
          <Card key={coach.coach_id} hover>
            <h3 className="text-xl font-semibold text-navy mb-2">{coach.name}</h3>
            <p className="text-orange mb-3">{coach.title}</p>
            <p className="text-sm text-gray-600">{coach.email}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminCoaches
