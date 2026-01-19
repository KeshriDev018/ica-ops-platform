import { mockAccounts, mockBatches, mockStudents, mockCoaches } from './mockData'

// Mock chat messages storage (in real app, this would be from backend/WebSocket)
let mockBatchMessages = {}
let mockDirectMessages = {}

const chatService = {
  // Get batch chat messages
  getBatchMessages: async (batchId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Initialize if doesn't exist
    if (!mockBatchMessages[batchId]) {
      mockBatchMessages[batchId] = [
        {
          message_id: `msg-${Date.now()}-1`,
          batch_id: batchId,
          sender_email: 'admin@chessacademy.com',
          sender_name: 'Admin',
          sender_role: 'ADMIN',
          content: 'Welcome to the batch chat! Feel free to ask questions here.',
          type: 'text',
          timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      ]
    }
    
    return mockBatchMessages[batchId].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    )
  },

  // Send message to batch chat
  sendBatchMessage: async (batchId, senderEmail, content, type = 'text') => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const sender = mockAccounts.find(acc => acc.email === senderEmail)
    const senderName = sender?.role === 'ADMIN' 
      ? 'Admin' 
      : sender?.role === 'COACH'
      ? mockCoaches.find(c => c.account_id === sender?.account_id)?.name || 'Coach'
      : mockStudents.find(s => s.account_id === sender?.account_id)?.parent_name || 'Parent'

    const newMessage = {
      message_id: `msg-${Date.now()}`,
      batch_id: batchId,
      sender_email: senderEmail,
      sender_name: senderName,
      sender_role: sender?.role,
      content,
      type,
      timestamp: new Date().toISOString()
    }

    if (!mockBatchMessages[batchId]) {
      mockBatchMessages[batchId] = []
    }
    
    mockBatchMessages[batchId].push(newMessage)
    
    return newMessage
  },

  // Upload file to batch chat
  uploadFile: async (batchId, senderEmail, file) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit')
    }

    // Simulate file upload - in real app, upload to backend storage
    const fileUrl = URL.createObjectURL(file)
    
    const message = await chatService.sendBatchMessage(
      batchId,
      senderEmail,
      fileUrl,
      'file'
    )
    
    // Add file metadata
    message.file_name = file.name
    message.file_size = file.size
    message.file_type = file.type
    
    return message
  },

  // Get direct messages for Admin (1-on-1)
  getDirectMessages: async (chatId, type) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const key = `${chatId}-${type}`
    if (!mockDirectMessages[key]) {
      mockDirectMessages[key] = []
    }
    
    return mockDirectMessages[key].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    )
  },

  // Send direct message (Admin ↔ Parent/Coach)
  sendDirectMessage: async (chatId, type, senderEmail, recipientEmail, content) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const sender = mockAccounts.find(acc => acc.email === senderEmail)
    const senderName = sender?.role === 'ADMIN' 
      ? 'Admin'
      : sender?.role === 'COACH'
      ? mockCoaches.find(c => c.account_id === sender?.account_id)?.name || 'Coach'
      : mockStudents.find(s => s.account_id === sender?.account_id)?.parent_name || 'Parent'

    const key = `${chatId}-${type}`
    const newMessage = {
      message_id: `msg-${Date.now()}`,
      chat_id: chatId,
      sender_email: senderEmail,
      recipient_email: recipientEmail,
      sender_name: senderName,
      sender_role: sender?.role,
      content,
      type: 'text',
      timestamp: new Date().toISOString()
    }

    if (!mockDirectMessages[key]) {
      mockDirectMessages[key] = []
    }
    
    mockDirectMessages[key].push(newMessage)
    
    return newMessage
  },

  // Get list of chats for Admin
  getAdminChats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const parents = mockStudents.map(student => ({
      chat_id: student.account_id,
      type: 'parent',
      name: student.parent_name,
      email: student.parent_email,
      student_name: student.student_name
    }))
    
    const coaches = mockCoaches.map(coach => ({
      chat_id: coach.account_id,
      type: 'coach',
      name: coach.name,
      email: coach.email
    }))
    
    return [...parents, ...coaches]
  },

  // Get batch participants
  getBatchParticipants: async (batchId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const batch = mockBatches.find(b => b.batch_id === batchId)
    if (!batch) return {}

    const participants = {}
    
    // Add Admin
    participants['admin@chessacademy.com'] = { name: 'Admin', role: 'ADMIN' }
    
    // Add Coach
    const coach = mockCoaches.find(c => c.coach_id === batch.coach_id)
    if (coach) {
      const coachAccount = mockAccounts.find(a => a.account_id === coach.account_id)
      if (coachAccount) {
        participants[coachAccount.email] = { name: coach.name, role: 'COACH' }
      }
    }
    
    // Add Parents (students in batch)
    batch.student_ids.forEach(studentId => {
      const student = mockStudents.find(s => s.student_id === studentId)
      if (student) {
        const parentAccount = mockAccounts.find(a => a.account_id === student.account_id)
        if (parentAccount) {
          participants[parentAccount.email] = { 
            name: student.parent_name, 
            role: 'CUSTOMER' 
          }
        }
      }
    })
    
    return participants
  }
}

export default chatService
