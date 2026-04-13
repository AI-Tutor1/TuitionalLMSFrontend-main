import { BASE_URL } from "@/services/config";

export const getNotificationsForUserApi = (
  user_id: number | null,
  options: { page: number; limit: number },
) => {
  const params = new URLSearchParams();
  if (options?.limit !== null) params.append("limit", options.limit.toString());
  if (options?.page !== null) params.append("page", options.page.toString());
  return `${BASE_URL}/api/notifications/${user_id}?${params.toString()}`;
};
export const markNotificationAsReadApi = (notification_id: number | null) =>
  `${BASE_URL}/api/notifications/${notification_id}/read`;
export const markAllNotificationsAsReadApi = (user_id: number | null) =>
  `${BASE_URL}/api/notifications/read-all/${user_id}`;
