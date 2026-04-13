import { AxiosGet, AxiosPut, AxiosPost } from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  Teacher_Data,
  GetAllTeacher_Api_Response,
  GetAllTeachers_Api_Payload_Type,
} from "./teacher.types";

// URLs
const getAllTeachersApi = (options: any) => {
  const params = new URLSearchParams();

  // Using properties from GetAllSessionsOptions interface
  if (options?.limit) params.append("limit", options?.limit.toString());
  if (options?.page) params.append("page", options?.page.toString());
  if (options?.startDate !== "") params.append("startDate", options?.startDate);
  if (options?.endDate !== "") params.append("endDate", options?.endDate);
  if (options?.userType)
    params.append("userType", options?.userType.toString());
  if (options?.name && options?.name !== "")
    params.append("name", options?.name);
  if (options?.countryCode && options?.countryCode !== "")
    params.append("countryCode", options?.countryCode);
  if (options?.email && options?.email !== "")
    params.append("email", options?.email);

  return `${BASE_URL}/api/user/getAllUsers?${params.toString()}`;
};

///api function
export const getAllTeachers = (
  options: GetAllTeachers_Api_Payload_Type,
  config: configDataType
) => AxiosGet<GetAllTeacher_Api_Response>(getAllTeachersApi(options), config);
