import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useDemoStore = create(
  persist(
    (set, get) => ({
      // Demo account data
      demoData: null,
      demoEmail: null,
      isAuthenticated: false,
      
      // Set demo data after booking
      setDemoData: (data) => {
        set({
          demoData: data,
          demoEmail: data?.parentEmail || null,
          isAuthenticated: true
        })
      },
      
      // Set demo email for login
      setDemoEmail: (email) => {
        set({ demoEmail: email })
      },
      
      // Clear demo data on logout
      clearDemoData: () => {
        set({
          demoData: null,
          demoEmail: null,
          isAuthenticated: false
        })
      },
      
      // Check if demo exists for email
      hasDemoAccess: () => {
        const { demoData, demoEmail } = get()
        return !!(demoData && demoEmail)
      },
      
      // Update demo with payment status
      updateDemoPaymentStatus: (status) => {
        const { demoData } = get()
        if (demoData) {
          set({
            demoData: {
              ...demoData,
              payment_status: status,
              payment_date: new Date().toISOString()
            }
          })
        }
      },
      
      // Update demo with meeting link (from backend)
      updateDemoMeetingLink: (link) => {
        const { demoData } = get()
        if (demoData) {
          set({
            demoData: {
              ...demoData,
              meeting_link: link
            }
          })
        }
      }
    }),
    {
      name: 'demo-storage',
      // Only persist demo data, not authentication state
      partialize: (state) => ({
        demoData: state.demoData,
        demoEmail: state.demoEmail
      })
    }
  )
)

export default useDemoStore
