import {
  AxiosGet,
  AxiosPost,
  AxiosPut,
  AxiosDelete,
} from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";

import {
  getAllResourcesApi,
  addResourceApi,
  updateResourceApi,
  deleteResourceApi,
  addLikeToResourceApi,
  downloadResourceApi,
} from "@/api/resources";

import {
  ResourcesResponse,
  AddResourceResponse,
  AddResourcePayload,
  editResourcePayload,
} from "@/types/resources/resources.types";

export const getAllResources = (
  options: {
    limit: string;
    page: string;
    search?: string;
  },
  config: configDataType,
) => AxiosGet<ResourcesResponse>(getAllResourcesApi(options), config);

export const addResource = (
  payload: AddResourcePayload,
  config: configDataType,
) => AxiosPost<AddResourceResponse>(addResourceApi(), config, payload);

export const updateResource = (
  updateId: number | null,
  payload: editResourcePayload,
  config: configDataType,
) => AxiosPut<any>(updateResourceApi(updateId), config, payload);

export const deleteResource = (
  deleteId: number | null,
  config: configDataType,
) => AxiosDelete<any>(deleteResourceApi(deleteId), config);

export const addLikeToResource = (id: number, config: configDataType) =>
  AxiosPost<any>(addLikeToResourceApi(id), config);

export const downloadResource = (id: number, config: configDataType) =>
  AxiosPost<any>(downloadResourceApi(id), config);
