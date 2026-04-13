// get all enrollments
export type GetAllEnrollment_Api_Params_Type = {
  name?: string;
  startDate?: string;
  endDate?: string;
  limit?: number | null;
  page?: number | null;
  subjectId?: string;
  curriculumId?: string;
  boardId?: string;
  gradeId?: string;
  teacher_id?: string;
  student_id?: string;
  enrollment_id?: string;
  childrens?: string;
  on_break?: boolean | string;
  is_permanent?: boolean | string;
};

export type GetAllEnrollment_Api_Response_Type = {
  data: {
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
    subject: {
      id: number;
      name: string;
    } | null;
    curriculum: {
      id: number;
      name: string;
    } | null;
    board: {
      id: number;
      name: string;
    } | null;
    grade: {
      id: number;
      name: string;
    } | null;
    students: {
      name: string;
      id: number;
      email: string;
      profileImageUrl: string;
      country_code: string;
    }[];
    studentsGroups: any[];
  }[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
};

// create enrollment
export type Create_Enrollment_Payload_Type = {
  tutor_id: number;
  subject_id: number;
  on_break: boolean;
  hourly_rate: number;
  request_rate: number;
  tutor_hourly_rate: number;
  curriculum_id: number;
  grade_id: number;
  board_id: number;
  student_ids: number[];
};

export type Create_Enrollment_Api_Response_Type = {
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
  group?: {
    id: number;
    group_id: string;
    student_id: number;
    createdAt: string;
    updatedAt: string;
  }[];
  error?: string;
};

export type ChangeEnrollmentBrekStatus_Api_Payload_Type = {
  id: number | null;
  on_break?: boolean | null;
  is_permanent?: boolean;
  pause_ends_at?: string;
  pause_starts_at?: string;
  user_id?: number;
  reason_ids?: number[];
  answers?: [
    {
      question_id: number;
      answer: string;
    }
  ];
  additional_notes?: string;
  additional_feedback?: string;
};

// change enrollment break status
export type ChangeEnrollmentBrekStatus_Api_Response_Type = {
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
    createdAt: string; // ISO 8601 date format (e.g., "2025-05-03T17:16:41.000Z")
    updatedAt: string; // ISO 8601 date format
    deletedAt: string | null; // Nullable string
    enrollment_id: number | null; // Nullable number
  };
};

export type GetEnrollmentByGroupId_Api_Response_Type = {
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
  subject: {
    id: number;
    name: string;
  };
  board: {
    id: number;
    name: string;
  };
  curriculum: {
    id: number;
    name: string;
  };
  grade: {
    id: number;
    name: string;
  };
  classSchedules: {
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
  }[];
  studentsData: {
    name: string;
    id: number;
    email: string;
    profileImageUrl: string;
    country_code: string;
  }[];
};
