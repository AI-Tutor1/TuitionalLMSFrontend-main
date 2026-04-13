import {
  AxiosGet,
  AxiosDelete,
  AxiosPost,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import { SessionFeedbacksResponse } from "@/types/session-feedbacks/session-feedbacks.type";

import {
  createSessionFeedbackApi,
  getAllSessionSFeedbacksApi,
  getSpecificSessionFeedbacksApi,
  updateSessionFeedbackApi,
  deleteSessionFeedbackApi,
  getAllSessionsForRemainingFeedbackApi,
  getFeedbackAnalyticsForTeacherApi,
  getAverageRatingByMonthForTeacherApi,
  getAverageRatingByEnrollmentForTeacherApi,
  getAverageRatingBySubjectForTeacherApi,
  getSessionWiseRatingForTeacherApi,
} from "@/api/session-feedback";

export const createSessionFeedback = (payload: any, config: configDataType) =>
  AxiosPost<any>(createSessionFeedbackApi(), config, payload);

export const getAllSessionsFeedbacks = (
  queryParams: {
    page?: number;
    limit?: number;
    sessionId?: string;
    userId?: string;
  },
  config: configDataType,
) =>
  AxiosGet<SessionFeedbacksResponse>(
    getAllSessionSFeedbacksApi(queryParams),
    config,
  );

export const getSpecificSessionFeedbacks = (
  sessionId: number,
  config: configDataType,
) => AxiosGet<any>(getSpecificSessionFeedbacksApi(sessionId), config);

export const updateSessionFeedback = (
  feedbackId: number,
  payload: any,
  config: configDataType,
) => AxiosPut<any>(updateSessionFeedbackApi(feedbackId), config, payload);

export const deleteSessionFeedback = (
  feedbackId: number,
  config: configDataType,
) => AxiosDelete<any>(deleteSessionFeedbackApi(feedbackId), config);

export const getAllSessionsForRemainingFeedback = (
  userId: number,
  config: configDataType,
) => AxiosGet<any>(getAllSessionsForRemainingFeedbackApi(userId), config);

export const getFeedbackAnalyticsForTeacher = (
  queryParams: {
    teacherId: number | null;
    startDate: string;
    endDate: string;
  },
  config: configDataType,
) => AxiosGet<any>(getFeedbackAnalyticsForTeacherApi(queryParams), config);

export const getAverageRatingByMonthForTeacher = (
  queryParams: {
    teacherId: number | null;
    startDate: string;
    endDate: string;
  },
  config: configDataType,
) => AxiosGet<any>(getAverageRatingByMonthForTeacherApi(queryParams), config);

export const getAverageRatingByEnrollmentForTeacher = (
  queryParams: {
    teacherId: number | null;
    startDate: string;
    endDate: string;
  },
  config: configDataType,
) =>
  AxiosGet<any>(getAverageRatingByEnrollmentForTeacherApi(queryParams), config);

export const getAverageRatingBySubjectForTeacher = (
  queryParams: {
    teacherId: number | null;
    startDate: string;
    endDate: string;
  },
  config: configDataType,
) => AxiosGet<any>(getAverageRatingBySubjectForTeacherApi(queryParams), config);

export const getSessionWiseRatingForTeacher = (
  queryParams: {
    teacherId: number | null;
    startDate: string;
    endDate: string;
  },
  config: configDataType,
) => AxiosGet<any>(getSessionWiseRatingForTeacherApi(queryParams), config);
