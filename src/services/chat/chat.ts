import {
  AxiosGet,
  AxiosPost,
  AxiosPut,
  AxiosDelete,
} from "@/utils/helpers/api-methods";
import { configDataType } from "@/services/config";
import {
  getRoomsForUserApi,
  createRoomApi,
  getMessagesForRoomApi,
  sendMessageApi,
  updateMessageApi,
  deleteMessageApi,
  addReactionApi,
  removeReactionApi,
  getReactionsForMessageApi,
  markMessageAsViewedApi,
  getViewersForMessageApi,
  uploadFileApi,
  uploadVoiceNoteApi,
  getResourcesForRoomApi,
} from "@/api/chat";

// Room services
export const getRoomsForUser = (config: configDataType, userId: number) =>
  AxiosGet<any>(getRoomsForUserApi(userId), config);

export const createRoom = (
  config: configDataType,
  data: { name: string; users: number[] }
) => AxiosPost<any>(createRoomApi(), config, data);

// Message services
export const getMessagesForRoom = (
  config: configDataType,
  roomId: number | null,
  threadId?: number
) => AxiosGet<any>(getMessagesForRoomApi(roomId), config);
export const getResourcesForRoom = (
  config: configDataType,
  roomId: number | null,
  threadId?: number
) => AxiosGet<any>(getResourcesForRoomApi(roomId), config);

export const sendMessage = (
  config: configDataType,
  data: {
    room_id: number;
    sender_id: number;
    message_content: string;
    message_type?: string;
    parent_id?: number;
    replied_to_id?: number;
    media_url?: string;
    thumbnail_url?: string;
  }
) => AxiosPost<any>(sendMessageApi(), config, data);

export const updateMessage = (
  config: configDataType,
  messageId: number,
  data: {
    message_content?: string;
    message_type?: string;
    media_url?: string;
    thumbnail_url?: string;
    parent_id?: number;
    replied_to_id?: number;
  }
) => AxiosPut<any>(updateMessageApi(messageId), config, data);

export const deleteMessage = (config: configDataType, messageId: number) =>
  AxiosDelete<any>(deleteMessageApi(messageId), config);

// Reaction services
export const addReaction = (
  config: configDataType,
  data: {
    message_id: number;
    user_id: number;
    reaction_type: string;
  }
) => AxiosPost<any>(addReactionApi(), config, data);

export const removeReaction = (
  config: configDataType,
  messageId: number,
  userId: number
) => AxiosDelete<any>(removeReactionApi(messageId, userId), config);

export const getReactionsForMessage = (
  config: configDataType,
  messageId: number
) => AxiosGet<any>(getReactionsForMessageApi(messageId), config);

// View services
export const markMessageAsViewed = (
  config: configDataType,
  data: {
    message_id: number;
    user_id: number;
  }
) => AxiosPost<any>(markMessageAsViewedApi(), config, data);

export const getViewersForMessage = (
  config: configDataType,
  messageId: number
) => AxiosGet<any>(getViewersForMessageApi(messageId), config);

// Upload services
export const uploadFile = (config: configDataType, file: File) => {
  // const formData = new FormData();
  // formData.append("file", file);
  console.log("Uploading file:", file);
  return AxiosPost<any>(
    uploadFileApi(),
    { ...config, contentType: "multipart/form-data" },
    { file }
  );
};

export const uploadVoiceNote = (
  config: configDataType,
  data: { file: File | Blob; duration: number }
) => {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("duration", data.duration.toString());
  return AxiosPost<any>(
    uploadVoiceNoteApi(),
    { ...config, contentType: "multipart/form-data" },
    formData
  );
};
