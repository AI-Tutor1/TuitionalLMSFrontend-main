import { AxiosGet, AxiosPost, AxiosPatch } from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import {
  getNotificationsForUserApi,
  markAllNotificationsAsReadApi,
  markNotificationAsReadApi,
} from "@/api/notifications";
import {
  markNotificationAsRead_Response_Types,
  getNotificationsForUser_Response_Types,
} from "@/types/notifications/notifications.types";

export const getNotificationsForUser = (
  user_id: number | null,
  config: configDataType,
  options: { page: number; limit: number },
) =>
  AxiosGet<getNotificationsForUser_Response_Types>(
    getNotificationsForUserApi(user_id, options),
    config,
  );

export const markNotificationAsRead = (
  id: number | null,
  config: configDataType,
) =>
  AxiosPatch<markNotificationAsRead_Response_Types>(
    markNotificationAsReadApi(id),
    config,
    { id },
  );

export const markAllNotificationsAsRead = (
  user_id: number | null,
  config: configDataType,
) =>
  AxiosPatch<markNotificationAsRead_Response_Types>(
    markAllNotificationsAsReadApi(user_id),
    config,
    {},
  );
