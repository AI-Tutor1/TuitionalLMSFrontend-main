import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";

import {
  createChurnReasonApi,
  createChurnQuestionApi,
  getAllChurnReasonsApi,
  getAllChurnQuestionsApi,
  deleteChurnReasonApi,
  deleteChurnQuestionApi,
  editChurnReasonApi,
  editChurnQuestionApi,
} from "@/api/churn-resources";

export const createNewChurnQuestion = (
  config: configDataType,
  payload: { question?: string }
) => AxiosPost<any>(createChurnQuestionApi(), config, payload);

export const getAllChurnQuestions = (config: configDataType) =>
  AxiosGet<any>(getAllChurnQuestionsApi(), config);

export const createNewChurnReason = (
  config: configDataType,
  payload: { reason?: string; category?: string }
) => AxiosPost<any>(createChurnReasonApi(), config, payload);

export const getAllChurnReasons = (config: configDataType) =>
  AxiosGet<any>(getAllChurnReasonsApi(), config);

export const editChurnReason = (
  id: number,
  config: configDataType,
  payload: {
    reason?: string;
    question?: string;
    category?: string;
  }
) => AxiosPut<any>(editChurnReasonApi(id), config, payload);

export const editChurnQuestion = (
  id: number,
  config: configDataType,
  payload: {
    reason?: string;
    question?: string;
    category?: string;
  }
) => AxiosPut<any>(editChurnQuestionApi(id), config, payload);

export const deleteChurnReason = (id: number, config: configDataType) =>
  AxiosDelete<any>(deleteChurnReasonApi(id), config);

export const deleteChurnQuestion = (id: number, config: configDataType) =>
  AxiosDelete<any>(deleteChurnQuestionApi(id), config);
