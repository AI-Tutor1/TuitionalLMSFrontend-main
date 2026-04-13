// Interface for Tutor information
export type Tutor = {
  name: string;
  id: number;
  email: string;
  profileImageUrl: string;
  country_code: string;
};

// Interface for a single schedule item
export type ScheduleItem = {
  id: number;
  day_of_week: string;
  start_time: string;
  session_duration: number;
  status: boolean;
  slots: string;
  is_booked: boolean;
  tutor_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tutor: Tutor;
};

// Interface for the entire schedule object
export type Class_Schedule_Type = {
  [day: string]: ScheduleItem[];
};
