import { BASE_URL } from "@/services/config";

export const createTicketApi = () => `${BASE_URL}/tickets`;
export const getAllTicketsApi = (params: any) => {
  const searchParams = new URLSearchParams();

  if (params.subjectId)
    searchParams.append("subjectId", params.subjectId.toString());
  if (params.curriculumId)
    searchParams.append("curriculumId", params.curriculumId);
  if (params.boardId) searchParams.append("boardId", params.boardId);
  if (params.gradeId) searchParams.append("gradeId", params.gradeId);
  if (params.startDate) searchParams.append("startDate", params.startDate);
  if (params.endDate) searchParams.append("endDate", params.endDate);
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.enrollment_ids)
    searchParams.append("enrollment_ids", params.enrollment_ids);
  if (params.priority) searchParams.append("priority", params.priority);
  if (params.generatedByRoleIds)
    searchParams.append("generatedByRoleIds", params.generatedByRoleIds);
  if (params.student_ids)
    searchParams.append("student_ids", params.student_ids);
  if (params.teacher_ids)
    searchParams.append("teacher_ids", params.teacher_ids);
  if (params.on_break !== undefined)
    searchParams.append("on_break", params.on_break.toString());
  return `${BASE_URL}/tickets?${searchParams.toString()}`;
};

export const deleteTicketApi = (id: number | null) =>
  `${BASE_URL}/tickets/${id}`;
