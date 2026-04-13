import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  getAllChurnApi,
  getChurnByIdApi,
  createChurnApi,
  deleteChurnApi,
  churnFeedbackApi,
  updateChurnFeedbackApi,
  deleteChurnFeedbackApi,
} from "@/api/churn";
import {
  ChurnApi_Payload_Type,
  ChurnData_Response_Type,
} from "@/types/churn/churn";

//urls
export const getAllChurn = (payload: any, config: configDataType) =>
  AxiosGet<ChurnData_Response_Type>(getAllChurnApi(payload), config);

export const deleteChurn = (id: number, config: configDataType) =>
  AxiosDelete<ChurnData_Response_Type>(deleteChurnApi(id), config);

export const createChurnFeedback = (
  payload: {
    user_id: number;
    churn_id: number | null;
    reason_ids: number[];
    answers: {
      question_id: number;
      answer_text: string;
    }[];
    additional_notes?: string;
  },
  config: configDataType
) => AxiosPost<ChurnData_Response_Type>(churnFeedbackApi(), config, payload);

export const updateChurnFeedback = (
  feedbackId: number,
  payload: {
    user_id: number;
    churn_id: number | null;
    reason_ids: number[];
    answers: {
      question_id: number;
      answer_text: string;
    }[];
    additional_notes?: string;
  },
  config: configDataType
) =>
  AxiosPut<ChurnData_Response_Type>(
    updateChurnFeedbackApi(feedbackId),
    config,
    payload
  );

export const deleteChurnFeedback = (
  feedbackId: number,
  config: configDataType
) =>
  AxiosDelete<ChurnData_Response_Type>(
    deleteChurnFeedbackApi(feedbackId),
    config
  );

export const getChurnById = (curnId: number, config: configDataType) =>
  AxiosGet<any>(getChurnByIdApi(curnId), config);
