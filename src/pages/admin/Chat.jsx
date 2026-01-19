import { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import MessageList from '../../components/chat/MessageList'
import MessageInput from '../../components/chat/MessageInput'
import useAuthStore from '../../store/authStore'
import chatService from '../../services/chatService'

const AdminChat = () => {
  const { user } = useAuthStore()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChats = async () => {
      try {
        const chatList = await chatService.getAdminChats()
        setChats(chatList)
      } catch (error) {
        console.error('Error loading chats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChats()
  }, [])

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat) {
        setMessages([])
        return
      }

      try {
        const chatMessages = await chatService.getDirectMessages(
          activeChat.chat_id,
          activeChat.type
        )
        setMessages(chatMessages)
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
    
    // Poll for new messages
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [activeChat])

  const handleSend = async (content) => {
    if (!activeChat || !user) return

    try {
      const newMessage = await chatService.sendDirectMessage(
        activeChat.chat_id,
        activeChat.type,
        user.email,
        activeChat.email,
        content
      )
      setMessages([...messages, newMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleBroadcast = () => {
    // TODO: Implement broadcast functionality
    alert('Broadcast functionality will be implemented in a future update.')
  }

  const participants = activeChat ? {
    [user?.email]: { name: 'Admin', role: 'ADMIN' },
    [activeChat.email]: { name: activeChat.name, role: activeChat.type === 'parent' ? 'CUSTOMER' : 'COACH' }
  } : {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Chat & Broadcast</h1>
          <p className="text-gray-600">One-on-one chats: Admin ↔ Parent, Admin ↔ Coach</p>
        </div>
        <Button variant="primary" size="md" onClick={handleBroadcast}>
          Broadcast Message
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Chat List */}
        <Card>
          <h2 className="text-lg font-semibold text-navy mb-4">Chats</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading chats...</div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={`${chat.chat_id}-${chat.type}`}
                  onClick={() => setActiveChat(chat)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeChat?.chat_id === chat.chat_id && activeChat?.type === chat.type
                      ? 'bg-navy text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium">{chat.name}</p>
                  <p className={`text-sm ${activeChat?.chat_id === chat.chat_id && activeChat?.type === chat.type ? 'text-white/80' : 'text-gray-600'}`}>
                    {chat.type === 'parent' ? `Parent (${chat.student_name})` : 'Coach'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Chat Window */}
        <div className="md:col-span-2">
          <Card className="p-0 overflow-hidden flex flex-col" style={{ height: '600px' }}>
            {activeChat ? (
              <>
                <div className="bg-navy text-white px-6 py-4 flex-shrink-0">
                  <h3 className="font-semibold">{activeChat.name}</h3>
                  <p className="text-sm text-white/80">{activeChat.email}</p>
                </div>

                <div className="flex-1 overflow-hidden">
                  <MessageList
                    messages={messages}
                    currentUserEmail={user?.email}
                    participants={participants}
                  />
                </div>

                <MessageInput
                  onSend={handleSend}
                  allowFiles={false}
                />
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-500">Select a chat to start conversation</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminChat
