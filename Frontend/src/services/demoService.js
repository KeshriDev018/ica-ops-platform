import { mockDemos } from './mockData'

let demos = [...mockDemos]

const demoService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return demos
  },
  
  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const demo = demos.find(d => d.demo_id === id)
    if (!demo) throw new Error('Demo not found')
    return demo
  },
  
  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newDemo = {
      demo_id: `demo-${Date.now()}`,
      ...data,
      scheduled_end: data.scheduled_end || new Date(new Date(data.scheduled_start).getTime() + 60 * 60 * 1000).toISOString(),
      coach_id: data.coach_id || 'coach-1',
      admin_id: data.admin_id || 'acc-1',
      meeting_link: `https://meet.example.com/${Date.now()}`
    }
    demos.push(newDemo)
    return newDemo
  },
  
  updateStatus: async (id, status) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const demo = demos.find(d => d.demo_id === id)
    if (!demo) throw new Error('Demo not found')
    demo.status = status
    return demo
  },
  
  updateOutcome: async (id, outcome) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const demo = demos.find(d => d.demo_id === id)
    if (!demo) throw new Error('Demo not found')
    Object.assign(demo, outcome)
    return demo
  }
}

export default demoService
