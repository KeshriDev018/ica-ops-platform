// Mock data matching backend specification

export const mockAccounts = [
  {
    account_id: 'acc-1',
    email: 'admin@chessacademy.com',
    role: 'ADMIN'
  },
  {
    account_id: 'acc-2',
    email: 'coach1@chessacademy.com',
    role: 'COACH'
  },
  {
    account_id: 'acc-3',
    email: 'parent1@example.com',
    role: 'CUSTOMER'
  },
  {
    account_id: 'acc-4',
    email: 'test@example.com',
    role: 'CUSTOMER'
  }
]

export const mockStudents = [
  {
    student_id: 'stu-1',
    account_id: 'acc-3',
    student_name: 'Rohan Sharma',
    student_age: 12,
    parent_name: 'Deepika Sharma',
    parent_email: 'parent1@example.com',
    timezone: 'Asia/Kolkata',
    country: 'India',
    student_type: '1-1',
    level: 'Intermediate',
    chess_usernames: { chess_com: 'rohan_chess', lichess: 'rohan123' },
    rating: 1200,
    assigned_coach_id: 'coach-1',
    assigned_batch_id: null,
    status: 'ACTIVE'
  },
  {
    student_id: 'stu-2',
    account_id: 'acc-3',
    student_name: 'Ananya Patel',
    student_age: 10,
    parent_name: 'Rajesh Patel',
    parent_email: 'parent2@example.com',
    timezone: 'Asia/Kolkata',
    country: 'India',
    student_type: 'group',
    level: 'Beginner',
    chess_usernames: {},
    rating: 800,
    assigned_coach_id: 'coach-1',
    assigned_batch_id: 'batch-1',
    status: 'ACTIVE'
  }
]

export const mockDemos = [
  {
    demo_id: 'demo-1',
    student_name: 'New Student',
    parent_name: 'New Parent',
    parent_email: 'newparent@example.com',
    timezone: 'Asia/Kolkata',
    scheduled_start: '2024-01-15T10:00:00',
    scheduled_end: '2024-01-15T11:00:00',
    coach_id: 'coach-1',
    admin_id: 'acc-1',
    meeting_link: 'https://meet.example.com/demo-1',
    status: 'BOOKED',
    recommended_student_type: null,
    recommended_level: null,
    admin_notes: null,
    payment_status: 'PENDING',
    payment_date: null,
    preferred_language: 'English'
  },
  {
    demo_id: 'demo-2',
    student_name: 'Another Student',
    parent_name: 'Another Parent',
    parent_email: 'another@example.com',
    timezone: 'Asia/Kolkata',
    scheduled_start: '2024-01-16T14:00:00',
    scheduled_end: '2024-01-16T15:00:00',
    coach_id: 'coach-1',
    admin_id: 'acc-1',
    meeting_link: 'https://meet.example.com/demo-2',
    status: 'ATTENDED',
    recommended_student_type: 'group',
    recommended_level: 'Beginner',
    admin_notes: 'Student showed great interest',
    payment_status: 'PENDING',
    payment_date: null,
    preferred_language: 'English'
  },
  {
    demo_id: 'demo-3',
    student_name: 'Test Student',
    parent_name: 'Test Parent',
    parent_email: 'test@example.com',
    timezone: 'Asia/Kolkata',
    scheduled_start: '2024-01-20T10:00:00',
    scheduled_end: '2024-01-20T11:00:00',
    coach_id: 'coach-1',
    admin_id: 'acc-1',
    meeting_link: 'https://meet.example.com/demo-3',
    status: 'ATTENDED',
    recommended_student_type: '1-1',
    recommended_level: 'Intermediate',
    admin_notes: 'Ready for subscription',
    payment_status: 'PENDING',
    payment_date: null,
    preferred_language: 'English'
  }
]

export const mockSubscriptions = [
  {
    subscription_id: 'sub-1',
    account_id: 'acc-3',
    plan_id: 'plan-1on1',
    amount: 5000,
    billing_cycle: 'monthly',
    status: 'ACTIVE',
    started_at: '2024-01-01T00:00:00',
    next_due_at: '2024-02-01T00:00:00'
  }
]

export const mockCoaches = [
  {
    coach_id: 'coach-1',
    account_id: 'acc-2',
    name: 'GM Rahul Sharma',
    title: 'Grandmaster, Head Coach',
    email: 'coach1@chessacademy.com'
  }
]

export const mockBatches = [
  {
    batch_id: 'batch-1',
    batch_name: 'Beginner Batch A',
    coach_id: 'coach-1',
    student_ids: ['stu-2'],
    schedule: 'Mon, Wed, Fri 4:00 PM - 5:00 PM',
    status: 'ACTIVE'
  }
]
