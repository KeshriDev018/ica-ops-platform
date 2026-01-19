import { mockAccounts } from './mockData'

// Mock auth tokens
const mockTokens = {
  'admin@chessacademy.com': 'mock-admin-token-123',
  'coach1@chessacademy.com': 'mock-coach-token-123',
  'parent1@example.com': 'mock-customer-token-123',
  'test@example.com': 'mock-test-token-123'
}

const authService = {
  login: async (email, password, role) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Find account by email
    const account = mockAccounts.find(acc => acc.email === email)
    
    if (!account) {
      throw new Error('Invalid email or password')
    }
    
    // Validate role matches account role
    if (role && account.role !== role) {
      throw new Error(`Invalid role. This account is for ${account.role}`)
    }
    
    // In real app, password would be verified
    // For mock, accept any password
    if (!password) {
      throw new Error('Password is required')
    }
    
    const token = mockTokens[email] || `mock-token-${Date.now()}`
    
    return {
      user: account,
      token: token
    }
  },
  
  logout: async () => {
    // In real app, invalidate token on backend
    await new Promise(resolve => setTimeout(resolve, 100))
    return { success: true }
  },
  
  forgotPassword: async (email) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true, message: 'Password reset link sent' }
  }
}

export default authService
