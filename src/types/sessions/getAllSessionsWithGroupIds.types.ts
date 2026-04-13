// api query param types
export type GetAllSessionsWithGroupIds_Params_Type = {
  page?: string;
  limit?: string;
  student_name?: string;
  student_ids?: string;
  start_time?: string;
  end_time?: string;
  conclusion_type?: string;
  tutor_id?: string;
  subject_id?: string;
  board_id?: string;
  curriculum_id?: string;
  grade_id?: string;
  enrollment_id?: string;
  include_recording?: string;
  is_reviewed?: "Admin" | "Manager" | "Both" | "Pending" | "true" | "false";
  below_benchmark?: string;
};

// api payload type
export type GetAllSessionsWithGroupIds_Payload_Type = {
  enrollment_id?: string;
  tutor_id?: string;
  subject_id?: string;
  conclusion_type?: string;
  board_id?: string;
  curriculum_id?: string;
  grade_id?: string;
  start_time?: string;
  end_time?: string;
  group_id?: string;
  student_name?: string;
  student_ids?: string;
  include_recording?: string;
  is_reviewed?: "Admin" | "Manager" | "Both" | "Pending" | "true" | "false";
  reviewed_by?: string; // comma-separated reviewer IDs
  below_benchmark?: string;
};

// api response type
export type GetAllSessionsWithEnrollmentIds_Api_Response_Type = {
  currentPage?: number;
  totalPages?: number;
  totalSessions?: number;
  data?: Array<{
    session: {
      id: number;
      class_schedule_id: number;
      board_id: string;
      curriculum_id: string;
      grade_id: string;
      meeting_link: string;
      space_name: string;
      duration: number;
      created_at: string;
      meet_recording: string[];
      tutor_class_time: number;
      tutor_scaled_class_time: number;
      tutor_id: number;
      student_group_id: string;
      conclusion_type: string;
      is_reviewed: "Admin" | "Manager" | "Both" | "Pending";
      ClassSchedule: {
        id: number;
        enrollment: {
          id: number;
          subject_id: number;
          subject: {
            id: number;
            name: string;
          };
        };
      };
      tutor: {
        name: string;
        id: number;
        email: string;
        profileImageUrl: string;
        country_code: string;
      };
      groupSessionTime: Array<{
        id: number;
        student_id: number;
        display_name: string;
        session_id: number;
        class_duration_time: number;
        class_scaled_duration_time: number;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
        student_data: {
          name: string;
          id: number;
          email: string;
          profileImageUrl: string;
          country_code: string;
        };
      }>;
    };
    students: Array<{
      name: string;
      id: number;
      email: string;
      profileImageUrl: string;
      country_code: string;
    } | null>;
    expectedStudents: Array<{
      name: string;
      id: number;
      email: string;
      profileImageUrl: string;
      country_code: string;
    }>;
  }>;
};
