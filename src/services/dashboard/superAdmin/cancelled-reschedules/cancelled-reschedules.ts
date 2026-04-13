import {
  AxiosGet,
  AxiosPost,
  AxiosDelete,
  AxiosPut,
} from "@/utils/helpers/api-methods";
import { BASE_URL, configDataType } from "@/services/config";
import { getAllCancelledClassesApi } from "@/api/cancelled-reschedules";

///api function
export const getAllCancelledClasses = (
  options: {
    startDate?: string;
    endDate?: string;
    limit?: string;
    page?: string;
    excel_data?: boolean;
  },
  config: configDataType,
) => AxiosGet<any>(getAllCancelledClassesApi(options), config);
