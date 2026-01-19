import { useState, useRef } from 'react'
import Button from '../common/Button'

const MessageInput = ({ onSend, onFileUpload, allowFiles = false, disabled = false }) => {
  const [inputMessage, setInputMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || disabled) return

    onSend(inputMessage.trim())
    setInputMessage('')
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !allowFiles) return

    setIsUploading(true)
    try {
      await onFileUpload(file)
    } catch (error) {
      console.error('File upload error:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
      e.target.value = '' // Reset file input
    }
  }

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        {allowFiles && (
          <label className="cursor-pointer p-2 text-gray-600 hover:text-navy transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled || isUploading}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            />
            <span className="text-2xl">📎</span>
            <span className="sr-only">Upload file</span>
          </label>
        )}
        
        <div className="flex-1">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={allowFiles ? "Type your message or upload a file..." : "Type your message..."}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            disabled={disabled || isUploading}
          />
          {allowFiles && (
            <p className="text-xs text-gray-500 mt-1">
              Supported: PDF, DOC, Images, TXT (Max 10MB)
            </p>
          )}
        </div>
        
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!inputMessage.trim() || disabled || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Send'}
        </Button>
      </form>
    </div>
  )
}

export default MessageInput
