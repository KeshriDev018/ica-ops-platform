import { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import MessageList from '../../components/chat/MessageList'
import MessageInput from '../../components/chat/MessageInput'
import useAuthStore from '../../store/authStore'
import chatService from '../../services/chatService'
import { mockBatches, mockStudents } from '../../services/mockData'

const CustomerBatchChat = () => {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState({})
  const [batchInfo, setBatchInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChat = async () => {
      try {
        // Find user's batch
        const student = mockStudents.find(s => s.account_id === user?.account_id)
        const batchId = student?.assigned_batch_id

        if (!batchId) {
          setLoading(false)
          return
        }

        // Get batch info
        const batch = mockBatches.find(b => b.batch_id === batchId)
        setBatchInfo(batch)

        // Load messages and participants
        const [chatMessages, chatParticipants] = await Promise.all([
          chatService.getBatchMessages(batchId),
          chatService.getBatchParticipants(batchId)
        ])

        setMessages(chatMessages)
        setParticipants(chatParticipants)
      } catch (error) {
        console.error('Error loading chat:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadChat()
      // Poll for new messages (in real app, use WebSocket/SSE)
      const interval = setInterval(loadChat, 3000)
      return () => clearInterval(interval)
    }
  }, [user])

  const handleSend = async (content) => {
    if (!batchInfo || !user) return

    try {
      const newMessage = await chatService.sendBatchMessage(
        batchInfo.batch_id,
        user.email,
        content
      )
      setMessages([...messages, newMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleFileUpload = async (file) => {
    if (!batchInfo || !user) return

    try {
      const newMessage = await chatService.uploadFile(
        batchInfo.batch_id,
        user.email,
        file
      )
      setMessages([...messages, newMessage])
    } catch (error) {
      throw error
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-gray-500">Loading chat...</div>
        </div>
      </div>
    )
  }

  if (!batchInfo) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Batch Chat</h1>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600">You are not assigned to any batch yet.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">Batch Chat</h1>
        <p className="text-gray-600">Chat with your coach and batch members (Admin + Parents + Coach all visible)</p>
      </div>

      <Card className="p-0 overflow-hidden flex flex-col" style={{ height: '600px' }}>
        <div className="bg-navy text-white px-6 py-4 flex-shrink-0">
          <h2 className="text-lg font-semibold">Batch Chat - {batchInfo.batch_name}</h2>
          <p className="text-sm text-white/80">Group conversation with all participants</p>
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
          onFileUpload={handleFileUpload}
          allowFiles={true}
        />
      </Card>
    </div>
  )
}

export default CustomerBatchChat
