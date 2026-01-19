import { useEffect, useState } from 'react'
import Card from '../../components/common/Card'
import useAuthStore from '../../store/authStore'
import coachService from '../../services/coachService'
import batchService from '../../services/batchService'
import studentService from '../../services/studentService'

const CoachBatches = () => {
  const { user } = useAuthStore()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [batchStudents, setBatchStudents] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const coachBatches = await coachService.getBatches('coach-1')
        setBatches(coachBatches)
      } catch (error) {
        console.error('Error loading batches:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleBatchClick = async (batchId) => {
    try {
      const batch = await batchService.getById(batchId)
      setSelectedBatch(batch)
      
      // Get students in this batch
      if (batch.student_ids && batch.student_ids.length > 0) {
        const students = await Promise.all(
          batch.student_ids.map(id => studentService.getById(id))
        )
        setBatchStudents(students)
      } else {
        setBatchStudents([])
      }
    } catch (error) {
      console.error('Error loading batch details:', error)
    }
  }

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
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Batches</h1>
        <p className="text-gray-600">Manage your assigned batches and students</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Batches List */}
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">My Batches</h2>
          {batches.length > 0 ? (
            <div className="space-y-3">
              {batches.map((batch) => (
                <div
                  key={batch.batch_id}
                  onClick={() => handleBatchClick(batch.batch_id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedBatch?.batch_id === batch.batch_id
                      ? 'border-orange bg-orange/5'
                      : 'border-gray-200 hover:border-navy hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-semibold text-navy mb-2">{batch.batch_name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Schedule: {batch.schedule}</p>
                    <p>Students: {batch.student_ids?.length || 0}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No batches assigned.</p>
          )}
        </Card>

        {/* Batch Details */}
        <Card>
          <h2 className="text-xl font-secondary font-bold text-navy mb-4">
            {selectedBatch ? selectedBatch.batch_name : 'Select a Batch'}
          </h2>
          {selectedBatch ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Schedule</p>
                <p className="font-medium text-navy">{selectedBatch.schedule}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedBatch.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedBatch.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Students in Batch</p>
                {batchStudents.length > 0 ? (
                  <div className="space-y-2">
                    {batchStudents.map((student) => (
                      <div key={student.student_id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-medium text-navy">{student.student_name}</p>
                        <p className="text-sm text-gray-600">Level: {student.level} | Rating: {student.rating}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No students in this batch.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Click on a batch to view details.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default CoachBatches
