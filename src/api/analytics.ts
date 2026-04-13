import { BASE_URL } from "@/services/config";

export const dashboardAnalytics_Api = (options: {
  userId?: number;
  role?: "teacher" | "student" | "parent";
  childrens?: string;
}): string => {
  if (options.userId) {
    return `${BASE_URL}/api/analytics/dashboard?userId=${options.userId}&role=${options.role}&childrens=${options.childrens}`;
  } else {
    throw new Error("userId must be provided");
  }
};
export const dataAnalyticsCountByCountry = () =>
  `${BASE_URL}/api/analytics/count-by-country`;

export const studentsByCurriculumApi = () =>
  `${BASE_URL}/api/analytics/students-by-curriculum`;
export const studentsByGradeApi = () =>
  `${BASE_URL}/api/analytics/students-by-grade`;

export const enrollmentChurnStatsApi = (year: number) =>
  `${BASE_URL}/api/analytics/enrollment-churn-stats?year=${year}`;
