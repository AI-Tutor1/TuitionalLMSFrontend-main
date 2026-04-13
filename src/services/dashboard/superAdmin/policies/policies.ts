import {
  AxiosGet,
  AxiosPost,
  AxiosPatch,
  AxiosDelete,
} from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import {
  GetAllPolicies_Api_Response,
  GetAllPolicies_Api_Filters,
} from "@/types/policies/getAllPolicies.type";
import {
  CreateNewPolicy_Api_Payload,
  CreateNewPolicy_Api_Response,
} from "@/types/policies/createNewPolicy.type";
import { DeletePolicy_Api_Response } from "@/types/policies/deletePolicy.type";
import {
  getAllPoliciesApi,
  deletePolicyApi,
  createNewPolicyApi,
  updatePolicyApi,
} from "@/api/policies";

export const createNewPolicy = (
  data: CreateNewPolicy_Api_Payload,
  config: configDataType
) =>
  AxiosPost<CreateNewPolicy_Api_Response>(createNewPolicyApi(), config, data);

export const getAllPolicies = (
  options: GetAllPolicies_Api_Filters,
  config: configDataType
) => AxiosGet<GetAllPolicies_Api_Response>(getAllPoliciesApi(options), config);

export const updatePolicy = (
  updateId: number,
  data: any,
  config: configDataType
) =>
  AxiosPatch<CreateNewPolicy_Api_Response>(
    updatePolicyApi(updateId),
    config,
    data
  );

export const deletePolicy = (deleteId: number, config: configDataType) =>
  AxiosDelete<DeletePolicy_Api_Response>(deletePolicyApi(deleteId), config, {});
