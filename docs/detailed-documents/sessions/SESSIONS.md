# Sessions Module Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Routing](#routing)
4. [Data Flow](#data-flow)
5. [API Integration](#api-integration)
6. [Component Structure](#component-structure)
7. [Session Management](#session-management)
8. [Filtering System](#filtering-system)
9. [Role-Based Access](#role-based-access)
10. [State Management](#state-management)
11. [UI Components](#ui-components)
12. [Analytics & Reporting](#analytics--reporting)
13. [File References](#file-references)

---

## Overview

The Sessions Module is a comprehensive system for managing, viewing, and analyzing class sessions in the Tuitional LMS. It provides role-based access to session data with powerful filtering capabilities, real-time updates, and detailed analytics.

### Key Features

- Multi-role support (Admin, Teacher, Student, Parent)
- Advanced filtering and search capabilities
- Real-time data fetching with auto-refresh
- Session creation, editing, and deletion (Admin only)
- Excel export functionality
- Mobile-responsive design
- Session analytics and reporting
- Integration with enrollments and class schedules

### Session Types

Sessions are categorized by their **conclusion type**:

- **Conducted**: Successfully completed sessions
- **Cancelled**: Sessions that were cancelled
- **Teacher Absent**: Teacher did not attend
- **Student Absent**: Student did not attend
- **No Show**: Neither party showed up

### Session Tags

Sessions can be tagged as:

- **Normal**: Regular scheduled sessions
- **Extra**: Additional sessions beyond schedule
- **Manual**: Manually created sessions
- **External**: Sessions from external sources

### Session Creation

Sessions can be created in two ways:

1. **Automatic Creation** (from Class Schedules):

   - After a scheduled class is held, the system automatically creates a session record
   - **Important**: Sessions are created **50 minutes after the class is held**, not immediately
   - This delay ensures the class has been completed before the session record is generated
   - Automatically captures attendance, duration, and other class data

2. **Manual Creation** (Admin only):
   - Admins can manually create sessions through the "Add Session" feature
   - Useful for retroactive session records or special cases
   - Requires selecting an enrollment, date, time, duration, and conclusion type

---

## Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Data Fetching**: TanStack Query (React Query) + Axios
- **State Management**: Redux Toolkit with Redux Persist
- **UI Components**: Material-UI (MUI)
- **Styling**: CSS Modules

### Directory Structure

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
src/
├── app/(protected)/[role]/
│   ├── sessions/
│   │   └── page.tsx                  # Sessions list route
│   └── session-details/[id]/
│       └── page.tsx                  # Session details route
├── screens/
│   ├── sessions/
│   │   └── sessions.tsx              # Main sessions screen
│   └── session-details/
│       └── session-details.tsx       # Session details screen
├── components/ui/superAdmin/sessions/
│   ├── session-table/                # Desktop table view
│   ├── mobileViewCard/               # Mobile card view
│   ├── add-modal/                    # Create session modal
│   └── ...                           # Other session components
├── services/dashboard/superAdmin/sessions/
│   └── sessions.ts                   # Session service layer
├── api/
│   └── sessions.api.ts               # API endpoint definitions
├── types/sessions/
│   ├── getAllSessionsWithGroupIds.types.ts
│   └── ...                           # Type definitions
└── utils/helpers/
    └── sessionType-styles.ts         # Styling utilities
</pre>

---

## Routing

### Main Routes

#### Sessions List

- **Path**: /{role}/sessions
- **File**: src/app/(protected)/[role]/sessions/page.tsx
- **Screen**: src/screens/sessions/sessions.tsx
- **Access**: Admin, SuperAdmin, HR, Counsellor, Teacher, Student, Parent

#### Session Details

- **Path**: /{role}/session-details/{id}
- **File**: src/app/(protected)/[role]/session-details/[id]/page.tsx
- **Screen**: src/screens/session-details/session-details.tsx
- **Access**: All authenticated users (content varies by role)

### Navigation

Sessions is accessible from the sidebar navigation:

- **Icon**: /assets/svgs/menuBarIcons/sessions.svg
- **Label**: "Sessions"
- **Route**: /{baseRoute}/sessions

**Reference**: src/const/dashboard/sidebarData.ts

---

## Data Flow

### Flow Chart

Flow Chart Link: https://tinyurl.com/bdth4xp4

### High-Level Data Flow

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
User Authentication (Redux Store)
         ↓
Navigate to /sessions
         ↓
Component Mount
         ↓
React Query Fetch:
  ├─ getAllSessionWithGroupIds (sessions list)
  ├─ getSessionsMonthlyTagCount (statistics)
  └─ getAllEnrollments (filter options)
         ↓
Render Sessions List
         ↓
User Actions:
  ├─ Click on Table Row → Navigate to session-details/{id}
  ├─ Click View Details Button → Navigate to session-details/{id}
  ├─ Apply Filters → Refetch with new params
  ├─ Add Session → Create mutation → Success toast → Refetch
  ├─ Edit Session → Update mutation → Success toast → Refetch
  ├─ Delete Session → Delete mutation → Success toast → Refetch
  └─ Reload Session → Recreate mutation → Success toast → Refetch
         ↓
Auto-refetch every 60 seconds (configurable)
</pre>

### Automatic Session Creation Flow

Sessions are automatically created from class schedules with a 50-minute delay:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Class Schedule Execution (Class is held)
         ↓
System waits 50 minutes
         ↓
Attendance data finalized
Recording data captured
         ↓
Automatic Session Creation Triggered
         ↓
Session Record Created:
  ├─ Enrollment information
  ├─ Student and teacher data
  ├─ Actual duration from class schedule
  ├─ Attendance records
  ├─ Conclusion type (based on attendance)
  ├─ Meet recording link (if available)
  └─ Associated transactions
         ↓
Session appears in Sessions List
         ↓
Users can view/edit the session
</pre>

**Important Notes**:

- **50-minute delay** is enforced to ensure class completion
- Session will not appear immediately after class ends
- Manual session creation is available for immediate needs
- Automatic sessions inherit all data from the class schedule
- Conclusion type is determined by attendance patterns

---

## API Integration

### API Endpoints

**Base URL**: Configured in environment variables

| Endpoint                                    | Method | Purpose                         | Access     |
| ------------------------------------------- | ------ | ------------------------------- | ---------- |
| /api/v1/sessions/getAllSessionsWithGroupIds | GET    | Fetch all sessions with filters | All roles  |
| /api/sessions                               | POST   | Create new session              | Admin only |
| /api/sessions/{id}                          | PUT    | Update session                  | Admin only |
| /api/sessions/{id}                          | DELETE | Delete session                  | Admin only |
| /api/sessions/recreate/{id}                 | GET    | Recreate/reload session         | Admin only |
| /api/sessions/monthly-tag-count             | GET    | Get monthly session statistics  | All roles  |
| /api/sessions                               | GET    | Export sessions to Excel        | Admin only |

**File**: src/api/sessions.api.ts

### Service Functions

**File**: src/services/dashboard/superAdmin/sessions/sessions.ts

#### Main Functions

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Fetch all sessions with filtering
getAllSessionWithGroupIds(
  payload
)

// Create new session
createSession(payload)

// Update session
updateSession(sessionId, payload)

// Delete session
deleteSession(sessionId)

// Recreate session
recreacteSession(sessionId)

// Export sessions to Excel
getSessionsExcelData(payload)
</pre>

### Query Parameters

#### getAllSessionsWithGroupIds Parameters

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Pagination
page              // Page number (default: 1)
limit             // Items per page (default: 15)

// Date filters
start_time        // ISO 8601 date (e.g., "2025-01-01")
end_time          // ISO 8601 date

// User filters
student_ids       // Comma-separated IDs (e.g., "1,2,3")
student_name      // Search by student name
tutor_id          // Filter by teacher ID

// Enrollment filters
enrollment_id     // Filter by enrollment ID

// Educational filters
subject_id        // Filter by subject
board_id          // Filter by board
curriculum_id     // Filter by curriculum
grade_id          // Filter by grade

// Status filter
conclusion_type   // "Conducted" | "Cancelled" | "Teacher Absent" | "Student Absent" | "No Show"
</pre>

### Response Types

#### Session List Response

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
GetAllSessionsWithGroupIds_Response_Type:
  - data: Session[]
  - pagination:
      - currentPage: number
      - totalPages: number
      - totalItems: number
      - itemsPerPage: number

Session:
  - id: number
  - enrollment_id: number
  - class_schedule_id: number
  - duration: number (In minutes)
  - tutor_class_time: number
  - tutor_scaled_class_time: number
  - conclusion_type: string
  - tag: string
  - created_at: string (ISO 8601)
  - tutor:
      - id: number
      - name: string
      - email: string
      - profileImageUrl: string
  - subject:
      - id: number
      - name: string
  - students: Array of:
      - id: number
      - name: string
      - email: string
      - profileImageUrl: string
  - meet_recording: string (optional)
</pre>

#### Create Session Payload

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Create_Session_Payload_Type:
  - tutor_class_time: number (In minutes)
  - conclusion_type: string (Session status)
  - tutor_scaled_class_time: number
  - enrollment_id: number
  - created_at: string (ISO 8601 datetime)
  - duration: number (Optional duration override)
</pre>

---

## Component Structure

### Main Sessions Screen

**File**: src/screens/sessions/sessions.tsx

#### Component Hierarchy

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Sessions (Main Screen)
├─ FilterByDate (Date range picker)
├─ MultiSelectDropDown (Students filter)
├─ MultiSelectDropDown (Teachers filter)
├─ MultiSelectDropDown (Subjects filter)
├─ MultiSelectDropDown (Boards filter)
├─ MultiSelectDropDown (Grades filter)
├─ MultiSelectDropDown (Curriculum filter)
├─ MultiSelectDropDown (Conclusion Type filter)
├─ TextField (Enrollment ID search - Admin only)
├─ Button (Add Session - Admin only)
├─ Button (Export to Excel - Admin only)
├─ Desktop View
│   └─ SessionTable
│       ├─ Table Header
│       ├─ Table Body (Session rows)
│       └─ Pagination Controls
└─ Mobile View
    └─ MobileViewCard
        ├─ Summary Cards (Conducted, Cancelled, etc.)
        └─ Session Cards (Clickable)
</pre>

#### Key Features

1. **Multi-Role Support**

   - Automatically filters sessions based on user role
   - Admin/SuperAdmin: View all sessions
   - Teacher: View own sessions (tutor_id filter)
   - Student: View enrolled sessions (student_id filter)
   - Parent: View children's sessions

2. **Advanced Filtering**

   - Date range selection
   - Multiple students selection
   - Multiple teachers selection
   - Subject, Board, Grade, Curriculum filters
   - Conclusion type filter (Conducted, Cancelled, etc.)
   - Enrollment ID search (Admin only)

3. **Auto-Refresh**

   - React Query refetches data every 60 seconds
   - Ensures data is always up-to-date
   - Configurable via refetchInterval option

4. **Responsive Design**

   - Desktop: Table view with all columns
   - Mobile: Card-based layout with summary statistics

5. **Admin Actions**
   - Add new session
   - Delete session
   - Reload/recreate session
   - Export to Excel

#### React Query Hooks

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Fetch sessions list
useQuery:
  queryKey: ["getAllSessionWithGroupIds", payload]
  queryFn: getAllSessionWithGroupIds(payload)
  refetchInterval: 60000 (Auto-refresh every 60 seconds)

// Fetch session statistics
useQuery:
  queryKey: ["getSessionsMonthlyTagCount", tagCountPayload]
  queryFn: getSessionsMonthlyTagCount(tagCountPayload)
  refetchInterval: 60000

// Fetch enrollments for dropdowns
useQuery:
  queryKey: ["getAllEnrollments"]
  queryFn: getAllEnrollments
</pre>

#### Mutations

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Create session
createMutation:
  mutationFn: createSession
  onSuccess: 
    - invalidateQueries(["getAllSessionWithGroupIds"])
    - toast.success("Session created successfully")

// Delete session
deleteMutation:
  mutationFn: deleteSession
  onSuccess:
    - invalidateQueries(["getAllSessionWithGroupIds"])
    - toast.success("Session deleted successfully")

// Reload session
reloadMutation:
  mutationFn: recreacteSession
  onSuccess:
    - invalidateQueries(["getAllSessionWithGroupIds"])
    - toast.success("Session reloaded successfully")
</pre>

---

## Session Management

Sessions in the Tuitional LMS can be created through two methods: **Automatic Creation** from class schedules and **Manual Creation** by administrators.

### Automatic Session Creation

Sessions are automatically generated from class schedules with the following behavior:

**Timing**:

- Sessions are created **50 minutes after a class is held**
- This 50-minute delay ensures:
  - The class has been completed
  - Attendance data is finalized
  - Recording and other class data are captured
  - Prevents premature session creation during ongoing classes

**Process**:

1. Class schedule is executed (class is held)
2. System waits for 50 minutes
3. Session record is automatically created with:
   - Enrollment information
   - Student and teacher data
   - Actual duration from class schedule
   - Attendance records
   - Conclusion type (based on attendance)
   - Meet recording link (if available)
   - Associated transactions

**Note**: If you need to view or edit a session immediately after a class, you may need to wait for the 50-minute delay to complete, or use the manual creation feature.

### Creating Sessions Manually (Admin Only)

**Component**: src/components/ui/superAdmin/sessions/add-modal/add-modal.tsx

#### Create Session Flow

1. **Open Add Modal**

   - Click "Add Session" button in sessions list
   - Modal opens with empty form

2. **Fill Form Fields**

   - **Enrollment** (required): Searchable dropdown
     - Shows: Enrollment ID, Student Name, Teacher Name
     - Auto-populates student and teacher info
   - **Date** (required): Date picker
   - **Time** (required): Time picker (HH:mm format)
   - **Duration** (optional): Minutes (auto-calculated from enrollment)
   - **Conclusion Type** (required): Dropdown
     - Options: Conducted, Cancelled, Teacher Absent, Student Absent, No Show

3. **Validation**

   - All required fields must be filled
   - Date and time must be valid
   - Duration must be a positive number (if provided)

4. **Submit**
   - Form data is sent to createSession API
   - On success: Toast notification + Modal closes + Sessions refetch
   - On error: Error toast displayed

#### Code Example

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
handleSubmit function:
  
  Create payload with:
    - enrollment_id from selectedEnrollment.id
    - created_at from date and time (format: dateT time:00)
    - tutor_class_time from duration
    - tutor_scaled_class_time from duration
    - conclusion_type from conclusionType
    - duration from duration

  Call createMutation.mutate(payload)
</pre>

**Reference**: src/components/ui/superAdmin/sessions/add-modal/add-modal.tsx:45-120

### Editing Sessions (Admin Only)

Sessions can be edited from the session details page. See session-details documentation for complete edit flow.

### Deleting Sessions (Admin Only)

**Component**: src/components/ui/superAdmin/sessions/delete-modal/delete-modal.tsx

#### Delete Flow

1. Click "Delete" icon in session row
2. Confirmation modal appears
3. User confirms deletion
4. deleteSession API called
5. On success: Toast notification + Sessions refetch
6. On error: Error toast displayed

**Reference**: src/screens/sessions/sessions.tsx:234-245

### Reloading Sessions (Admin Only)

Sessions can be reloaded/recreated to refresh data from the source system.

#### Reload Flow

1. Click "Reload" icon in session row
2. recreacteSession API called
3. On success: Toast notification + Sessions refetch
4. On error: Error toast displayed

**Reference**: src/screens/sessions/sessions.tsx:247-256

---

## Filtering System

### Filter Categories

#### 1. Date Range Filter

**Component**: FilterByDate

- Allows selection of start and end dates
- Updates start_time and end_time in query params
- Clears with "Reset" button

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
State: dateRange
  - start_time: ""
  - end_time: ""
</pre>

#### 2. Student Filter

**Component**: MultiSelectDropDown

- Multi-select dropdown of students
- Shows student name and ID
- Updates student_ids param (comma-separated)
- Available for Admin, Teacher, Parent roles

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
State: selectedStudents (array of numbers)
Query param: student_ids = "1,2,3"
</pre>

#### 3. Teacher Filter

**Component**: MultiSelectDropDown

- Multi-select dropdown of teachers
- Shows teacher name and ID
- Updates tutor_id param
- Available for Admin, Student, Parent roles

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
State: selectedTeacher (number or null)
</pre>

#### 4. Educational Filters

**Subjects, Boards, Grades, Curriculum**

- Multi-select dropdowns
- Fetched from Redux store (resources)
- Updates respective query params

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
States:
  - selectedSubjects (array of numbers)
  - selectedBoards (array of numbers)
  - selectedGrades (array of numbers)
  - selectedCurriculum (array of numbers)
</pre>

#### 5. Conclusion Type Filter

**Component**: MultiSelectDropDown

- Multi-select dropdown of session statuses
- Options: Conducted, Cancelled, Teacher Absent, Student Absent, No Show
- Updates conclusion_type param

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
State: selectedConclusionTypes (array of strings)
</pre>

#### 6. Enrollment ID Search (Admin Only)

**Component**: TextField

- Direct input field for enrollment ID
- Searches for specific enrollment
- Updates enrollment_id param

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
State: enrollmentId (string)
</pre>

### Filter Application

Filters are applied automatically when changed:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
useEffect hook builds payload with all active filters:
  - page: currentPage
  - limit: rowsPerPage
  - start_time: dateRange.start_time
  - end_time: dateRange.end_time
  - student_ids: selectedStudents.join(",")
  - tutor_id: selectedTeacher
  - subject_id: selectedSubjects[0]
  - board_id: selectedBoards[0]
  - ... other filters

React Query automatically refetches when payload changes
</pre>

**Reference**: src/screens/sessions/sessions.tsx:150-220

### Clearing Filters

Each filter can be cleared individually or all at once:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
handleResetFilters function:
  - setDateRange to empty start_time and end_time
  - setSelectedStudents to empty array
  - setSelectedTeacher to null
  - setSelectedSubjects to empty array
  - ... reset other filters
</pre>

---

## Role-Based Access

### Access Control Matrix

| Feature           | Admin | SuperAdmin | Teacher | Student  | Parent     |
| ----------------- | ----- | ---------- | ------- | -------- | ---------- |
| View Sessions     | All   | All        | Own     | Enrolled | Children's |
| Add Session       | ✓     | ✓          | ✗       | ✗        | ✗          |
| Edit Session      | ✓     | ✓          | ✗       | ✗        | ✗          |
| Delete Session    | ✓     | ✓          | ✗       | ✗        | ✗          |
| Reload Session    | ✓     | ✓          | ✗       | ✗        | ✗          |
| Export Excel      | ✓     | ✓          | ✗       | ✗        | ✗          |
| Filter by Student | ✓     | ✓          | ✓       | ✗        | ✓          |
| Filter by Teacher | ✓     | ✓          | ✗       | ✓        | ✓          |
| Search Enrollment | ✓     | ✓          | ✗       | ✗        | ✗          |
| View Transactions | ✓     | ✓          | ✗       | ✗        | ✗          |

### Role-Specific Payloads

#### Admin/SuperAdmin

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
payload:
  - page: currentPage
  - limit: rowsPerPage
  - All filters available
  - student_ids: selectedStudents.join(",")
  - tutor_id: selectedTeacher
  - enrollment_id: enrollmentId
  - ... all filters
</pre>

#### Teacher

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
payload:
  - page: currentPage
  - limit: rowsPerPage
  - tutor_id: userData.id (Auto-filtered to own sessions)
  - student_ids: selectedStudents.join(",")
  - Limited filters
</pre>

#### Student

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
payload:
  - page: currentPage
  - limit: rowsPerPage
  - student_ids: userData.id.toString() (Auto-filtered to own sessions)
  - tutor_id: selectedTeacher
  - Limited filters
</pre>

#### Parent

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
payload:
  - page: currentPage
  - limit: rowsPerPage
  - student_ids: childrenIds.join(",") (Auto-filtered to children's sessions)
  - tutor_id: selectedTeacher
  - Limited filters
</pre>

**Reference**: src/screens/sessions/sessions.tsx:180-220

---

## State Management

### Redux Store

**Slices Used**:

- user: Current user data (id, role, name, email)
- resources: Static data (subjects, boards, grades, curriculum)
- usersByGroup: Lists of users by role (students, teachers)

#### Accessing Redux State

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
import useSelector from "react-redux"

userData = useSelector(state.user.userData)
resources = useSelector(state.resources)
usersByGroup = useSelector(state.usersByGroup)
</pre>

### React Query Cache

**Query Keys**:

- ['getAllSessionWithGroupIds', payload]: Sessions list
- ['getSessionsMonthlyTagCount', tagCountPayload]: Session statistics
- ['getAllEnrollments']: Enrollments list for dropdowns

#### Cache Invalidation

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
import useQueryClient from "@tanstack/react-query"

queryClient = useQueryClient()

// Invalidate after create/update/delete
queryClient.invalidateQueries(["getAllSessionWithGroupIds"])
</pre>

### Local Component State

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Pagination
currentPage: useState(1)
rowsPerPage: useState(15)

// Filters
dateRange: useState with start_time: "", end_time: ""
selectedStudents: useState (array of numbers)
selectedTeacher: useState (number or null)
// ... other filters

// Modals
addModalOpen: useState(false)
deleteModalOpen: useState(false)
selectedSession: useState (Session or null)
</pre>

---

## UI Components

### SessionTable Component

**File**: src/components/ui/superAdmin/sessions/session-table/session-table.tsx

#### Features

- Displays sessions in tabular format
- Pagination controls
- Action buttons (View, Edit, Delete, Reload)
- Role-specific column visibility
- **Clickable rows**: Click anywhere on a table row to navigate to session details

#### Row Click Navigation

When a user clicks on any session row in the table, they are automatically redirected to the session details page:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Row click handler
handleRowClick function(sessionId):
  router.push to /{role}/session-details/{sessionId}

// Table row with onClick event
TableRow:
  - onClick: handleRowClick(session.id)
  - style: cursor pointer
  - hover enabled
</pre>

**User Experience**:

- Entire row is clickable for easy navigation
- Cursor changes to pointer on hover
- Row highlights on hover for visual feedback
- Provides quick access to detailed session information
- Alternative to using the "View Details" action button

#### Columns

| Column          | Description                        | Visible For       |
| --------------- | ---------------------------------- | ----------------- |
| Enrollment ID   | Unique enrollment identifier       | Admin, SuperAdmin |
| Tutor Profile   | Teacher name and profile image     | All roles         |
| Student Profile | Student name and profile image     | All roles         |
| Subject         | Subject name                       | All roles         |
| Date            | Session date (formatted)           | All roles         |
| Duration        | Session duration in hours:minutes  | All roles         |
| Status          | Conclusion type badge              | All roles         |
| Actions         | View, Edit, Delete, Reload buttons | Admin, SuperAdmin |

#### Action Buttons

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// View Details
IconButton with VisibilityIcon
  onClick: router.push to /{role}/session-details/{session.id}

// Delete Session (Admin only)
IconButton with DeleteIcon
  onClick: handleDeleteClick(session)

// Reload Session (Admin only)
IconButton with RefreshIcon
  onClick: handleReloadSession(session.id)
</pre>

**Reference**: src/components/ui/superAdmin/sessions/session-table/session-table.tsx:120-250

### MobileViewCard Component

**File**: src/components/ui/superAdmin/sessions/mobileViewCard/mobileViewCard.tsx

#### Features

- Card-based layout for mobile devices
- Summary statistics cards
- Scrollable session cards
- Touch-friendly interface

#### Summary Cards

Displays session counts by conclusion type:

- Conducted: Green card
- Cancelled: Red card
- Teacher Absent: Purple card
- Student Absent: Blue card
- No Show: Orange card

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
SummaryCard component:
  - title: "Conducted"
  - count: tagCountData?.Conducted or 0
  - color: "#286320"
  - bgColor: "#A0FFC0"
</pre>

#### Session Cards

**Clickable cards** that navigate to session details when tapped/clicked. Each card displays:

- Teacher name and profile image
- Student name(s) and profile image(s)
- Subject
- Date and time
- Duration
- Status badge

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Session card with onClick navigation
SessionCard component:
  - session: session data
  - onClick: router.push to /{role}/session-details/{session.id}
</pre>

**User Experience**:

- Entire card is tappable for easy navigation on mobile/tablet
- Touch-friendly interface with adequate spacing
- Visual feedback on tap/click
- Quick access to detailed session information
- Optimized for mobile browsing

**Reference**: src/components/ui/superAdmin/sessions/mobileViewCard/mobileViewCard.tsx:45-180

### Styling Utilities

**File**: src/utils/helpers/sessionType-styles.ts

#### Conclusion Type Styles

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
getConclusionTypeStyles function (type):
  
  "Conducted" returns:
    color: "#286320", backgroundColor: "#A0FFC0"
  
  "Cancelled" returns:
    color: "#653838", backgroundColor: "#FFACAC"
  
  "Teacher Absent" returns:
    color: "#2F3282", backgroundColor: "#DBDCFF"
  
  "Student Absent" returns:
    color: "#05445e", backgroundColor: "#85ddee"
  
  "No Show" returns:
    color: "#CC5500", backgroundColor: "#f9e79f"
  
  default returns:
    color: "#000000", backgroundColor: "#FFFFFF"
</pre>

#### Tag Type Styles

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
getTagTypeStyles function (tag):
  
  "Normal" returns:
    color: "#1976d2", backgroundColor: "#e3f2fd"
  
  "Extra" returns:
    color: "#ed6c02", backgroundColor: "#fff4e5"
  
  "Manual" returns:
    color: "#9c27b0", backgroundColor: "#f3e5f5"
  
  "External" returns:
    color: "#2e7d32", backgroundColor: "#e8f5e9"
  
  default returns:
    color: "#757575", backgroundColor: "#f5f5f5"
</pre>

**Reference**: src/utils/helpers/sessionType-styles.ts:1-50

---

## Analytics & Reporting

### Session Statistics

**Service**: src/services/dashboard/superAdmin/analytics/analytics.ts

#### getSessionsMonthlyTagCount

Fetches aggregated session statistics by conclusion type.

**Parameters**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Optional parameters:
  - tutor_id: number
  - enrollment_id: number
  - subject_id: number
  - user_id: number
  - start_time: string
  - end_time: string
  - grade_id: number
  - curriculum_id: number
  - board_id: number
  - student_name: string
  - student_ids: string
</pre>

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Response object:
  - Conducted: number
  - Cancelled: number
  - TeacherAbsent: number
  - StudentAbsent: number
  - NoShow: number
  - totalConductedHours: number (Total hours of conducted sessions)
  - totalConductedDuration: number (Total minutes of conducted sessions)
</pre>

#### Usage Example

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
useQuery with:
  queryKey: ["getSessionsMonthlyTagCount", filters]
  queryFn: getSessionsMonthlyTagCount(filters)

Access data:
  tagCountData?.Conducted
  tagCountData?.totalConductedHours
</pre>

### Excel Export

**Function**: getSessionsExcelData

Exports sessions data to an Excel file with all filters applied.

#### Export Flow

1. User clicks "Export to Excel" button (Admin only)
2. Current filters are applied to export
3. API returns Excel file as Blob
4. File is automatically downloaded

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
handleExportExcel async function:
  try:
    blob = await getSessionsExcelData(currentFilters)
    url = window.URL.createObjectURL(blob)
    create link element
    link.href = url
    link.download = "sessions_{timestamp}.xlsx"
    link.click()
    toast.success("Export successful")
  catch error:
    toast.error("Export failed")
</pre>

**Reference**: src/screens/sessions/sessions.tsx:258-275

### Dashboard Integration

Sessions are displayed on user dashboards for quick access:

**Files**:

- src/screens/student-teacher-dashboard/components/sessions/sessions.tsx
- Teacher: Shows recent sessions taught
- Student: Shows recent sessions attended

**Features**:

- Displays 5-10 most recent sessions
- Quick overview card with session count
- "View All Sessions" button linking to full sessions page

---

## File References

### Core Files

| File                                                                    | Purpose                  | Lines |
| ----------------------------------------------------------------------- | ------------------------ | ----- |
| src/screens/sessions/sessions.tsx                                       | Main sessions screen     | 450+  |
| src/components/ui/superAdmin/sessions/session-table/session-table.tsx   | Desktop table view       | 300+  |
| src/components/ui/superAdmin/sessions/mobileViewCard/mobileViewCard.tsx | Mobile card view         | 250+  |
| src/components/ui/superAdmin/sessions/add-modal/add-modal.tsx           | Create session modal     | 200+  |
| src/services/dashboard/superAdmin/sessions/sessions.ts                  | Service layer functions  | 180+  |
| src/api/sessions.api.ts                                                 | API endpoint definitions | 80+   |
| src/utils/helpers/sessionType-styles.ts                                 | Styling utilities        | 50+   |

### Type Definitions

| File                                                   | Purpose              |
| ------------------------------------------------------ | -------------------- |
| src/types/sessions/getAllSessionsWithGroupIds.types.ts | Sessions list types  |
| src/types/sessions/create-session.types.ts             | Create session types |
| src/types/sessions/update-session.types.ts             | Update session types |

### Constants

| File                                            | Purpose                   |
| ----------------------------------------------- | ------------------------- |
| src/const/dashboard/session_conclusion_types.ts | Conclusion type constants |
| src/const/dashboard/sidebarData.ts              | Sidebar navigation config |

---

## Integration with Other Modules

### Enrollments Module

- Sessions are linked to enrollments via enrollment_id
- Creating a session requires an active enrollment
- Enrollment details page shows all sessions for that enrollment

**See**: docs/enrollments/ENROLLMENTS.md

### Class Schedules Module

- Sessions are automatically created from scheduled class times
- class_schedule_id links session to schedule
- **Automatic session creation occurs 50 minutes after class is held**
  - This delay ensures the class is fully completed
  - Allows time for attendance and recording data to be finalized
  - Prevents incomplete or premature session records
- Session inherits data from class schedule (duration, students, teacher, subject)
- Conclusion type is determined based on attendance records

**See**: docs/class-schedules/CLASS_SCHEDULES.md

### Users Module

- Sessions display student and teacher profiles
- User data fetched from Redux store
- Profile images and names shown in session cards

**See**: docs/users-module/USER_FLOWS.md

### Transactions Module

- Each session may have associated transactions
- Transaction data visible in session details
- Billing calculations based on session duration

---

## Best Practices

### Performance Optimization

1. **React Query Caching**

   - Sessions data is cached for 60 seconds
   - Reduces unnecessary API calls
   - Automatic background refetching

2. **Pagination**

   - Default: 15 items per page
   - Reduces data transfer and rendering time
   - User can adjust items per page

3. **Lazy Loading**
   - Session details loaded only when needed
   - Images lazy-loaded with Next.js Image component

### Error Handling

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
useQuery returns data, error, isLoading:
  queryKey: ["getAllSessionWithGroupIds", payload]
  queryFn: getAllSessionWithGroupIds(payload)
  onError: 
    toast.error("Failed to fetch sessions")
    console.error(error)

if isLoading: return LoadingSpinner
if error: return ErrorMessage
</pre>

---

## Related Documentation

- [Session Details](../session-details/SESSION_DETAILS.md) - Detailed view of individual sessions
- [Enrollments](../enrollments/ENROLLMENTS.md) - Enrollment management and lifecycle
- [Class Schedules](../class-schedules/CLASS_SCHEDULES.md) - Scheduling system integration
- [Users Module](../users-module/USER_FLOWS.md) - User management and profiles
- [Authentication](../authentication-module/AUTHENTICATION.md) - Auth system and access control

---
