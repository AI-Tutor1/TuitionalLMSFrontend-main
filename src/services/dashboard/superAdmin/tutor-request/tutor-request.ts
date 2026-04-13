import { AxiosGet, AxiosPost } from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  TutorOnboarding_Response,
  Onboarding_Requests,
} from "./tutor-request.types";

import {
  generateInterviewLinkApi,
  approvedRequestApi,
  interviewsAlignedApi,
} from "@/api/tutors";

//urls
const tutorOnboardingRequestApi = (options: any) => {
  const params = new URLSearchParams();
  if (options?.startDate !== "") params.append("startDate", options?.startDate);
  if (options?.endDate !== "") params.append("endDate", options?.endDate);
  return `${BASE_URL}/api/getAllTutorOnbordingRequest?${params.toString()}`;
};
const singleTutorOnboardingRequestApi = (id: string) =>
  `${BASE_URL}/api/getATutorOnbordingRequestWithId/${id}`;

//api function
export const getAllRequest = (options: any, config: configDataType) =>
  AxiosGet<TutorOnboarding_Response>(
    tutorOnboardingRequestApi(options),
    config
  );

export const getSingleRequest = (id: string, config: configDataType) =>
  AxiosGet<Onboarding_Requests>(singleTutorOnboardingRequestApi(id), config);

export const generateInterviewLink = (
  id: number,
  config: configDataType,
  payload: {
    interviewDate: String;
  }
) =>
  AxiosPost<{ error: String; message: String }>(
    generateInterviewLinkApi(id),
    config,
    payload
  );

export const approvedRequest = (
  config: configDataType,
  payload: {
    jsonData: string;
    id: number;
  }
) => AxiosPost<any>(approvedRequestApi(), config, payload);

export const interviewsAligned = (
  params: {
    limit: number | null;
    offset: number | null;
    startDate?: string;
    endDate?: string;
  },
  config: configDataType
) => AxiosGet<any>(interviewsAlignedApi(params), config);
