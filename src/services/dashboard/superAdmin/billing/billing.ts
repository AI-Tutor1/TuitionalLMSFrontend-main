import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  Get_All_Billing_ApiResponse_Type,
  Create_New_Billing_Payload_Type,
  Billing_Api_FilterOptions,
  GetBillingWithUserId_Response_Type,
} from "./billing.types";

//urls
const getAllBillingApi = (options: any) => {
  console.log(options);
  const params = new URLSearchParams();
  // Convert numeric values to strings
  if (options.limit) params.append("limit", options.limit.toString());
  if (options.page) params.append("page", options.page.toString());
  if (options?.user_id) params.append("user_id", options.user_id.toString());
  if (options?.roleId) params.append("roleId", options.roleId.toString());
  if (options?.balanceStatus)
    params.append("balanceStatus", options.balanceStatus.toString());
  if (options?.status !== undefined)
    params.append("status", options.status.toString());
  if (options?.isBelow !== undefined)
    params.append("isBelow", options.isBelow.toString());
  return `${BASE_URL}/api/billing/getAllBillings?${params.toString()}`;
};
const createNewBillingApi = () => `${BASE_URL}/api/billing/add`;
const exportBillingApi = () => `${BASE_URL}/api/billing/exportBilling`;

export const getAllBillingsWithUserIdApi = (id: string) =>
  `${BASE_URL}/api/billing/getAllBillingsWithUserId/${id}`;

///api function
export const getAllBilling = (
  options: Billing_Api_FilterOptions,
  config: configDataType
) =>
  AxiosGet<Get_All_Billing_ApiResponse_Type>(getAllBillingApi(options), config);

export const getAllBillingsWithUserId = (id: string, config: configDataType) =>
  AxiosGet<GetBillingWithUserId_Response_Type>(
    getAllBillingsWithUserIdApi(id),
    config
  );

export const createNewBilling = (
  config: configDataType,
  payload: Create_New_Billing_Payload_Type
) => AxiosPost<any>(createNewBillingApi(), config, payload);

export const exportBilling = (
  config: configDataType,
  payload: { email: string }
) => AxiosPost<any>(exportBillingApi(), config, payload);
