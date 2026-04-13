export type SessionSummaryForTutuor_Api_Params_Type = {
  tutor_id?: string;
};

export type SessionSummaryForTutor_Api_Response_Type = {
  success: boolean;
  message: string;
  data: {
    enrollment_id: number | null;
    tutor_hourly_rate: number | null;
    name: string | null;
    session_count: number;
    duration: number | null;
  }[];
};
