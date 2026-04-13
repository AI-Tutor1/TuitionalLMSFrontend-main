import { AxiosPost } from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import { classScheduleInstantApi } from "@/api/class-schedule.api";

// API function
export const classScheduleInstant = (
  config: configDataType,
  payload: {
    enrollment_id: number | null;
    duration: number | null;
    isBypass?: boolean;
  }
) => AxiosPost<any>(classScheduleInstantApi(), config, payload);
