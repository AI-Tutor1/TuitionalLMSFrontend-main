export type Tutor = {
  name: string;
  id: number;
  email: string;
  profileImageUrl: string;
  country_code: string | null;
};

export type Student = {
  name: string;
  id: number;
  email: string;
  profileImageUrl: string;
  country_code: string | null;
};

export type Enrollment = {
  id: number;
  status: number;
  on_break: number;
  hourly_rate: number;
  tutor_hourly_rate: number;
  group_id: string;
  tutor_id: number;
  tutor: Tutor;
  students: Student[];
};

export type TeacherSchedule = {
  id: number;
  day_of_week: string;
  start_time: string;
  session_duration: number;
  status: boolean;
  slots: string;
  is_booked: boolean;
};

export type DataItem = {
  id: number;
  status: boolean;
  enrollment: Enrollment;
  teacherSchedule: TeacherSchedule;
};

export type ClassSchedule_Day_Of_Week = DataItem[];
