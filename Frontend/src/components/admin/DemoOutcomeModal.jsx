import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '../../components/common/Button'
import FormInput from '../../components/forms/FormInput'
import FormSelect from '../../components/forms/FormSelect'
import demoService from '../../services/demoService'
import coachService from '../../services/coachService'

const DemoOutcomeModal = ({ demo, isOpen, onClose, onUpdate }) => {
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    coachId: demo?.coachId?._id || '',
    meetingLink: demo?.meetingLink || '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      loadCoaches()
      setFormData({
        coachId: demo?.coachId?._id || '',
        meetingLink: demo?.meetingLink || '',
      })
    }
  }, [isOpen, demo])

  const loadCoaches = async () => {
    try {
      const allCoaches = await coachService.getAll()
      setCoaches(allCoaches)
    } catch (error) {
      console.error('Error loading coaches:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    
    // Validation
    const newErrors = {}
    if (!formData.coachId) {
      newErrors.coachId = 'Please select a coach'
    }
    if (!formData.meetingLink) {
      newErrors.meetingLink = 'Meeting link is required'
    } else if (!formData.meetingLink.startsWith('http')) {
      newErrors.meetingLink = 'Please enter a valid URL (must start with http:// or https://)'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await demoService.schedule(demo._id, {
        coachId: formData.coachId,
        meetingLink: formData.meetingLink,
      })
      
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating demo:', error)
      setErrors({ submit: error.message || 'Failed to update demo' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const coachOptions = coaches.map(coach => ({
    value: coach._id,
    label: `${coach.email}${coach.name ? ` - ${coach.name}` : ''}`
  }))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-secondary font-bold text-navy">
              Manage Demo - {demo?.studentName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Assign coach and set meeting link
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Demo Details */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Student:</span>
              <span className="ml-2 font-medium text-navy">{demo?.studentName}</span>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <span className="ml-2 font-medium">{demo?.studentAge} years</span>
            </div>
            <div>
              <span className="text-gray-600">Parent:</span>
              <span className="ml-2 font-medium">{demo?.parentName}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium">{demo?.parentEmail}</span>
            </div>
            <div>
              <span className="text-gray-600">Country:</span>
              <span className="ml-2 font-medium">{demo?.country}</span>
            </div>
            <div>
              <span className="text-gray-600">Scheduled:</span>
              <span className="ml-2 font-medium">
                {demo?.scheduledStart ? new Date(demo.scheduledStart).toLocaleString() : 'Not scheduled'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                demo?.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
                demo?.status === 'ATTENDED' ? 'bg-green-100 text-green-800' :
                demo?.status === 'PAYMENT_PENDING' ? 'bg-yellow-100 text-yellow-800' :
                demo?.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {demo?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Assign Coach */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Coach <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.coachId}
              onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent ${
                errors.coachId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a coach</option>
              {coachOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.coachId && (
              <p className="mt-1 text-sm text-red-600">{errors.coachId}</p>
            )}
            {coaches.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">
                No coaches available. Please create coach accounts first.
              </p>
            )}
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Link (Google Meet, Zoom, etc.) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent ${
                errors.meetingLink ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.meetingLink && (
              <p className="mt-1 text-sm text-red-600">{errors.meetingLink}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              This link will be visible to the parent/student on their demo access page
            </p>
          </div>

          {/* Current Assignment (if exists) */}
          {demo?.coachId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Current Coach:</strong> {demo.coachId.email}
              </p>
              {demo.meetingLink && (
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Current Link:</strong>{' '}
                  <a 
                    href={demo.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900"
                  >
                    {demo.meetingLink}
                  </a>
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading || coaches.length === 0}
            >
              {loading ? 'Updating...' : 'Update Demo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DemoOutcomeModal
