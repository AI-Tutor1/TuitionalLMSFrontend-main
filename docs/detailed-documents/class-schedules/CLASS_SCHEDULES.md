# Class Schedules Module Documentation

## Overview

The Class Schedules module provides a comprehensive system for viewing, managing, and canceling class schedules across the LMS platform. It offers multiple viewing modes (Calendar, List, and Time views) and allows role-based access for managing weekly class slots.

### Roles with Access

- **superAdmin**: Full access with delete permissions, view all filters
- **admin**: Full access with limited permissions
- **teacher**: View and cancel their own schedules (30 min advance notice)
- **student**: View-only access (6 hours advance notice for cancellation)
- **counsellor/hr**: Read-only access

### Core Features

- Three view modes: Calendar View, List View, Time View
- Filter by student, teacher, subject, and day of week
- UTC to local timezone conversion
- Schedule deletion (permanent, weekly, or single day)
- Real-time schedule updates via React Query
- Responsive design for mobile and desktop
- Color-coded slot display
- "View more" pagination for long lists

---

## Architecture

### Directory Structure

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
src/
├── screens/
│   └── class-schedule/
│       ├── class-schedule.tsx              # Main screen component
│       └── class-schedule.module.css       # Screen styles
├── components/
│   └── ui/
│       └── superAdmin/
│           └── class-schedule/
│               └── tabs-view/
│                   ├── calender-view/      # Weekly calendar view
│                   │   ├── calender-view.tsx
│                   │   └── calender-view.module.css
│                   ├── list-view/          # List-based view
│                   │   ├── list-view.tsx
│                   │   └── list-view.module.css
│                   └── time-view/          # Detailed time-based view
│                       ├── time-view.tsx
│                       ├── time-view.module.css
│                       └── components/
│                           ├── child-header/
│                           └── slots/
├── components/ui/superAdmin/enrollment-details/
│   └── deleteSlots-modal/                  # Shared delete modal
│       ├── deleteSlots-modal.tsx
│       └── deleteSlots-modal.module.css
├── services/
│   └── dashboard/
│       └── superAdmin/
│           └── class-schedule/
│               ├── class-schedule-groupedByDay/
│               │   ├── clas-schedule-groupedByDay.ts
│               │   └── clas-schedule-groupedByDay.types.ts
│               └── class-schedule-day0fWeek/
│                   ├── class-schedule-day0fWeek.ts
│                   └── class-schedule-day0fWeek.types.ts
├── api/
│   └── class-schedule.api.ts               # API URL builders
└── types/
    └── class-schedule/
        └── getOngoingClasses.types.ts      # Type definitions
</pre>

### State Management

**Local State (React useState)**:

- `selectedTeacher`: Selected teacher filter (string)
- `selectedStudent`: Selected student filter (string)
- `selectedSubject`: Selected subject filter (string)
- `day`: Selected day for Time View (string)
- `activeTab`: Current tab ("Calender View" or "List View")
- `deleteSlotModal`: Modal state for deletion confirmation

**React Query State**:

- `class-schedules-grouped-by-day`: All schedules grouped by day
- `class-schedules-dayOfWeek`: Schedules for specific day
- Automatic cache invalidation on deletion
- Refetch on filter changes

**Redux State (from store)**:

- `user.token`: Authentication token
- `user.roleId`: Current user role ID
- `resources.subjects`: Available subjects
- `usersByGroup.teachers`: Available teachers
- `usersByGroup.students`: Available students

### Component Hierarchy

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
ClassSchedule (Main Screen)
├── Header with role-based title
├── Filters Section
│   ├── StudentDropdown
│   ├── TeacherDropdown
│   ├── SubjectDropdown
│   └── DayDropdown
├── Tabs (Calender View / List View)
└── Conditional Rendering:
    ├── TimeView (when day is selected)
    │   ├── ChildHeader (time range header)
    │   └── Slots (individual slot cards)
    ├── CalenderView (default calendar tab)
    │   └── Day columns with slot cards
    ├── ListView (list tab)
    │   └── Day sections with slot cards
    └── DeleteSlotsModal (shared across all views)
</pre>

---

## API Endpoints

### 1. Get All Class Schedules (Grouped by Day)

Fetches all class schedules grouped by day of the week for the current week.

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Endpoint: GET /api/class-schedules/grouped-by-day

Query Parameters:
- student_id?: number | null     // Filter by student
- tutor_id?: number | null        // Filter by teacher
- childrens?: string              // Include child records flag

Request Example:
GET /api/class-schedules/grouped-by-day?student_id=123&childrens=true

Response Type: Class_Schedule_Type
{
  "Monday": [
    {
      "id": 1,
      "day_of_week": "MON",
      "start_time": "09:00:00",
      "session_duration": 60,
      "status": true,
      "slots": "morning",
      "is_booked": true,
      "tutor_id": 45,
      "tutor": {
        "name": "John Doe",
        "id": 45,
        "email": "john@example.com",
        "profileImageUrl": "https://...",
        "country_code": "+1"
      },
      "createdAt": "2025-01-15T08:00:00Z",
      "updatedAt": "2025-01-20T10:30:00Z"
    }
  ],
  "Tuesday": [...],
  // ... other days
}
</pre>

**Service Function:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// src/services/dashboard/superAdmin/class-schedule/class-schedule-groupedByDay/clas-schedule-groupedByDay.ts
export const getAllClassSchedules = (
  options: {
    student_id?: number | null;
    tutor_id?: number | null;
    childrens?: string;
  },
  config: configDataType
) => AxiosGet&lt;Class_Schedule_Type&gt;(getAllClassSchedulesApi(options), config);
</pre>

### 2. Get Class Schedules by Day of Week

Fetches all class schedules for a specific day of the week.

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Endpoint: GET /api/schedule/day/{dayOfWeek}

Path Parameters:
- dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN"

Request Example:
GET /api/schedule/day/MON

Response Type: ClassSchedule_Day_Of_Week (Array)
[
  {
    "id": 1,
    "status": true,
    "enrollment": {
      "id": 10,
      "status": 1,
      "on_break": 0,
      "hourly_rate": 50,
      "tutor_hourly_rate": 40,
      "group_id": "GRP-12345",
      "tutor_id": 45,
      "tutor": {
        "name": "John Doe",
        "id": 45,
        "email": "john@example.com",
        "profileImageUrl": "https://...",
        "country_code": "+1"
      },
      "students": [
        {
          "name": "Jane Smith",
          "id": 123,
          "email": "jane@example.com",
          "profileImageUrl": "https://...",
          "country_code": "+1"
        }
      ]
    },
    "teacherSchedule": {
      "id": 1,
      "day_of_week": "MON",
      "start_time": "09:00:00",
      "session_duration": 60,
      "status": true,
      "slots": "morning",
      "is_booked": true
    }
  }
]
</pre>

**Service Function:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// src/services/dashboard/superAdmin/class-schedule/class-schedule-day0fWeek/class-schedule-day0fWeek.ts
export const getAllClassSchedulesDAYOfWeek = (
  options: any, // Day abbreviation: "MON", "TUE", etc.
  config: configDataType
) => AxiosGet&lt;ClassSchedule_Day_Of_Week&gt;(
  getAllClassSchedulesDAYOfWeekApi(options),
  config
);
</pre>

### 3. Get Ongoing Classes

Fetches ongoing class schedules filtered by student or teacher.

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Endpoint: GET /api/classSchedule/getOngoingClasses

Query Parameters:
- student_id?: string    // Filter by student ID
- tutor_id?: string      // Filter by teacher ID

Request Example:
GET /api/classSchedule/getOngoingClasses?tutor_id=45

Response Type: OngoingClasses_Response_Type (Array of ClassScheduleWithStudents)
[
  {
    "id": 1,
    "status": true,
    "enrollment_id": 10,
    "teacher_schedule_id": 100,
    "createdAt": "2025-01-15T08:00:00Z",
    "updatedAt": "2025-01-20T10:30:00Z",
    "enrollment": {
      "id": 10,
      "tutor_id": 45,
      "status": 1,
      "on_break": false,
      "subject_id": 5,
      "board_id": 2,
      "curriculum_id": 3,
      "grade_id": 8,
      "hourly_rate": 50,
      "request_rate": 55,
      "group_id": "GRP-12345",
      "tutor_hourly_rate": 40,
      "subject": {
        "id": 5,
        "name": "Mathematics"
      },
      "tutor": {
        "name": "John Doe",
        "id": 45,
        "email": "john@example.com",
        "profileImageUrl": "https://...",
        "country_code": "+1"
      },
      "studentsGroups": [
        {
          "id": 1,
          "group_id": "GRP-12345",
          "student_id": 123,
          "createdAt": "2025-01-10T00:00:00Z",
          "updatedAt": "2025-01-10T00:00:00Z",
          "user": {
            "name": "Jane Smith",
            "id": 123,
            "email": "jane@example.com",
            "profileImageUrl": "https://...",
            "country_code": "+1"
          }
        }
      ]
    },
    "teacherSchedule": {
      "id": 100,
      "tutor_id": 45,
      "day_of_week": "MON",
      "start_time": "09:00:00",
      "session_duration": 60,
      "status": true,
      "slots": "morning",
      "is_booked": true,
      "createdAt": "2025-01-05T00:00:00Z",
      "updatedAt": "2025-01-20T10:30:00Z",
      "deletedAt": null,
      "enrollment_id": 10
    }
  }
]
</pre>

**API URL Builder:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// src/api/class-schedule.api.ts
export const getOngoingClassesApi = (options: OngoingClasses_Params_Type) => {
  const params = new URLSearchParams();
  if (options.student_id !== undefined && typeof options.student_id === "string" && options.student_id !== "") {
    params.append("student_id", options.student_id);
  }
  if (options.tutor_id !== undefined && typeof options.tutor_id === "string" && options.tutor_id !== "") {
    params.append("tutor_id", options.tutor_id);
  }
  return `${BASE_URL}/api/classSchedule/getOngoingClasses${
    params.toString() ? "?" + params.toString() : ""
  }`;
};
</pre>

### 4. Schedule Instant Class

Schedules an instant/immediate class session.

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Endpoint: POST /api/class-schedules/schedule-instant

Request Body:
{
  "enrollment_id": 10,
  "duration": 60,
  "user_id": 45
}

Response:
{
  "message": "Instant class scheduled successfully",
  "classSchedule": {
    "id": 150,
    "enrollment_id": 10,
    "teacher_schedule_id": 100,
    "status": true,
    "createdAt": "2025-01-20T14:30:00Z"
  }
}
</pre>

**API URL Builder:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// src/api/class-schedule.api.ts
export const classScheduleInstantApi = () =>
  `${BASE_URL}/api/class-schedules/schedule-instant`;
</pre>

### 5. Extend Class

Extends the duration of an ongoing class.

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Endpoint: POST /api/class-schedule/extend

Request Body:
{
  "class_schedule_id": 1,
  "additional_duration": 30,
  "user_id": 45
}

Response:
{
  "message": "Class extended successfully",
  "classSchedule": {
    "id": 1,
    "session_duration": 90,
    "updatedAt": "2025-01-20T14:45:00Z"
  }
}
</pre>

**API URL Builder:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// src/api/class-schedule.api.ts
export const extendClassApi = () => `${BASE_URL}/api/class-schedule/extend`;
</pre>

### 6. Delete Class Schedule (Permanent)

Permanently removes a class schedule slot.

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Endpoint: DELETE /api/classSchedule

Request Body:
{
  "ids": [1, 2, 3]    // Array of class schedule IDs to delete
}

Response:
{
  "message": "Class schedules deleted successfully",
  "deletedCount": 3
}
</pre>

**Service Function:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// This uses the service from enrollment-details module
// src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.ts
export const deleteClassSchedule = (payload: any, config: configDataType) =>
  AxiosDelete(deleteClassScheduleApi(), payload, config);
</pre>

### 7. Cancel Class Schedule for Week

Cancels a class schedule for a specific week or day.

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Endpoint: DELETE /api/enrollment/class-schedule

Request Body:
{
  "user_id": 45,
  "enrollment_id": 10,
  "class_status": "CANCELLED",
  "class_schedule_id": 1,
  "dateTime": "2025-01-20T09:00:00Z"  // UTC format
}

Response:
{
  "message": "Class schedule cancelled successfully for the specified date",
  "cancellationRecord": {
    "id": 25,
    "enrollment_id": 10,
    "class_schedule_id": 1,
    "status": "CANCELLED",
    "dateTime": "2025-01-20T09:00:00Z",
    "createdAt": "2025-01-20T14:50:00Z"
  }
}
</pre>

**Service Function:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.ts
export const cancelClassScheduleForWeek_foraddExtraClassSchedule = (
  payload: any,
  config: configDataType
) =>
  AxiosDelete(
    cancelClassScheduleForWeek_foraddExtraClassScheduleApi(),
    payload,
    config
  );
</pre>

---

## View Components

### 1. Calendar View (Calender View)

**Location**: `src/components/ui/superAdmin/class-schedule/tabs-view/calender-view/calender-view.tsx`

The Calendar View displays class schedules in a weekly grid format, showing all days of the current week with their respective slots.

**Features:**

- Weekly grid layout with color-coded slots
- Today's date highlighting (blue background)
- Display up to 4 slots per day for superAdmin (with "view more" option)
- Display all slots for teacher/student roles
- Slot click opens delete modal (role-based restrictions)
- UTC to local timezone conversion
- Subject name, time, duration display
- Teacher and student profile images
- Responsive design

**Props Interface:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
interface ClassScheduleViewProps {
  classSchedules: ClassSchedule[];   // Array of schedules grouped by day
  handleViewMore?: (day: string) => void;  // Navigate to Time View
  deleteSlotModal?: any;              // Function to open delete modal
  role?: string;                      // User role for conditional rendering
}

interface ClassSchedule {
  day: string;        // "Monday", "Tuesday", etc.
  date: string;       // "2025-01-20"
  slots: Slot[];      // Array of slot items
}

interface Slot {
  id: string;
  teacherSchedule: {
    start_time: string;         // "09:00:00" (UTC)
    session_duration: number;   // Minutes
  };
  enrollment: {
    id: string;
    subject: {
      name: string;
    };
    tutor: {
      name: string;
      profileImageUrl: string;
    };
    studentsGroups: {
      user: {
        name: string;
        profileImageUrl: string;
      };
    }[];
  };
}
</pre>

**Key Functions:**

- `handleDeleteSlot`: Opens delete modal with slot details (converted to local time)
- `handleOnClick`: Navigates to Time View for selected day
- Moment.js for timezone conversion: `moment.utc(time, "HH:mm:ss").local()`

**Role-Based Behavior:**

- **superAdmin**: Can delete any slot immediately
- **teacher**: Can delete slots with 30-minute advance notice for today
- **student**: View-only (cannot delete)

**Slot Colors:**

- Rotates between 3 colors: `#dafff0`, `#b8e5ff`, `#d6cfff`

### 2. List View

**Location**: `src/components/ui/superAdmin/class-schedule/tabs-view/list-view/list-view.tsx`

The List View displays class schedules in a vertical list format, grouped by days.

**Features:**

- Vertical list layout by day
- All slots displayed for each day
- Color-coded slots (same as Calendar View)
- Click to delete with role-based restrictions
- UTC to local timezone conversion
- Subject name, time, duration display
- Teacher and student profile images
- Shows "No slots added yet" for empty days
- Responsive design

**Props Interface:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
interface ListScheduleViewProps {
  classSchedules: ListSchedule[];  // Array of schedules grouped by day
  deleteSlotModal?: any;           // Function to open delete modal
  role?: string;                   // User role for conditional rendering
}

interface ListSchedule {
  day: string;        // "Monday", "Tuesday", etc.
  date: string;       // "2025-01-20"
  slots: Slot[];      // Same structure as Calendar View
  deleteSlotModal?: any;
}
</pre>

**Key Functions:**

- `handleDeleteSlot`: Opens delete modal with slot details (converted to local time)
- Moment.js for time conversion and calculations

**Role-Based Behavior:**

- **teacher/student**: Can only cancel slots with 6 hours advance notice for today
- **superAdmin/admin**: Can delete any slot immediately
- **student**: View-only in Calendar View, but can cancel in List View

### 3. Time View

**Location**: `src/components/ui/superAdmin/class-schedule/tabs-view/time-view/time-view.tsx`

The Time View displays detailed schedules for a specific day, grouped by time slots.

**Features:**

- Displays all schedules for a selected day
- Groups schedules by start time
- Shows day name and formatted date
- Back button to return to main view
- Real-time data fetching for selected day
- Filters applied (subject, student, teacher)
- Loading and error states
- Child header component for time ranges
- Individual slot cards with delete functionality

**Props Interface:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
interface TimeViewProps {
  day: string;              // "Monday", "Tuesday", etc.
  subject: Subject | null;  // Selected subject filter
  student: Student | null;  // Selected student filter
  teacher: Teacher | null;  // Selected teacher filter
  handleBack?: () => void;  // Function to go back
  deleteSlotModal?: (item: any) => void;  // Function to open delete modal
}

interface Subject {
  name: string;
}

interface Student {
  name: string;
}

interface Teacher {
  name: string;
}
</pre>

**Key Components:**

- **ChildHeader**: Displays time range (start time to end time)
- **Slots**: Individual slot cards with enrollment details

**React Query Integration:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { data, isLoading } = useQuery({
  queryKey: ["class-schedules-dayOfWeek", day],
  queryFn: () => getAllClassSchedulesDAYOfWeek(dayAbbreviation, { token }),
});
</pre>

**Day Abbreviation Mapping:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const DAY_ABBREVIATIONS: Record&lt;string, string&gt; = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN",
};
</pre>

**Data Processing:**

1. Filter data by subject, student, and teacher
2. Sort by start time
3. Group by start time
4. Return array of grouped schedules

---

## Modal Components

### Delete Slots Modal

**Location**: `src/components/ui/superAdmin/enrollment-details/deleteSlots-modal/deleteSlots-modal.tsx`

**Note**: This modal is shared between the Enrollment Details module and Class Schedules module.

A comprehensive modal for deleting class schedule slots with three deletion options.

**Features:**

- Three deletion modes:
  1. **Remove permanent**: Deletes the slot permanently from all future occurrences
  2. **Just for this week**: Cancels the slot only for the current week
  3. **Delete for particular day**: Cancels the slot for a specific future day
- Date picker for specific day deletion (next 4 occurrences)
- Confirmation and cancel buttons
- Loading state during API call
- Auto-reset on close

**Props Interface:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
interface BasicModalProps {
  loading: boolean;                // Loading state for API call
  modalOpen: any;                  // Modal state object
  handleDelete?: any;              // Function for permanent deletion
  dayDeletion?: any;               // Function for specific day deletion
  weekDeletion?: any;              // Function for week deletion
  handleClose: () => void;         // Function to close modal
  heading: string;                 // Day name (e.g., "Monday")
  subHeading?: string;             // Deletion confirmation message
  modalArr?: DropdownItem[];       // Dropdown options (unused)
  inlineDropDownBox?: CSSProperties | undefined;  // Dropdown styles
}
</pre>

**Modal State Object:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  open: boolean;              // Modal visibility
  day: string;                // Day name (e.g., "Monday")
  date?: string;              // Date string (optional)
  startTime: string;          // "09:00AM" (local time)
  endTime: string;            // "10:00AM" (local time)
  ids: number[];              // Array of class schedule IDs
  enrollment_id: number;      // Associated enrollment ID
}
</pre>

**Deletion Functions:**

1. **Permanent Deletion** (`parmanentDeletion`):

   - Payload: `{ ids: [1, 2, 3] }`
   - Deletes all future occurrences of the schedule

2. **Week Deletion** (`deleteForWeek`):
   - Calculates the date for the current week's occurrence
   - Payload includes:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  user_id: number | null,
  enrollment_id: number | null,
  class_status: "CANCELLED",
  class_schedule_id: number,
  dateTime: string  // UTC format: "2025-01-20T09:00:00Z"
}
</pre>

3. **Particular Day Deletion** (`deleteForParticularDay`):
   - User selects from dropdown of next 4 occurrences
   - Payload includes same structure as week deletion
   - Converts selected date to UTC format

**Next 4 Occurrences Logic:**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Calculates next 4 occurrences of the selected day
// Example: If today is Jan 18 (Thursday) and selected day is Monday:
// Returns: ["Monday 20-Jan-2025", "Monday 27-Jan-2025", "Monday 03-Feb-2025", "Monday 10-Feb-2025"]
const getNextFourWeekdays = useMemo(() => {
  const inputDayIndex = daysOfWeek.indexOf(heading?.toLowerCase());
  const today = moment();
  const currentDayIndex = today.day();

  // Calculate starting point
  const daysUntilThisWeek = (inputDayIndex - currentDayIndex + 7) % 7;
  const currentWeekInputDay = today.clone().add(daysUntilThisWeek, "days");

  // Start from next week if current week's day has passed
  const startDate = currentWeekInputDay.isAfter(today)
    ? currentWeekInputDay
    : currentWeekInputDay.clone().add(7, "days");

  // Generate next 4 occurrences
  const result = [];
  for (let i = 0; i &lt; 4; i++) {
    const nextDay = startDate.clone().add(i * 7, "days");
    result.push(nextDay.format("dddd DD-MMM-YYYY"));
  }

  return result;
}, [heading]);
</pre>

**Radio Button Options:**

- "Remove permanent"
- "Just for this week"
- "Delete for particular day"

**Dropdown Display:**

- Only visible when "Delete for particular day" is selected
- Shows next 4 occurrences of the selected day
- Format: "Monday 20-Jan-2025"

---

## Class-Schedules Flow Chart

Flowchart Link: https://tinyurl.com/4hs2hpvs

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
flowchart TD
    Start([User navigates to Class Schedules page]) --> LoadPage[Load Class Schedule Screen]
    LoadPage --> FetchSchedules[Fetch all schedules grouped by day
    GET /api/class-schedules/grouped-by-day]

    FetchSchedules --> TransformData[Transform Schedule Data:
    1. Convert UTC times to local
    2. Group by day of week
    3. Sort by start time
    4. Reorder to start from today]

    TransformData --> DisplayFilters[Display Filter Options:
    - Student dropdown
    - Teacher dropdown
    - Subject dropdown
    - Day dropdown]

    DisplayFilters --> DisplayTabs[Display View Tabs:
    - Calendar View tab
    - List View tab]

    DisplayTabs --> CheckView{Which view is active?}

    CheckView -->|Calendar View| CalendarView[Display Calendar View:
    - Weekly grid layout
    - Show up to 4 slots per day
    - Display today highlight
    - View more option]

    CheckView -->|List View| ListView[Display List View:
    - Vertical list by day
    - Show all slots
    - Color-coded cards]

    CalendarView --> UserAction1{User Action?}
    ListView --> UserAction2{User Action?}

    UserAction1 -->|Apply Filter| ApplyFilter[Update filter state:
    - selectedStudent
    - selectedTeacher
    - selectedSubject]

    UserAction2 -->|Apply Filter| ApplyFilter

    ApplyFilter --> FilterSchedules[Filter displayed schedules based on selected criteria]
    FilterSchedules --> RefreshView[Refresh current view]
    RefreshView --> CheckView

    UserAction1 -->|Click "View More"| SelectDay[Set selected day state]
    UserAction1 -->|Select Day Filter| SelectDay
    UserAction2 -->|Select Day Filter| SelectDay

    SelectDay --> TimeView[Display Time View:
    1. Fetch schedules for specific day
    GET /api/schedule/day/{DAY}
    2. Group by start time
    3. Display with ChildHeader]

    TimeView --> TimeViewActions{User Action?}

    TimeViewActions -->|Click Back| ClearDay[Clear day selection]
    ClearDay --> CheckView

    TimeViewActions -->|Click Slot| CheckRole1{Check User Role}
    UserAction1 -->|Click Slot| CheckRole2{Check User Role}
    UserAction2 -->|Click Slot| CheckRole2

    CheckRole1 -->|superAdmin/admin| OpenModal[Open Delete Slots Modal]
    CheckRole2 -->|superAdmin/admin| OpenModal

    CheckRole1 -->|teacher| CheckTime1{Is slot today?}
    CheckRole2 -->|teacher| CheckTime1

    CheckTime1 -->|Yes| ValidateTime1{Time > 30 min from now?}
    CheckTime1 -->|No| OpenModal

    ValidateTime1 -->|Yes| OpenModal
    ValidateTime1 -->|No| ShowError1[Show error toast:
    "Cancellation is only allowed 30 minutes before scheduled time"]

    CheckRole1 -->|student| CheckTime2{Is slot today?}
    CheckRole2 -->|student| CheckTime2

    CheckTime2 -->|Yes| ValidateTime2{Time > 6 hours from now?}
    CheckTime2 -->|No| OpenModal

    ValidateTime2 -->|Yes| OpenModal
    ValidateTime2 -->|No| ShowError2[Show error toast:
    "Cancellation is only allowed 6 hours before scheduled time"]

    ShowError1 --> RefreshView
    ShowError2 --> RefreshView

    OpenModal --> DisplayModal[Display Delete Slots Modal:
    - Show day and time
    - Radio button options
    - Conditional dropdown]

    DisplayModal --> ModalAction{User Action?}

    ModalAction -->|Cancel| CloseModal[Close modal]
    CloseModal --> RefreshView

    ModalAction -->|Confirm| CheckDeletionType{Deletion Type?}

    CheckDeletionType -->|Remove permanent| PermanentDelete[DELETE /api/classSchedule
    Payload: { ids: [1, 2, 3] }]

    CheckDeletionType -->|Just for this week| WeekDelete[Calculate current week date
    DELETE /api/enrollment/class-schedule
    Payload: {
      enrollment_id,
      class_schedule_id,
      class_status: 'CANCELLED',
      dateTime: UTC
    }]

    CheckDeletionType -->|Delete for particular day| DayDelete[Use selected day from dropdown
    DELETE /api/enrollment/class-schedule
    Payload: {
      enrollment_id,
      class_schedule_id,
      class_status: 'CANCELLED',
      dateTime: UTC
    }]

    PermanentDelete --> CheckSuccess1{API Success?}
    WeekDelete --> CheckSuccess1
    DayDelete --> CheckSuccess1

    CheckSuccess1 -->|Yes| ShowSuccess[Show success toast
    Invalidate React Query cache:
    - class-schedules-grouped-by-day
    - class-schedules-dayOfWeek]

    CheckSuccess1 -->|No| ShowErrorMsg[Show error toast]

    ShowSuccess --> CloseModal
    ShowErrorMsg --> DisplayModal

    UserAction1 -->|Switch Tab| SwitchTab[Change activeTab state]
    UserAction2 -->|Switch Tab| SwitchTab

    SwitchTab --> CheckView

    TimeViewActions -->|Apply Filter| ApplyTimeFilter[Filter Time View data by subject/student/teacher]
    ApplyTimeFilter --> TimeView

    style Start fill:#e1f5ff
    style LoadPage fill:#fff4e1
    style CalendarView fill:#f0f8ff
    style ListView fill:#f0f8ff
    style TimeView fill:#f0f8ff
    style OpenModal fill:#ffe1f5
    style PermanentDelete fill:#ffe1e1
    style WeekDelete fill:#ffe1e1
    style DayDelete fill:#ffe1e1
    style ShowSuccess fill:#e1ffe1
    style ShowErrorMsg fill:#ffe1e1
    style ShowError1 fill:#ffe1e1
    style ShowError2 fill:#ffe1e1
</pre>

---

## Schedule Transformation Logic

The Class Schedules module implements sophisticated schedule transformation to convert UTC times to local timezone and reorder days to start from today.

### Transformation Process

**Location**: `src/screens/class-schedule/class-schedule.tsx` (lines 80-149)

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const refractorSchedule = useMemo(() => {
  if (!data) return [];

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Step 1: Get current week's dates
  const today = moment();
  const startOfWeek = moment().startOf("week"); // Sunday
  const datesForWeek = dayNames.map((_, index) =>
    startOfWeek.clone().add(index, "days").format("YYYY-MM-DD")
  );

  // Step 2: Transform each day's schedules
  const transformed = dayNames.map((day, index) => {
    const dayKey = day.toUpperCase().slice(0, 3); // "MON", "TUE", etc.
    const daySchedules = data[dayKey] || [];

    // Step 3: Sort slots by start time (after converting to local time)
    const sortedSlots = [...daySchedules].sort((a, b) => {
      const localTimeA = moment
        .utc(a?.start_time, "HH:mm:ss")
        .local()
        .format("HH:mm:ss");
      const localTimeB = moment
        .utc(b?.start_time, "HH:mm:ss")
        .local()
        .format("HH:mm:ss");
      return localTimeA.localeCompare(localTimeB);
    });

    return {
      day: day,
      date: datesForWeek[index],
      slots: sortedSlots,
    };
  });

  // Step 4: Reorder to start from today
  const todayIndex = today.day(); // 0 = Sunday, 1 = Monday, etc.
  const reordered = [
    ...transformed.slice(todayIndex),
    ...transformed.slice(0, todayIndex),
  ];

  return reordered;
}, [data, datesForWeek, today]);
</pre>

### Key Transformations

1. **UTC to Local Time Conversion**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const localTime = moment.utc(startTime, "HH:mm:ss").local();
</pre>

- API returns times in UTC format: "09:00:00"
- Converts to user's local timezone
- Used for display and sorting

2. **Day-of-Week Mapping**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const dayKey = day.toUpperCase().slice(0, 3);
// "Monday" → "MON"
// "Tuesday" → "TUE"
// etc.
</pre>

3. **Week Date Calculation**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const startOfWeek = moment().startOf("week"); // Sunday
const datesForWeek = dayNames.map((_, index) =>
  startOfWeek.clone().add(index, "days").format("YYYY-MM-DD")
);
// Returns: ["2025-01-19", "2025-01-20", "2025-01-21", ...]
</pre>

4. **Reordering to Start from Today**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const todayIndex = today.day(); // e.g., 3 (Wednesday)
const reordered = [
  ...transformed.slice(todayIndex),  // Wed, Thu, Fri, Sat
  ...transformed.slice(0, todayIndex), // Sun, Mon, Tue
];
// Result: [Wed, Thu, Fri, Sat, Sun, Mon, Tue]
</pre>

5. **Time Slot Sorting**:
   - Sorts slots within each day by start time
   - Ensures morning classes appear before afternoon classes
   - Uses local time for accurate sorting

---

## Data Types & Interfaces

### Class Schedule Types

**Location**: `src/services/dashboard/superAdmin/class-schedule/class-schedule-groupedByDay/clas-schedule-groupedByDay.types.ts`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export type ScheduleItem = {
  id: number;
  day_of_week: string;               // "MON", "TUE", etc.
  start_time: string;                // "09:00:00" (UTC)
  session_duration: number;          // Duration in minutes
  status: boolean;
  slots: string;                     // "morning", "afternoon", "evening", "night", "midnight"
  is_booked: boolean;
  tutor_id: number;
  createdAt: string;                 // ISO 8601 format
  updatedAt: string;
  tutor: Tutor;
};

export type Class_Schedule_Type = {
  [day: string]: ScheduleItem[];     // Keyed by day: "MON", "TUE", etc.
};
</pre>

### Day of Week Types

**Location**: `src/services/dashboard/superAdmin/class-schedule/class-schedule-day0fWeek/class-schedule-day0fWeek.types.ts`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export type Tutor = {
  name: string;
  id: number;
  email: string;
  profileImageUrl: string;
  country_code: string | null;
};

export type Student = {
  name: string;
  id: number;
  email: string;
  profileImageUrl: string;
  country_code: string | null;
};

export type Enrollment = {
  id: number;
  status: number;
  on_break: number;
  hourly_rate: number;
  tutor_hourly_rate: number;
  group_id: string;
  tutor_id: number;
  tutor: Tutor;
  students: Student[];
};

export type TeacherSchedule = {
  id: number;
  day_of_week: string;               // "MON", "TUE", etc.
  start_time: string;                // "09:00:00" (UTC)
  session_duration: number;          // Duration in minutes
  status: boolean;
  slots: string;                     // "morning", "afternoon", "evening", "night", "midnight"
  is_booked: boolean;
};

export type DataItem = {
  id: number;
  status: boolean;
  enrollment: Enrollment;
  teacherSchedule: TeacherSchedule;
};

export type ClassSchedule_Day_Of_Week = DataItem[];
</pre>

### Ongoing Classes Types

**Location**: `src/types/class-schedule/getOngoingClasses.types.ts`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export type OngoingClasses_Params_Type = {
  student_id?: string;
  tutor_id?: string;
};

export type StudentGroupUser = {
  name: string;
  id: number;
  email: string;
  profileImageUrl: string;
  country_code: string | null;
};

export type StudentGroup = {
  id: number;
  group_id: string;
  student_id: number;
  createdAt: string;
  updatedAt: string;
  user: StudentGroupUser;
};

export type Subject = {
  id: number;
  name: string;
};

export type Tutor = {
  name: string;
  id: number;
  email: string;
  profileImageUrl: string;
  country_code: string | null;
};

export type EnrollmentDetails = {
  id: number;
  tutor_id: number;
  status: number;
  on_break: boolean;
  subject_id: number;
  board_id: number;
  curriculum_id: number;
  grade_id: number;
  hourly_rate: number;
  request_rate: number;
  group_id: string;
  tutor_hourly_rate: number;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  enrollment_id: number | null;
  subject: Subject;
  tutor: Tutor;
  studentsGroups: StudentGroup[];
};

export type TeacherScheduleDetails = {
  id: number;
  tutor_id: number;
  day_of_week: string;
  start_time: string;                // "09:00:00" (UTC)
  session_duration: number;
  status: boolean;
  slots: string;
  is_booked: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  enrollment_id: number | null;
};

export type ClassScheduleWithStudents = {
  id: number;
  status: boolean;
  enrollment_id: number;
  teacher_schedule_id: number;
  createdAt: string;
  updatedAt: string;
  enrollment: EnrollmentDetails;
  teacherSchedule: TeacherScheduleDetails;
};

export type OngoingClasses_Response_Type = ClassScheduleWithStudents[];
</pre>

### Delete Slot Modal State Type

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
type DeleteSlotModalState = {
  open: boolean;
  day: string;                       // "Monday", "Tuesday", etc.
  date?: string;                     // "2025-01-20" (optional)
  startTime: string;                 // "09:00AM" (local time)
  endTime: string;                   // "10:00AM" (local time)
  ids: number[];                     // Array of class schedule IDs
  enrollment_id: number | null;      // Associated enrollment ID
};
</pre>

---

## Navigation

### Routes and Access

**Main Class Schedules Route**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
/[role]/class-schedule
</pre>

**Role-Based Access**:

- **superAdmin**: Full access - `/superAdmin/class-schedule`
- **admin**: Full access - `/admin/class-schedule`
- **counsellor**: Read-only - `/counsellor/class-schedule`
- **hr**: Read-only - `/hr/class-schedule`
- **teacher**: View and cancel own schedules - `/teacher/class-schedule`
- **student**: View-only - `/student/class-schedule`

### Related Routes

**Class Calendar**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
/[role]/class-calendar
</pre>

- Full month calendar view
- Navigate to specific dates
- Filter by enrollment

**Reschedules Management**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
/[role]/reschedules
</pre>

- View reschedule requests
- Approve/deny reschedules
- Track cancellation history

**Student-Teacher Class Schedules**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
/[role]/student-teacher-classSchedules
</pre>

- Individual student-teacher schedule view
- Detailed schedule breakdown
- Session history

### Navigation from Other Modules

**From Enrollments Module**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
User clicks on enrollment → Navigate to enrollment details → Class Schedule tab
</pre>

**From Enrollment Details Module**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Class Schedule tab → Shows weekly grid → Click on "View all schedules" button →
Navigates to /[role]/class-schedule
</pre>

**From Dashboard**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Dashboard → "Class Schedules" card/link → /[role]/class-schedule
</pre>

### Query Parameters

The module supports the following query parameters (optional):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
/[role]/class-schedule?student_id=123&tutor_id=45&subject_id=5
</pre>

- `student_id`: Pre-select student filter
- `tutor_id`: Pre-select teacher filter
- `subject_id`: Pre-select subject filter
- `day`: Pre-select day (opens Time View)

---

## Key Features

### 1. Multiple View Modes

Three distinct viewing modes to accommodate different use cases:

- **Calendar View**: Weekly grid for quick overview
- **List View**: Vertical list for detailed browsing
- **Time View**: Focused view for specific day analysis

### 2. Advanced Filtering System

Comprehensive filter options to narrow down schedules:

- Filter by student (dropdown from usersByGroup)
- Filter by teacher (dropdown from usersByGroup)
- Filter by subject (dropdown from resources)
- Filter by day of week
- Filters persist across view changes
- Real-time filter application

### 3. Timezone Conversion

Automatic conversion between UTC and local timezones:

- API stores times in UTC
- Display shows local timezone
- Conversion handled by Moment.js
- Maintains accuracy across time zones

### 4. Role-Based Permissions

Different capabilities based on user role:

- **superAdmin/admin**: Delete any schedule immediately
- **teacher**: Cancel with 30-minute notice for today
- **student**: View-only or cancel with 6-hour notice
- **counsellor/hr**: Read-only access

### 5. Flexible Deletion Options

Three deletion modes for different scenarios:

- **Permanent deletion**: Removes all future occurrences
- **Week deletion**: Cancels only for current week
- **Specific day deletion**: Choose from next 4 occurrences

### 6. Real-Time Updates

React Query integration for live data:

- Automatic cache invalidation on changes
- Refetch on window focus
- Optimistic updates for better UX
- Loading and error states

### 7. Schedule Transformation

Intelligent schedule processing:

- Groups schedules by day of week
- Sorts slots by start time
- Reorders week to start from today
- Handles empty days gracefully

### 8. Responsive Design

Adapts to different screen sizes:

- Mobile-friendly layout
- Collapsible filters on small screens
- Touch-friendly slot selection
- Optimized images with Next.js Image

### 9. Visual Indicators

Clear visual cues for better UX:

- Today's date highlighted in blue
- Color-coded slots (rotating 3 colors)
- Profile images for teachers and students
- Badge showing slot count per day

### 10. Error Handling

Comprehensive error management:

- Toast notifications for errors
- Loading states during API calls
- Empty state displays
- Validation before deletion

### 11. Time Validation

Smart time-based restrictions:

- Calculates time difference for today's slots
- Prevents late cancellations
- Role-specific time limits
- Clear error messages

### 12. Pagination and Performance

Optimized for large datasets:

- "View more" option in Calendar View
- Lazy loading in Time View
- Efficient re-renders with useMemo
- Memoized components

---

## Related Screens

### 1. Class Calendar

**Route**: `/[role]/class-calendar`

Full month calendar view for long-term schedule planning.

**Key Differences from Class Schedules**:

- Month view instead of week view
- Navigate between months
- Filter by specific enrollment
- Visual calendar grid with date cells

### 2. Reschedules Management

**Route**: `/[role]/reschedules`

Manage reschedule requests and cancellations.

**Features**:

- List of pending reschedule requests
- Approve/deny functionality
- Cancellation history tracking
- Reason and notes display

### 3. Student-Teacher Class Schedules

**Route**: `/[role]/student-teacher-classSchedules`

Individual schedules for specific student-teacher pairs.

**Features**:

- Filter by student or teacher
- Detailed session history
- Attendance tracking
- Performance metrics

### 4. Ongoing Classes (Admin Dashboard)

**Route**: `/[role]/admin-dashboard` (component)

Dashboard widget showing currently active classes.

**Features**:

- Real-time ongoing class display
- Quick access to extend class
- Join class link
- Class status indicators

---

## Related API Endpoints (From Other Modules)

The following endpoints are used indirectly by the Class Schedules module:

**From Enrollment Details Module**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
DELETE /api/classSchedule
DELETE /api/enrollment/class-schedule
POST /api/classSchedule/confirm
</pre>

**From Enrollments Module**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
GET /api/enrollment/getAllEnrollment
GET /api/enrollment/getEnrollmentData
</pre>

**From Resources Module**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
GET /api/subjects
GET /api/boards
GET /api/grades
GET /api/curriculums
</pre>

**From Users Module**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
GET /api/users/getUsersByRole?role=teacher
GET /api/users/getUsersByRole?role=student
</pre>

---

## Implementation Notes

### Performance Optimizations

1. **Memoization**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const refractorSchedule = useMemo(() => { /* transformation logic */ }, [data, datesForWeek, today]);
const filteredSchedule = useMemo(() => { /* filter logic */ }, [refractorSchedule, filters]);
</pre>

2. **Memoized Components**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export default memo(CalenderView);
export default memo(ListView);
export default memo(TimeView);
export default memo(DeleteSlotsModal);
</pre>

3. **Callback Functions**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleDeleteSlot = useCallback((item, day) => { /* logic */ }, [deleteSlotModal]);
const handleDayFilter = useCallback((value) => { /* logic */ }, []);
</pre>

### React Query Configuration

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { data, isLoading, refetch } = useQuery({
  queryKey: ["class-schedules-grouped-by-day", options],
  queryFn: () => getAllClassSchedules(options, { token }),
  refetchOnWindowFocus: true,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
</pre>

### Mutation Handling

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleDeleteClassSchedule = useMutation({
  mutationFn: (payload: any) => deleteClassSchedule(payload, { token }),
  onSuccess: () => {
    toast.success("Class schedule deleted successfully");
    queryClient.invalidateQueries({ queryKey: ["class-schedules-grouped-by-day"] });
    queryClient.invalidateQueries({ queryKey: ["class-schedules-dayOfWeek"] });
    setDeleteSlotModal({ open: false, /* ... */ });
  },
  onError: (error: any) => {
    toast.error(error?.response?.data?.message || "Failed to delete schedule");
  },
});
</pre>

### Timezone Handling Best Practices

1. **Always store in UTC**: All times saved to database in UTC
2. **Convert for display**: Use moment.js to convert to local timezone
3. **Convert back for API**: When sending deletion requests, convert local time back to UTC
4. **Use ISO 8601 format**: `"2025-01-20T09:00:00Z"`

### Filter State Management

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const [selectedTeacher, setSelectedTeacher] = useState&lt;any&gt;("");
const [selectedStudent, setSelectedStudent] = useState&lt;any&gt;("");
const [selectedSubject, setSelectedSubject] = useState&lt;any&gt;("");
const [day, setDay] = useState&lt;string&gt;("");

// Apply filters to schedule data
const filteredSchedule = useMemo(() => {
  return refractorSchedule?.map((item: any) => ({
    ...item,
    slots: item?.slots?.filter((slot: any) => {
      const matchesTeacher = selectedTeacher
        ? slot?.enrollment?.tutor?.name === selectedTeacher?.name
        : true;
      const matchesStudent = selectedStudent
        ? slot?.enrollment?.studentsGroups?.some(
            (s: any) => s?.user?.name === selectedStudent?.name
          )
        : true;
      const matchesSubject = selectedSubject
        ? slot?.enrollment?.subject?.name === selectedSubject?.name
        : true;
      return matchesTeacher && matchesStudent && matchesSubject;
    }),
  }));
}, [refractorSchedule, selectedTeacher, selectedStudent, selectedSubject]);
</pre>

---

## Summary

The Class Schedules module is a comprehensive scheduling system that provides:

- **Multiple viewing modes** for different use cases
- **Role-based access control** with time-based restrictions
- **Flexible deletion options** (permanent, weekly, specific day)
- **Real-time updates** via React Query
- **Timezone conversion** between UTC and local time
- **Advanced filtering** by student, teacher, subject, and day
- **Responsive design** for mobile and desktop
- **Performance optimizations** with memoization

The module integrates deeply with the Enrollments and Enrollment Details modules, sharing the Delete Slots Modal component and utilizing enrollment data for comprehensive schedule management.
