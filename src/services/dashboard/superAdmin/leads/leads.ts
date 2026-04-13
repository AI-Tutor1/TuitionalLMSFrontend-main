import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import {
  GetAllNewUserInvoices_Api_Params_Type,
  GetAllNewUserInvoices_Api_Response_Type,
  GenerateNewUserInvoice_Api_Payload_Type,
  GenerateNewUserInvoice_Api_Response_Type,
} from "@/types/leads/leads.type";

import {
  generateNewUserInvoiceApi,
  getAllNewUserInvoicesApi,
} from "@/api/leads";

export const getAllNewUserInvoices = (
  options: GetAllNewUserInvoices_Api_Params_Type,
  config: configDataType
): Promise<GetAllNewUserInvoices_Api_Response_Type> =>
  AxiosGet<GetAllNewUserInvoices_Api_Response_Type>(
    getAllNewUserInvoicesApi(options),
    config
  );

export const generateNewUserInvoice = (
  payload: GenerateNewUserInvoice_Api_Payload_Type,
  config: configDataType
): Promise<GenerateNewUserInvoice_Api_Response_Type> =>
  AxiosPost<GenerateNewUserInvoice_Api_Response_Type>(
    generateNewUserInvoiceApi(),
    config,
    payload
  );
