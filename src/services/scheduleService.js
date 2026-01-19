// Mock schedule data
const mockSchedules = [
  {
    id: 'sched-1',
    student_id: 'stu-1',
    coach_id: 'coach-1',
    batch_id: null,
    title: '1-on-1 Session',
    start: '2024-01-20T10:00:00',
    end: '2024-01-20T11:00:00',
    type: '1-1',
    status: 'scheduled'
  },
  {
    id: 'sched-2',
    student_id: 'stu-1',
    coach_id: 'coach-1',
    batch_id: null,
    title: '1-on-1 Session',
    start: '2024-01-22T14:00:00',
    end: '2024-01-22T15:00:00',
    type: '1-1',
    status: 'scheduled'
  },
  {
    id: 'sched-3',
    student_id: 'stu-2',
    coach_id: 'coach-1',
    batch_id: 'batch-1',
    title: 'Group Session - Beginner Batch A',
    start: '2024-01-19T16:00:00',
    end: '2024-01-19T17:00:00',
    type: 'group',
    status: 'scheduled'
  }
]

const scheduleService = {
  getByStudentId: async (studentId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockSchedules.filter(s => s.student_id === studentId)
  },
  
  getUpcoming: async (studentId, limit = 3) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const now = new Date()
    return mockSchedules
      .filter(s => s.student_id === studentId && new Date(s.start) > now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, limit)
  },
  
  getByCoachId: async (coachId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockSchedules.filter(s => s.coach_id === coachId)
  },
  
  getByDate: async (date) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const dateStr = new Date(date).toISOString().split('T')[0]
    return mockSchedules.filter(s => s.start.startsWith(dateStr))
  },
  
  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newSchedule = {
      id: `sched-${Date.now()}`,
      ...data
    }
    mockSchedules.push(newSchedule)
    return newSchedule
  }
}

export default scheduleService
