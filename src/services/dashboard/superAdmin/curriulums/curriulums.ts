import {
  AxiosGet,
  AxiosDelete,
  AxiosPost,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  ResourceGetAll_ApiResponse_Type,
  ResourceDelte_ApiResponse_Type,
  ResourceAdd_ApiResponse_Type,
  ResourceUpdate_ApiResponse_Type,
} from "./curriulums.type";

//urls
import { curriculumApi } from "@/api/curriculum";
/// get all
export const getAllCurriculums = (config: configDataType) =>
  AxiosGet<ResourceGetAll_ApiResponse_Type>(curriculumApi(), config);

// subject_crud
export const deleteSubject = (payload: string, config: configDataType) =>
  AxiosDelete<ResourceDelte_ApiResponse_Type>(payload, config);

export const addField = (
  payload: { name: string },
  url: string,
  config: configDataType
) => AxiosPost<ResourceAdd_ApiResponse_Type>(url, config, payload);

export const updateField = (
  payload: { name: string; status: string },
  url: string,
  config: configDataType
) => AxiosPut<ResourceUpdate_ApiResponse_Type>(url, config, payload);
