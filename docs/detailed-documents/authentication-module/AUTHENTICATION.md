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

- **Path**: `/{role}/sessions`
- **File**: `src/app/(protected)/[role]/sessions/page.tsx`
- **Screen**: `src/screens/sessions/sessions.tsx`
- **Access**: Admin, SuperAdmin, HR, Counsellor, Teacher, Student, Parent

#### Session Details

- **Path**: `/{role}/session-details/{id}`
- **File**: `src/app/(protected)/[role]/session-details/[id]/page.tsx`
- **Screen**: `src/screens/session-details/session-details.tsx`
- **Access**: All authenticated users (content varies by role)

### Navigation

Sessions is accessible from the sidebar navigation:

- **Icon**: `/assets/svgs/menuBarIcons/sessions.svg`
- **Label**: "Sessions"
- **Route**: `/{baseRoute}/sessions`

**Reference**: `src/const/dashboard/sidebarData.ts`

---

## Data Flow

### Flow Chart

See [sessions_flow.md](./sessions_flow.md) for a detailed visual representation of the sessions flow.

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
  ├─ Apply Filters → Refetch with new params
  ├─ Add Session → Create mutation → Success toast → Refetch
  ├─ Edit Session → Update mutation → Success toast → Refetch
  ├─ Delete Session → Delete mutation → Success toast → Refetch
  ├─ Reload Session → Recreate mutation → Success toast → Refetch
  └─ View Details → Navigate to session-details/{id}
         ↓
Auto-refetch every 60 seconds (configurable)
</pre>

---

## API Integration

### API Endpoints

**Base URL**: Configured in environment variables

| Endpoint                                      | Method | Purpose                         | Access     |
| --------------------------------------------- | ------ | ------------------------------- | ---------- |
| `/api/v1/sessions/getAllSessionsWithGroupIds` | GET    | Fetch all sessions with filters | All roles  |
| `/api/sessions`                               | POST   | Create new session              | Admin only |
| `/api/sessions/{id}`                          | PUT    | Update session                  | Admin only |
| `/api/sessions/{id}`                          | DELETE | Delete session                  | Admin only |
| `/api/sessions/recreate/{id}`                 | GET    | Recreate/reload session         | Admin only |
| `/api/sessions/monthly-tag-count`             | GET    | Get monthly session statistics  | All roles  |
| `/api/sessions`                               | GET    | Export sessions to Excel        | Admin only |

**File**: `src/api/sessions.api.ts`

### Service Functions

**File**: `src/services/dashboard/superAdmin/sessions/sessions.ts`

#### Main Functions

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Fetch all sessions with filtering
getAllSessionWithGroupIds(
  payload: GetAllSessionsWithGroupIds_Params_Type
): Promise&lt;GetAllSessionsWithGroupIds_Response_Type&gt;

// Create new session
createSession(
  payload: Create_Session_Payload_Type
): Promise&lt;void&gt;

// Update session
updateSession(
  sessionId: string,
  payload: { conclusion_type?: string; duration?: number }
): Promise&lt;void&gt;

// Delete session
deleteSession(sessionId: string): Promise&lt;void&gt;

// Recreate session
recreacteSession(sessionId: string): Promise&lt;void&gt;

// Export sessions to Excel
getSessionsExcelData(payload: any): Promise&lt;Blob&gt;
</pre>

### Query Parameters

#### getAllSessionsWithGroupIds Parameters

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  // Pagination
  page?: number;              // Page number (default: 1)
  limit?: number;             // Items per page (default: 15)

  // Date filters
  start_time?: string;        // ISO 8601 date (e.g., "2025-01-01")
  end_time?: string;          // ISO 8601 date

  // User filters
  student_ids?: string;       // Comma-separated IDs (e.g., "1,2,3")
  student_name?: string;      // Search by student name
  tutor_id?: number;          // Filter by teacher ID

  // Enrollment filters
  enrollment_id?: number;     // Filter by enrollment ID

  // Educational filters
  subject_id?: number;        // Filter by subject
  board_id?: number;          // Filter by board
  curriculum_id?: number;     // Filter by curriculum
  grade_id?: number;          // Filter by grade

  // Status filter
  conclusion_type?: string;   // "Conducted" | "Cancelled" | "Teacher Absent" | "Student Absent" | "No Show"
}
</pre>

### Response Types

#### Session List Response

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
type GetAllSessionsWithGroupIds_Response_Type = {
  data: Session[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

type Session = {
  id: number;
  enrollment_id: number;
  class_schedule_id: number;
  duration: number;                    // In minutes
  tutor_class_time: number;
  tutor_scaled_class_time: number;
  conclusion_type: string;
  tag: string;
  created_at: string;                  // ISO 8601
  tutor: {
    id: number;
    name: string;
    email: string;
    profileImageUrl: string;
  };
  subject: {
    id: number;
    name: string;
  };
  students: Array&lt;{
    id: number;
    name: string;
    email: string;
    profileImageUrl: string;
  }&gt;;
  meet_recording?: string;
}
</pre>

#### Create Session Payload

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
type Create_Session_Payload_Type = {
  tutor_class_time: number;            // In minutes
  conclusion_type: string;             // Session status
  tutor_scaled_class_time: number;
  enrollment_id: number;
  created_at: string;                  // ISO 8601 datetime
  duration?: number;                   // Optional duration override
}
</pre>

---

## Component Structure

### Main Sessions Screen

**File**: `src/screens/sessions/sessions.tsx`

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
   - Configurable via `refetchInterval` option

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
const { data: sessionsData, isLoading } = useQuery({
  queryKey: ['getAllSessionWithGroupIds', payload],
  queryFn: () =&gt; getAllSessionWithGroupIds(payload),
  refetchInterval: 60000, // Auto-refresh every 60 seconds
});

// Fetch session statistics
const { data: tagCountData } = useQuery({
  queryKey: ['getSessionsMonthlyTagCount', tagCountPayload],
  queryFn: () =&gt; getSessionsMonthlyTagCount(tagCountPayload),
  refetchInterval: 60000,
});

// Fetch enrollments for dropdowns
const { data: enrollmentsData } = useQuery({
  queryKey: ['getAllEnrollments'],
  queryFn: getAllEnrollments,
});
</pre>

#### Mutations

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Create session
const createMutation = useMutation({
  mutationFn: createSession,
  onSuccess: () =&gt; {
    queryClient.invalidateQueries(['getAllSessionWithGroupIds']);
    toast.success('Session created successfully');
  },
});

// Delete session
const deleteMutation = useMutation({
  mutationFn: deleteSession,
  onSuccess: () =&gt; {
    queryClient.invalidateQueries(['getAllSessionWithGroupIds']);
    toast.success('Session deleted successfully');
  },
});

// Reload session
const reloadMutation = useMutation({
  mutationFn: recreacteSession,
  onSuccess: () =&gt; {
    queryClient.invalidateQueries(['getAllSessionWithGroupIds']);
    toast.success('Session reloaded successfully');
  },
});
</pre>

---

## Session Management

### Creating Sessions (Admin Only)

**Component**: `src/components/ui/superAdmin/sessions/add-modal/add-modal.tsx`

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
   - Form data is sent to `createSession` API
   - On success: Toast notification + Modal closes + Sessions refetch
   - On error: Error toast displayed

#### Code Example

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleSubmit = () =&gt; {
  const payload: Create_Session_Payload_Type = {
    enrollment_id: selectedEnrollment.id,
    created_at: `${date}T${time}:00`,
    tutor_class_time: duration,
    tutor_scaled_class_time: duration,
    conclusion_type: conclusionType,
    duration: duration,
  };

  createMutation.mutate(payload);
};
</pre>

**Reference**: `src/components/ui/superAdmin/sessions/add-modal/add-modal.tsx:45-120`

### Editing Sessions (Admin Only)

Sessions can be edited from the session details page. See session-details documentation for complete edit flow.

### Deleting Sessions (Admin Only)

**Component**: `src/components/ui/superAdmin/sessions/delete-modal/delete-modal.tsx`

#### Delete Flow

1. Click "Delete" icon in session row
2. Confirmation modal appears
3. User confirms deletion
4. `deleteSession` API called
5. On success: Toast notification + Sessions refetch
6. On error: Error toast displayed

**Reference**: `src/screens/sessions/sessions.tsx:234-245`

### Reloading Sessions (Admin Only)

Sessions can be reloaded/recreated to refresh data from the source system.

#### Reload Flow

1. Click "Reload" icon in session row
2. `recreacteSession` API called
3. On success: Toast notification + Sessions refetch
4. On error: Error toast displayed

**Reference**: `src/screens/sessions/sessions.tsx:247-256`

---

## Filtering System

### Filter Categories

#### 1. Date Range Filter

**Component**: `FilterByDate`

- Allows selection of start and end dates
- Updates `start_time` and `end_time` in query params
- Clears with "Reset" button

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const [dateRange, setDateRange] = useState({
  start_time: '',
  end_time: '',
});
</pre>

#### 2. Student Filter

**Component**: `MultiSelectDropDown`

- Multi-select dropdown of students
- Shows student name and ID
- Updates `student_ids` param (comma-separated)
- Available for Admin, Teacher, Parent roles

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const [selectedStudents, setSelectedStudents] = useState&lt;number[]&gt;([]);
// Query param: student_ids = "1,2,3"
</pre>

#### 3. Teacher Filter

**Component**: `MultiSelectDropDown`

- Multi-select dropdown of teachers
- Shows teacher name and ID
- Updates `tutor_id` param
- Available for Admin, Student, Parent roles

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const [selectedTeacher, setSelectedTeacher] = useState&lt;number | null&gt;(null);
</pre>

#### 4. Educational Filters

**Subjects, Boards, Grades, Curriculum**

- Multi-select dropdowns
- Fetched from Redux store (resources)
- Updates respective query params

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const [selectedSubjects, setSelectedSubjects] = useState&lt;number[]&gt;([]);
const [selectedBoards, setSelectedBoards] = useState&lt;number[]&gt;([]);
const [selectedGrades, setSelectedGrades] = useState&lt;number[]&gt;([]);
const [selectedCurriculum, setSelectedCurriculum] = useState&lt;number[]&gt;([]);
</pre>

#### 5. Conclusion Type Filter

**Component**: `MultiSelectDropDown`

- Multi-select dropdown of session statuses
- Options: Conducted, Cancelled, Teacher Absent, Student Absent, No Show
- Updates `conclusion_type` param

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const [selectedConclusionTypes, setSelectedConclusionTypes] = useState&lt;string[]&gt;([]);
</pre>

#### 6. Enrollment ID Search (Admin Only)

**Component**: `TextField`

- Direct input field for enrollment ID
- Searches for specific enrollment
- Updates `enrollment_id` param

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const [enrollmentId, setEnrollmentId] = useState&lt;string&gt;('');
</pre>

### Filter Application

Filters are applied automatically when changed:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
useEffect(() =&gt; {
  // Build payload with all active filters
  const payload = {
    page: currentPage,
    limit: rowsPerPage,
    start_time: dateRange.start_time,
    end_time: dateRange.end_time,
    student_ids: selectedStudents.join(','),
    tutor_id: selectedTeacher,
    subject_id: selectedSubjects[0],
    board_id: selectedBoards[0],
    // ... other filters
  };

  // React Query automatically refetches when payload changes
}, [currentPage, rowsPerPage, dateRange, selectedStudents, /* ... */]);
</pre>

**Reference**: `src/screens/sessions/sessions.tsx:150-220`

### Clearing Filters

Each filter can be cleared individually or all at once:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleResetFilters = () =&gt; {
  setDateRange({ start_time: '', end_time: '' });
  setSelectedStudents([]);
  setSelectedTeacher(null);
  setSelectedSubjects([]);
  // ... reset other filters
};
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
const payload = {
  page: currentPage,
  limit: rowsPerPage,
  // All filters available
  student_ids: selectedStudents.join(','),
  tutor_id: selectedTeacher,
  enrollment_id: enrollmentId,
  // ... all filters
};
</pre>

#### Teacher

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const payload = {
  page: currentPage,
  limit: rowsPerPage,
  tutor_id: userData.id, // Auto-filtered to own sessions
  student_ids: selectedStudents.join(','),
  // Limited filters
};
</pre>

#### Student

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const payload = {
  page: currentPage,
  limit: rowsPerPage,
  student_ids: userData.id.toString(), // Auto-filtered to own sessions
  tutor_id: selectedTeacher,
  // Limited filters
};
</pre>

#### Parent

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const payload = {
  page: currentPage,
  limit: rowsPerPage,
  student_ids: childrenIds.join(','), // Auto-filtered to children's sessions
  tutor_id: selectedTeacher,
  // Limited filters
};
</pre>

**Reference**: `src/screens/sessions/sessions.tsx:180-220`

---

## State Management

### Redux Store

**Slices Used**:

- `user`: Current user data (id, role, name, email)
- `resources`: Static data (subjects, boards, grades, curriculum)
- `usersByGroup`: Lists of users by role (students, teachers)

#### Accessing Redux State

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
import { useSelector } from 'react-redux';

const userData = useSelector((state: RootState) =&gt; state.user.userData);
const resources = useSelector((state: RootState) =&gt; state.resources);
const usersByGroup = useSelector((state: RootState) =&gt; state.usersByGroup);
</pre>

### React Query Cache

**Query Keys**:

- `['getAllSessionWithGroupIds', payload]`: Sessions list
- `['getSessionsMonthlyTagCount', tagCountPayload]`: Session statistics
- `['getAllEnrollments']`: Enrollments list for dropdowns

#### Cache Invalidation

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate after create/update/delete
queryClient.invalidateQueries(['getAllSessionWithGroupIds']);
</pre>

### Local Component State

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Pagination
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(15);

// Filters
const [dateRange, setDateRange] = useState({ start_time: '', end_time: '' });
const [selectedStudents, setSelectedStudents] = useState&lt;number[]&gt;([]);
const [selectedTeacher, setSelectedTeacher] = useState&lt;number | null&gt;(null);
// ... other filters

// Modals
const [addModalOpen, setAddModalOpen] = useState(false);
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [selectedSession, setSelectedSession] = useState&lt;Session | null&gt;(null);
</pre>

---

## UI Components

### SessionTable Component

**File**: `src/components/ui/superAdmin/sessions/session-table/session-table.tsx`

#### Features

- Displays sessions in tabular format
- Pagination controls
- Action buttons (View, Edit, Delete, Reload)
- Role-specific column visibility

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
&lt;IconButton onClick={() =&gt; router.push(`/${role}/session-details/${session.id}`)}&gt;
  &lt;VisibilityIcon /&gt;
&lt;/IconButton&gt;

// Delete Session (Admin only)
&lt;IconButton onClick={() =&gt; handleDeleteClick(session)}&gt;
  &lt;DeleteIcon /&gt;
&lt;/IconButton&gt;

// Reload Session (Admin only)
&lt;IconButton onClick={() =&gt; handleReloadSession(session.id)}&gt;
  &lt;RefreshIcon /&gt;
&lt;/IconButton&gt;
</pre>

**Reference**: `src/components/ui/superAdmin/sessions/session-table/session-table.tsx:120-250`

### MobileViewCard Component

**File**: `src/components/ui/superAdmin/sessions/mobileViewCard/mobileViewCard.tsx`

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
&lt;SummaryCard
  title="Conducted"
  count={tagCountData?.Conducted || 0}
  color="#286320"
  bgColor="#A0FFC0"
/&gt;
</pre>

#### Session Cards

Clickable cards showing:

- Teacher name and profile image
- Student name(s) and profile image(s)
- Subject
- Date and time
- Duration
- Status badge

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;SessionCard
  session={session}
  onClick={() =&gt; router.push(`/${role}/session-details/${session.id}`)}
/&gt;
</pre>

**Reference**: `src/components/ui/superAdmin/sessions/mobileViewCard/mobileViewCard.tsx:45-180`

### Styling Utilities

**File**: `src/utils/helpers/sessionType-styles.ts`

#### Conclusion Type Styles

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export const getConclusionTypeStyles = (type: string) =&gt; {
  switch (type) {
    case 'Conducted':
      return { color: '#286320', backgroundColor: '#A0FFC0' };
    case 'Cancelled':
      return { color: '#653838', backgroundColor: '#FFACAC' };
    case 'Teacher Absent':
      return { color: '#2F3282', backgroundColor: '#DBDCFF' };
    case 'Student Absent':
      return { color: '#05445e', backgroundColor: '#85ddee' };
    case 'No Show':
      return { color: '#CC5500', backgroundColor: '#f9e79f' };
    default:
      return { color: '#000000', backgroundColor: '#FFFFFF' };
  }
};
</pre>

#### Tag Type Styles

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export const getTagTypeStyles = (tag: string) =&gt; {
  switch (tag) {
    case 'Normal':
      return { color: '#1976d2', backgroundColor: '#e3f2fd' };
    case 'Extra':
      return { color: '#ed6c02', backgroundColor: '#fff4e5' };
    case 'Manual':
      return { color: '#9c27b0', backgroundColor: '#f3e5f5' };
    case 'External':
      return { color: '#2e7d32', backgroundColor: '#e8f5e9' };
    default:
      return { color: '#757575', backgroundColor: '#f5f5f5' };
  }
};
</pre>

**Reference**: `src/utils/helpers/sessionType-styles.ts:1-50`

---

## Analytics & Reporting

### Session Statistics

**Service**: `src/services/dashboard/superAdmin/analytics/analytics.ts`

#### getSessionsMonthlyTagCount

Fetches aggregated session statistics by conclusion type.

**Parameters**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  tutor_id?: number;
  enrollment_id?: number;
  subject_id?: number;
  user_id?: number;
  start_time?: string;
  end_time?: string;
  grade_id?: number;
  curriculum_id?: number;
  board_id?: number;
  student_name?: string;
  student_ids?: string;
}
</pre>

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  Conducted: number;
  Cancelled: number;
  TeacherAbsent: number;
  StudentAbsent: number;
  NoShow: number;
  totalConductedHours: number;      // Total hours of conducted sessions
  totalConductedDuration: number;   // Total minutes of conducted sessions
}
</pre>

#### Usage Example

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { data: tagCountData } = useQuery({
  queryKey: ['getSessionsMonthlyTagCount', filters],
  queryFn: () =&gt; getSessionsMonthlyTagCount(filters),
});

console.log(`Conducted sessions: ${tagCountData?.Conducted}`);
console.log(`Total hours: ${tagCountData?.totalConductedHours}`);
</pre>

### Excel Export

**Function**: `getSessionsExcelData`

Exports sessions data to an Excel file with all filters applied.

#### Export Flow

1. User clicks "Export to Excel" button (Admin only)
2. Current filters are applied to export
3. API returns Excel file as Blob
4. File is automatically downloaded

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleExportExcel = async () =&gt; {
  try {
    const blob = await getSessionsExcelData(currentFilters);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sessions_${Date.now()}.xlsx`;
    link.click();
    toast.success('Export successful');
  } catch (error) {
    toast.error('Export failed');
  }
};
</pre>

**Reference**: `src/screens/sessions/sessions.tsx:258-275`

### Dashboard Integration

Sessions are displayed on user dashboards for quick access:

**Files**:

- `src/screens/student-teacher-dashboard/components/sessions/sessions.tsx`
- Teacher: Shows recent sessions taught
- Student: Shows recent sessions attended

**Features**:

- Displays 5-10 most recent sessions
- Quick overview card with session count
- "View All Sessions" button linking to full sessions page

---

## File References

### Core Files

| File                                                                      | Purpose                  | Lines |
| ------------------------------------------------------------------------- | ------------------------ | ----- |
| `src/screens/sessions/sessions.tsx`                                       | Main sessions screen     | 450+  |
| `src/components/ui/superAdmin/sessions/session-table/session-table.tsx`   | Desktop table view       | 300+  |
| `src/components/ui/superAdmin/sessions/mobileViewCard/mobileViewCard.tsx` | Mobile card view         | 250+  |
| `src/components/ui/superAdmin/sessions/add-modal/add-modal.tsx`           | Create session modal     | 200+  |
| `src/services/dashboard/superAdmin/sessions/sessions.ts`                  | Service layer functions  | 180+  |
| `src/api/sessions.api.ts`                                                 | API endpoint definitions | 80+   |
| `src/utils/helpers/sessionType-styles.ts`                                 | Styling utilities        | 50+   |

### Type Definitions

| File                                                     | Purpose              |
| -------------------------------------------------------- | -------------------- |
| `src/types/sessions/getAllSessionsWithGroupIds.types.ts` | Sessions list types  |
| `src/types/sessions/create-session.types.ts`             | Create session types |
| `src/types/sessions/update-session.types.ts`             | Update session types |

### Constants

| File                                              | Purpose                   |
| ------------------------------------------------- | ------------------------- |
| `src/const/dashboard/session_conclusion_types.ts` | Conclusion type constants |
| `src/const/dashboard/sidebarData.ts`              | Sidebar navigation config |

---

## Integration with Other Modules

### Enrollments Module

- Sessions are linked to enrollments via `enrollment_id`
- Creating a session requires an active enrollment
- Enrollment details page shows all sessions for that enrollment

**See**: `docs/enrollments/ENROLLMENTS.md`

### Class Schedules Module

- Sessions are created from scheduled class times
- `class_schedule_id` links session to schedule
- Automatic session creation on schedule execution

**See**: `docs/class-schedules/CLASS_SCHEDULES.md`

### Users Module

- Sessions display student and teacher profiles
- User data fetched from Redux store
- Profile images and names shown in session cards

**See**: `docs/users-module/USER_FLOWS.md`

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
const { data, error, isLoading } = useQuery({
  queryKey: ['getAllSessionWithGroupIds', payload],
  queryFn: () =&gt; getAllSessionWithGroupIds(payload),
  onError: (error) =&gt; {
    toast.error('Failed to fetch sessions');
    console.error(error);
  },
});

if (isLoading) return &lt;LoadingSpinner /&gt;;
if (error) return &lt;ErrorMessage /&gt;;
</pre>
