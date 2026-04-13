import { BASE_URL } from "@/services/config";

export const createChurnQuestionApi = () => `${BASE_URL}/churn-questions`;
export const getAllChurnQuestionsApi = () => `${BASE_URL}/churn-questions`;
export const createChurnReasonApi = () => `${BASE_URL}/churn-reasons`;
export const getAllChurnReasonsApi = () => `${BASE_URL}/churn-reasons`;
export const editChurnReasonApi = (id: number) =>
  `${BASE_URL}/churn-reasons/${id}`;
export const editChurnQuestionApi = (id: number) =>
  `${BASE_URL}/churn-questions/${id}`;
export const deleteChurnReasonApi = (id: number) =>
  `${BASE_URL}/churn-reasons/${id}`;
export const deleteChurnQuestionApi = (id: number) =>
  `${BASE_URL}/churn-questions/${id}`;
