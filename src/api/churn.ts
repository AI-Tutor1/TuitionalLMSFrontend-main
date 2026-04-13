import { BASE_URL } from "@/services/config";

export const createChurnApi = () => `${BASE_URL}/churn`;
export const getAllChurnApi = (options: any) => {
  const params = new URLSearchParams();
  if (options?.studentName) params.append("studentName", options?.studentName);
  if (options?.tutorName) params.append("tutorName", options?.tutorName);
  if (options?.subjectId) params.append("subjectId", options?.subjectId);
  if (options?.curriculumId)
    params.append("curriculumId", options?.curriculumId);
  if (options?.boardId) params.append("boardId", options?.boardId);
  if (options?.gradeId) params.append("gradeId", options.gradeId);
  if (options?.teacher_id) params.append("teacher_id", options.teacher_id);
  if (options?.student_id) params.append("student_id", options.student_id);
  if (options.enrollment_id)
    params.append("enrollment_id", options.enrollment_id);
  if (options?.page) params.append("page", options.page);
  if (options?.limit) params.append("limit", options.limit);
  if (options?.reason_ids) params.append("reason_ids", options.reason_ids);
  return `${BASE_URL}/churn?${params.toString()}`;
};
export const getChurnByIdApi = (id: number) => `${BASE_URL}/churn/${id}`;
export const deleteChurnApi = (id: number) => `${BASE_URL}/churn/${id}`;
export const churnFeedbackApi = () => `${BASE_URL}/churn-feedback`;
export const updateChurnFeedbackApi = (id: number) =>
  `${BASE_URL}/churn-feedback/${id}`;
export const deleteChurnFeedbackApi = (id: number) =>
  `${BASE_URL}/churn-feedback/${id}`;
