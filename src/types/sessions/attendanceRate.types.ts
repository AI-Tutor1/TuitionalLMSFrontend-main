export type AttendanceRateBySubject_Api_Params_Type = {
  start_date?: string;
  end_date?: string;
  subject_id?: number | number[] | null;
};

export type AttendanceRateBySubject_ApiResponseObject_Type = {
  subject_id: number;
  subject_name: string;
  total_sessions: number; // Changed from total_conducted_sessions
  total_student_attendances: number;
  total_present_students: string;
  attendance_rate?: number;
};

export type AttendanceRateBySubject_ApiResponse_Type =
  AttendanceRateBySubject_ApiResponseObject_Type[];
