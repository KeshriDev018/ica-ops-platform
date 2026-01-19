import { useState } from 'react'
import { X, Mail, CheckCircle } from 'lucide-react'
import Button from '../common/Button'
import FormInput from '../forms/FormInput'
import coachService from '../../services/coachService'

const AddCoachModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!email) {
      setError('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      await coachService.create({ email })
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to create coach account')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError('')
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-secondary font-bold text-navy">
              Add New Coach
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Send password setup invitation
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-green-800 font-medium">Coach Account Created!</p>
                <p className="text-green-700 text-sm mt-1">
                  A password setup email has been sent to <strong>{email}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Email Input */}
          {!success && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coach Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coach@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-blue-800 text-sm font-medium">What happens next?</p>
                    <ul className="text-blue-700 text-sm mt-2 space-y-1 list-disc list-inside">
                      <li>Coach account will be created</li>
                      <li>Password setup email will be sent</li>
                      <li>Coach sets their password via email link</li>
                      <li>Coach can login with email and password</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail size={18} /> Send Invitation
                    </span>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default AddCoachModal
