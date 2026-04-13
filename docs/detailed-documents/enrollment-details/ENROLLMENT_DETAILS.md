# Enrollment Details Module Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Tab Components](#tab-components)
5. [Modal Components & Fields](#modal-components--fields)
6. [Enrollment Details Flow](#enrollment-details-flow)
7. [Data Types & Interfaces](#data-types--interfaces)
8. [Navigation](#navigation)
9. [Key Features](#key-features)

---

## Overview

The Enrollment Details module provides a comprehensive view of individual enrollments with detailed information about students, teachers, class schedules, and session history. It serves as the central hub for managing all aspects of a specific enrollment including scheduling, editing, and monitoring.

**Main Route**: `/{role}/enrollment-details/{id}`

**Supported Roles**: superAdmin, admin, counsellor (with edit permissions); teacher, student, parent (view-only)

**Core Features**:

- Detailed enrollment information display
- Three-tab interface (Detail, Class Schedule, Sessions)
- Teacher schedule management
- Class slot confirmation and deletion
- Enrollment editing and deletion
- Session history tracking

---

## Architecture

### Directory Structure

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
src/
├── screens/enrollment-details/
│   ├── enrollment-details.tsx                     # Main enrollment details screen
│   ├── enrollment-details.module.css
│   └── tabs-view/
│       ├── detail/
│       │   ├── detail.tsx                         # Detail tab component
│       │   └── detail.module.css
│       ├── class-schedule/
│       │   ├── class-schedule.tsx                 # Class schedule tab component
│       │   └── class-schedule.module.css
│       └── sessions/
│           ├── sessions.tsx                       # Sessions tab component
│           └── sessions.module.css
├── components/ui/superAdmin/enrollment-details/
│   ├── edit-enrollment-modal/                     # Edit enrollment modal
│   ├── delete-enrollment-modal/                   # Delete enrollment modal
│   ├── teacherSchedule-add-modal/                 # Add teacher schedule modal
│   ├── teacherExtraSchedule-modal/                # Add extra class modal
│   ├── slots-confirm-modal/                       # Confirm class slot modal
│   ├── deleteSlots-modal/                         # Delete class slot modal
│   └── remove-availableSlots-modal/               # Remove available slot modal
├── services/dashboard/superAdmin/enrollments/
│   └── getEnrollmentByGroup-id/
│       ├── getEnrollmentByGroup-id.ts             # Service functions for schedules
│       └── getEnrollmentByGroup-id.types.ts       # Type definitions
└── app/(protected)/[role]/enrollment-details/
    └── [id]/
        └── page.tsx                               # Dynamic route for enrollment details
</pre>

### State Management

- **React Query**: Server state for enrollment data, sessions, and schedules
- **Local State**: Tab management, modal states, transformed schedules
- **Redux Store**: Global resources (subjects, boards, grades, teachers, students)

### Component Hierarchy

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
EnrollmentDetailsForm (Main Container)
├── Header Section (Tutor & Student Info + Break Toggle)
├── Tabs Component
│   ├── Detail Tab
│   │   ├── Students Section
│   │   └── Analytics & Info Section
│   ├── Class Schedule Tab
│   │   └── Weekly Schedule Grid
│   │       ├── Available Slots
│   │       ├── Booked Slots
│   │       └── Cancelled Slots
│   └── Sessions Tab
│       └── Session History Cards
└── Modals
    ├── Edit Enrollment Modal
    ├── Delete Enrollment Modal
    ├── Add Teacher Schedule Modal
    ├── Add Extra Class Modal
    ├── Confirm Slot Modal
    ├── Delete Slot Modal
    └── Remove Available Slot Modal
</pre>

---

## API Endpoints

### Base URL

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
${BASE_URL}/api
</pre>

### 1. Get Enrollment By Group ID

**Endpoint**: `GET /api/enrollment/getEnrollmentByIdGrouped/{id}`

**Service Function**: `getEnrollmentByGroupId(id, config)`

**Purpose**: Fetches comprehensive enrollment details including class schedules

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Enrollment group ID |

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  id: number;
  status: number;
  hourly_rate: number;
  request_rate: number;
  tutor_hourly_rate: number;
  group_id: string;
  subject_id: number;
  board_id: number;
  curriculum_id: number;
  createdAt: string;
  grade_id: number;
  on_break: boolean;
  is_permanent: boolean | null;
  tutor: {
    name: string;
    id: number;
    email: string;
    profileImageUrl: string;
    country_code: string;
  };
  subject: { id: number; name: string; };
  board: { id: number; name: string; };
  curriculum: { id: number; name: string; };
  grade: { id: number; name: string; };
  classSchedules: {
    [day: string]: [
      {
        id: number | null;
        enrollment_id: number | null;
        teacher_schedule_id: number;
        teacher_schedule: {
          id: number;
          day_of_week: string;
          start_time: string;
          session_duration: number;
          is_booked: boolean;
        };
      }
    ];
  };
  studentsData: [
    {
      name: string;
      id: number;
      email: string;
      profileImageUrl: string;
      country_code: string;
    }
  ];
}
</pre>

**Location**: `src/services/dashboard/superAdmin/enrollments/enrollments.ts:83-87`

---

### 2. Get Sessions By Enrollment ID

**Endpoint**: `GET /api/session/getAllSession`

**Service Function**: `getAllSessions(options, config)`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `enrollment_id` | string | Yes | Enrollment ID to filter sessions |

**Purpose**: Fetches all sessions for a specific enrollment

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  data: [
    {
      session: {
        id: number;
        conclusion_type: "Conducted" | "Teacher Absent" | "Student Absent" | "Cancelled";
        duration: number;
        tutor_scaled_class_time: number;
        groupSessionTime: [
          {
            class_scaled_duration_time: number;
          }
        ];
      };
      expectedStudents: [
        {
          id: number;
          name: string;
          profileImageUrl: string;
        }
      ];
      createdAt: string;
    }
  ];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}
</pre>

**Location**: `src/services/dashboard/superAdmin/sessions/sessions.ts`

---

### 3. Add Teacher Schedule

**Endpoint**: `POST /api/class-schedules/createClassSchedule`

**Service Function**: `addTeacherSchedule(payload, config)`

**Request Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  day_of_week: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";  // Required
  start_time: string;                                                     // Required: "HH:mm:ss" format
  session_duration: number;                                               // Required: Duration in minutes
  slots: "morning" | "afternoon" | "evening" | "night" | "midnight";    // Required: Time category
  tutor_id: number;                                                       // Required: Teacher ID
  enrollment_id: number;                                                  // Required: Enrollment ID
}
</pre>

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  id: number;
  dayOfWeek: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  sessionDuration: number;
  status: boolean;
  slots: "morning" | "afternoon" | "evening" | "night" | "midnight";
  isBooked: boolean;
  tutorId: number;
  updatedAt: string;
  createdAt: string;
}
</pre>

**Purpose**: Creates a new teacher schedule slot for the enrollment

**Location**: `src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.ts:45-53`

---

### 4. Confirm Class Schedule

**Endpoint**: `POST /api/classSchedule`

**Service Function**: `confirmClassSchedule(payload, config)`

**Request Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  teacherScheduleId: number;   // Required: Teacher schedule slot ID
  enrollmentId: number;         // Required: Enrollment ID
}
</pre>

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  meetLink: string | null;
  meetSpace: string | null;
  isCancelled: boolean | null;
  id: number;
  status: boolean;
  teacherScheduleId: number;
  enrollmentId: number;
  updatedAt: string;
  createdAt: string;
}
</pre>

**Purpose**: Confirms an available teacher schedule slot for the enrollment

**Location**: `src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.ts:55-63`

---

### 5. Delete Class Schedule

**Endpoint**: `DELETE /api/classSchedule`

**Service Function**: `deleteClassSchedule(payload, config)`

**Request Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  ids: number[];   // Required: Array of class schedule IDs to delete
}
</pre>

**Purpose**: Deletes confirmed class schedule slots

**Location**: `src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.ts:68-71`

---

### 6. Cancel Class Schedule For Week (Add Extra Class)

**Endpoint**: `POST /api/reschedule-requests`

**Service Function**: `cancelClassScheduleForWeek(payload, config)`

**Request Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  user_id: number | null;           // User initiating the request
  enrollment_id: number | null;     // Enrollment ID
  class_status: "SCHEDULED" | "CANCELLED";
  class_schedule_id: number;        // Class schedule ID
  dateTime: string;                 // ISO 8601 format (UTC)
}
</pre>

**Purpose**: Cancels a class for a specific week or adds an extra class

**Response**: Returns reschedule request data

**Location**: `src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.ts:65-66`

---

### 7. Remove Available Slot

**Endpoint**: `DELETE /api/teacherSchedule/{id}`

**Service Function**: `removeAvailableSlotFn(id, config)`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Teacher schedule ID to remove |

**Purpose**: Removes an available (unbooked) teacher schedule slot

**Location**: `src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.ts:73-74`

---

### 8. Get Reschedule Requests

**Endpoint**: `GET /api/reschedule-requests-get`

**Service Function**: `rescheduleRequest(options, config, data)`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | No | Filter start date (YYYY-MM-DD) |
| `endDate` | string | No | Filter end date (YYYY-MM-DD) |

**Request Body**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  userId?: number;
  enrollment_id?: number;
  tutor_ids?: number[];
  student_ids?: number[];
}
</pre>

**Purpose**: Fetches reschedule requests for the enrollment

**Location**: `src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.ts:76-83`

---

### 9. Delete Reschedule Request

**Endpoint**: `DELETE /api/reschedule-requests`

**Service Function**: `deleteRescheduleRequest(options, config)`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Reschedule request ID |

**Purpose**: Deletes a reschedule request

**Location**: `src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.ts:85-90`

---

### 10. Edit Enrollment

**Endpoint**: `PUT /api/enrollment/{id}`

**Service Function**: `editEnrollmentByGroupId(id, payload, config)`

**Request Payload**: Same as in Enrollments module

**Purpose**: Edits enrollment details from the details view

**Location**: Inherits from main enrollments service

---

### 11. Delete Enrollment

**Endpoint**: `DELETE /api/enrollment/{id}`

**Service Function**: `deleteEnrollment(payload, config)`

**Purpose**: Deletes enrollment and redirects to enrollments list

**Location**: Inherits from main enrollments service

---

### 12. Change Break Status (Legacy)

**Endpoint**: `PUT /api/enrollment/{id}/on-break`

**Service Function**: `changeBreakStatusOld(id, payload, config)`

**Request Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  on_break: boolean;   // New break status
}
</pre>

**Purpose**: Toggles enrollment break status (legacy endpoint used in details view)

**Location**: Inherits from main enrollments service

---

## Tab Components

### 1. Detail Tab

**Component**: `Detail`

**Location**: `src/screens/enrollment-details/tabs-view/detail/detail.tsx`

**Purpose**: Displays comprehensive enrollment information

#### Sections

##### A. Students Section

**Displays**:

- Student profile images
- Student names
- Country flags and codes
- Heading: "Students - View students in your class"

**Features**:

- Scrollable list of all enrolled students
- Shows student profile pictures or default image
- Displays country of origin with flag

##### B. Analytics Section

**Metrics Displayed**:

| Metric              | Description                        | Source                            |
| ------------------- | ---------------------------------- | --------------------------------- |
| Classes Taken       | Total number of sessions completed | Sessions count from API           |
| Teacher Hourly Rate | Rate paid to teacher per hour      | `data.tutor_hourly_rate` (in AED) |
| Student Hourly Rate | Rate charged to student per hour   | `data.hourly_rate` (in AED)       |

**Visual Elements**:

- Cap icon for each metric
- Currency display (AED)
- Loading states for dynamic data

##### C. Info Section

**Information Displayed**:

| Field      | Description           | Source                 |
| ---------- | --------------------- | ---------------------- |
| Grade      | Student's grade level | `data.grade.name`      |
| Curriculum | Academic curriculum   | `data.curriculum.name` |
| Board      | Education board       | `data.board.name`      |

**User Experience**:

- Clean two-column layout
- Fallback "No Show" for missing data
- Responsive design

---

### 2. Class Schedule Tab

**Component**: `ClassSchedule`

**Location**: `src/screens/enrollment-details/tabs-view/class-schedule/class-schedule.tsx`

**Purpose**: Manages weekly class schedules with visual slot management

#### Features

##### A. Weekly Schedule Grid

**Display Structure**:

- 7 days starting from today
- Days arranged in chronological order (today first)
- Each day shows date and day name
- Highlighting for current day (blue background)

**Day Format**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
Day Name (e.g., Monday)
Date Number (e.g., 15)
</pre>

##### B. Slot Types

**1. Booked Slots (Current Enrollment)**:

- **Appearance**: Distinct colored box
- **Information Displayed**:
  - Session duration (e.g., "60m")
  - Start time (e.g., "10:00 AM")
  - Teacher profile image and name
  - Student profile images (up to 2) and names
  - "+X more" indicator for additional students
  - "Cancelled" label if rescheduled
- **Interaction**: Click to delete slot

**2. Available Slots**:

- **Appearance**: Different colored box
- **Information Displayed**:
  - "Available" label
  - Time range (e.g., "10:00 AM - 11:00 AM")
- **Actions**:
  - Click to confirm slot for enrollment
  - Delete icon to remove available slot
- **Interaction**: Clickable to book

**3. Booked (Other Enrollment)**:

- **Appearance**: Grayed out box
- **Information Displayed**:
  - "Booked" label
  - Time range
- **Interaction**: Not clickable (informational only)

##### C. Slot Management Actions

**Confirm Available Slot**:

1. Click on available slot
2. Confirmation modal appears
3. Shows day, start time, and end time
4. Confirms slot for current enrollment

**Delete Confirmed Slot**:

1. Click on booked slot (current enrollment)
2. Delete modal with options:
   - Delete single instance
   - Delete for specific date
   - Delete for entire week
3. Creates reschedule request

**Remove Available Slot**:

1. Click delete icon on available slot
2. Confirmation modal appears
3. Permanently removes teacher schedule slot

##### D. Cancelled Slots Display

**Features**:

- Shows "Cancelled" label on cancelled slots
- Maintains visual representation
- Linked to reschedule requests

**Cancellation Logic**:

- Checks reschedule requests data
- Matches class schedule ID and date
- Displays "Cancelled" overlay

##### E. Time Conversion

**Important**:

- All times stored in UTC in database
- Automatically converted to local timezone
- Display shows local time
- Conversion handled by moment.js

**Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
// UTC: 14:00:00 → Local (GMT+4): 06:00 PM
const startTime = moment.utc("14:00:00", "HH:mm:ss").local();
</pre>

##### F. Empty State

**Display**: "No slots available!" message when day has no schedules

---

### 3. Sessions Tab

**Component**: `Sessions`

**Location**: `src/screens/enrollment-details/tabs-view/sessions/sessions.tsx`

**Purpose**: Displays historical session data for the enrollment

#### Session Card Layout

Each session card displays:

##### A. Status Badge

**Conclusion Types** (with color coding):

| Status         | Background Color       | Text Color            | Description                    |
| -------------- | ---------------------- | --------------------- | ------------------------------ |
| Conducted      | Light Green (#A0FFC0)  | Dark Green (#286320)  | Session completed successfully |
| Teacher Absent | Light Purple (#DBDCFF) | Dark Purple (#2F3282) | Teacher was absent             |
| Student Absent | Light Purple (#DBDCFF) | Dark Purple (#2F3282) | Student was absent             |
| Cancelled      | Light Red (#FFACAC)    | Dark Red (#653838)    | Session was cancelled          |

##### B. Session Type

**Display**:

- "One-on-One Session": Single student
- "Grouped Session": Multiple students

##### C. Student Information

**Shows**:

- Primary student profile image
- Primary student name
- Fallback for missing data

##### D. Session Date

**Format**: `D MMMM YYYY` (e.g., "15 December 2024")

- Converted from UTC to local timezone
- Displays creation date of session

##### E. Duration Metrics

**Three Duration Types**:

| Metric           | Description                      | Calculation                                              |
| ---------------- | -------------------------------- | -------------------------------------------------------- |
| Teacher Duration | Time teacher spent in session    | `session.tutor_scaled_class_time` (in minutes)           |
| Student Duration | Time student spent in session    | `session.groupSessionTime[0].class_scaled_duration_time` |
| Session Duration | Total scheduled session duration | `session.duration`                                       |

**Display Format**: Converted from minutes to hours using `MinutesToHours()` helper

##### F. Empty States

**Displays**: Error box when no sessions found or loading fails

**Loading State**: Shows loading box while fetching session data

---

## Modal Components & Fields

### 1. Edit Enrollment Modal

**Component**: `EditEnrollmentModal`

**Location**: `src/components/ui/superAdmin/enrollment-details/edit-enrollment-modal/edit-enrollment-modal.tsx`

**Purpose**: Edit enrollment details from details view

**Fields**: Identical to enrollment edit modal (see Enrollments documentation)

**Differences from Enrollments Edit Modal**:

- Pre-populated with data from `getEnrollmentByGroupId` endpoint
- Updates trigger refetch of enrollment details
- Closes and refreshes detail view on success

---

### 2. Delete Enrollment Modal

**Component**: `DeleteEnrollmentModal`

**Location**: `src/components/ui/superAdmin/enrollment-details/delete-enrollment-modal/delete-enrollment-modal.tsx`

**Purpose**: Confirm deletion of enrollment

**Fields**: None (Confirmation dialog only)

**Dialog Content**:

- Heading: "Are You Sure?"
- Subheading: "Are you sure you want to delete this enrollment? This action is permanent."
- Buttons: "Cancel" and "Delete"

**Post-Delete Action**: Redirects to `/enrollments` page

---

### 3. Add Teacher Schedule Modal

**Component**: `TeacherSceduleAddModal`

**Location**: `src/components/ui/superAdmin/enrollment-details/teacherSchedule-add-modal/teacherSchedule-add-modal.tsx`

**Purpose**: Create new teacher schedule slots

**Fields**:

| Field         | Type            | Required | Validation       | Description                                  |
| ------------- | --------------- | -------- | ---------------- | -------------------------------------------- |
| Day of Week   | Dropdown        | Yes      | Must select day  | Monday - Sunday                              |
| Start Time    | Dropdown        | Yes      | Must select time | Available time slots (15-min intervals)      |
| End Time      | Dropdown        | Yes      | Must select time | Must be after start time                     |
| Duration      | Auto-calculated | -        | -                | Calculated from start and end time           |
| Slot Category | Auto-calculated | -        | -                | morning, afternoon, evening, night, midnight |

**Smart Features**:

##### A. Booked Slot Detection

**Functionality**:

- Fetches existing schedules for selected day
- Marks booked time slots with "(Booked slot)" label
- Prevents selection of conflicting times

**Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
09:00 AM (Booked slot)
09:15 AM
09:30 AM
</pre>

##### B. Available End Times

**Logic**:

- Shows only valid end times after selected start time
- Stops at next booked slot
- Prevents scheduling conflicts

**Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
Start Time: 10:00 AM
Available End Times: 10:15 AM, 10:30 AM, 10:45 AM, 11:00 AM
(Stops at 11:00 AM if next slot starts at 11:00 AM)
</pre>

##### C. Midnight Handling

**Special Case**:

- If start time is 11:00 PM
- Shows end times past midnight (12:00 AM - 03:00 AM)
- Allows late-night scheduling

##### D. Slot Category Assignment

**Automatic Categorization**:

| Time Range          | Category  | Description      |
| ------------------- | --------- | ---------------- |
| 06:00 AM - 12:00 PM | morning   | Morning slots    |
| 12:00 PM - 03:00 PM | afternoon | Afternoon slots  |
| 03:00 PM - 07:00 PM | evening   | Evening slots    |
| 07:00 PM - 11:00 PM | night     | Night slots      |
| 11:00 PM - 06:00 AM | midnight  | Late night slots |

**Form Submission**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  day_of_week: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  start_time: "HH:mm:ss";          // e.g., "14:00:00"
  session_duration: number;         // Duration in minutes
  slots: "morning" | "afternoon" | "evening" | "night" | "midnight";
  tutor_id: number;
  enrollment_id: number;
}
</pre>

**User Experience**:

- Day selection resets time fields
- Dynamic end time options based on start time
- Visual feedback for booked slots
- Automatic duration calculation
- Success state resets form

---

### 4. Add Extra Class Modal

**Component**: `TeacherExtraSceduleAddModal`

**Location**: `src/components/ui/superAdmin/enrollment-details/teacherExtraSchedule-modal/teacherExtraSchedule-modal.tsx`

**Purpose**: Add extra classes by cancelling existing ones

**Fields**:

| Field                    | Type        | Required | Description                  |
| ------------------------ | ----------- | -------- | ---------------------------- |
| Date                     | Date Picker | Yes      | Date for extra class         |
| Existing Class to Cancel | Dropdown    | Yes      | Select which class to cancel |
| New Start Time           | Dropdown    | Yes      | Start time for extra class   |
| New Duration             | Input       | Yes      | Duration in minutes          |

**Functionality**:

- Creates reschedule request
- Cancels specified class for that date
- Schedules new class at different time
- Uses `class_status: "SCHEDULED"` for new classes

**Form Submission**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  user_id: number;
  enrollment_id: number;
  class_status: "SCHEDULED";
  class_schedule_id: number;        // Class being rescheduled
  dateTime: string;                 // ISO 8601 UTC format
  // Additional fields for new schedule
}
</pre>

**User Experience**:

- Shows existing scheduled classes
- Prevents conflicts with reschedule requests
- Validates new time against existing schedules
- Success message: "Extra Slot added successfully."

---

### 5. Confirm Slot Modal

**Component**: `SlotsConfirmModal`

**Location**: `src/components/ui/superAdmin/enrollment-details/slots-confirm-modal/slots-confirm-modal.tsx`

**Purpose**: Confirm booking of available teacher schedule slot

**Fields**: None (Confirmation dialog only)

**Dialog Content**:

- Heading: Day name (e.g., "Monday")
- Subheading: "Do you want to confirm your slot between (10:00 AM to 11:00 AM)"
- Icon: Add icon
- Buttons: "Cancel" and "Add"

**Form Submission**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  teacherScheduleId: number;    // Available slot ID
  enrollmentId: number;         // Current enrollment ID
}
</pre>

**Post-Confirmation**:

- Slot becomes "Booked" for this enrollment
- Teacher schedule marked as booked
- Appears in Class Schedule tab as booked slot
- Refetches enrollment data

---

### 6. Delete Slots Modal

**Component**: `DeleteSlotsModal`

**Location**: `src/components/ui/superAdmin/enrollment-details/deleteSlots-modal/deleteSlots-modal.tsx`

**Purpose**: Delete confirmed class schedule slots

**Fields**: None (Action selector modal)

**Dialog Content**:

- Heading: Day name (e.g., "Monday")
- Subheading: "Are you sure you want to delete slot (10:00 AM to 11:00 AM)"
- Three action options:
  1. **Delete This Day**: Delete single occurrence on specific date
  2. **Delete This Week**: Delete for entire week starting from date
  3. **Delete Permanently**: Remove class schedule completely

**Action Differences**:

##### A. Delete This Day

**Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  user_id: number;
  enrollment_id: number;
  class_status: "CANCELLED";
  class_schedule_id: number;
  dateTime: string;             // Specific date in UTC
}
</pre>

**Result**: Creates reschedule request for that date only

##### B. Delete This Week

**Payload**: Similar to "Delete This Day" but affects entire week

**Result**: Creates reschedule request for the week

##### C. Delete Permanently

**Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
{
  ids: [class_schedule_id];     // Array of schedule IDs
}
</pre>

**Result**: Permanently removes class schedule from database

**User Experience**:

- Clear distinction between temporary and permanent deletion
- Loading states for each action
- Success toast with appropriate message

---

### 7. Remove Available Slot Modal

**Component**: `RemoveAvailableSlotsModal`

**Location**: `src/components/ui/superAdmin/enrollment-details/remove-availableSlots-modal/remove-availableSlots-modal.tsx`

**Purpose**: Remove unbooked teacher schedule slots

**Fields**: None (Confirmation dialog only)

**Dialog Content**:

- Heading: Day name
- Subheading: "Are you sure you want to delete slot (10:00 AM to 11:00 AM)"
- Buttons: "Cancel" and "Delete"

**Form Submission**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
// Deletes teacher schedule by ID
removeAvailableSlotFn(teacher_schedule_id, { token })
</pre>

**Difference from Delete Slots**:

- Only works on **available (unbooked)** slots
- Permanently removes teacher schedule
- No reschedule request created
- Simpler than booked slot deletion

**User Experience**:

- Only accessible via delete icon on available slots
- Immediate deletion without options
- Cannot be undone
- Refetches schedule data on success

---

## Enrollment Details Flow

Flowchart Link: https://tinyurl.com/29pubc97

### Flowchart

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
flowchart TD
    Start([User Clicks Enrollment Row]) --> Navigate[Navigate to Enrollment Details]
    Navigate --> FetchData[Fetch Enrollment Data]
    FetchData --> Loading{Data Loading?}
    Loading -->|Yes| ShowLoader[Show Loading Box]
    Loading -->|No| CheckData{Data Available?}
    CheckData -->|No| ShowError[Show Error Box]
    CheckData -->|Yes| DisplayHeader[Display Header Section]

    DisplayHeader --> ShowTutorInfo[Show Tutor Profile & Info]
    ShowTutorInfo --> ShowSubject[Show Subject Name]
    ShowSubject --> ShowDate[Show Enrollment Date]
    ShowDate --> ShowBreakToggle[Show Break Status Toggle]

    ShowBreakToggle --> DisplayTabs[Display Three Tabs]
    DisplayTabs --> DefaultTab[Default Tab: Detail]

    %% TAB SELECTION FLOW
    DefaultTab --> TabSelection{User Selects Tab?}

    %% DETAIL TAB FLOW
    TabSelection -->|Detail Tab| ShowDetailTab[Display Detail Tab]
    ShowDetailTab --> ShowStudents[Show Students Section]
    ShowStudents --> ShowAnalytics[Show Analytics Metrics]
    ShowAnalytics --> ShowInfo[Show Info Section]
    ShowInfo --> DetailActions{User Action?}

    DetailActions -->|Click Edit| OpenEditModal[Open Edit Enrollment Modal]
    OpenEditModal --> FillEditForm[Modify Enrollment Fields]
    FillEditForm --> SubmitEdit[Submit Edit]
    SubmitEdit --> EditSuccess{Success?}
    EditSuccess -->|No| ShowEditError[Show Error Message]
    ShowEditError --> DetailActions
    EditSuccess -->|Yes| RefreshData1[Refresh Enrollment Data]
    RefreshData1 --> ShowSuccessToast1[Show Success Toast]
    ShowSuccessToast1 --> TabSelection

    DetailActions -->|Click Delete| OpenDeleteModal[Open Delete Confirmation Modal]
    OpenDeleteModal --> ConfirmDelete{Confirm Delete?}
    ConfirmDelete -->|No| TabSelection
    ConfirmDelete -->|Yes| SubmitDelete[Submit Delete Request]
    SubmitDelete --> DeleteSuccess{Success?}
    DeleteSuccess -->|No| ShowDeleteError[Show Error Message]
    ShowDeleteError --> TabSelection
    DeleteSuccess -->|Yes| RedirectToList[Redirect to Enrollments Page]
    RedirectToList --> ShowDeleteToast[Show Success Toast]

    DetailActions -->|Toggle Break| UpdateBreak[Submit Break Status Change]
    UpdateBreak --> BreakSuccess{Success?}
    BreakSuccess -->|No| ShowBreakError[Show Error Message]
    ShowBreakError --> TabSelection
    BreakSuccess -->|Yes| RefreshData2[Refresh Enrollment Data]
    RefreshData2 --> ShowBreakToast[Show Success Toast]
    ShowBreakToast --> TabSelection

    DetailActions -->|Stay on Tab| TabSelection

    %% CLASS SCHEDULE TAB FLOW
    TabSelection -->|Class Schedule Tab| ShowScheduleTab[Display Class Schedule Tab]
    ShowScheduleTab --> TransformSchedules[Transform Schedule Data]
    TransformSchedules --> ShowWeeklyGrid[Show Weekly Schedule Grid]
    ShowWeeklyGrid --> DisplayDays[Display 7 Days from Today]
    DisplayDays --> RenderSlots[Render Slots for Each Day]

    RenderSlots --> SlotTypes{Slot Type?}
    SlotTypes -->|Booked Current| ShowBookedSlot[Show Booked Slot]
    SlotTypes -->|Available| ShowAvailableSlot[Show Available Slot]
    SlotTypes -->|Booked Other| ShowOtherBookedSlot[Show Other Booked Slot]

    ShowBookedSlot --> ShowSlotInfo1[Show Teacher & Student Info]
    ShowSlotInfo1 --> CheckCancelled{Cancelled?}
    CheckCancelled -->|Yes| ShowCancelledLabel[Show 'Cancelled' Label]
    CheckCancelled -->|No| ScheduleActions
    ShowCancelledLabel --> ScheduleActions

    ShowAvailableSlot --> ShowAvailableInfo[Show 'Available' & Time Range]
    ShowAvailableInfo --> ShowDeleteIcon[Show Delete Icon]
    ShowDeleteIcon --> ScheduleActions

    ShowOtherBookedSlot --> ShowBookedInfo[Show 'Booked' & Time Range]
    ShowBookedInfo --> ScheduleActions

    ScheduleActions{User Action?}

    ScheduleActions -->|Click Available Slot| OpenConfirmModal[Open Confirm Slot Modal]
    OpenConfirmModal --> ShowSlotTime[Show Day & Time Range]
    ShowSlotTime --> ConfirmSlot{Confirm Slot?}
    ConfirmSlot -->|No| TabSelection
    ConfirmSlot -->|Yes| SubmitConfirm[Submit Confirm Request]
    SubmitConfirm --> ConfirmSuccess{Success?}
    ConfirmSuccess -->|No| ShowConfirmError[Show Error Message]
    ShowConfirmError --> TabSelection
    ConfirmSuccess -->|Yes| RefreshData3[Refresh Enrollment Data]
    RefreshData3 --> ShowConfirmToast[Show Success Toast]
    ShowConfirmToast --> TabSelection

    ScheduleActions -->|Click Booked Slot| OpenDeleteSlotModal[Open Delete Slot Modal]
    OpenDeleteSlotModal --> ShowDeleteOptions[Show 3 Delete Options]
    ShowDeleteOptions --> DeleteChoice{User Choice?}

    DeleteChoice -->|Delete This Day| DeleteSingleDay[Submit Single Day Delete]
    DeleteSingleDay --> CreateReschedule1[Create Reschedule Request]
    CreateReschedule1 --> DayDeleteSuccess{Success?}
    DayDeleteSuccess -->|No| ShowDayError[Show Error Message]
    ShowDayError --> TabSelection
    DayDeleteSuccess -->|Yes| RefreshData4[Refresh Enrollment Data]
    RefreshData4 --> ShowDayToast[Show Success Toast]
    ShowDayToast --> TabSelection

    DeleteChoice -->|Delete This Week| DeleteWeek[Submit Week Delete]
    DeleteWeek --> CreateReschedule2[Create Reschedule Requests]
    CreateReschedule2 --> WeekDeleteSuccess{Success?}
    WeekDeleteSuccess -->|No| ShowWeekError[Show Error Message]
    ShowWeekError --> TabSelection
    WeekDeleteSuccess -->|Yes| RefreshData5[Refresh Enrollment Data]
    RefreshData5 --> ShowWeekToast[Show Success Toast]
    ShowWeekToast --> TabSelection

    DeleteChoice -->|Delete Permanently| DeletePermanent[Submit Permanent Delete]
    DeletePermanent --> RemoveSchedule[Remove Class Schedule]
    RemoveSchedule --> PermDeleteSuccess{Success?}
    PermDeleteSuccess -->|No| ShowPermError[Show Error Message]
    ShowPermError --> TabSelection
    PermDeleteSuccess -->|Yes| RefreshData6[Refresh Enrollment Data]
    RefreshData6 --> ShowPermToast[Show Success Toast]
    ShowPermToast --> TabSelection

    DeleteChoice -->|Cancel| TabSelection

    ScheduleActions -->|Click Delete Icon| OpenRemoveModal[Open Remove Available Slot Modal]
    OpenRemoveModal --> ConfirmRemove{Confirm Remove?}
    ConfirmRemove -->|No| TabSelection
    ConfirmRemove -->|Yes| SubmitRemove[Submit Remove Request]
    SubmitRemove --> RemoveSuccess{Success?}
    RemoveSuccess -->|No| ShowRemoveError[Show Error Message]
    ShowRemoveError --> TabSelection
    RemoveSuccess -->|Yes| RefreshData7[Refresh Enrollment Data]
    RefreshData7 --> ShowRemoveToast[Show Success Toast]
    ShowRemoveToast --> TabSelection

    ScheduleActions -->|Click Add Teacher Schedule| OpenAddScheduleModal[Open Add Teacher Schedule Modal]
    OpenAddScheduleModal --> SelectDay[Select Day of Week]
    SelectDay --> LoadBookedSlots[Load Booked Slots for Day]
    LoadBookedSlots --> SelectStartTime[Select Start Time]
    SelectStartTime --> FilterEndTimes[Filter Available End Times]
    FilterEndTimes --> SelectEndTime[Select End Time]
    SelectEndTime --> CalcDuration[Auto-Calculate Duration & Slot Category]
    CalcDuration --> ValidateSchedule{Valid Schedule?}
    ValidateSchedule -->|No| ShowScheduleError[Show Validation Error]
    ShowScheduleError --> SelectStartTime
    ValidateSchedule -->|Yes| SubmitSchedule[Submit New Schedule]
    SubmitSchedule --> ScheduleSuccess{Success?}
    ScheduleSuccess -->|No| ShowAddScheduleError[Show Error Message]
    ShowAddScheduleError --> TabSelection
    ScheduleSuccess -->|Yes| RefreshData8[Refresh Enrollment Data]
    RefreshData8 --> ShowScheduleToast[Show Success Toast]
    ShowScheduleToast --> TabSelection

    ScheduleActions -->|Click Add Extra Class| OpenExtraClassModal[Open Add Extra Class Modal]
    OpenExtraClassModal --> SelectDate[Select Date for Extra Class]
    SelectDate --> SelectExistingClass[Select Class to Cancel]
    SelectExistingClass --> SelectNewTime[Select New Start Time]
    SelectNewTime --> EnterNewDuration[Enter New Duration]
    EnterNewDuration --> ValidateExtra{Valid Extra Class?}
    ValidateExtra -->|No| ShowExtraError[Show Validation Error]
    ShowExtraError --> SelectNewTime
    ValidateExtra -->|Yes| SubmitExtraClass[Submit Extra Class Request]
    SubmitExtraClass --> ExtraSuccess{Success?}
    ExtraSuccess -->|No| ShowExtraApiError[Show Error Message]
    ShowExtraApiError --> TabSelection
    ExtraSuccess -->|Yes| RefreshData9[Refresh Enrollment Data]
    RefreshData9 --> ShowExtraToast[Show Success Toast: Extra Slot Added]
    ShowExtraToast --> TabSelection

    ScheduleActions -->|Stay on Tab| TabSelection

    %% SESSIONS TAB FLOW
    TabSelection -->|Sessions Tab| ShowSessionsTab[Display Sessions Tab]
    ShowSessionsTab --> FetchSessions[Fetch Sessions by Enrollment ID]
    FetchSessions --> SessionsLoading{Sessions Loading?}
    SessionsLoading -->|Yes| ShowSessionsLoader[Show Loading Box]
    SessionsLoading -->|No| CheckSessions{Sessions Available?}
    CheckSessions -->|No| ShowNoSessions[Show Error Box]
    CheckSessions -->|Yes| RenderSessions[Render Session Cards]

    RenderSessions --> ShowSessionCard[Show Session Card]
    ShowSessionCard --> DisplayStatus[Display Conclusion Type Badge]
    DisplayStatus --> DisplaySessionType[Display Session Type]
    DisplaySessionType --> DisplayStudent[Display Student Info]
    DisplayStudent --> DisplayDate[Display Session Date]
    DisplayDate --> DisplayDurations[Display 3 Duration Metrics]
    DisplayDurations --> MoreSessions{More Sessions?}
    MoreSessions -->|Yes| RenderSessions
    MoreSessions -->|No| SessionsActions

    SessionsActions{User Action?}
    SessionsActions -->|View More| ScrollSessions[Scroll Through Sessions]
    ScrollSessions --> TabSelection
    SessionsActions -->|Switch Tab| TabSelection

    style Start fill:#e1f5ff
    style RedirectToList fill:#fff4e1
    style ShowDeleteToast fill:#ffe1e1
</pre>

### Flow Description

#### 1. Initial Page Load

**Navigation**:

- User clicks enrollment row from enrollments list
- Browser navigates to `/{role}/enrollment-details/{id}`
- Dynamic `id` parameter passed to component

**Data Fetching**:

- Fetches enrollment data via `getEnrollmentByGroupId`
- Fetches sessions data via `getAllSessions` with enrollment ID filter
- Fetches reschedule requests via `rescheduleRequest`
- All queries run in parallel using React Query

**Loading State**:

- Shows loading box while data is being fetched
- Displays error box if data fetch fails

---

#### 2. Header Section Display

**Components Shown**:

- Teacher profile image and name
- Subject name
- Enrollment creation date
- Break status toggle switch

**Break Toggle Interaction**:

- Toggle switches between `on_break: true/false`
- Uses legacy endpoint (`changeBreakStatusOld`)
- Shows circular progress during update
- Displays success toast on completion
- Refetches enrollment data

---

#### 3. Tab Navigation

**Default Tab**: Detail tab is selected by default

**Tab Management**:

- Local state tracks active tab
- Clicking tab updates state
- Only one tab visible at a time
- Actions section changes based on tab

---

#### 4. Detail Tab Flow

**Display Sections**:

1. Students section with profile images
2. Analytics section with metrics
3. Info section with academic details

**Available Actions**:

##### Edit Enrollment:

1. Click edit icon
2. Modal opens with pre-populated data
3. User modifies fields
4. Submit triggers API call
5. Success refetches data and closes modal
6. Toast notification shown

##### Delete Enrollment:

1. Click delete icon
2. Confirmation modal appears
3. User confirms deletion
4. API call deletes enrollment
5. Redirects to `/enrollments` page
6. Success toast shown

##### Toggle Break:

1. Click toggle switch
2. Immediate API call
3. Shows loading spinner on toggle
4. Success updates UI
5. Toast notification shown

---

#### 5. Class Schedule Tab Flow

**Schedule Transformation**:

- Receives raw schedule data grouped by day (UTC)
- Converts all times to local timezone
- Reorders days starting from today
- Calculates date for each day
- Creates 7-day weekly view

**Slot Rendering**:

- Three types of slots rendered
- Each slot shows relevant information
- Click interactions based on slot type

**User Interactions**:

##### A. Confirm Available Slot:

1. User clicks available slot
2. Confirm modal shows day and time
3. User confirms
4. API creates class schedule link
5. Slot becomes "Booked" for enrollment
6. Schedule refetches

##### B. Delete Booked Slot:

1. User clicks booked slot
2. Delete modal with 3 options:
   - **Delete This Day**: Cancels one occurrence
   - **Delete This Week**: Cancels week occurrences
   - **Delete Permanently**: Removes schedule completely
3. User selects option
4. API processes request
5. Creates reschedule request or deletes schedule
6. UI updates with "Cancelled" label or removed slot

##### C. Remove Available Slot:

1. User clicks delete icon on available slot
2. Confirmation modal appears
3. User confirms
4. API deletes teacher schedule
5. Slot removed from view
6. Schedule refetches

##### D. Add Teacher Schedule:

1. User clicks "Add Teacher Schedule" icon
2. Modal opens
3. User selects day
4. System shows available times (marks booked)
5. User selects start time
6. System filters valid end times
7. User selects end time
8. Duration and category auto-calculated
9. Submit creates teacher schedule
10. Schedule refetches

##### E. Add Extra Class:

1. User clicks "Add Extra Class" icon
2. Modal opens
3. User selects date
4. User selects existing class to cancel
5. User enters new time and duration
6. Submit creates reschedule request
7. Marks old class as cancelled, schedules new class
8. Schedule refetches

---

#### 6. Sessions Tab Flow

**Data Display**:

- Fetches sessions filtered by enrollment ID
- Shows loading state while fetching
- Renders session cards for each session
- Displays error if no sessions found

**Session Card Information**:

1. Conclusion type badge (color-coded)
2. Session type (One-on-One or Grouped)
3. Student profile and name
4. Session date (converted to local)
5. Three duration metrics:
   - Teacher duration
   - Student duration
   - Total session duration

**User Interaction**:

- Read-only view
- Scrollable list
- No editing or deletion
- Informational only

---

## Data Types & Interfaces

### Service Function Types

**Location**: `src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.types.ts`

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
// Create Teacher Schedule
export type Create_TeacherSchedule_Payload = {
  day_of_week: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  start_time: string;           // "HH:mm:ss" format
  session_duration: number;     // Duration in minutes
  slots: "morning" | "afternoon" | "evening" | "night" | "midnight";
  tutor_id: number;
  enrollment_id: number;
};

export type Create_TeacherSchedule_ApiResponse_Type = {
  id: number;
  dayOfWeek: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  sessionDuration: number;
  status: boolean;
  slots: "morning" | "afternoon" | "evening" | "night" | "midnight";
  isBooked: boolean;
  tutorId: number;
  updatedAt: string;
  createdAt: string;
};

// Confirm Class Schedule
export type ConfirmClassSchedule_Payload = {
  teacherScheduleId: number;
  enrollmentId: number;
};

export type ConfirmClassSchedule__ApiResponse_Type = {
  meetLink: string | null;
  meetSpace: string | null;
  isCancelled: boolean | null;
  id: number;
  status: boolean;
  teacherScheduleId: number;
  enrollmentId: number;
  updatedAt: string;
  createdAt: string;
};

// Delete Class Schedule
export type DeleteClassSchedule_Payload_Type = {
  ids: number[];
};

// Reschedule Request
export type RescheduleRequest_Payload_Type = {
  userId?: number;
  enrollment_id?: number;
  tutor_ids?: number[];
  student_ids?: number[];
} | {};
</pre>

### Component State Types

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
// Modal States
type ModalStates = {
  deleteEnrollmentModal: boolean;
  editEnrollmentModal: boolean;
  removeAvailableSlot: {
    open: boolean;
    id: number | null;
    day: string;
    startTime: string;
    endTime: string;
  };
  addTeacherScheduleModal: {
    id: string;
    open: boolean;
    transformedSchedulesArr: any[];
  };
  addExtraTeacherScheduleModal: {
    open: boolean;
    transformedSchedulesArr: any[];
  };
  confirmSlotModal: {
    open: boolean;
    day: string;
    teacher_schedule_id: number | null;
    enrollment_id: number | null;
    startTime: string;
    endTime: string;
  };
  deleteSlotModal: {
    open: boolean;
    day: string;
    startTime: string;
    endTime: string;
    ids: number[];
  };
};

// Transformed Schedule
type TransformedSchedule = {
  date: string;              // YYYY-MM-DD
  key: string;               // Day abbreviation (Mon, Tue, etc.)
  name: string;              // Full day name (Monday, Tuesday, etc.)
  slotsArr: ScheduleSlot[];
};

type ScheduleSlot = {
  id: number | null;
  enrollment_id: number | null;
  teacher_schedule_id: number;
  teacher_schedule: {
    id: number;
    day_of_week: string;
    start_time: string;        // HH:mm:ss (local time)
    session_duration: number;
    is_booked: boolean;
  };
};
</pre>

---

## Navigation

### Routes

**Enrollment Details Page**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
/{role}/enrollment-details/{id}
</pre>

**Navigation From**:

- Enrollments list page (click on row)
- Direct URL access with enrollment ID

**Navigation To**:

- Back to enrollments list (after deletion)
- Stays on page (after edits)

### Role-Based Access

**Full Access** (superAdmin, admin, counsellor):

- View all tabs
- Edit enrollment
- Delete enrollment
- Manage class schedules
- Add/remove teacher schedules

**View Only** (teacher, student, parent, hr):

- View all tabs
- Cannot edit or delete
- Cannot manage schedules
- Read-only access

### URL Parameters

**Dynamic ID**: The `{id}` parameter is the enrollment's group_id

**Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
/superAdmin/enrollment-details/E12345
</pre>

---

## Key Features

### 1. Comprehensive Enrollment View

**Single Source of Truth**:

- All enrollment information in one place
- Three organized tabs for different aspects
- Real-time data updates
- Comprehensive student and teacher information

---

### 2. Advanced Schedule Management

**Weekly View**:

- 7-day rolling schedule starting from today
- Visual representation of all slots
- Timezone conversion (UTC to local)
- Today highlighting

**Slot Management**:

- Confirm available slots
- Delete booked slots (multiple options)
- Remove available slots
- Add new teacher schedules
- Schedule extra classes

**Conflict Prevention**:

- Visual marking of booked slots
- Automatic filtering of available times
- End time validation
- Overlap prevention

---

### 3. Smart Teacher Schedule Creation

**Intelligent Time Selection**:

- Shows only available time slots
- Marks booked slots
- Filters end times based on next booking
- Midnight crossing support

**Auto-Categorization**:

- Automatic slot category assignment
- Based on time of day
- Simplifies scheduling logic

---

### 4. Flexible Slot Deletion

**Three Deletion Options**:

1. **Single Day**: Cancel one occurrence
2. **Week**: Cancel entire week
3. **Permanent**: Remove schedule completely

**Use Cases**:

- Temporary cancellations (vacation)
- Weekly recurring cancellations
- Complete schedule removal

---

### 5. Session History Tracking

**Comprehensive Session Data**:

- All past sessions for enrollment
- Multiple duration metrics
- Conclusion type tracking
- Student attendance records

**Analytics Value**:

- Track completed sessions
- Monitor attendance patterns
- Calculate total hours
- Assess engagement

---

### 6. Real-Time Data Management

**React Query Integration**:

- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

**Data Refresh**:

- Auto-refresh after mutations
- Stale time: 5 minutes
- Retry logic on failures
- Loading states

---

### 7. Reschedule Request System

**Functionality**:

- Tracks cancelled classes
- Shows "Cancelled" label on slots
- Supports extra class scheduling
- Maintains schedule history

**Integration**:

- Links to class schedules
- Filters by enrollment ID
- Date-based matching
- Status tracking

---

### 8. Timezone Handling

**Automatic Conversion**:

- Database stores UTC
- Display shows local time
- Moment.js handles conversion
- Day-of-week adjustment

**Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white;  padding: 10px; border-radius: 8px;">
// Stored: "14:00:00" UTC (Wednesday)
// Displayed: "06:00 PM" Local (GMT+4) (Wednesday)
// If conversion changes day, automatically adjusts to Thursday
</pre>

---

### 9. Mobile Responsiveness

**Responsive Design**:

- Works on mobile devices
- Touch-friendly interactions
- Scrollable schedule grid
- Adaptive layouts

---

### 10. Error Handling

**Comprehensive Error States**:

- API errors with toast notifications
- Loading states for all operations
- Empty states for no data
- Retry logic on failures

**User Feedback**:

- Success toasts for all operations
- Clear error messages
- Loading indicators
- Confirmation dialogs

---

### 11. Access Control

**Permission-Based Features**:

- Edit/Delete only for admin roles
- View-only for teacher/student
- Role-based action visibility
- Protected API endpoints

---

### 12. Data Integrity

**Validation**:

- Schedule conflict prevention
- Required field checking
- Time range validation
- Enrollment status verification

**Consistency**:

- Synchronized with enrollments list
- Linked to sessions data
- Connected to reschedule requests
- Maintains referential integrity

---

## Related Documentation

- [Enrollments Module](../enrollments/ENROLLMENTS.md) - Enrollments list and management
- [Sessions Module](../sessions/SESSIONS.md) - Detailed session information
- [Class Schedule Module](../class-schedule/CLASS_SCHEDULE.md) - Schedule management system

---

## File Reference

**Main Screen**: `src/screens/enrollment-details/enrollment-details.tsx`
**Tab Components**: `src/screens/enrollment-details/tabs-view/`
**API Service**: `src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.ts`
**Type Definitions**: `src/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.types.ts`
**Route**: `src/app/(protected)/[role]/enrollment-details/[id]/page.tsx`

---

**Last Updated**: 2025-12-03
**Version**: 1.0.0
**Maintained By**: Development Team
