import { AxiosGet, AxiosPost, AxiosPut } from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import {
  GetPayoutsForMonth_Api_Response_Type,
  GetTutorPayoutsApi_Params_Type,
} from "@/types/payouts/getPayoutForMonth";
import { Generate_Update_Payouts_Api_Response_Type } from "@/types/payouts/generateOrUpdatePayout.type";
import {
  UpdatePayoutStatusType_Api_Params_Type,
  UpdatePayoutStatusType_Api_Response_Type,
} from "@/types/payouts/updatePayoutStatus.type";

import {
  getTutorPayoutsApi,
  generateUpdatePayoutsApi,
  updatePayoutStatusApi,
} from "@/api/payouts.api";

export const getTutorPayouts = (
  options: GetTutorPayoutsApi_Params_Type,
  config: configDataType
) =>
  AxiosGet<GetPayoutsForMonth_Api_Response_Type>(
    getTutorPayoutsApi(options),
    config
  );

export const generateUpdateTutorPayouts = (config: configDataType) =>
  AxiosPost<Generate_Update_Payouts_Api_Response_Type>(
    generateUpdatePayoutsApi(),
    config
  );

export const updatePayoutStatus = (
  payoutId: UpdatePayoutStatusType_Api_Params_Type,
  config: configDataType
) =>
  AxiosPut<UpdatePayoutStatusType_Api_Response_Type>(
    updatePayoutStatusApi(payoutId),
    config
  );
