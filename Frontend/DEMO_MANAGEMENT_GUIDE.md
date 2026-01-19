# Demo Management System - Complete Guide

## Overview

The demo management system now provides comprehensive workflow management for demo classes, from scheduling to attendance tracking to outcome submission.

## Features Implemented

### 1. **BOOKED Demos Management**

For demos in BOOKED status, admins have two action buttons:

#### Schedule Button

- **Purpose**: Assign coach and set up meeting link
- **Fields**:
  - Coach selection (dropdown)
  - Meeting link (URL input)
- **Validation**:
  - Coach is required
  - Meeting link must be valid URL (starts with http:// or https://)
- **Backend Endpoint**: `POST /api/demos/:id/schedule`

#### Mark Attendance Button

- **Purpose**: Record whether student attended or not
- **Options**:
  - ✅ ATTENDED - Student attended the demo
  - ❌ NO_SHOW - Student didn't show up
  - 🔄 RESCHEDULED - Demo needs to be rescheduled
  - ⛔ CANCELLED - Demo was cancelled
- **UI**: Radio button selection with color-coded borders
- **Backend Endpoint**: `POST /api/demos/:id/attendance`

### 2. **ATTENDED Demos Management**

#### Submit Outcome Button

- **Purpose**: Record demo outcome and recommendations
- **Fields**:
  - **Outcome Status** (Required):
    - INTERESTED - Student wants to continue
    - NOT_INTERESTED - Student doesn't want to continue
  - **Recommended Student Type** (Required):
    - 1-on-1 Coaching
    - Group Coaching
  - **Recommended Level** (Required):
    - Free text input (e.g., Beginner, Intermediate, Advanced)
  - **Admin Notes** (Optional):
    - Textarea for additional observations
- **Validation**:
  - Outcome status is required
  - Recommended level cannot be empty
- **Backend Endpoint**: `POST /api/demos/:id/outcome`

### 3. **Other Status Demos**

For demos with other statuses (NO_SHOW, RESCHEDULED, CANCELLED, INTERESTED, NOT_INTERESTED, PAYMENT_PENDING, CONVERTED, DROPPED):

- **View Details** button available
- Opens schedule modal in read-only mode to view demo information

## Modal Modes

The `DemoOutcomeModal` component operates in three distinct modes:

### Mode: 'schedule'

- Displays coach selection and meeting link form
- Used for scheduling and rescheduling demos
- Shows current assignment if demo already has coach/link

### Mode: 'attendance'

- Displays 4 attendance options as radio buttons
- Large clickable cards with gold highlighting
- Submit button labeled "Mark Attendance"

### Mode: 'outcome'

- Displays outcome radio buttons (INTERESTED/NOT_INTERESTED)
- Shows recommended student type dropdown
- Shows recommended level text input
- Shows admin notes textarea
- Submit button labeled "Submit Outcome"

## Workflow Diagram

```
BOOKED
├── Schedule → Assign coach + meeting link
└── Mark Attendance → ATTENDED | NO_SHOW | RESCHEDULED | CANCELLED
    └── ATTENDED
        └── Submit Outcome → INTERESTED | NOT_INTERESTED
            ├── INTERESTED → (Can lead to PAYMENT_PENDING/CONVERTED)
            └── NOT_INTERESTED → (Can lead to DROPPED)
```

## Technical Implementation

### File Structure

```
Frontend/
├── src/
│   ├── components/
│   │   └── admin/
│   │       └── DemoOutcomeModal.jsx (Modal with 3 modes)
│   ├── pages/
│   │   └── admin/
│   │       └── Demos.jsx (Demo listing with action buttons)
│   └── services/
│       └── demoService.js (API calls)
```

### API Endpoints Used

1. **Schedule Demo**
   - Method: `POST`
   - URL: `/api/demos/:id/schedule`
   - Body: `{ coachId, meetingLink }`

2. **Mark Attendance**
   - Method: `POST`
   - URL: `/api/demos/:id/attendance`
   - Body: `{ status: "ATTENDED" | "NO_SHOW" | "RESCHEDULED" | "CANCELLED" }`

3. **Submit Outcome**
   - Method: `POST`
   - URL: `/api/demos/:id/outcome`
   - Body: `{ status, recommendedStudentType, recommendedLevel, adminNotes }`

### Service Methods (demoService.js)

```javascript
// Schedule demo with coach and meeting link
schedule(demoId, data) {
  return api.post(`/demos/${demoId}/schedule`, data)
}

// Mark demo attendance
markAttendance(demoId, status) {
  return api.post(`/demos/${demoId}/attendance`, { status })
}

// Submit demo outcome
submitOutcome(demoId, data) {
  return api.post(`/demos/${demoId}/outcome`, data)
}
```

## User Interface

### Tab System

- **BOOKED** - Shows all booked demos with schedule + attendance buttons
- **ATTENDED** - Shows attended demos with outcome submission button
- **OTHERS** - Shows all other statuses with sub-filter dropdown

### Action Buttons

- **Primary buttons** (blue background): Main actions (Schedule, Submit Outcome)
- **Outline buttons** (white background): Secondary actions (Mark Attendance, View Details)
- **Disabled state**: Gray background when loading or conditions not met

### Modal Design

- Full modal overlay with semi-transparent black background
- White card with rounded corners and shadow
- Three sections:
  1. Header: Title with close button
  2. Demo details: Gray background section showing student/parent info
  3. Form: Mode-specific form fields with validation
- Responsive layout with proper spacing

## Validation Rules

### Schedule Form

- ✅ Coach must be selected
- ✅ Meeting link must be valid URL
- ⚠️ Warning shown if no coaches available

### Attendance Form

- ✅ One attendance status must be selected

### Outcome Form

- ✅ Outcome status (INTERESTED/NOT_INTERESTED) required
- ✅ Recommended level cannot be empty
- ✅ Recommended student type defaults to "1-1"
- ℹ️ Admin notes are optional

## Error Handling

All forms include:

- Field-level error messages (red text below inputs)
- Form-level error messages (red box at top of form)
- Loading states with disabled buttons
- Success: Modal closes and demo list refreshes
- Failure: Error message displayed without closing modal

## Status Badge Colors

- **BOOKED**: Blue (bg-blue-100 text-blue-800)
- **ATTENDED**: Green (bg-green-100 text-green-800)
- **INTERESTED**: Green (bg-green-100 text-green-800)
- **NOT_INTERESTED**: Orange (bg-orange-100 text-orange-800)
- **PAYMENT_PENDING**: Yellow (bg-yellow-100 text-yellow-800)
- **CONVERTED**: Green (bg-green-100 text-green-800)
- **NO_SHOW**: Red (bg-red-100 text-red-800)
- **CANCELLED**: Red (bg-red-100 text-red-800)
- **Others**: Gray (bg-gray-100 text-gray-800)

## Best Practices

1. **Always schedule demo before marking attendance** - Assign coach and meeting link first
2. **Mark attendance immediately after demo** - Update status as soon as demo completes
3. **Submit outcome within 24 hours** - Record recommendations while feedback is fresh
4. **Use admin notes** - Document any special observations or requirements
5. **Verify student type** - Choose between 1-on-1 and group based on demo interaction

## Future Enhancements (Optional)

- [ ] Bulk actions (mark multiple demos attended at once)
- [ ] Email notifications when demo is scheduled
- [ ] Calendar integration for demo scheduling
- [ ] Auto-reschedule feature with date picker
- [ ] Demo feedback from coach
- [ ] Parent feedback collection
- [ ] Analytics dashboard for demo conversion rates
