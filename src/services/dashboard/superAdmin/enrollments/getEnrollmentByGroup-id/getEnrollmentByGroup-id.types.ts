// create classSchedule payload type
export type Create_TeacherSchedule_Payload = {
  day_of_week: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  start_time: string;
  session_duration: number;
  slots: string;
  tutor_id: number;
  enrollment_id: number;
};

export type Create_TeacherSchedule_ApiResponse_Type = {
  id: number;
  dayOfWeek: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string; // ISO 8601 format or "HH:mm"
  sessionDuration: number; // in minutes
  status: boolean;
  slots: "morning" | "afternoon" | "evening" | "night";
  isBooked: boolean;
  tutorId: number;
  updatedAt: string; // ISO 8601 format
  createdAt: string; // ISO 8601 format
};

export type ConfirmClassSchedule_Payload = {
  teacherScheduleId: number;
  enrollmentId: number;
};

export type ConfirmClassSchedule__ApiResponse_Type = {
  meetLink: string | null;
  meetSpace: string | null;
  isCancelled: boolean | null;
  id: number;
  status: boolean;
  teacherScheduleId: number;
  enrollmentId: number;
  updatedAt: string; // ISO 8601 format
  createdAt: string; // ISO 8601 format
};

export type RescheduleRequest_Payload_Type =
  | {
      userId?: number;
      enrollment_id?: number;
      tutor_ids?: number[];
      student_ids?: number[];
    }
  | {};

export type DeleteClassSchedule_Payload_Type = {
  ids: number[];
};
