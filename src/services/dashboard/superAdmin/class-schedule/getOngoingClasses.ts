import { AxiosGet } from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import { getOngoingClassesApi } from "@/api/class-schedule.api";
import {
  OngoingClasses_Params_Type,
  OngoingClasses_Response_Type,
} from "@/types/class-schedule/getOngoingClasses.types";

export const getOngoingClasses = (
  options: OngoingClasses_Params_Type,
  config: configDataType
) =>
  AxiosGet<OngoingClasses_Response_Type>(getOngoingClassesApi(options), config);
