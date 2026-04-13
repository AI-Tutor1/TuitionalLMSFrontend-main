# Navigation Diagrams & Visual Flowcharts

Complete visual documentation of the post-authentication navigation system, role-based routing, and dashboard flows in the Tuitional LMS Frontend.

---

## Table of Contents

1. [Complete Authentication & Navigation Flow](#complete-authentication--navigation-flow)
2. [Role-Based Routing Flowchart](#role-based-routing-flowchart)
3. [Dashboard Selection Flow](#dashboard-selection-flow)
4. [withAuth HOC Logic Diagram](#withauth-hoc-logic-diagram)
5. [Admin Dashboard Structure](#admin-dashboard-structure)
6. [Student/Teacher Dashboard Structure](#studentteacher-dashboard-structure)
7. [API Call Sequence Diagrams](#api-call-sequence-diagrams)
8. [State Management Flow](#state-management-flow)
9. [Real-Time Update Flow](#real-time-update-flow)
10. [Complete Navigation Mind Map](#complete-navigation-mind-map)

---

## Complete Authentication & Navigation Flow

### End-to-End User Journey

```mermaid
graph TD
    A[User Opens App] --> B{Current Route?}
    B -->|"/"| C{Authenticated?}
    C -->|No| D[Redirect to /signin]
    C -->|Yes| E[Redirect to /{roleName}/dashboard]

    B -->|"/signin"| F{Already Logged In?}
    F -->|Yes| G[Block: Redirect to Dashboard]
    F -->|No| H[Show Sign In Form]

    H --> I[User Enters Credentials]
    I --> J[Submit Form]
    J --> K[API: POST /api/user/signIn]

    K --> L{Auth Success?}
    L -->|No| M[Show Error Toast]
    M --> H

    L -->|Yes| N[Receive Token & User Data]
    N --> O[Parallel Data Fetching]

    O --> P[Fetch Assigned Pages]
    O --> Q[Fetch Users by Group]
    O --> R[Fetch Resources]
    O --> S[Fetch Roles]

    P --> T[Store in Redux]
    Q --> T
    R --> T
    S --> T

    T --> U[Transform Role Name]
    U --> V[Navigate to /{roleName}/dashboard]

    V --> W[withAuth Verifies Access]
    W --> X{Has Permission?}
    X -->|No| Y[Block: Redirect to Dashboard]
    X -->|Yes| Z[Render Dashboard Component]

    Z --> AA{Role Type?}
    AA -->|student/teacher/parent| AB[StudentTeacherDashboard]
    AA -->|admin/superAdmin/etc| AC[AdminDashboard]

    AB --> AD[Load Dashboard Data]
    AC --> AD

    AD --> AE[Dashboard Rendered]

    B -->|"/{role}/*"| W

    style A fill:#e1f5ff
    style AE fill:#c8e6c9
    style M fill:#ffcdd2
    style Y fill:#ffcdd2
```

---

## Role-Based Routing Flowchart

### Complete Role Routing Decision Tree

```mermaid
graph TD
    Start[User Login Success] --> GetRole[Extract user.roleId & role.name]
    GetRole --> Transform[Transform Role Name to camelCase]

    Transform --> RoleCheck{What Role?}

    RoleCheck -->|roleId: 1| SA[Super Admin]
    RoleCheck -->|roleId: 2| Admin[School Admin]
    RoleCheck -->|roleId: 3| Student[Student]
    RoleCheck -->|roleId: 4| Parent[Parent]
    RoleCheck -->|roleId: 5| Teacher[Teacher]
    RoleCheck -->|roleId: 6| Counsellor[Counsellor]
    RoleCheck -->|roleId: 7| HR[HR]

    SA --> SARoute[/superAdmin/dashboard]
    Admin --> AdminRoute[/admin/dashboard or /schoolAdmin/dashboard]
    Student --> StudentRoute[/student/dashboard]
    Parent --> ParentRoute[/parent/dashboard]
    Teacher --> TeacherRoute[/teacher/dashboard]
    Counsellor --> CounsellorRoute[/counsellor/dashboard]
    HR --> HRRoute[/hr/dashboard]

    SARoute --> SADash[AdminDashboard Component]
    AdminRoute --> AdminDash[AdminDashboard Component]
    CounsellorRoute --> CounsellorDash[AdminDashboard Component]
    HRRoute --> HRDash[AdminDashboard Component]

    StudentRoute --> STDash[StudentTeacherDashboard Component]
    ParentRoute --> PTDash[StudentTeacherDashboard Component]
    TeacherRoute --> TCDash[StudentTeacherDashboard Component]

    SADash --> SAFeatures[✓ Global Analytics<br/>✓ All Schools Data<br/>✓ Geographic Distribution<br/>✓ Top Tutor Performance]
    AdminDash --> AdminFeatures[✓ Institution Analytics<br/>✓ School Management<br/>✓ Student/Teacher Oversight]
    CounsellorDash --> CounsellorFeatures[✓ Student Performance<br/>✓ Counseling Sessions<br/>✓ Academic Guidance]
    HRDash --> HRFeatures[✓ Staff Management<br/>✓ Payroll<br/>✓ Performance Reviews]

    STDash --> StudentFeatures[✓ Subjects Enrolled<br/>✓ Classes Attended<br/>✓ Upcoming Classes<br/>✓ Join Live Classes]
    PTDash --> ParentFeatures[✓ Children's Progress<br/>✓ Aggregate Stats<br/>✓ Monitor Attendance<br/>✓ View All Children's Data]
    TCDash --> TeacherFeatures[✓ Total Students<br/>✓ Upcoming Classes<br/>✓ Total Hours Taught<br/>✓ Extend Classes]

    style Start fill:#e1f5ff
    style SAFeatures fill:#c8e6c9
    style AdminFeatures fill:#c8e6c9
    style CounsellorFeatures fill:#c8e6c9
    style HRFeatures fill:#c8e6c9
    style StudentFeatures fill:#fff9c4
    style ParentFeatures fill:#fff9c4
    style TeacherFeatures fill:#fff9c4
```

---

## Dashboard Selection Flow

### Dashboard Type Decision Logic

```mermaid
flowchart TD
    A[Route: /{role}/dashboard] --> B[Extract role parameter from URL]
    B --> C{Role Check}

    C -->|role === 'student'| D[Load StudentTeacherDashboard]
    C -->|role === 'teacher'| D
    C -->|role === 'parent'| D

    C -->|role === 'superAdmin'| E[Load AdminDashboard]
    C -->|role === 'admin'| E
    C -->|role === 'schoolAdmin'| E
    C -->|role === 'counsellor'| E
    C -->|role === 'hr'| E

    D --> F[Render with Role-Specific View]
    E --> G[Render Analytics View]

    F --> H{Role Type?}
    H -->|Teacher| I[Show:<br/>✓ Total Students<br/>✓ Upcoming Classes<br/>✓ Hours Taught<br/>✓ Session History Chart]
    H -->|Student| J[Show:<br/>✓ Subjects Enrolled<br/>✓ Classes Attended<br/>✓ Upcoming Classes<br/>✓ No Session History]
    H -->|Parent| K[Show:<br/>✓ Aggregate Children Stats<br/>✓ All Children's Classes<br/>✓ Combined Enrollments<br/>✓ No Session History]

    G --> L[Show:<br/>✓ 6 Stats Cards<br/>✓ 7 Analytics Charts<br/>✓ Geographic Map<br/>✓ Today's Sessions Table<br/>✓ Tutor Performance]

    I --> M[API Calls with tutor_id]
    J --> N[API Calls with student_id]
    K --> O[API Calls with childrens array]
    L --> P[API Calls system-wide]

    M --> Q[Dashboard Rendered]
    N --> Q
    O --> Q
    P --> Q

    style A fill:#e1f5ff
    style D fill:#fff9c4
    style E fill:#c8e6c9
    style Q fill:#b39ddb
```

---

## withAuth HOC Logic Diagram

### Complete Authentication & Authorization Flow

```mermaid
flowchart TD
    Start[Component Wrapped with withAuth] --> Init[Initialize withAuth HOC]
    Init --> Redux[Read Redux State]

    Redux --> Check1{Check Current Pathname}

    Check1 -->|pathname === '/'| Root{User Authenticated?}
    Root -->|Yes| RootAuth[Redirect to /{roleName}/dashboard]
    Root -->|No| RootNoAuth[Redirect to /signin]

    Check1 -->|Other Path| Check2{Is Public Route?}
    Check2 -->|Yes| Public{User Authenticated?}
    Public -->|Yes| BlockPublic[BLOCK: Redirect to Dashboard<br/>Toast: Already logged in]
    Public -->|No| AllowPublic[ALLOW: Render Component]

    Check2 -->|No| Protected{User Authenticated?}
    Protected -->|No| BlockUnauth[BLOCK: Redirect to /signin<br/>Toast: Access denied]

    Protected -->|Yes| Check3{Role Matches URL?}
    Check3 -->|No| BlockRole[BLOCK: Redirect to Own Dashboard<br/>Toast: Unauthorized access]

    Check3 -->|Yes| Check4{Page in assignedPages?}
    Check4 -->|No| BlockPerm[BLOCK: Redirect to Dashboard<br/>Toast: No access to page]

    Check4 -->|Yes| AllowProtected[ALLOW: Render Component]

    RootAuth --> End[Navigation Complete]
    RootNoAuth --> End
    BlockPublic --> End
    AllowPublic --> End
    BlockUnauth --> End
    BlockRole --> End
    BlockPerm --> End
    AllowProtected --> End

    style Start fill:#e1f5ff
    style AllowPublic fill:#c8e6c9
    style AllowProtected fill:#c8e6c9
    style BlockPublic fill:#ffcdd2
    style BlockUnauth fill:#ffcdd2
    style BlockRole fill:#ffcdd2
    style BlockPerm fill:#ffcdd2
    style End fill:#b39ddb
```

### withAuth Protection Cases

```mermaid
graph LR
    A[withAuth Cases] --> B[Case 1: Root Route]
    A --> C[Case 2: Authenticated on Public Route]
    A --> D[Case 3: Unauthenticated on Protected Route]
    A --> E[Case 4: Wrong Role Access]
    A --> F[Case 5: No Page Permission]

    B --> B1[If authenticated → dashboard<br/>If not → /signin]
    C --> C1[Block access<br/>Redirect to dashboard<br/>Toast error]
    D --> D1[Block access<br/>Redirect to /signin<br/>Toast error]
    E --> E1[Block access<br/>Redirect to own dashboard<br/>Toast error]
    F --> F1[Block access<br/>Redirect to dashboard<br/>Toast error]

    style A fill:#e1f5ff
    style B1 fill:#c8e6c9
    style C1 fill:#ffcdd2
    style D1 fill:#ffcdd2
    style E1 fill:#ffcdd2
    style F1 fill:#ffcdd2
```

---

## Admin Dashboard Structure

### Component Hierarchy & Layout

```mermaid
graph TD
    A[AdminDashboard] --> B[Grid 1: Stats Cards Row]
    A --> C[Grid 2: Charts Row 1]
    A --> D[Grid 3: Charts Row 2]
    A --> E[Grid 4: Distribution Charts]
    A --> F[Grid 5: Session Analysis]
    A --> G[Grid 6: Tables]

    B --> B1[AdminDashboardStatsCard x6]
    B1 --> B2[Active Students]
    B1 --> B3[New Enrollments]
    B1 --> B4[Student Retention]
    B1 --> B5[Churn Rate]
    B1 --> B6[Avg Sessions]
    B1 --> B7[Active Teachers]

    C --> C1[SessionsChart<br/>Area Chart]
    C --> C2[EnrollmentTrendsChart<br/>Line Chart]

    D --> D1[AttendanceChart<br/>Bar Chart]
    D --> D2[UserEngagementChart<br/>Multi-Area Chart]

    E --> E1[StudentDistributionChart<br/>Pie Chart<br/>By Curriculum]
    E --> E2[GradeDistributionChart<br/>Bar Chart<br/>By Grade Level]

    F --> F1[SessionsHourChart<br/>Histogram<br/>By Hour]
    F --> F2[GeographicDistributionChart<br/>Interactive Map<br/>react-simple-maps]

    G --> G1[TodaysSessionsTable<br/>Activity Table]
    G --> G2[TutorPerformance<br/>Leaderboard Table]

    B2 --> API1[API: getComparisionAnalytics]
    B3 --> API1
    B4 --> API1
    B5 --> API1
    B6 --> API1
    B7 --> API1

    F2 --> API2[API: dataAnalyticsCountByCountry]

    G1 --> API3[API: getAllUsers]
    G2 --> API3

    style A fill:#e1f5ff
    style API1 fill:#ffecb3
    style API2 fill:#ffecb3
    style API3 fill:#ffecb3
```

### Admin Dashboard Visual Layout

```
╔════════════════════════════════════════════════════════════════╗
║                       ADMIN DASHBOARD                          ║
╠════════════════════════════════════════════════════════════════╣
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        ║
║  │ 📊 Active    │  │ 📝 New       │  │ 🔄 Student   │        ║
║  │   Students   │  │   Enrollments│  │   Retention  │        ║
║  │   1,234 ↑5%  │  │   89 ↑12%    │  │   87% ↓2%    │        ║
║  └──────────────┘  └──────────────┘  └──────────────┘        ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        ║
║  │ 📉 Churn     │  │ 📅 Avg.      │  │ 👨‍🏫 Active   │        ║
║  │   Rate       │  │   Sessions   │  │   Teachers   │        ║
║  │   3.2% ↓1%   │  │   4.5 ↑8%    │  │   45 ↑3%     │        ║
║  └──────────────┘  └──────────────┘  └──────────────┘        ║
╠════════════════════════════════════════════════════════════════╣
║  ┌─────────────────────────────┐ ┌─────────────────────────┐  ║
║  │  📈 Sessions Booked         │ │ 📊 Enrollment Trends    │  ║
║  │  (Last 30 Days)             │ │ (New vs Churn)          │  ║
║  │                             │ │                         │  ║
║  │      /\    /\               │ │   ──── New              │  ║
║  │     /  \  /  \   /\         │ │   ---- Churn            │  ║
║  │    /    \/    \_/  \        │ │                         │  ║
║  └─────────────────────────────┘ └─────────────────────────┘  ║
╠════════════════════════════════════════════════════════════════╣
║  ┌─────────────────────────────┐ ┌─────────────────────────┐  ║
║  │  📊 Attendance by Subject   │ │ 📈 User Engagement      │  ║
║  │                             │ │                         │  ║
║  │  Math    ████████ 85%       │ │  Active Users ────      │  ║
║  │  Science ██████ 78%         │ │  Time Spent ····        │  ║
║  │  English █████████ 92%      │ │  New Users ----         │  ║
║  └─────────────────────────────┘ └─────────────────────────┘  ║
╠════════════════════════════════════════════════════════════════╣
║  ┌─────────────────────────────┐ ┌─────────────────────────┐  ║
║  │  🥧 Student Distribution    │ │ 📊 Grade Distribution   │  ║
║  │     (By Curriculum)         │ │                         │  ║
║  │                             │ │  Grade 10 ████████      │  ║
║  │      ╱─────╲                │ │  Grade 11 ██████        │  ║
║  │     │ IGCSE │ 40%           │ │  Grade 12 █████         │  ║
║  │     │ CBSE  │ 30%           │ │  Grade 9  ███████       │  ║
║  │      ╲─────╱                │ │  Grade 8  ████          │  ║
║  └─────────────────────────────┘ └─────────────────────────┘  ║
╠════════════════════════════════════════════════════════════════╣
║  ┌─────────────────────────────┐ ┌─────────────────────────┐  ║
║  │  🕐 Sessions by Hour        │ │ 🗺️  Geographic Map      │  ║
║  │                             │ │                         │  ║
║  │  9AM  ███                   │ │   ┌─────────────────┐   │  ║
║  │  3PM  ████████              │ │   │  🌍 World Map   │   │  ║
║  │  6PM  ████████████          │ │   │  📍 Markers     │   │  ║
║  └─────────────────────────────┘ └─────────────────────────┘  ║
╠════════════════════════════════════════════════════════════════╣
║  ┌─────────────────────────────┐ ┌─────────────────────────┐  ║
║  │  📅 Today's Sessions        │ │ 🏆 Top Tutor Performance│  ║
║  │                             │ │                         │  ║
║  │  10:00 | Math | John | ✅   │ │  1. Alice | 98 | ⭐4.9 │  ║
║  │  11:30 | Sci  | Jane | ⏳   │ │  2. Bob   | 87 | ⭐4.8 │  ║
║  │  14:00 | Eng  | Mike | 📅   │ │  3. Carol | 76 | ⭐4.7 │  ║
║  └─────────────────────────────┘ └─────────────────────────┘  ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Student/Teacher Dashboard Structure

### Component Hierarchy & Layout

```mermaid
graph TD
    A[StudentTeacherDashboard] --> B[Left Column]
    A --> C[Right Column]

    B --> B1[Dashboard Cards x3]
    B --> B2[OngoingClass Component]
    B --> B3[SessionHistory Component<br/>Teacher Only]

    C --> C1[Enrollment Component]
    C --> C2[Sessions Component]

    B1 --> B1A{Role Type?}
    B1A -->|Teacher| B1T[Total Students<br/>Upcoming Classes<br/>Hours Taught]
    B1A -->|Student| B1S[Subjects Enrolled<br/>Classes Attended<br/>Upcoming Classes]
    B1A -->|Parent| B1P[Total Subjects All Children<br/>Total Attended<br/>Total Upcoming]

    B2 --> B2A[Card Display]
    B2A --> B2B[Join Class Button]
    B2A --> B2C[Extend Class Button<br/>Teacher Only]
    B2A --> B2D[Generate Ticket Button]
    B2 --> B2E[ExtendClassModal]

    B3 --> B3A[Line/Area Chart<br/>Monthly Session Count]

    C1 --> C1A[Enrollment Cards x10]
    C1A --> C1B[Subject Info]
    C1A --> C1C[Tutor/Student Info]
    C1A --> C1D[Board & Curriculum]
    C1A --> C1E[Grade & Rate]

    C2 --> C2A[Session Cards xN]
    C2A --> C2B[Subject & Time]
    C2A --> C2C[Status Badge]
    C2A --> C2D[Join Button if Upcoming]

    B1T --> API1[API: getDashboardAnalytics<br/>role=teacher]
    B1S --> API2[API: getDashboardAnalytics<br/>role=student]
    B1P --> API3[API: getDashboardAnalytics<br/>role=parent, childrens]

    B2 --> API4[API: getOngoingClasses<br/>Refresh: 3s]
    B3A --> API5[API: monthlySessionCount]
    C1 --> API6[API: getAllEnrollments]
    C2 --> API7[API: getAllSessions]

    style A fill:#e1f5ff
    style API1 fill:#ffecb3
    style API2 fill:#ffecb3
    style API3 fill:#ffecb3
    style API4 fill:#ffcdd2
    style API5 fill:#ffecb3
    style API6 fill:#ffecb3
    style API7 fill:#ffecb3
```

### Student/Teacher Dashboard Visual Layout

```
╔═══════════════════════════════════════════════════════════════╗
║              STUDENT / TEACHER / PARENT DASHBOARD             ║
╠═══════════════════════════════════════════════════════════════╣
║  ┌───────────────────┐  ┌────────────────────────────────┐   ║
║  │  LEFT COLUMN      │  │  RIGHT COLUMN                  │   ║
║  │                   │  │                                │   ║
║  │ ┌───────────────┐ │  │ ┌────────────────────────────┐ │   ║
║  │ │ 📊 Card 1     │ │  │ │ 📚 ENROLLMENT              │ │   ║
║  │ │ Total Students│ │  │ │                            │ │   ║
║  │ │     156       │ │  │ │ ┌────────────────────────┐ │ │   ║
║  │ └───────────────┘ │  │ │ │ Math - Grade 10        │ │ │   ║
║  │                   │  │ │ │ Teacher: John Doe      │ │ │   ║
║  │ ┌───────────────┐ │  │ │ │ IGCSE | Cambridge      │ │ │   ║
║  │ │ 📅 Card 2     │ │  │ │ │ $25/hr                 │ │ │   ║
║  │ │ Upcoming      │ │  │ │ └────────────────────────┘ │ │   ║
║  │ │ Classes: 8    │ │  │ │                            │ │   ║
║  │ └───────────────┘ │  │ │ ┌────────────────────────┐ │ │   ║
║  │                   │  │ │ │ Science - Grade 10     │ │ │   ║
║  │ ┌───────────────┐ │  │ │ │ Teacher: Jane Smith    │ │ │   ║
║  │ │ ⏱️ Card 3     │ │  │ │ │ CBSE | NCERT           │ │ │   ║
║  │ │ Hours Taught  │ │  │ │ │ $30/hr                 │ │ │   ║
║  │ │     124.5     │ │  │ │ └────────────────────────┘ │ │   ║
║  │ └───────────────┘ │  │ │                            │ │   ║
║  │                   │  │ │ ... (8 more enrollments)  │ │   ║
║  │ ┌───────────────┐ │  │ └────────────────────────────┘ │   ║
║  │ │ 🔴 ONGOING    │ │  │                                │   ║
║  │ │   CLASSES     │ │  │ ┌────────────────────────────┐ │   ║
║  │ │   (Live)      │ │  │ │ 📅 SESSIONS                │ │   ║
║  │ │               │ │  │ │                            │ │   ║
║  │ │ Mathematics   │ │  │ │ ┌────────────────────────┐ │ │   ║
║  │ │ 10:00-11:00   │ │  │ │ │ Math | Mon 3:00 PM     │ │ │   ║
║  │ │ [Join] [+15]  │ │  │ │ │ Status: Scheduled      │ │ │   ║
║  │ │ [Ticket]      │ │  │ │ │ [Join Class]           │ │ │   ║
║  │ │               │ │  │ │ └────────────────────────┘ │ │   ║
║  │ │ Refresh: 3s ⟳ │ │  │ │                            │ │   ║
║  │ └───────────────┘ │  │ │ ┌────────────────────────┐ │ │   ║
║  │                   │  │ │ │ Science | Tue 4:00 PM  │ │ │   ║
║  │ ┌───────────────┐ │  │ │ │ Status: Completed ✅   │ │ │   ║
║  │ │ 📊 SESSION    │ │  │ │ └────────────────────────┘ │ │   ║
║  │ │   HISTORY     │ │  │ │                            │ │   ║
║  │ │   (Teacher)   │ │  │ │ ... (more sessions)        │ │   ║
║  │ │               │ │  │ └────────────────────────────┘ │   ║
║  │ │     /\  /\    │ │  │                                │   ║
║  │ │    /  \/  \   │ │  │                                │   ║
║  │ │  Jan Feb Mar  │ │  │                                │   ║
║  │ └───────────────┘ │  │                                │   ║
║  └───────────────────┘  └────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## API Call Sequence Diagrams

### Sign-In & Initial Data Load

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant SignInForm
    participant AuthAPI
    participant AnalyticsAPI
    participant RolesAPI
    participant ResourcesAPI
    participant UsersAPI
    participant Redux
    participant Router

    User->>SignInForm: Enter email & password
    SignInForm->>AuthAPI: POST /api/user/signIn
    AuthAPI-->>SignInForm: {token, user, enrollementIds, childrens}

    par Parallel Data Fetching
        SignInForm->>RolesAPI: GET /api/roles/{roleId}/pages
        and
        SignInForm->>UsersAPI: GET /api/users-by-group
        and
        SignInForm->>ResourcesAPI: GET /api/resources
        and
        SignInForm->>RolesAPI: GET /api/roles
    end

    RolesAPI-->>SignInForm: assignedPages[]
    UsersAPI-->>SignInForm: usersByGroup{}
    ResourcesAPI-->>SignInForm: resources{}
    RolesAPI-->>SignInForm: roles[]

    SignInForm->>Redux: dispatch(setUserData)
    SignInForm->>Redux: dispatch(setAssignedPages)
    SignInForm->>Redux: dispatch(setUsersByGroup)
    SignInForm->>Redux: dispatch(setResources)
    SignInForm->>Redux: dispatch(setRoles)

    Redux-->>SignInForm: All slices updated

    SignInForm->>SignInForm: roleName = refactorName(user.role.name)
    SignInForm->>Router: push(/{roleName}/dashboard)
    Router-->>User: Dashboard loaded
```

---

### Admin Dashboard Data Load

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Dashboard
    participant ReactQuery
    participant AnalyticsAPI
    participant UsersAPI
    participant Redux

    User->>Dashboard: Navigate to /admin/dashboard
    Dashboard->>Redux: Get token from state

    par Parallel API Calls
        Dashboard->>ReactQuery: useQuery(getComparisionAnalytics)
        ReactQuery->>AnalyticsAPI: GET /api/analytics/getComparisonData
        and
        Dashboard->>ReactQuery: useQuery(countByCountry)
        ReactQuery->>AnalyticsAPI: GET /api/analytics/count-by-country
        and
        Dashboard->>ReactQuery: useQuery(getAllUsers)
        ReactQuery->>UsersAPI: GET /api/users?userType=3
    end

    AnalyticsAPI-->>ReactQuery: {activeStudents, enrollments, ...}
    AnalyticsAPI-->>ReactQuery: [{country, userCount}, ...]
    UsersAPI-->>ReactQuery: [{id, name, ...}, ...]

    ReactQuery->>ReactQuery: Cache all responses
    ReactQuery-->>Dashboard: Return cached data

    Dashboard->>Dashboard: Render 6 stats cards
    Dashboard->>Dashboard: Render 7 charts
    Dashboard->>Dashboard: Render geographic map
    Dashboard->>Dashboard: Render tables

    Dashboard-->>User: Complete dashboard displayed
```

---

### Student/Teacher Dashboard Data Load

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Dashboard
    participant ReactQuery
    participant AnalyticsAPI
    participant EnrollmentAPI
    participant SessionAPI
    participant ClassAPI
    participant Redux

    User->>Dashboard: Navigate to /teacher/dashboard
    Dashboard->>Redux: Get token, userId, roleId

    par Parallel API Calls
        Dashboard->>ReactQuery: useQuery(getDashboardAnalytics)
        ReactQuery->>AnalyticsAPI: GET /api/analytics/dashboard?role=teacher
        and
        Dashboard->>ReactQuery: useQuery(getOngoingClasses)
        ReactQuery->>ClassAPI: GET /api/class-schedule/ongoing?tutor_id
        and
        Dashboard->>ReactQuery: useQuery(monthlySessionCount)
        ReactQuery->>SessionAPI: GET /api/sessions/monthly-count?tutor_id
        and
        Dashboard->>ReactQuery: useQuery(getAllEnrollments)
        ReactQuery->>EnrollmentAPI: GET /api/enrollment/getAllEnrollment
        and
        Dashboard->>ReactQuery: useQuery(getAllSessions)
        ReactQuery->>SessionAPI: GET /api/sessions/getAllSessionsWithGroupIds
    end

    AnalyticsAPI-->>ReactQuery: {enrollmentsCount, totalUpcomingClasses, ...}
    ClassAPI-->>ReactQuery: [{classId, subject, ...}, ...]
    SessionAPI-->>ReactQuery: [{month, count}, ...]
    EnrollmentAPI-->>ReactQuery: [{enrollmentId, subject, ...}, ...]
    SessionAPI-->>ReactQuery: [{sessionId, time, status, ...}, ...]

    ReactQuery->>ReactQuery: Cache responses
    ReactQuery-->>Dashboard: Return data

    Dashboard->>Dashboard: Render 3 cards
    Dashboard->>Dashboard: Render ongoing classes
    Dashboard->>Dashboard: Render session history
    Dashboard->>Dashboard: Render enrollments
    Dashboard->>Dashboard: Render sessions

    Dashboard-->>User: Complete dashboard displayed

    Note over ReactQuery,ClassAPI: Auto-refresh every 3 seconds
    loop Every 3 seconds
        ReactQuery->>ClassAPI: GET /api/class-schedule/ongoing
        ClassAPI-->>ReactQuery: Updated ongoing classes
        ReactQuery-->>Dashboard: Update UI
    end
```

---

### Extend Class Action Flow

```mermaid
sequenceDiagram
    autonumber
    participant Teacher
    participant OngoingClass
    participant ExtendModal
    participant ReactQuery
    participant ClassAPI
    participant Redux

    Teacher->>OngoingClass: Click "Extend" button
    OngoingClass->>ExtendModal: Open modal
    ExtendModal-->>Teacher: Show duration options

    Teacher->>ExtendModal: Select 15/30/60 minutes
    Teacher->>ExtendModal: Click "Submit"

    ExtendModal->>ReactQuery: useMutation(extendClass)

    Note over ReactQuery: Optimistic Update
    ReactQuery->>ReactQuery: Cancel ongoing queries
    ReactQuery->>ReactQuery: Update cache with new endTime
    ReactQuery-->>OngoingClass: UI updates immediately

    ReactQuery->>ClassAPI: POST /api/class-schedule/{id}/extend
    ClassAPI->>ClassAPI: Update database

    alt Success
        ClassAPI-->>ReactQuery: {success: true, newEndTime}
        ReactQuery->>ReactQuery: Confirm cache update
        ReactQuery-->>Teacher: Show success toast
    else Error
        ClassAPI-->>ReactQuery: {error: message}
        ReactQuery->>ReactQuery: Rollback cache
        ReactQuery-->>Teacher: Show error toast
    end

    ExtendModal->>ExtendModal: Close modal
    OngoingClass->>ReactQuery: Refetch ongoingClasses
    ReactQuery->>ClassAPI: GET /api/class-schedule/ongoing
    ClassAPI-->>ReactQuery: Updated classes
    ReactQuery-->>OngoingClass: Fresh data displayed
```

---

## State Management Flow

### Redux Store Architecture

```mermaid
graph TD
    A[Redux Store] --> B[Persisted Slices]
    A --> C[Non-Persisted Slices]

    B --> B1[user slice]
    B --> B2[assignedPages slice]
    B --> B3[roles slice]
    B --> B4[resources slice]
    B --> B5[usersByGroup slice]

    B1 --> LS1[localStorage: user]
    B2 --> LS2[localStorage: assignedPages]
    B3 --> LS3[localStorage: roles]
    B4 --> LS4[localStorage: resources]
    B5 --> LS5[localStorage: usersByGroup]

    B1 --> D[User Slice Details]
    D --> D1[token: string]
    D --> D2[user: User object]
    D --> D3[enrollementIds: number array]
    D --> D4[childrens: number array]
    D --> D5[hasInitialized: boolean]

    B2 --> E[Assigned Pages Details]
    E --> E1[assignedPages: Page array]
    E1 --> E2[route, name, icon]

    B3 --> F[Roles Details]
    F --> F1[roles: Role array]
    F1 --> F2[id, name]

    B4 --> G[Resources Details]
    G --> G1[boards: Board array]
    G --> G2[grades: Grade array]
    G --> G3[subjects: Subject array]
    G --> G4[curriculums: Curriculum array]

    B5 --> H[Users by Group Details]
    H --> H1[students: User array]
    H --> H2[teachers: User array]
    H --> H3[parents: User array]

    style A fill:#e1f5ff
    style B fill:#c8e6c9
    style LS1 fill:#fff9c4
    style LS2 fill:#fff9c4
    style LS3 fill:#fff9c4
    style LS4 fill:#fff9c4
    style LS5 fill:#fff9c4
```

### Data Persistence Flow

```mermaid
sequenceDiagram
    participant App
    participant Redux
    participant Middleware
    participant LocalStorage
    participant Component

    Note over App,LocalStorage: Page Load / Refresh
    App->>Redux: Initialize store
    Redux->>LocalStorage: Read persisted state
    LocalStorage-->>Redux: Return cached state
    Redux->>Middleware: REHYDRATE action
    Middleware->>Redux: Update store with cached data
    Redux-->>Component: State available immediately

    Note over App,LocalStorage: User Action
    Component->>Redux: dispatch(setUserData)
    Redux->>Middleware: State change detected
    Middleware->>LocalStorage: Write to localStorage
    LocalStorage-->>Middleware: Confirm write
    Middleware-->>Redux: Persist complete

    Note over App,LocalStorage: User Logs Out
    Component->>Redux: dispatch(emptyUserData)
    Redux->>Middleware: Clear state
    Middleware->>LocalStorage: Remove persisted data
    LocalStorage-->>Middleware: Confirm removal
    Redux-->>Component: State cleared
```

---

## Real-Time Update Flow

### Ongoing Classes Auto-Refresh

```mermaid
sequenceDiagram
    participant Dashboard
    participant ReactQuery
    participant API
    participant Component

    Dashboard->>ReactQuery: useQuery with refetchInterval: 3000

    Note over Dashboard,Component: Initial Load
    ReactQuery->>API: GET /api/class-schedule/ongoing
    API-->>ReactQuery: [{classId, subject, startTime, ...}, ...]
    ReactQuery->>ReactQuery: Cache data
    ReactQuery-->>Component: Render ongoing classes

    Note over Dashboard,Component: After 3 seconds
    ReactQuery->>API: GET /api/class-schedule/ongoing
    API-->>ReactQuery: Updated data
    ReactQuery->>ReactQuery: Compare with cache

    alt Data Changed
        ReactQuery->>Component: Re-render with new data
        Component-->>Dashboard: Updated UI
    else Data Unchanged
        ReactQuery->>ReactQuery: Keep cache
        Note over Component: No re-render
    end

    Note over Dashboard,Component: Loop continues every 3 seconds
    loop Every 3 seconds
        ReactQuery->>API: Fetch latest data
        API-->>ReactQuery: Return data
        ReactQuery->>Component: Update if changed
    end

    Note over Dashboard,Component: User navigates away
    Dashboard->>ReactQuery: Cleanup effect
    ReactQuery->>ReactQuery: Stop refetch interval
```

### Protected Layout Data Refresh

```mermaid
sequenceDiagram
    participant Layout
    participant Redux
    participant API
    participant Timer

    Layout->>Timer: setInterval(120000)

    Note over Layout,Timer: Every 2 minutes
    loop Every 120 seconds
        Timer->>Redux: Trigger refresh

        par Parallel Refresh
            Redux->>API: fetchAllPagesAssignToUser
            and
            Redux->>API: fetchRoles
            and
            Redux->>API: fetchResources
            and
            Redux->>API: fetchUsersByGroup
        end

        API-->>Redux: Updated assignedPages
        API-->>Redux: Updated roles
        API-->>Redux: Updated resources
        API-->>Redux: Updated usersByGroup

        Redux->>Redux: Update all slices
        Redux-->>Layout: State updated

        Note over Layout: Components using this data re-render
    end

    Note over Layout,Timer: User logs out or navigates away
    Layout->>Timer: clearInterval()
    Timer->>Timer: Stop refresh
```

---

## Complete Navigation Mind Map

### Entire Application Flow

```
Tuitional LMS Frontend
│
├── Authentication System
│   ├── Public Routes
│   │   ├── /signin
│   │   │   ├── Email & Password form
│   │   │   ├── Validation (React Hook Form)
│   │   │   ├── API: POST /api/user/signIn
│   │   │   └── On Success → Parallel Data Fetching
│   │   ├── /forgot-password
│   │   ├── /password-reset/[email]
│   │   └── /confirm-password/[email]
│   │
│   └── Authentication Response
│       ├── Token (JWT)
│       ├── User Object (id, roleId, name, role.name)
│       ├── enrollementIds (for students)
│       └── childrens (for parents)
│
├── Post-Authentication Data Fetching
│   ├── fetchAllPagesAssignToUser → assignedPages slice
│   ├── fetchUsersByGroup → usersByGroup slice
│   ├── fetchResources → resources slice
│   └── fetchRoles → roles slice
│
├── Role Transformation & Redirect
│   ├── Extract role.name from response
│   ├── Transform to camelCase
│   │   ├── "Super Admin" → "superAdmin"
│   │   ├── "School Admin" → "schoolAdmin"
│   │   ├── "Student" → "student"
│   │   ├── "Teacher" → "teacher"
│   │   ├── "Parent" → "parent"
│   │   ├── "Counsellor" → "counsellor"
│   │   └── "HR" → "hr"
│   └── Navigate to /{roleName}/dashboard
│
├── Protected Routes System (withAuth HOC)
│   ├── Route Protection Cases
│   │   ├── Case 1: Root "/" → Redirect based on auth
│   │   ├── Case 2: Authenticated on public route → Block
│   │   ├── Case 3: Unauthenticated on protected → Block
│   │   ├── Case 4: Wrong role access → Block
│   │   └── Case 5: No page permission → Block
│   │
│   ├── Verification Steps
│   │   ├── Check token exists
│   │   ├── Check user.roleId exists
│   │   ├── Check role matches URL
│   │   └── Check page in assignedPages
│   │
│   └── Redirect Logic
│       ├── Unauthenticated → /signin
│       ├── Authenticated on public → /{role}/dashboard
│       └── No permission → /{role}/dashboard
│
├── Dashboard Routing
│   ├── Route: /{role}/dashboard
│   ├── Dashboard Selection
│   │   ├── IF role = student/teacher/parent
│   │   │   └── Load: StudentTeacherDashboard
│   │   └── ELSE (superAdmin/admin/counsellor/hr)
│   │       └── Load: AdminDashboard
│   │
│   ├── Admin Dashboard
│   │   ├── Users: superAdmin, admin, counsellor, hr
│   │   ├── Layout: 6 grids, 11 components
│   │   ├── Components
│   │   │   ├── Grid 1: 6 Stats Cards
│   │   │   │   ├── Active Students (↑/↓ %)
│   │   │   │   ├── New Enrollments (↑/↓ %)
│   │   │   │   ├── Student Retention (↑/↓ %)
│   │   │   │   ├── Churn Rate (↑/↓ %)
│   │   │   │   ├── Avg Sessions (↑/↓ %)
│   │   │   │   └── Active Teachers (↑/↓ %)
│   │   │   ├── Grid 2: Charts Row 1
│   │   │   │   ├── Sessions Chart (Area)
│   │   │   │   └── Enrollment Trends (Line)
│   │   │   ├── Grid 3: Charts Row 2
│   │   │   │   ├── Attendance Chart (Bar)
│   │   │   │   └── User Engagement (Multi-Area)
│   │   │   ├── Grid 4: Distribution Charts
│   │   │   │   ├── Student Distribution (Pie)
│   │   │   │   └── Grade Distribution (Bar)
│   │   │   ├── Grid 5: Session Analysis
│   │   │   │   ├── Sessions by Hour (Histogram)
│   │   │   │   └── Geographic Map (react-simple-maps)
│   │   │   └── Grid 6: Tables
│   │   │       ├── Today's Sessions Table
│   │   │       └── Tutor Performance Table
│   │   ├── API Calls
│   │   │   ├── getComparisionAnalytics
│   │   │   ├── dataAnalyticsCountByCountry
│   │   │   └── getAllUsers
│   │   └── User Actions
│   │       ├── Monitor metrics & trends
│   │       ├── Analyze geographic distribution
│   │       ├── Review tutor performance
│   │       └── Track today's session activity
│   │
│   └── Student/Teacher Dashboard
│       ├── Users: student, teacher, parent
│       ├── Layout: 2-column
│       ├── Left Column Components
│       │   ├── Dashboard Cards (x3)
│       │   │   ├── Teacher View
│       │   │   │   ├── Total Students
│       │   │   │   ├── Upcoming Scheduled Classes
│       │   │   │   └── Total Hours Taught
│       │   │   ├── Student View
│       │   │   │   ├── Subjects Enrolled
│       │   │   │   ├── Classes Attended
│       │   │   │   └── Upcoming Classes
│       │   │   └── Parent View
│       │   │       ├── Total Subjects (all children)
│       │   │       ├── Classes Attended (all children)
│       │   │       └── Upcoming Classes (all children)
│       │   ├── OngoingClass Component
│       │   │   ├── Real-time updates (3s refresh)
│       │   │   ├── Join Class button
│       │   │   ├── Extend Class button (teacher)
│       │   │   ├── Generate Ticket button
│       │   │   └── ExtendClassModal
│       │   └── SessionHistory Component (Teacher only)
│       │       └── Monthly session count chart
│       ├── Right Column Components
│       │   ├── Enrollment Component
│       │   │   ├── Last 10 enrollments
│       │   │   ├── Subject, tutor, board, curriculum
│       │   │   ├── Grade level & hourly rate
│       │   │   └── Role-based filtering
│       │   └── Sessions Component
│       │       ├── Upcoming & past sessions
│       │       ├── Date, time, status
│       │       ├── Join button for upcoming
│       │       └── Color-coded status badges
│       ├── API Calls
│       │   ├── getDashboardAnalytics (role-based)
│       │   ├── getOngoingClasses (3s refresh)
│       │   ├── monthlySessionCount (role-based)
│       │   ├── getAllEnrollments (role-based)
│       │   └── getAllSessions (role-based)
│       └── User Actions
│           ├── View role-specific metrics
│           ├── Join ongoing classes
│           ├── Extend class duration (teacher)
│           ├── Generate support tickets
│           ├── View enrollments & courses
│           └── Manage session schedules
│
├── State Management
│   ├── Redux Store
│   │   ├── Persisted Slices (localStorage)
│   │   │   ├── user slice (token, user, enrollementIds, childrens)
│   │   │   ├── assignedPages slice (accessible routes)
│   │   │   ├── roles slice (all system roles)
│   │   │   ├── resources slice (boards, grades, subjects, curriculums)
│   │   │   └── usersByGroup slice (students, teachers, parents)
│   │   └── Actions
│   │       ├── setUserData (after login)
│   │       ├── emptyUserData (on logout)
│   │       ├── fetchAllPagesAssignToUser
│   │       ├── fetchUsersByGroup
│   │       ├── fetchResources
│   │       └── fetchRoles
│   └── TanStack Query (Server State)
│       ├── Query Configuration
│       │   ├── queryKey (unique identifier)
│       │   ├── queryFn (API call)
│       │   ├── enabled (conditional fetching)
│       │   ├── staleTime (5 minutes default)
│       │   └── refetchInterval (for real-time data)
│       ├── Query Caching (5 minutes)
│       └── Mutations (actions)
│           ├── extendClass
│           ├── joinClassTracking
│           └── generateTicket
│
├── Real-Time Features
│   ├── Ongoing Classes Auto-Refresh
│   │   ├── Interval: 3 seconds
│   │   ├── API: GET /api/class-schedule/ongoing
│   │   └── Updates: Immediate UI refresh on data change
│   └── Protected Layout Auto-Refresh
│       ├── Interval: 2 minutes (120 seconds)
│       ├── Refreshes: assignedPages, roles, resources, usersByGroup
│       └── Purpose: Keep permissions up-to-date
│
├── Performance Optimizations
│   ├── Memoization (React.memo, useMemo, useCallback)
│   ├── Code Splitting (dynamic imports)
│   ├── Query Caching (TanStack Query)
│   ├── Optimistic Updates (mutations)
│   ├── CSS Modules (scoped styling)
│   └── Responsive Design (clamp(), grid auto-fit)
│
└── Security Features
    ├── JWT Token Authentication
    ├── Role-Based Access Control (RBAC)
    ├── Permission-Based Routing
    ├── Route Matching & Verification
    ├── Automatic Redirects
    ├── Token in All API Requests
    └── Logout Cleanup (clear Redux & localStorage)
```

---

## Conclusion

This visual documentation provides:

- ✅ **Complete flowcharts** for authentication and routing
- ✅ **Mermaid diagrams** for role-based navigation
- ✅ **Sequence diagrams** for API interactions
- ✅ **ASCII art layouts** for dashboard structures
- ✅ **Mind maps** for application architecture
- ✅ **State management flows** for Redux and React Query
- ✅ **Real-time update visualizations**

All diagrams are designed to be:
- **Clear and readable** for developers
- **Technically accurate** based on actual implementation
- **Comprehensive** covering all major flows
- **Professional** suitable for technical documentation

Use these diagrams as reference for:
- Onboarding new developers
- Understanding system architecture
- Debugging authentication issues
- Planning new features
- Technical presentations
- Code reviews
