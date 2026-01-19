import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'

const MessageList = ({ messages, currentUserEmail, participants = {} }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-1 bg-gray-50">
      {messages.map((message) => (
        <MessageItem
          key={message.message_id}
          message={message}
          currentUserEmail={currentUserEmail}
          senderName={participants[message.sender_email]?.name}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList
