export type ExtendClassDuration_Payload_Type = {
  class_schedule_id: number;
  duration: number | null;
  isReschedual: boolean;
};

export type ExtendClassDuration_Api_Response_Type = {
  success: boolean; // Fixed: was "bollean"
  message: string; // Changed from literal to string type
  data: {
    id: number; // Changed from literal 8 to number type
    status: boolean; // Changed from literal true to boolean type
    enrollment_id: number; // Changed from literal 4 to number type
    duration: number; // Changed from literal 120 to number type
    teacher_schedule_id: number; // Changed from literal 9 to number type
    meetLink: string | null;
    meetSpace: string | null;
    isCancelled: boolean | null;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    deletedAt: string | null; // ISO date string or null
  };
};
