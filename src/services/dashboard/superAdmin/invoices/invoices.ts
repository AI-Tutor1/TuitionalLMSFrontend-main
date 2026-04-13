import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  GenerateUserInvoice_Api_Response,
  GetAllInvoice_Api_Response,
  GetAllInvoices_Options,
  Update_Invoice_Status_Api_Response,
  Generate_New_Invoice_Api_Response,
  Generate_New_Invoice_Api_Payload,
  Generate_Invoice_For_Parent_Api_Payload_Type,
  Generate_Invoice_For_Parent_Api_Response_Type,
} from "./invoices.types";

// URLs
const getAllInvoicesApi = (options: GetAllInvoices_Options): string => {
  const params = new URLSearchParams();
  if (options?.limit !== undefined)
    params.append("limit", options.limit.toString());
  if (options?.page !== undefined)
    params.append("page", options.page.toString());
  if (options?.date) params.append("date", options.date);
  if (options?.startDate) params.append("startDate", options.startDate);
  if (options?.endDate) params.append("endDate", options.endDate);
  if (options?.dueStartDate)
    params.append("dueStartDate", options.dueStartDate);
  if (options?.dueEndDate) params.append("dueEndDate", options.dueEndDate);
  if (options?.name) params.append("name", options.name);
  if (options?.status) params.append("status", options.status);
  if (options?.is_sent !== "")
    params.append("is_sent", String(options.is_sent));
  if (options?.user_id) params.append("user_id", options.user_id);
  if (options?.excel_data)
    params.append("excel_data", String(options.excel_data));
  return `${BASE_URL}/api/invoice/?${params.toString()}`;
};
const generateInvoicesApi_ForStudents = (options: {
  id: number;
  piercPercentage: boolean;
}): string =>
  `${BASE_URL}/api/invoice/${options?.id?.toString()}?piercPercentage=${
    options?.piercPercentage
  }`;
const generateInvoicesV1Api_ForStudents = (options: {
  id: number;
  piercPercentage: boolean;
}): string =>
  `${BASE_URL}/api/v1/invoice/${options?.id?.toString()}?piercPercentage=${
    options?.piercPercentage
  }`;

const generateNewInvoiceApi = (): string => `${BASE_URL}/api/invoices/generate`;
const generateInvoiceForParentApi = (): string =>
  `${BASE_URL}/api/invoice/generateInvoiceForParent`;
const updateInvoiceStatusApi = (id: number | null): string =>
  `${BASE_URL}/api/invoice/${id?.toString()}/status`;
const updateInvoiceApi = (id: number | null): string =>
  `${BASE_URL}/api/invoice/updateInvoice/${id}`;
const deleteInvoiceStatusApi = (id: number | null): string =>
  `${BASE_URL}/api/invoices/${id?.toString()}`;
const invoicePaymentToStudentApi = (): string =>
  `${BASE_URL}/api/invoice/send-to-student`;
const generateInvoiceForStudentsApi = (): string =>
  `${BASE_URL}/api/invoice/generate/all-students`;

// API Functions
export const getAllInvoices = (
  options: GetAllInvoices_Options,
  config: configDataType,
): Promise<GetAllInvoice_Api_Response> =>
  AxiosGet<GetAllInvoice_Api_Response>(getAllInvoicesApi(options), config);

// generate invoices for students
export const generateInvoices = (
  options: { id: number; piercPercentage: boolean },
  config: configDataType,
): Promise<GenerateUserInvoice_Api_Response> =>
  AxiosGet<GenerateUserInvoice_Api_Response>(
    generateInvoicesApi_ForStudents(options),
    config,
  );

// generate invoices for students v1
export const generateInvoicesV1 = (
  options: { id: number; piercPercentage: boolean },
  config: configDataType,
): Promise<GenerateUserInvoice_Api_Response> =>
  AxiosGet<GenerateUserInvoice_Api_Response>(
    generateInvoicesV1Api_ForStudents(options),
    config,
  );

export const generateNewInvoice = (
  config: configDataType,
  payload: Generate_New_Invoice_Api_Payload,
): Promise<Generate_New_Invoice_Api_Response> =>
  AxiosPost<Generate_New_Invoice_Api_Response>(
    generateNewInvoiceApi(),
    config,
    payload,
  );
// generate invoice for parent
export const generateInvoiceForParent = (
  config: configDataType,
  payload: Generate_Invoice_For_Parent_Api_Payload_Type,
): Promise<Generate_Invoice_For_Parent_Api_Response_Type> =>
  AxiosPost<Generate_Invoice_For_Parent_Api_Response_Type>(
    generateInvoiceForParentApi(),
    config,
    payload,
  );

export const updateInvoiceStatus = (
  id: number | null,
  config: configDataType,
  payload: {
    status: "PAID";
    amount_paid: number;
  },
): Promise<Update_Invoice_Status_Api_Response> =>
  AxiosPut<Update_Invoice_Status_Api_Response>(
    updateInvoiceStatusApi(id),
    config,
    payload,
  );

export const updateInvoice = (
  id: number,
  config: configDataType,
  payload: {
    is_sent: boolean;
  },
): Promise<Update_Invoice_Status_Api_Response> =>
  AxiosPut<Update_Invoice_Status_Api_Response>(
    updateInvoiceApi(id),
    config,
    payload,
  );

export const deleteInvoice = (
  id: number | null,
  config: configDataType,
): Promise<{ message: string }> =>
  AxiosDelete<{ message: string }>(deleteInvoiceStatusApi(id), config);

export const invoicePaymentToStudent = (
  config: configDataType,
  payload: { id: number | null },
): Promise<{
  message: string;
}> =>
  AxiosPost<{
    message: string;
  }>(invoicePaymentToStudentApi(), config, payload);
export const generateInvoiceForStudents = (
  config: configDataType,
): Promise<{
  message: string;
}> =>
  AxiosPost<{
    message: string;
  }>(generateInvoiceForStudentsApi(), config);
