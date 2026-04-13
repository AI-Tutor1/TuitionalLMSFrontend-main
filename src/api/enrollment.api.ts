import { BASE_URL } from "@/services/config";

export const getAllEnrollmentsApi = (options: any) => {
  console.log(options);
  const params = new URLSearchParams();

  if (options?.name) params.append("name", options?.name);
  if (options?.startDate) params.append("startDate", options?.startDate);
  if (options?.endDate) params.append("endDate", options?.endDate);
  if (options?.limit) params.append("limit", options?.limit);
  if (options?.page) params.append("page", options?.page);
  if (options?.subjectId) params.append("subjectId", options.subjectId);
  if (options?.curriculumId)
    params.append("curriculumId", options.curriculumId);
  if (options?.boardId) params.append("boardId", options.boardId);
  if (options?.gradeId) params.append("gradeId", options.gradeId);
  if (options?.teacher_id) params.append("teacher_id", options.teacher_id);
  if (options?.student_id) params.append("student_id", options.student_id);
  if (options.enrollment_id)
    params.append("enrollment_id", options.enrollment_id);
  if (options?.childrens) params.append("childrens", options.childrens);
  if (options?.on_break !== "") params.append("on_break", options.on_break);
  if (options?.is_permanent !== "")
    params.append("is_permanent", options.is_permanent);
  return `${BASE_URL}/api/enrollment/getAllEnrollment?${params.toString()}`;
};

export const getAllEnrollmentsDataApi = (options: any) => {
  const params = new URLSearchParams();
  if (options?.page) params.append("page", options?.page);
  if (options?.limit) params.append("limit", options?.limit);
  if (options?.startDate) params.append("startDate", options?.startDate);
  if (options?.endDate) params.append("endDate", options?.endDate);
  if (options.subjectId) params.append("subjectId", options.subjectId);
  if (options.curriculumId) params.append("curriculumId", options.curriculumId);
  if (options.boardId) params.append("boardId", options.boardId);
  if (options.gradeId) params.append("gradeId", options.gradeId);
  if (options.teacher_id) params.append("teacher_id", options.teacher_id);
  if (options.student_id) params.append("student_id", options.student_id);
  if (options.enrollment_id)
    params.append("enrollment_id", options.enrollment_id);
  if (options.childrens) params.append("childrens", options.childrens);
  if (options?.name) params.append("name", options?.name);
  console.log("params", params);
  return `${BASE_URL}/api/enrollment/getEnrollmentData?${params.toString()}`;
};

export const createEnrollmentApi = () => `${BASE_URL}/api/enrollment`;
export const deleteEnrollmentApi = (id: string) =>
  `${BASE_URL}/api/enrollment/${id}`;
export const changeEnrollmentBreakStatusOldApi = (id: string) =>
  `${BASE_URL}/api/enrollment/${id}/on-break`;
export const changeEnrollmentBreakStatusApi = (id: number | null) =>
  `${BASE_URL}/api/enrollment/${id}/break-new`;
export const enrollmentByGroupIdApi = (id: string) =>
  `${BASE_URL}/api/enrollment/getEnrollmentByIdGrouped/${id}`;
export const editEnrollmentByGroupIdApi = (id: string) =>
  `${BASE_URL}/api/enrollment/${id}`;

export const getAllEnrollmentLogsApi = (options: any) => {
  const params = new URLSearchParams();
  if (options?.page) params.append("page", options?.page);
  if (options?.limit) params.append("limit", options?.limit);
  if (options?.startDate) params.append("startDate", options?.startDate);
  if (options?.endDate) params.append("endDate", options?.endDate);
  if (options.subjectId) params.append("subjectId", options.subjectId);
  if (options.curriculumId) params.append("curriculumId", options.curriculumId);
  if (options.boardId) params.append("boardId", options.boardId);
  if (options.gradeId) params.append("gradeId", options.gradeId);
  if (options.teacher_id) params.append("teacher_id", options.teacher_id);
  if (options.student_id) params.append("student_id", options.student_id);
  if (options.enrollment_id)
    params.append("enrollment_id", options.enrollment_id);
  if (options?.name) params.append("name", options?.name);
  if (options?.on_break !== "") params.append("on_break", options.on_break);
  return `${BASE_URL}/api/enrollment/getAllEnrollmentLogs?${params.toString()}`;
};

export const getEnrollmentStatusLogApi = (id: string) =>
  `${BASE_URL}/api/enrollment/status-logs/${id}`;

export const exportEnrollmentLogsApi = (options: any) => {
  const params = new URLSearchParams();
  if (options?.startDate) params.append("startDate", options?.startDate);
  if (options?.endDate) params.append("endDate", options?.endDate);
  if (options.teacher_id) params.append("teacher_id", options.teacher_id);
  if (options.student_id) params.append("student_id", options.student_id);
  if (options.enrollment_id)
    params.append("enrollment_id", options.enrollment_id);
  if (options?.status) params.append("status", options?.status);
  return `${BASE_URL}/api/enrollment/exportEnrollmentLogs?${params.toString()}`;
};
