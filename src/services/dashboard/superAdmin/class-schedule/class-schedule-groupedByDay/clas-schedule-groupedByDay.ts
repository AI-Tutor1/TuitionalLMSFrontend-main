import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import { Class_Schedule_Type } from "./clas-schedule-groupedByDay.types";
import {
  exportAllClassSchedulesApi,
  exportAllClassSchedulesOldApi,
} from "@/api/class-schedule.api";

// Construct API URL with query parameters
const getAllClassSchedulesApi = (options: {
  student_id?: number | null;
  tutor_id?: number | null;
  childrens?: string | null;
}) => {
  const params = new URLSearchParams();

  if (options?.student_id !== undefined && options.student_id !== null) {
    params.append("student_id", options.student_id.toString());
  }
  if (options?.tutor_id !== undefined && options.tutor_id !== null) {
    params.append("tutor_id", options.tutor_id.toString());
  }
  if (options?.childrens !== undefined && options.childrens !== null) {
    params.append("childrens", options.childrens.toString());
  }

  const queryString = params.toString();
  return `${BASE_URL}/api/class-schedules/grouped-by-day${
    queryString ? `?${queryString}` : ""
  }`;
};

const getAllClassSchedulesApiV1 = (options: {
  day_of_week?: string | null;
  tutor_ids?: string | null;
  student_ids?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  enrollment_id?: number | null;
}) => {
  const params = new URLSearchParams();
  if (options?.tutor_ids !== undefined && options.tutor_ids !== null) {
    params.append("tutor_ids", options.tutor_ids.toString());
  }
  if (options?.student_ids !== undefined && options.student_ids !== null) {
    params.append("student_ids", options.student_ids.toString());
  }
  if (options?.startDate !== undefined && options.startDate !== null) {
    params.append("startDate", options.startDate.toString());
  }
  if (options?.endDate !== undefined && options.endDate !== null) {
    params.append("endDate", options.endDate.toString());
  }
  if (options?.enrollment_id !== undefined && options.enrollment_id !== null) {
    params.append("enrollment_id", options.enrollment_id.toString());
  }
  const queryString = params.toString();
  return `${BASE_URL}/api/v1/schedule/day/${options?.day_of_week ?? ""}${
    queryString ? `?${queryString}` : ""
  }`;
};

// API function
export const getAllClassSchedules = (
  options: {
    student_id?: number | null;
    tutor_id?: number | null;
    childrens?: string;
  },
  config: configDataType,
) => AxiosGet<Class_Schedule_Type>(getAllClassSchedulesApi(options), config);

export const getAllClassSchedulesV1 = (
  options: {
    day_of_week?: string | null;
    tutor_ids?: string | null;
    student_ids?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    enrollment_id?: number | null;
  },
  config: configDataType,
) => AxiosGet<Class_Schedule_Type>(getAllClassSchedulesApiV1(options), config);

export const exportAllClassSchedules = (config: configDataType) =>
  AxiosGet<Class_Schedule_Type>(exportAllClassSchedulesApi(), config);

export const exportAllClassSchedulesOld = (config: configDataType) =>
  AxiosGet<Class_Schedule_Type>(exportAllClassSchedulesOldApi(), config);
