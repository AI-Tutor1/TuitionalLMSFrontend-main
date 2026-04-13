import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  Get_All_Transactions_ApiResponse,
  Transaction_Api_FilterOptions,
} from "./transaction.types";

//urls
const getAllTransactionsApi = (options: Transaction_Api_FilterOptions) => {
  const params = new URLSearchParams();
  // Convert numeric values to strings
  if (options?.user_id) params.append("user_id", options.user_id.toString());
  if (options?.start_time) params.append("start_time", options.start_time);
  if (options?.end_time) params.append("end_time", options.end_time);
  if (options?.conclusion_type)
    params.append("conclusion_type", options.conclusion_type);
  if (options?.type) params.append("type", options.type);
  if (options.limit) params.append("limit", options.limit.toString());
  if (options.page) params.append("page", options.page.toString());
  if (options.session_id)
    params.append("session_id", options.session_id.toString());

  return `${BASE_URL}/api/transactions?${params.toString()}`;
};

const deleteTransactionApi = (options: { id: number }) =>
  `${BASE_URL}/api/transactions/${String(options?.id)}`;

///api function
export const getAllTransactions = (
  options: Transaction_Api_FilterOptions,
  config: configDataType
) =>
  AxiosGet<Get_All_Transactions_ApiResponse>(
    getAllTransactionsApi(options),
    config
  );

export const deleteTransaction = (
  options: { id: number },
  config: configDataType
) => AxiosDelete<{ message: string }>(deleteTransactionApi(options), config);
