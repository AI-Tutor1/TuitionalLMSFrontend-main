# Tutor Profile Module Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Routing](#routing)
4. [Data Flow](#data-flow)
5. [API Integration](#api-integration)
6. [Component Structure](#component-structure)
7. [Subject Management](#subject-management)
8. [Interview Scheduling](#interview-scheduling)
9. [Approval Workflow](#approval-workflow)
10. [Role-Based Access](#role-based-access)
11. [State Management](#state-management)
12. [UI Components](#ui-components)
13. [Modal Features](#modal-features)
14. [Integration with Other Modules](#integration-with-other-modules)
15. [File References](#file-references)

---

## Overview

The Tutor Profile module provides a comprehensive view of individual tutor applications in the Tuitional LMS. It enables administrators to review detailed tutor information, manage subject approvals, schedule interviews, and process applications (approve/decline). This module serves as the detail view for tutor onboarding requests.

### Key Features

- **Comprehensive Profile View**: Display complete tutor profile with personal and academic information
- **Subject-by-Subject Approval**: Approve specific subjects while rejecting others
- **Interview Scheduling**: Generate and send interview meeting links
- **Rate Management**: Edit subject rates before approval
- **Document Viewing**: Embedded CV/resume viewer with download option
- **Video Integration**: Introduction video with domain validation
- **Availability Visualization**: Weekly schedule with time slot grouping
- **Dual Action Workflow**: Accept or decline tutor applications
- **Real-time Updates**: React Query cache management for fresh data

---

## Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Data Fetching**: TanStack Query (React Query) + Axios
- **State Management**: Redux Toolkit with Redux Persist + Local State
- **UI Components**: Material-UI (MUI)
- **Styling**: CSS Modules
- **Date Handling**: Material-UI DatePicker
- **Notifications**: React-Toastify for user feedback
- **Video Security**: URL domain validation

### Directory Structure

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
src/
├── app/(protected)/[role]/
│   └── tutor-profile/[id]/
│       └── page.tsx                                   # Route entry point
├── screens/
│   └── tutor-profile/
│       ├── tutor-profile.tsx                          # Main profile container
│       ├── tutor-profile.module.css
│       ├── section1/                                  # Profile & Subjects section
│       │   ├── section1.tsx                           # Profile info & subject list
│       │   ├── section1.module.css
│       │   └── subjects-component/
│       │       ├── subjects-component.tsx             # Individual subject card
│       │       └── subjects-component.module.css
│       └── section2/                                  # Tabbed details section
│           ├── section2.tsx                           # Tab container
│           ├── section2.module.css
│           ├── aboutEducation-tab-component/
│           │   ├── aboutEducation-component.tsx       # Reusable info component
│           │   └── tabs-component.module.css
│           └── tabs-view/
│               ├── about-tab/
│               │   ├── about-tab.tsx                  # About tab content
│               │   └── about.module.css
│               ├── education-tab/
│               │   ├── education-tab.tsx              # Education tab content
│               │   └── education-tab.module.css
│               └── availability-tab/
│                   ├── availability-tab.tsx           # Availability tab content
│                   ├── availability-tab.module.css
│                   └── availability-components/
│                       └── availability-component.tsx # Time slot card
├── components/ui/superAdmin/tutor-profile/
│   └── meetLink-modal/
│       ├── meetLink-modal.tsx                         # Interview scheduling modal
│       └── meetLink-modal.module.css
├── services/dashboard/superAdmin/tutor-request/
│   ├── tutor-request.ts                               # Service functions
│   └── tutor-request.types.ts                         # TypeScript types
├── api/
│   └── tutors.ts                                      # API endpoint builders
└── const/dashboard/tutor-Profile/
    └── tutor-profile-tabsData.tsx                     # Tab configuration data
</pre>

### Component Hierarchy

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
TutorProfileForm (Main Container)
├── Section1 (Profile & Subjects)
│   ├── ProfileSection
│   │   ├── Profile Image (with fallback)
│   │   ├── Name, Email, Phone
│   │   └── Status Badge (Pending/Approved/Rejected)
│   ├── ActionButtons
│   │   ├── Open Meet Link Button
│   │   └── Get Meet Link Button (opens modal)
│   ├── SubjectsList
│   │   ├── Subject Filter Dropdown
│   │   └── SubjectsComponent (foreach subject)
│   │       ├── Selection Checkbox
│   │       ├── Subject Info (name, level, curriculum)
│   │       ├── Rate Input (editable)
│   │       └── Status Badge
│   └── Action Buttons
│       ├── Accept Button
│       └── Decline Button
└── Section2 (Tabbed Details)
    ├── Tab Navigation (About, Education, Availability)
    ├── AboutTab
    │   ├── AboutEducationComponent (Date Submitted)
    │   ├── AboutEducationComponent (Country)
    │   ├── AboutEducationComponent (Availability)
    │   ├── AboutEducationComponent (Gender)
    │   └── Video Embed/Link (introduction video)
    ├── EducationTab
    │   ├── AboutEducationComponent (University)
    │   ├── AboutEducationComponent (Degree)
    │   ├── AboutEducationComponent (Degree Type)
    │   ├── AboutEducationComponent (Year)
    │   └── Resume Viewer + Download Button
    └── AvailabilityTab
        └── AvailabilityComponent (foreach time slot)
            ├── Day indicator
            ├── Time range (start - end)
            └── Duration calculation
</pre>

---

## Routing

### Main Route

**Path**: `/{role}/tutor-profile/[id]`

**Access**: superAdmin, admin, counsellor, hr

**Route Component**: `src/app/(protected)/[role]/tutor-profile/[id]/page.tsx`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
"use client";
import React, { use } from "react";
import TutorProfile from "@/screens/tutor-profile/tutor-profile";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise<{ role: string; id: string }> }) => {
  const { role, id } = use(params);
  return <TutorProfile />;
};

export default withAuth(Page);
</pre>

### Navigation Patterns

**From Tutor Requests List**:

- Click on table row navigates to tutor profile
- Ctrl/Cmd + Click opens in new tab
- ID passed as URL parameter

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// From tutor requests table
const handleUser = (id: number, event: React.MouseEvent) => {
  const targetPath = `/${role}/tutor-profile/${id}`;

  if (event.ctrlKey || event.metaKey) {
    window.open(targetPath, "_blank");
  } else {
    router.push(targetPath);
  }
};
</pre>

**Back to Requests List**:

- After approval/rejection, navigate back to tutor requests
- Route: `/{role}/tutor-requests`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// After approval or rejection
router.push(`/${role}/tutor-requests`);
</pre>

---

## Data Flow

### Flow Chart

Flow Chart Link: https://tinyurl.com/2w4b4s7v

### Flow Chart Code

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
flowchart TD
    Start([Admin Opens Tutor Profile]) --> FetchProfile[Fetch Tutor Profile by ID]

    FetchProfile --> ParseJSON[Parse JSON Data]

    ParseJSON --> DisplayProfile[Display Profile Information]

    DisplayProfile --> ProfileSections{Profile Sections}

    %% SECTION 1: PROFILE & SUBJECTS
    ProfileSections --> Section1[Section 1: Profile & Subjects]
    Section1 --> DisplayInfo[Display Personal Info]
    DisplayInfo --> DisplaySubjects[Display Subject List]

    DisplaySubjects --> UserAction1{User Action?}

    %% FILTER SUBJECTS
    UserAction1 -->|Filter Subjects| SelectFilter[Select Subject Filter]
    SelectFilter --> FilterList[Filter Subject List]
    FilterList --> UpdateDisplay[Update Subject Display]
    UpdateDisplay --> UserAction1

    %% SELECT SUBJECTS
    UserAction1 -->|Select/Deselect Subject| ToggleCheckbox[Toggle Subject Checkbox]
    ToggleCheckbox --> UpdateSelection[Update Selected Subjects State]
    UpdateSelection --> UserAction1

    %% EDIT RATE
    UserAction1 -->|Edit Subject Rate| EnterNewRate[Enter New Rate]
    EnterNewRate --> UpdateRate[Update Rate in State]
    UpdateRate --> UserAction1

    %% SCHEDULE INTERVIEW
    UserAction1 -->|Get Meet Link| OpenModal[Open Interview Modal]
    OpenModal --> SelectDate[Select Interview Date]
    SelectDate --> SelectTime[Select Interview Time]
    SelectTime --> SubmitInterview[Submit Interview Request]
    SubmitInterview --> InterviewAPI[Call Generate Interview Link API]
    InterviewAPI --> InterviewSuccess{Success?}
    InterviewSuccess -->|Yes| SendInterviewEmail[Send Interview Link via Email]
    SendInterviewEmail --> ShowToast1[Show Success Toast]
    ShowToast1 --> CloseModal[Close Modal]
    CloseModal --> UserAction1
    InterviewSuccess -->|No| ShowError1[Show Error Toast]
    ShowError1 --> UserAction1

    %% OPEN EXISTING LINK
    UserAction1 -->|Open Meet Link| OpenLink[Open Existing Interview Link]
    OpenLink --> NewTab[Open Link in New Tab]
    NewTab --> UserAction1

    %% ACCEPT APPLICATION
    UserAction1 -->|Accept Application| ValidateSelection{Subjects Selected?}
    ValidateSelection -->|No| ShowWarning[Show Warning: Select Subjects]
    ShowWarning --> UserAction1
    ValidateSelection -->|Yes| ConfirmAccept[Confirm Acceptance]
    ConfirmAccept --> PrepareData[Prepare Updated JSON Data]
    PrepareData --> CallApproveAPI[Call Approve Request API]
    CallApproveAPI --> ApproveSuccess{Success?}
    ApproveSuccess -->|Yes| CreateAccount[Create Teacher Account]
    CreateAccount --> GeneratePassword[Generate One-Time Password]
    GeneratePassword --> SendWelcomeEmail[Send Welcome Email]
    SendWelcomeEmail --> UpdateStatus1[Update Status to Approved]
    UpdateStatus1 --> ShowToast2[Show Success Toast]
    ShowToast2 --> RefreshData[Refresh Profile Data]
    RefreshData --> End1([End: Navigate to Requests List])
    ApproveSuccess -->|No| ShowError2[Show Error Toast]
    ShowError2 --> UserAction1

    %% DECLINE APPLICATION
    UserAction1 -->|Decline Application| ConfirmDecline[Confirm Decline]
    ConfirmDecline --> CallRejectAPI[Call Reject Request API]
    CallRejectAPI --> RejectSuccess{Success?}
    RejectSuccess -->|Yes| UpdateStatus2[Update Status to Rejected]
    UpdateStatus2 --> SendRejectEmail[Send Rejection Email]
    SendRejectEmail --> ShowToast3[Show Success Toast]
    ShowToast3 --> End2([End: Navigate to Requests List])
    RejectSuccess -->|No| ShowError3[Show Error Toast]
    ShowError3 --> UserAction1

    %% SECTION 2: TABBED DETAILS
    ProfileSections --> Section2[Section 2: Tabbed Details]
    Section2 --> TabSelection{Select Tab}

    TabSelection -->|About| AboutTab[Display About Tab]
    AboutTab --> ShowPersonalInfo[Show Personal Info]
    ShowPersonalInfo --> ShowVideo[Show Introduction Video]
    ShowVideo --> TabSelection

    TabSelection -->|Education| EducationTab[Display Education Tab]
    EducationTab --> ShowAcademicInfo[Show Academic Info]
    ShowAcademicInfo --> ShowResume[Show Resume/CV]
    ShowResume --> DownloadOption{Download CV?}
    DownloadOption -->|Yes| DownloadFile[Download CV File]
    DownloadFile --> TabSelection
    DownloadOption -->|No| TabSelection

    TabSelection -->|Availability| AvailabilityTab[Display Availability Tab]
    AvailabilityTab --> ShowSchedule[Show Weekly Schedule]
    ShowSchedule --> DisplaySlots[Display Time Slots by Day]
    DisplaySlots --> TabSelection

    style Start fill:#e1f5ff
    style CreateAccount fill:#A0FFC0
    style GeneratePassword fill:#A0FFC0
    style SendWelcomeEmail fill:#A0FFC0
    style ShowWarning fill:#FFFAA0
    style ShowError1 fill:#FFACAC
    style ShowError2 fill:#FFACAC
    style ShowError3 fill:#FFACAC
</pre>

### High-Level Data Flow

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
User opens tutor profile page
    ↓
Fetch tutor data by ID from API
    ↓
Parse JSON data from stringified response
    ↓
Display profile in two sections
    ↓
Section 1: Profile & Subjects (with actions)
Section 2: Tabbed Details (About, Education, Availability)
    ↓
User Actions:
  ├─ Filter/Select subjects → Update local state
  ├─ Edit rates → Update local state
  ├─ Schedule interview → Open modal → Generate link
  ├─ Accept → Validate → Update data → Create account
  └─ Decline → Confirm → Update status → Send email
</pre>

---

## API Integration

### Base URL

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
${BASE_URL}/api
</pre>

### 1. Get Single Tutor Request

**Endpoint**: `GET /api/getATutorOnbordingRequestWithId/{id}`

**Service Function**: `getSingleRequest(id, config)`

**Location**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.ts:31-32`

**URL Parameters**:

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `id`      | string | Yes      | Tutor request ID |

**Request Configuration**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
config: {
  token: string;  // Authentication token
}
</pre>

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  id: number;
  jsonData: string;                    // JSON stringified tutor data
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;                   // ISO 8601 date
  updatedAt: string;                   // ISO 8601 date
  deletedAt: string | null;
}
</pre>

**Usage in Component**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { data, isLoading, error } = useQuery({
  queryKey: ["tutor-profile", id],
  queryFn: () => getSingleRequest(id as string, {}),
  enabled: !!id,
  refetchOnWindowFocus: false,
});
</pre>

---

### 2. Generate Interview Link

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
  interviewDate: string;              // ISO 8601 date/time string
}
</pre>

**Example Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  interviewDate: "2025-12-20T14:30:00.000Z"
}
</pre>

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  error: string;
  message: string;
}
</pre>

**Purpose**: Generates interview meeting link and sends it to tutor via email

---

### 3. Approve Tutor Request

**Endpoint**: `POST /api/approveRequest`

**Service Function**: `approvedRequest(config, payload)`

**Location**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.ts:47-53`

**Request Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  jsonData: string;                   // Stringified JSON data with updated rates
  id: number;                         // Tutor request ID
}
</pre>

**Process**:

1. Updates tutor application with modified subject rates
2. Creates teacher account in the system
3. Generates one-time password
4. Sends welcome email with credentials
5. Updates request status to "Approved"

---

## Component Structure

### Main Profile Component

**Component**: `TutorProfileForm`

**Location**: `src/screens/tutor-profile/tutor-profile.tsx`

**Responsibilities**:

- Fetch tutor data using React Query
- Parse JSON data from API response
- Manage global state for the profile view
- Distribute data to Section1 and Section2

**React Query Hook**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
useQuery({
  queryKey: ["tutor-profile", id],
  queryFn: () => getSingleRequest(id as string, {}),
  enabled: !!id,
  refetchOnWindowFocus: false,
});
</pre>

**Data Parsing**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const userData: JsonData | null = useMemo(() => {
  if (data?.data?.jsonData) {
    try {
      return JSON.parse(data.data.jsonData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }
  return null;
}, [data]);
</pre>

---

### Section 1: Profile & Subjects

**Component**: `Section1`

**Location**: `src/screens/tutor-profile/section1/section1.tsx`

**Features**:

1. **Profile Display**

   - Profile image with fallback to default avatar
   - Full name (firstName + lastName)
   - Email address
   - Phone number
   - Status badge with color coding

2. **Action Buttons**

   - "Open Meet Link": Opens existing interview link
   - "Get Meet Link": Opens modal to schedule new interview

3. **Subject Management**

   - Filter dropdown to filter subjects by name
   - List of all subjects with approval controls
   - Subject-by-subject selection for approval
   - Editable rate for each subject

4. **Application Actions**
   - Accept button: Approves selected subjects and creates teacher account
   - Decline button: Rejects the tutor application

**Performance Optimizations**:

- Component memoized with `React.memo`
- All callbacks wrapped with `useCallback`
- Props objects memoized with `useMemo`
- Static styles defined outside component

---

### SubjectsComponent

**Component**: Individual subject card

**Location**: `src/screens/tutor-profile/section1/subjects-component/subjects-component.tsx`

**Purpose**: Display subject details and approval controls

**Features**:

- Checkbox for subject selection
- Subject name display
- Level and curriculum display
- Editable rate input field
- Currency display
- Status badge (Accepted/Not Accepted)

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  subject: Subject;
  isChecked: boolean;
  onCheckboxChange: (subjectName: string, checked: boolean) => void;
  onRateChange: (subjectName: string, newRate: string) => void;
}
</pre>

**Memoization**:

- Component memoized with `React.memo`
- Custom comparison function for optimal re-renders
- Only re-renders when relevant props change

---

### Section 2: Tabbed Details

**Component**: `Section2`

**Location**: `src/screens/tutor-profile/section2/section2.tsx`

**Tabs**:

1. **About Tab**: Personal information and introduction video
2. **Education Tab**: Academic credentials and CV
3. **Availability Tab**: Weekly schedule and time slots

**State Management**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const [value, setValue] = useState(0);  // Active tab index
</pre>

**Tab Navigation**:

- Material-UI Tabs component
- Three tabs with proper a11y attributes
- Smooth transitions between tabs

---

### About Tab

**Component**: `AboutTab`

**Location**: `src/screens/tutor-profile/section2/tabs-view/about-tab/about-tab.tsx`

**Displays**:

1. **Date Submitted**: Request creation date (formatted)
2. **Country**: Tutor's country of residence
3. **Availability**: Hours per week
4. **Gender**: Tutor's gender

**Video Section**:

- Embeds introduction video if available
- Domain validation for video URLs
- Supports iframe embeds for YouTube, Vimeo, etc.
- External link for non-embeddable videos

**Video Domain Validation**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const isSafeVideoURL = (url: string) => {
  const allowedDomains = [
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    "dailymotion.com",
    "wistia.com"
  ];

  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain =>
      urlObj.hostname.includes(domain)
    );
  } catch {
    return false;
  }
};
</pre>

---

### Education Tab

**Component**: `EducationTab`

**Location**: `src/screens/tutor-profile/section2/tabs-view/education-tab/education-tab.tsx`

**Displays**:

1. **University**: University name
2. **Degree**: Degree title
3. **Degree Type**: Bachelor's, Master's, PhD, etc.
4. **Year**: Study period (startOfStudy - endOfStudy)

**CV/Resume Section**:

- Embedded PDF viewer for CV/resume documents
- Download button for offline viewing
- Fallback for non-PDF documents
- Responsive iframe display

**Download Handler**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleDownload = () => {
  if (data?.document) {
    const link = document.createElement("a");
    link.href = data.document;
    link.download = "resume.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
</pre>

---

### Availability Tab

**Component**: `AvailabilityTab`

**Location**: `src/screens/tutor-profile/section2/tabs-view/availability-tab/availability-tab.tsx`

**Features**:

- Weekly schedule visualization
- Groups time slots by day
- Shows only days with selected slots
- Displays duration for each slot

**Schedule Iteration**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Object.entries(schedule).map(([day, dayData]) => {
  if (dayData.selected) {
    return dayData.slots
      .filter(slot => slot.selected)
      .map(slot => (
        <AvailabilityComponent
          day={day}
          slot={slot}
          key={`${day}-${slot.start}`}
        />
      ));
  }
  return null;
});
</pre>

---

### AvailabilityComponent

**Component**: Individual time slot card

**Location**: `src/screens/tutor-profile/section2/tabs-view/availability-tab/availability-components/availability-component.tsx`

**Displays**:

- Day of week
- Start and end time
- Calculated duration

**Duration Calculation**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const calculateDuration = (start: string, end: string) => {
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const diffMinutes = endMinutes - startMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${hours}h ${minutes}m`;
};
</pre>

---

### AboutEducationComponent

**Component**: Reusable info display component

**Location**: `src/screens/tutor-profile/section2/aboutEducation-tab-component/aboutEducation-component.tsx`

**Purpose**: Display icon + title + value in consistent format

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  icon: React.ReactNode;
  title: string;
  value: string | number;
}
</pre>

**Used In**:

- About Tab (4 instances)
- Education Tab (4 instances)

---

## Subject Management

### Subject Display

Each subject card shows:

- **Name**: Subject name (e.g., "Mathematics")
- **Level**: Education level (e.g., "High School")
- **Curriculum**: Curriculum type (e.g., "IB", "GCSE")
- **Rate**: Hourly rate with currency
- **Status**: Accepted or Not Accepted badge

### Subject Filtering

**Filter Dropdown**:

- Populated with all subjects from Redux resources
- Allows filtering by subject name
- Client-side filtering for instant results

**Filter Logic**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const filteredSubjects = useMemo(() => {
  if (!selectedSubjectFilter) return userData?.subjects || [];

  return userData?.subjects?.filter(
    subject => subject.name === selectedSubjectFilter.name
  ) || [];
}, [userData, selectedSubjectFilter]);
</pre>

**Location**: `src/screens/tutor-profile/section1/section1.tsx`

### Subject Selection

**Checkbox Behavior**:

- Individual checkbox for each subject
- Tracks selected subjects in state
- Visual indication of selected subjects

**State Management**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

const handleCheckboxChange = (subjectName: string, checked: boolean) => {
  if (checked) {
    setSelectedSubjects(prev => [...prev, subjectName]);
  } else {
    setSelectedSubjects(prev =>
      prev.filter(name => name !== subjectName)
    );
  }
};
</pre>

### Rate Editing

**Editable Input**:

- Text input field for each subject's rate
- Allows admin to adjust rates before approval
- Validates numeric input

**State Management**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const [editedRates, setEditedRates] = useState<Record<string, string>>({});

const handleRateChange = (subjectName: string, newRate: string) => {
  setEditedRates(prev => ({
    ...prev,
    [subjectName]: newRate
  }));
};
</pre>

**Applying Edits**:

- When accepting application, edited rates are merged into JSON data
- Updated rates are sent to API
- Teacher account is created with new rates

---

## Interview Scheduling

### Interview Modal

**Component**: MeetLink Modal

**Location**: `src/components/ui/superAdmin/tutor-profile/meetLink-modal/meetLink-modal.tsx`

**Fields**:

1. **Date Picker**

   - Material-UI DatePicker component
   - Minimum date: Today
   - Disabled dates: All past dates

2. **Time Slot Dropdown**
   - 96 options (24 hours × 4 slots per hour)
   - 15-minute intervals
   - Format: "HH:mm" (24-hour format)

**Time Slot Generation**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const timeSlots = useMemo(() => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, "0");
      const minuteStr = minute.toString().padStart(2, "0");
      slots.push(`${hourStr}:${minuteStr}`);
    }
  }
  return slots;
}, []);
</pre>

### Date/Time Combination

**Process**:

1. User selects date from picker
2. User selects time from dropdown
3. Date and time are combined into JavaScript Date object
4. Date object is converted to ISO 8601 string
5. ISO string is sent to API

**Implementation**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const combineDateTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours);
  combined.setMinutes(minutes);
  combined.setSeconds(0);
  combined.setMilliseconds(0);
  return combined.toISOString();
};
</pre>

### API Submission

**Payload**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  interviewDate: "2025-12-20T14:30:00.000Z"
}
</pre>

**Process**:

1. API generates unique meeting link
2. Link is stored in database
3. Email is sent to tutor with link and details
4. Interview is added to scheduled interviews list

---

## Approval Workflow

### Accept Application

**Prerequisites**:

- At least one subject must be selected
- Tutor profile must be in "Pending" status

**Process**:

1. **Validation**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
if (selectedSubjects.length === 0) {
  showToast("Please select at least one subject", "warning");
  return;
}
</pre>

2. **Data Preparation**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const updatedJsonData = {
  ...userData,
  subjects: userData.subjects.map(subject => ({
    ...subject,
    rate: editedRates[subject.name] || subject.rate,
    status: selectedSubjects.includes(subject.name)
      ? "Accepted"
      : "Not Accepted"
  }))
};
</pre>

3. **API Call**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const payload = {
  id: tutorId,
  jsonData: JSON.stringify(updatedJsonData)
};

await approvedRequest(config, payload);
</pre>

4. **Backend Actions** (performed by API):

   - Create teacher account in users table
   - Generate one-time password
   - Store approved subjects in teacher profile
   - Send welcome email with credentials
   - Update request status to "Approved"

5. **Frontend Actions**:
   - Show success toast notification
   - Invalidate React Query cache
   - Navigate back to tutor requests list

**Location**: `src/screens/tutor-profile/section1/section1.tsx`

---

### Decline Application

**Prerequisites**:

- Tutor profile must be in "Pending" status

**Process**:

1. **Confirmation Dialog**

   - Admin clicks "Decline" button
   - Confirmation modal appears
   - Admin confirms decline action

2. **API Call**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const payload = {
  id: tutorId,
  status: "Rejected"
};

await rejectRequest(config, payload);
</pre>

3. **Backend Actions** (performed by API):

   - Update request status to "Rejected"
   - Send rejection email to applicant
   - Add rejection reason (if provided)
   - Archive application

4. **Frontend Actions**:
   - Show success toast notification
   - Invalidate React Query cache
   - Navigate back to tutor requests list

**Location**: `src/screens/tutor-profile/section1/section1.tsx`

---

## Role-Based Access

### Access Control

**Authorized Roles**:

- superAdmin
- admin
- counsellor
- hr

**Access Control**: Protected by `withAuth` HOC

**Location**: `src/app/(protected)/[role]/tutor-profile/[id]/page.tsx`

### Permissions

**All Authorized Roles**:

- ✓ View complete tutor profile
- ✓ Review academic credentials
- ✓ Check availability schedule
- ✓ Manage subject approvals
- ✓ Schedule interviews
- ✓ Approve or decline applications
- ✓ Edit subject rates

**Unauthorized Roles** (teacher, student, parent):

- ✗ No access to tutor profiles
- ✗ Redirected to login or appropriate page

---

## State Management

### Local State (React useState)

**Screen-Level State** (`src/screens/tutor-profile/tutor-profile.tsx`):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Parsed tutor data
const [userData, setUserData] = useState<JsonData | null>(null);
</pre>

**Section1 State** (`src/screens/tutor-profile/section1/section1.tsx`):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Subject management
const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
const [editedRates, setEditedRates] = useState<Record<string, string>>({});
const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<any>(null);

// Modal state
const [meetLinkModal, setMeetLinkModal] = useState<boolean>(false);
</pre>

**Section2 State** (`src/screens/tutor-profile/section2/section2.tsx`):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Active tab
const [value, setValue] = useState(0);
</pre>

### React Query State

**Query Keys**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
["tutor-profile", id]
</pre>

**Configuration**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  queryKey: ["tutor-profile", id],
  queryFn: () => getSingleRequest(id as string, {}),
  enabled: !!id,                      // Only fetch when ID exists
  refetchOnWindowFocus: false,        // Prevent unnecessary refetches
}
</pre>

**Cache Behavior**:

- Automatic caching by query key
- No background refetching
- Cache invalidated on approval/rejection
- Data persists during session

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

#### 1. AboutEducationComponent

**Location**: `src/screens/tutor-profile/section2/aboutEducation-tab-component/aboutEducation-component.tsx`

**Purpose**: Reusable component for displaying icon + title + value

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  icon: React.ReactNode;
  title: string;
  value: string | number;
}
</pre>

**Used In**:

- About Tab (4 instances)
- Education Tab (4 instances)

---

#### 2. Material-UI Components

**DatePicker**:

- From `@mui/x-date-pickers`
- Used in interview scheduling modal
- Prevents past date selection

**Tabs**:

- From `@mui/material`
- Used in Section 2 for tab navigation
- Three tabs: About, Education, Availability

**Badge**:

- From `@mui/material`
- Used for status display
- Color-coded based on status

---

#### 3. SubjectsComponent

**Location**: `src/screens/tutor-profile/section1/subjects-component/subjects-component.tsx`

**Purpose**: Individual subject card with controls

**Features**:

- Checkbox for selection
- Subject details display
- Editable rate input
- Status badge

---

#### 4. AvailabilityComponent

**Location**: `src/screens/tutor-profile/section2/tabs-view/availability-tab/availability-components/availability-component.tsx`

**Purpose**: Time slot card for availability display

**Features**:

- Day indicator
- Time range display
- Duration calculation

---

## Modal Features

### MeetLink Modal

**Component**: `MeetLinkModal`

**Location**: `src/components/ui/superAdmin/tutor-profile/meetLink-modal/meetLink-modal.tsx`

**Purpose**: Schedule interview meeting link

**Features**:

1. **Date Picker**

   - Material-UI DatePicker
   - Disables past dates
   - Min date: today

2. **Time Slot Dropdown**

   - 15-minute interval slots
   - Full day coverage (00:00 - 23:45)
   - Dropdown selection

3. **Form Validation**

   - Date cannot be in the past
   - Both date and time must be selected

4. **Submission**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleSubmit = async () => {
  if (!selectedDate || !selectedTime) return;

  // Combine date and time
  const [hours, minutes] = selectedTime.split(":").map(Number);
  const interviewDateTime = new Date(selectedDate);
  interviewDateTime.setHours(hours);
  interviewDateTime.setMinutes(minutes);

  // Convert to ISO string
  const isoString = interviewDateTime.toISOString();

  // Call API
  await generateInterviewLink(id, {}, { interviewDate: isoString });
};
</pre>

---

## Integration with Other Modules

### With Tutor Request Module

**Relationship**: Detail view accessed from tutor requests list

**Integration Points**:

- Navigation from requests table to profile
- Shared API service functions
- Shared type definitions
- Common Redux resources

**See**: [Tutor Request Module](../tutor-request/TUTOR_REQUEST.md)

---

### With Authentication Module

**Relationship**: Profile access requires authentication

**Integration Points**:

- JWT token validation
- Role-based access control
- Protected route with `withAuth` HOC
- Token passed in API requests

**See**: [Authentication Module](../authentication-module/AUTHENTICATION.md)

---

### With Users Module

**Relationship**: Approval creates teacher accounts

**Integration Points**:

1. **Account Creation**:

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

## File References

### Core Files

**Main Route**: `src/app/(protected)/[role]/tutor-profile/[id]/page.tsx`

**Main Screen**: `src/screens/tutor-profile/tutor-profile.tsx`

**Section 1**: `src/screens/tutor-profile/section1/section1.tsx`

**Section 2**: `src/screens/tutor-profile/section2/section2.tsx`

### Components

**Subject Component**: `src/screens/tutor-profile/section1/subjects-component/subjects-component.tsx`

**About Tab**: `src/screens/tutor-profile/section2/tabs-view/about-tab/about-tab.tsx`

**Education Tab**: `src/screens/tutor-profile/section2/tabs-view/education-tab/education-tab.tsx`

**Availability Tab**: `src/screens/tutor-profile/section2/tabs-view/availability-tab/availability-tab.tsx`

**Availability Component**: `src/screens/tutor-profile/section2/tabs-view/availability-tab/availability-components/availability-component.tsx`

**AboutEducation Component**: `src/screens/tutor-profile/section2/aboutEducation-tab-component/aboutEducation-component.tsx`

### Modals

**Meet Link Modal**: `src/components/ui/superAdmin/tutor-profile/meetLink-modal/meetLink-modal.tsx`

### Services

**API Service**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.ts`

**Type Definitions**: `src/services/dashboard/superAdmin/tutor-request/tutor-request.types.ts`

### API

**API Endpoints**: `src/api/tutors.ts`

### Constants

**Tab Data**: `src/const/dashboard/tutor-Profile/tutor-profile-tabsData.tsx`

### Styling

**Main Styles**: `src/screens/tutor-profile/tutor-profile.module.css`

**Section1 Styles**: `src/screens/tutor-profile/section1/section1.module.css`

**Section2 Styles**: `src/screens/tutor-profile/section2/section2.module.css`

**Subject Styles**: `src/screens/tutor-profile/section1/subjects-component/subjects-component.module.css`

**About Tab Styles**: `src/screens/tutor-profile/section2/tabs-view/about-tab/about.module.css`

**Education Tab Styles**: `src/screens/tutor-profile/section2/tabs-view/education-tab/education-tab.module.css`

**Availability Tab Styles**: `src/screens/tutor-profile/section2/tabs-view/availability-tab/availability-tab.module.css`

**Modal Styles**: `src/components/ui/superAdmin/tutor-profile/meetLink-modal/meetLink-modal.module.css`

---

## Data Types & Interfaces

### Location

All type definitions are in: `src/services/dashboard/superAdmin/tutor-request/tutor-request.types.ts`

### Subject Type

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export type Subject = {
  name: string;                       // Subject name (e.g., "Mathematics")
  currency: string;                   // Currency code (e.g., "USD")
  rate: string;                       // Hourly rate (e.g., "50")
  level: string;                      // Education level (e.g., "High School")
  curriculum: string;                 // Curriculum type (e.g., "IB", "GCSE")
};
</pre>

---

### Schedule Types

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
export type ScheduleSlot = {
  start: string;                      // Start time in HH:mm format
  end: string;                        // End time in HH:mm format
  selected: boolean;                  // Whether slot is selected
};

export type Schedule = {
  [day: string]: {                    // Day names: Monday, Tuesday, etc.
    selected: boolean;                // Whether day has any slots
    slots: ScheduleSlot[];            // Array of time slots for the day
  };
};
</pre>

**Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "Monday": {
    "selected": true,
    "slots": [
      { "start": "09:00", "end": "12:00", "selected": true },
      { "start": "14:00", "end": "17:00", "selected": true }
    ]
  },
  "Tuesday": {
    "selected": false,
    "slots": []
  }
}
</pre>

---

### JsonData Type (Complete Tutor Profile)

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
  profileImage: string;               // URL to profile image

  // Academic Information
  subjects: Subject[];                // Array of subjects tutor teaches
  university: string;
  degree: string;
  degreeType: string;                 // e.g., "Bachelor's", "Master's"
  startOfStudy: number;               // Start year
  endOfStudy: number;                 // End year
  document: string;                   // URL to degree certificate/CV
  video: string;                      // URL to introduction video

  // Availability
  schedule: Schedule;                 // Weekly availability schedule
  hoursPerWeek: string;               // e.g., "10-15 hours"

  // Optional
  status?: string;                    // Application status
};
</pre>

---

### Onboarding Request Types

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Raw API response type
export type Onboarding_Requests = {
  id: number;
  jsonData: string;                   // Stringified JsonData
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

// Parsed type used in components
export type Onboarding_Requests_Parsed = {
  id: number;
  parsed_jsonData: JsonData;          // Parsed JsonData object
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
};
</pre>

---

## Best Practices

### Performance Optimizations

1. **Component Memoization**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Section1 component
export default React.memo(Section1, (prevProps, nextProps) => {
  return (
    prevProps.userData === nextProps.userData &&
    prevProps.status === nextProps.status &&
    prevProps.id === nextProps.id
  );
});
</pre>

2. **Props Memoization**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const section1Props = useMemo(() => ({
  userData,
  status: data?.data?.status,
  id: Number(id)
}), [userData, data?.data?.status, id]);
</pre>

3. **Callback Memoization**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleCheckboxChange = useCallback((subjectName: string, checked: boolean) => {
  if (checked) {
    setSelectedSubjects(prev => [...prev, subjectName]);
  } else {
    setSelectedSubjects(prev => prev.filter(name => name !== subjectName));
  }
}, []);
</pre>

4. **Computed Values**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const filteredSubjects = useMemo(() => {
  if (!selectedSubjectFilter) return userData?.subjects || [];
  return userData?.subjects?.filter(
    subject => subject.name === selectedSubjectFilter.name
  ) || [];
}, [userData, selectedSubjectFilter]);
</pre>

5. **Static Styles**

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const statusStyles = {
  Pending: { color: "#716E3D", backgroundColor: "#FFFAA0" },
  Approved: { color: "#286320", backgroundColor: "#A0FFC0" },
  Rejected: { color: "#653838", backgroundColor: "#FFACAC" },
};

// Used inside component without recreation
<Badge sx={statusStyles[status]} />
</pre>

### Security Practices

**Video Domain Validation**:

- Prevent XSS attacks via malicious iframe sources
- Whitelist trusted video domains
- Provide fallback for non-embeddable videos

**JSON Parsing**:

- Error handling for malformed JSON
- Type safety with TypeScript
- Null safety with optional chaining

### Error Handling

**API Errors**:

- Toast notifications for user feedback
- Error state display
- Graceful fallbacks

**Loading States**:

- Loading spinner during data fetch
- Skeleton screens for better UX

---

## Related Documentation

- [Tutor Request Module](../tutor-request/TUTOR_REQUEST.md) - Tutor requests list and filtering
- [Authentication Module](../authentication-module/AUTHENTICATION.md) - Auth system
- [Users Module](../users-module/USER_FLOWS.md) - User management

---

**Last Updated**: 2025-12-26
**Version**: 1.1.0
**Maintained By**: Development Team
