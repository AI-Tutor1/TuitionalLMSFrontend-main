import {
  AxiosGet,
  AxiosPost,
  AxiosPut,
  AxiosDelete,
} from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import { getAllRoles_Api_Response_Type } from "@/types/roles/getAllRoles.type";
import {
  CreateRole_Api_Payload_Type,
  CreateRole_Api_Response_Type,
} from "@/types/roles/createRole.type";
import { UpdateRole_Api_Response_Type } from "@/types/roles/updateRole.type";
import {
  getAllRolesApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  assignPagesToRoleApi,
  getAllPagesAssignedToRoleApi,
} from "@/api/role.api";
import { AssignPagesToRole_Api_Response } from "@/types/roles/assignPagesToRole.types";
import { GetAllPages_Api_Response_Type } from "@/types/pages/getAllPages.types";

///api function
export const getAllRoles = (config: configDataType) =>
  AxiosGet<getAllRoles_Api_Response_Type>(getAllRolesApi(), config);
export const createRole = (
  data: CreateRole_Api_Payload_Type,
  config: configDataType
) => AxiosPost<CreateRole_Api_Response_Type>(createRoleApi(), config, data);
export const updateRole = (
  updateId: string,
  data: CreateRole_Api_Payload_Type,
  config: configDataType
) =>
  AxiosPut<UpdateRole_Api_Response_Type>(updateRoleApi(updateId), config, data);
export const deleteRole = (deleteId: string, config: configDataType) =>
  AxiosDelete<CreateRole_Api_Response_Type>(deleteRoleApi(deleteId), config);

export const assignPagesToRole = (
  roleId: number | null,
  config: configDataType,
  payload: {
    pageIds: number[];
  }
) =>
  AxiosPost<AssignPagesToRole_Api_Response>(
    assignPagesToRoleApi(roleId),
    config,
    payload
  );
export const getAllPagesAssignedToRole = (
  roleId: number | null,
  config: configDataType
) =>
  AxiosGet<GetAllPages_Api_Response_Type>(
    getAllPagesAssignedToRoleApi(roleId),
    config
  );
