import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import {
  Create_TeacherSchedule_Payload,
  Create_TeacherSchedule_ApiResponse_Type,
  ConfirmClassSchedule_Payload,
  ConfirmClassSchedule__ApiResponse_Type,
  DeleteClassSchedule_Payload_Type,
  RescheduleRequest_Payload_Type,
} from "./getEnrollmentByGroup-id.types";

//urls

// const addTeacherScheduleApi = () => `${BASE_URL}/api/teacherSchedule`;
const addTeacherScheduleApi = () =>
  `${BASE_URL}/api/class-schedules/createClassSchedule`;
const confirmClassScheduleApi = () => `${BASE_URL}/api/classSchedule`;
const cancelClassScheduleForWeekApi = () =>
  `${BASE_URL}/api/reschedule-requests`;
const delteClassSchedule = () => `${BASE_URL}/api/classSchedule`;
const remoevAvailableSlotApi = (id: string) =>
  `${BASE_URL}/api/teacherSchedule/${id}`;
const rescheduleRequestApi = (options: {
  startDate?: string;
  endDate?: string;
}) => {
  const params = new URLSearchParams();
  if (options?.startDate) params.append("startDate", options?.startDate);
  if (options?.endDate) params.append("endDate", options?.endDate);
  return `${BASE_URL}/api/reschedule-requests-get?${params.toString()}`;
};
const deleteRescheduleRequestApi = (options: { id?: string }) => {
  const params = new URLSearchParams();
  if (options?.id) params.append("id", options?.id);
  return `${BASE_URL}/api/reschedule-requests/?${params.toString()}`;
};

///api functions

export const addTeacherSchedule = (
  data: Create_TeacherSchedule_Payload,
  config: configDataType
) =>
  AxiosPost<Create_TeacherSchedule_ApiResponse_Type | any>(
    addTeacherScheduleApi(),
    config,
    data
  );

export const confirmClassSchedule = (
  data: ConfirmClassSchedule_Payload,
  config: configDataType
) =>
  AxiosPost<ConfirmClassSchedule__ApiResponse_Type | any>(
    confirmClassScheduleApi(),
    config,
    data
  );

export const cancelClassScheduleForWeek = (data: any, config: configDataType) =>
  AxiosPost<any>(cancelClassScheduleForWeekApi(), config, data);

export const deleteClassSchedule = (
  data: DeleteClassSchedule_Payload_Type,
  config: configDataType
) => AxiosDelete<any>(delteClassSchedule(), config, data);

export const removeAvailableSlotFn = (id: string, config: configDataType) =>
  AxiosDelete<any>(remoevAvailableSlotApi(id), config);

export const rescheduleRequest = (
  options: {
    startDate?: string;
    endDate?: string;
  },
  config: configDataType,
  data: RescheduleRequest_Payload_Type
) => AxiosPost<any>(rescheduleRequestApi(options), config, data);

export const deleteRescheduleRequest = (
  options: {
    id?: string;
  },
  config: configDataType
) => AxiosDelete<any>(deleteRescheduleRequestApi(options), config);
