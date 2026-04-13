import { BASE_URL } from "@/services/config";

export const getAllSessionSFeedbacksApi = (queryParams: {
  page?: number;
  limit?: number;
  sessionId?: string;
  userId?: string;
}) => {
  const params = [];
  if (queryParams?.page) params.push(`page=${queryParams.page}`);
  if (queryParams?.limit) params.push(`limit=${queryParams.limit}`);
  if (queryParams?.sessionId) params.push(`sessionId=${queryParams.sessionId}`);
  if (queryParams?.userId) params.push(`userId=${queryParams.userId}`);
  const queryString = params.join("&");
  return `${BASE_URL}/api/session-feedback?${queryString}`;
};
export const createSessionFeedbackApi = () => {
  return `${BASE_URL}/api/session-feedback`;
};
export const updateSessionFeedbackApi = (feedbackId: number) => {
  return `${BASE_URL}/api/session-feedback/${feedbackId}`;
};
export const deleteSessionFeedbackApi = (feedbackId: number) => {
  return `${BASE_URL}/api/session-feedback/${feedbackId}`;
};
export const getSpecificSessionFeedbacksApi = (sessionId: number) => {
  return `${BASE_URL}/api/session-feedback/session/${sessionId}`;
};

export const getAllSessionsForRemainingFeedbackApi = (userId: number) => {
  return `${BASE_URL}/api/session-feedback/without-feedback/${userId}`;
};

export const getFeedbackAnalyticsForTeacherApi = (queryParams: {
  teacherId: number | null;
  startDate: string;
  endDate: string;
}) => {
  const params = new URLSearchParams();
  if (queryParams?.startDate) params.append("startDate", queryParams.startDate);
  if (queryParams?.endDate) params.append("endDate", queryParams.endDate);
  return `${BASE_URL}/api/session-feedback/analytics/${queryParams.teacherId}?${params.toString()}`;
};

export const getAverageRatingByMonthForTeacherApi = (queryParams: {
  teacherId: number | null;
  startDate: string;
  endDate: string;
}) => {
  const params = new URLSearchParams();
  if (queryParams?.startDate) params.append("startDate", queryParams.startDate);
  if (queryParams?.endDate) params.append("endDate", queryParams.endDate);
  return `${BASE_URL}/api/session-feedback/average-by-month/${queryParams.teacherId}?${params.toString()}`;
};

export const getAverageRatingByEnrollmentForTeacherApi = (queryParams: {
  teacherId: number | null;
  startDate: string;
  endDate: string;
}) => {
  const params = new URLSearchParams();
  if (queryParams?.startDate) params.append("startDate", queryParams.startDate);
  if (queryParams?.endDate) params.append("endDate", queryParams.endDate);
  return `${BASE_URL}/api/session-feedback/average-by-enrollment/${queryParams.teacherId}?${params.toString()}`;
};

export const getAverageRatingBySubjectForTeacherApi = (queryParams: {
  teacherId: number | null;
  startDate: string;
  endDate: string;
}) => {
  const params = new URLSearchParams();
  if (queryParams?.startDate) params.append("startDate", queryParams.startDate);
  if (queryParams?.endDate) params.append("endDate", queryParams.endDate);
  return `${BASE_URL}/api/session-feedback/average-by-subject/${queryParams.teacherId}?${params.toString()}`;
};

export const getSessionWiseRatingForTeacherApi = (queryParams: {
  teacherId: number | null;
  startDate: string;
  endDate: string;
}) => {
  const params = new URLSearchParams();
  if (queryParams?.startDate) params.append("startDate", queryParams.startDate);
  if (queryParams?.endDate) params.append("endDate", queryParams.endDate);
  return `${BASE_URL}/api/session-feedback/session-wise-rating/${queryParams.teacherId}?${params.toString()}`;
};
