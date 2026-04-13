export type Create_Session_Payload_Type = {
  tutor_class_time: string; // ISO 8601 UTC date-time string
  conclusion_type: string; // Extend with more statuses if needed
  tutor_scaled_class_time: number; // Duration in minutes
  enrollment_id: number; // Unique identifier for the enrollment
  created_at: string; // ISO 8601 UTC date-time string
};

export type Create_Session_ApiResponse_Type = {
  id: number; // Unique identifier for the session
  class_schedule_id: number; // ID of the class schedule
  meeting_link: string; // URL for the meeting
  space_name: string; // Name of the virtual classroom
  duration: number; // Duration of the class in minutes
  meet_recording: boolean; // Indicates if the meeting was recorded
  tutor_class_time: string; // ISO 8601 UTC date-time string
  student_group_id: number; // ID of the student group
  tutor_id: number; // ID of the tutor
  conclusion_type: "Completed" | "Cancelled" | "Rescheduled"; // Possible statuses
  tutor_scaled_class_time: number; // Adjusted class duration
};
