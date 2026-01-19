import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import batchService from '../../services/batchService'

const AdminBatches = () => {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const allBatches = await batchService.getAll()
        setBatches(allBatches)
      } catch (error) {
        console.error('Error loading batches:', error)
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
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Batches</h1>
          <p className="text-gray-600">Manage academy batches</p>
        </div>
        <Button variant="primary" size="md">Create Batch</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {batches.map((batch) => (
          <Card key={batch.batch_id} hover>
            <h3 className="text-xl font-semibold text-navy mb-2">{batch.batch_name}</h3>
            <p className="text-sm text-gray-600 mb-2">Schedule: {batch.schedule}</p>
            <p className="text-sm text-gray-600 mb-3">Students: {batch.student_ids?.length || 0}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              batch.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {batch.status}
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminBatches
