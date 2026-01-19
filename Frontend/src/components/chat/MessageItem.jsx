import { format, formatDistanceToNow } from 'date-fns'

const MessageItem = ({ message, currentUserEmail, senderName }) => {
  const isOwnMessage = message.sender_email === currentUserEmail
  const displayName = isOwnMessage ? 'You' : (senderName || message.sender_name || 'Unknown')

  return (
    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} mb-4`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-semibold text-sm ${isOwnMessage ? 'text-orange' : 'text-navy'}`}>
          {displayName}
        </span>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </span>
      </div>
      
      {message.type === 'file' ? (
        <div className={`rounded-lg px-4 py-3 shadow-soft max-w-md ${
          isOwnMessage ? 'bg-orange text-white' : 'bg-white text-gray-800'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📎</span>
            <div className="flex-1">
              <p className="font-medium">{message.file_name}</p>
              <p className="text-xs opacity-80">
                {(message.file_size / 1024).toFixed(2)} KB
              </p>
            </div>
            <a
              href={message.file_url}
              download={message.file_name}
              className="text-sm underline opacity-90 hover:opacity-100"
            >
              Download
            </a>
          </div>
        </div>
      ) : (
        <div className={`rounded-lg px-4 py-3 shadow-soft max-w-md ${
          isOwnMessage ? 'bg-orange text-white' : 'bg-white text-gray-800'
        }`}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      )}
      
      {message.timestamp && (
        <span className="text-xs text-gray-400 mt-1">
          {format(new Date(message.timestamp), 'h:mm a')}
        </span>
      )}
    </div>
  )
}

export default MessageItem
