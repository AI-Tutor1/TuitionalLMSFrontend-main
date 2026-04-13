# Users Module - User Flows

Complete step-by-step documentation of all user interaction flows in the Users Module.

---

## Table of Contents

1. [API Endpoints Reference](#api-endpoints-reference)
2. [View Users List Flow](#1-view-users-list-flow)
3. [Add New User Flow](#2-add-new-user-flow)
4. [Edit User Flow](#3-edit-user-flow)
5. [Activate/Deactivate User Flow](#4-activatedeactivate-user-flow)
6. [Delete User Flow](#5-delete-user-flow)
7. [Add Parent-Student Relation Flow](#6-add-parent-student-relation-flow)
8. [Filter Users Flow](#7-filter-users-flow)
9. [Pagination Flow](#8-pagination-flow)
10. [Navigate to Counselling Flow](#9-navigate-to-counselling-flow)
11. [Mobile Filter Toggle Flow](#10-mobile-filter-toggle-flow)

---

## API Endpoints Reference

Complete reference of all API endpoints used in the Users Module.

### Base Configuration

**Base URL**: Configured in `src/services/config`
**Authentication**: JWT Bearer token (from Redux `state.user.token`)
**Authorization Header**: `Authorization: Bearer {token}`

---

### 1. Get All Users (with Filters & Pagination)

**Endpoint**: `GET /api/user/getAllUsers`
**File**: `src/services/dashboard/superAdmin/uers/users.ts:54-57`

**Query Parameters**:

| Parameter     | Type   | Required | Description                                |
| ------------- | ------ | -------- | ------------------------------------------ |
| `limit`       | number | No       | Number of users per page (default: 50)     |
| `page`        | number | No       | Page number for pagination (default: 1)    |
| `startDate`   | string | No       | Filter by creation date (start) ISO format |
| `endDate`     | string | No       | Filter by creation date (end) ISO format   |
| `userType`    | number | No       | Filter by role ID                          |
| `name`        | string | No       | Search by user name (partial match)        |
| `email`       | string | No       | Search by email (partial match)            |
| `countryCode` | string | No       | Filter by country ISO code (e.g., "US")    |

**Request Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
GET /api/user/getAllUsers?page=1&limit=50&userType=3&countryCode=US
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
</pre>

**Response** (200 OK):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "status": true,
      "roleId": 3,
      "role": { "id": 3, "name": "Student" },
      "profileImageUrl": "https://...",
      "pseudo_name": "JD",
      "phone_number": "+1234567890",
      "country": "United States",
      "country_code": "US",
      "isSync": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T14:25:00.000Z"
    }
    // ... more users
  ],
  "totalPages": 10,
  "currentPage": 1,
  "totalCount": 487
}
</pre>

**Used In**: View Users List Flow, Filter Users Flow, Pagination Flow

---

### 2. Get Users Grouped by Role

**Endpoint**: `GET /api/user/getUsersByGroup`
**File**: `src/services/dashboard/superAdmin/uers/users.ts:50-51`

**Query Parameters**: None

**Request Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
GET /api/user/getUsersByGroup
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
</pre>

**Response** (200 OK):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "students": {
    "roleId": 3,
    "role": { "name": "Student" },
    "users": [
      { "id": 1, "name": "John Doe", "email": "john@example.com" },
      { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
    ]
  },
  "teachers": {
    "roleId": 4,
    "role": { "name": "Teacher" },
    "users": [
      { "id": 10, "name": "Mr. Wilson", "email": "wilson@example.com" }
    ]
  },
  "parents": {
    "roleId": 5,
    "role": { "name": "Parent" },
    "users": [
      { "id": 20, "name": "Mrs. Johnson", "email": "johnson@example.com" }
    ]
  }
}
</pre>

**Redux Integration**: Stored in `state.usersByGroup`
**Used In**: Add Parent-Student Relation Flow

---

### 3. Get User By ID

**Endpoint**: `GET /api/user/getUserById`
**File**: `src/services/dashboard/superAdmin/uers/users.ts:60-61`

**Query Parameters**:

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| `id`      | string | Yes      | User ID     |

**Request Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
GET /api/user/getUserById?id=42
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
</pre>

**Response** (200 OK):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "id": 42,
  "name": "John Doe",
  "email": "john@example.com",
  "pseudo_name": "JD",
  "pseudo_names": "JD, Johnny",
  "connectedEmails": "john.doe@gmail.com",
  "status": true,
  "isSync": true,
  "is_verified": true,
  "roleId": 3,
  "gender": "Male",
  "country": "United States",
  "country_code": "US",
  "city": "New York",
  "phone_number": "+1234567890",
  "profileImageUrl": "https://...",
  "firebase_token": "...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:25:00.000Z"
}
</pre>

**Error** (404 Not Found):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "error": "User not found"
}
</pre>

**Used In**: Edit User Flow (for fetching complete user details)

---

### 4. Add New User (Sign Up)

**Endpoint**: `POST /api/user/signUp`
**File**: `src/services/dashboard/superAdmin/uers/users.ts:64-65`
**Content-Type**: `multipart/form-data`

**Request Body** (FormData):

| Field          | Type   | Required | Description                       |
| -------------- | ------ | -------- | --------------------------------- |
| `roleId`       | number | Yes      | User role ID (1-5)                |
| `name`         | string | Yes      | Full name                         |
| `email`        | string | Yes      | Email address (must be unique)    |
| `password`     | string | Yes      | Password                          |
| `country_code` | string | Yes      | Country ISO code (e.g., "US")     |
| `phone_number` | string | Yes      | Phone number                      |
| `gender`       | string | Yes      | "Male" or "Female"                |
| `profileImage` | File   | Yes      | Profile image file (or default)   |
| `ticket`       | string | No       | Ticket number (only for Students) |

**Request Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
POST /api/user/signUp
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

FormData:
  roleId: 3
  name: "John Doe"
  email: "john.doe@example.com"
  password: "SecurePass123"
  country_code: "US"
  phone_number: "+1234567890"
  gender: "Male"
  profileImage: [File object]
  ticket: "12345"
</pre>

**Response** (201 Created):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "id": 50,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "roleId": 3,
  "status": true,
  "profileImageUrl": "https://...",
  "createdAt": "2024-01-25T16:45:00.000Z"
}
</pre>

**Error** (409 Conflict - Duplicate Email):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "error": "Email already exists"
}
</pre>

**Error** (400 Bad Request - Validation):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "error": "Missing required field: name"
}
</pre>

**Used In**: Add New User Flow

---

### 5. Update User

**Endpoint**: `PUT /api/user/update`
**File**: `src/services/dashboard/superAdmin/uers/users.ts:86-89`
**Content-Type**: `application/json`

**Request Body**:

| Field             | Type    | Required | Description                   |
| ----------------- | ------- | -------- | ----------------------------- |
| `id`              | number  | Yes      | User ID to update             |
| `name`            | string  | Yes      | Updated full name             |
| `email`           | string  | Yes      | Updated email                 |
| `status`          | string  | Yes      | "true" or "false" (as string) |
| `roleId`          | number  | Yes      | Updated role ID               |
| `pseudo_name`     | string  | No       | Alternative display name      |
| `profileImageUrl` | string  | No       | Profile image URL             |
| `city`            | string  | No       | City name                     |
| `country`         | string  | No       | Country name                  |
| `country_code`    | string  | Yes      | Country ISO code              |
| `phone_number`    | string  | Yes      | Phone number                  |
| `isSync`          | boolean | No       | Sync status                   |
| `parentsEmail`    | string  | No       | Associated parent email       |

**Request Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
PUT /api/user/update
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": 42,
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "status": "true",
  "roleId": 3,
  "pseudo_name": "JS",
  "profileImageUrl": "https://...",
  "country": "United States",
  "country_code": "US",
  "phone_number": "+1234567890",
  "parentsEmail": "parent@example.com"
}
</pre>

**Response** (200 OK):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "id": 42,
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "status": true,
  "roleId": 3,
  "pseudo_name": "JS",
  "profileImageUrl": "https://...",
  "updatedAt": "2024-01-25T17:30:00.000Z"
}
</pre>

**Error** (404 Not Found):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "error": "User not found"
}
</pre>

**Used In**: Edit User Flow

---

### 6. Activate/Deactivate User

**Endpoint**: `PUT /api/user/deactivate`
**File**: `src/services/dashboard/superAdmin/uers/users.ts:70-79`
**Content-Type**: `application/json`

**Request Body**:

| Field       | Type    | Required | Description                                     |
| ----------- | ------- | -------- | ----------------------------------------------- |
| `id`        | string  | Yes      | User ID to activate/deactivate                  |
| `status`    | boolean | Yes      | New status (true = active, false = inactive)    |
| `permanent` | string  | No       | "permanently" or "temporarily" (for deactivate) |
| `message`   | string  | Yes      | Reason for status change                        |

**Request Example** (Deactivate):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
PUT /api/user/deactivate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": "42",
  "status": false,
  "permanent": "temporarily",
  "message": "On medical leave for 2 months"
}
</pre>

**Request Example** (Activate):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
PUT /api/user/deactivate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "id": "42",
  "status": true,
  "permanent": "",
  "message": "Returned from leave"
}
</pre>

**Response** (200 OK):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "id": 42,
  "status": false,
  "updatedAt": "2024-01-25T18:00:00.000Z"
}
</pre>

**Used In**: Activate/Deactivate User Flow

---

### 7. Delete User

**Endpoint**: `DELETE /api/user/{id}`
**File**: `src/services/dashboard/superAdmin/uers/users.ts:82-83`

**Path Parameters**:

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `id`      | string | Yes      | User ID to delete |

**Request Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
DELETE /api/user/42
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
</pre>

**Response** (200 OK):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "message": "User deleted successfully"
}
</pre>

**Error** (404 Not Found):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "error": "User not found"
}
</pre>

**Error** (409 Conflict - Has Relations):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "error": "Cannot delete user with existing relations"
}
</pre>

**⚠️ Warning**: This is a permanent operation and cannot be undone!

**Used In**: Delete User Flow

---

### 8. Add Parent-Student Relation

**Endpoint**: `POST /api/guardians/relationships`
**File**: `src/services/dashboard/superAdmin/uers/users.ts:66-67`
**Content-Type**: `application/json`

**Request Body**:

| Field        | Type     | Required | Description                    |
| ------------ | -------- | -------- | ------------------------------ |
| `parentId`   | number   | Yes      | Parent/Guardian user ID        |
| `studentIds` | number[] | Yes      | Array of student user IDs      |
| `relation`   | string   | No       | Relation type (e.g., "Father") |

**Request Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
POST /api/guardians/relationships
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "parentId": 20,
  "studentIds": [42, 43, 44],
  "relation": "Father"
}
</pre>

**Response** (201 Created):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
[
  {
    "id": 100,
    "studentId": 42,
    "parentId": 20,
    "relation": "Father",
    "createdAt": "2024-01-25T19:00:00.000Z",
    "updatedAt": "2024-01-25T19:00:00.000Z",
    "deletedAt": null,
    "Student": {
      "id": 42,
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  {
    "id": 101,
    "studentId": 43,
    "parentId": 20,
    "relation": "Father",
    "createdAt": "2024-01-25T19:00:00.000Z",
    "updatedAt": "2024-01-25T19:00:00.000Z",
    "deletedAt": null,
    "Student": {
      "id": 43,
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  // ... one relationship per student
]
</pre>

**Error** (400 Bad Request):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "error": "Parent or student not found"
}
</pre>

**Used In**: Add Parent-Student Relation Flow

---

### 9. Upload Image (Get Image String)

**Endpoint**: `POST /api/upload` (assumed endpoint)
**File**: `src/services/dashboard/upload-file/upload-file`
**Content-Type**: `multipart/form-data`

**Request Body** (FormData):

| Field  | Type | Required | Description          |
| ------ | ---- | -------- | -------------------- |
| `file` | File | Yes      | Image file to upload |

**Request Example**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
POST /api/upload
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

FormData:
  file: [File object - image.jpg]
</pre>

**Response** (200 OK):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "url": "https://storage.example.com/images/user-profile-abc123.jpg",
  "message": "Image uploaded successfully"
}
</pre>

**Error** (400 Bad Request - File Too Large):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  "error": "File size exceeds maximum allowed size"
}
</pre>

**Used In**: Edit User Flow (separate image upload before form submission)

---

### HTTP Status Codes

| Code | Meaning               | Usage                                    |
| ---- | --------------------- | ---------------------------------------- |
| 200  | OK                    | Successful GET, PUT, DELETE operations   |
| 201  | Created               | Successful POST operation (user created) |
| 400  | Bad Request           | Validation errors, missing fields        |
| 401  | Unauthorized          | Missing or invalid JWT token             |
| 403  | Forbidden             | Insufficient permissions                 |
| 404  | Not Found             | User/resource doesn't exist              |
| 409  | Conflict              | Duplicate email, foreign key constraint  |
| 500  | Internal Server Error | Unexpected server error                  |

---

### Error Handling Pattern

All API errors follow this priority in the frontend:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. response.data.message (friendly message)
2. response.data.error (error description)
3. `${status} ${statusText}` (HTTP status)
4. error.message (network/unknown errors)
</pre>

**File**: `src/screens/users/user-form.tsx:241-254`

---

### Authentication

All endpoints require JWT authentication via Bearer token:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0...
</pre>

**Token Source**: Redux store `state.user.token`
**Token Expiry**: Managed by backend, frontend should handle 401 errors

---

## 1. View Users List Flow

### Description

Basic flow for viewing the list of all users in the system.

### Prerequisites

- User is authenticated
- User has authorized role (superAdmin, admin, or counsellor)

### Steps

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. User navigates to /{role}/users page
   ↓
2. withAuth HOC checks authentication
   - Not authenticated → Redirect to /signin
   - Authenticated → Continue
   ↓
3. Page checks role authorization
   - superAdmin/admin/counsellor → Render UsersForm
   - Other roles → Render null (no access)
   ↓
4. UsersForm component mounts
   ↓
5. React Query fetches users with getAllusers()
   - Endpoint: GET /api/user/getAllUsers
   - Query params: page=1, limit=50, filters={}
   ↓
6. Display appropriate view based on viewport:
   - Desktop (>1220px) → UsersTable
   - Mobile (≤1220px) → UserViewCard
   ↓
7. Show loading state while fetching
   ↓
8. On success, render user list with:
   - Profile information
   - Role badges
   - Status indicators
   - Sync status
   - Action buttons
   - Pagination
   ↓
9. Auto-refetch every 5 minutes
</pre>

### UI Components Involved

- **Page**: `src/app/(protected)/[role]/users/page.tsx`
- **Screen**: `src/screens/users/user-form.tsx`
- **Table**: `src/components/ui/superAdmin/users/users-table/users-table.tsx`
- **Cards**: `src/components/ui/superAdmin/users/userView-card/userView-card.tsx`

### Success Criteria

✅ User list displays all users
✅ Pagination shows correct totals
✅ All columns/fields visible
✅ Action buttons functional
✅ No console errors

### Error Scenarios

- **Network error**: Show error toast, keep previous data if cached
- **401 Unauthorized**: Show error toast (ideally redirect to login)
- **Empty result**: Display empty table/cards, show 0 entries

### File References

- Authentication: `src/utils/withAuth/withAuth.jsx`
- API call: `src/services/dashboard/superAdmin/uers/users.ts:54-57`
- Query setup: `src/screens/users/user-form.tsx:193-224`

---

## 2. Add New User Flow

### Description

Complete flow for creating a new user in the system.

### Prerequisites

- User is on the Users page
- User has permission to add users

### Steps

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. User clicks "Add New User" button
   ↓
2. Add User Modal opens
   - Form fields reset to initial state
   - All fields empty except default values
   ↓
3. User fills out form:
   a. [Optional] Upload profile image
   b. [Required] Enter full name
   c. [Required] Enter email
   d. [Required] Enter password
   e. [Required] Select gender (Male/Female)
   f. [Required] Select country
   g. [Required] Enter phone number
   h. [Required] Select user type/role
   i. [Conditional] If Student: Enter ticket (optional)
   ↓
4. User clicks "Add" button
   ↓
5. Client-side validation runs
   - Check all required fields filled
   - Validate email format (regex)
   - If validation fails → Show error toast, stop
   ↓
6. Handle profile image:
   - If image uploaded → Use uploaded file
   - If no image → Fetch default dummy image, convert to File
   ↓
7. Create FormData payload
   {
     roleId, name, email, password,
     country_code, phone_number, gender,
     profileImage, ticket (if Student)
   }
   ↓
8. Submit mutation: adduser()
   - Endpoint: POST /api/user/signUp
   - Content-Type: multipart/form-data
   - Include auth token
   ↓
9. Server processes request:

   SUCCESS PATH:
   a. Close modal
   b. Dispatch fetchUsersByGroup() to update Redux
   c. Refetch main user list (React Query)
   d. Show success toast: "User Add Successfully"
   e. Reset form state
   f. New user appears in list

   ERROR PATH:
   a. Display error toast with message
   b. Keep modal open
   c. Preserve form data (user can retry)
</pre>

### Form Fields

| Field         | Type        | Required    | Validation  | Notes                           |
| ------------- | ----------- | ----------- | ----------- | ------------------------------- |
| Profile Image | File Upload | No          | -           | Default image if not provided   |
| Full Name     | Text        | Yes         | Non-empty   | User's full legal name          |
| Email         | Email       | Yes         | Email regex | Must be unique                  |
| Password      | Password    | Yes         | Non-empty   | Minimum requirements TBD        |
| Gender        | Dropdown    | Yes         | Selection   | Options: Male, Female           |
| Country       | Dropdown    | Yes         | Selection   | From country-state-city library |
| Phone Number  | Phone Input | Yes         | Valid phone | Custom input with country code  |
| User Type     | Dropdown    | Yes         | Selection   | From Redux roles state          |
| Ticket        | Number      | Conditional | -           | Only shown for Student role     |

### Validation Rules

**File**: `src/components/ui/superAdmin/users/add-modal/add-moadl.tsx:58-77`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
- Full Name: Required
- Email: Required AND valid format
- Password: Required
- Gender: Required (selection)
- Country: Required (selection)
- Phone Number: Required
- User Type: Required (selection)
</pre>

**Email Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Default Image Handling

**File**: `src/components/ui/superAdmin/users/add-modal/add-moadl.tsx:126-134`

When no image is uploaded:

1. Fetch `/assets/images/demmyPic.png`
2. Convert response to Blob
3. Create File object: `new File([blob], "dummy-pic.png", { type: "image/png" })`
4. Include in payload

### UI Components Involved

- **Button**: `src/screens/users/user-form.tsx:569-574` (Add New User)
- **Modal**: `src/components/ui/superAdmin/users/add-modal/add-moadl.tsx`
- **Image Uploader**: `src/components/global/image-uploader/images-uploader`

### Success Criteria

✅ User created successfully
✅ Success toast displayed
✅ Modal closes automatically
✅ User list refreshes
✅ New user appears in list
✅ Redux usersByGroup updated

### Error Scenarios

- **Validation error**: Show specific error message, keep modal open
- **Duplicate email**: 409 error, show "Email already exists"
- **Network error**: Show error toast, keep modal open
- **Server error**: 500 error, show error message
- **Failed to load default image**: Show error, stop submission

### File References

- Modal component: `src/components/ui/superAdmin/users/add-modal/add-moadl.tsx`
- API call: `src/services/dashboard/superAdmin/uers/users.ts:64-65`
- Mutation handler: `src/screens/users/user-form.tsx:226-255`

---

## 3. Edit User Flow

### Description

Flow for updating existing user information.

### Prerequisites

- User is viewing the Users list
- Target user exists in the system

### Steps

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. User clicks Edit icon in table/card
   ↓
2. Edit User Modal opens with:
   - profile object passed to modal
   - Selected user data prefilled in all fields
   ↓
3. User modifies desired fields:

   a. Profile Image (special handling):
      - User selects new image
      - Image upload mutation triggers immediately
      - Endpoint: POST (image upload API)
      - Loading spinner shows during upload
      - On success: Store returned URL in state
      - Show "Image uploaded successfully" toast

   b. Other fields (updated on submit):
      - Full Name
      - Email
      - Pseudo Name
      - Country
      - Phone Number
      - Role
      - Parent Email
   ↓
4. User clicks "Update" button
   ↓
5. Client-side validation
   - Validate email format (regex)
   - If invalid → Show "Enter a valid email address" toast, stop
   ↓
6. Create payload:
   {
     id: user.id,
     name: formData.fullName || profile.name,
     email: formData.email || profile.email,
     status: formData.status || profile.status (as string),
     roleId: formData.userType.id || profile.roleId,
     pseudo_name: formData.pseudo_name || profile.pseudo_name,
     profileImageUrl: uploadedImageUrl || profile.profileImageUrl,
     country: formData.country.name || profile.country,
     country_code: formData.country.isoCode || profile.country_code,
     phone_number: formData.phoneNumber || profile.phone_number,
     parentsEmail: formData.parentsEmail || profile.parentsEmail
   }
   ↓
7. Submit mutation: updateUser()
   - Endpoint: PUT /api/user/update
   - Content-Type: application/json
   ↓
8. Server processes update:

   SUCCESS PATH:
   a. Refetch main user list
   b. Close modal
   c. Show success toast: "User Updated Successfully"
   d. Reset form state
   e. Changes visible immediately in list

   ERROR PATH:
   a. Display error toast with message
   b. Close modal (note: inconsistent behavior)
</pre>

### Form Fields (Prefilled)

| Field         | Type        | Required | Prefilled | Notes                    |
| ------------- | ----------- | -------- | --------- | ------------------------ |
| Profile Image | File Upload | No       | Yes       | Current image shown      |
| Full Name     | Text        | Yes      | Yes       | Current name             |
| Email         | Email       | Yes      | Yes       | Current email            |
| Pseudo Name   | Text        | No       | Yes       | Alternative display name |
| Country       | Dropdown    | No       | Yes       | Current country          |
| Phone Number  | Phone Input | No       | Yes       | Current phone            |
| Role          | Dropdown    | No       | Yes       | Current role             |
| Parent Email  | Email       | No       | Yes       | Associated parent        |

### Image Upload Behavior

**File**: `src/components/ui/superAdmin/users/edit-modal/edit-modal.tsx:78-101`

**Special**: Image upload is separate from form submission.

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Process:
1. User selects image → Immediate upload
2. getImageString() API called
3. Server returns image URL string
4. URL stored in local state (imageUrl)
5. On form submit → Use new URL or existing URL
</pre>

### Form Prefilling

**File**: `src/components/ui/superAdmin/users/edit-modal/edit-modal.tsx:145-165`

Triggered by: `useEffect` when `modalOpen.profile` changes

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
- Populate all fields with current user data
- Match country by name or ISO code
- Convert profile image URL to ImageType format
- Find matching role from Redux roles array
</pre>

### UI Components Involved

- **Icon**: Edit icon in UsersTable/UserViewCard
- **Modal**: `src/components/ui/superAdmin/users/edit-modal/edit-modal.tsx`
- **Image Uploader**: Separate mutation with loading state

### Success Criteria

✅ Modal opens with prefilled data
✅ All fields editable
✅ Image upload shows progress
✅ Form submission succeeds
✅ Changes reflected immediately
✅ Success toast displayed

### Error Scenarios

- **Invalid email**: Show validation error, don't submit
- **Image upload fails**: Show error, allow form submission with old image
- **Update fails**: Show error toast, close modal
- **Network error**: Show error toast
- **User not found (404)**: Show error toast

### File References

- Modal component: `src/components/ui/superAdmin/users/edit-modal/edit-modal.tsx`
- API call: `src/services/dashboard/superAdmin/uers/users.ts:86-89`
- Mutation handler: `src/screens/users/user-form.tsx:289-326`
- Image upload: `src/services/dashboard/upload-file/upload-file`

---

## 4. Activate/Deactivate User Flow

### Description

Flow for toggling user activation status with reason tracking.

### Prerequisites

- User is viewing the Users list
- Target user exists

### Steps

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. User clicks Activate/Deactivate icon
   ↓
2. Deactivate Modal opens with:
   - profile object passed
   - Dynamic heading based on current status
   ↓
3. Modal displays conditional content:

   IF USER IS ACTIVE (status === true):
   • Button text: "Deactivate"
   • Subheading: "Are you sure to deactivate this user?"
   • Show radio buttons:
     - "Permanently" (value: "permanently")
     - "Temporarily" (value: "temporarily")
   • Show reason text box (required)

   IF USER IS INACTIVE (status === false):
   • Button text: "Activate"
   • Subheading: "Are you sure to activate this user?"
   • Hide radio buttons
   • Show reason text box (required)
   ↓
4. User fills form:
   a. [If deactivating] Select deactivation type (Permanently/Temporarily)
   b. [Always required] Enter reason in text box
   ↓
5. User clicks action button (Deactivate/Activate)
   ↓
6. Client-side validation
   - Check reason is not empty string
   - If empty → Show "Reason is required" toast, stop
   ↓
7. Create payload:
   {
     id: user.id (as string),
     status: !currentStatus (invert boolean),
     permanent: radioValue || "" (string),
     message: reasonText.trim()
   }

   Example deactivating active user:
   {
     id: "42",
     status: false,
     permanent: "permanently",
     message: "No longer employed"
   }
   ↓
8. Submit mutation: deactivateUser()
   - Endpoint: PUT /api/user/deactivate
   - Content-Type: application/json
   ↓
9. Server processes:

   SUCCESS PATH:
   a. Refetch user list
   b. Close modal
   c. Show dynamic toast:
      - If activated: "User Activated Successfully"
      - If deactivated: "User Deactivated Successfully"
   d. Reset form state
   e. Status indicator changes color in list

   ERROR PATH:
   a. Show error toast with message
   b. Close modal
   c. Reset form state
</pre>

### Form Fields

| Field             | Visible When   | Required | Type     | Options                      |
| ----------------- | -------------- | -------- | -------- | ---------------------------- |
| Deactivation Type | User is Active | No       | Radio    | "Permanently", "Temporarily" |
| Reason            | Always         | Yes      | TextArea | Multi-line text              |

### Modal Behavior

**File**: `src/components/ui/superAdmin/users/deactivate-modal/deactivate-modal.tsx`

**Dynamic Elements**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Heading: "You Sure!" (always)
Subheading: Based on current status
Button Text: "Activate" or "Deactivate"
Radio Buttons: Only shown when deactivating
</pre>

### Status Logic

**Payload status is inverted**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
status: modalOpen.profile.status === true ? false : true;
</pre>

- If user is active (true) → Send false (deactivate)
- If user is inactive (false) → Send true (activate)

### UI Components Involved

- **Icon**: Activate/Deactivate icon in table/card
- **Modal**: `src/components/ui/superAdmin/users/deactivate-modal/deactivate-modal.tsx`
- **Radio**: `src/components/global/radio-button/radio-button`
- **TextBox**: `src/components/global/text-box/text-box`

### Success Criteria

✅ Modal opens with correct heading/button
✅ Radio buttons shown/hidden correctly
✅ Reason field required
✅ Status toggle succeeds
✅ Dynamic success message displayed
✅ Status indicator updates in list

### Error Scenarios

- **Empty reason**: Validation error, keep modal open
- **Network error**: Show error toast, close modal
- **User not found**: 404 error, show toast
- **Server error**: 500 error, show toast

### File References

- Modal component: `src/components/ui/superAdmin/users/deactivate-modal/deactivate-modal.tsx`
- API call: `src/services/dashboard/superAdmin/uers/users.ts:70-79`
- Mutation handler: `src/screens/users/user-form.tsx:328-365`

---

## 5. Delete User Flow

### Description

Flow for permanently deleting a user from the system.

### Prerequisites

- User is viewing the Users list
- Target user exists

### Steps

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. User clicks Delete icon
   ↓
2. Store user ID in deleteId state
   ↓
3. Delete Modal opens
   - Show delete icon image (/assets/svgs/deleteModal.svg)
   - Heading: "Are You Sure?"
   - Subheading: "Are you sure to delete this user? This action is permanent!"
   ↓
4. User has two options:

   OPTION A: Cancel
   - Click "Cancel" button
   - Modal closes immediately
   - No API call made
   - Clear deleteId state
   - User remains in list

   OPTION B: Confirm Delete
   ↓
   4.1. User clicks "Delete" button
        ↓
   4.2. Submit mutation: deleteUser()
        - Endpoint: DELETE /api/user/{id}
        - Pass deleteId in payload
        ↓
   4.3. Server processes deletion:

        SUCCESS PATH:
        a. Refetch user list (deleted user removed)
        b. Close modal
        c. Clear deleteId state
        d. Show "User Deleted Successfully" toast
        e. User no longer visible in list

        ERROR PATH:
        a. Show error toast with message
        b. Close modal
        c. Clear deleteId state
</pre>

### Modal UI

**File**: `src/components/ui/superAdmin/users/delete-modal/delete-modal.tsx`

**Visual Elements**:

- Delete icon SVG (red/warning style)
- Heading in Typography component
- Warning message emphasizing permanence
- Two buttons: Cancel (transparent) and Delete (filled)

**Buttons**:
| Button | Style | Action | Disabled |
|--------|-------|--------|----------|
| Cancel | Transparent with blue border | Close modal | Never |
| Delete | Filled blue background | Execute deletion | While loading |

### Payload Structure

**File**: `src/screens/users/user-form.tsx:533`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  id: string; // User ID to delete
}
</pre>

The `deleteId` is stored when modal opens via `handleDeleteModalOpen(e, id)`.

### Warning Considerations

⚠️ **THIS ACTION IS PERMANENT**

- User data will be completely removed
- Cannot be undone
- May affect related data (relations, sessions, etc.)
- Consider soft delete/deactivation as alternative

### UI Components Involved

- **Icon**: Delete icon in table/card
- **Modal**: `src/components/ui/superAdmin/users/delete-modal/delete-modal.tsx`
- **Image**: Delete warning icon

### Success Criteria

✅ Modal opens with warning message
✅ Cancel button works (no action)
✅ Delete button executes deletion
✅ Success toast displayed
✅ User removed from list
✅ Modal closes automatically

### Error Scenarios

- **User not found (404)**: Show error toast (already deleted)
- **Network error**: Show error toast
- **Server error (500)**: Show error toast
- **Foreign key constraint**: Backend error (has related data)

### Recommended Improvements

1. Check for related data before allowing delete
2. Show warning if user has active sessions/relations
3. Implement soft delete instead of hard delete
4. Add "Are you REALLY sure?" second confirmation
5. Log deletion in audit trail

### File References

- Modal component: `src/components/ui/superAdmin/users/delete-modal/delete-modal.tsx`
- API call: `src/services/dashboard/superAdmin/uers/users.ts:82-83`
- Mutation handler: `src/screens/users/user-form.tsx:367-391`

---

## 6. Add Parent-Student Relation Flow

### Description

Flow for creating relationships between parents/guardians and students.

### Prerequisites

- User is on the Users page
- Redux state has students and parents data
- At least one parent and one student exist in system

### Steps

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. User clicks "Add Relation" button
   ↓
2. Check Redux state for students/parents:
   - If empty → Must fetch via fetchUsersByGroup()
   - If populated → Use cached data
   ↓
3. Relation Modal opens with:
   - Guardian Name dropdown (single-select)
   - Student Name multi-select dropdown
   - Relation type text field (optional)
   ↓
4. User fills form:
   a. Select ONE parent/guardian from dropdown
      - Shows: name, email, profile image
      - Data source: Redux state.usersByGroup.parents.users

   b. Select ONE OR MORE students from multi-select
      - Click dropdown to see all students
      - Click student to add (shows as chip)
      - Click X on chip to remove
      - Data source: Redux state.usersByGroup.students.users

   c. [Optional] Enter relation type text
      - Examples: "Father", "Mother", "Guardian", "Aunt", etc.
      - Free-form text input
   ↓
5. User clicks "Add Relation" button
   ↓
6. Client-side validation:
   - Check: studentIds.length > 0
     If fail → Show "Select at least one student" toast, stop
   - Check: guardianName.trim() !== ""
     If fail → Show "Guardian Name is required" toast, stop
   ↓
7. Create payload:
   {
     parentId: JSON.parse(guardianName).id,
     studentIds: [studentId1, studentId2, ...],
     relation: relationType || ""
   }

   Example:
   {
     parentId: 15,
     studentIds: [42, 43, 44],
     relation: "Father"
   }
   ↓
8. Submit mutation: addRelation()
   - Endpoint: POST /api/guardians/relationships
   - Content-Type: application/json
   ↓
9. Server creates relationships:

   SUCCESS PATH:
   a. Check response for data.message or data.error
   b. Display appropriate toast (may be success or error from server)
   c. If no error:
      - Close modal
      - Show "Relation Add Successfully" toast
      - Refetch user list
      - Reset form state

   ERROR PATH:
   a. Display error toast with message
   b. Keep modal open (user can retry)
</pre>

### Form Fields

| Field         | Type                  | Required | Data Source                         | Selection |
| ------------- | --------------------- | -------- | ----------------------------------- | --------- |
| Guardian Name | Single Dropdown       | Yes      | `state.usersByGroup.parents.users`  | Single    |
| Student Name  | Multi-Select Dropdown | Yes      | `state.usersByGroup.students.users` | Multiple  |
| Relation      | Text Input            | No       | User input                          | Free text |

### Multi-Select Behavior

**File**: `src/components/ui/superAdmin/users/relation-modal/relationModalOpen.tsx:133-145`

**Features**:

- Select multiple students at once
- Shows selected students as removable chips
- Horizontal scroll if many selections
- Visual feedback for selected items

**Implementation**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
&lt;MultiSelectDropDown
  data={students || []}
  handleChange={(event, selectedOptions) =&gt;
    handleInputChange(
      "studentIds",
      selectedOptions?.map((s) =&gt; s.id)
    )
  }
  value={students?.filter((s) =&gt; formData.studentIds.includes(s.id))}
/&gt;
</pre>

### Redux Data Requirements

**Students Source**: `state.usersByGroup.students.users[]`
**Parents Source**: `state.usersByGroup.parents.users[]`

**Data Shape**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  id: number,
  name: string,
  email: string,
  profileImageUrl?: string
}
</pre>

### Validation Rules

**File**: `src/components/ui/superAdmin/users/relation-modal/relationModalOpen.tsx:31-35`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. studentIds.length === 0 → "Select at least one student"
2. guardianName.trim() === "" → "Guardian Name is required"
</pre>

### UI Components Involved

- **Button**: "Add Relation" button on Users page
- **Modal**: `src/components/ui/superAdmin/users/relation-modal/relationModalOpen.tsx`
- **Dropdown**: Single-select for parent
- **Multi-Select**: Multi-select for students
- **Input**: Text field for relation type

### Success Criteria

✅ Modal opens with populated dropdowns
✅ Can select one parent
✅ Can select multiple students
✅ Relation text optional
✅ Validation works correctly
✅ Relationships created successfully
✅ Success toast displayed
✅ Modal closes automatically

### Error Scenarios

- **No students selected**: Validation error, show toast
- **No parent selected**: Validation error, show toast
- **Empty dropdowns**: Redux not populated, need to fetch
- **Duplicate relation**: Server may allow or reject
- **Network error**: Show error toast, keep modal open
- **Parent/student not found**: 404 error from server

### Use Cases

**Example 1: Single Student**

- Parent: John Doe (ID: 10)
- Students: Jane Doe (ID: 25)
- Relation: "Father"
- Result: 1 relationship created

**Example 2: Multiple Students (Siblings)**

- Parent: Mary Smith (ID: 12)
- Students: Tom Smith (ID: 30), Lisa Smith (ID: 31), Bob Smith (ID: 32)
- Relation: "Mother"
- Result: 3 relationships created (one per student)

**Example 3: Guardian (Not Parent)**

- Parent: Robert Johnson (ID: 15)
- Students: Emily Brown (ID: 40)
- Relation: "Guardian (Grandparent)"
- Result: 1 relationship with custom relation type

### File References

- Modal component: `src/components/ui/superAdmin/users/relation-modal/relationModalOpen.tsx`
- API call: `src/services/dashboard/superAdmin/uers/users.ts:66-67`
- Mutation handler: `src/screens/users/user-form.tsx:257-287`
- Redux slice: `src/lib/store/slices/usersByGroup-slice.ts`

---

## 7. Filter Users Flow

### Description

Flow for filtering users by various criteria.

### Prerequisites

- User is on the Users page viewing the user list

### Available Filters

1. Date Range
2. Name Search
3. Email Search
4. Role/User Type
5. Country

### Steps

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. User accesses filter controls:
   - Desktop (&gt;1220px): Always visible above table
   - Mobile (≤1220px): Click "Filters" button to toggle visibility
   ↓
2. User applies one or more filters:

   ┌─────────────────────────────────────┐
   │ FILTER TYPE: DATE RANGE             │
   └─────────────────────────────────────┘
   a. User clicks date picker
   b. Selects start date and end date
   c. Closes date picker
   d. dateFilter state updates: [startDate, endDate]
   e. React Query automatically refetches
   f. API called with startDate and endDate params
   g. Pagination resets to page 1
   h. Filtered results displayed

   ┌─────────────────────────────────────┐
   │ FILTER TYPE: NAME SEARCH            │
   └─────────────────────────────────────┘
   a. User types in Name search box
   b. Each keystroke resets debounce timer
   c. After 1.5 seconds of no typing:
      - debouncedSearchItem state updates
      - React Query automatically refetches
      - API called with name param
   d. Pagination resets to page 1
   e. Matching users displayed

   ┌─────────────────────────────────────┐
   │ FILTER TYPE: EMAIL SEARCH           │
   └─────────────────────────────────────┘
   a. User types in Email search box
   b. Each keystroke resets debounce timer
   c. After 1.5 seconds of no typing:
      - debouncedSearchItemEmail state updates
      - React Query automatically refetches
      - API called with email param
   d. Pagination resets to page 1
   e. Matching users displayed

   ┌─────────────────────────────────────┐
   │ FILTER TYPE: ROLE                   │
   └─────────────────────────────────────┘
   a. User clicks Role dropdown
   b. Selects a role (Student, Teacher, Parent, etc.)
   c. userType state updates immediately
   d. React Query automatically refetches
   e. API called with userType (roleId) param
   f. Pagination resets to page 1
   g. Only users with selected role displayed

   ┌─────────────────────────────────────┐
   │ FILTER TYPE: COUNTRY                │
   └─────────────────────────────────────┘
   a. User clicks Country dropdown
   b. Selects a country
   c. countryFilter state updates immediately
   d. React Query automatically refetches
   e. API called with countryCode param
   f. Pagination resets to page 1
   g. Only users from selected country displayed
   ↓
3. Multiple filters can be combined:
   - All filters use AND logic
   - Example: Students AND from USA AND created in Jan 2024
   ↓
4. React Query refetches with all active filters:
   - Query key includes all filter states
   - API receives all filter params
   - Single API call with combined filters
   ↓
5. Results update:
   - Table/cards display filtered users
   - Pagination shows updated totals
   - "Showing X-Y of Z entries"
   ↓
6. To clear filters:
   - Date: Click X icon or select null
   - Search: Delete text, wait for debounce
   - Dropdowns: Select empty/default option
   - Each clear triggers new refetch
</pre>

### Filter Details

#### Date Range Filter

**Component**: `FilterByDate`
**State**: `dateFilter` (array: [startDate, endDate] or "")
**Behavior**: Immediate refetch on selection
**Clear**: Click X or select null

**File**: `src/screens/users/user-form.tsx:98-104`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleCalendar = (value) =&gt; {
  if (value === null) {
    setDateFilter(""); // Clear filter
  } else {
    setDateFilter(value); // Set date range
  }
};
</pre>

#### Name Search Filter

**Component**: `SearchBox`
**State**: `debouncedSearchItem` (string)
**Behavior**: Debounced 1.5 seconds
**Clear**: Delete all text

**Debounce Implementation**: `src/screens/users/user-form.tsx:107-126`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleSearch = (e, name) =&gt; {
  const searchValue = e.target.value;

  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current); // Cancel previous timer
  }

  if (name === "name") {
    timeoutRef.current = setTimeout(() =&gt; {
      setDebouncedSearchItem(searchValue); // Update after 1.5s
    }, 1500);
  }
};
</pre>

**Why Debounce?**

- Prevents excessive API calls
- Waits for user to finish typing
- Improves performance
- Reduces server load

#### Email Search Filter

**Component**: `SearchBox`
**State**: `debouncedSearchItemEmail` (string)
**Behavior**: Debounced 1.5 seconds (same as name)
**Clear**: Delete all text

#### Role Filter

**Component**: `FilterDropdown`
**State**: `userType` (JSON string of role object)
**Behavior**: Immediate refetch
**Options**: From Redux `state.roles.roles`

**Handler**: `src/screens/users/user-form.tsx:133-135`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleUserTypeFilter = (e) =&gt; {
  setUserTypeFilter(e.target.value); // Immediate update
};
</pre>

#### Country Filter

**Component**: `FilterDropdown`
**State**: `countryFilter` (JSON string of country object)
**Behavior**: Immediate refetch
**Options**: From `country-state-city` library

**Handler**: `src/screens/users/user-form.tsx:128-130`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleCountryFilter = (e) =&gt; {
  setCountryFilter(e.target.value); // Immediate update
};
</pre>

### API Query Parameters

**File**: `src/screens/users/user-form.tsx:206-217`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
getAllusers(
  {
    startDate: dateFilter[0] || "",
    endDate: dateFilter[1] || "",
    userType: userType !== "" ? JSON.parse(userType)?.id : null,
    limit: rowsPerPage,
    page: currentPage,
    name: debouncedSearchItem || "",
    email: debouncedSearchItemEmail || "",
    countryCode: countryFilter !== "" ? JSON.parse(countryFilter)?.isoCode : "",
  },
  { token }
);
</pre>

### React Query Behavior

**Query Key**: `src/screens/users/user-form.tsx:194-204`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
[
  "getAllUsers",
  currentPage,
  rowsPerPage,
  debouncedSearchItem,
  debouncedSearchItemEmail,
  dateFilter,
  countryFilter,
  userType,
  roles,
];
</pre>

**Key Changes Trigger Refetch**:

- Any filter state changes
- Pagination changes
- Roles data changes (rare)

### UI Components Involved

- **Date Filter**: `src/components/global/filter-by-date/filter-by-date`
- **Search Box**: `src/components/global/search-box/search-box`
- **Dropdown**: `src/components/global/filter-dropdown/filter-dropdown`

### Success Criteria

✅ Filters apply correctly
✅ Results update automatically
✅ Pagination resets to page 1
✅ Total count updates
✅ Multiple filters work together (AND logic)
✅ Clear filter restores all users
✅ Debounce prevents excessive API calls

### Error Scenarios

- **No results found**: Display empty table/cards (0 entries)
- **Invalid date range**: Depends on date picker validation
- **Network error during refetch**: Show error toast, keep previous data
- **API error**: Show error toast

### Performance Considerations

- **Debounced search**: Prevents API call on every keystroke
- **React Query caching**: Reduces redundant network requests
- **Auto-cancel**: Outdated requests cancelled by React Query

### File References

- Filter handlers: `src/screens/users/user-form.tsx:98-135`
- Query setup: `src/screens/users/user-form.tsx:193-224`
- API call: `src/services/dashboard/superAdmin/uers/users.ts:54-57`

---

## 8. Pagination Flow

### Description

Flow for navigating between pages and changing rows per page.

### Prerequisites

- User is viewing a paginated list of users
- Total user count > rows per page

### Steps

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. User views paginated user list
   - Default state: Page 1, 50 users per page
   - Pagination controls display at bottom
   ↓
2. Pagination controls show:
   - Current page number (e.g., "Page 1 of 10")
   - Total pages
   - Total entries count (e.g., "Showing 1-50 of 500")
   - Rows per page dropdown
   - Previous button (disabled on page 1)
   - Page number buttons
   - Next button (disabled on last page)
   ↓
3. User can perform actions:

   ┌─────────────────────────────────────┐
   │ ACTION: CHANGE PAGE                 │
   └─────────────────────────────────────┘
   a. User clicks page number OR Next/Previous button
      ↓
   b. handleChangePage(event, newPage) called
      ↓
   c. currentPage state updates
      Example: currentPage = 1 → currentPage = 2
      ↓
   d. React Query detects query key change
      ↓
   e. API refetch triggered
      GET /api/user/getAllUsers?page=2&amp;limit=50&amp;...
      ↓
   f. Loading state shown briefly
      ↓
   g. New page data received
      ↓
   h. Table/cards update with new users
      ↓
   i. Pagination component updates:
         "Showing 51-100 of 500"
         Page 2 button now active

   ┌─────────────────────────────────────┐
   │ ACTION: CHANGE ROWS PER PAGE        │
   └─────────────────────────────────────┘
   a. User clicks rows per page dropdown
      Options: 50, 100, 200 (desktop)
               50, 100, 200, 300 (mobile)
      ↓
   b. User selects new value (e.g., 100)
      ↓
   c. handleChangeRowsPerPage(event) called
      ↓
   d. rowsPerPage state updates
      Example: rowsPerPage = 50 → rowsPerPage = 100
      ↓
   e. currentPage resets to 1
      (Prevents showing page 5 when only 3 pages exist)
      ↓
   f. React Query detects query key change
      ↓
   g. API refetch triggered
      GET /api/user/getAllUsers?page=1&amp;limit=100&amp;...
      ↓
   h. Loading state shown
      ↓
   i. New data received (more users per page)
      ↓
   j. Table/cards update
      ↓
   k. Pagination component updates:
         "Showing 1-100 of 500"
         Total pages recalculated (500 ÷ 100 = 5 pages)
   ↓
4. Pagination state persists across:
   - Filter changes (resets to page 1)
   - Modal operations (maintains current page)
   - Component re-renders
</pre>

### Pagination Component

**File**: `src/components/global/pagination/pagination`

**Props**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  totalPages: number,        // Total number of pages
  page: number,              // Current page (0-indexed or 1-indexed)
  rowsPerPage: number,       // Users per page
  totalEntries: number,      // Total user count
  onPageChange: (e, page) =&gt; void,
  rowsPerPageChange: (e) =&gt; void,
  dropDownValues: number[],  // [50, 100, 200] or [50, 100, 200, 300]
  inlineStyles?: CSSProperties
}
</pre>

### Handler Implementations

**Change Page**: `src/screens/users/user-form.tsx:91-93`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleChangePage = useCallback((e, newPage) =&gt; {
  setCurrentPage(newPage);
}, []);
</pre>

**Change Rows Per Page**: `src/screens/users/user-form.tsx:94-96`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleChangeRowsPerPage = useCallback((e) =&gt; {
  setRowsPerPage(e?.target?.value);
  // Note: Page reset happens via React Query refetch
}, []);
</pre>

### Pagination Values

**Desktop** (`src/components/ui/superAdmin/users/users-table/users-table.tsx:330`):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
dropDownValues={[50, 100, 200]}
</pre>

**Mobile** (`src/components/ui/superAdmin/users/userView-card/userView-card.tsx:262`):

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
dropDownValues={[50, 100, 200, 300]}
</pre>

### Button States

**Previous Button**:

- **Enabled**: When `currentPage > 1`
- **Disabled**: When `currentPage === 1`

**Next Button**:

- **Enabled**: When `currentPage < totalPages`
- **Disabled**: When `currentPage === totalPages`

**Page Number Buttons**:

- **Active**: Current page highlighted
- **Clickable**: All other pages
- **May show**: "..." for large page counts

### Edge Cases

#### Case 1: Delete Last User on Page

**Scenario**: User is on page 5, deletes the only user on that page

**Current Behavior**:

- User list refetches
- Page 5 now empty (no users)
- User still on page 5 (no auto-redirect)
- User sees empty table/cards

**Expected Behavior** (not implemented):

- Should auto-redirect to page 4 or page 1

#### Case 2: Filter Reduces Results

**Scenario**: User is on page 10, applies filter that returns only 50 users

**Behavior**:

- Filter triggers refetch
- currentPage resets to 1
- Shows filtered results on page 1

#### Case 3: Very Large Dataset

**Scenario**: 10,000+ users in system

**Behavior**:

- Pagination handles gracefully
- Only loads current page (50-200 users)
- No performance issues

### API Parameters

**Query Params**: `src/services/dashboard/superAdmin/uers/users.ts:20-31`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
GET /api/user/getAllUsers?limit=50&amp;page=2&amp;...
</pre>

**Response**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  users: User_Object_Type[],
  totalPages: 10,
  currentPage: 2,
  totalCount: 500
}
</pre>

### UI Components Involved

- **Pagination**: `src/components/global/pagination/pagination`
- **Dropdown**: Rows per page selector
- **Buttons**: Previous, Next, Page numbers

### Success Criteria

✅ Can navigate to any page
✅ Previous/Next buttons work correctly
✅ Previous disabled on page 1
✅ Next disabled on last page
✅ Can change rows per page
✅ Changing rows per page resets to page 1
✅ Total count displayed correctly
✅ "Showing X-Y of Z" accurate

### File References

- Pagination handlers: `src/screens/users/user-form.tsx:91-96`
- Table pagination: `src/components/ui/superAdmin/users/users-table/users-table.tsx:323-332`
- Card pagination: `src/components/ui/superAdmin/users/userView-card/userView-card.tsx:255-264`

---

## 9. Navigate to Counselling Flow

### Description

Flow for navigating from Users page to a specific user's Counselling page.

### Prerequisites

- User is viewing the Users list
- Counselling module exists in the application

### Steps

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. User sees Counselling icon in action buttons
   - Icon: /assets/svgs/counselling.svg
   - Tooltip: "Counselling"
   - Available for every user in list
   ↓
2. User clicks Counselling icon:

   ┌─────────────────────────────────────┐
   │ SCENARIO A: NORMAL CLICK            │
   └─────────────────────────────────────┘
   a. User clicks icon normally (no modifier keys)
      ↓
   b. handleRoute(userId, roleId, event) called
      ↓
   c. Function checks event.ctrlKey and event.metaKey
      Both are false
      ↓
   d. Construct target path:
      targetPath = `/${currentRole}/counselling/${userId}?roleId=${roleId}`
      Example: "/superAdmin/counselling/42?roleId=3"
      ↓
   e. Call: router.push(targetPath)
      ↓
   f. Navigate in SAME tab
      ↓
   g. User leaves Users page
      ↓
   h. Counselling page loads with user context

   ┌─────────────────────────────────────┐
   │ SCENARIO B: CTRL/CMD + CLICK        │
   └─────────────────────────────────────┘
   a. User holds Ctrl key (Windows/Linux) or Cmd key (Mac)
      ↓
   b. User clicks Counselling icon
      ↓
   c. handleRoute(userId, roleId, event) called
      ↓
   d. Function checks event.ctrlKey or event.metaKey
      One of them is true
      ↓
   e. Construct target path (same as above)
      ↓
   f. Call: window.open(targetPath, "_blank")
      ↓
   g. New browser tab opens
      ↓
   h. Counselling page loads in NEW tab
      ↓
   i. User REMAINS on Users page in original tab
</pre>

### URL Structure

**Pattern**: `/{role}/counselling/{userId}?roleId={roleId}`

**Components**:

- `{role}`: Current user's role (superAdmin, admin, counsellor)
- `{userId}`: ID of the user to view in counselling
- `{roleId}`: Role ID of the user (for context)

**Examples**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
/superAdmin/counselling/42?roleId=3
/admin/counselling/15?roleId=5
/counsellor/counselling/99?roleId=4
</pre>

### Handler Implementation

**File**: `src/components/ui/superAdmin/users/users-table/users-table.tsx:68-78`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleRoute = useCallback(
  (id: number, roleId: number, event: React.MouseEvent) =&gt; {
    const targetPath = `/${role}/counselling/${id}?roleId=${roleId}`;

    if (event.ctrlKey || event.metaKey) {
      // Ctrl (Windows) or Cmd (Mac) + Click
      window.open(targetPath, "_blank");
    } else {
      // Normal click
      router.push(targetPath);
    }
  },
  [router, role]
);
</pre>

### Modifier Keys

**Windows/Linux**: `Ctrl + Click`

- Detected via `event.ctrlKey === true`

**macOS**: `Cmd + Click`

- Detected via `event.metaKey === true`

**Function checks both**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
if (event.ctrlKey || event.metaKey) {
  // Open in new tab
}
</pre>

### Use Cases

#### Use Case 1: Quick View

**Scenario**: User wants to quickly check a student's counselling notes

**Action**: Normal click on Counselling icon
**Result**: Navigate to counselling page, view notes, use back button to return

#### Use Case 2: Compare Multiple Users

**Scenario**: Counsellor wants to compare notes for 3 students

**Action**:

1. Ctrl+Click on Student A → Opens in new tab
2. Ctrl+Click on Student B → Opens in another new tab
3. Ctrl+Click on Student C → Opens in another new tab
4. Switch between tabs to compare

**Result**: 4 tabs open (original Users page + 3 counselling pages)

#### Use Case 3: Work on Multiple Tasks

**Scenario**: Admin reviewing user list while counselling a student

**Action**: Ctrl+Click to open counselling in new tab
**Result**: Can continue working on Users page while counselling tab is open

### UI Elements

**Icon**:

- **Source**: `/assets/svgs/counselling.svg`
- **Size**: `clamp(0.625rem, 0.55rem + 0.375vw, 1rem)`
- **Tooltip**: "Counselling" (MUI Tooltip, placement: bottom)

**Location**:

- **Desktop**: Last icon in Actions column
- **Mobile**: Last icon in action icons row in card

### Browser Behavior

**router.push()**: Next.js App Router navigation

- Client-side navigation (faster)
- Preserves app state
- No full page reload
- URL updates in browser
- Can use browser back button

**window.open()**: Native browser API

- Opens new browser tab/window
- Independent session
- Full page load
- Can be closed independently

### UI Components Involved

- **Icon Button**: In UsersTable and UserViewCard
- **Tooltip**: MUI Tooltip component
- **Router**: Next.js useRouter hook

### Success Criteria

✅ Normal click navigates in same tab
✅ Ctrl/Cmd + Click opens in new tab
✅ Correct URL constructed
✅ Counselling page loads with user context
✅ roleId query parameter passed correctly
✅ Back button works (normal click)
✅ Original tab remains (Ctrl+Click)

### Error Scenarios

- **User not found**: Counselling page may show 404
- **No permission**: Counselling page may redirect
- **Invalid roleId**: Counselling page may not load correctly

### Accessibility

**Keyboard Navigation**:

- Tab to icon button
- Enter key to click (same as normal click)
- Ctrl+Enter not standard (may not work)

**Recommendation**: Add keyboard shortcut hint to tooltip for power users

### File References

- Table handler: `src/components/ui/superAdmin/users/users-table/users-table.tsx:68-78`
- Card handler: `src/components/ui/superAdmin/users/userView-card/userView-card.tsx:44-54`
- Icon usage (table): Line 298-315
- Icon usage (card): Line 231-247

---

## 10. Mobile Filter Toggle Flow

### Description

Flow for showing/hiding filter section on mobile devices.

### Prerequisites

- User is on mobile viewport (≤1220px width)
- Filters are initially hidden to save screen space

### Steps

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. User loads Users page on mobile device
   - Viewport width ≤ 1220px detected
   - useMediaQuery({ maxWidth: 1220 }) returns true
   ↓
2. Initial state:
   - showFullFilters = false
   - Filter section hidden
   - Only Mobile Filter Button visible
   ↓
3. Mobile Filter Button displays:
   - Text: "Filters" (when hidden) or "Hide Filters" (when shown)
   - Icon: Changes based on state
   - Position: Top right area, before "Add Relation" and "Add New User" buttons
   ↓
4. User clicks Mobile Filter Button
   ↓
5. handleMobileFilterToggle() called
   ↓
6. Toggle showFullFilters state:

   STATE CHANGE:
   showFullFilters: false → true

   OR

   showFullFilters: true → false
   ↓
7. Conditional rendering of filters:

   {showFullFilters &amp;&amp; (
     &lt;div className={classes.aside}&gt;
       {/* All filter controls */}
       - Date Range Filter
       - Name Search Box
       - Email Search Box
       - Role Dropdown
       - Country Dropdown
     &lt;/div&gt;
   )}
   ↓
8. User can now:

   IF FILTERS ARE SHOWN:
   - Apply any filter (same functionality as desktop)
   - See all 5 filter controls
   - Filters work identically to desktop
   - Click button again to hide

   IF FILTERS ARE HIDDEN:
   - Filters section not rendered
   - Previous filter selections persist in state
   - Active filters still applied to results
   - Click button to show again
   ↓
9. Filter persistence:
   - Hiding filters doesn't clear them
   - Filter values remain in state
   - API continues using active filters
   - Showing filters displays current values
</pre>

### Responsive Breakpoint

**Trigger Point**: `1220px`

**Implementation**: `src/screens/users/user-form.tsx:46`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const mobileViewport = useMediaQuery({ maxWidth: 1220 });
</pre>

**Behavior**:

- **Above 1220px**: Desktop mode, filters always visible
- **At/Below 1220px**: Mobile mode, filters toggleable

### Mobile Filter Button

**Component**: `MobileFilterButton`
**File**: `src/components/global/mobile-filters-button/mobile.filters-button`

**Props**: `src/screens/users/user-form.tsx:393-400`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{
  isOpen: showFullFilters,
  onClick: handleMobileFilterToggle,
  // Optional inline styles
}
</pre>

### Toggle Handler

**File**: `src/screens/users/user-form.tsx:87-89`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
const handleMobileFilterToggle = useCallback(() =&gt; {
  setShowFullFilters((prev) =&gt; !prev);
}, []);
</pre>

**Logic**: Simple boolean toggle

- `false` → `true`: Show filters
- `true` → `false`: Hide filters

### Conditional Rendering

**File**: `src/screens/users/user-form.tsx:576-612`

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
{showFullFilters &amp;&amp; (
  &lt;div className={classes.aside}&gt;
    &lt;FilterByDate ... /&gt;
    &lt;SearchBox placeholder="Search by name" ... /&gt;
    &lt;SearchBox placeholder="Search by email" ... /&gt;
    &lt;FilterDropdown placeholder="Filter By Role" ... /&gt;
    &lt;FilterDropdown placeholder="Filter By Country" ... /&gt;
  &lt;/div&gt;
)}
</pre>

**When `showFullFilters === true`**: Filters section renders
**When `showFullFilters === false`**: Filters section not in DOM

### Filter Layout on Mobile

When shown, filters render as:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
[Date Range Filter     ]
[Search by name        ]
[Search by email       ]
[Filter By Role        ]
[Filter By Country     ]
</pre>

Each filter has:

- Width: `calc(25% - 10px)` (desktop)
- Min-width: `250px`
- Flex: 1
- Background: rgba(0, 0, 0, 1)

On mobile, these likely stack vertically due to viewport constraints.

### State Persistence

**Important**: Hiding filters does NOT clear them!

**Example Flow**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
1. User shows filters
2. User selects "Student" role filter
3. API refetches, shows only students
4. User hides filters
   - showFullFilters = false
   - userType state still = "Student"
   - API still filtering by Student
5. User shows filters again
   - Role dropdown shows "Student" selected
   - Filter still active
</pre>

### Use Cases

#### Use Case 1: Save Screen Space

**Scenario**: Mobile user wants more space for user list

**Action**: Hide filters after applying them
**Result**: More vertical space for cards, filters still active

#### Use Case 2: Quick Filter Access

**Scenario**: User needs to change filter on mobile

**Action**: Tap "Filters" button, change filter, tap "Hide Filters"
**Result**: Filter applied, screen space recovered

#### Use Case 3: Initial Page Load

**Scenario**: User opens Users page on mobile

**Default**: Filters hidden, full screen for user list
**Action**: Tap "Filters" when needed

### Visual Design

**Button States**:

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
Hidden State:
┌───────────┐
│ [▼] Filters │
└───────────┘

Shown State:
┌──────────────────┐
│ [▲] Hide Filters │
└──────────────────┘
</pre>

**Icons**: Likely up/down arrows or expand/collapse icon

### UI Components Involved

- **Button**: `src/components/global/mobile-filters-button/mobile.filters-button`
- **Container**: `.aside` div in UsersForm
- **Filters**: All 5 filter components

### Success Criteria

✅ Button only visible on mobile (<1220px)
✅ Button toggles filter visibility
✅ Filters work correctly when shown
✅ Filter values persist when hidden
✅ Smooth animation/transition
✅ Button text changes based on state
✅ No layout shifts or glitches

### Desktop Behavior

**On Desktop (>1220px)**:

- Mobile Filter Button NOT rendered
- Filters always visible
- No toggle functionality needed

### Accessibility Considerations

**Button**:

- Should have ARIA label: "Toggle filters" or similar
- Icon should be decorative (aria-hidden)
- Focus indicator visible
- Keyboard accessible (Tab + Enter)

**Filter Section**:

- Should have ARIA role: "region"
- Should have aria-label: "User filters"
- Expand/collapse announced by screen readers

### Performance

**Rendering**:

- Filters conditionally rendered (not just hidden with CSS)
- When hidden, filter components unmount
- When shown, filter components remount with previous state
- No performance impact

### File References

- Toggle handler: `src/screens/users/user-form.tsx:87-89`
- Button props: `src/screens/users/user-form.tsx:393-400`
- Conditional render: `src/screens/users/user-form.tsx:576-612`
- Viewport check: `src/screens/users/user-form.tsx:46`

---

## Complete Users Module Flowchart

### FlowChart

Flowchart Link: https://tinyurl.com/4yrz93t6

<pre style="color: rgba(0, 0, 0, 1); background-color: white; padding: 10px; border-radius: 8px;">
flowchart TD
    Start([User Navigates to<br/>/:role/users]) --> Auth{Authenticated?}
    Auth -->|No| Redirect[Redirect to /signin]
    Auth -->|Yes| RoleCheck{Role Authorized?}

    RoleCheck -->|superAdmin/admin/counsellor| LoadPage[Load UsersForm Component]
    RoleCheck -->|Other Roles| AccessDenied[Render Null - No Access]

    LoadPage --> FetchUsers[React Query: getAllusers API<br/>GET /api/user/getAllUsers]
    FetchUsers --> Loading{Loading?}
    Loading -->|Yes| ShowSpinner[Display LoadingBox]
    Loading -->|No| CheckViewport{Viewport > 1220px?}

    CheckViewport -->|Yes| TableView[Render UsersTable<br/>Desktop View]
    CheckViewport -->|No| CardView[Render UserViewCard<br/>Mobile View]

    TableView --> DisplayData[Display User List with:<br/>- Profile Info<br/>- Role Badges<br/>- Status Indicators<br/>- Sync Status<br/>- Action Buttons<br/>- Pagination]
    CardView --> DisplayData

    DisplayData --> UserActions{User Action?}

    %% Add New User Flow
    UserActions -->|Click Add New User| OpenAddModal[Open Add User Modal]
    OpenAddModal --> FillAddForm[Fill Form:<br/>Name, Email, Password,<br/>Gender, Country, Phone,<br/>Role, Image, Ticket]
    FillAddForm --> SubmitAdd{Submit?}
    SubmitAdd -->|Yes| ValidateAdd{Validate Form?}
    ValidateAdd -->|Fail| ShowAddError[Show Validation Error Toast]
    ShowAddError --> FillAddForm

    ValidateAdd -->|Pass| CheckImage{Image<br/>Uploaded?}
    CheckImage -->|No| FetchDummy[Fetch Default Dummy Image]
    FetchDummy --> CreateAddPayload[Create FormData Payload]
    CheckImage -->|Yes| CreateAddPayload

    CreateAddPayload --> CallAddAPI[POST /api/user/signUp<br/>multipart/form-data]
    CallAddAPI --> AddSuccess{Success?}

    AddSuccess -->|201 Created| CloseAddModal[Close Modal]
    CloseAddModal --> UpdateRedux[Dispatch fetchUsersByGroup<br/>Update Redux State]
    UpdateRedux --> RefetchUserList[Refetch User List]
    RefetchUserList --> ShowAddSuccess[Show Success Toast:<br/>User Add Successfully]
    ShowAddSuccess --> DisplayData

    AddSuccess -->|400/409/500| ShowAddAPIError[Show Error Toast:<br/>Duplicate Email/Validation]
    ShowAddAPIError --> FillAddForm

    SubmitAdd -->|Cancel| CloseAddCancel[Close Modal]
    CloseAddCancel --> DisplayData

    %% Edit User Flow
    UserActions -->|Click Edit Icon| OpenEditModal[Open Edit User Modal<br/>with Prefilled Data]
    OpenEditModal --> ModifyFields[Modify Fields:<br/>Name, Email, Pseudo,<br/>Country, Phone, Role,<br/>Parent Email]

    ModifyFields --> ImageAction{Upload<br/>New Image?}
    ImageAction -->|Yes| UploadImageAPI[POST /api/upload<br/>multipart/form-data<br/>Separate API Call]
    UploadImageAPI --> ImageUploadResult{Upload<br/>Success?}
    ImageUploadResult -->|Yes| StoreImageURL[Store Image URL in State]
    StoreImageURL --> ShowImageSuccess[Show Image Success Toast]
    ImageUploadResult -->|No| ShowImageError[Show Image Error Toast]
    ImageAction -->|No| SubmitEdit{Submit Edit?}
    ShowImageSuccess --> SubmitEdit
    ShowImageError --> SubmitEdit

    SubmitEdit -->|Yes| ValidateEmail{Valid<br/>Email?}
    ValidateEmail -->|No| ShowEmailError[Show Email Error Toast]
    ShowEmailError --> ModifyFields

    ValidateEmail -->|Yes| CreateUpdatePayload[Create Update Payload<br/>JSON]
    CreateUpdatePayload --> CallUpdateAPI[PUT /api/user/update<br/>application/json]
    CallUpdateAPI --> UpdateSuccess{Success?}

    UpdateSuccess -->|200 OK| RefetchAfterUpdate[Refetch User List]
    RefetchAfterUpdate --> CloseEditModal[Close Modal]
    CloseEditModal --> ShowUpdateSuccess[Show Success Toast:<br/>User Updated Successfully]
    ShowUpdateSuccess --> DisplayData

    UpdateSuccess -->|404/500| ShowUpdateError[Show Error Toast]
    ShowUpdateError --> CloseEditModalError[Close Modal]
    CloseEditModalError --> DisplayData

    SubmitEdit -->|Cancel| CloseEditCancel[Close Modal]
    CloseEditCancel --> DisplayData

    %% Activate/Deactivate Flow
    UserActions -->|Click Activate/Deactivate Icon| OpenDeactivateModal[Open Deactivate Modal]
    OpenDeactivateModal --> CheckCurrentStatus{User<br/>Active?}

    CheckCurrentStatus -->|Yes| ShowDeactivateForm[Show Deactivate Form:<br/>Radio: Permanent/Temporary<br/>Reason Required]
    CheckCurrentStatus -->|No| ShowActivateForm[Show Activate Form:<br/>Reason Required]

    ShowDeactivateForm --> FillReason[Fill Reason Text]
    ShowActivateForm --> FillReason

    FillReason --> SubmitDeactivate{Submit?}
    SubmitDeactivate -->|Yes| ValidateReason{Reason<br/>Filled?}
    ValidateReason -->|No| ShowReasonError[Show Reason Error Toast]
    ShowReasonError --> FillReason

    ValidateReason -->|Yes| CreateDeactivatePayload[Create Payload:<br/>Invert Status, Permanent Type,<br/>Reason Text]
    CreateDeactivatePayload --> CallDeactivateAPI[PUT /api/user/deactivate<br/>application/json]
    CallDeactivateAPI --> DeactivateSuccess{Success?}

    DeactivateSuccess -->|200 OK| RefetchAfterDeactivate[Refetch User List]
    RefetchAfterDeactivate --> CloseDeactivateModal[Close Modal]
    CloseDeactivateModal --> ShowDeactivateSuccess[Show Dynamic Success Toast:<br/>Activated/Deactivated Successfully]
    ShowDeactivateSuccess --> DisplayData

    DeactivateSuccess -->|404/500| ShowDeactivateError[Show Error Toast]
    ShowDeactivateError --> CloseDeactivateError[Close Modal]
    CloseDeactivateError --> DisplayData

    SubmitDeactivate -->|Cancel| CloseDeactivateCancel[Close Modal]
    CloseDeactivateCancel --> DisplayData

    %% Delete User Flow
    UserActions -->|Click Delete Icon| StoreDeleteID[Store User ID in deleteId State]
    StoreDeleteID --> OpenDeleteModal[Open Delete Modal:<br/>Show Warning Message]
    OpenDeleteModal --> DeleteAction{User<br/>Action?}

    DeleteAction -->|Confirm Delete| CallDeleteAPI[DELETE /api/user/:id]
    CallDeleteAPI --> DeleteSuccess{Success?}

    DeleteSuccess -->|200 OK| RefetchAfterDelete[Refetch User List]
    RefetchAfterDelete --> CloseDeleteModal[Close Modal]
    CloseDeleteModal --> ClearDeleteID[Clear deleteId State]
    ClearDeleteID --> ShowDeleteSuccess[Show Success Toast:<br/>User Deleted Successfully]
    ShowDeleteSuccess --> DisplayData

    DeleteSuccess -->|404/409/500| ShowDeleteError[Show Error Toast:<br/>Not Found/Has Relations]
    ShowDeleteError --> CloseDeleteError[Close Modal]
    CloseDeleteError --> ClearDeleteIDError[Clear deleteId State]
    ClearDeleteIDError --> DisplayData

    DeleteAction -->|Cancel| CloseDeleteCancel[Close Modal]
    CloseDeleteCancel --> DisplayData

    %% Add Relation Flow
    UserActions -->|Click Add Relation| CheckReduxUsers{Redux Has<br/>Users?}
    CheckReduxUsers -->|No| FetchGroupedUsers[Dispatch fetchUsersByGroup<br/>GET /api/user/getUsersByGroup]
    FetchGroupedUsers --> OpenRelationModal[Open Add Relation Modal]
    CheckReduxUsers -->|Yes| OpenRelationModal

    OpenRelationModal --> PopulateDropdowns[Populate Dropdowns:<br/>Parents and Students<br/>from Redux State]
    PopulateDropdowns --> FillRelationForm[Select:<br/>One Parent<br/>Multiple Students<br/>Relation Type Optional]

    FillRelationForm --> SubmitRelation{Submit?}
    SubmitRelation -->|Yes| ValidateRelation{Validation?}
    ValidateRelation -->|No Students| ShowStudentError[Show Student Error Toast]
    ShowStudentError --> FillRelationForm
    ValidateRelation -->|No Guardian| ShowGuardianError[Show Guardian Error Toast]
    ShowGuardianError --> FillRelationForm

    ValidateRelation -->|Pass| CreateRelationPayload[Create Payload:<br/>parentId, studentIds, relation]
    CreateRelationPayload --> CallRelationAPI[POST /api/guardians/relationships<br/>application/json]
    CallRelationAPI --> RelationSuccess{Success?}

    RelationSuccess -->|201 Created| CloseRelationModal[Close Modal]
    CloseRelationModal --> RefetchAfterRelation[Refetch User List]
    RefetchAfterRelation --> ShowRelationSuccess[Show Success Toast:<br/>Relation Add Successfully]
    ShowRelationSuccess --> DisplayData

    RelationSuccess -->|400/404/500| ShowRelationError[Show Error Toast:<br/>Parent/Student Not Found]
    ShowRelationError --> FillRelationForm

    SubmitRelation -->|Cancel| CloseRelationCancel[Close Modal]
    CloseRelationCancel --> DisplayData

    %% Filter Users Flow
    UserActions -->|Apply Filters| FilterFlow[Filter Flow]
    FilterFlow --> FilterType{Filter<br/>Type?}

    FilterType -->|Date Range| UpdateDateFilter[Update dateFilter State<br/>Immediate Refetch]
    FilterType -->|Name Search| DebounceSearch[Debounce 1.5s<br/>Update debouncedSearchItem]
    FilterType -->|Email Search| DebounceEmail[Debounce 1.5s<br/>Update debouncedSearchItemEmail]
    FilterType -->|Role| UpdateRoleFilter[Update userType State<br/>Immediate Refetch]
    FilterType -->|Country| UpdateCountryFilter[Update countryFilter State<br/>Immediate Refetch]

    UpdateDateFilter --> RefetchQuery[React Query Auto-Refetch<br/>GET /api/user/getAllUsers<br/>with filter params]
    DebounceSearch --> RefetchQuery
    DebounceEmail --> RefetchQuery
    UpdateRoleFilter --> RefetchQuery
    UpdateCountryFilter --> RefetchQuery

    RefetchQuery --> ResetPagination[Reset to Page 1]
    ResetPagination --> FetchUsers

    %% Pagination Flow
    UserActions -->|Change Page| PaginationFlow[Update currentPage State]
    PaginationFlow --> FetchUsers

    UserActions -->|Change Rows Per Page| UpdateRowsPerPage[Update rowsPerPage State]
    UpdateRowsPerPage --> ResetToPage1[Reset currentPage to 1]
    ResetToPage1 --> FetchUsers

    %% Counselling Navigation
    UserActions -->|Click Counselling Icon| CheckModifier{Modifier<br/>Key?}
    CheckModifier -->|Ctrl/Cmd + Click| OpenNewTab[window.open<br/>/:role/counselling/:userId<br/>in New Tab]
    OpenNewTab --> DisplayData
    CheckModifier -->|Normal Click| NavigateCounselling[router.push<br/>/:role/counselling/:userId<br/>Same Tab]
    NavigateCounselling --> LeavePage[Leave Users Page]

    %% Mobile Filter Toggle
    UserActions -->|Click Mobile Filter Button| ToggleFilters{showFullFilters<br/>State?}
    ToggleFilters -->|false| ShowFilters[Show Filters Section<br/>Set showFullFilters = true]
    ShowFilters --> DisplayData
    ToggleFilters -->|true| HideFilters[Hide Filters Section<br/>Set showFullFilters = false]
    HideFilters --> DisplayData

    %% Auto-Refetch
    DisplayData --> AutoRefetch[Auto-Refetch Every 5 Minutes]
    AutoRefetch --> FetchUsers

    %% Error Scenarios
    FetchUsers -->|Network Error| ShowFetchError[Show Error Toast]
    ShowFetchError --> DisplayData

    CallAddAPI -->|Network Error| ShowAddAPIError
    CallUpdateAPI -->|Network Error| ShowUpdateError
    CallDeactivateAPI -->|Network Error| ShowDeactivateError
    CallDeleteAPI -->|Network Error| ShowDeleteError
    CallRelationAPI -->|Network Error| ShowRelationError

    %% Styling
    classDef successStyle fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
    classDef errorStyle fill:#f44336,stroke:#c62828,stroke-width:3px,color:#fff
    classDef apiStyle fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef processStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef decisionStyle fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef displayStyle fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    classDef deniedStyle fill:#ff5722,stroke:#d84315,stroke-width:3px,color:#fff
    classDef redirectStyle fill:#ff9800,stroke:#e65100,stroke-width:2px

    class ShowAddSuccess,ShowUpdateSuccess,ShowDeactivateSuccess,ShowDeleteSuccess,ShowRelationSuccess,ShowImageSuccess successStyle
    class ShowAddError,ShowUpdateError,ShowDeactivateError,ShowDeleteError,ShowRelationError,ShowAddAPIError,ShowEmailError,ShowReasonError,ShowStudentError,ShowGuardianError,ShowImageError,ShowFetchError errorStyle
    class CallAddAPI,CallUpdateAPI,CallDeactivateAPI,CallDeleteAPI,CallRelationAPI,UploadImageAPI,FetchUsers,FetchGroupedUsers apiStyle
    class LoadPage,CreateAddPayload,CreateUpdatePayload,CreateDeactivatePayload,CreateRelationPayload,UpdateRedux,RefetchUserList,RefetchAfterUpdate,RefetchAfterDeactivate,RefetchAfterDelete,RefetchAfterRelation,StoreImageURL,FetchDummy,UpdateDateFilter,DebounceSearch,DebounceEmail,UpdateRoleFilter,UpdateCountryFilter,RefetchQuery,ResetPagination,PaginationFlow,UpdateRowsPerPage,ResetToPage1,StoreDeleteID,ClearDeleteID,ClearDeleteIDError,OpenNewTab,NavigateCounselling,ShowFilters,HideFilters,AutoRefetch processStyle
    class Auth,RoleCheck,Loading,CheckViewport,UserActions,SubmitAdd,ValidateAdd,CheckImage,AddSuccess,ImageAction,ImageUploadResult,SubmitEdit,ValidateEmail,UpdateSuccess,CheckCurrentStatus,SubmitDeactivate,ValidateReason,DeactivateSuccess,DeleteAction,DeleteSuccess,CheckReduxUsers,SubmitRelation,ValidateRelation,RelationSuccess,FilterType,CheckModifier,ToggleFilters decisionStyle
    class DisplayData displayStyle
    class AccessDenied deniedStyle
    class Redirect redirectStyle
</pre>

### Flowchart Legend

#### Color Coding

- 🔵 **Light Blue** - Entry points and user navigation
- 🟢 **Green** - Success states and completion
- 🟡 **Yellow** - API calls and backend operations
- 🔴 **Red** - Error states and validation failures
- 🟠 **Orange** - Redirects and access denied
- ⚪ **rgba(0, 0, 0, 1)/Gray** - Processing and decision nodes

#### Node Types

- **Rectangle** - Process or action
- **Diamond** - Decision point or condition
- **Rounded Rectangle** - Start/end state
- **Parallelogram** - Display or UI element

#### Flow Paths

- **Solid Arrow** - Primary flow
- **Labeled Arrow** - Conditional flow with condition label

### API Endpoints Used in Flowchart

| API Endpoint                   | Method | Used In Flow                    |
| ------------------------------ | ------ | ------------------------------- |
| `/api/user/getAllUsers`        | GET    | View Users, Filters, Pagination |
| `/api/user/getUsersByGroup`    | GET    | Add Relation (data fetch)       |
| `/api/user/signUp`             | POST   | Add New User                    |
| `/api/user/update`             | PUT    | Edit User                       |
| `/api/user/deactivate`         | PUT    | Activate/Deactivate User        |
| `/api/user/{id}`               | DELETE | Delete User                     |
| `/api/guardians/relationships` | POST   | Add Parent-Student Relation     |
| `/api/upload`                  | POST   | Edit User (image upload)        |

### Key Decision Points

1. **Authentication Check** - Verifies JWT token exists
2. **Role Authorization** - Validates user role (superAdmin/admin/counsellor)
3. **Viewport Check** - Determines desktop (>1220px) vs mobile view
4. **Form Validation** - Client-side validation before API calls
5. **User Status Check** - Active vs Inactive for deactivate modal
6. **Modifier Key Check** - Ctrl/Cmd+Click for new tab navigation
7. **Redux State Check** - Validates grouped users data availability

### State Changes

| State Variable             | When Updated             | Triggers                  |
| -------------------------- | ------------------------ | ------------------------- |
| `currentPage`              | Pagination change        | API refetch               |
| `rowsPerPage`              | Rows per page change     | API refetch, reset page   |
| `dateFilter`               | Date range selection     | API refetch, reset page   |
| `debouncedSearchItem`      | After 1.5s typing        | API refetch, reset page   |
| `debouncedSearchItemEmail` | After 1.5s typing        | API refetch, reset page   |
| `userType`                 | Role filter selection    | API refetch, reset page   |
| `countryFilter`            | Country filter selection | API refetch, reset page   |
| `showFullFilters`          | Mobile filter toggle     | Show/hide filters section |
| `deleteId`                 | Delete icon click        | Store ID for deletion     |
| Modal states               | Button clicks            | Open/close modals         |

---

## Summary

This document covers all 10 major user flows in the Users Module:

1. ✅ **View Users List** - Initial page load and data display
2. ✅ **Add New User** - Complete user creation with validation
3. ✅ **Edit User** - Update existing user with image upload
4. ✅ **Activate/Deactivate User** - Status toggle with reasons
5. ✅ **Delete User** - Permanent deletion with confirmation
6. ✅ **Add Parent-Student Relation** - Multi-select relationship creation
7. ✅ **Filter Users** - 5 filter types with debouncing
8. ✅ **Pagination** - Page navigation and rows per page
9. ✅ **Navigate to Counselling** - Normal and Ctrl+Click navigation
10. ✅ **Mobile Filter Toggle** - Responsive filter visibility

Each flow includes:

- Complete step-by-step process
- Prerequisites and success criteria
- Error scenarios and edge cases
- UI components involved
- File references with line numbers
- Code examples

---

**Last Updated**: 2025-01-02
**Version**: 1.0
**Module**: Users Management - User Flows
