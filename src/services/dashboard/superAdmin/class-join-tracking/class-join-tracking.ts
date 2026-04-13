import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import { joinClassTrackingApi } from "@/api/class-join-tracking.api";
import { ClassJoinTracking_Payload_Type } from "@/types/join-class-tracking/joinClassTracking.types";

export const classJoinTracking = (
  config: configDataType,
  payload: ClassJoinTracking_Payload_Type
) => AxiosPost<any>(joinClassTrackingApi(), config, payload);
