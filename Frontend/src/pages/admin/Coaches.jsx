import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import coachService from '../../services/coachService'
import AddCoachModal from '../../components/admin/AddCoachModal'

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadCoaches = async () => {
    setLoading(true)
    try {
      const allCoaches = await coachService.getAll()
      setCoaches(allCoaches)
    } catch (error) {
      console.error('Error loading coaches:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoaches()
  }, [])

  const handleCoachAdded = () => {
    loadCoaches()
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-gray-500">Loading...</div></div>
  }

  return (
    <div className="space-y-6">
      {/* Add Coach Modal */}
      <AddCoachModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCoachAdded}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Coaches</h1>
          <p className="text-gray-600">Manage academy coaches</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          Add Coach
        </Button>
      </div>

      {coaches.length === 0 && !loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-semibold text-navy mb-2">No Coaches Yet</h3>
            <p className="text-gray-600 mb-6">Add your first coach to get started</p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Add First Coach
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <Card key={coach._id} hover>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {coach.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-navy">
                    {coach.name || 'Unnamed Coach'}
                  </h3>
                  <p className="text-sm text-gray-600">{coach.email}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminCoaches
