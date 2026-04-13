import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  Invoices_Counts_Analytics_ApiResponse_Type,
  Invoices_Counts_Analytics_Params_Type,
  getSessionConclusion_Api_Params_Type,
  Sessions_Conclusion_ApiResponse_Type,
  ComparisonResult,
  DashboardAnalytics_Api_Params_Type,
  DashboardAnalytics_ApiResponse_Type,
  StudentsByCurriculum_Api_Response_Type,
  StudentsByGrade_Api_Response_Type,
  EnrollmentChurnStats_ApiResponse_Type,
} from "@/types/analytics/analytics.types";
import {
  dashboardAnalytics_Api,
  dataAnalyticsCountByCountry,
  studentsByCurriculumApi,
  studentsByGradeApi,
  enrollmentChurnStatsApi,
} from "@/api/analytics";

//urls
const getSessionsMonthlyTagCountApi = (
  options: getSessionConclusion_Api_Params_Type,
) => {
  const params = [];
  if (options?.tutor_id) params.push(`tutor_id=${options.tutor_id}`);
  if (options?.enrollment_id)
    params.push(`enrollment_id=${options.enrollment_id}`);
  if (options?.subject_id) params.push(`subject_id=${options.subject_id}`);
  if (options?.user_id) params.push(`user_id=${options.user_id}`);
  if (options?.start_time) params.push(`start_time=${options.start_time}`);
  if (options?.end_time) params.push(`end_time=${options.end_time}`);
  if (options?.grade_id) params.push(`grade_id=${options.grade_id}`);
  if (options?.curriculum_id)
    params.push(`curriculum_id=${options.curriculum_id}`);
  if (options?.board_id) params.push(`board_id=${options.board_id}`);
  if (options?.student_name)
    params.push(`student_name=${options.student_name}`);
  if (options?.student_ids) params.push(`student_ids=${options.student_ids}`);
  const queryString = params.join("&");
  return `${BASE_URL}/api/sessions/monthly-tag-count?${queryString}`;
};

const getInvoicesCountsAnalytics_ApiUrl = (
  options: Invoices_Counts_Analytics_Params_Type,
) => {
  const params = new URLSearchParams();
  if (options.year) params.append("year", options.year.toString());
  if (options.startMonth)
    params.append("startMonth", options.startMonth.toString());
  if (options?.endMonth) params.append("endMonth", options.endMonth.toString());

  return `${BASE_URL}/api/analytics/invoices/counts?${params.toString()}`;
};

export const getComparisionAnalytics_ApiUrl = () =>
  `${BASE_URL}/api/analytics/getComparisonData`;
///api functions

export const getSessionsMonthlyTagCount = (
  options: getSessionConclusion_Api_Params_Type,
  config: configDataType,
) =>
  AxiosGet<Sessions_Conclusion_ApiResponse_Type>(
    getSessionsMonthlyTagCountApi(options),
    config,
  );

export const getInvoicesCountsAnalytics = (
  options: Invoices_Counts_Analytics_Params_Type,
  config: configDataType,
) =>
  AxiosGet<Invoices_Counts_Analytics_ApiResponse_Type>(
    getInvoicesCountsAnalytics_ApiUrl(options),
    config,
  );
export const getDashboardAnalytics = (
  options: DashboardAnalytics_Api_Params_Type,
  config: configDataType,
) =>
  AxiosGet<DashboardAnalytics_ApiResponse_Type>(
    dashboardAnalytics_Api(options),
    config,
  );

export const getComparisionAnalytics = (config: configDataType) =>
  AxiosGet<ComparisonResult>(getComparisionAnalytics_ApiUrl(), config);

export const dataAnalyticsCountByCountryApi = (config: configDataType) =>
  AxiosGet<any>(dataAnalyticsCountByCountry(), config);

export const studentsByCurriculum = (config: configDataType) =>
  AxiosGet<StudentsByCurriculum_Api_Response_Type>(
    studentsByCurriculumApi(),
    config,
  );

export const studentsByGrade = (config: configDataType) =>
  AxiosGet<StudentsByGrade_Api_Response_Type>(studentsByGradeApi(), config);

export const getEnrollmentChurnStats = (year: number, config: configDataType) =>
  AxiosGet<EnrollmentChurnStats_ApiResponse_Type>(
    enrollmentChurnStatsApi(year),
    config,
  );
