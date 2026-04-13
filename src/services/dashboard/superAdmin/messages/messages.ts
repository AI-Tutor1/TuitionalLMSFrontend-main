import { AxiosPost } from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import { GoogleChatNotification_Payload_Type } from "@/types/messages/google-chat-notifications.type";
import { googleChatNotificationsApi } from "@/api/messages";

export const googleChatNotifications = (
  config: configDataType,
  payload: GoogleChatNotification_Payload_Type
) => AxiosPost<any>(googleChatNotificationsApi(), config, payload);
