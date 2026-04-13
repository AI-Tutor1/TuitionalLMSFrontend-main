export type getSessionConclusion_Api_Params_Type = {
  tutor_id?: string;
  enrollment_id?: string;
  subject_id?: string;
  user_id?: string;
  start_time?: string;
  end_time?: string;
  grade_id?: string;
  curriculum_id?: string;
  board_id?: string;
  student_name?: string;
  student_ids?: string;
};

export type Sessions_Conclusion_ApiResponse_Type = {
  Conducted: number;
  Cancelled: number;
  "Teacher Absent": number;
  "Student Absent": number;
  "No Show": number;
  totalConductedHours: number;
  totalConductedDuration: number;
};

export type Invoices_Counts_Analytics_Params_Type = {
  startMonth: number | null;
  endMonth: number | null;
  year: number;
};

export type Invoices_Counts_Analytics_ApiResponse_Type = {
  counts: {
    pending: number;
    overdue: number;
    paid: number;
  };
  monthly: {
    month: string;
    month_number: number;
    paid_total: number;
    pending_total: number;
    overdue_total: number;
  }[];
};

export interface StudentRetentionData {
  retentionRateCurrentMonth: string;
  retentionRatePreviousMonth: string;
  percentageDifference: string;
}

export interface ActiveUsersData {
  today: number;
  yesterday: number;
  percentageChange: string;
}

export interface EnrollmentsData {
  currentMonth: number;
  previousMonth: number;
  percentageChange: string;
}

export interface SessionAvgData {
  currentMonthAverage: number;
  previousMonthAverage: number;
  percentageDifference: string;
}

export interface ChurnRateData {
  churnRateCurrentMonth: string;
  churnRatePreviousMonth: string;
  percentageDifference: string;
}

export interface ComparisonData {
  studentRetention: StudentRetentionData;
  activeStudents: ActiveUsersData;
  activeTeachers: ActiveUsersData;
  enrollments: EnrollmentsData;
  sessionAvg: SessionAvgData;
  churnRate: ChurnRateData;
}

export interface ComparisonResult {
  result: ComparisonData;
  message: string;
  status: string;
}

export type DashboardAnalytics_Api_Params_Type = {
  userId?: number;
  role?: "teacher" | "student" | "parent";
  childrens?: string;
};

export type DashboardAnalytics_ApiResponse_Type = {
  enrollmentsCount: number;
  totalClassTime: number;
  totalUpcomingClasses: number;
  totalClassAttended?: number;
};

export type StudentsByCurriculum_Api_Response_Type = {
  curriculum_id: number;
  name: string;
  studentCount: number;
  "curriculum.name": string;
}[];

export type StudentsByGrade_Api_Response_Type = {
  grade_id: number;
  name: string;
  studentCount: number;
  "grade.name": string;
}[];

export type EnrollmentChurnStats_ApiResponse_Type = {
  month: string;
  numberOfEnrollmentsCreated: number;
  numberOfChurnCreated: number;
}[];
