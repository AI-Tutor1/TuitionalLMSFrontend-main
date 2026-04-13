export type MonthlySessionCountForTutor_Api_Params_Type = {
  tutor_id: string;
  month: string;
};

export type MonthlySessionCountForTutor_Api_Response_Type = {
  success: boolean;
  total_earned: number;
  upcoming_sessions: number;
  sessionSummary: {
    Conducted: number;
    Cancelled: number;
    "Teacher Absent": number;
    "Student Absent": number;
    "Upcoming Sessions": number;
    "No Show": number;
  };
  tutorPayout: {
    id: number;
    tutor_id: number;
    start_date: string;
    end_date: string;
    total_sessions: number;
    balance: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
  };
};
