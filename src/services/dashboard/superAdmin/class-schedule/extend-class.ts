import { configDataType } from "@/services/config";
import { AxiosPost } from "@/utils/helpers/api-methods";

import {
  ExtendClassDuration_Api_Response_Type,
  ExtendClassDuration_Payload_Type,
} from "@/types/extend-class/extendClassDuration.types";
import { extendClassApi } from "@/api/class-schedule.api";

///api function

export const extendClass = (
  data: ExtendClassDuration_Payload_Type,
  config: configDataType
) =>
  AxiosPost<ExtendClassDuration_Api_Response_Type>(
    extendClassApi(),
    config,
    data
  );
