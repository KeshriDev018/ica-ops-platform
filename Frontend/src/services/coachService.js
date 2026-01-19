import { mockCoaches, mockBatches, mockStudents } from './mockData'

const coachService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockCoaches
  },
  
  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const coach = mockCoaches.find(c => c.coach_id === id)
    if (!coach) throw new Error('Coach not found')
    return coach
  },
  
  getBatches: async (coachId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockBatches.filter(b => b.coach_id === coachId)
  },
  
  getStudents: async (coachId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockStudents.filter(s => s.assigned_coach_id === coachId)
  }
}

export default coachService
