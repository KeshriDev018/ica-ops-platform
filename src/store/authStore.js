import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      
      login: (userData, token) => {
        set({
          user: userData,
          token: token,
          role: userData.role
        })
        localStorage.setItem('auth_token', token)
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          role: null
        })
        localStorage.removeItem('auth_token')
      },
      
      checkAuth: () => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          // In real app, validate token with backend
          return token
        }
        return null
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)

export default useAuthStore
