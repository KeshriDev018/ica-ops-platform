import { mockStudents } from './mockData'

let students = [...mockStudents]

const studentService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return students
  },
  
  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const student = students.find(s => s.student_id === id)
    if (!student) throw new Error('Student not found')
    return student
  },
  
  getByAccountId: async (accountId) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return students.filter(s => s.account_id === accountId)
  },
  
  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newStudent = {
      student_id: `stu-${Date.now()}`,
      ...data
    }
    students.push(newStudent)
    return newStudent
  },
  
  update: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const student = students.find(s => s.student_id === id)
    if (!student) throw new Error('Student not found')
    Object.assign(student, data)
    return student
  }
}

export default studentService
