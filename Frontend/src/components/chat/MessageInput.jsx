import { useState, useRef } from 'react'
import Button from '../common/Button'

const MessageInput = ({ 
  onSend, 
  onFileUpload, 
  onTyping,
  onStopTyping,
  allowFiles = false, 
  disabled = false 
}) => {
  const [inputMessage, setInputMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || disabled) return

    onSend(inputMessage.trim())
    setInputMessage('')
    onStopTyping?.()
  }

  const handleInputChange = (e) => {
    setInputMessage(e.target.value)
    onTyping?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !allowFiles) return

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      alert('File size cannot exceed 10MB')
      e.target.value = ''
      return
    }

    setIsUploading(true)
    try {
      await onFileUpload?.(file)
    } catch (error) {
      console.error('File upload error:', error)
      alert(error.message || 'Failed to upload file. Please try again.')
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
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
            />
            <span className="text-2xl">📎</span>
            <span className="sr-only">Upload file</span>
          </label>
        )}
        
        <div className="flex-1">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={allowFiles ? "Type your message or upload a file..." : "Type your message..."}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            disabled={disabled || isUploading}
          />
          {allowFiles && (
            <p className="text-xs text-gray-500 mt-1">
              Supported: Images, PDF, Documents, Archives (Max 10MB)
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
