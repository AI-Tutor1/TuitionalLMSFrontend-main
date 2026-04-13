# Ongoing Classes Module Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Automatic Lifecycle](#automatic-lifecycle)
4. [Routing](#routing)
5. [Data Flow](#data-flow)
6. [API Integration](#api-integration)
7. [Component Structure](#component-structure)
8. [Class Management](#class-management)
9. [Role-Based Access](#role-based-access)
10. [State Management](#state-management)
11. [UI Components](#ui-components)
12. [Modal Features](#modal-features)
13. [Integration with Other Modules](#integration-with-other-modules)
14. [File References](#file-references)

---

## Overview

The Ongoing Classes module provides **real-time monitoring and management** of live educational sessions in the Tuitional LMS. It displays classes that are currently active or about to start, allowing administrators and teachers to manage them effectively.

### Key Features

- **Automatic lifecycle management** (classes appear 40 mins before, removed 50 mins after)
- Real-time monitoring with 30-second auto-refresh
- Balance status tracking for payment monitoring
- Class duration extension capability
- Support ticket generation within class context
- Quick access to Google Meet sessions
- Role-based access and functionality
- Mobile-responsive card-based UI

### Ongoing Class States

Classes in the ongoing list can be:

- **Upcoming**: Created 40 minutes before start, waiting for class to begin
- **Active**: Class has started and is currently in progress
- **Extended**: Class duration has been extended beyond original time
- **Rescheduled**: Previously scheduled class that was rescheduled

---

## Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Data Fetching**: TanStack Query (React Query) + Axios
- **State Management**: Redux Toolkit with Redux Persist
- **UI Components**: Material-UI (MUI)
- **Styling**: CSS Modules
- **Time Handling**: Moment.js for timezone conversion

### Directory Structure

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
src/
├── app/(protected)/[role]/
│   └── activities/
│       └── page.tsx                                 # Activities page with tabs
├── screens/
│   ├── admin-ongoingClasses/
│   │   ├── admin-ongoingClasses.tsx                # Main ongoing classes screen
│   │   ├── admin-ongoingClasses.module.css
│   │   └── components/
│   │       └── card/
│   │           ├── card.tsx                         # Individual class card
│   │           └── card.module.css
│   └── student-teacher-dashboard/
│       └── components/
│           └── ongoing-class/
│               ├── ongoing-class.tsx                # Dashboard widget
│               └── ongoing-class.module.css
├── components/ui/
│   ├── teacher-admin-ongoingClasses-extendClassModal/
│   │   └── extendClassModal/
│   │       └── extendClassModal.tsx                 # Extend duration modal
│   └── superAdmin/admin-ongoingclasses/
│       └── ticketing-modal/
│           └── ticketing-modal.tsx                  # Generate ticket modal
├── services/dashboard/superAdmin/
│   ├── class-schedule/
│   │   ├── getOngoingClasses.ts                    # Fetch ongoing classes
│   │   └── extend-class.ts                          # Extend class duration
│   └── tickets/
│       └── tickets.ts                               # Ticket operations
├── api/
│   ├── class-schedule.api.ts                        # API endpoint builders
│   └── ticket.api.ts
└── types/
    ├── class-schedule/
    │   └── getOngoingClasses.types.ts               # TypeScript types
    ├── extend-class/
    │   └── extendClassDuration.types.ts
    └── ticket/
        └── ticket.types.ts
</pre>

---

## Automatic Lifecycle

### Overview

Ongoing classes are **automatically managed by the backend** based on scheduled class times. The frontend simply polls and displays the current state.

### Creation Timing: 40 Minutes Before

**When**: Ongoing class record is created **40 minutes before** the scheduled class start time

**Purpose**:

- ✅ Allows teachers and students to join early
- ✅ Provides time for pre-class preparation
- ✅ Enables admins to monitor upcoming classes
- ✅ Allows early identification of issues (balance, availability)
- ✅ Gives time for technical setup and testing
- ✅ Students can ask pre-class questions

**Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Scheduled Class Time: 2:00 PM
Ongoing Class Created: 1:20 PM (40 minutes before)
Visible in Activities Tab: From 1:20 PM onwards
</pre>

### Removal Timing: 50 Minutes After

**When**: Ongoing class record is removed **50 minutes after** the scheduled class start time

**Purpose**:

- ✅ Most classes (45-60 mins) have completed
- ✅ Provides buffer for slight overruns
- ✅ Ensures class completion before removal
- ✅ **Synchronized with session creation** (sessions created at same time)
- ✅ Extended classes have time to complete
- ✅ Keeps ongoing list clean and current

**Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Scheduled Class Start: 2:00 PM
Ongoing Class Removed: 2:50 PM (50 minutes after)
Session Record Created: 2:50 PM (same time - see Sessions module)
No longer visible: After 2:50 PM
</pre>

### Complete Lifecycle Timeline

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Timeline for a Class Scheduled at 2:00 PM (60-minute duration):

12:00 PM   Class Schedule Created in system
            ↓
            ... (time passes)
            ↓
1:20 PM    [ONGOING CLASS CREATED] ← 40 minutes before start
            ↓
            → Appears in Activities → Ongoing Classes tab
            → Teachers/students can join early
            → Admins can monitor and prepare
            → "Join Now" button available
            ↓
2:00 PM    [CLASS STARTS] ← Scheduled start time
            ↓
            → Participants join Google Meet
            → Class in progress
            → Can be extended if needed
            → Tickets can be generated
            ↓
2:50 PM    [DUAL EVENT] ← 50 minutes after start
            ↓
            ├─→ Ongoing class REMOVED from activities
            └─→ Session record CREATED (see Sessions module)
            ↓
            → Class transitions from "ongoing" to "completed"
            → Session available for viewing in Sessions tab
            → Attendance, duration, recordings captured
            → Historical record maintained
</pre>

### Edge Cases & Special Scenarios

#### Extended Classes

- **Scenario**: Admin/teacher extends class by 30 minutes
- **Behavior**: Ongoing class remains visible beyond 50-minute window
- **Removal**: Happens after extended duration completes
- **Example**:
<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Original: 2:00 PM - 3:00 PM (removed at 2:50 PM)
Extended by 30 mins: 2:00 PM - 3:30 PM (removed at 3:20 PM)
Calculation: Start time + Extended duration + 50 mins buffer
</pre>

#### Rescheduled Classes

- **Scenario**: Class was rescheduled to a new time
- **Behavior**: Follows same timing rules as regular classes
- **Creation**: 40 mins before rescheduled time
- **Removal**: 50 mins after rescheduled start
- **UI Indicator**: Marked with "Rescheduled" badge

#### Very Short Classes (< 50 minutes)

- **Scenario**: Class scheduled for 30 or 45 minutes
- **Behavior**: Still removed at 50 mins after start
- **Reason**: Maintains consistency, allows session creation time
- **Example**:
<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
30-min class starting at 2:00 PM:
- Ends at 2:30 PM
- Ongoing removed at 2:50 PM
- Provides 20-min buffer
</pre>

#### Classes Scheduled Within 40-Minute Window

- **Scenario**: Class created to start in less than 40 minutes
- **Behavior**: Ongoing class created immediately upon schedule creation
- **Example**:
<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Current time: 1:50 PM
Class scheduled for: 2:00 PM (10 mins away)
Result: Ongoing class appears immediately
</pre>

### Responsibilities

- 🖥️ Polling for current ongoing classes (every 30 seconds)
- 🖥️ Displaying ongoing classes in UI
- 🖥️ Handling user actions (extend, ticket, join)
- 🖥️ Auto-refresh to show latest state
- 🖥️ No direct control over lifecycle timing

---

## Routing

### Main Route

**Path**: `/{role}/activities`

**Tabs**:

1. **Ongoing Classes** (documented here)
2. Tutor Interviews (separate)
3. Demo (separate)

**Access**: superAdmin, admin, counsellor, hr, teacher

**Default Active Tab**: "Ongoing Classes"

**File**: `src/app/(protected)/[role]/activities/page.tsx`

### Component Rendering

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const SessionsPage: React.FC = () =&gt; {
  const tabsArray = ["Ongoing Classes", "Tutor Interviews", "Demo"];
  const [activeTab, setActiveTab] = useState("Ongoing Classes");

  const tabContent = useMemo(() =&gt; {
    switch(activeTab) {
      case "Ongoing Classes":
        return &lt;AdminOngoingClasses /&gt;;
      case "Demo":
        return &lt;AdminOngoingDemos /&gt;;
      case "Tutor Interviews":
        return &lt;TutorInterviews /&gt;;
    }
  }, [activeTab]);

  return (
    &lt;div&gt;
      &lt;Tabs value={activeTab} onChange={(e, value) =&gt; setActiveTab(value)}&gt;
        {tabsArray.map(tab =&gt; &lt;Tab key={tab} value={tab} label={tab} /&gt;)}
      &lt;/Tabs&gt;
      {tabContent}
    &lt;/div&gt;
  );
};
</pre>

**Reference**: `src/app/(protected)/[role]/activities/page.tsx:15-45`

---

## Data Flow

### Flow Chart

Flow Chart Link: https://tinyurl.com/2zju9v3d

Flow Chart Code:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
flowchart TD
Start([User Opens<br/>Activities Page]) --> CheckAuth{User Role<br/>Authorized?}

    CheckAuth -->|superAdmin/admin<br/>counsellor/hr<br/>teacher| InitTabs[Initialize<br/>Activities Tabs]
    CheckAuth -->|Unauthorized| AccessDenied[Access Denied<br/>Redirect to Login]

    InitTabs --> ActiveTab{Select Active Tab}

    ActiveTab -->|Ongoing Classes| LoadOngoing[Load Ongoing<br/>Classes Component]
    ActiveTab -->|Tutor Interviews| LoadInterviews[Load Interviews<br/>Not Documented]
    ActiveTab -->|Demo| LoadDemo[Load Demos<br/>Not Documented]

    LoadOngoing --> SetupPolling[Setup Auto-Refresh<br/>30-second polling]

    SetupPolling --> FetchClasses[Fetch Ongoing Classes<br/>GET /api/classSchedule<br/>/getOngoingClasses]

    FetchClasses --> CheckResponse{API<br/>Response?}

    CheckResponse -->|Error| ShowError[Display Error Toast<br/>Show Error Message]
    ShowError --> WaitPolling[Wait 30 seconds]
    WaitPolling --> FetchClasses

    CheckResponse -->|Success| CheckData{Classes<br/>Found?}

    CheckData -->|No Classes| ShowEmpty[Display Empty State<br/>No classes ongoing<br/>at the moment...]
    ShowEmpty --> WaitPolling

    CheckData -->|Classes Found| RenderCards[Render Class Cards<br/>in Grid Layout]

    RenderCards --> DisplayInfo[Display Each Card:<br/>• Start Time & Rescheduled Badge<br/>• Enrollment ID & Priority<br/>• Balance Status<br/>• Teacher Info & Subject<br/>• Student Profiles<br/>• Board/Grade/Curriculum<br/>• Action Buttons]

    DisplayInfo --> UserAction{User<br/>Action?}

    %% EXTEND CLASS FLOW
    UserAction -->|Click<br/>Extend Class| OpenExtendModal[Open Extend<br/>Class Modal]
    OpenExtendModal --> ShowExtendForm[Show:<br/>• Current Duration<br/>• Extension Options<br/>• New Total]
    ShowExtendForm --> SelectExtension[User Selects<br/>Extension Duration]
    SelectExtension --> ConfirmExtend{Confirm<br/>Extension?}
    ConfirmExtend -->|No| CloseExtendModal[Close Modal]
    CloseExtendModal --> UserAction
    ConfirmExtend -->|Yes| SubmitExtend[Submit Request<br/>POST /api/class-schedule/extend]
    SubmitExtend --> ExtendResponse{Success?}
    ExtendResponse -->|No| ShowExtendError[Display Error Toast]
    ShowExtendError --> OpenExtendModal
    ExtendResponse -->|Yes| ExtendSuccess[Duration Updated<br/>Removal Time Adjusted]
    ExtendSuccess --> RefetchAfterExtend[Refetch Ongoing Classes]
    RefetchAfterExtend --> ShowExtendToast[Show Success Toast]
    ShowExtendToast --> CloseExtendModal

    %% GENERATE TICKET FLOW
    UserAction -->|Click<br/>Generate Ticket| OpenTicketModal[Open Ticketing Modal]
    OpenTicketModal --> CheckUserRole{User Role?}

    CheckUserRole -->|Admin/SuperAdmin<br/>Counsellor/HR| ShowRoleSelect[Show Role Selection:<br/>Teacher or Student]
    ShowRoleSelect --> SelectRecipient[User Selects<br/>Recipient Role]
    SelectRecipient --> AutoFillRecipients[Auto-fill Recipients<br/>Based on Selection]

    CheckUserRole -->|Teacher| AutoSelectStudents[Auto-select<br/>All Students]
    CheckUserRole -->|Student| AutoSelectTeacher[Auto-select<br/>Teacher]

    AutoFillRecipients --> FillTicketForm[Fill Form]
    AutoSelectStudents --> FillTicketForm
    AutoSelectTeacher --> FillTicketForm

    FillTicketForm --> EnterTicketDetails[Enter:<br/>• Subject<br/>• Priority]
    EnterTicketDetails --> ValidateTicket{Form<br/>Valid?}
    ValidateTicket -->|No| ShowTicketValidation[Show Validation<br/>Error]
    ShowTicketValidation --> FillTicketForm
    ValidateTicket -->|Yes| SubmitTicket[Submit Ticket<br/>POST /api/tickets]
    SubmitTicket --> TicketResponse{Success?}
    TicketResponse -->|No| ShowTicketError[Display API<br/>Error Toast]
    ShowTicketError --> FillTicketForm
    TicketResponse -->|Yes| TicketCreated[Ticket Generated<br/>and Sent]
    TicketCreated --> RefetchAfterTicket[Refetch Ongoing Classes]
    RefetchAfterTicket --> ShowTicketToast[Show Success Toast]
    ShowTicketToast --> CloseTicketModal[Close Modal]
    CloseTicketModal --> UserAction

    %% JOIN CLASS FLOW
    UserAction -->|Click<br/>Join Now| CheckMeetLink{Meet Link<br/>Available?}
    CheckMeetLink -->|No| ShowNoLink[Display Error:<br/>No Meet Link]
    ShowNoLink --> UserAction
    CheckMeetLink -->|Yes| OpenMeet[Open Google Meet<br/>in New Tab]
    OpenMeet --> UserAction

    %% BALANCE STATUS
    UserAction -->|Hover Balance<br/>Status| CheckBalance{Insufficient<br/>Balance?}
    CheckBalance -->|Yes| ShowBalanceTooltip[Display Tooltip:<br/>Student Names with<br/>Insufficient Balance]
    ShowBalanceTooltip --> UserAction
    CheckBalance -->|No| NoTooltip[No Tooltip<br/>All Sufficient]
    NoTooltip --> UserAction

    %% AUTO REFRESH
    UserAction -->|Wait 30 sec| AutoRefresh[Auto-Refresh<br/>Triggered]
    AutoRefresh --> FetchClasses

    UserAction -->|Continue<br/>Monitoring| UserAction

    %% STYLING
    style Start fill:#e1f5ff,stroke:#0277bd,stroke-width:2px
    style AccessDenied fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style ShowError fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style ShowExtendError fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style ShowTicketError fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style ShowTicketValidation fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style ShowNoLink fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style ExtendSuccess fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style TicketCreated fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style ShowExtendToast fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style ShowTicketToast fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style FetchClasses fill:#bbdefb,stroke:#1565c0,stroke-width:2px
    style SubmitExtend fill:#bbdefb,stroke:#1565c0,stroke-width:2px
    style SubmitTicket fill:#bbdefb,stroke:#1565c0,stroke-width:2px
    style RenderCards fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style DisplayInfo fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style LoadOngoing fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
</pre>

### High-Level Data Flow

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Backend Automatic Lifecycle:
  Class Schedule Created
         ↓
  Wait until T - 40 mins
         ↓
  Backend creates ongoing class record
         ↓
  Ongoing class appears in database
         ↓

Frontend Polling &amp; Display:
  User opens Activities page
         ↓
  Component mounts
         ↓
  React Query fetches ongoing classes (GET /api/classSchedule/getOngoingClasses)
         ↓
  Every 30 seconds: Auto-refresh
         ↓
  Display classes in grid layout
         ↓
  User Actions:
    ├─ Extend Class → POST /api/class-schedule/extend → Refetch
    ├─ Generate Ticket → POST /api/tickets → Refetch
    └─ Join Now → Open meetLink in new tab
         ↓

Backend Cleanup:
  Wait until T + 50 mins
         ↓
  Backend removes ongoing class record
         ↓
  Backend creates session record (see Sessions module)
         ↓
  Next frontend refresh: Class no longer appears
</pre>

### Auto-Refresh Mechanism

**Configuration**:

- **Polling Interval**: 30 seconds
- **Stale Time**: 30 seconds
- **Refetch on Window Focus**: Disabled
- **Placeholder Data**: Keep previous data (prevents flickering)

**Code**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { data, isLoading } = useQuery({
  queryKey: ["getOngoingClasses", token],
  queryFn: () =&gt; getOngoingClasses({}, { token }),
  placeholderData: keepPreviousData,
  staleTime: 30000,           // 30 seconds
  refetchInterval: 30000,      // Auto-refresh every 30 seconds
  enabled: !!token,
  refetchOnWindowFocus: false,
});
</pre>

**Reference**: `src/screens/admin-ongoingClasses/admin-ongoingClasses.tsx:52-66`

---

## API Integration

### Base URL

Configured in environment variables

### 1. Get Ongoing Classes

**Endpoint**: `GET /api/classSchedule/getOngoingClasses`

**Service Function**: `getOngoingClasses(options, config)`

**Location**: `src/services/dashboard/superAdmin/class-schedule/getOngoingClasses.ts`

**Query Parameters**:

| Parameter    | Type   | Required | Description                         |
| ------------ | ------ | -------- | ----------------------------------- |
| `student_id` | string | No       | Filter by specific student ID       |
| `tutor_id`   | string | No       | Filter by specific tutor/teacher ID |

**Request Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Admin view (all classes)
GET /api/classSchedule/getOngoingClasses

// Teacher view (own classes)
GET /api/classSchedule/getOngoingClasses?tutor_id=42

// Student view (enrolled classes)
GET /api/classSchedule/getOngoingClasses?student_id=123
</pre>

**Response Type**: `ClassScheduleWithStudents[]`

**Response Structure**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
[
  {
    id: number;
    status: boolean;
    enrollment_id: number;
    teacher_schedule_id: number;
    meetLink: string;
    meetSpace: string;
    isCancelled: boolean | null;
    DateTime?: string;
    createdAt?: string;
    updatedAt: string;
    duration: number | null;
    deletedAt: string | null;
    enrollment_reschedual?: any;

    enrollment: {
      id: number;
      priority: string;              // "Low" | "Moderate" | "High"
      tutor_id: number;
      status: number;
      subject_id: number;
      board_id: number | null;
      curriculum_id: number;
      grade_id: number;

      tutor: {
        id: number;
        name: string;
        email: string;
        profileImageUrl: string;
      };

      subject: { id: number; name: string; };
      board: { id: number; name: string; };
      curriculum: { id: number; name: string; };
      grade: { id: number; name: string; };

      studentsGroups: [
        {
          id: number;
          student_id: number;
          user: {
            name: string;
            id: number;
            email: string;
            profileImageUrl: string;
            balance_status: "SUFFICIENT" | "INSUFFICIENT";
          };
        }
      ];
    };

    teacherSchedule?: {
      id: number;
      day_of_week: string;
      start_time?: string;
      session_duration?: number | null;
    };
  }
]
</pre>

**Auto-Refresh**: Automatically polls every 30 seconds

**Reference**: `src/services/dashboard/superAdmin/class-schedule/getOngoingClasses.ts:9-13`

---

### 2. Extend Class Duration

**Endpoint**: `POST /api/class-schedule/extend`

**Service Function**: `extendClass(payload, config)`

**Location**: `src/services/dashboard/superAdmin/class-schedule/extend-class.ts`

**Request Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  class_schedule_id: number;    // Required: ID of class to extend
  duration: number | null;      // Required: Extended duration in minutes
  isReschedual: boolean;        // Required: Whether it's a rescheduled class
}
</pre>

**Payload Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  class_schedule_id: 789,
  duration: 90,              // Original 60 mins + 30 mins extension
  isReschedual: false
}
</pre>

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  success: boolean;
  message: string;
  data: {
    id: number;
    status: boolean;
    enrollment_id: number;
    duration: number;           // Updated duration
    teacher_schedule_id: number;
    meetLink: string | null;
    meetSpace: string | null;
    isCancelled: boolean | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}
</pre>

**Use Case**:

- Class needs more time for complex topic
- Student requests additional clarification
- Technical issues delayed class start
- Exam preparation requires extra time

**Reference**: `src/services/dashboard/superAdmin/class-schedule/extend-class.ts:12-20`

---

### 3. Create Support Ticket

**Endpoint**: `POST /api/tickets`

**Service Function**: `createTicket(payload, config)`

**Location**: `src/services/dashboard/superAdmin/tickets/tickets.ts`

**Request Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  subject: string;                  // Required: Ticket subject/issue
  sendToIds: string[];              // Required: Array of user IDs
  priority: string;                 // Required: "Low" | "Medium" | "High"
  created_by_user_id: number | null;// Required: Creator's user ID
  enrollment_id: number | null;     // Required: Associated enrollment
  status: string;                   // Required: "Open"
}
</pre>

**Payload Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  subject: "Audio issues in ongoing class",
  sendToIds: ["42"],               // Teacher's ID
  priority: "High",
  created_by_user_id: 123,         // Admin's ID
  enrollment_id: 456,
  status: "Open"
}
</pre>

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  message: string;
  ticket: {
    id: number;
    subject: string;
    status: string;
    priority: string;
    enrollment_id: number;
    created_by_user_id: number;
    createdAt: string;
    updatedAt: string;
  };
}
</pre>

**Use Cases**:

- Technical issues (audio, video, connection)
- Student behavior concerns
- Teacher support requests
- Payment-related issues
- Emergency situations

**Reference**: `src/services/dashboard/superAdmin/tickets/tickets.ts:18-21`

---

## Component Structure

### Main Screen Component

**Component**: `AdminOngoingClasses`

**Location**: `src/screens/admin-ongoingClasses/admin-ongoingClasses.tsx`

**Responsibilities**:

- Fetch ongoing classes with 30-second auto-refresh
- Display classes in responsive grid layout
- Manage extend class modal state
- Manage ticketing modal state
- Handle mutations (extend class, create ticket)
- Show empty state when no classes

**Key State**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Extend class modal state
const [extendClassModalOpen, setExtendClassModalOpen] = useState({
  duration: number | null,
  modalOpen: boolean,
  classItem: any | null
});

// Ticketing modal state
const [ticketModal, setTicketModal] = useState({
  open: boolean,
  item: ClassScheduleWithStudents | null
});
</pre>

**React Query Hooks**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Fetch ongoing classes
const { data, isLoading, error } = useQuery({
  queryKey: ["getOngoingClasses", token],
  queryFn: () =&gt; getOngoingClasses({}, { token }),
  placeholderData: keepPreviousData,
  staleTime: 30000,
  refetchInterval: 30000,
  enabled: !!token,
  refetchOnWindowFocus: false,
});

// Extend class mutation
const handleExtendClass = useMutation({
  mutationFn: extendClass,
  onSuccess: () =&gt; {
    queryClient.invalidateQueries(["getOngoingClasses"]);
    toast.success("Class extended successfully");
    setExtendClassModalOpen({ duration: null, modalOpen: false, classItem: null });
  },
  onError: (error) =&gt; {
    toast.error(error.response?.data?.message || "Failed to extend class");
  },
});

// Create ticket mutation
const handleGenerateTicket = useMutation({
  mutationFn: createTicket,
  onSuccess: () =&gt; {
    queryClient.invalidateQueries(["getOngoingClasses"]);
    toast.success("Ticket created successfully");
    setTicketModal({ open: false, item: null });
  },
  onError: (error) =&gt; {
    toast.error(error.response?.data?.message || "Failed to create ticket");
  },
});
</pre>

**Empty State**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{data?.length === 0 &amp;&amp; (
  &lt;div className={styles.emptyState}&gt;
    &lt;img src="/assets/svgs/boy.svg" alt="No classes" /&gt;
    &lt;p&gt;There are no classes ongoing at the moment...&lt;/p&gt;
  &lt;/div&gt;
)}
</pre>

**Reference**: `src/screens/admin-ongoingClasses/admin-ongoingClasses.tsx:40-226`

---

## Class Management

### Viewing Ongoing Classes

**Admin/SuperAdmin View**:

- All ongoing classes across the platform
- No filters applied automatically
- Full management capabilities

**Teacher View**:

- Only own classes (auto-filtered by tutor_id)
- Can extend own classes
- Can generate tickets to students

**Student View**:

- Only enrolled classes (auto-filtered by student_id)
- Cannot extend classes
- Can generate tickets to teacher

**Parent View**:

- Children's classes (auto-filtered by children IDs)
- Read-only access
- No management actions

### Extending Class Duration

**Who Can Extend**: superAdmin, admin, counsellor, hr, teacher

**Process**:

1. **User clicks "Extend Class" button** on class card
2. **Extend Class Modal opens** showing:
   - Current class duration
   - Extension options dropdown (+30, +60, +120 mins)
   - Calculated new total duration
3. **User selects extension** amount
4. **User confirms** extension
5. **API request sent**: `POST /api/class-schedule/extend`
<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  class_schedule_id: classItem.id,
  duration: currentDuration + extensionAmount,
  isReschedual: !!classItem.enrollment_reschedual
}
</pre>
6. **On success**:
   - Class duration updated in database
   - Ongoing classes list refreshed
   - Success toast displayed
   - Modal closes automatically
   - Ongoing class removal time adjusted to account for extension
7. **On error**:
   - Error toast displayed
   - Modal remains open for retry

**Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Original class: 60 minutes (2:00 PM - 3:00 PM)
User extends by: 30 minutes
New duration: 90 minutes (2:00 PM - 3:30 PM)
Original removal time: 2:50 PM
New removal time: 3:20 PM (start + 90 mins duration - 40 mins buffer)
</pre>

**Reference**: `src/screens/admin-ongoingClasses/admin-ongoingClasses.tsx:68-103`

### Generating Support Tickets

**Who Can Generate**: All authorized roles (context-specific recipients)

**Process**:

1. **User clicks "Generate Ticket" icon** on class card
2. **Ticketing Modal opens** with smart defaults:

   **For Admin/SuperAdmin/Counsellor/HR**:

   - Shows role selector: "Teacher" or "Student"
   - If "Teacher" selected: Auto-fills teacher's ID
   - If "Student" selected: Auto-fills all students' IDs

   **For Teacher**:

   - Auto-selects all students in class
   - No role selector shown

   **For Student**:

   - Auto-selects the teacher
   - No role selector shown

3. **User fills form**:

   - Subject (required): Text input or dropdown
   - Priority (required): Low, Medium, High

4. **Form validation**:
<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
if (sendToIds.length === 0) {
  toast.error("Please select recipients");
  return;
}
if (!subject || !priority) {
  toast.error("Please fill all required fields");
  return;
}
</pre>

5. **API request sent**: `POST /api/tickets`
<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  subject: "Audio issues",
  sendToIds: ["42", "43"],
  priority: "High",
  created_by_user_id: currentUser.id,
  enrollment_id: classItem.enrollment_id,
  status: "Open"
}
</pre>

6. **On success**:

   - Ticket created in system
   - Recipients notified
   - Ongoing classes list refreshed
   - Success toast displayed
   - Modal closes automatically

7. **On error**:
   - Error toast displayed
   - Modal remains open for retry

**Common Ticket Subjects**:

- "Waiting in the class"
- "Homework not completed"
- "Audio/video issues"
- "Connection problems"
- "Student absent"
- "Technical difficulties"

**Reference**: `src/screens/admin-ongoingClasses/admin-ongoingClasses.tsx:105-136`

### Joining Classes

**Who Can Join**: All authorized roles with class access

**Process**:

1. **User clicks "Join Now" button** on class card
2. **System checks** if `meetLink` exists
3. **If available**:
   - Opens Google Meet link in new browser tab
   - User joins the ongoing class
   - Class join tracking may be logged (optional)
4. **If not available**:
   - Error message displayed
   - "No meet link available"

**Meet Link**:

- Generated when class schedule is created
- Typically a Google Meet URL
- Persistent for recurring classes
- Available from 40 mins before class starts

**Code**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleJoinClass = (meetLink: string) =&gt; {
  if (!meetLink) {
    toast.error("No meet link available");
    return;
  }
  window.open(meetLink, "_blank");
};
</pre>

**Reference**: `src/screens/admin-ongoingClasses/components/card/card.tsx:271-278`

---

## Role-Based Access

### Access Control Matrix

| Feature                      | superAdmin | admin | counsellor | hr  | teacher | student  | parent     |
| ---------------------------- | ---------- | ----- | ---------- | --- | ------- | -------- | ---------- |
| View Ongoing Classes         | All        | All   | All        | All | Own     | Enrolled | Children's |
| Extend Class                 | ✓          | ✓     | ✓          | ✓   | ✓ (own) | ✗        | ✗          |
| Generate Ticket (to teacher) | ✓          | ✓     | ✓          | ✓   | ✗       | ✓        | ✗          |
| Generate Ticket (to student) | ✓          | ✓     | ✓          | ✓   | ✓       | ✗        | ✗          |
| Join Class                   | ✓          | ✓     | ✓          | ✓   | ✓       | ✓        | ✗          |
| View Balance Status          | ✓          | ✓     | ✓          | ✓   | ✗       | ✗        | ✗          |

### Role-Specific Query Parameters

#### Admin/SuperAdmin/Counsellor/HR

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// No filters - view all ongoing classes
const payload = {};
</pre>

#### Teacher

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const payload = {
  tutor_id: userData.id.toString()  // Auto-filter to own classes
};
</pre>

#### Student

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const payload = {
  student_id: userData.id.toString()  // Auto-filter to enrolled classes
};
</pre>

#### Parent

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const payload = {
  student_id: childrenIds.join(',')  // Auto-filter to children's classes
};
</pre>

---

## State Management

### Redux Store

**Slices Used**:

- `user.token`: JWT authentication token
- `user.user`: Current user data (id, roleId, name, email)
- `user.childrens`: For parent role (list of children)

**Accessing Redux State**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
import { useSelector } from 'react-redux';

const token = useSelector((state: RootState) =&gt; state.user.token);
const userData = useSelector((state: RootState) =&gt; state.user.user);
const childrens = useSelector((state: RootState) =&gt; state.user.childrens);
</pre>

### React Query Cache

**Query Keys**:

- `["getOngoingClasses", token]`: Main ongoing classes list
- Auto-invalidated after mutations (extend, ticket)

**Cache Configuration**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  staleTime: 30000,              // Consider data stale after 30 seconds
  refetchInterval: 30000,        // Auto-refetch every 30 seconds
  placeholderData: keepPreviousData,  // Show old data while refetching
  enabled: !!token,              // Only fetch if token exists
  refetchOnWindowFocus: false,   // Don't refetch on window focus
}
</pre>

**Cache Invalidation**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// After extending class
queryClient.invalidateQueries(["getOngoingClasses"]);

// After creating ticket
queryClient.invalidateQueries(["getOngoingClasses"]);

// After any mutation that affects ongoing classes
queryClient.invalidateQueries(["getOngoingClasses"]);
</pre>

### Local Component State

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Extend class modal
const [extendClassModalOpen, setExtendClassModalOpen] = useState({
  duration: number | null,
  modalOpen: boolean,
  classItem: any | null
});

// Ticketing modal
const [ticketModal, setTicketModal] = useState({
  open: boolean,
  item: ClassScheduleWithStudents | null
});

// Loading states handled by React Query
const { isLoading, isFetching } = useQuery(...);

// Error states handled by React Query
const { error } = useQuery(...);
</pre>

---

## UI Components

### Class Card Component

**Component**: `Card`

**Location**: `src/screens/admin-ongoingClasses/components/card/card.tsx`

**Purpose**: Display individual ongoing class information in organized card format

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
interface CardProps {
  item?: ClassScheduleWithStudents;
  students?: any[];
  handleExtendClass: (duration: number | null, openModal: boolean) =&gt; void;
  handleTicketingModal: (item: ClassScheduleWithStudents) =&gt; void;
}
</pre>

**Card Layout Sections**:

#### 1. Time Section (Top-Left, Light Blue Background)

- **"Started at" label**
- **Formatted start time** (12-hour format with AM/PM)
- **"Rescheduled" badge** (if applicable)

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const startTime = checkTimeFormat(item?.DateTime || item?.teacherSchedule?.start_time);
// Output: "02:30 PM"
</pre>

#### 2. Enrollment Information

- **Enrollment ID**: Displays enrollment identifier
- **Priority Badge**: Low (blue) / Moderate (orange) / High (red)
- **Balance Status Badge**:
  - **Green "Sufficient"**: All students have sufficient balance
  - **Red "Insufficient"**: At least one student lacks balance
  - **Tooltip on hover**: Shows names of students with insufficient balance

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const hasInsufficientBalance = enrollment.studentsGroups.some(
  student =&gt; student.user.balance_status === "INSUFFICIENT"
);

const insufficientStudents = enrollment.studentsGroups
  .filter(s =&gt; s.user.balance_status === "INSUFFICIENT")
  .map(s =&gt; s.user.name);
</pre>

#### 3. Teacher & Subject Information

- **Teacher Profile Image**: Avatar with fallback
- **Teacher Name**: First 2 words displayed
- **Subject Name**: Full subject name
- **Duration**: In minutes

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;div className={styles.teacherInfo}&gt;
  &lt;img src={tutor.profileImageUrl || '/default-avatar.png'} alt={tutor.name} /&gt;
  &lt;div&gt;
    &lt;h4&gt;{tutor.name.split(' ').slice(0, 2).join(' ')}&lt;/h4&gt;
    &lt;p&gt;{subject.name}&lt;/p&gt;
    &lt;span&gt;{duration} mins&lt;/span&gt;
  &lt;/div&gt;
&lt;/div&gt;
</pre>

#### 4. Students Information

- **Student Profile Images**: Up to 2 visible (overlapped style)
- **Student First Names**: Capitalized
- **"+X more" indicator**: If more than 2 students

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const visibleStudents = studentsGroups.slice(0, 2);
const remainingCount = studentsGroups.length - 2;

{visibleStudents.map(student =&gt; (
  &lt;img key={student.id} src={student.user.profileImageUrl} /&gt;
))}
{remainingCount &gt; 0 &amp;&amp; &lt;span&gt;+{remainingCount} more&lt;/span&gt;}
</pre>

#### 5. Academic Details (Bottom Badges)

- **Board**: Education board name
- **Grade**: Grade level
- **Curriculum**: Curriculum name

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;div className={styles.badges}&gt;
  &lt;span className={styles.badge}&gt;{board.name}&lt;/span&gt;
  &lt;span className={styles.badge}&gt;{grade.name}&lt;/span&gt;
  &lt;span className={styles.badge}&gt;{curriculum.name}&lt;/span&gt;
&lt;/div&gt;
</pre>

#### 6. Action Buttons (Right Section)

Three action buttons with tooltips:

1. **Generate Ticket** (Icon button)
<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;IconButton
  onClick={() =&gt; handleTicketingModal(item)}
  tooltip="Generate Support Ticket"
&gt;
  &lt;TicketIcon /&gt;
&lt;/IconButton&gt;
</pre>

2. **Extend Class** (Primary button)
<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;Button
  variant="contained"
  onClick={() =&gt; handleExtendClass(item.duration, true)}
&gt;
  Extend Class
&lt;/Button&gt;
</pre>

3. **Join Now** (Link button)
<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;Button
  variant="outlined"
  onClick={() =&gt; window.open(item.meetLink, '_blank')}
&gt;
  Join Now
&lt;/Button&gt;
</pre>

**Time Formatting Logic**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const checkTimeFormat = (time: string | undefined) =&gt; {
  if (!time) return "Invalid Time";

  if (time.includes("T")) {
    // ISO format: "2025-12-05T14:30:00.000Z"
    return moment.utc(time, "YYYY-MM-DDTHH:mm:ss.SSSZ")
      .local()
      .format("hh:mm A");
  }

  // Time only format: "14:30:00"
  return moment.utc(time, "HH:mm:ss")
    .local()
    .format("hh:mm A");
};
</pre>

**Reference**: `src/screens/admin-ongoingClasses/components/card/card.tsx:26-300`

---

## Modal Features

### 1. Extend Class Modal

**Component**: `ExtendClassModal`

**Location**: `src/components/ui/teacher-admin-ongoingClasses-extendClassModal/extendClassModal/extendClassModal.tsx`

**Purpose**: Allow users to extend ongoing class duration

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  heading: string;              // "Extend Class By"
  subHeading: string;           // "Select the duration to extend the class"
  modalOpen: boolean;           // Controls visibility
  duration: number | null;      // Current class duration
  handleClose: () =&gt; void;      // Close callback
  handleAdd: (duration: number) =&gt; void;  // Submit callback
  success: boolean;             // Auto-close on success
  loading: boolean;             // Button loading state
}
</pre>

**UI Elements**:

- **Current Duration Display**: Shows original class duration
- **Extension Dropdown**: Preset options (+30, +60, +120 minutes)
- **New Total Duration**: Calculated and displayed
- **Cancel Button**: Closes modal without changes
- **Extend Button**: Submits extension (disabled during loading)

**User Flow**:

1. Modal opens with current duration pre-filled
2. User selects extension amount from dropdown
3. New total is calculated and shown
4. User clicks "Extend" button
5. Loading state shown during API call
6. On success: Modal auto-closes, toast shown
7. On error: Error toast, modal stays open

**Usage Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;ExtendClassModal
  heading="Extend Class By"
  modalOpen={extendClassModalOpen.modalOpen}
  duration={extendClassModalOpen.duration}
  subHeading="Select the duration to extend the class"
  handleClose={() =&gt; setExtendClassModalOpen({
    duration: null,
    modalOpen: false,
    classItem: null
  })}
  handleAdd={(extendedDuration: number) =&gt; {
    handleExtendClass.mutate({
      class_schedule_id: extendClassModalOpen.classItem?.id || null,
      duration: extendedDuration || 0,
      isReschedual: extendClassModalOpen.classItem?.hasOwnProperty(
        "enrollment_reschedual"
      ),
    });
  }}
  success={handleExtendClass.isSuccess}
  loading={handleExtendClass.isPending}
/&gt;
</pre>

**Reference**: `src/components/ui/teacher-admin-ongoingClasses-extendClassModal/extendClassModal/extendClassModal.tsx:20-150`

---

### 2. Ticketing Modal

**Component**: `TicketingModal`

**Location**: `src/components/ui/superAdmin/admin-ongoingclasses/ticketing-modal/ticketing-modal.tsx`

**Purpose**: Generate support tickets for ongoing class issues

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  modalOpen: {
    open: boolean;
    item: ClassScheduleWithStudents | null;
  };
  heading: string;              // "Generate Ticket"
  subHeading: string;           // "Generate Ticket"
  handleCloseModal: () =&gt; void; // Close callback
  handleGenerate: (payload: CreateTicket_Payload_Type) =&gt; void;
  loading: boolean;             // Loading state
  success: boolean;             // Auto-close on success
}
</pre>

**Form Fields**:

| Field      | Type          | Required    | Visibility       | Description             |
| ---------- | ------------- | ----------- | ---------------- | ----------------------- |
| Role       | Dropdown      | Conditional | Admin roles only | "Teacher" or "Student"  |
| Recipients | Auto-filled   | Yes         | All              | Based on role selection |
| Subject    | Text/Dropdown | Yes         | All              | Ticket subject          |
| Priority   | Dropdown      | Yes         | All              | "Low", "Medium", "High" |

**Recipient Auto-Selection Logic**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// For superAdmin, admin, counsellor, hr:
if (selectedRole === "Teacher") {
  sendToIds = [item.enrollment.tutor.id];
} else if (selectedRole === "Student") {
  sendToIds = item.enrollment.studentsGroups.map(s =&gt; s.id);
}

// For teacher:
sendToIds = item.enrollment.studentsGroups.map(s =&gt; s.id);

// For student:
sendToIds = [item.enrollment.tutor.id];
</pre>

**Form Validation**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const validateForm = () =&gt; {
  if (sendToIds.length === 0) {
    toast.error("Please select recipients");
    return false;
  }
  if (!subject || subject.trim() === "") {
    toast.error("Please enter a subject");
    return false;
  }
  if (!priority) {
    toast.error("Please select a priority");
    return false;
  }
  return true;
};
</pre>

**Submission Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  subject: string;              // e.g., "Audio issues in class"
  sendToIds: string[];          // ["42", "43"]
  priority: string;             // "High"
  created_by_user_id: number;   // Current user ID
  enrollment_id: number;        // From class item
  status: "Open";               // Default status
}
</pre>

**User Flow**:

1. Modal opens with class context
2. Role selection (if admin) determines recipients
3. Recipients auto-populated
4. User enters subject and selects priority
5. Validation runs on submit
6. API request sent
7. On success: Toast shown, modal closes
8. On error: Error toast, modal stays open

**Reference**: `src/components/ui/superAdmin/admin-ongoingclasses/ticketing-modal/ticketing-modal.tsx:55-200`

---

## Integration with Other Modules

### With Class Schedules Module

**Relationship**: Class schedules are the **source** for ongoing classes

**Data Flow**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Class Schedule Created
    ↓
Backend scheduler monitors scheduled classes
    ↓
40 mins before start time
    ↓
Backend creates ongoing class record
    ↓
Frontend displays in ongoing classes list
</pre>

**Data Inherited**:

- Teacher ID and info
- Student IDs and info
- Subject, board, grade, curriculum
- Duration
- Meet link
- Scheduled start time

**Lifecycle Connection**:

- Schedule: Permanent record
- Ongoing Class: Temporary (40 mins before to 50 mins after)
- Purpose: Schedule plans, ongoing monitors

**See**: [Class Schedules Module](../class-schedules/CLASS_SCHEDULES.md)

---

### With Sessions Module

**Relationship**: Ongoing classes transition to **sessions** after completion

**Synchronized Timing**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
T + 50 mins → Ongoing class REMOVED + Session record CREATED
</pre>

**Data Flow**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Class Schedule → Ongoing Class → Session Record
(Planning)       (Monitoring)     (History)
</pre>

**Purpose Distinction**:

| Aspect         | Ongoing Class               | Session                    |
| -------------- | --------------------------- | -------------------------- |
| **When**       | During class (T-40 to T+50) | After class (T+50 onwards) |
| **Purpose**    | Monitor live classes        | Record completed classes   |
| **Data**       | Real-time info              | Historical data            |
| **Actions**    | Extend, join, ticket        | View, edit (admin)         |
| **Visibility** | Temporary (disappears)      | Permanent (history)        |
| **Module**     | Activities                  | Sessions                   |

**No Overlap**: A class cannot be both ongoing and have a session simultaneously

**Timing Coordination**:

- Ongoing removed at: Start time + 50 mins
- Session created at: Start time + 50 mins
- Ensures smooth transition without gaps

**See**: [Sessions Module](../sessions/SESSIONS.md)

---

### With Enrollments Module

**Relationship**: Each ongoing class is linked to an **enrollment**

**Data Usage**:

- Enrollment ID displayed on card
- Priority level (affects display)
- Student group information
- Teacher assignment
- Subject details

**Balance Status Integration**:

- Balance status comes from enrollment → students → user
- Tracked per student in the enrollment
- Displayed on ongoing class card
- Helps identify payment issues

**See**: [Enrollments Module](../enrollments/ENROLLMENTS.md)

---

## File References

### Core Files

| File                                                                                                    | Purpose                     | Lines |
| ------------------------------------------------------------------------------------------------------- | --------------------------- | ----- |
| `src/app/(protected)/[role]/activities/page.tsx`                                                        | Activities page with tabs   | 100+  |
| `src/screens/admin-ongoingClasses/admin-ongoingClasses.tsx`                                             | Main ongoing classes screen | 230+  |
| `src/screens/admin-ongoingClasses/components/card/card.tsx`                                             | Individual class card       | 300+  |
| `src/components/ui/teacher-admin-ongoingClasses-extendClassModal/extendClassModal/extendClassModal.tsx` | Extend class modal          | 150+  |
| `src/components/ui/superAdmin/admin-ongoingclasses/ticketing-modal/ticketing-modal.tsx`                 | Ticketing modal             | 200+  |

### Services

| File                                                                    | Purpose               |
| ----------------------------------------------------------------------- | --------------------- |
| `src/services/dashboard/superAdmin/class-schedule/getOngoingClasses.ts` | Fetch ongoing classes |
| `src/services/dashboard/superAdmin/class-schedule/extend-class.ts`      | Extend class duration |
| `src/services/dashboard/superAdmin/tickets/tickets.ts`                  | Ticket operations     |

### API

| File                            | Purpose                   |
| ------------------------------- | ------------------------- |
| `src/api/class-schedule.api.ts` | API endpoint URL builders |
| `src/api/ticket.api.ts`         | Ticket API builders       |

### Types

| File                                                  | Purpose               |
| ----------------------------------------------------- | --------------------- |
| `src/types/class-schedule/getOngoingClasses.types.ts` | Ongoing classes types |
| `src/types/extend-class/extendClassDuration.types.ts` | Extend class types    |
| `src/types/ticket/ticket.types.ts`                    | Ticket types          |

### Styling

| File                                                               | Purpose               |
| ------------------------------------------------------------------ | --------------------- |
| `src/screens/admin-ongoingClasses/admin-ongoingClasses.module.css` | Main screen styles    |
| `src/screens/admin-ongoingClasses/components/card/card.module.css` | Card component styles |

---

## Best Practices

### Performance Optimization

1. **React Query Caching**:

   - Ongoing classes cached for 30 seconds
   - Reduces unnecessary API calls
   - Automatic background refetching
   - Keeps previous data during refresh

2. **Polling Optimization**:

   - 30-second interval balances freshness vs. server load
   - Window focus refetch disabled to reduce calls
   - Placeholder data prevents UI flickering

3. **Component Optimization**:
   - Memoized callbacks with `useCallback`
   - Memoized values with `useMemo`
   - Prevents unnecessary re-renders

### Error Handling

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { data, error, isLoading } = useQuery({
  queryKey: ["getOngoingClasses", token],
  queryFn: () =&gt; getOngoingClasses({}, { token }),
  onError: (error) =&gt; {
    toast.error(
      error.response?.data?.message ||
      "Failed to fetch ongoing classes"
    );
  },
});

if (isLoading) return &lt;LoadingSpinner /&gt;;
if (error) return &lt;ErrorMessage message={error.message} /&gt;;
if (!data || data.length === 0) return &lt;EmptyState /&gt;;
</pre>

## Related Documentation

- [Sessions Module](../sessions/SESSIONS.md) - Session records after class completion
- [Class Schedules Module](../class-schedules/CLASS_SCHEDULES.md) - Scheduling and calendar
- [Enrollments Module](../enrollments/ENROLLMENTS.md) - Enrollment management
- [Authentication Module](../authentication-module/AUTHENTICATION.md) - User authentication and access

---
