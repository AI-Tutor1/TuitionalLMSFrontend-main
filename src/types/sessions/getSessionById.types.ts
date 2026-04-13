import { DataItem } from "@/services/dashboard/superAdmin/transactions/transaction.types";

// Define types for the nested objects
export type Tutor = {
  name: string;
  id: number;
  email: string;
  profileImageUrl: string;
  country_code: string | null;
};

export type StudentData = {
  name: string;
  id: number;
  email: string;
  profileImageUrl: string;
  country_code: string | null;
};

export type Reviewer = {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string;
};

export type GroupSessionTime = {
  id: number;
  student_id: number | null;
  display_name: string;
  session_id: number;
  profileImageUrl: string;
  class_duration_time: number;
  class_scaled_duration_time: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  student_data: StudentData | null;
};

export type ClassSchedule = {
  id: number;
  status: boolean;
  enrollment_id: number;
  teacher_schedule_id: number;
  meetLink: string | null;
  meetSpace: string | null;
  isCancelled: boolean | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Session = {
  tag?: string;
  id: number;
  class_schedule_id: number;
  subject: { name: string };
  board_id: number | null;
  curriculum_id: number | null;
  grade_id: number | null;
  meeting_link: string;
  space_name: string;
  duration: number;
  created_at: string;
  meet_recording: string;
  tutor_class_time: number;
  tutor_scaled_class_time: number;
  tutor_id: number;
  student_group_id: string;
  conclusion_type: string;
  is_reviewed: "Admin" | "Manager" | "Both" | "Pending" | "";
  paymentStatuses: {
    id: number;
    session_id: number;
    student_id: number;
    is_paid: boolean;
    payment_date: string;
    createdAt: string;
    updatedAt: string;
    student: {
      id: number;
      name: string;
      email: string;
      profileImageUrl: string;
    };
  }[];
  reviews: ReviewsType[];
  ClassSchedule: ClassSchedule;
  Notes: any[];
  tutor: Tutor;
  groupSessionTime: GroupSessionTime[];
  sessionEnrollment: {
    studentsGroups: Student[];
  };
  conferences: Conference[];
  sessionTransaction: DataItem[];
};

export type ReviewsType = {
  id: number;
  session_id: number;
  reviewer_id: number;
  created_at: string;
  reviewer: Reviewer;
};
export type Conference = {
  id: number;
  endTime: number;
  startTime: number;
  space_name: string;
  display_name: string;
  session_id: number;
  user_id: number | null;
  duration: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type User = {
  name: string;
  id: number;
  email: string;
  profileImageUrl: string;
  country_code: string | null;
};

export type Student = {
  id: number;
  group_id: string;
  student_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  StudentId: number | null;
  user: User;
};

export type SessionById_Response_Type = {
  session: Session;
  success: boolean;
};
