# Session Details Module Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Routing](#routing)
4. [Data Flow](#data-flow)
5. [API Integration](#api-integration)
6. [Component Structure](#component-structure)
7. [Session Information Display](#session-information-display)
8. [Session Management](#session-management)
9. [Transaction Details](#transaction-details)
10. [Student Details](#student-details)
11. [Attendance Tracking](#attendance-tracking)
12. [Notes & Recordings](#notes--recordings)
13. [Role-Based Access](#role-based-access)
14. [State Management](#state-management)
15. [UI Components](#ui-components)
16. [Integration with Other Modules](#integration-with-other-modules)
17. [File References](#file-references)

---

## Overview

The Session Details module provides a comprehensive view of individual class sessions in the Tuitional LMS. It serves as a detailed information hub for sessions, displaying enrollment information, participant details, attendance records, transactions, and session recordings.

### Key Features

- **Comprehensive Session View**: Single-page detailed view of all session information
- **Real-time Data Fetching**: Automatic data loading and refresh
- **Session Management** (Admin only):
  - Edit conclusion type (Conducted, Cancelled, Teacher Absent, Student Absent, No Show)
  - Edit session duration
  - Delete session
  - Reload/recreate session
- **Transaction History**: View all financial transactions related to the session
- **Attendance Tracking**: See join/leave times for all participants
- **Student Duration Tracking**: Individual student duration within group sessions
- **Notes & Recordings**: Access to session notes and Meet recordings
- **Responsive Design**: Optimized for both desktop and mobile views
- **Role-based Access**: Different views and actions based on user role

### Session Information Categories

The session details page is organized into several key sections:

1. **Enrollment Details**: Teacher, student, subject, date, duration, status
2. **Notes & Actions**: Session notes, recording link, admin actions
3. **Transaction Details**: All financial transactions for the session
4. **Student Details**: Individual student durations and participation
5. **Attendance**: Join/leave times for all participants

---

## Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Data Fetching**: TanStack Query (React Query) + Axios
- **State Management**: Redux Toolkit with Redux Persist
- **UI Components**: Material-UI (MUI)
- **Styling**: CSS Modules
- **Date Handling**: Moment.js for timezone conversion

### Directory Structure

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
src/
├── app/(protected)/[role]/
│   └── session-details/[id]/
│       └── page.tsx                           # Session details route
├── screens/
│   └── session-details/
│       ├── session-details.tsx                # Main session details screen
│       └── session-details.module.css
├── components/ui/superAdmin/
│   ├── session-details/
│   │   └── edit-enrollment-modal/
│   │       ├── edit-enrollment-modal.tsx      # Edit session modal
│   │       └── edit-enrollment-modal.module.css
│   └── enrollment/
│       └── delete-modal/                      # Delete confirmation modal
├── services/dashboard/superAdmin/
│   ├── session-details/
│   │   ├── session-details.ts                 # Session details service
│   │   └── session-details.type.ts            # Type definitions
│   ├── sessions/
│   │   └── sessions.ts                        # Session CRUD operations
│   └── transactions/
│       └── transactions.ts                    # Transaction service
├── api/
│   └── sessions.api.ts                        # API endpoint builders
├── types/
│   └── session-details/
│       └── session-details.types.ts           # TypeScript types
└── utils/helpers/
    ├── convert-minutes-to-hours.ts            # Time conversion utility
    └── sessionType-styles.ts                  # Styling utilities
</pre>

{% endraw %}

---

## Routing

### Main Route

**Path**: `/{role}/session-details/{id}`

**Parameters**:

- `role`: User role (superAdmin, admin, teacher, student, parent)
- `id`: Session ID (number)

**File**: `src/app/(protected)/[role]/session-details/[id]/page.tsx`

**Screen**: `src/screens/session-details/session-details.tsx`

**Access**: All authenticated users (content and actions vary by role)

**Authentication**: Protected with `withAuth` HOC

### Navigation

Users can navigate to session details from:

1. **Sessions List Page**: Click on any session row
2. **Enrollment Details Page**: Click on session in sessions tab
3. **Dashboard**: Click on recent session cards
4. **Direct URL**: Navigate directly to `/{role}/session-details/{id}`

**Example URLs**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
/superAdmin/session-details/12345
/teacher/session-details/12345
/student/session-details/12345
</pre>

{% endraw %}

**Reference**: `src/app/(protected)/[role]/session-details/[id]/page.tsx:1-11`

---

## Data Flow

### Flow Chart

Flow Chart Link: https://tinyurl.com/ybduc54u

### Flow Chart Code

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
flowchart TD
    Start([User Navigates to<br/>Session Details Page]) --> ExtractID[Extract Session ID<br/>from URL Params]

    ExtractID --> CheckAuth{User<br/>Authenticated?}

    CheckAuth -->|No| RedirectLogin[Redirect to Login<br/>withAuth HOC]
    CheckAuth -->|Yes| CheckToken{Token<br/>Available?}

    CheckToken -->|No| ShowError[Display Error State]
    CheckToken -->|Yes| FetchData[Fetch Session Data]

    FetchData --> ParallelFetch{Parallel API Calls}

    ParallelFetch -->|Call 1| FetchSessionDetails[GET /api/sessions/id<br/>Session Details]
    ParallelFetch -->|Call 2| FetchTransactions[GET /api/transactions<br/>session_id=id]

    FetchSessionDetails --> CheckSessionResponse{Session Data<br/>Available?}
    FetchTransactions --> CheckTransResponse{Transaction Data<br/>Available?}

    CheckSessionResponse -->|Error| ShowSessionError[Display Session Error]
    CheckSessionResponse -->|Success| ParseSessionData[Parse Session Data]

    CheckTransResponse -->|Error| ShowTransError[Display Transaction Error]
    CheckTransResponse -->|Success| ParseTransData[Parse Transaction Data]

    ParseSessionData --> RenderLayout[Render Session Details Layout]
    ParseTransData --> RenderLayout

    RenderLayout --> DisplaySections[Display All Sections]

    DisplaySections --> Section1[Section 1:<br/>Enrollment Details]
    DisplaySections --> Section2[Section 2:<br/>Notes and Actions]
    DisplaySections --> Section3[Section 3:<br/>Transaction Details]
    DisplaySections --> Section4[Section 4:<br/>Student Details]
    DisplaySections --> Section5[Section 5:<br/>Attendance]

    Section1 --> ShowEnrollmentInfo[Teacher Info<br/>Student Info<br/>Subject<br/>Date<br/>Duration<br/>Status Tags]

    Section2 --> ShowNotes[Session Notes<br/>Recording Link<br/>Admin Actions]

    Section3 --> ShowTransactions[User Profiles<br/>Transaction Type<br/>Amount<br/>Date/Time<br/>Reverted Status]

    Section4 --> ShowStudentDetails[Student Profiles<br/>Individual Durations<br/>Display Names]

    Section5 --> ShowAttendance[Participant Names<br/>Join Time<br/>Leave Time]

    ShowEnrollmentInfo --> UserAction{User<br/>Action?}
    ShowNotes --> UserAction
    ShowTransactions --> UserAction
    ShowStudentDetails --> UserAction
    ShowAttendance --> UserAction

    UserAction -->|Click<br/>Edit Duration| OpenDurationModal[Open Edit Duration Modal]
    OpenDurationModal --> ShowDurationForm[Show Duration Input:<br/>Current Duration<br/>Input Field]
    ShowDurationForm --> EnterNewDuration[User Enters New Duration]
    EnterNewDuration --> ValidateDuration{Duration<br/>Valid?}
    ValidateDuration -->|No| ShowDurationError[Show Validation Error:<br/>Must be positive number]
    ShowDurationError --> ShowDurationForm
    ValidateDuration -->|Yes| SubmitDuration[PUT /api/sessions/id<br/>duration: number]
    SubmitDuration --> DurationResponse{Success?}
    DurationResponse -->|No| ShowDurationAPIError[Show API Error Toast]
    ShowDurationAPIError --> ShowDurationForm
    DurationResponse -->|Yes| RefetchAfterDuration[Refetch Session Data<br/>and Transactions]
    RefetchAfterDuration --> ShowDurationSuccess[Show Success Toast]
    ShowDurationSuccess --> CloseDurationModal[Close Modal]
    CloseDurationModal --> RenderLayout

    UserAction -->|Click<br/>Edit Status| OpenEditModal[Open Edit Session Modal]
    OpenEditModal --> ShowEditForm[Show Conclusion Type Form:<br/>Current Status<br/>Dropdown Options]
    ShowEditForm --> SelectNewType[User Selects New Type:<br/>Conducted<br/>Cancelled<br/>Teacher Absent<br/>Student Absent<br/>No Show]
    SelectNewType --> ValidateType{Type<br/>Selected?}
    ValidateType -->|No| ShowTypeError[Show Validation Error]
    ShowTypeError --> ShowEditForm
    ValidateType -->|Yes| SubmitType[PUT /api/sessions/id<br/>conclusion_type: string]
    SubmitType --> TypeResponse{Success?}
    TypeResponse -->|No| ShowTypeAPIError[Show API Error Toast]
    ShowTypeAPIError --> ShowEditForm
    TypeResponse -->|Yes| RefetchAfterEdit[Refetch Session Data<br/>and Transactions]
    RefetchAfterEdit --> ShowEditSuccess[Show Success Toast]
    ShowEditSuccess --> CloseEditModal[Close Modal]
    CloseEditModal --> RenderLayout

    UserAction -->|Click<br/>Reload| ShowReloadLoading[Show Loading Spinner]
    ShowReloadLoading --> CallReload[GET /api/sessions/recreate/id]
    CallReload --> ReloadResponse{Success?}
    ReloadResponse -->|No| ShowReloadError[Show Error Toast]
    ShowReloadError --> UserAction
    ReloadResponse -->|Yes| RefetchAfterReload[Refetch Session Data<br/>and Transactions]
    RefetchAfterReload --> ShowReloadSuccess[Show Success Toast]
    ShowReloadSuccess --> RenderLayout

    UserAction -->|Click<br/>Delete| OpenDeleteModal[Open Delete Confirmation Modal]
    OpenDeleteModal --> ShowDeleteWarning[Show Warning:<br/>This action is permanent]
    ShowDeleteWarning --> ConfirmDelete{Confirm<br/>Delete?}
    ConfirmDelete -->|No| CloseDeleteModal[Close Modal]
    CloseDeleteModal --> UserAction
    ConfirmDelete -->|Yes| CallDelete[DELETE /api/sessions/id]
    CallDelete --> DeleteResponse{Success?}
    DeleteResponse -->|No| ShowDeleteError[Show Error Toast]
    ShowDeleteError --> CloseDeleteModal
    DeleteResponse -->|Yes| ShowDeleteSuccess[Show Success Toast]
    ShowDeleteSuccess --> NavigateToSessions[Navigate to Sessions List]

    UserAction -->|Click<br/>Recording Link| CheckRecording{Recording<br/>Available?}
    CheckRecording -->|No| ShowRecordingError[Show Error Toast:<br/>No Recording Found]
    ShowRecordingError --> UserAction
    CheckRecording -->|Yes| OpenRecording[Open Recording<br/>in New Tab]
    OpenRecording --> UserAction

    UserAction -->|Click<br/>Download Notes| DownloadFile[Download Note File]
    DownloadFile --> UserAction

    UserAction -->|Continue<br/>Viewing| UserAction
</pre>

{% endraw %}

### High-Level Data Flow

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
User Navigates to Session Details
         ↓
Extract Session ID from URL
         ↓
Check Authentication (withAuth HOC)
         ↓
Component Mounts
         ↓
Parallel Data Fetching (React Query):
  ├─ Session Details (GET /api/sessions/:id)
  └─ Transactions (GET /api/transactions?session_id=:id)
         ↓
Parse and Display Data:
  ├─ Enrollment Details
  ├─ Notes & Actions
  ├─ Transaction History
  ├─ Student Details
  └─ Attendance Records
         ↓
User Actions (Admin Only):
  ├─ Edit Duration → PUT /api/sessions/:id → Refetch
  ├─ Edit Conclusion Type → PUT /api/sessions/:id → Refetch
  ├─ Reload Session → GET /api/sessions/recreate/:id → Refetch
  └─ Delete Session → DELETE /api/sessions/:id → Navigate to Sessions List
         ↓
All Users:
  ├─ View Recording → Open in new tab
  └─ Download Notes → Download file
</pre>

{% endraw %}

**Reference**: `src/screens/session-details/session-details.tsx:41-686`

---

## API Integration

### Base URL

Configured in environment variables

### API Endpoints

#### 1. Get Session Details by ID

**Endpoint**: `GET /api/sessions/{id}`

**Service Function**: `getSessionDetailsById(id, config)`

**Location**: `src/services/dashboard/superAdmin/session-details/session-details.ts`

**Request Parameters**:

- `id` (path param): Session ID (string)
- `token` (header): JWT authentication token

**Response Type**: `SessionById_Response_Type`

**Response Structure**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
[
  {
    session: {
      id: number;
      class_schedule_id: number;
      subject: { name: string };
      board_id: number | null;
      curriculum_id: number | null;
      grade_id: number | null;
      meeting_link: string;
      space_name: string;
      duration: number;                    // In minutes
      created_at: string;                  // ISO 8601
      meet_recording: string;              // JSON string array
      tutor_class_time: number;
      tutor_scaled_class_time: number;
      tutor_id: number;
      student_group_id: string;
      conclusion_type: string;             // "Conducted" | "Cancelled" | etc.
      tag: string;                         // "Normal" | "Extra" | "Manual" | "External"

      tutor: {
        id: number;
        name: string;
        email: string;
        profileImageUrl: string;
        country_code: string | null;
      };

      // list of users who reviewed this session
      reviews: Array<{
        id: number;
        reviewer: {
          id: number;
          name: string;
          email: string;
          profileImageUrl: string;
        };
        created_at: string;
      }>;

      Notes: [
        {
          id: number;
          file: string;                    // File path/URL
          // ... other note fields
        }
      ];

      groupSessionTime: [
        {
          id: number;
          student_id: number | null;
          display_name: string;
          session_id: number;
          profileImageUrl: string;
          class_duration_time: number;     // Individual student duration
          class_scaled_duration_time: number;
          createdAt: string;
          updatedAt: string;
          deletedAt: string | null;
          student_data: {
            name: string;
            id: number;
            email: string;
            profileImageUrl: string;
            country_code: string | null;
          } | null;
        }
      ];

      ClassSchedule: {
        id: number;
        status: boolean;
        enrollment_id: number;
        teacher_schedule_id: number;
        meetLink: string | null;
        meetSpace: string | null;
        isCancelled: boolean | null;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
      };
    };

    confrences: [
      {
        id: number;
        endTime: number;                   // Unix timestamp
        startTime: number;                 // Unix timestamp
        space_name: string;
        display_name: string;
        session_id: number;
        user_id: number | null;
        duration: string;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
      }
    ];

    students: [
      {
        id: number;
        group_id: string;
        student_id: number;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
        StudentId: number | null;
        user: {
          name: string;
          id: number;
          email: string;
          profileImageUrl: string;
          country_code: string | null;
        };
      }
    ];
  }
]
</pre>

{% endraw %}

**Usage Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { data, error, isLoading } = useQuery<SessionById_Response_Type>({
  queryKey: ["sessionsById"],
  queryFn: () => getSessionDetailsById(id, { token }),
  enabled: !!token,
});
</pre>

{% endraw %}

**Reference**: `src/services/dashboard/superAdmin/session-details/session-details.ts:9-10`

---

#### 2. Get Transaction Details

**Endpoint**: `GET /api/transactions`

**Service Function**: `getAllTransactions(options, config)`

**Location**: `src/services/dashboard/superAdmin/transactions/transactions.ts`

**Query Parameters**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  session_id: string;    // Filter by session ID
  limit: number;         // Number of transactions (default: 100)
}
</pre>

{% endraw %}

**Response Structure**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  data: [
    {
      id: number;
      user_id: number;
      session_id: number;
      cost: number;
      type: "Debit" | "Credit";
      isReverted: boolean;
      createdAt: string;
      updatedAt: string;

      transactions: {
        id: number;
        name: string;
        email: string;
        profileImageUrl: string;
      };

      enrollment: {
        studentsGroups: [
          {
            user: {
              id: number;
              name: string;
            };
          }
        ];
      };
    }
  ];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
</pre>

{% endraw %}

**Usage Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { data: transactionData, isLoading: isLoadingTransactions } = useQuery({
  queryKey: ["getAllTransactions", token],
  queryFn: () => getAllTransactions({ session_id: String(id), limit: 100 }, { token }),
  enabled: !!token,
});
</pre>

{% endraw %}

**Reference**: `src/screens/session-details/session-details.tsx:78-88`

---

#### 3. Update Session

**Endpoint**: `PUT /api/sessions/{id}`

**Service Function**: `updateSession(id, config, payload)`

**Location**: `src/services/dashboard/superAdmin/sessions/sessions.ts`

**Request Payload**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  conclusion_type?: string;    // Optional: Update status
  duration?: number;           // Optional: Update duration in minutes
}
</pre>

{% endraw %}

**Response**: Success status with updated session data

**Use Cases**:

- Change session conclusion type (Conducted, Cancelled, etc.)
- Adjust session duration after the fact
- Correct data entry errors

**Usage Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleUpdate = useMutation({
  mutationFn: (payload: { conclusion_type?: string; duration?: number }) =>
    updateSession(id, { token }, payload),
  onSuccess: () => {
    toast.success("Session Update Successfully");
    setEditModal(false);
    refetch();
    refetchTransactions();
  },
  onError: (error) => {
    toast.error(error.response?.data?.error || "Update failed");
  },
});
</pre>

{% endraw %}

**Reference**: `src/screens/session-details/session-details.tsx:97-123`

---

#### 4. Delete Session

**Endpoint**: `DELETE /api/sessions/{id}`

**Service Function**: `deleteSession(id, config)`

**Location**: `src/services/dashboard/superAdmin/sessions/sessions.ts`

**Request**: Session ID in path parameter

**Response**: Success status

**Behavior**:

- Permanently deletes the session
- Redirects to sessions list on success
- Shows confirmation modal before deletion

**Usage Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleDelete = useMutation({
  mutationFn: (id: string) => deleteSession(id, { token }),
  onSuccess: () => {
    toast.success("Session Deleted Successfully");
    setDeleteModal(false);
    router.push("/superAdmin/sessions");
  },
  onError: (error) => {
    toast.error(error.response?.data?.error || "Delete failed");
  },
});
</pre>

{% endraw %}

**Reference**: `src/screens/session-details/session-details.tsx:147-169`

---

#### 5. Recreate/Reload Session

**Endpoint**: `GET /api/sessions/recreate/{id}`

**Service Function**: `recreacteSession(id, config)`

**Location**: `src/services/dashboard/superAdmin/sessions/sessions.ts`

**Request**: Session ID in path parameter

**Response**: Success status with refreshed session data

**Purpose**:

- Refresh session data from source system (Google Meet)
- Update attendance records
- Sync recording links
- Recalculate durations

**Usage Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleReload = useMutation({
  mutationFn: (id: string) => recreacteSession(id, { token }),
  onSuccess: () => {
    toast.success("Session Reload Successfully");
    refetch();
    refetchTransactions();
  },
  onError: (error) => {
    toast.error(error.response?.data?.error || "Reload failed");
  },
});
</pre>

{% endraw %}

**Reference**: `src/screens/session-details/session-details.tsx:124-145`

---

## Component Structure

### Main Component

**Component**: `SessionDetailForm`

**Location**: `src/screens/session-details/session-details.tsx`

**Props**: None (uses URL params and Redux state)

#### Component Hierarchy

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
SessionDetailForm (Main Component)
├─ Container (MUI)
│   ├─ Row 1 (Enrollment & Notes)
│   │   ├─ Enrollment Details Section
│   │   │   ├─ Status Tags (Tag & Conclusion Type)
│   │   │   ├─ Teacher Profile
│   │   │   ├─ Student Profile
│   │   │   ├─ Subject
│   │   │   ├─ Date
│   │   │   ├─ Teacher Duration
│   │   │   └─ Class Duration (with edit icon)
│   │   └─ Notes & Actions Section
│   │       ├─ Session Notes List
│   │       └─ Action Buttons (Admin only)
│   │           ├─ Recording Link
│   │           ├─ Reload
│   │           ├─ Edit
│   │           └─ Delete
│   └─ Row 2 (Transactions, Students, Attendance)
│       ├─ Left Split Section
│       │   ├─ Transaction Details
│       │   │   └─ Transaction Cards
│       │   └─ Student Details
│       │       └─ Student Duration Cards
│       └─ Right Section
│           └─ Attendance
│               ├─ Table Header (Name, In, Out)
│               └─ Attendance Rows
├─ EditSessionModal
│   ├─ Conclusion Type Edit Form
│   └─ Duration Edit Form
└─ DeleteModal
    └─ Delete Confirmation Dialog
</pre>

{% endraw %}

#### Key State Variables

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// URL parameter
const { id } = useParams() as { id: string };

// Redux state
const token = useAppSelector((state) => state?.user?.token);

// Local state
const [editSessionModalType, setEditSessionModalType] = useState<string>("");
const [deleteModal, setDeleteModal] = useState<boolean>(false);
const [editModal, setEditModal] = useState<boolean>(false);
</pre>

{% endraw %}

#### Helper Functions

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Find student by ID in the students array
const findById = useCallback((id: number, arr: any) => {
  return arr?.find((item: any) => item.student_id === id) || null;
}, []);

// Trim filename from recording URL
const trimFileName = useCallback((url: string | null) => {
  const regex = /file-\d+-\d+-(.+)$/;
  const match = url?.match(regex);
  return match ? match[1] : null;
}, []);

// Modal control functions
const handleEditModalOpen = useCallback((type: string) => {
  setEditSessionModalType(type);
  setEditModal(true);
}, []);

const handleEditModalClose = useCallback(() => {
  setEditModal(false);
}, []);

const handleDeleteModalOpen = useCallback(() => {
  setDeleteModal(true);
}, []);

const handleDeleteModalClose = useCallback(() => {
  setDeleteModal(false);
}, []);
</pre>

{% endraw %}

**Reference**: `src/screens/session-details/session-details.tsx:50-75`

---

## Session Information Display

### Section 1: Enrollment Details

**Location**: Top-left section of the page

#### Displayed Information

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Enrollment Details
  ├─ Status Tags
  │   ├─ Tag Badge: "Normal" | "Extra" | "Manual" | "External"
  │   └─ Conclusion Type Badge: "Conducted" | "Cancelled" | etc.
  ├─ Teacher Information
  │   ├─ Profile Image (circular)
  │   └─ Name (first 3 words)
  ├─ Student Information
  │   ├─ Profile Image (circular)
  │   └─ Name (first 2 words)
  ├─ Subject
  │   ├─ Icon: SubjectOutlinedIcon
  │   └─ Subject Name
  ├─ Date
  │   ├─ Icon: CalendarMonthOutlinedIcon
  │   └─ Formatted Date (e.g., "5th-Dec-2025")
  ├─ Teacher Duration
  │   ├─ Icon: SubjectOutlinedIcon
  │   └─ Duration in HH:MM format
  └─ Class Duration (Editable - Admin only)
      ├─ Duration in minutes
      └─ Edit Icon (opens duration modal)
</pre>

{% endraw %}

#### Status Tag Styling

**Tag Types**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Normal:
  - Color: #1976d2 (blue)
  - Background: #e3f2fd (light blue)

Extra:
  - Color: #ed6c02 (orange)
  - Background: #fff4e5 (light orange)

Manual:
  - Color: #9c27b0 (purple)
  - Background: #f3e5f5 (light purple)

External:
  - Color: #2e7d32 (green)
  - Background: #e8f5e9 (light green)
</pre>

{% endraw %}

**Conclusion Type Styling**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Conducted:
  - Color: #286320 (dark green)
  - Background: #A0FFC0 (light green)

Cancelled:
  - Color: #653838 (dark red)
  - Background: #FFACAC (light red)

Teacher Absent:
  - Color: #2F3282 (dark blue)
  - Background: #DBDCFF (light blue)

Student Absent:
  - Color: #05445e (teal)
  - Background: #85ddee (light teal)

No Show:
  - Color: #CC5500 (orange)
  - Background: #f9e79f (light yellow)
</pre>

{% endraw %}

**Date Formatting**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
moment.utc(data[0]?.session?.created_at)
  .local()
  .format("Do-MMM-YYYY")
// Output: "5th-Dec-2025"
</pre>

{% endraw %}

**Duration Formatting**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
MinutesToHours(data[0]?.session?.tutor_class_time)
// Input: 90 (minutes)
// Output: "1:30" (hours:minutes)
</pre>

{% endraw %}

**Reference**: `src/screens/session-details/session-details.tsx:189-338`

---

### Section 2: Notes & Actions

**Location**: Top-right section of the page

#### Notes Display

**Features**:

- List of all session notes
- File icon for each note
- Trimmed filename display
- Download button for each note

**Empty State**: Shows `<ErrorBox />` when no notes available

**Code Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{data[0]?.session?.Notes?.length === 0 ? (
  <ErrorBox />
) : (
  data[0]?.session?.Notes?.map((item: any) => (
    <Box className={classes.notesBox}>
      <DescriptionOutlinedIcon />
      <Typography>{trimFileName(item?.file || "")}</Typography>
      <Button
        icon={<CloudDownloadOutlinedIcon />}
        text="Download Notes"
        inlineStyling={styles?.buttonStyle}
      />
    </Box>
  ))
)}
</pre>

{% endraw %}

#### Admin Actions

**Available Actions** (Admin/SuperAdmin only):

1. **Recording Link**
   - Icon: EmergencyRecordingRoundedIcon
   - Opens Google Meet recording in new tab
   - Shows error if no recording available

2. **Reload**
   - Icon: CachedIcon
   - Refreshes session data from source
   - Shows loading spinner during reload

3. **Edit**
   - Icon: EditOutlinedIcon
   - Opens edit modal for conclusion type
   - Allows changing session status

4. **Delete**
   - Icon: DeleteOutlinedIcon
   - Opens delete confirmation modal
   - Permanently removes session

**Recording Link Handler**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
onClick={() => {
  const meetRecording = JSON.parse(data[0]?.session?.meet_recording);
  if (meetRecording?.length > 0) {
    window.open(meetRecording[0], "_blank");
  } else {
    toast.error("No Recording Found");
  }
}}
</pre>

{% endraw %}

**Reference**: `src/screens/session-details/session-details.tsx:340-421`

---

## Session Management

### Editing Session Duration (Admin Only)

**Component**: `EditSessionModal` (type: "duration")

**Location**: `src/components/ui/superAdmin/session-details/edit-enrollment-modal/edit-enrollment-modal.tsx`

#### Edit Duration Flow

1. **Trigger**: Click edit icon next to "Class Duration"
2. **Modal Opens**: Pre-filled with current duration
3. **User Input**: Enter new duration in minutes
4. **Validation**:
   - Field must not be empty
   - Must be a valid number
   - Must be positive
5. **Submit**: `PUT /api/sessions/:id` with `{ duration: number }`
6. **Success**:
   - Toast notification: "Session Update Successfully"
   - Modal closes
   - Session data refetches
   - Transaction data refetches (recalculated)

#### Modal Fields

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Duration Edit Form:
  ├─ Heading: "Edit Session Duration"
  ├─ Subheading: "Fill out the form in order to edit the session duration."
  ├─ Duration Input Field
  │   ├─ Placeholder: "Change Duration"
  │   ├─ Type: Text (numbers only)
  │   └─ Initial Value: Current session duration
  └─ Update Button
      ├─ Text: "Update"
      ├─ Loading State: Shows spinner during API call
      └─ Disabled: While loading
</pre>

{% endraw %}

#### Validation Logic

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleDurationFormSubmit = () => {
  if (!duration) {
    toast.error("Please provide a duration.");
    return;
  }

  const durationNumber = Number(duration);

  if (isNaN(durationNumber) || durationNumber <= 0) {
    toast.error("Please provide a valid positive number for duration.");
    return;
  }

  const formData = {
    duration: durationNumber || durationIni,
  };

  handleUpdate?.(formData);
};
</pre>

{% endraw %}

**Reference**: `src/components/ui/superAdmin/session-details/edit-enrollment-modal/edit-enrollment-modal.tsx:51-65`

---

### Editing Conclusion Type (Admin Only)

**Component**: `EditSessionModal` (type: "conclusion_type")

#### Edit Conclusion Type Flow

1. **Trigger**: Click edit icon in actions section
2. **Modal Opens**: Pre-filled with current conclusion type
3. **User Selection**: Select from dropdown
4. **Options**:
   - No Show
   - Conducted
   - Cancelled
   - Student Absent
   - Teacher Absent
5. **Validation**: Must select a conclusion type
6. **Submit**: `PUT /api/sessions/:id` with `{ conclusion_type: string }`
7. **Success**:
   - Toast notification: "Session Update Successfully"
   - Modal closes
   - Session data refetches
   - Transaction data refetches

#### Modal Fields

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Conclusion Type Edit Form:
  ├─ Heading: "Edit Session Conclusion_type"
  ├─ Subheading: "Fill out the form in order to edit the session conclusion_type."
  ├─ Conclusion Type Dropdown
  │   ├─ Placeholder: "Select Conclusion Type"
  │   ├─ Options: ["No Show", "Conducted", "Cancelled",
  │   │            "Student Absent", "Teacher Absent"]
  │   └─ Initial Value: Current conclusion type
  └─ Update Button
      ├─ Text: "Update"
      ├─ Loading State: Shows spinner during API call
      └─ Disabled: While loading
</pre>

{% endraw %}

#### Validation Logic

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleFormSubmit = () => {
  if (!conclusion_type) {
    toast.error("Please select a conclusion type.");
    return;
  }

  const formData = {
    ...(conclusion_type && { conclusion_type }),
  };

  handleUpdate?.(formData);
};
</pre>

{% endraw %}

**Impact of Conclusion Type**:

- **Conducted**: Creates credit/debit transactions for participants
- **Cancelled**: May reverse or skip transactions
- **Teacher/Student Absent**: Affects billing calculations
- **No Show**: No transactions created

**Reference**: `src/components/ui/superAdmin/session-details/edit-enrollment-modal/edit-enrollment-modal.tsx:41-50`

---

### Reloading Session (Admin Only)

**Purpose**: Refresh session data from the source system (Google Meet)

#### Reload Flow

1. **Trigger**: Click reload icon in actions section
2. **Loading**: Shows loading spinner
3. **API Call**: `GET /api/sessions/recreate/:id`
4. **Backend Actions**:
   - Fetches latest Google Meet data
   - Updates attendance records
   - Syncs recording links
   - Recalculates durations
   - Updates participant information
5. **Success**:
   - Toast notification: "Session Reload Successfully"
   - Session data refetches
   - Transaction data refetches
   - UI updates with fresh data

#### Use Cases

- Recording link not showing up
- Attendance records incomplete
- Duration calculations incorrect
- Participant information outdated
- Session data out of sync

#### Code Example

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleReload = useMutation({
  mutationFn: (id: string) => recreacteSession(id, { token }),
  onSuccess: () => {
    toast.success("Session Reload Successfully");
    refetch();
    refetchTransactions();
  },
  onError: (error) => {
    const axiosError = error as MyAxiosError;
    if (axiosError.response) {
      toast.error(
        axiosError.response.data.error ||
        `${axiosError.response.status} ${axiosError.response.statusText}`
      );
    } else {
      toast.error(axiosError.message);
    }
  },
});
</pre>

{% endraw %}

**Reference**: `src/screens/session-details/session-details.tsx:124-145`

---

### Deleting Session (Admin Only)

**Component**: `DeleteModal`

**Location**: `src/components/ui/superAdmin/enrollment/delete-modal/delete-modal.tsx`

#### Delete Flow

1. **Trigger**: Click delete icon in actions section
2. **Confirmation Modal**:
   - Heading: "Are You Sure?"
   - Subheading: "Are you sure you want to delete this session? This action is permanent."
   - Buttons: Cancel | Delete
3. **User Confirms**: Click "Delete" button
4. **API Call**: `DELETE /api/sessions/:id`
5. **Success**:
   - Toast notification: "Session Deleted Successfully"
   - Modal closes
   - **Redirect**: Navigates to `/{role}/sessions` list
6. **Error**:
   - Toast notification with error message
   - Modal closes
   - User remains on page

#### Warning Message

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
"Are you sure you want to delete this session? This action is permanent."
</pre>

{% endraw %}

#### Code Example

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleDelete = useMutation({
  mutationFn: (id: string) => deleteSession(id, { token }),
  onSuccess: () => {
    toast.success("Session Deleted Successfully");
    setDeleteModal(false);
    router.push("/superAdmin/sessions");
  },
  onError: (error) => {
    const axiosError = error as MyAxiosError;
    if (axiosError.response) {
      toast.error(
        axiosError.response.data.error ||
        `${axiosError.response.status} ${axiosError.response.statusText}`
      );
    } else {
      toast.error(axiosError.message);
    }
    setDeleteModal(false);
  },
});
</pre>

{% endraw %}

**What Gets Deleted**:

- Session record
- Associated attendance records (conferences)
- Student duration records (groupSessionTime)
- **Note**: Transactions are typically not deleted, but marked as reverted

**Reference**: `src/screens/session-details/session-details.tsx:147-169`

---

## Transaction Details

**Location**: Left section of Row 2

### Overview

Displays all financial transactions associated with the session, showing who was charged or paid, and when.

### Transaction Card Structure

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Transaction Card:
  ├─ User Profile
  │   ├─ Profile Image (circular)
  │   ├─ User Name (first 2 words)
  │   └─ Role Badge (Student | Teacher)
  │       ├─ Student: Light teal background (#E0F7FA), Dark teal text (#00796B)
  │       └─ Teacher: Light orange background (#FFF3E0), Dark orange text (#E65100)
  └─ Transaction Details
      ├─ Reverted Status (if applicable): "(Reverted)"
      ├─ Cost Amount: Number
      ├─ Transaction Type Badge:
      │   ├─ Debit: Red background (#F84F31), White text
      │   └─ Credit: Green background (#23C552), White text
      └─ Created Date: Formatted timestamp
</pre>

{% endraw %}

### Data Display

**Transaction List**:

- **Sorted**: Most recent first (by createdAt timestamp)
- **User Identification**: Compares user_id with student IDs to determine role
- **Empty State**: Shows `<ErrorBox />` when no transactions

**Role Determination Logic**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const isStudent = item?.user_id === item?.enrollment?.studentsGroups?.[0]?.user?.id;

// If isStudent is true: Show "Student" badge
// If isStudent is false: Show "Teacher" badge
</pre>

{% endraw %}

**Transaction Sorting**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
transactionData?.data.sort(
  (a, b) =>
    new Date(b.createdAt || 0).getTime() -
    new Date(a.createdAt || 0).getTime()
)
</pre>

{% endraw %}

### Transaction Types

#### Debit Transactions

- **Color**: Red (#F84F31)
- **Meaning**: Money deducted from user's balance
- **Typically for**: Students (payment for session)

#### Credit Transactions

- **Color**: Green (#23C552)
- **Meaning**: Money added to user's balance
- **Typically for**: Teachers (payment for conducting session)

### Reverted Transactions

**Display**: "(Reverted)" label before cost
**Meaning**: Transaction was reversed/cancelled
**Reasons**:

- Session cancelled after billing
- Error correction
- Refund processed
- Conclusion type changed

### Empty State

Shows when:

- No transactions exist for the session
- Session conclusion type is "No Show"
- Billing not yet processed

**Reference**: `src/screens/session-details/session-details.tsx:423-515`

---

## Student Details

**Location**: Left section of Row 2, below Transaction Details

### Overview

Displays individual student participation details, including duration for each student in group sessions.

### Student Detail Card Structure

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Student Detail Card:
  ├─ Student Profile
  │   ├─ Profile Image (circular)
  │   └─ Student Information
  │       ├─ Label: "Student"
  │       └─ Name: Full name or display_name*
  └─ Duration Information
      ├─ Icon: AccessTimeOutlinedIcon
      ├─ Label: "Student Duration"
      └─ Duration: Formatted time (HH:MM)
</pre>

{% endraw %}

### Data Source

**Field**: `session.groupSessionTime`

**Contains**:

- Individual student durations
- Student IDs
- Display names (for guest/external students)
- Scaled duration times (for billing)

### Student Name Display

**Logic**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
findById(item?.student_id, data[0]?.students)?.user?.name || item?.display_name + "*"

// If student found in students array: Show full name
// If not found: Show display_name with asterisk (indicates external/guest)
</pre>

{% endraw %}

**External Student Indicator**: Names ending with `*` indicate students not in the system (guest participants)

### Duration Formatting

**Function**: `MinutesToHours(item?.class_duration_time)`

**Examples**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
60 minutes  → "1:00"
90 minutes  → "1:30"
45 minutes  → "0:45"
120 minutes → "2:00"
</pre>

{% endraw %}

### Group Session Duration Tracking

**Purpose**: In group sessions, each student may join/leave at different times

**Benefits**:

- Accurate billing per student
- Track individual participation
- Identify students who left early
- Identify students who joined late

**Use Cases**:

- Student had technical issues
- Student joined late
- Student left early
- Different billing rates per student

### Empty State

Shows when:

- `groupSessionTime` array is empty
- Session data incomplete
- Backend processing not finished

**Reference**: `src/screens/session-details/session-details.tsx:516-562`

---

## Attendance Tracking

**Location**: Right section of Row 2

### Overview

Displays detailed join/leave times for all session participants (teacher and students).

### Attendance Table Structure

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Attendance Table:
  ├─ Table Header
  │   ├─ Column 1: "Name"
  │   ├─ Column 2: "In" (Join Time)
  │   └─ Column 3: "Out" (Leave Time)
  └─ Table Body (Rows)
      └─ Attendance Row:
          ├─ Participant Info
          │   ├─ Profile Image (circular)
          │   ├─ Name (first 2 words)
          │   └─ Role (Tutor | Student)
          ├─ Join Time
          │   ├─ Icon: LoginIcon
          │   └─ Time: HH:mm AM/PM or "No Show"
          └─ Leave Time
              ├─ Icon: LogoutIcon
              └─ Time: HH:mm AM/PM or "No Show"
</pre>

{% endraw %}

### Data Source

**Field**: `confrences` (conferences)

**Contains**:

- User ID (participant identifier)
- Start time (Unix timestamp)
- End time (Unix timestamp)
- Display name (for external users)
- Space name (Google Meet space)

### Participant Identification

**Logic**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Check if user is the teacher
if (item?.user_id == data[0]?.session?.tutor?.id) {
  // Display teacher's info
  name = data[0]?.session?.tutor?.name;
  profileImage = data[0]?.session?.tutor?.profileImageUrl;
  role = "Tutor";
} else {
  // Display student's info
  name = findById(item?.user_id, data[0]?.students)?.user?.name || item?.display_name;
  profileImage = findById(item?.user_id, data[0]?.students)?.user?.profileImageUrl;
  role = "Student";
}
</pre>

{% endraw %}

### Time Formatting

**Join Time** (startTime):

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{item?.startTime
  ? moment.unix(item?.startTime).local().format("hh:mm A")
  : "No Show"}

// Unix timestamp → Local time
// Example: 1733472000 → "02:30 PM"
</pre>

{% endraw %}

**Leave Time** (endTime):

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{item?.endTime
  ? moment.unix(item?.endTime).local().format("hh:mm A")
  : "No Show"}

// Unix timestamp → Local time
// Example: 1733475600 → "03:30 PM"
</pre>

{% endraw %}

### No Show Handling

**Conditions for "No Show"**:

- startTime is null or 0
- endTime is null or 0
- Participant did not join the session

**Display**: Text "No Show" instead of time

### Use Cases

- **Verify Attendance**: Confirm who actually attended
- **Track Lateness**: See if students joined late
- **Monitor Duration**: Calculate actual time spent
- **Resolve Disputes**: Evidence of participation
- **Billing Verification**: Confirm session occurred

### Multiple Entries

**Possible Scenarios**:

- Participant rejoined after disconnection
- Multiple devices/accounts used
- Technical issues causing re-entry

**Display**: All entries shown chronologically

### Empty State

Shows when:

- `confrences` array is empty
- No one joined the session
- Attendance data not synced yet

**Reference**: `src/screens/session-details/session-details.tsx:564-654`

---

## Notes & Recordings

### Session Notes

**Location**: Notes & Actions section (top-right)

#### Note Structure

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Session Note:
  ├─ File Icon (DescriptionOutlinedIcon)
  ├─ Filename (trimmed display)
  └─ Download Button
      ├─ Icon: CloudDownloadOutlinedIcon
      ├─ Text: "Download Notes"
      └─ Styling: Main color with shadow
</pre>

{% endraw %}

#### Filename Trimming

**Purpose**: Display clean filename without timestamp prefix

**Logic**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const trimFileName = (url: string | null) => {
  const regex = /file-\d+-\d+-(.+)$/;
  const match = url?.match(regex);
  return match ? match[1] : null;
};

// Example:
// Input:  "file-123-456-session-notes.pdf"
// Output: "session-notes.pdf"
</pre>

{% endraw %}

#### Download Behavior

- **Action**: Click "Download Notes" button
- **Result**: File downloads to user's device
- **Format**: PDF, DOCX, or other document formats

### Google Meet Recording

**Location**: Actions section (recording link button)

#### Recording Link Structure

**Storage**: JSON string array in `meet_recording` field

**Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Database value
meet_recording: '["https://meet.google.com/recording/abc123", "https://meet.google.com/recording/xyz789"]'

// Parsed value
["https://meet.google.com/recording/abc123", "https://meet.google.com/recording/xyz789"]
</pre>

{% endraw %}

#### Access Recording

**Button**:

- Icon: EmergencyRecordingRoundedIcon
- Label: "Recording Link"
- Action: Opens first recording URL in new tab

**Logic**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
onClick={() => {
  const meetRecording = JSON.parse(data[0]?.session?.meet_recording);
  if (meetRecording?.length > 0) {
    window.open(meetRecording[0], "_blank");
  } else {
    toast.error("No Recording Found");
  }
}}
</pre>

{% endraw %}

#### No Recording Handling

**Scenarios**:

- Recording not enabled in Google Meet
- Session too short to record
- Recording still processing
- Recording permission denied

**Display**: Toast error message: "No Recording Found"

### Recording Availability

**Typical Timeline**:

1. **During Session**: Not available
2. **Immediately After**: Processing
3. **15-30 mins Later**: Available
4. **Solution**: Use "Reload" button to sync latest recording link

**Reference**: `src/screens/session-details/session-details.tsx:358-373`

---

## Role-Based Access

### Access Control Matrix

| Feature              | Admin | SuperAdmin | Teacher | Student | Parent |
| -------------------- | ----- | ---------- | ------- | ------- | ------ |
| View Session Details | ✓     | ✓          | ✓       | ✓       | ✓      |
| View Transactions    | ✓     | ✓          | ✗       | ✗       | ✗      |
| Edit Duration        | ✓     | ✓          | ✗       | ✗       | ✗      |
| Edit Conclusion Type | ✓     | ✓          | ✗       | ✗       | ✗      |
| Reload Session       | ✓     | ✓          | ✗       | ✗       | ✗      |
| Delete Session       | ✓     | ✓          | ✗       | ✗       | ✗      |
| View Recording Link  | ✓     | ✓          | ✓       | ✓       | ✓      |
| Download Notes       | ✓     | ✓          | ✓       | ✓       | ✓      |
| View Attendance      | ✓     | ✓          | ✓       | ✓       | ✓      |
| View Student Details | ✓     | ✓          | ✓       | ✓       | ✓      |
| View Enrollment Info | ✓     | ✓          | ✓       | ✓       | ✓      |

### Role-Specific Views

#### Admin/SuperAdmin

**Full Access**: All sections and actions visible

**Unique Features**:

- Transaction Details section
- Edit duration functionality
- Edit conclusion type functionality
- Reload session button
- Delete session button

#### Teacher

**View Access**: All information sections

**Limited Actions**:

- Cannot edit session
- Cannot delete session
- Cannot reload session
- Cannot view detailed transactions

**Use Case**: Review session for grading, verify attendance

#### Student

**View Access**: All information sections

**Limited Actions**:

- Cannot edit session
- Cannot delete session
- Cannot reload session
- Cannot view detailed transactions

**Use Case**: Check attendance, access recordings and notes

#### Parent

**View Access**: All information sections for children's sessions

**Limited Actions**:

- Cannot edit session
- Cannot delete session
- Cannot reload session
- Cannot view detailed transactions

**Use Case**: Monitor child's attendance and participation

### Authentication

**Protection**: `withAuth` HOC

**Requirements**:

- Valid JWT token
- Authenticated user session
- Role-based page access

**Redirect**: Unauthenticated users redirected to `/signin`

**Reference**: `src/app/(protected)/[role]/session-details/[id]/page.tsx:11`

---

## State Management

### Redux Store

**Slices Used**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
user:
  └─ token: JWT authentication token
</pre>

{% endraw %}

**Accessing Redux State**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
import { useAppSelector } from "@/lib/store/hooks/hooks";

const token = useAppSelector((state) => state?.user?.token);
</pre>

{% endraw %}

### React Query Cache

**Query Keys**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
["sessionsById"]              // Session details data
["getAllTransactions", token] // Transaction data
</pre>

{% endraw %}

**Cache Configuration**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  enabled: !!token,             // Only fetch if token exists
  refetchOnWindowFocus: true,   // Refetch when window regains focus
  staleTime: 0,                 // Data immediately stale (always fresh)
}
</pre>

{% endraw %}

**Cache Invalidation**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// After update
refetch();
refetchTransactions();

// After reload
refetch();
refetchTransactions();

// After delete
// No refetch needed (navigate away)
</pre>

{% endraw %}

### Local Component State

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Modal states
const [editSessionModalType, setEditSessionModalType] = useState<string>("");
const [deleteModal, setDeleteModal] = useState<boolean>(false);
const [editModal, setEditModal] = useState<boolean>(false);

// URL parameter
const { id } = useParams() as { id: string };

// Router
const router = useRouter();
</pre>

{% endraw %}

### URL Parameters

**Route Pattern**: `/{role}/session-details/[id]`

**Parameters**:

- `role`: User role (from route)
- `id`: Session ID (from route parameter)

**Extraction**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
import { useParams } from "next/navigation";

const { id } = useParams() as { id: string };
</pre>

{% endraw %}

**Reference**: `src/screens/session-details/session-details.tsx:44-48`

---

## UI Components

### Loading States

#### Initial Page Load

**Component**: `<LoadingBox />`

**Condition**: `isLoading && isLoadingTransactions`

**Display**: Full-page loading spinner

#### Reload Action

**Component**: Custom loading spinner

**Condition**: `handleReload?.isPending`

**Display**: Small spinner in actions section

**Styling**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
<LoadingBox
  loaderStyling={{
    height: "3.5vh !important",
    width: "3.5vh !important",
  }}
/>
</pre>

{% endraw %}

### Error States

#### No Data Available

**Component**: `<ErrorBox />`

**Display Conditions**:

- Session data empty or null
- Transaction data empty
- Notes array empty
- Student details empty
- Attendance records empty

#### API Errors

**Handling**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
useEffect(() => {
  if (error || transactionError) {
    const axiosError = (error || transactionError) as MyAxiosError;
    if (axiosError.response) {
      toast.error(axiosError.response.data.error);
    } else {
      toast.error(axiosError.message);
    }
  }
}, [error, transactionError]);
</pre>

{% endraw %}

**Display**: Toast notification with error message

### Success States

**Toast Notifications**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Update success
toast.success("Session Update Successfully");

// Reload success
toast.success("Session Reload Successfully");

// Delete success
toast.success("Session Deleted Successfully");
</pre>

{% endraw %}

### Responsive Design

**Container**: Material-UI Container with `maxWidth={false}`

**Layout**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Desktop:
  ├─ Row 1 (Two columns)
  │   ├─ Left: Enrollment Details
  │   └─ Right: Notes & Actions
  └─ Row 2 (Split layout)
      ├─ Left: Transaction Details + Student Details (stacked)
      └─ Right: Attendance

Mobile:
  └─ Single column (all sections stacked)
</pre>

{% endraw %}

**Breakpoints**: Handled by CSS modules

**Reference**: `src/screens/session-details/session-details.module.css`

---

## Integration with Other Modules

### Sessions Module

**Relationship**: Session Details is the detailed view of a single session from the Sessions list

**Navigation**:

- From Sessions list → Click session row → Session Details
- From Session Details → Delete → Navigate back to Sessions list

**Data Sharing**:

- Session ID
- Session metadata
- Filtering context

**See**: [Sessions Module](./SESSIONS.md)

---

### Enrollment Details Module

**Relationship**: Sessions are linked to enrollments

**Integration Points**:

- Enrollment ID visible in session details
- Class schedule information
- Student and teacher assignments

**Navigation**:

- Can navigate from Enrollment Details → Sessions tab → Session Details

**See**: [Enrollment Details Module](../enrollment-details/ENROLLMENT_DETAILS.md)

---

### Transactions Module

**Relationship**: Financial transactions are created for sessions

**Data Flow**:

- Session created → Transactions generated based on conclusion type
- Session deleted → Transactions marked as reverted
- Session edited (conclusion type) → Transactions recalculated

**Display**: Transaction Details section shows session-specific transactions

---

### Users Module

**Relationship**: Session participants (teachers and students)

**Data Usage**:

- User profiles (names, images)
- User IDs for identification
- Role information

**See**: [Users Module](../users-module/USER_FLOWS.md)

---

## File References

### Core Files

| File                                                                                           | Purpose                     | Lines |
| ---------------------------------------------------------------------------------------------- | --------------------------- | ----- |
| `src/screens/session-details/session-details.tsx`                                              | Main session details screen | 698   |
| `src/app/(protected)/[role]/session-details/[id]/page.tsx`                                     | Route definition            | 12    |
| `src/services/dashboard/superAdmin/session-details/session-details.ts`                         | Session details service     | 11    |
| `src/services/dashboard/superAdmin/sessions/sessions.ts`                                       | Session CRUD operations     | 150+  |
| `src/services/dashboard/superAdmin/transactions/transactions.ts`                               | Transaction service         | 100+  |
| `src/components/ui/superAdmin/session-details/edit-enrollment-modal/edit-enrollment-modal.tsx` | Edit session modal          | 171   |
| `src/components/ui/superAdmin/enrollment/delete-modal/delete-modal.tsx`                        | Delete confirmation modal   | 80+   |

### Type Definitions

| File                                                                        | Purpose               |
| --------------------------------------------------------------------------- | --------------------- |
| `src/services/dashboard/superAdmin/session-details/session-details.type.ts` | Session details types |
| `src/types/sessions/`                                                       | Session-related types |
| `src/types/transactions/`                                                   | Transaction types     |

### Utilities

| File                                            | Purpose                 |
| ----------------------------------------------- | ----------------------- |
| `src/utils/helpers/convert-minutes-to-hours.ts` | Time conversion utility |
| `src/utils/helpers/sessionType-styles.ts`       | Session status styling  |
| `src/utils/withAuth/withAuth.jsx`               | Authentication HOC      |

### Styling

| File                                                                                                  | Purpose            |
| ----------------------------------------------------------------------------------------------------- | ------------------ |
| `src/screens/session-details/session-details.module.css`                                              | Main screen styles |
| `src/components/ui/superAdmin/session-details/edit-enrollment-modal/edit-enrollment-modal.module.css` | Edit modal styles  |

---

## Best Practices

### Performance Optimization

1. **Memoized Callbacks**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const findById = useCallback((id: number, arr: any) => {
  return arr?.find((item: any) => item.student_id === id) || null;
}, []);

const trimFileName = useCallback((url: string | null) => {
  const regex = /file-\d+-\d+-(.+)$/;
  const match = url?.match(regex);
  return match ? match[1] : null;
}, []);
</pre>

{% endraw %}

2. **Parallel Data Fetching**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Both queries run simultaneously
useQuery({ queryKey: ["sessionsById"], ... });
useQuery({ queryKey: ["getAllTransactions", token], ... });
</pre>

{% endraw %}

3. **Conditional Rendering**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{isLoading && isLoadingTransactions ? (
  <LoadingBox />
) : data && data?.length > 0 ? (
  <SessionDetails />
) : (
  <ErrorBox />
)}
</pre>

{% endraw %}

### Error Handling

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Comprehensive error handling
onError: (error) => {
  const axiosError = error as MyAxiosError;
  if (axiosError.response) {
    toast.error(
      axiosError.response.data.error ||
      `${axiosError.response.status} ${axiosError.response.statusText}`
    );
  } else {
    toast.error(axiosError.message);
  }
}
</pre>

{% endraw %}

### Data Validation

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Validate before submission
if (!duration) {
  toast.error("Please provide a duration.");
  return;
}

const durationNumber = Number(duration);

if (isNaN(durationNumber) || durationNumber <= 0) {
  toast.error("Please provide a valid positive number for duration.");
  return;
}
</pre>

{% endraw %}

### User Experience

1. **Loading Feedback**: Show spinners during API calls
2. **Success Feedback**: Toast notifications for successful actions
3. **Error Feedback**: Clear error messages with toast notifications
4. **Confirmation Dialogs**: For destructive actions (delete)
5. **Data Refetching**: Automatic refresh after mutations
