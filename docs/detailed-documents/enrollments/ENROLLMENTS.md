# Enrollments Module Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Modal Components & Fields](#modal-components--fields)
5. [Enrollment Flow](#enrollment-flow)
6. [Data Types & Interfaces](#data-types--interfaces)
7. [Navigation](#navigation)
8. [Key Features](#key-features)

---

## Overview

The Enrollments module is a core feature of the Tuitional LMS that manages the relationship between students, teachers, and academic subjects. It provides comprehensive functionality for creating, editing, pausing, deleting, and monitoring enrollments across the platform.

**Main Route**: `/{role}/enrollments`

**Supported Roles**: superAdmin, admin, counsellor, hr, teacher, student, parent

---

## Architecture

### Directory Structure

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
src/
├── screens/
│   └── enrollments/
│       ├── enrollments.tsx                    # Main enrollment screen
│       ├── enrollments.module.css
│       └── enrollment-form-types.ts           # Type definitions for screen state
├── components/ui/superAdmin/enrollment/
│   ├── enrollment-table/                      # Desktop table view
│   ├── mobileView-card/                       # Mobile card view
│   ├── add-modal/                             # Create enrollment modal
│   ├── edit-enrollment-modal/                 # Edit enrollment modal
│   ├── delete-modal/                          # Delete confirmation modal
│   ├── enrollment-pause-modal/                # Pause/unpause modal
│   └── instantClass-modal/                    # Instant class creation modal
├── services/dashboard/superAdmin/enrollments/
│   └── enrollments.ts                         # Service functions for API calls
├── api/
│   └── enrollment.api.ts                      # API endpoint URL builders
└── types/enrollment/
    └── getAllEnrollments.types.ts             # TypeScript type definitions
</pre>

### State Management

- **React Query**: Server state management with automatic caching
- **Local State**: Modal states, filters, pagination using React hooks
- **Redux Store**: Global resources (subjects, boards, curricula, grades, users)

---

## API Endpoints

### Base URL

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
${BASE_URL}/api/enrollment
</pre>

### 1. Get All Enrollments

**Endpoint**: `GET /api/enrollment/getAllEnrollment`

**Service Function**: `getAllEnrollments(options, config)`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Search by enrollment name |
| `startDate` | string | No | Filter by start date (YYYY-MM-DD) |
| `endDate` | string | No | Filter by end date (YYYY-MM-DD) |
| `limit` | number | No | Number of records per page (default: 50) |
| `page` | number | No | Current page number (default: 1) |
| `subjectId` | string | No | Filter by subject ID (comma-separated for multiple) |
| `curriculumId` | string | No | Filter by curriculum ID (comma-separated) |
| `boardId` | string | No | Filter by board ID (comma-separated) |
| `gradeId` | string | No | Filter by grade ID (comma-separated) |
| `teacher_id` | string | No | Filter by teacher ID (comma-separated) |
| `student_id` | string | No | Filter by student ID (comma-separated) |
| `enrollment_id` | string | No | Search by specific enrollment ID |
| `childrens` | string | No | Filter by children IDs (for parent role) |
| `on_break` | boolean | No | Filter by break status (true/false) |
| `is_permanent` | boolean | No | Filter by permanent pause status (true/false) |

**Response**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
{
  data: [
    {
      id: number;
      status: number;
      hourly_rate: number;
      request_rate: number;
      tutor_hourly_rate: number;
      group_id: string;
      createdAt: string;
      google_chat_space_id: string;
      google_chat_space_name: string;
      tutor: {
        name: string;
        id: number;
        email: string;
        profileImageUrl: string;
        country_code: string | null;
      };
      subject: { id: number; name: string; } | null;
      curriculum: { id: number; name: string; } | null;
      board: { id: number; name: string; } | null;
      grade: { id: number; name: string; } | null;
      students: [
        {
          name: string;
          id: number;
          email: string;
          profileImageUrl: string;
          country_code: string;
        }
      ];
      studentsGroups: any[];
    }
  ];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}
</pre>

**Location**: `src/api/enrollment.api.ts:3-26`

---

### 2. Get Enrollments Data for Excel Export

**Endpoint**: `GET /api/enrollment/getEnrollmentData`

**Service Function**: `getAllEnrollmentsExcelData(options, config)`

**Query Parameters**: Same as Get All Enrollments

**Purpose**: Exports enrollment data for Excel reports

**Location**: `src/api/enrollment.api.ts:28-46`

---

### 3. Create Enrollment

**Endpoint**: `POST /api/enrollment`

**Service Function**: `addEnrollment(payload, config)`

**Request Payload**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
{
  tutor_id: number;              // Required: Teacher ID
  subject_id: number;            // Required: Subject ID
  on_break: boolean;             // Default: false
  hourly_rate: number;           // Required: Session hourly rate
  request_rate: number;          // Default: "0"
  tutor_hourly_rate: number;     // Required: Tutor's hourly rate
  curriculum_id: number;         // Required: Curriculum ID
  grade_id: number;              // Required: Grade ID
  board_id: number;              // Required: Board ID
  student_ids: number[];         // Required: Array of student IDs
  lead_generator?: string;       // Optional: Lead generator name
  priority?: string;             // Optional: "Low" | "Moderate" | "High"
}
</pre>

**Response**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
{
  enroll?: {
    id: number;
    tutor_id: number;
    group_id: string;
    status: boolean;
    subject_id: number;
    hourly_rate: number;
    request_rate: number;
    tutor_hourly_rate: number;
    on_break: boolean;
    board_id: number;
    curriculum_id: number;
    grade_id: number;
    name: string;
    updatedAt: string;
    createdAt: string;
  };
  group?: [
    {
      id: number;
      group_id: string;
      student_id: number;
      createdAt: string;
      updatedAt: string;
    }
  ];
  error?: string;
}
</pre>

**Location**: `src/api/enrollment.api.ts:48`

---

### 4. Edit Enrollment

**Endpoint**: `PUT /api/enrollment/{id}`

**Service Function**: `editEnrollmentByGroupId(id, payload, config)`

**Request Payload**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
{
  tutor_id: number;
  status: boolean;
  subject_id: number;
  curriculum_id: number;
  grade_id: number;
  board_id: number;
  request_rate: string;
  hourly_rate: number;
  tutor_hourly_rate: number;
  student_ids: number[] | null;       // New students to add
  students_to_remove: number[];       // Students to remove
  lead_generator?: string;
  priority?: string;
}
</pre>

**Location**: `src/api/enrollment.api.ts:57-58`

---

### 5. Delete Enrollment

**Endpoint**: `DELETE /api/enrollment/{id}`

**Service Function**: `deleteEnrollment(payload, config)`

**Request**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
{
  id: string;
}
</pre>

**Purpose**: Permanently deletes an enrollment record

**Location**: `src/api/enrollment.api.ts:49-50`

---

### 6. Change Enrollment Break Status (New)

**Endpoint**: `PUT /api/enrollment/{id}/break-new`

**Service Function**: `changeBreakStatus(payload, config)`

**Request Payload**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
{
  id: number | null;              // Enrollment ID
  on_break?: boolean | null;      // New break status
  is_permanent?: boolean;         // Permanent or temporary pause
  pause_ends_at?: string;         // End date for temporary pause (YYYY-MM-DD)
  pause_starts_at?: string;       // Start date for temporary pause (YYYY-MM-DD)
  user_id?: number;               // User who initiated the pause
  reason_ids?: number[];          // IDs of churn reasons (for permanent pause)
  answers?: [                     // Answers to churn questions
    {
      question_id: number;
      answer: string;
    }
  ];
  additional_notes?: string;
  additional_feedback?: string;
}
</pre>

**Response**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
{
  message: string;
  enrollment: {
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
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    enrollment_id: number | null;
  }
}
</pre>

**Location**: `src/api/enrollment.api.ts:53-54`

---

### 7. Change Enrollment Break Status (Old/Legacy)

**Endpoint**: `PUT /api/enrollment/{id}/on-break`

**Service Function**: `changeBreakStatusOld(id, payload, config)`

**Purpose**: Legacy endpoint for changing break status

**Location**: `src/api/enrollment.api.ts:51-52`

---

### 8. Get Enrollment By Group ID

**Endpoint**: `GET /api/enrollment/getEnrollmentByIdGrouped/{id}`

**Service Function**: `getEnrollmentByGroupId(id, config)`

**Purpose**: Fetches detailed enrollment information including class schedules

**Response**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
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
  classSchedules: [
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

**Location**: `src/api/enrollment.api.ts:55-56`

---

## Modal Components & Fields

### 1. Add Enrollment Modal

**Component**: `AddModal`

**Location**: `src/components/ui/superAdmin/enrollment/add-modal/add-Modal.tsx`

**Purpose**: Create a new enrollment

**Fields**:

| Field               | Type           | Required | Validation             | Description                                    |
| ------------------- | -------------- | -------- | ---------------------- | ---------------------------------------------- |
| Teacher             | Dropdown       | Yes      | Must select teacher    | Select teacher from list of available teachers |
| Students            | Multi-Select   | No       | -                      | Select one or multiple students (can be empty) |
| Subject             | Dropdown       | Yes      | Must select subject    | Academic subject for enrollment                |
| Grade               | Dropdown       | Yes      | Must select grade      | Student's grade level                          |
| Board               | Dropdown       | Yes      | Must select board      | Education board (e.g., CBSE, ICSE)             |
| Curriculum          | Dropdown       | Yes      | Must select curriculum | Academic curriculum                            |
| Session Hourly Rate | Input (number) | Yes      | Must be > 0            | Rate charged per hour for sessions             |
| Tutor Hourly Rate   | Input (number) | Yes      | Must be > 0            | Rate paid to tutor per hour                    |
| Lead Generator      | Input (text)   | No       | -                      | Name of person who generated the lead          |
| Priority            | Dropdown       | No       | -                      | Options: "Low", "Moderate", "High"             |

**Form Submission**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
{
  tutor_id: number;
  subject_id: number;
  on_break: false;
  hourly_rate: number;
  request_rate: "0";
  tutor_hourly_rate: number;
  curriculum_id: number;
  grade_id: number;
  board_id: number;
  student_ids: number[];
  lead_generator: string;
  priority: string;
}
</pre>

**User Experience**:

- All dropdowns are searchable
- Multi-select for students allows selecting multiple students
- Form validates all required fields before submission
- Success state resets the form
- Loading state disables the submit button

---

### 2. Edit Enrollment Modal

**Component**: `EditEnrollmentModal`

**Location**: `src/components/ui/superAdmin/enrollment/edit-enrollment-modal/edit-enrollment-modal.tsx`

**Purpose**: Edit existing enrollment details

**Fields**: Same as Add Modal with additional functionality:

- Pre-populated with existing enrollment data
- Can add new students to enrollment
- Can remove existing students from enrollment
- Tracks `students_to_remove` array for deleted students

**Form Submission**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
{
  tutor_id: number;
  status: true;
  subject_id: number;
  curriculum_id: number;
  grade_id: number;
  board_id: number;
  request_rate: "0";
  hourly_rate: number;
  tutor_hourly_rate: number;
  student_ids: number[] | null;
  students_to_remove: number[];
  lead_generator: string;
  priority: string;
}
</pre>

**User Experience**:

- Shows current enrollment data on open
- Dropdown displays current selected values
- Student multi-select shows currently enrolled students
- Removing a student adds them to `students_to_remove` array

---

### 3. Enrollment Pause Modal

**Component**: `EnrollmentPauseModal`

**Location**: `src/components/ui/superAdmin/enrollment/enrollment-pause-modal/enrollment-pause-modal.tsx`

**Purpose**: Pause or unpause enrollment temporarily or permanently

**Pause Types**:

#### A. Temporary Pause

**Fields**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Pause Temporarily | Checkbox | Yes | Must be checked for temporary pause |
| Start Date | Date Picker | Yes | Must be today or after |
| End Date | Date Picker | Yes | Must be after start date |

**Use Case**: Short-term breaks (vacations, exams, etc.)

#### B. Permanent Pause

**Fields**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Pause Permanently | Checkbox | Yes | Must be checked for permanent pause |
| Reasons | Multi-Select Dropdown | Yes | Must select at least one reason |
| Questions | Dynamic Question List | Yes | All questions must be answered |

**Churn Questions**:

- Fetched dynamically from API using React Query
- First question expects a numeric answer
- Remaining questions accept text answers
- Questions displayed as `InputField` (first) and `TextBox` (rest)

**Churn Reasons**:

- Fetched from `/api/churn-resources/reasons`
- Multi-select dropdown allows selecting multiple reasons

**Form Submission**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
{
  id: number | null;
  on_break: boolean;          // Toggles current status
  is_permanent: boolean;      // true for permanent, false for temporary

  // Only for temporary pause:
  pause_starts_at?: string;   // "YYYY-MM-DD"
  pause_ends_at?: string;     // "YYYY-MM-DD"

  // Only for permanent pause:
  reason_ids?: number[];
  answers?: [
    {
      question_id: number;
      answer: string;
    }
  ];
  user_id?: number;
}
</pre>

**User Experience**:

- Mutually exclusive checkboxes (temporary or permanent)
- Shows relevant fields based on pause type
- Validates dates for temporary pause
- Validates reasons and questions for permanent pause
- Can unpause by clicking the same modal (shows "Unpause" button)
- State resets when modal closes

**Special Features**:

- Integrates with churn management system
- Tracks who initiated the pause
- Validates first question answer is numeric
- Loading states for fetching churn data

---

### 4. Delete Enrollment Modal

**Component**: `DeleteModal`

**Location**: `src/components/ui/superAdmin/enrollment/delete-modal/delete-modal.tsx`

**Purpose**: Confirm deletion of enrollment

**Fields**: None (Confirmation dialog only)

**Dialog Content**:

- Heading: "Are You Sure?"
- Subheading: "Are you sure you want to delete this enrollment? This action is permanent."
- Buttons: "Cancel" and "Delete"

**User Experience**:

- Simple confirmation dialog
- Warning about permanent action
- Loading state on delete button
- Closes on successful deletion

---

### 5. Instant Class Modal

**Component**: `InstantClassModal`

**Location**: `src/components/ui/superAdmin/enrollment/instantClass-modal/instantClass-modal.tsx`

**Purpose**: Create an instant class session for an enrollment

**Fields**:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Duration | Input (number) | Yes | Must be > 0, numeric |

**Form Submission**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
{
  duration: number;        // Duration in minutes
  enrollment_id: number;   // Passed from parent component
  isBypass?: boolean;      // Used when overriding conflicts
}
</pre>

**Conflict Handling**:

- If class time conflicts with existing schedule, shows conflict details
- Displays conflicting class name, start time, and end time
- Allows manual override with "Start Class Anyway" option
- Creates `ManualClassModal` for conflict resolution

**User Experience**:

- Simple single-field form
- Real-time validation of numeric input
- Shows error for invalid duration
- Resets on success or modal close
- Integrates with conflict detection system

---

## Enrollment Flow

Flowchart Link: https://tinyurl.com/5fchk59s

### Flowchart

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
flowchart TD
    Start([User Opens Enrollments Page]) --> CheckRole{Check User Role}

    CheckRole -->|superAdmin/admin/counsellor/hr| ShowFullFeatures[Show Full Enrollment Management]
    CheckRole -->|teacher| ShowTeacherView[Show Teacher's Enrollments Only]
    CheckRole -->|student| ShowStudentView[Show Student's Enrollments Only]
    CheckRole -->|parent| ShowParentView[Show Children's Enrollments]

    ShowFullFeatures --> LoadEnrollments[Load Enrollments with Filters]
    ShowTeacherView --> LoadEnrollments
    ShowStudentView --> LoadEnrollments
    ShowParentView --> LoadEnrollments

    LoadEnrollments --> DisplayOptions{Display Format}

    DisplayOptions -->|Desktop| ShowTable[Display Enrollment Table]
    DisplayOptions -->|Mobile| ShowCards[Display Mobile Cards]

    ShowTable --> UserActions{User Action?}
    ShowCards --> UserActions

    %% ADD ENROLLMENT FLOW
    UserActions -->|Click 'New Enrollment'| OpenAddModal[Open Add Enrollment Modal]
    OpenAddModal --> FillAddForm[Fill Enrollment Form]
    FillAddForm --> ValidateAddForm{Form Valid?}
    ValidateAddForm -->|No| ShowAddError[Show Validation Error]
    ShowAddError --> FillAddForm
    ValidateAddForm -->|Yes| SubmitAdd[Submit Create Request]
    SubmitAdd --> AddSuccess{Success?}
    AddSuccess -->|No| ShowAddApiError[Show API Error]
    ShowAddApiError --> FillAddForm
    AddSuccess -->|Yes| RefreshList1[Refresh Enrollment List]
    RefreshList1 --> ShowSuccessToast1[Show Success Message]
    ShowSuccessToast1 --> UserActions

    %% EDIT ENROLLMENT FLOW
    UserActions -->|Click Edit Icon| OpenEditModal[Open Edit Modal]
    OpenEditModal --> LoadEnrollmentData[Load Current Enrollment Data]
    LoadEnrollmentData --> FillEditForm[Pre-fill Form with Data]
    FillEditForm --> ModifyFields[Modify Fields]
    ModifyFields --> ValidateEditForm{Form Valid?}
    ValidateEditForm -->|No| ShowEditError[Show Validation Error]
    ShowEditError --> ModifyFields
    ValidateEditForm -->|Yes| SubmitEdit[Submit Edit Request]
    SubmitEdit --> EditSuccess{Success?}
    EditSuccess -->|No| ShowEditApiError[Show API Error]
    ShowEditApiError --> ModifyFields
    EditSuccess -->|Yes| RefreshList2[Refresh Enrollment List]
    RefreshList2 --> ShowSuccessToast2[Show Success Message]
    ShowSuccessToast2 --> UserActions

    %% PAUSE/UNPAUSE ENROLLMENT FLOW
    UserActions -->|Toggle Break Switch| OpenPauseModal[Open Pause Modal]
    OpenPauseModal --> CheckCurrentStatus{Currently On Break?}

    CheckCurrentStatus -->|Yes| ShowUnpause[Show Unpause Option]
    ShowUnpause --> ConfirmUnpause{Confirm Unpause?}
    ConfirmUnpause -->|No| UserActions
    ConfirmUnpause -->|Yes| SubmitUnpause[Submit Unpause Request]
    SubmitUnpause --> UnpauseSuccess{Success?}
    UnpauseSuccess -->|No| ShowUnpauseError[Show Error]
    ShowUnpauseError --> UserActions
    UnpauseSuccess -->|Yes| RefreshList3[Refresh Enrollment List]
    RefreshList3 --> ShowSuccessToast3[Show Success Message]
    ShowSuccessToast3 --> UserActions

    CheckCurrentStatus -->|No| SelectPauseType{Select Pause Type}

    SelectPauseType -->|Temporary| ShowDatePickers[Show Start & End Date]
    ShowDatePickers --> EnterDates[Enter Pause Dates]
    EnterDates --> ValidateDates{Dates Valid?}
    ValidateDates -->|No| ShowDateError[Show Date Validation Error]
    ShowDateError --> EnterDates
    ValidateDates -->|Yes| SubmitTempPause[Submit Temporary Pause]
    SubmitTempPause --> TempPauseSuccess{Success?}
    TempPauseSuccess -->|No| ShowTempPauseError[Show API Error]
    ShowTempPauseError --> UserActions
    TempPauseSuccess -->|Yes| RefreshList4[Refresh Enrollment List]
    RefreshList4 --> ShowSuccessToast4[Show Success Message]
    ShowSuccessToast4 --> UserActions

    SelectPauseType -->|Permanent| ShowChurnForm[Show Churn Reasons & Questions]
    ShowChurnForm --> SelectReasons[Select Churn Reasons]
    SelectReasons --> AnswerQuestions[Answer All Questions]
    AnswerQuestions --> ValidateChurnForm{All Required Fields?}
    ValidateChurnForm -->|No| ShowChurnError[Show Validation Error]
    ShowChurnError --> AnswerQuestions
    ValidateChurnForm -->|Yes| SubmitPermPause[Submit Permanent Pause]
    SubmitPermPause --> PermPauseSuccess{Success?}
    PermPauseSuccess -->|No| ShowPermPauseError[Show API Error]
    ShowPermPauseError --> UserActions
    PermPauseSuccess -->|Yes| RefreshList5[Refresh Enrollment List]
    RefreshList5 --> ShowSuccessToast5[Show Success Message]
    ShowSuccessToast5 --> UserActions

    %% DELETE ENROLLMENT FLOW
    UserActions -->|Click Delete Icon| OpenDeleteModal[Open Delete Confirmation Modal]
    OpenDeleteModal --> ConfirmDelete{Confirm Delete?}
    ConfirmDelete -->|No| UserActions
    ConfirmDelete -->|Yes| SubmitDelete[Submit Delete Request]
    SubmitDelete --> DeleteSuccess{Success?}
    DeleteSuccess -->|No| ShowDeleteError[Show API Error]
    ShowDeleteError --> UserActions
    DeleteSuccess -->|Yes| RefreshList6[Refresh Enrollment List]
    RefreshList6 --> ShowSuccessToast6[Show Success Message]
    ShowSuccessToast6 --> UserActions

    %% INSTANT CLASS FLOW
    UserActions -->|Click Instant Class Icon| OpenInstantModal[Open Instant Class Modal]
    OpenInstantModal --> EnterDuration[Enter Class Duration]
    EnterDuration --> ValidateDuration{Duration Valid?}
    ValidateDuration -->|No| ShowDurationError[Show Validation Error]
    ShowDurationError --> EnterDuration
    ValidateDuration -->|Yes| SubmitInstantClass[Submit Instant Class Request]
    SubmitInstantClass --> CheckConflict{Time Conflict?}
    CheckConflict -->|Yes| ShowConflictModal[Show Conflict Details]
    ShowConflictModal --> OverrideChoice{Override Conflict?}
    OverrideChoice -->|No| UserActions
    OverrideChoice -->|Yes| BypassConflict[Submit with Bypass Flag]
    BypassConflict --> CreateInstantClass[Create Instant Class]
    CheckConflict -->|No| CreateInstantClass
    CreateInstantClass --> InstantSuccess{Success?}
    InstantSuccess -->|No| ShowInstantError[Show API Error]
    ShowInstantError --> UserActions
    InstantSuccess -->|Yes| ShowInstantToast[Show Success Message]
    ShowInstantToast --> UserActions

    %% FILTER ENROLLMENTS FLOW
    UserActions -->|Apply Filters| UpdateFilters[Update Filter State]
    UpdateFilters --> ApplyFilterType{Filter Type?}
    ApplyFilterType -->|Date Range| FilterByDate[Filter by Start/End Date]
    ApplyFilterType -->|Teacher| FilterByTeacher[Filter by Teacher ID]
    ApplyFilterType -->|Student| FilterByStudent[Filter by Student ID]
    ApplyFilterType -->|Subject| FilterBySubject[Filter by Subject]
    ApplyFilterType -->|Board| FilterByBoard[Filter by Board]
    ApplyFilterType -->|Grade| FilterByGrade[Filter by Grade]
    ApplyFilterType -->|Curriculum| FilterByCurriculum[Filter by Curriculum]
    ApplyFilterType -->|Status| FilterByStatus[Filter by Break Status]
    ApplyFilterType -->|Search| SearchById[Search by Enrollment ID]

    FilterByDate --> RefetchData[Refetch Enrollment Data]
    FilterByTeacher --> RefetchData
    FilterByStudent --> RefetchData
    FilterBySubject --> RefetchData
    FilterByBoard --> RefetchData
    FilterByGrade --> RefetchData
    FilterByCurriculum --> RefetchData
    FilterByStatus --> RefetchData
    SearchById --> RefetchData

    RefetchData --> LoadEnrollments

    %% EXPORT TO EXCEL FLOW
    UserActions -->|Click 'Get Enrollments Data'| TriggerExport[Trigger Excel Export]
    TriggerExport --> ExportLoading[Show Loading State]
    ExportLoading --> FetchExcelData[Fetch Data with Current Filters]
    FetchExcelData --> ExportSuccess{Success?}
    ExportSuccess -->|No| ShowExportError[Show Export Error]
    ShowExportError --> UserActions
    ExportSuccess -->|Yes| DownloadExcel[Download Excel File]
    DownloadExcel --> ShowExportToast[Show Success Toast]
    ShowExportToast --> UserActions

    %% PAGINATION FLOW
    UserActions -->|Change Page| UpdatePage[Update Current Page]
    UpdatePage --> LoadEnrollments

    UserActions -->|Change Rows Per Page| UpdateRowsPerPage[Update Rows Per Page]
    UpdateRowsPerPage --> ResetToPage1[Reset to Page 1]
    ResetToPage1 --> LoadEnrollments

    %% NAVIGATION TO ENROLLMENT DETAILS
    UserActions -->|Click Enrollment Row| CheckClickable{Role Allowed?}
    CheckClickable -->|superAdmin/admin/counsellor| CheckKeyPressed{Ctrl/Cmd Pressed?}
    CheckKeyPressed -->|Yes| OpenNewTab[Open Details in New Tab]
    CheckKeyPressed -->|No| NavigateToDetails[Navigate to Enrollment Details]
    CheckClickable -->|Other Roles| NoAction[No Action]

    NavigateToDetails --> EnrollmentDetailsPage[Show Enrollment Details Page]
    OpenNewTab --> EnrollmentDetailsPage
    NoAction --> UserActions

    EnrollmentDetailsPage -.->|See Enrollment Details Documentation| DetailsDoc[Enrollment Details Module]

    style Start fill:#e1f5ff
    style EnrollmentDetailsPage fill:#fff4e1
    style DetailsDoc fill:#ffe1e1
</pre>

### Flow Description

#### 1. Initial Page Load

- User navigates to `/{role}/enrollments`
- System checks user role and applies appropriate filters
- Enrollments are fetched with role-based parameters
- Data is displayed in table (desktop) or card (mobile) format

#### 2. Creating New Enrollment

1. User clicks "New Enrollment" button (admin roles only)
2. Add Enrollment Modal opens
3. User fills in required fields (teacher, subject, board, curriculum, grade, rates)
4. Optionally selects students and sets priority/lead generator
5. Form validates all required fields
6. On success, enrollment is created and list refreshes

#### 3. Editing Enrollment

1. User clicks edit icon on enrollment row
2. Edit Modal opens with pre-populated data
3. User modifies fields as needed
4. Can add/remove students
5. Form validates and submits changes
6. List refreshes on success

#### 4. Pausing/Unpausing Enrollment

1. User toggles break switch on enrollment
2. Pause Modal opens
3. **If Currently Paused**: Shows unpause confirmation
4. **If Not Paused**: User selects pause type
   - **Temporary**: Select start and end dates
   - **Permanent**: Select churn reasons and answer questions
5. Form validates based on pause type
6. Submits pause/unpause request
7. List refreshes on success

#### 5. Deleting Enrollment

1. User clicks delete icon
2. Confirmation modal appears
3. User confirms deletion
4. Enrollment is permanently deleted
5. List refreshes on success

#### 6. Creating Instant Class

1. User clicks instant class icon
2. Instant Class Modal opens
3. User enters duration in minutes
4. System checks for scheduling conflicts
5. **If Conflict**: Shows conflict details with override option
6. **If No Conflict**: Creates class immediately
7. Success message shown

#### 7. Filtering & Searching

- Users can apply multiple filters simultaneously
- Filters include: date range, teacher, student, subject, board, grade, curriculum, status
- Search by enrollment ID
- Pagination resets to page 1 when filters change
- React Query caches filtered results

#### 8. Navigation to Enrollment Details

- Users with appropriate roles can click on enrollment rows
- Ctrl/Cmd + Click opens details in new tab
- Regular click navigates to `/{role}/enrollment-details/{id}`
- See separate "Enrollment Details" documentation for that flow

---

## Data Types & Interfaces

### Frontend State Types

**Location**: `src/screens/enrollments/enrollment-form-types.ts`

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
// Modal State Management
export type ModalState = {
  add: boolean;
  edit: boolean;
  delete: boolean;
  pause: {
    open: boolean;
    id: number | null;
    name: string;
    on_break: boolean | null;
    is_permanent: null | false | true;
  };
  manualClass: {
    open: boolean;
    enrollment_id: number | null;
    duration: number | null;
    startTime?: string | null;
    endTime?: string | null;
    name?: string | null;
  };
  instantClass: {
    open: boolean;
    enrollment_id: number | null;
  };
};

// Filter State Management
export type FilterState = {
  currentPage: number;
  rowsPerPage: number;
  dateFilter: string | [string, string] | null;
  selectedTeacher: string;
  selectedStudent: string;
  enrollmentSearch: string;
  on_break: string;
};

// Enrollment Item Type
export type EnrollmentItem = {
  id: number | string;
  [key: string]: any;
};
</pre>

### API Type Definitions

**Location**: `src/types/enrollment/getAllEnrollments.types.ts`

See [API Endpoints](#api-endpoints) section for detailed type definitions of all API requests and responses.

---

## Navigation

### Routes

**Main Enrollment Page**:

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
/{role}/enrollments
</pre>

**Enrollment Details Page** (see separate documentation):

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
/{role}/enrollment-details/{id}
</pre>

### Navigation Logic

**Location**: `src/components/ui/superAdmin/enrollment/enrollment-table/enrollment-table.tsx:142-150`

<pre style="color:rgba(0, 0, 0, 1) ; background-color: white; padding: 10px; border-radius: 8px;">
const handleRoute = (id: number, event: React.MouseEvent) => {
  if (!isRowClickable) return;

  const targetPath = `/${role}/enrollment-details/${id}`;

  if (event.ctrlKey || event.metaKey) {
    window.open(targetPath, "_blank");
  } else {
    router.push(targetPath);
  }
};
</pre>

**Role-Based Access**:

- **Clickable Rows**: superAdmin, admin, counsellor
- **View Only**: teacher, student, parent, hr

**User Experience**:

- Click on enrollment row to view details
- Ctrl/Cmd + Click to open in new tab
- Cursor changes to pointer for clickable rows
- Non-clickable rows have default cursor

---

## Key Features

### 1. Role-Based Access Control

**Admin Roles** (superAdmin, admin, counsellor, hr):

- Create, edit, delete enrollments
- Pause/unpause enrollments
- Create instant classes
- View all enrollments
- Export to Excel
- Filter by all criteria

**Teacher Role**:

- View only their own enrollments
- Cannot modify enrollments
- Can view enrollment details

**Student Role**:

- View only their own enrollments
- Cannot modify enrollments
- Can view enrollment details

**Parent Role**:

- View enrollments of their children
- Cannot modify enrollments

### 2. Real-time Data Management

- **React Query**: Automatic caching and background updates
- **Optimistic Updates**: Instant UI feedback
- **Query Invalidation**: Automatic refresh after mutations
- **Error Handling**: Comprehensive error messages with toast notifications

### 3. Advanced Filtering

**Available Filters**:

- Date range (start date and end date)
- Teacher (multi-select)
- Student (multi-select)
- Subject (multi-select)
- Board (multi-select)
- Grade (multi-select)
- Curriculum (multi-select)
- Break status (paused, unpaused, temporary pause, permanent pause)
- Search by enrollment ID (with debounce)

**Filter Behavior**:

- Filters are cumulative (AND logic)
- Pagination resets when filters change
- Filter state persisted in URL query parameters
- Debounced search for enrollment ID (1500ms)

### 4. Responsive Design

- **Desktop**: Table view with sortable columns
- **Mobile**: Card view with swipeable actions
- **Breakpoint**: 1220px
- **Filter Toggle**: Mobile filter button shows/hides filters

### 5. Pagination

- Default: 50 rows per page
- Options: 10, 25, 50, 100
- Server-side pagination
- Total count displayed
- Page navigation with first/last page buttons

### 6. Excel Export

**Feature**: Export enrollments data
**Button**: "Get Enrollments Data"
**Endpoint**: `/api/enrollment/getEnrollmentData`
**Data**: Exports data with current filter state applied
**Format**: Excel-compatible format

### 7. Instant Class Creation

**Feature**: Create instant/emergency classes
**Conflict Detection**: Checks for scheduling conflicts
**Manual Override**: Allows bypassing conflicts with confirmation
**Duration Input**: Accepts duration in minutes
**Use Case**: Emergency tutoring sessions

### 8. Enrollment Pause Management

**Temporary Pause**:

- Set start and end dates
- Automatically resumes after end date
- Use case: Vacations, exams, short breaks

**Permanent Pause**:

- Requires churn reasons
- Requires answering churn questions
- Tracks who initiated the pause
- Integrates with churn management system

**Unpause**:

- Single-click to resume enrollment
- Works for both temporary and permanent pauses

### 9. Data Persistence

**Redux Persist**:

- User state
- Resources (subjects, boards, curricula, grades)
- Filter preferences

**React Query Cache**:

- Enrollment data
- Stale time: 5 minutes
- Background refetch on window focus

### 10. Error Handling

**API Errors**:

- Toast notifications for all errors
- Specific error messages from backend
- Fallback generic error messages

**Form Validation**:

- Client-side validation before submission
- Required field checks
- Numeric validation for rates
- Date validation for pauses

### 11. Loading States

- Skeleton loaders for table rows
- Button loading states during mutations
- Overlay loaders for modal forms
- Global loading box for initial page load

### 12. Success Feedback

- Toast notifications for all successful operations
- Auto-refresh enrollment list after mutations
- Visual feedback (animations, state changes)
- Confirmation messages

---

## Technical Implementation Notes

### Performance Optimizations

1. **Memoization**: All modal props and callbacks are memoized with `useMemo` and `useCallback`
2. **Debounced Search**: Enrollment ID search debounced by 1500ms
3. **Code Splitting**: Modal components loaded on demand
4. **Lazy Loading**: Images and profile pictures lazy loaded

### State Management Strategy

- **Global State**: Redux for user, resources, roles
- **Server State**: React Query for API data
- **Local State**: React hooks for UI state (modals, filters)
- **Form State**: Controlled components with useState

### API Integration

- **Axios**: HTTP client with interceptors
- **Config Pattern**: Token passed via config object
- **Error Type**: Custom `MyAxiosError` type for error handling
- **Base URL**: Environment-based configuration

### Security Considerations

- JWT token authentication
- Role-based access control
- XSS protection with proper encoding
- CSRF protection (handled by backend)

---

## Related Documentation

- [Enrollment Details Module](../enrollment-details/ENROLLMENT_DETAILS.md) - Detailed view, class schedules, sessions
- [Authentication Module](../authentication-module/AUTHENTICATION.md) - User authentication flow
- [Users Module](../users-module/USERS.md) - User management

---

## File Reference

**Main Screen**: `src/screens/enrollments/enrollments.tsx`
**API Service**: `src/services/dashboard/superAdmin/enrollments/enrollments.ts`
**API Endpoints**: `src/api/enrollment.api.ts`
**Type Definitions**: `src/types/enrollment/getAllEnrollments.types.ts`
**Route**: `src/app/(protected)/[role]/enrollments/page.tsx`

---

**Last Updated**: 2025-12-03
**Version**: 1.0.0
**Maintained By**: Development Team
