export type ChurnApi_Payload_Type = {
  subjectId: string;
  curriculumId: string;
  gradeId: string;
  boardId: string;
  teacher_id: string;
  student_id: string;
  enrollment_id: string;
  dateFilter: string | [string, string];
  currentPage: number;
  rowsPerPage: number;
};

export type ChurnData_Response_Type = {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: [
    {
      id: number;
      enrollment_id: number;
      additional_feedback: string | null;
      churned_at: string; // ISO 8601 date string
      createdAt: string; // ISO 8601 date string
      updatedAt: string; // ISO 8601 date string
      deletedAt: string | null; // ISO 8601 date string
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
        group_id: string; // UUID
        tutor_hourly_rate: number;
        name: string;
        google_chat_space_id: string;
        google_chat_space_name: string;
        is_permanent: boolean;
        pause_ends_at: string | null; // ISO 8601 date string
        pause_starts_at: string | null; // ISO 8601 date string
        lead_generator: string | null;
        priority: number | null;
        createdAt: string; // ISO 8601 date string
        updatedAt: string; // ISO 8601 date string
        deletedAt: string | null; // ISO 8601 date string
        enrollment_id: number | null;
        subject: {
          id: number;
          name: string;
        };
        tutor: {
          id: number;
          name: string;
          email: string;
        };
      };
      feedbacks: Array<{
        id: number;
        churn_id: number;
        user_id: number;
        additional_notes: string | null;
        createdAt: string; // ISO 8601 date string
        updatedAt: string; // ISO 8601 date string
        deletedAt: string | null; // ISO 8601 date string
        user: {
          id: number;
          name: string;
          email: string;
        };
        feedbackReasons: Array<{
          id: number;
          churn_feedback_id: number;
          reason_id: number;
          createdAt: string; // ISO 8601 date string
          updatedAt: string; // ISO 8601 date string
          deletedAt: string | null; // ISO 8601 date string
          reason: {
            id: number;
            reason: string;
          };
        }>;
        feedbackAnswers: Array<{
          id: number;
          churn_feedback_id: number;
          question_id: number;
          answer_text: string | null;
          createdAt: string; // ISO 8601 date string
          updatedAt: string; // ISO 8601 date string
          deletedAt: string | null; // ISO 8601 date string
          question: {
            id: number;
            question: string;
          };
        }>;
      }>;
    }
  ];
};
