import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import {
  GetAllEnrollment_Api_Params_Type,
  GetAllEnrollment_Api_Response_Type,
  Create_Enrollment_Payload_Type,
  Create_Enrollment_Api_Response_Type,
  ChangeEnrollmentBrekStatus_Api_Response_Type,
  ChangeEnrollmentBrekStatus_Api_Payload_Type,
  GetEnrollmentByGroupId_Api_Response_Type,
} from "@/types/enrollment/getAllEnrollments.types";
import {
  getAllEnrollmentsApi,
  createEnrollmentApi,
  deleteEnrollmentApi,
  changeEnrollmentBreakStatusApi,
  changeEnrollmentBreakStatusOldApi,
  enrollmentByGroupIdApi,
  editEnrollmentByGroupIdApi,
  getAllEnrollmentsDataApi,
  getEnrollmentStatusLogApi,
  getAllEnrollmentLogsApi,
  exportEnrollmentLogsApi,
} from "@/api/enrollment.api";

///api function
export const getAllEnrollments = (
  options: GetAllEnrollment_Api_Params_Type,
  config: configDataType,
) =>
  AxiosGet<GetAllEnrollment_Api_Response_Type>(
    getAllEnrollmentsApi(options),
    config,
  );

export const getAllEnrollmentsExcelData = (
  options: GetAllEnrollment_Api_Params_Type,
  config: configDataType,
) =>
  AxiosGet<GetAllEnrollment_Api_Response_Type>(
    getAllEnrollmentsDataApi(options),
    config,
  );

export const addEnrollment = (
  data: Create_Enrollment_Payload_Type,
  config: configDataType,
) =>
  AxiosPost<Create_Enrollment_Api_Response_Type>(
    createEnrollmentApi(),
    config,
    data,
  );

export const deleteEnrollment = (
  payload: { id: string },
  config: configDataType,
) => AxiosDelete<any>(deleteEnrollmentApi(payload?.id), config);

export const changeBreakStatusOld = (
  id: string,
  payload: ChangeEnrollmentBrekStatus_Api_Payload_Type,
  config: configDataType,
) =>
  AxiosPut<ChangeEnrollmentBrekStatus_Api_Response_Type>(
    changeEnrollmentBreakStatusOldApi(id),
    config,
    payload,
  );

export const changeBreakStatus = (
  payload: ChangeEnrollmentBrekStatus_Api_Payload_Type,
  config: configDataType,
) =>
  AxiosPut<ChangeEnrollmentBrekStatus_Api_Response_Type>(
    changeEnrollmentBreakStatusApi(payload?.id),
    config,
    payload,
  );

export const getEnrollmentByGroupId = (id: string, config: configDataType) =>
  AxiosGet<GetEnrollmentByGroupId_Api_Response_Type>(
    enrollmentByGroupIdApi(id),
    config,
  );
export const editEnrollmentByGroupId = (
  id: string,
  payload: any,
  config: configDataType,
) => AxiosPut<any>(editEnrollmentByGroupIdApi(id), config, payload);

export const getEnrollmentStatusLog = (id: string, config: configDataType) =>
  AxiosGet<any>(getEnrollmentStatusLogApi(id), config);

export const getAllEnrollmentLogs = (
  options: GetAllEnrollment_Api_Params_Type,
  config: configDataType,
) => AxiosGet<any>(getAllEnrollmentLogsApi(options), config);

export const exportEnrollmentLogs = (options: any, config: configDataType) =>
  AxiosGet<any>(exportEnrollmentLogsApi(options), config);
