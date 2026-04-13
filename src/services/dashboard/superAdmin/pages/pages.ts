import {
  AxiosPost,
  AxiosGet,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { GetAllPages_Api_Response_Type } from "@/types/pages/getAllPages.types";
import {
  CreatePage_Api_Response,
  CreatePage_Api_Payload,
} from "@/types/pages/createPage.types";
import { configDataType } from "@/services/config";
import {
  getPagesApi,
  createPageApi,
  updatePageApi,
  deletePageApi,
} from "@/api/pages";

export const getAllPages = (config: configDataType) =>
  AxiosGet<GetAllPages_Api_Response_Type>(getPagesApi(), config);

export const createPage = (
  payload: CreatePage_Api_Payload,
  config: configDataType
) => AxiosPost<CreatePage_Api_Response>(createPageApi(), config, payload);

export const updatePage = (
  updateId: string,
  payload: CreatePage_Api_Payload,
  config: configDataType
) =>
  AxiosPut<CreatePage_Api_Response>(updatePageApi(updateId), config, payload);

export const deletePage = (deleteId: string, config: configDataType) =>
  AxiosDelete<CreatePage_Api_Response>(deletePageApi(deleteId), config);
