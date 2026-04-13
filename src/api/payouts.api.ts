import { BASE_URL } from "@/services/config";
import { GetTutorPayoutsApi_Params_Type } from "@/types/payouts/getPayoutForMonth";
import { UpdatePayoutStatusType_Api_Params_Type } from "@/types/payouts/updatePayoutStatus.type";

export const getTutorPayoutsApi = (
  options: GetTutorPayoutsApi_Params_Type,
): string => {
  const params = new URLSearchParams();

  // Only append parameters if they have valid values
  if (options?.month !== undefined && options?.month !== null) {
    params.append("month", options.month.toString());
  }
  if (options?.year !== undefined && options?.year !== null) {
    params.append("year", options.year.toString());
  }
  if (options?.search !== undefined && options?.search !== "") {
    params.append("search", options.search);
  }
  if (options?.page !== undefined && options?.page !== null) {
    params.append("page", options.page.toString());
  }
  if (options?.limit !== undefined && options?.limit !== null) {
    params.append("limit", options.limit.toString());
  }
  if (
    options?.status !== undefined &&
    options?.status !== "" &&
    options?.status !== null
  ) {
    params.append("status", options.status);
  }
  if (options?.exportData !== undefined && options?.exportData !== null) {
    params.append("exportData", options.exportData.toString());
  }
  return `${BASE_URL}/api/payouts/by-month${
    params.toString() ? `?${params.toString()}` : ""
  }`;
};

export const generateUpdatePayoutsApi = () =>
  `${BASE_URL}/api/payouts/generate-or-update`;

export const updatePayoutStatusApi = (
  payoutId: UpdatePayoutStatusType_Api_Params_Type,
) => {
  if (!payoutId) throw new Error("payoutId is required");
  return `${BASE_URL}/api/payouts/${payoutId}/mark-paid`;
};
