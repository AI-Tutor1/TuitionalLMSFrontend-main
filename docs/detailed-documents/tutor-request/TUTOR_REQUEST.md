# Tutor Request Module Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Routing](#routing)
4. [Data Flow](#data-flow)
5. [API Integration](#api-integration)
6. [Component Structure](#component-structure)
7. [Filtering System](#filtering-system)
8. [Role-Based Access](#role-based-access)
9. [State Management](#state-management)
10. [UI Components](#ui-components)
11. [Modal Features](#modal-features)
12. [Integration with Other Modules](#integration-with-other-modules)
13. [File References](#file-references)

---

## Overview

The Tutor Request module manages the tutor onboarding process in the Tuitional LMS. It allows administrators to review, filter, and process tutor applications submitted through the tutor registration form. The module provides comprehensive functionality for viewing tutor profiles, scheduling interviews, and approving or rejecting applications.

### Key Features

- **Comprehensive Application Review**: View all tutor onboarding requests with detailed information
- **Advanced Filtering System**: Filter by date, subject, status, and country
- **Real-time Search**: Debounced search by name or email
- **Interview Management**: Generate and send interview links to applicants
- **Approval Workflow**: Approve applications and create teacher accounts automatically
- **Rejection Management**: Reject applications with notification emails
- **Multi-Select Filters**: Filter by multiple subjects, statuses, and countries simultaneously
- **Client-side Pagination**: 10, 15, or 20 requests per page
- **Auto-Refresh**: Automatic data refresh every 30 seconds
- **Responsive Design**: Desktop table view optimized for large datasets

---

## Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Data Fetching**: TanStack Query (React Query) + Axios
- **State Management**: Redux Toolkit with Redux Persist
- **UI Components**: Material-UI (MUI)
- **Styling**: CSS Modules
- **Country Data**: country-state-city library
- **Notifications**: React-Toastify for user feedback

### Directory Structure

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
src/
├── app/(protected)/[role]/
│   └── tutor-requests/
│       └── page.tsx                        # Route component
├── screens/
│   ├── tutor-request/
│   │   ├── tutor-request.tsx              # Main tutor request screen
│   │   └── tutor-request.module.css
│   └── tutor-profile/                      # Tutor profile detail view
│       └── tutor-profile.tsx
├── components/ui/superAdmin/tutorRequest/
│   └── tutorRequest-table/                 # Desktop table view
│       ├── tutorRequest-table.tsx
│       └── tutorRequest-table.module.css
├── services/dashboard/superAdmin/tutor-request/
│   ├── tutor-request.ts                    # Service functions for API calls
│   └── tutor-request.types.ts              # TypeScript type definitions
└── api/
    └── tutors.ts                           # API endpoint URL builders
</pre>

### Component Hierarchy

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
TutorRequest (Main Screen)
├─ MobileFilterButton (Toggle filters on mobile)
├─ FilterByDate (Date range filter)
├─ SearchBox (Search by name/email)
├─ MultiSelectDropDown (Subject filter)
├─ MultiSelectDropDown (Status filter)
├─ MultiSelectDropDown (Country filter)
└─ TutorRequestTable (Desktop table view)
    ├─ Table Header
    ├─ Table Body (Tutor request rows)
    └─ PaginationComponent
</pre>

---

## Routing

### Main Route

**Path**: `/{role}/tutor-requests`

**Access**: superAdmin, admin, counsellor, hr

**Route Component**: `src/app/(protected)/[role]/tutor-requests/page.tsx`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
"use client";
import React, { use } from "react";
import TutorRequest from "@/screens/tutor-request/tutor-request";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise<{ role: string }> }) => {
  const { role } = use(params);
  return <TutorRequest />;
};

export default withAuth(Page);
</pre>

### Navigation Patterns

**From Tutor Request List to Tutor Profile**:

- Click on table row navigates to tutor profile page
- Ctrl/Cmd + Click opens in new tab
- Route: `/{role}/tutor-profile/{id}`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleUser = (id: number, event: React.MouseEvent) => {
  const targetPath = `/${role}/tutor-profile/${id}`;

  if (event.ctrlKey || event.metaKey) {
    window.open(targetPath, "_blank");
  } else {
    router.push(targetPath);
  }
};
</pre>

**Location**: `src/components/ui/superAdmin/tutorRequest/tutorRequest-table/tutorRequest-table.tsx:40-50`

---

## Data Flow

### Flow Chart
Flow Chart Link: https://tinyurl.com/2uh77wav

### Flow Chart Code

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
flowchart TD
    Start([Admin Opens Tutor Requests Page]) --> FetchRequests[Fetch All Tutor Requests]

    FetchRequests --> ParseData[Parse JSON Data for Each Request]

    ParseData --> DisplayTable[Display Tutor Requests Table]

    DisplayTable --> UserActions{User Action?}

    %% APPLY FILTERS FLOW
    UserActions -->|Apply Date Filter| UpdateDateFilter[Update Date Filter State]
    UpdateDateFilter --> RefetchWithDate[Refetch Requests with Date Range]
    RefetchWithDate --> ParseData

    UserActions -->|Search by Name/Email| UpdateSearch[Update Search State]
    UpdateSearch --> DebounceSearch[Debounce Search 1.5s]
    DebounceSearch --> FilterLocal[Filter Locally by Search Term]
    FilterLocal --> UpdateTable[Update Table Display]
    UpdateTable --> UserActions

    UserActions -->|Filter by Subject| UpdateSubject[Update Selected Subjects]
    UpdateSubject --> FilterLocal

    UserActions -->|Filter by Status| UpdateStatus[Update Selected Statuses]
    UpdateStatus --> FilterLocal

    UserActions -->|Filter by Country| UpdateCountry[Update Selected Countries]
    UpdateCountry --> FilterLocal

    %% PAGINATION FLOW
    UserActions -->|Change Page| UpdatePage[Update Current Page]
    UpdatePage --> RecalculatePagination[Recalculate Paginated Data]
    RecalculatePagination --> UpdateTable

    UserActions -->|Change Rows Per Page| UpdateRowsPerPage[Update Rows Per Page]
    UpdateRowsPerPage --> ResetPage[Reset to Page 1]
    ResetPage --> RecalculatePagination

    %% VIEW TUTOR PROFILE FLOW
    UserActions -->|Click on Row| CheckKeyPressed{Ctrl/Cmd Pressed?}
    CheckKeyPressed -->|Yes| OpenNewTab[Open Tutor Profile in New Tab]
    CheckKeyPressed -->|No| NavigateToProfile[Navigate to Tutor Profile]

    NavigateToProfile --> ProfilePage[Tutor Profile Page]
    OpenNewTab --> ProfilePage

    ProfilePage --> ViewDetails[View Tutor Details]
    ViewDetails --> AdminActions{Admin Action?}

    AdminActions -->|Schedule Interview| OpenInterviewModal[Open Interview Scheduling Modal]
    OpenInterviewModal --> EnterInterviewDate[Enter Interview Date/Time]
    EnterInterviewDate --> SubmitInterview[Submit Interview Link Generation]
    SubmitInterview --> InterviewSuccess{Success?}
    InterviewSuccess -->|Yes| SendEmail[Send Interview Link to Tutor]
    SendEmail --> ShowSuccessToast1[Show Success Toast]
    ShowSuccessToast1 --> ProfilePage
    InterviewSuccess -->|No| ShowErrorToast1[Show Error Toast]
    ShowErrorToast1 --> ProfilePage

    AdminActions -->|Approve Request| OpenApprovalModal[Open Approval Confirmation]
    OpenApprovalModal --> ConfirmApproval{Confirm Approval?}
    ConfirmApproval -->|No| ProfilePage
    ConfirmApproval -->|Yes| SubmitApproval[Submit Approval Request]
    SubmitApproval --> ApprovalSuccess{Success?}
    ApprovalSuccess -->|Yes| CreateTeacherAccount[Create Teacher Account]
    CreateTeacherAccount --> SendWelcomeEmail[Send Welcome Email]
    SendWelcomeEmail --> UpdateRequestStatus1[Update Request Status to Approved]
    UpdateRequestStatus1 --> ShowSuccessToast2[Show Success Toast]
    ShowSuccessToast2 --> RefreshRequests[Refresh Requests List]
    RefreshRequests --> DisplayTable
    ApprovalSuccess -->|No| ShowErrorToast2[Show Error Toast]
    ShowErrorToast2 --> ProfilePage

    AdminActions -->|Reject Request| OpenRejectModal[Open Rejection Confirmation]
    OpenRejectModal --> ConfirmReject{Confirm Rejection?}
    ConfirmReject -->|No| ProfilePage
    ConfirmReject -->|Yes| SubmitRejection[Submit Rejection Request]
    SubmitRejection --> RejectSuccess{Success?}
    RejectSuccess -->|Yes| UpdateRequestStatus2[Update Request Status to Rejected]
    UpdateRequestStatus2 --> SendRejectionEmail[Send Rejection Email]
    SendRejectionEmail --> ShowSuccessToast3[Show Success Toast]
    ShowSuccessToast3 --> RefreshRequests
    RejectSuccess -->|No| ShowErrorToast3[Show Error Toast]
    ShowErrorToast3 --> ProfilePage

    %% AUTO-REFRESH FLOW
    DisplayTable --> WaitInterval[Wait 30 Seconds]
    WaitInterval --> AutoRefetch[Auto-Refetch Requests]
    AutoRefetch --> ParseData

    %% MOBILE FILTER TOGGLE
    UserActions -->|Toggle Filters| ToggleFilters[Show/Hide Filter Section]
    ToggleFilters --> UserActions

    style Start fill:#e1f5ff
    style ProfilePage fill:#fff4e1
    style CreateTeacherAccount fill:#A0FFC0
    style SendWelcomeEmail fill:#A0FFC0
</pre>

### High-Level Data Flow

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
User opens tutor requests page
    ↓
Fetch all tutor requests from API
    ↓
Parse JSON data in each request
    ↓
Apply date filter (server-side)
    ↓
Apply client-side filters (search, subject, status, country)
    ↓
Display filtered and paginated data in table
    ↓
User Actions:
  ├─ Apply filters → Refetch or filter locally
  ├─ Search → Debounce and filter locally
  ├─ Change page → Recalculate pagination
  ├─ Click row → Navigate to tutor profile
  └─ View profile → Schedule interview / Approve / Reject
</pre>

---

## API Integration

### Base URL

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
${BASE_URL}/api
</pre>

### 1. Get All Tutor Onboarding Requests

**Endpoint**: `GET /api/getAllTutorOnbordingRequest`

**Service Function**: `getAllRequest(options, config)`

**Location**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.ts:25-29`

**Query Parameters**:

| Parameter   | Type   | Required | Description                       |
| ----------- | ------ | -------- | --------------------------------- |
| `startDate` | string | No       | Filter by start date (YYYY-MM-DD) |
| `endDate`   | string | No       | Filter by end date (YYYY-MM-DD)   |

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
[
  {
    id: number;
    jsonData: string;                    // JSON stringified tutor data
    status: "Pending" | "Approved" | "Rejected";
    createdAt: string;                   // ISO 8601 date
    updatedAt: string;                   // ISO 8601 date
    deletedAt: string | null;
  }
]
</pre>

---

### 2. Get Single Tutor Request

**Endpoint**: `GET /api/getATutorOnbordingRequestWithId/{id}`

**Service Function**: `getSingleRequest(id, config)`

**Location**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.ts:31-32`

**URL Parameters**:

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `id`      | string | Yes      | Tutor request ID |

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  id: number;
  jsonData: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
</pre>

---

### 3. Generate Interview Link

**Endpoint**: `POST /api/generate-interview/{id}`

**Service Function**: `generateInterviewLink(id, config, payload)`

**Location**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.ts:34-45`

**URL Parameters**:

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `id`      | number | Yes      | Tutor request ID |

**Request Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  interviewDate: String;              // Interview date/time
}
</pre>

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  error: String;
  message: String;
}
</pre>

---

### 4. Approve Tutor Request

**Endpoint**: `POST /api/approveRequest`

**Service Function**: `approvedRequest(config, payload)`

**Location**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.ts:47-53`

**Request Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  jsonData: string;                   // Stringified JSON data
  id: number;                         // Tutor request ID
}
</pre>

**Purpose**: Approves a tutor application and creates a teacher account

---

### 5. Get Aligned Interviews

**Endpoint**: `GET /api/interviews/aligned`

**Service Function**: `interviewsAligned(params, config)`

**Location**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.ts:55-63`

**Query Parameters**:

| Parameter   | Type   | Required | Description                       |
| ----------- | ------ | -------- | --------------------------------- |
| `limit`     | number | No       | Number of records per page        |
| `offset`    | number | No       | Pagination offset                 |
| `startDate` | string | No       | Filter by start date (YYYY-MM-DD) |
| `endDate`   | string | No       | Filter by end date (YYYY-MM-DD)   |

**Purpose**: Fetches list of scheduled tutor interviews

---

## Component Structure

### Main Tutor Request Screen

**Component**: `TutorRequest`

**Location**: `src/screens/tutor-request/tutor-request.tsx`

**Responsibilities**:

- Fetch tutor requests with 30-second auto-refresh
- Parse JSON data for each request
- Apply client-side filters (search, subject, status, country)
- Manage pagination state
- Display tutor requests in table format
- Handle navigation to tutor profile

**Key State**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// UI State
const [showFullFilters, setShowFullFilters] = useState<boolean>(false);

// Filter State
const [searchItem, setSearchItem] = useState<string>("");
const [dateFilter, setDateFilter] = useState<any>("");
const [selectedStatuses, setSelectedStatuses] = useState<any[]>([]);
const [selectedCountries, setSelectedCountries] = useState<any[]>([]);
const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);
</pre>

**React Query Hooks**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { data, isLoading, error } = useQuery({
  queryKey: ["tutor-requests", dateFilter],
  queryFn: () => getAllRequest({ startDate, endDate }, { token }),
  enabled: !!token,
  refetchOnWindowFocus: false,
  staleTime: 30000,           // 30 seconds
  refetchInterval: 30000,      // Auto-refresh every 30 seconds
});
</pre>

**Reference**: `src/screens/tutor-request/tutor-request.tsx:81-97`

---

### TutorRequestTable Component

**Component**: `TutorRequestTable`

**Location**: `src/components/ui/superAdmin/tutorRequest/tutorRequest-table/tutorRequest-table.tsx`

**Purpose**: Display tutor requests in desktop table format

**Table Columns**:

| Column        | Description                    | Width |
| ------------- | ------------------------------ | ----- |
| Profile       | Tutor profile image and name   | 15%   |
| Email Address | Tutor email                    | 23%   |
| Country       | Tutor's country                | 15%   |
| Subjects      | List of subjects tutor teaches | 41%   |
| Date          | Request submission date        | 11%   |
| Status        | Application status badge       | 10%   |

**Status Badge Styling**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
"Pending":
  color: "#716E3D"
  backgroundColor: "#FFFAA0"

"Approved":
  color: "#286320"
  backgroundColor: "#A0FFC0"

"Rejected":
  color: "#653838"
  backgroundColor: "#FFACAC"
</pre>

**Location**: `src/components/ui/superAdmin/tutorRequest/tutorRequest-table/tutorRequest-table.tsx:189-210`

**Features**:

- Entire row is clickable
- Ctrl/Cmd + Click opens in new tab
- Cursor changes to pointer on hover
- Provides quick access to detailed tutor profile

---

## Filtering System

### Available Filters

#### 1. Date Range Filter

**Component**: `FilterByDate`

**State**: `dateFilter`

**Type**: Server-side filter

**Format**: `[start_date, end_date]` or `""`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Query Parameters:
  - startDate: dateFilter[0]
  - endDate: dateFilter[1]
</pre>

**Location**: `src/screens/tutor-request/tutor-request.tsx:68-74`

---

#### 2. Search Filter

**Component**: `SearchBox`

**State**: `searchItem`

**Type**: Client-side filter

**Debounce**: 1500ms

**Matching Logic**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const fullName = `${userData.firstName} ${userData.lastName}`.toLowerCase();
const email = userData.email.toLowerCase();
const searchTerm = debouncedSearch.toLowerCase();

return fullName.includes(searchTerm) || email.includes(searchTerm);
</pre>

**Location**: `src/screens/tutor-request/tutor-request.tsx:48-50, 110-126`

---

#### 3. Subject Filter

**Component**: `MultiSelectDropDown`

**State**: `selectedSubjects` (array of subject objects)

**Type**: Client-side filter

**Data Source**: Redux store `state.resources.subjects`

**Matching Logic**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
selectedSubjects.some(selectedSubject =>
  tutor.subjects.some(subject =>
    subject.name === selectedSubject.name
  )
)
</pre>

**Location**: `src/screens/tutor-request/tutor-request.tsx:53-55, 146-152`

---

#### 4. Status Filter

**Component**: `MultiSelectDropDown`

**State**: `selectedStatuses` (array of status objects)

**Type**: Client-side filter

**Options**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
[
  { id: "status-pending", name: "Pending" },
  { id: "status-approved", name: "Approved" },
  { id: "status-rejected", name: "Rejected" }
]
</pre>

**Matching Logic**: Case-insensitive status comparison

**Location**: `src/screens/tutor-request/tutor-request.tsx:57-60, 129-134`

---

#### 5. Country Filter

**Component**: `MultiSelectDropDown`

**State**: `selectedCountries` (array of country objects)

**Type**: Client-side filter

**Data Source**: `Country.getAllCountries()` from country-state-city library

**Format**: Mapped to `{ id, name }` format

**Location**: `src/screens/tutor-request/tutor-request.tsx:63-65, 137-143`

---

### Filter Application Logic

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Filter Logic (AND operation):
  1. Date filter → Server-side (API query parameters)
  2. Search filter → Client-side (name or email match)
  3. Subject filter → Client-side (ANY subject match)
  4. Status filter → Client-side (status match)
  5. Country filter → Client-side (country match)

ALL conditions must be true for a request to appear in results
</pre>

**Location**: `src/screens/tutor-request/tutor-request.tsx:110-163`

---

### Mobile Filter Toggle

**Component**: `MobileFilterButton`

**State**: `showFullFilters`

**Functionality**:

- Toggle filter visibility on mobile devices
- Shows/hides filter section conditionally

**Location**: `src/screens/tutor-request/tutor-request.tsx:76-78, 281-290`

---

## Role-Based Access

### Access Control

**Authorized Roles**:

- superAdmin
- admin
- counsellor
- hr

**Access Control**: Protected by `withAuth` HOC

**Location**: `src/app/(protected)/[role]/tutor-requests/page.tsx:10`

### Permissions

**All Authorized Roles**:

- ✓ View all tutor requests
- ✓ Filter and search requests
- ✓ View tutor profiles
- ✓ Schedule interviews
- ✓ Approve/reject applications
- ✓ Generate interview links

**Unauthorized Roles** (teacher, student, parent):

- ✗ No access to tutor requests page
- ✗ Redirected to login or appropriate page

---

## State Management

### Local State (React useState)

**Screen-Level State** (`src/screens/tutor-request/tutor-request.tsx`):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// UI State
const [showFullFilters, setShowFullFilters] = useState<boolean>(false);

// Filter State
const [searchItem, setSearchItem] = useState<string>("");
const [dateFilter, setDateFilter] = useState<any>("");
const [selectedStatuses, setSelectedStatuses] = useState<any[]>([]);
const [selectedCountries, setSelectedCountries] = useState<any[]>([]);
const [selectedSubjects, setSelectedSubjects] = useState<any[]>([]);
</pre>

### React Query State

**Query Keys**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
["tutor-requests", dateFilter]
</pre>

**Configuration**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  queryKey: ["tutor-requests", dateFilter],
  queryFn: () => getAllRequest({ startDate, endDate }, { token }),
  enabled: !!token,
  refetchOnWindowFocus: false,
  staleTime: 30000,           // 30 seconds
  refetchInterval: 30000,      // Auto-refresh every 30 seconds
}
</pre>

**Cache Behavior**:

- Automatic caching by query key
- 30-second stale time
- Auto-refresh every 30 seconds
- Refetch disabled on window focus

### Redux State

**Used From Redux**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// User data and authentication
const { token } = useAppSelector((state) => state.user);

// Resources for filtering
const { subjects } = useAppSelector((state) => state.resources);
</pre>

**Redux Structure**:

- `state.user.token`: JWT authentication token
- `state.resources.subjects`: Available subjects for filtering

---

## UI Components

### Global Components Used

#### 1. FilterByDate

**Location**: `src/components/global/filter-by-date/filter-by-date`

**Purpose**: Date range picker for transaction filtering

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  changeFn: (value: any) => void;
  minWidth: string;
  flex: number;
}
</pre>

**Features**:

- Start and end date selection
- Calendar UI
- Clear functionality

---

#### 2. SearchBox

**Location**: `src/components/global/search-box/search`

**Purpose**: Free-text search input with debounce

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}
</pre>

**Features**:

- Debounced input (1500ms)
- Search icon
- Clear button

---

#### 3. MultiSelectDropDown

**Location**: `src/components/global/multi-select-dropDown/multi-select-dropDown`

**Purpose**: Multi-select dropdown for filters

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  placeholder: string;
  data: any[];
  selectedValues: any[];
  onChange: (values: any[]) => void;
}
</pre>

**Variations Used**:

- Subject filter
- Status filter
- Country filter

---

#### 4. MobileFilterButton

**Location**: `src/components/global/mobile-filters-button/mobile.filters-button`

**Purpose**: Toggle filter visibility on mobile

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  isOpen: boolean;
  onClick: () => void;
  inlineStyles?: CSSProperties;
}
</pre>

---

#### 5. PaginationComponent

**Location**: `src/components/global/pagination/pagination`

**Purpose**: Handle page navigation and rows per page

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  totalPages: number;
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onPageChange: (e: any, newPage: number) => void;
  rowsPerPageChange: (e: any) => void;
  dropDownValues: number[];
  inlineStyles?: CSSProperties;
}
</pre>

**Options**: 10, 15, 20 rows per page

**Location**: `src/components/ui/superAdmin/tutorRequest/tutorRequest-table/tutorRequest-table.tsx:218-225`

---

#### 6. LoadingBox

**Location**: `src/components/global/loading-box/loading-box`

**Purpose**: Display loading spinner

**Usage**:

- Full page loading during data fetch

**Location**: `src/screens/tutor-request/tutor-request.tsx:293-299`

---

#### 7. ErrorBox

**Location**: `src/components/global/error-box/error-box`

**Purpose**: Display empty state or error message

**Usage**:

- No requests found
- API error state

---

## Modal Features

### Tutor Profile Actions

The tutor profile page (separate from the main tutor requests screen) provides modal features for:

1. **Interview Scheduling Modal**:

   - Enter interview date and time
   - Generate and send interview link
   - Email notification to tutor

2. **Approval Confirmation Modal**:

   - Confirm tutor application approval
   - Automatically creates teacher account
   - Sends welcome email with credentials

3. **Rejection Confirmation Modal**:
   - Confirm tutor application rejection
   - Sends rejection notification email
   - Updates request status

**Note**: These modals are part of the Tutor Profile module (separate documentation).

---

## Integration with Other Modules

### With Authentication Module

**Relationship**: Tutor request access requires authentication

**Integration Points**:

- JWT token validation
- Role-based access control
- Protected route with `withAuth` HOC
- Token passed in API requests

**See**: [Authentication Module](../authentication-module/AUTHENTICATION.md)

---

### With Users Module

**Relationship**: Approved tutor requests create teacher accounts

**Integration Points**:

1. **Approval Workflow**:

   - Tutor application approved
   - Teacher account created in users table
   - Welcome email sent with login credentials
   - Added to teachers list in Redux store

2. **User Data**:
   - Profile information from tutor application
   - Email for authentication
   - Profile image URL
   - Contact information

**See**: [Users Module](../users-module/USER_FLOWS.md)

---

### With Resources Module

**Relationship**: Subject filtering uses global resources

**Integration Points**:

- Subject list fetched from Redux `state.resources.subjects`
- Multi-select filter populated with subjects
- Subject matching in tutor applications

---

## File References

### Core Files

**Main Screen**: `src/screens/tutor-request/tutor-request.tsx`

**Table Component**: `src/components/ui/superAdmin/tutorRequest/tutorRequest-table/tutorRequest-table.tsx`

**Route**: `src/app/(protected)/[role]/tutor-requests/page.tsx`

### Services

**API Service**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.ts`

**Type Definitions**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.types.ts`

### API

**API Endpoints**: `src/api/tutors.ts`

### Styling

**Screen Styles**: `src/screens/tutor-request/tutor-request.module.css`

**Table Styles**: `src/components/ui/superAdmin/tutorRequest/tutorRequest-table/tutorRequest-table.module.css`

---

## Data Types & Interfaces

### Tutor Application Data Structure

**Location**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.types.ts`

#### Subject Type

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export type Subject = {
  name: string;                       // Subject name
  currency: string;                   // Currency for pricing
  rate: string;                       // Hourly rate
  level: string;                      // Education level
  curriculum: string;                 // Curriculum type
};
</pre>

#### Schedule Slot Type

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export type ScheduleSlot = {
  start: string;                      // Start time (HH:mm)
  end: string;                        // End time (HH:mm)
  selected: boolean;                  // Whether slot is selected
};

export type Schedule = {
  [day: string]: {                    // Monday, Tuesday, etc.
    selected: boolean;
    slots: ScheduleSlot[];
  };
};
</pre>

#### JSON Data Type

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export type JsonData = {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phone: string;
  country: string;
  currency: string;
  profileDescription: string;
  profileImage: string;

  // Academic Information
  subjects: Subject[];
  university: string;
  degree: string;
  degreeType: string;
  startOfStudy: number;
  endOfStudy: number;
  document: string;                   // Degree document URL
  video: string;                      // Introduction video URL

  // Availability
  schedule: Schedule;
  hoursPerWeek: string;

  // Optional
  status?: string;
};
</pre>

#### Onboarding Request Types

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export type Onboarding_Requests = {
  id: number;
  jsonData: string;                   // JSON stringified JsonData
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Onboarding_Requests_Parsed = {
  id: number;
  parsed_jsonData: JsonData;          // Parsed JSON data
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
};
</pre>

---

## Best Practices

### Performance Optimizations

1. **Debounced Search**: Search input debounced by 1.5 seconds to reduce unnecessary filtering
2. **Client-side Filtering**: Most filters work client-side to reduce API calls
3. **React Query Caching**: 30-second cache with background refetch
4. **Memoization**: All props and callbacks memoized with `useMemo` and `useCallback`
5. **Lazy Loading**: Images loaded on-demand

**Location**: `src/screens/tutor-request/tutor-request.tsx:14, 166-265`

### Error Handling

**API Errors**:

- Toast notifications for user feedback
- Error state display
- Graceful fallbacks

**Loading States**:

- Full page loading spinner
- Empty state for no data

### State Management Strategy

- **Server State**: React Query for API data
- **Global State**: Redux for authentication token and resources
- **Local State**: React hooks for filters, search, pagination
- **Derived State**: useMemo for filtered and paginated data

### Data Transformation

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Raw API Response → Parse JSON → Filter Client-side → Paginate → Display
</pre>

This pipeline ensures efficient data handling and optimal performance.

---
