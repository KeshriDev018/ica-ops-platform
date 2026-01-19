import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      demoAccountLinked: false,
      
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
          role: null,
          demoAccountLinked: false
        })
        localStorage.removeItem('auth_token')
      },
      
      linkDemoAccount: (demoData) => {
        // Link demo account data to the authenticated user
        const currentUser = get().user
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              demo_info: demoData,
              linked_from_demo: true
            },
            demoAccountLinked: true
          })
        }
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
