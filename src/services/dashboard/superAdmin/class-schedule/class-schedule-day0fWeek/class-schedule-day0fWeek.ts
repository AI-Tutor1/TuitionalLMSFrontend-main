import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import { ClassSchedule_Day_Of_Week } from "./class-schedule-day0fWeek.types";

//urls
const getAllClassSchedulesDAYOfWeekApi = (options: any) =>
  `${BASE_URL}/api/schedule/day/${options}`;

//api function
export const getAllClassSchedulesDAYOfWeek = (
  options: any,
  config: configDataType
) =>
  AxiosGet<ClassSchedule_Day_Of_Week>(
    getAllClassSchedulesDAYOfWeekApi(options),
    config
  );
