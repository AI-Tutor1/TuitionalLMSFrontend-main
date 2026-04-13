// User Role
interface UserRole {
  id: number;
  name: string;
}

// Base User (used in feedback)
interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string;
  role?: UserRole;
  country_code?: string;
}

// Session Feedback
interface SessionFeedbackType {
  id: number;
  sessionId: number;
  userId: number;
  rating: number;
  feeling: number;
  comment: string | null;
  concerns: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: User;
}

// Tutor
interface Tutor {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string;
}

// Subject, Curriculum, Board, Grade
interface Subject {
  id: number;
  name: string;
}

interface Curriculum {
  id: number;
  name: string;
}

interface Board {
  id: number;
  name: string;
}

interface Grade {
  id: number;
  name: string;
}

// Student in a group
interface StudentGroupUser {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string;
  country_code?: string;
}

// Student Group
interface StudentGroup {
  id: number;
  group_id: string;
  StudentId: number | null;
  student_id: number;
  enrollment_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: StudentGroupUser;
}

// Session Enrollment
interface SessionEnrollment {
  id: number;
  name: string;
  subject_id: number;
  curriculum_id: number;
  board_id: number;
  grade_id: number;
  subject: Subject;
  curriculum: Curriculum;
  board: Board;
  grade: Grade;
  studentsGroups: StudentGroup[];
}

// Session Item (main data object)
interface SessionItem {
  id: number;
  class_schedule_id: number | null;
  subject_id: number;
  board_id: number;
  curriculum_id: number;
  grade_id: number;
  enrollment_id: number;
  meeting_link: string;
  tag: string;
  space_name: string;
  duration: number;
  created_at: string;
  meet_recording: string | null;
  tutor_class_time: number;
  tutor_scaled_class_time: number;
  tutor_id: number;
  student_group_id: string;
  conclusion_type: string;
  session_remarks: string | null;
  extended_duration: number;
  is_reviewed: boolean;
  reviewed_by: number | null;
  sessionFeedbacks: SessionFeedbackType[];
  tutor: Tutor;
  sessionEnrollment: SessionEnrollment;
}

// API Response
interface SessionFeedbacksResponse {
  data: SessionItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Export all types
export type {
  UserRole,
  User,
  SessionFeedbackType,
  Tutor,
  Subject,
  Curriculum,
  Board,
  Grade,
  StudentGroupUser,
  StudentGroup,
  SessionEnrollment,
  SessionItem,
  SessionFeedbacksResponse,
};
