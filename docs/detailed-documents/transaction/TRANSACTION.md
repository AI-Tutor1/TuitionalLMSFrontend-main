# Transaction Module Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Routing](#routing)
4. [Data Flow](#data-flow)
5. [API Integration](#api-integration)
6. [Component Structure](#component-structure)
7. [Transaction Listing](#transaction-listing)
8. [Transaction Details](#transaction-details)
9. [Filtering and Sorting](#filtering-and-sorting)
10. [Transaction Management](#transaction-management)
11. [Role-Based Access](#role-based-access)
12. [State Management](#state-management)
13. [UI Components](#ui-components)
14. [Integration with Other Modules](#integration-with-other-modules)
15. [File References](#file-references)

---

## Overview

The Transaction Module provides comprehensive transaction management and tracking capabilities in the Tuitional LMS. It serves as the financial tracking hub, displaying all debit and credit transactions associated with sessions, manual payments, and billing activities. The module integrates deeply with the Billing, Invoice, and Session modules to provide a complete financial overview.

### Key Features

- **Comprehensive Transaction Tracking**: View all financial transactions (Credits/Debits) across the platform
- **Real-time Data Fetching**: Automatic data loading with TanStack Query caching
- **Advanced Filtering System**:
  - Filter by date range
  - Filter by transaction type (Credit/Debit)
  - Filter by session conclusion type
  - Filter by student/teacher (SuperAdmin only)
  - Sort by session date or creation date
- **Transaction Details View**: Detailed breakdown of individual user transactions
- **Transaction Management** (SuperAdmin only):
  - Delete transactions
  - View transaction history per user
- **Financial Analytics**:
  - Total transaction count
  - Net balance calculation
  - Current balance display
- **Responsive Design**: Optimized desktop table view and mobile card view
- **Role-based Access**: Different views and permissions based on user role

### Transaction Categories

The transaction module handles several types of transactions:

1. **Session-Based Transactions**

   - Automatically generated when sessions are conducted
   - Linked to enrollment and session records
   - Include student and teacher transaction pairs
   - Tied to session conclusion types

2. **Manual Transactions**

   - Manually added by administrators
   - Credit adjustments (adding balance)
   - Debit adjustments (deducting balance)
   - Not linked to specific sessions

3. **Invoice-Related Transactions**

   - Generated when invoices are paid
   - Linked to billing records
   - Update user current balance

4. **Reverted Transactions**
   - Transactions that have been reversed
   - Marked with `isReverted` flag
   - Shown with deleted status

---

## Transaction Generation Logic

The transaction module automatically generates transactions based on session attendance status. The logic determines when a transaction should be created and who should be credited or debited.

### Transaction Generation Decision Flow

The transaction generation logic is integrated into the main **Complete Transaction Module Flow** diagram in the Data Flow section. The flowchart shows how attendance status determines whether transactions are generated and how they flow through the entire system.

### Attendance-Based Transaction Rules

The system follows specific rules to ensure fair billing based on actual attendance:

#### Rule 1: Both Student and Teacher Present

**Condition**: Student status = Present AND Teacher status = Present

**Action**: ✅ Generate Transaction

**Transaction Details**:

- **Teacher Transaction**: Credit (Teacher receives payment)
- **Student Transaction**: Debit (Student is charged)
- **Reasoning**: Both parties attended the session, so standard payment applies

**Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Session Conclusion: Conducted
Student: Present
Teacher: Present
Result:
  - Teacher receives +$50 (Credit)
  - Student is charged -$50 (Debit)
</pre>

{% endraw %}

#### Rule 2: Both Student and Teacher Absent

**Condition**: Student status = Absent AND Teacher status = Absent

**Action**: ❌ No Transaction Generated

**Reasoning**: Since neither party attended the session, no payment should be processed

**Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Session Conclusion: Both Absent
Student: Absent
Teacher: Absent
Result: No transactions created
</pre>

{% endraw %}

#### Rule 3: Student Absent, Teacher Present

**Condition**: Student status = Absent AND Teacher status = Present

**Action**: ✅ Generate Transaction

**Transaction Details**:

- **Teacher Transaction**: Credit (Teacher receives payment)
- **Student Transaction**: Debit (Student is charged)
- **Reasoning**: Teacher showed up and was available. Student is responsible for the absence and must pay

**Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Session Conclusion: Student Absent
Student: Absent
Teacher: Present
Result:
  - Teacher receives +$50 (Credit)
  - Student is charged -$50 (Debit)
</pre>

{% endraw %}

#### Rule 4: Teacher Absent, Student Present

**Condition**: Student status = Present AND Teacher status = Absent

**Action**: ❌ No Transaction Generated

**Reasoning**: Teacher did not fulfill their obligation to conduct the session. Student should not be charged

**Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Session Conclusion: Teacher Absent
Student: Present
Teacher: Absent
Result: No transactions created
</pre>

{% endraw %}

### Transaction Generation Summary Table

| Student Status | Teacher Status | Transaction Generated? | Teacher | Student |
| -------------- | -------------- | ---------------------- | ------- | ------- |
| Present        | Present        | ✅ Yes                 | Credit  | Debit   |
| Absent         | Absent         | ❌ No                  | -       | -       |
| Absent         | Present        | ✅ Yes                 | Credit  | Debit   |
| Present        | Absent         | ❌ No                  | -       | -       |

### Implementation Details

**Backend Logic**:

- Transactions are created automatically when a session is marked as concluded
- The session conclusion type determines the attendance status
- Transaction pairs are created (one for teacher, one for student) only when rules are met
- Each transaction includes:
  - User ID (teacher or student)
  - Transaction type (Credit or Debit)
  - Cost (based on enrollment hourly rate and session duration)
  - Session ID reference
  - Enrollment ID reference
  - Remaining balance after transaction

**Related Session Conclusion Types**:

- **Conducted**: Both present (Rule 1)
- **Student Absent**: Student absent, teacher present (Rule 3)
- **Teacher Absent**: Teacher absent, student present (Rule 4)
- **Cancelled**: Both absent (Rule 2)

**Balance Impact**:

- **Credit transactions** increase the user's balance (positive)
- **Debit transactions** decrease the user's balance (negative)
- Remaining balance is calculated after each transaction
- Balance updates are reflected in the billing module

### Edge Cases and Special Scenarios

1. **Late Cancellation**:

   - If marked as "Student Absent" with advance notice, Rule 3 still applies
   - Teacher is compensated for blocked time

2. **Make-up Sessions**:

   - If a make-up session is scheduled after "Teacher Absent", new transactions are generated for the make-up session
   - Original session remains with no transactions

3. **Group Sessions**:

   - Each student in the group gets their own transaction based on their individual attendance
   - Teacher receives credit if at least one student is present or all students are absent but teacher is present
   - If all students are absent and teacher is absent, no transactions are generated

4. **Partial Attendance in Group Sessions**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Example Group Session:
- Student A: Present → Debit
- Student B: Absent → Debit (teacher was present)
- Student C: Present → Debit
- Teacher: Present → Credit (one credit transaction, total of all attending/billable students)
</pre>

{% endraw %}

---

## Architecture

### Module Structure

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
src/
├── app/(protected)/[role]/
│   ├── transactions/
│   │   └── page.tsx                    # Transaction list page route
│   └── transaction-details/
│       └── [id]/
│           └── page.tsx                # User transaction details route
│
├── screens/
│   ├── transactions/
│   │   ├── transactions.tsx            # Main transactions screen
│   │   └── transactions.module.css     # Screen styles
│   └── transaction-details/
│       ├── transactions-details.tsx    # Transaction details screen
│       └── transactions-details.module.css
│
├── components/ui/superAdmin/transaction/
│   ├── transaction-table/
│   │   ├── transaction-table.tsx       # Desktop table view
│   │   └── transaction-table.module.css
│   └── mobileView-card/
│       ├── mobileView-card.tsx         # Mobile card view
│       └── mobileView-card.module.css
│
└── services/dashboard/superAdmin/
    ├── transactions/
    │   ├── transactions.ts             # Transaction API functions
    │   └── transaction.types.ts        # TypeScript types
    └── billing/
        ├── billing.ts                  # Related billing APIs
        └── billing.types.ts            # Billing types
</pre>

{% endraw %}

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **State Management**: TanStack Query for server state
- **UI Library**: Material-UI (MUI) components
- **Styling**: CSS Modules
- **Date Handling**: Moment.js with timezone support
- **Responsive Design**: react-responsive for viewport detection
- **Notifications**: React-Toastify for user feedback

---

## Routing

### Route Structure

The Transaction module uses Next.js App Router with dynamic role-based routing:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
/[role]/transactions
  - Main transaction list view
  - Protected route (requires authentication)
  - Accessible by: superAdmin, admin, teacher

/[role]/transaction-details/[id]
  - Individual user transaction history
  - Protected route (requires authentication)
  - Accessible by: superAdmin, admin
  - Dynamic parameter: [id] = user_id
</pre>

{% endraw %}

### Route Configuration

**Transaction List Page**: `src/app/(protected)/[role]/transactions/page.tsx`

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
"use client";
import React, { use } from "react";
import Transactions from "@/screens/transactions/transactions";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise&lt;{ role: string }&gt; }) => {
  const { role } = use(params);
  return &lt;Transactions role={role} /&gt;;
};

export default withAuth(Page);
</pre>

{% endraw %}

**Transaction Details Page**: `src/app/(protected)/[role]/transaction-details/[id]/page.tsx`

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
"use client";
import React, { use } from "react";
import TransactionsDetails from "@/screens/transaction-details/transactions-details";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise&lt;{ role: string }&gt; }) => {
  const { role } = use(params);
  return &lt;TransactionsDetails /&gt;;
};

export default withAuth(Page);
</pre>

{% endraw %}

### Navigation Patterns

**From Transaction List to Transaction Details**:

- Click on transaction row navigates to user's transaction history
- Ctrl/Cmd + Click opens in new tab
- Only works for session-based transactions

**From Other Modules**:

- Session Details → View session transactions
- Billing Module → View user transactions
- Invoice Module → View invoice-related transactions

---

## Data Flow

### Flow Chart

Flow Chart Link: https://tinyurl.com/transaction-flow-tuition

### Flow Chart Code

Flow Chart Link: https://tinyurl.com/4wzrarjn

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
flowchart TD
    Start([User Navigates to<br/>Transaction Page]) --> ExtractRole[Extract User Role<br/>from Route Params]

    ExtractRole --> CheckAuth{User<br/>Authenticated?}

    CheckAuth -->|No| RedirectLogin[Redirect to Login<br/>withAuth HOC]
    CheckAuth -->|Yes| CheckToken{Token<br/>Available?}

    CheckToken -->|No| ShowError[Display Error State]
    CheckToken -->|Yes| InitializeScreen[Initialize Transaction Screen<br/>transactions.tsx]

    InitializeScreen --> SetupState[Setup Initial State:<br/>Filters, Pagination<br/>Sort, Delete ID]

    SetupState --> CheckRole{User<br/>Role?}

    CheckRole -->|SuperAdmin| LoadFilters[Load All Filters:<br/>Date, Type, Session Type<br/>Student, Teacher]
    CheckRole -->|Admin| LoadAdminFilters[Load Filters:<br/>Date, Session Type]
    CheckRole -->|Teacher| LoadTeacherFilters[Load Filters:<br/>Date, Session Type<br/>Auto-filter to own ID]

    LoadFilters --> BuildParams[Build Query Parameters]
    LoadAdminFilters --> BuildParams
    LoadTeacherFilters --> BuildParams

    BuildParams --> FetchData[TanStack Query<br/>getAllTransactions]

    FetchData --> APICall[GET /api/transactions<br/>with filters, pagination]

    APICall --> BackendProcess[Backend Processing]

    BackendProcess --> CheckSource{Transaction<br/>Source?}

    CheckSource -->|Session Concluded| SessionFlow[Session Conclusion Flow]

    SessionFlow --> AttendanceCheck{Check<br/>Attendance}

    AttendanceCheck --> StudentPresent{Student<br/>Present?}

    StudentPresent -->|Yes| TeacherPresent1{Teacher<br/>Present?}
    TeacherPresent1 -->|Yes| GenerateBoth[Generate Transaction Pair:<br/>Teacher Credit<br/>Student Debit]
    TeacherPresent1 -->|No| NoTransaction1[No Transaction<br/>Teacher absent]

    StudentPresent -->|No| TeacherPresent2{Teacher<br/>Present?}
    TeacherPresent2 -->|Yes| GenerateAbsent[Generate Transaction Pair:<br/>Teacher Credit<br/>Student Debit<br/>Student pays for absence]
    TeacherPresent2 -->|No| NoTransaction2[No Transaction<br/>Both absent]

    GenerateBoth --> CalcCost[Calculate Cost:<br/>Hourly Rate x Duration]
    GenerateAbsent --> CalcCost

    CalcCost --> UpdateBilling[Update Billing Balance:<br/>Remaining Balance<br/>Current Balance]

    UpdateBilling --> StoreTransaction[(Store in Database:<br/>Transaction Records<br/>with Enrollment and Session IDs)]

    NoTransaction1 --> ReturnData
    NoTransaction2 --> ReturnData

    CheckSource -->|Manual Entry| ManualFlow[Manual Transaction<br/>Admin Created]
    CheckSource -->|Invoice Payment| InvoiceFlow[Invoice Payment<br/>Credit Transaction]

    ManualFlow --> ManualStore[Store Transaction:<br/>No Session/Enrollment Link]
    InvoiceFlow --> InvoiceStore[Store Transaction:<br/>Link to Billing ID]

    ManualStore --> StoreTransaction
    InvoiceStore --> StoreTransaction

    StoreTransaction --> ReturnData[Return Transaction Data<br/>+ Pagination Info]

    ReturnData --> CacheUpdate[React Query<br/>Cache Update]

    CacheUpdate --> CheckDevice{Device<br/>Type?}

    CheckDevice -->|Desktop| RenderTable[Render Desktop Table:<br/>9 Columns<br/>User Profile, Info, Date<br/>Session Type, Amount, etc.]
    CheckDevice -->|Mobile| RenderCards[Render Mobile Cards:<br/>Vertical Layout<br/>All Transaction Info]

    RenderTable --> DisplayData[Display Transaction List]
    RenderCards --> DisplayData

    DisplayData --> UserAction{User<br/>Action?}

    UserAction -->|Change Filter| UpdateFilter[Update Local State:<br/>Date, Type, Conclusion]
    UpdateFilter --> ResetPage[Reset Current Page to 1]
    ResetPage --> BuildParams

    UserAction -->|Change Page| UpdatePagination[Update Page/Rows Per Page]
    UpdatePagination --> BuildParams

    UserAction -->|Click Sort| ToggleSort[Toggle Sort:<br/>session_date or createdAt]
    ToggleSort --> BuildParams

    UserAction -->|Click Row| CheckSessionLink{Has<br/>Session ID?}
    CheckSessionLink -->|Yes| NavigateSession[Navigate to Session Details:<br/>/session-details/id]
    CheckSessionLink -->|No| NoAction[No Action:<br/>Manual Transaction]

    UserAction -->|Click Delete| CheckDeleteAuth{SuperAdmin<br/>or Admin?}
    CheckDeleteAuth -->|No| ShowDeleteError[Show Permission Error]
    CheckDeleteAuth -->|Yes| ConfirmDelete[Set Delete Transaction ID]

    ConfirmDelete --> DeleteMutation[useMutation:<br/>deleteTransaction]
    DeleteMutation --> DeleteAPI[DELETE /api/transactions/:id]

    DeleteAPI --> DeleteResponse{Success?}
    DeleteResponse -->|No| ShowDeleteAPIError[Show Error Toast:<br/>Delete Failed]
    DeleteResponse -->|Yes| ShowDeleteSuccess[Show Success Toast:<br/>Transaction Deleted]

    ShowDeleteSuccess --> RefetchAfterDelete[Refetch Transaction List]
    RefetchAfterDelete --> ClearDeleteID[Clear Delete Transaction ID]
    ClearDeleteID --> CacheUpdate

    UserAction -->|View User Details| NavigateDetails[Navigate to Transaction Details:<br/>/transaction-details/user_id]

    NavigateDetails --> FetchUserData{Parallel<br/>API Calls}

    FetchUserData -->|Call 1| FetchUserTransactions[GET /api/transactions<br/>?user_id=id]
    FetchUserData -->|Call 2| FetchUserBilling[GET /api/billing/<br/>getAllBillingsWithUserId/id]

    FetchUserTransactions --> CheckTransData{Transaction<br/>Data Available?}
    FetchUserBilling --> CheckBillingData{Billing<br/>Data Available?}

    CheckTransData -->|Error| ShowTransError[Display Transaction Error]
    CheckTransData -->|Success| ParseTransData[Parse Transaction Data]

    CheckBillingData -->|Error| ShowBillingError[Display Billing Error]
    CheckBillingData -->|Success| ParseBillingData[Parse Billing Data]

    ParseTransData --> CalculateTotals[Calculate Financial Totals]
    ParseBillingData --> CalculateTotals

    CalculateTotals --> SumDebit[Sum Total Debit]
    CalculateTotals --> SumCredit[Sum Total Credit]
    CalculateTotals --> CalcNet[Calculate Net Balance:<br/>Credit - Debit]

    SumDebit --> DisplayDetails[Display Transaction Details]
    SumCredit --> DisplayDetails
    CalcNet --> DisplayDetails

    DisplayDetails --> ShowDetailSections[Show All Sections]

    ShowDetailSections --> Section1[User Balance:<br/>Current Balance<br/>Color-coded]
    ShowDetailSections --> Section2[Transaction Table:<br/>Enroll ID, Session ID<br/>Profile, Email, Date, Cost]
    ShowDetailSections --> Section3[Financial Summary:<br/>Total Transactions<br/>Net Balance]

    Section1 --> EndFlow([End])
    Section2 --> EndFlow
    Section3 --> EndFlow

    NavigateSession --> EndFlow
    NoAction --> EndFlow
    ShowDeleteError --> UserAction
    ShowDeleteAPIError --> UserAction
    ShowTransError --> EndFlow
    ShowBillingError --> EndFlow

    RedirectLogin --> EndFlow
    ShowError --> EndFlow
</pre>

{% endraw %}

---

## API Integration

### API Service Layer

Location: `src/services/dashboard/superAdmin/transactions/transactions.ts`

### Available API Functions

#### 1. Get All Transactions

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
getAllTransactions(
  options: Transaction_Api_FilterOptions,
  config: configDataType
): Promise&lt;Get_All_Transactions_ApiResponse&gt;
</pre>

{% endraw %}

**Endpoint**: `GET /api/transactions`

**Query Parameters**:

- `user_id` (string): Filter by user ID (supports comma-separated multiple IDs)
- `start_time` (string): Start date in ISO format
- `end_time` (string): End date in ISO format
- `conclusion_type` (string): Filter by session type
- `type` (string): Transaction type ("Credit" or "Debit")
- `limit` (number): Items per page
- `page` (number): Current page number
- `session_id` (string): Filter by specific session
- `sort_by` (string): Sort field ("session_date" or "createdAt")

**Response Structure**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  data: DataItem[];
}
</pre>

{% endraw %}

**Usage Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { data, error, isLoading } = useQuery({
  queryKey: ["getAllTransactions", transactionParams, token],
  queryFn: () =&gt; getAllTransactions(transactionParams, { token }),
  enabled: !!token,
});
</pre>

{% endraw %}

#### 2. Delete Transaction

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
deleteTransaction(
  options: { id: number },
  config: configDataType
): Promise&lt;{ message: string }&gt;
</pre>

{% endraw %}

**Endpoint**: `DELETE /api/transactions/:id`

**Parameters**:

- `id` (number): Transaction ID to delete

**Response**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  message: string;  // Success message
}
</pre>

{% endraw %}

**Usage Example**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleDeleteTransaction = useMutation({
  mutationFn: (payload: { id: number }) =&gt;
    deleteTransaction(payload, { token }),
  onSuccess: (data) =&gt; {
    toast.success(data.message);
    refetch();
  },
  onError: (error) =&gt; {
    toast.error(error.message);
  },
});
</pre>

{% endraw %}

### Related API Services

#### Billing API

Location: `src/services/dashboard/superAdmin/billing/billing.ts`

**Get Billing with User ID**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
getAllBillingsWithUserId(
  id: string,
  config: configDataType
): Promise&lt;GetBillingWithUserId_Response_Type&gt;
</pre>

{% endraw %}

**Endpoint**: `GET /api/billing/getAllBillingsWithUserId/:id`

Used in Transaction Details to fetch current balance.

---

## Component Structure

### 1. Main Transaction Screen

**File**: `src/screens/transactions/transactions.tsx`

**Props**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  role: string;  // User role (superAdmin, admin, teacher)
}
</pre>

{% endraw %}

**Key Features**:

- Multi-filter system (date, type, conclusion, user)
- Pagination controls
- Responsive design switching
- Role-based filter visibility
- Delete transaction capability

**State Management**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const [showFullFilters, setShowFullFilters] = useState&lt;boolean&gt;(false);
const [selectedTeacher, setSelectedTeacher] = useState&lt;any&gt;(null);
const [selectedStudent, setSelectedStudent] = useState&lt;any&gt;(null);
const [dateFilter, setDateFilter] = useState&lt;any&gt;("");
const [currentPage, setCurrentPage] = useState&lt;number&gt;(1);
const [rowsPerPage, setRowsPerPage] = useState&lt;number&gt;(50);
const [conclusionType, setConclusionType] = useState&lt;string&gt;("");
const [sortBy, setSortBy] = useState&lt;"session_date" | "createdAt"&gt;("session_date");
const [type, setType] = useState&lt;string&gt;("");
const [deleteTransactionId, setDeleteTransactionId] = useState&lt;number | null&gt;(null);
</pre>

{% endraw %}

**Component Flow**:

1. Initialize state and filters
2. Build memoized query parameters
3. Fetch data with TanStack Query
4. Handle filter changes (reset pagination)
5. Render table or mobile view based on viewport
6. Handle delete operations

### 2. Transaction Table Component

**File**: `src/components/ui/superAdmin/transaction/transaction-table/transaction-table.tsx`

**Props Interface**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
interface TransactionsTablesProps {
  data: DataItem[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  rowsPerPage?: number;
  handleDeleteModal?: (e: React.MouseEvent, id: number) =&gt; void;
  deleteTransactionId?: number | null;
  role?: string;
  deleteLoading?: boolean;
  sortBy?: "session_date" | "createdAt";
  setSortBy?: (sortBy: "session_date" | "createdAt") =&gt; void;
  inlineStyling?: CSSProperties;
}
</pre>

{% endraw %}

**Table Columns**:

1. **User Profile** (15%): Profile image, name, role badge
2. **Info** (17.5%): Related user/subject information
3. **Date** (10%): Transaction creation date (sortable)
4. **Session Type** (11%): Conclusion type badge
5. **Session Date** (15%): Session date and time (sortable)
6. **Transaction Type** (10%): Credit/Debit badge
7. **Amount** (7.5%): Transaction cost
8. **Remaining Balance** (7.5%): Balance after transaction
9. **Actions** (6.5%): Delete button

**Sub-Components**:

**UserProfile**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const UserProfile = memo(({ item }: { item: DataItem }) =&gt; {
  const isStudent = item?.user_id === item?.enrollment?.studentsGroups?.[0]?.user?.id;
  // Renders profile image, name, and role badge
});
</pre>

{% endraw %}

**InfoCell**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const InfoCell = memo(({ item }: { item: DataItem }) =&gt; {
  // Shows deleted status, manual entry, or related user + subject
});
</pre>

{% endraw %}

**TypeBadge**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const TypeBadge = memo(({ type }: { type?: string }) =&gt; {
  // Red badge for Debit, Green badge for Credit
});
</pre>

{% endraw %}

**SessionType**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const SessionType = memo(({ type }: { type?: string }) =&gt; {
  // Displays styled session conclusion type
});
</pre>

{% endraw %}

**Features**:

- Memoized rendering for performance
- Click row to navigate to session details
- Ctrl/Cmd + Click opens in new tab
- Sortable columns with visual indicator
- Delete confirmation with loading state
- Tooltip on action buttons

### 3. Mobile View Card Component

**File**: `src/components/ui/superAdmin/transaction/mobileView-card/mobileView-card.tsx`

**Props**: Same as TransactionTable

**Layout**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
┌─────────────────────────────┐
│ Date               [Delete] │
├─────────────────────────────┤
│ User Profile: [Image] Name  │
│ Info: Teacher | Subject     │
│ Session Type: Badge         │
│ Transaction Type: Badge     │
│ Session Date: DD-MMM-YYYY   │
│ Amount: $XX.XX              │
│ Remaining: $XX.XX           │
└─────────────────────────────┘
</pre>

{% endraw %}

**Features**:

- Vertical card layout for mobile devices
- Touch-friendly tap targets
- All information from table view
- Same interaction patterns

### 4. Transaction Details Screen

**File**: `src/screens/transaction-details/transactions-details.tsx`

**Functionality**:

- Fetches all transactions for a specific user
- Displays user's billing balance
- Calculates total debit/credit amounts
- Shows net balance with color coding
- Pagination for large transaction lists

**Table Structure**:

1. **Enroll_Id** (10%): Enrollment identifier
2. **Session_Id** (10%): Session identifier
3. **User Profile** (25%): Profile with role badge
4. **Email Address** (17.5%): User email
5. **Session Date** (17.5%): Date of session
6. **Transactions** (25%): Cost, type badge, timestamp

**Financial Summary Section**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { totalDebit, totalCredit, netTotal } = useMemo(() =&gt; {
  const totals = transactionData.data.reduce(
    (acc, item) =&gt; {
      const cost = parseFloat(item?.cost) || 0;
      if (item?.type === "Debit") {
        acc.totalDebit += cost;
      } else if (item?.type === "Credit") {
        acc.totalCredit += cost;
      }
      return acc;
    },
    { totalDebit: 0, totalCredit: 0 }
  );

  return {
    ...totals,
    netTotal: totals.totalCredit - totals.totalDebit,
  };
}, [transactionData?.data]);
</pre>

{% endraw %}

---

## Transaction Listing

### Desktop Table View

**Activation**: Viewport width > 1220px

**Features**:

- Full table with 9 columns
- Sticky header on scroll
- Row hover effects
- Sortable columns with icons
- Delete action with confirmation
- Click navigation to session details

**Visual Indicators**:

- **Transaction Type**:
  - Credit: Green badge (#23C552)
  - Debit: Red badge (#F84F31)
- **Role Badge**:
  - Student: Cyan background (#E0F7FA), teal text (#00796B)
  - Teacher: Orange background (#FFF3E0), orange text (#E65100)
- **Session Type**: Styled badges based on conclusion type
- **Balance**: Positive (green), Negative (red)

**Interaction Patterns**:

- Single click row → Navigate to session details
- Ctrl/Cmd + click → Open session in new tab
- Click delete icon → Delete transaction with confirmation
- Click sort icon → Toggle sort order

### Mobile Card View

**Activation**: Viewport width ≤ 1220px

**Layout**: Vertical card stack with all transaction information

**Features**:

- Touch-optimized tap targets
- Swipe-friendly scrolling
- Compact information display
- Same data as desktop view

---

## Transaction Details

### User Transaction History

**Route**: `/[role]/transaction-details/[id]`

**Purpose**: View complete transaction history for a specific user

**Data Display**:

1. **Transaction List**:

   - All transactions for the user
   - Chronological order
   - Detailed information per transaction
   - Enrollment and session references

2. **Financial Summary**:
   - Total number of transactions
   - Current balance (from billing)
   - Color-coded balance indicator

**Balance Display Logic**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;span
  style={{
    color: currentBalance &gt;= 0 ? "#23C552" : "#F84F31",
  }}
&gt;
  {currentBalance || 0}
&lt;/span&gt;
</pre>

{% endraw %}

### Transaction Information

Each transaction displays:

- **Enrollment ID**: Links to specific enrollment
- **Session ID**: Links to specific session (if applicable)
- **User Profile**: Name, image, role
- **Email**: User email address
- **Session Date**: When session occurred
- **Transaction Details**:
  - Cost amount
  - Transaction type (Credit/Debit)
  - Transaction timestamp

**Special Cases**:

- **Manually Added**: No session_id or enrollment_id
- **Deleted**: Shows "Deleted" status and deletedAt timestamp
- **No Show**: Missing user or session information

---

## Filtering and Sorting

### Available Filters

#### 1. Date Range Filter

**Component**: `FilterByDate`

**Functionality**:

- Select start and end date
- Uses moment.js for timezone handling
- Converts to Asia/Dubai timezone for API
- Adds 1 day to end_time for inclusive range

**Implementation**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const transactionParams = useMemo(() =&gt; ({
  start_time: dateFilter[0]
    ? moment(dateFilter[0]).tz("Asia/Dubai").toISOString()
    : "",
  end_time: dateFilter[1]
    ? moment(dateFilter[1]).tz("Asia/Dubai").add(1, "day").toISOString()
    : "",
  // ... other params
}), [dateFilter]);
</pre>

{% endraw %}

#### 2. Session Type Filter

**Component**: `FilterDropdown`

**Options**: From `session_conclusion_types` constant

- Conducted
- Cancelled
- Teacher Absent
- Student Absent
- No Show

**Behavior**: Filters transactions by associated session conclusion type

#### 3. Transaction Type Filter

**Component**: `FilterDropdown`

**Options**:

- Credit: Money added to account
- Debit: Money deducted from account

**Role-Based**:

- SuperAdmin: Can select both
- Teacher: Always filters to "Credit" only
- Student/Parent: No access to transaction list

#### 4. Student Filter (SuperAdmin Only)

**Component**: `FilterDropdown`

**Data Source**: Redux store `state.usersByGroup.students`

**Functionality**:

- Select specific student
- Filters transactions related to that student
- Can combine with teacher filter

#### 5. Teacher Filter (SuperAdmin Only)

**Component**: `FilterDropdown`

**Data Source**: Redux store `state.usersByGroup.teachers`

**Functionality**:

- Select specific teacher
- Filters transactions related to that teacher
- Can combine with student filter

### Combined Filter Logic

**User ID Parameter Building**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
if (selectedStudent && selectedTeacher) {
  params.user_id = `${selectedStudent.id},${selectedTeacher.id}`;
} else if (selectedStudent) {
  params.user_id = selectedStudent.id;
} else if (selectedTeacher) {
  params.user_id = selectedTeacher.id;
} else if (role === "teacher") {
  params.user_id = String(user?.id);
}
</pre>

{% endraw %}

### Sorting

**Sortable Fields**:

1. **Creation Date** (`createdAt`): When transaction was created
2. **Session Date** (`session_date`): When session occurred

**UI Indicator**:

- Sort icon (SwapVertRoundedIcon) next to sortable columns
- Active sort: Colored icon (main-color)
- Inactive sort: Black icon

**Implementation**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;SwapVertRoundedIcon
  onClick={() =&gt; handleSortClick("session_date")}
  sx={{
    cursor: "pointer",
    marginLeft: "5px",
    color: sortBy === "session_date" ? "var(--main-color)" : "black",
    fontSize: "1.2rem",
  }}
/&gt;
</pre>

{% endraw %}

### Pagination

**Component**: `PaginationComponent`

**Features**:

- Page navigation
- Rows per page selector
- Total entries display
- Total pages display

**Options**:

- 50 items per page
- 100 items per page
- 200 items per page

**Behavior**:

- Changing filters resets to page 1
- Changing rows per page resets to page 1
- Current page persists during refetch

---

## Transaction Management

### Delete Transaction

**Availability**: SuperAdmin only

**Trigger**: Delete icon in Actions column

**Process**:

1. **User Action**: Click delete icon
2. **Event Handling**: Stop propagation to prevent row click
3. **State Update**: Set `deleteTransactionId`
4. **API Call**: Execute delete mutation
5. **Loading State**: Show loader in place of delete icon
6. **Response Handling**:
   - Success: Show success toast, refetch data
   - Error: Show error toast
7. **Cleanup**: Clear `deleteTransactionId`

**Code Flow**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleDelete = useCallback(
  (e: React.MouseEvent, id?: number) =&gt; {
    e.stopPropagation();
    if (id) {
      setDeleteTransactionId(id);
      handleDeleteModal?.(e, id);
    }
  },
  [handleDeleteModal]
);

const handleDeleteTransaction = useMutation({
  mutationFn: (payload: { id: number }) =&gt;
    deleteTransaction(payload, { token }),
  onSuccess: (data: any) =&gt; {
    toast.success(data.message);
    refetch();
    setDeleteTransactionId(null);
  },
  onError: (error) =&gt; {
    toast.error(error.message);
    setDeleteTransactionId(null);
  },
});
</pre>

{% endraw %}

**UI Feedback**:

- Loading spinner during deletion
- Toast notification on completion
- Automatic list refresh
- Row removed from view

**Restrictions**:

- Only SuperAdmin can delete
- No confirmation dialog (direct action)
- Cannot undo deletion

---

## Role-Based Access

### SuperAdmin Access

**Permissions**:

- ✅ View all transactions (all users)
- ✅ Filter by any student or teacher
- ✅ Filter by transaction type (Credit/Debit)
- ✅ Delete transactions
- ✅ View transaction details for any user
- ✅ Access sorting and all filters

**Filter Visibility**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{role === "superAdmin" && (
  &lt;&gt;
    &lt;FilterDropdown {...filterByTransactionTypeProps} /&gt;
    &lt;FilterDropdown {...filterByStudentProps} /&gt;
    &lt;FilterDropdown {...filterByTeacherProps} /&gt;
  &lt;/&gt;
)}
</pre>

{% endraw %}

### Admin Access

**Permissions**:

- ✅ View all transactions
- ❌ Cannot filter by student/teacher
- ❌ Cannot filter by transaction type
- ✅ Can delete transactions
- ✅ View transaction details
- ✅ Access date and session type filters

**Automatic Filtering**: None

### Teacher Access

**Permissions**:

- ✅ View own transactions only
- ❌ No student/teacher filters
- ❌ Cannot delete transactions
- ✅ Access date and session type filters

**Automatic Filtering**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
if (role === "teacher") {
  params.user_id = String(user?.id);
}
</pre>

{% endraw %}

**Transaction Type**: Automatically filtered to "Credit" only

### Student/Parent Access

**Permissions**:

- ❌ No access to transaction list page
- ❌ No access to transaction details page
- ✅ Can view their own transactions in billing page

**Route Protection**: `withAuth` HOC prevents access

---

## State Management

### Local State (React)

**Screen-Level State** (`transactions.tsx`):

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// UI State
const [showFullFilters, setShowFullFilters] = useState&lt;boolean&gt;(false);

// Filter State
const [selectedTeacher, setSelectedTeacher] = useState&lt;any&gt;(null);
const [selectedStudent, setSelectedStudent] = useState&lt;any&gt;(null);
const [dateFilter, setDateFilter] = useState&lt;any&gt;("");
const [conclusionType, setConclusionType] = useState&lt;string&gt;("");
const [type, setType] = useState&lt;string&gt;("");
const [sortBy, setSortBy] = useState&lt;"session_date" | "createdAt"&gt;("session_date");

// Pagination State
const [currentPage, setCurrentPage] = useState&lt;number&gt;(1);
const [rowsPerPage, setRowsPerPage] = useState&lt;number&gt;(50);

// Delete State
const [deleteTransactionId, setDeleteTransactionId] = useState&lt;number | null&gt;(null);
</pre>

{% endraw %}

**Component-Level State** (Table/Cards):

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Delete tracking
const [deleteTransactionIdState, setDeleteTransactionId] = useState&lt;number | null&gt;(null);
</pre>

{% endraw %}

### Server State (TanStack Query)

**Query Keys**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Transaction list
["getAllTransactions", transactionParams, token]

// Transaction details
["getAllTransactions", token, currentPage, rowsPerPage]

// User billing
["getAllBillingsWithUserId", token, currentPage, rowsPerPage]
</pre>

{% endraw %}

**Query Configuration**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { data, error, isLoading, refetch } = useQuery({
  queryKey: ["getAllTransactions", transactionParams, token],
  queryFn: () =&gt; getAllTransactions(transactionParams, { token }),
  enabled: !!token,
});
</pre>

{% endraw %}

**Mutation Configuration**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleDeleteTransaction = useMutation({
  mutationFn: (payload: { id: number }) =&gt;
    deleteTransaction(payload, { token }),
  onSuccess: (data) =&gt; {
    // Handle success
    refetch();
  },
  onError: (error) =&gt; {
    // Handle error
  },
});
</pre>

{% endraw %}

**Cache Behavior**:

- Automatic caching by query key
- Manual refetch after mutations
- Stale time: Default (0ms)
- Cache time: Default (5 minutes)
- Retry: Default (3 attempts)

### Global State (Redux)

**Used From Redux**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// User data and authentication
const { token, user } = useAppSelector((state) =&gt; state.user);

// User lists for filtering
const { students, teachers } = useAppSelector((state) =&gt; state.usersByGroup);
</pre>

{% endraw %}

**Redux Structure**:

- `state.user`: Current user, token, role
- `state.usersByGroup`: Cached user lists for filters

### State Flow

The state management follows a reactive pattern where user interactions trigger state updates, which automatically refetch data through TanStack Query's dependency system, update the cache, and re-render components with the latest data.

---

## UI Components

### Global Components Used

#### 1. FilterByDate

**Location**: `src/components/global/filter-by-date/filter-by-date`

**Purpose**: Date range picker for transaction filtering

**Props**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  changeFn: (value: any) =&gt; void;
  minWidth: string;
  flex: number;
}
</pre>

{% endraw %}

**Features**:

- Start and end date selection
- Calendar UI
- Clear functionality

#### 2. FilterDropdown

**Location**: `src/components/global/filter-dropdown/filter-dropdown`

**Purpose**: Generic dropdown filter component

**Props**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  placeholder: string;
  data: string[] | any[];
  handleChange: (e: ChangeEvent&lt;HTMLSelectElement&gt;) =&gt; void;
  value: string;
  dropDownObject?: boolean;
  inlineBoxStyles?: CSSProperties;
}
</pre>

{% endraw %}

**Variations Used**:

- Session type filter
- Transaction type filter
- Student filter (object mode)
- Teacher filter (object mode)

#### 3. MobileFilterButton

**Location**: `src/components/global/mobile-filters-button/mobile.filters-button`

**Purpose**: Toggle filter visibility on mobile

**Props**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  isOpen: boolean;
  onClick: () =&gt; void;
  inlineStyles?: CSSProperties;
}
</pre>

{% endraw %}

#### 4. PaginationComponent

**Location**: `src/components/global/pagination/pagination`

**Purpose**: Handle page navigation and rows per page

**Props**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  totalPages: number;
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  onPageChange: (e: any, newPage: number) =&gt; void;
  rowsPerPageChange: (e: any) =&gt; void;
  dropDownValues: number[];
  inlineStyles?: CSSProperties;
}
</pre>

{% endraw %}

#### 5. LoadingBox

**Location**: `src/components/global/loading-box/loading-box`

**Purpose**: Display loading spinner

**Props**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  loaderStyling?: CSSProperties;
}
</pre>

{% endraw %}

**Usage**:

- Full page loading
- Inline loading (delete button)
- Balance loading

#### 6. ErrorBox

**Location**: `src/components/global/error-box/error-box`

**Purpose**: Display empty state or error message

**Usage**:

- No transactions found
- API error state

### Material-UI Components

#### Tooltip

**Usage**: Action button hints

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;Tooltip title="Delete" placement="bottom" arrow&gt;
  &lt;span className={classes.iconBox}&gt;
    {/* Delete icon */}
  &lt;/span&gt;
&lt;/Tooltip&gt;
</pre>

{% endraw %}

#### SwapVertRoundedIcon

**Usage**: Sort indicator on table headers

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;SwapVertRoundedIcon
  onClick={() =&gt; handleSortClick("session_date")}
  sx={{
    cursor: "pointer",
    color: sortBy === "session_date" ? "var(--main-color)" : "black",
  }}
/&gt;
</pre>

{% endraw %}

### Styling Helpers

#### getConclusionTypeStyles

**Location**: `src/utils/helpers/sessionType-styles.ts`

**Purpose**: Return style object for session conclusion type badges

**Usage**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;span style={getConclusionTypeStyles(type || "Not Available")}&gt;
  {type || "No Show"}
&lt;/span&gt;
</pre>

{% endraw %}

**Returns**:

- Background color
- Text color
- Padding
- Border radius

---

## Integration with Other Modules

### Session Module Integration

**Relationship**: Transactions are created from sessions

**Integration Points**:

1. **Session Details → Transaction Info**:

   - Session details page displays related transactions
   - Shows student and teacher transaction pairs
   - Links to transaction history

2. **Transaction List → Session Details**:
   - Click transaction row navigates to session details
   - Only works for session-based transactions
   - Passes session_id in URL

**Shared Data**:

- Session ID
- Enrollment ID
- Session date
- Conclusion type
- Participant information

### Billing Module Integration

**Relationship**: Billing records track cumulative balances

**Integration Points**:

1. **Transaction Details → Current Balance**:

   - Fetches billing record for user
   - Displays current_balance
   - Shows balance status (positive/negative)

2. **Transaction Creation → Billing Update**:
   - New transactions update billing balance
   - Calculates remaining_balance
   - Updates current_balance in billing

**API Calls**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
// Get user's current billing balance
getAllBillingsWithUserId(userId, { token })
</pre>

{% endraw %}

**Shared Data**:

- User ID
- Current balance
- Billing ID
- Transaction type

### Invoice Module Integration

**Relationship**: Invoice payments create credit transactions

**Integration Points**:

1. **Invoice Payment → Transaction Creation**:

   - Paying invoice generates Credit transaction
   - Updates user's billing balance
   - Links transaction to billing_id

2. **Transaction Display → Invoice Reference**:
   - Transactions show if related to invoice
   - Display billing_id
   - No direct invoice_id in transaction

**Data Flow**:

Invoice payment triggers a Credit transaction creation, which updates the billing balance and displays in the transaction list. This process is part of the main transaction flow shown in the Data Flow section.

### Enrollment Module Integration

**Relationship**: Transactions linked to enrollments

**Integration Points**:

1. **Enrollment Data in Transactions**:

   - Subject information
   - Curriculum details
   - Grade information
   - Hourly rates
   - Tutor information
   - Student group information

2. **Filtering by Enrollment**:
   - Filter by student (via enrollment)
   - Filter by teacher (via enrollment)
   - View enrollment-specific transactions

**Nested Data Structure**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
transaction.enrollment {
  id: number;
  hourly_rate: number;
  tutor: {
    name: string;
    email: string;
  };
  subject: {
    name: string;
  };
  studentsGroups: [{
    user: {
      name: string;
      email: string;
    }
  }];
}
</pre>

{% endraw %}

### User Management Integration

**Relationship**: Transactions belong to users

**Integration Points**:

1. **User Profile Display**:

   - Profile image
   - User name
   - User email
   - Role identification

2. **User Filtering**:

   - Redux store: `usersByGroup`
   - Student list
   - Teacher list

3. **User Transaction History**:
   - Route: `/transaction-details/[user_id]`
   - Complete user transaction list
   - Balance summary

**Redux Integration**:

{% raw %}

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const { students, teachers } = useAppSelector((state) =&gt; state.usersByGroup);
</pre>

{% endraw %}

---

## File References

### Core Files

#### Routes

- `src/app/(protected)/[role]/transactions/page.tsx:6`

  - Main transaction list page route

- `src/app/(protected)/[role]/transaction-details/[id]/page.tsx:6`
  - User transaction details page route

#### Screens

- `src/screens/transactions/transactions.tsx:1`

  - Main transaction list screen component
  - Handles filtering, sorting, pagination
  - Role-based view switching

- `src/screens/transaction-details/transactions-details.tsx:1`
  - Transaction details screen
  - User transaction history
  - Balance calculations and display

#### Styles

- `src/screens/transactions/transactions.module.css:1`

  - Transaction screen styling

- `src/screens/transaction-details/transactions-details.module.css:1`
  - Transaction details styling

#### Table Components

- `src/components/ui/superAdmin/transaction/transaction-table/transaction-table.tsx:1`

  - Desktop table view component
  - Sortable columns
  - Interactive rows

- `src/components/ui/superAdmin/transaction/transaction-table/transaction-table.module.css:1`
  - Table component styles

#### Mobile Components

- `src/components/ui/superAdmin/transaction/mobileView-card/mobileView-card.tsx:1`

  - Mobile card view component
  - Touch-optimized layout

- `src/components/ui/superAdmin/transaction/mobileView-card/mobileView-card.module.css:1`
  - Mobile card styles

### API Services

#### Transaction Services

- `src/services/dashboard/superAdmin/transactions/transactions.ts:1`

  - `getAllTransactions()` - Fetch transactions with filters
  - `deleteTransaction()` - Delete a transaction

- `src/services/dashboard/superAdmin/transactions/transaction.types.ts:1`
  - TypeScript type definitions
  - `DataItem` interface
  - `Get_All_Transactions_ApiResponse` type
  - `Transaction_Api_FilterOptions` type

#### Related Services

- `src/services/dashboard/superAdmin/billing/billing.ts:1`

  - `getAllBillingsWithUserId()` - Get user billing info

- `src/services/dashboard/superAdmin/billing/billing.types.ts:1`

  - Billing type definitions
  - `GetBillingWithUserId_Response_Type`

- `src/services/dashboard/superAdmin/invoices/invoices.ts:1`

  - Invoice API functions

- `src/services/dashboard/superAdmin/invoices/invoices.types.ts:1`
  - Invoice type definitions

### Constants

- `src/const/dashboard/session_conclusion_types.ts:1`
  - Session type filter options array

### Utilities

- `src/utils/helpers/sessionType-styles.ts:1`

  - `getConclusionTypeStyles()` helper function

- `src/utils/withAuth/withAuth.jsx:1`
  - Authentication HOC for route protection

### Global Components

- `src/components/global/filter-by-date/filter-by-date`

  - Date range picker component

- `src/components/global/filter-dropdown/filter-dropdown`

  - Dropdown filter component

- `src/components/global/mobile-filters-button/mobile.filters-button`

  - Mobile filter toggle button

- `src/components/global/pagination/pagination`

  - Pagination component

- `src/components/global/loading-box/loading-box`

  - Loading spinner component

- `src/components/global/error-box/error-box`
  - Empty state/error component

---

## Best Practices

### Performance Optimizations

1. **Memoization**:

   - Use `useMemo` for query parameters
   - Use `useMemo` for component props
   - Use `memo()` for sub-components

2. **Lazy Loading**:

   - Pagination for large datasets
   - Configurable rows per page

3. **Optimized Re-renders**:
   - Memoized callbacks with `useCallback`
   - Stable prop references
   - Minimal state updates

### Error Handling

1. **API Errors**:

   - Toast notifications for user feedback
   - Error state display
   - Graceful fallbacks

2. **Loading States**:

   - Full page loading spinner
   - Inline loading for actions
   - Skeleton screens (where applicable)

3. **Empty States**:
   - ErrorBox component for no data
   - Clear messaging

### Code Organization

1. **Separation of Concerns**:

   - Screen components handle logic
   - UI components handle display
   - Service layer handles API calls

2. **Type Safety**:

   - TypeScript interfaces for all data
   - Strict typing on props
   - Type guards for conditional logic

3. **Reusability**:
   - Shared components from global folder
   - Consistent patterns across screens
   - Configurable components

### Accessibility

1. **Keyboard Navigation**:

   - Tab-accessible controls
   - Enter key support for actions

2. **Screen Readers**:

   - Alt text on images
   - ARIA labels where needed
   - Semantic HTML structure

3. **Visual Feedback**:
   - Hover states
   - Focus indicators
   - Loading indicators

---

## Future Enhancements

### Potential Features

1. **Transaction Editing**:

   - Edit transaction amounts
   - Change transaction types
   - Update dates

2. **Bulk Operations**:

   - Select multiple transactions
   - Bulk delete
   - Bulk export

3. **Export Functionality**:

   - Export to CSV
   - Export to Excel
   - PDF reports

4. **Advanced Filtering**:

   - Amount range filter
   - Balance range filter
   - Multiple session type selection

5. **Transaction Analytics**:

   - Charts and graphs
   - Revenue trends
   - Transaction patterns

6. **Transaction Notes**:

   - Add notes to transactions
   - Transaction categories
   - Custom tags

7. **Audit Trail**:

   - Track transaction changes
   - Show modification history
   - User action logs

8. **Real-time Updates**:
   - Socket.io integration
   - Live transaction feed
   - Instant balance updates

---

## Troubleshooting

### Common Issues

#### Transactions Not Loading

**Symptoms**: Empty list or loading indefinitely

**Possible Causes**:

1. Invalid token
2. Network error
3. API endpoint down
4. Incorrect query parameters

**Solutions**:

- Check browser console for errors
- Verify token in Redux state
- Test API endpoint directly
- Check query parameter format

#### Delete Not Working

**Symptoms**: Delete button doesn't remove transaction

**Possible Causes**:

1. Insufficient permissions
2. Transaction already deleted
3. API error
4. Network timeout

**Solutions**:

- Verify user role (SuperAdmin required)
- Check API response in network tab
- Ensure transaction ID exists
- Retry the operation

#### Filters Not Applying

**Symptoms**: Filter changes don't update results

**Possible Causes**:

1. Query key not updating
2. Pagination not resetting
3. Memoization caching old values

**Solutions**:

- Check query key dependencies
- Verify `setCurrentPage(1)` on filter change
- Ensure filter state is updating

#### Balance Showing Incorrectly

**Symptoms**: Balance doesn't match expected value

**Possible Causes**:

1. Calculation error in frontend
2. Stale billing data
3. Missing transactions
4. API data inconsistency

**Solutions**:

- Refetch billing data
- Check all transactions are included
- Verify calculation logic
- Compare with backend data

---

## Conclusion

The Transaction Module is a critical component of the Tuitional LMS, providing comprehensive financial tracking and management capabilities. It integrates seamlessly with Session, Billing, Invoice, and Enrollment modules to create a complete financial ecosystem.

Key strengths:

- ✅ Robust filtering and sorting
- ✅ Role-based access control
- ✅ Responsive design
- ✅ Real-time data management
- ✅ Performance optimizations
- ✅ Type-safe implementation

The module follows best practices for React development, leveraging modern patterns like hooks, memoization, and server state management with TanStack Query. The clean separation of concerns and reusable component architecture makes it maintainable and extensible for future enhancements.
