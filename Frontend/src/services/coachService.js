import api from '../lib/api'

const coachService = {
  getAll: async () => {
    const response = await api.get('/coach')
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/coach/${id}`)
    return response.data
  },

  create: async (coachData) => {
    const response = await api.post('/coach/create', coachData)
    return response.data
  },
  
  getBatches: async (coachId) => {
    const response = await api.get(`/coach/${coachId}/batches`)
    return response.data
  },
  
  getStudents: async (coachId) => {
    const response = await api.get(`/coach/${coachId}/students`)
    return response.data
  }
}

export default coachService
