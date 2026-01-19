import { mockBatches } from './mockData'

let batches = [...mockBatches]

const batchService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return batches
  },
  
  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const batch = batches.find(b => b.batch_id === id)
    if (!batch) throw new Error('Batch not found')
    return batch
  },
  
  getByCoachId: async (coachId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return batches.filter(b => b.coach_id === coachId)
  },
  
  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newBatch = {
      batch_id: `batch-${Date.now()}`,
      ...data
    }
    batches.push(newBatch)
    return newBatch
  },
  
  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const batch = batches.find(b => b.batch_id === id)
    if (!batch) throw new Error('Batch not found')
    Object.assign(batch, data)
    return batch
  }
}

export default batchService
