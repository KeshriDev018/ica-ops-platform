import { format, formatDistanceToNow } from 'date-fns'

const MessageItem = ({ message, currentUserEmail, senderName }) => {
  // Support both old and new message structures
  const senderId = message.senderId?._id || message.senderId
  const isOwnMessage = message.sender_email === currentUserEmail || senderId === currentUserEmail
  const displayName = isOwnMessage ? 'You' : (
    senderName || 
    message.senderName || 
    message.sender_name || 
    'Unknown'
  )
  
  const messageType = message.messageType || message.type || 'text'
  const timestamp = message.createdAt || message.timestamp
  const content = message.content

  // File metadata
  const fileMetadata = message.fileMetadata || {
    fileName: message.file_name,
    fileSize: message.file_size,
    fileUrl: message.file_url,
    fileType: message.file_type
  }

  return (
    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} mb-4`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-semibold text-sm ${isOwnMessage ? 'text-orange' : 'text-navy'}`}>
          {displayName}
        </span>
        {timestamp && (
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </span>
        )}
      </div>
      
      {messageType === 'file' ? (
        <div className={`rounded-lg px-4 py-3 shadow-soft max-w-md ${
          isOwnMessage ? 'bg-orange text-white' : 'bg-white text-gray-800'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {fileMetadata.fileType?.startsWith('image/') ? '🖼️' : '📎'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{fileMetadata.fileName}</p>
              {fileMetadata.fileSize && (
                <p className="text-xs opacity-80">
                  {(fileMetadata.fileSize / 1024).toFixed(2)} KB
                </p>
              )}
            </div>
            {fileMetadata.fileUrl && (
              <a
                href={fileMetadata.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline opacity-90 hover:opacity-100"
              >
                Open
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className={`rounded-lg px-4 py-3 shadow-soft max-w-md ${
          isOwnMessage ? 'bg-orange text-white' : 'bg-white text-gray-800'
        }`}>
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
      )}
      
      {timestamp && (
        <span className="text-xs text-gray-400 mt-1">
          {format(new Date(timestamp), 'h:mm a')}
        </span>
      )}
    </div>
  )
}

export default MessageItem
