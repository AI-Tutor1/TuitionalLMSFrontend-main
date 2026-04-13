import { BASE_URL } from "@/services/config";

export const getAllCancelledClassesApi = (options: {
  startDate?: string;
  endDate?: string;
  limit?: string;
  page?: string;
  excel_data?: boolean;
}) => {
  const params = new URLSearchParams();
  if (options?.startDate) params.append("startDate", options?.startDate);
  if (options?.endDate) params.append("endDate", options?.endDate);
  if (options?.limit) params.append("limit", options?.limit);
  if (options?.page) params.append("page", options?.page);
  if (options?.excel_data)
    params.append("excel_data", String(options?.excel_data));
  return `${BASE_URL}/api/cancelled-reschedule-requests?${params.toString()}`;
};
