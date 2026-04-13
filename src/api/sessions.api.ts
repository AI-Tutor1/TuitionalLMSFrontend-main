import { BASE_URL } from "@/services/config";
import { GetAllSessionsWithGroupIds_Params_Type } from "@/types/sessions/getAllSessionsWithGroupIds.types";
import { GetSessions_ExcelData_Api_Options } from "@/types/sessions/getExcelSessionsData.types";
import {
  MonthlySessionDataForTutor_Api_Params_Type,
  MonthlySessionDataForStudent_Api_Params_Type,
  MonthlySessionDataForParent_Api_Params_Type,
} from "@/types/sessions/monthlySessionCount.types";
import { SessionHourlyCount_Api_Params_Type } from "@/types/sessions/sessionHourlyCount.types";
import { AttendanceRateBySubject_Api_Params_Type } from "@/types/sessions/attendanceRate.types";

export const getAllSessionWithGroupIdsApi_Post = (
  options: GetAllSessionsWithGroupIds_Params_Type,
) => {
  const params = new URLSearchParams();
  if (options?.limit) params.append("limit", options?.limit);
  if (options?.page) params.append("page", options?.page);
  return `${BASE_URL}/api/sessions/getAllSessionsWithGroupIds?${params.toString()}`;
};

export const getAllSessionWithGroupIdsApi = (
  options: GetAllSessionsWithGroupIds_Params_Type,
) => {
  const params = new URLSearchParams();
  if (options?.page) params.append("page", options?.page);
  if (options?.limit) params.append("limit", options?.limit);
  if (options?.student_ids)
    params.append("student_ids", options.student_ids.toString());
  if (options?.student_name)
    params.append("student_name", options.student_name);
  if (options?.start_time) params.append("start_time", options.start_time);
  if (options?.end_time) params.append("end_time", options.end_time);
  if (options?.grade_id) params.append("grade_id", options.grade_id);
  if (options?.board_id) params.append("board_id", options.board_id);
  if (options?.curriculum_id)
    params.append("curriculum_id", options.curriculum_id);
  if (options?.subject_id)
    params.append("subject_id", options.subject_id.toString());
  if (options?.tutor_id) params.append("tutor_id", options.tutor_id.toString());
  if (options?.enrollment_id)
    params.append("enrollment_id", options.enrollment_id.toString());
  if (options?.conclusion_type)
    params.append("conclusion_type", options.conclusion_type);
  if (options?.include_recording)
    params.append("include_recording", options.include_recording);
  if (options?.is_reviewed) params.append("is_reviewed", options.is_reviewed);
  if (options?.below_benchmark)
    params.append("below_benchmark", options.below_benchmark);
  return `${BASE_URL}/api/v1/sessions/getAllSessionsWithGroupIds?${params.toString()}`;
};

export const getAllSessionApi = (
  options: GetSessions_ExcelData_Api_Options,
) => {
  const params = new URLSearchParams();
  if (options?.pagelimit) params.append("limit", options?.pagelimit.toString());
  if (options?.page) params.append("page", options?.page.toString());
  if (options?.enrollment_id)
    params.append("enrollment_id", options.enrollment_id.toString());
  if (options?.tutor_id) params.append("tutor_id", options.tutor_id.toString());
  if (options?.subject_id)
    params.append("subject_id", options.subject_id.toString());
  if (options?.student_ids)
    params.append("student_id", options.student_ids.toString());
  if (options?.curriculum_id)
    params.append("curriculum_id", options.curriculum_id.toString());
  if (options?.grade_id) params.append("grade_id", options.grade_id.toString());
  if (options?.board_id) params.append("board_id", options.board_id.toString());
  if (options?.conclusion_type)
    params.append("conclusion_type", options.conclusion_type);
  if (options?.start_time) params.append("start_time", options.start_time);
  if (options?.end_time) params.append("end_time", options.end_time);

  return `${BASE_URL}/api/sessions?${params.toString()}`;
};

//urls
export const getSessionByIdApi = (id: string) =>
  `${BASE_URL}/api/sessions/${id}`;

export const getSessionsExcelDataApi = (
  options: GetSessions_ExcelData_Api_Options,
) => {
  const params = new URLSearchParams();
  if (options?.enrollment_id)
    params.append("enrollment_id", options.enrollment_id.toString());
  if (options?.tutor_id) params.append("tutor_id", options.tutor_id.toString());
  if (options?.subject_id)
    params.append("subject_id", options.subject_id.toString());
  if (options?.student_ids)
    params.append("student_id", options.student_ids.toString());
  if (options?.curriculum_id)
    params.append("curriculum_id", options.curriculum_id.toString());
  if (options?.grade_id) params.append("grade_id", options.grade_id.toString());
  if (options?.board_id) params.append("board_id", options.board_id.toString());
  if (options?.conclusion_type)
    params.append("conclusion_type", options.conclusion_type);
  if (options?.start_time) params.append("start_time", options.start_time);
  if (options?.end_time) params.append("end_time", options.end_time);
  return `${BASE_URL}/api/sessions/getSessionData?${params.toString()}`;
};
export const createSessionApi = () => `${BASE_URL}/api/sessions`;
export const updateSessionApi = (id: string) =>
  `${BASE_URL}/api/sessions/${id}`;
export const deleteSessionApi = (id: string) =>
  `${BASE_URL}/api/sessions/${id}`;
export const recreateSessionApi = (id: string): string =>
  `${BASE_URL}/api/sessions/recreate/${id}`;
export const monthlySessionDataForTutuorApi = (options: {
  tutor_id: string;
  month: string;
}): string => `${BASE_URL}/api/sessions/${options?.tutor_id}/${options?.month}`;
export const monthlySessionCountForTutorApi = (
  options: MonthlySessionDataForTutor_Api_Params_Type,
): string => {
  if (options.tutor_id) {
    return `${BASE_URL}/api/sessions/monthly-session-count/${options.tutor_id}`;
  } else {
    throw new Error("Either tutor_id or student_id must be provided");
  }
};
export const monthlySessionCountForStudentApi = (
  options: MonthlySessionDataForStudent_Api_Params_Type,
): string => {
  if (options.student_id) {
    return `${BASE_URL}/api/sessions/monthly-session-count-student/${options.student_id}`;
  } else {
    throw new Error("Either tutor_id or student_id must be provided");
  }
};
export const monthlySessionCountForParentApi = (
  options: MonthlySessionDataForParent_Api_Params_Type,
): string => {
  if (options.childrens) {
    return `${BASE_URL}/api/sessions/monthly-session-count-student/${options.student_id}?childrens=${options.childrens}`;
  } else {
    throw new Error("Either tutor_id or student_id must be provided");
  }
};

export const sessionSummaryForTutuorApi = (options: {
  tutor_id?: string;
}): string => {
  if (options.tutor_id) {
    return `${BASE_URL}/api/sessions/summary/${options?.tutor_id}`;
  } else {
    throw new Error("tutor_id must be provided");
  }
};

export const updateTeacherDurationApi = (session_id: number | null) =>
  `${BASE_URL}/api/sessions/${session_id}/tutor-time`;

export const getSessionsGroupedByDateApi = (
  options: GetAllSessionsWithGroupIds_Params_Type,
) => {
  const params = new URLSearchParams();
  if (options?.page) params.append("page", options?.page);
  if (options?.limit) params.append("limit", options?.limit);
  if (options?.student_ids)
    params.append("student_ids", options.student_ids.toString());
  if (options?.student_name)
    params.append("student_name", options.student_name);
  if (options?.start_time) params.append("start_time", options.start_time);
  if (options?.end_time) params.append("end_time", options.end_time);
  if (options?.grade_id) params.append("grade_id", options.grade_id);
  if (options?.board_id) params.append("board_id", options.board_id);
  if (options?.curriculum_id)
    params.append("curriculum_id", options.curriculum_id);
  if (options?.subject_id)
    params.append("subject_id", options.subject_id.toString());
  if (options?.tutor_id) params.append("tutor_id", options.tutor_id.toString());
  if (options?.enrollment_id)
    params.append("enrollment_id", options.enrollment_id.toString());
  if (options?.include_recording)
    params.append("include_recording", options.include_recording.toString());
  return `${BASE_URL}/api/sessions/grouped-by-date?${params.toString()}`;
};

export const getSessionCountsByHourApi = (
  options: SessionHourlyCount_Api_Params_Type,
) => {
  const params = new URLSearchParams();
  if (options?.date) params.append("date", options.date);
  if (options?.startDate) params.append("startDate", options.startDate);
  if (options?.endDate) params.append("endDate", options.endDate);
  return `${BASE_URL}/api/sessions/hourly-count?${params.toString()}`;
};

export const getAttendanceRateBySubjectApi = (
  options: AttendanceRateBySubject_Api_Params_Type,
) => {
  const params = new URLSearchParams();
  if (options?.start_date) params.append("start_date", options.start_date);
  if (options?.end_date) params.append("end_date", options.end_date);
  if (options?.subject_id) {
    if (Array.isArray(options.subject_id)) {
      options.subject_id.forEach((id) =>
        params.append("subject_id", id.toString()),
      );
    } else {
      params.append("subject_id", options.subject_id.toString());
    }
  }
  return `${BASE_URL}/api/sessions/attendance-rate-by-subject?${params.toString()}`;
};

export const updateSessionReviewStatusApi = (sessionId: string) =>
  `${BASE_URL}/api/sessions/${sessionId}/review-status`;

export const updateSessionPaymentStatusApi = () =>
  `${BASE_URL}/api/session-payment-status`;
