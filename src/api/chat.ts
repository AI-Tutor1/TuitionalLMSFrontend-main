import { BASE_URL } from "@/services/config";

// API endpoint functions
export const getRoomsForUserApi = (userId: number) =>
  `${BASE_URL}/api/rooms/user/${userId}`;
export const createRoomApi = () => `${BASE_URL}/api/rooms`;
export const getMessagesForRoomApi = (
  roomId: number | null,
  threadId?: number
) =>
  threadId
    ? `${BASE_URL}/api/messages/${roomId}?thread_id=${threadId}`
    : `${BASE_URL}/api/messages/${roomId}`;
export const getResourcesForRoomApi = (
  roomId: number | null,
  threadId?: number
) =>
  threadId
    ? `${BASE_URL}/api/messages/resources/${roomId}?thread_id=${threadId}`
    : `${BASE_URL}/api/messages/resources/${roomId}`;
export const sendMessageApi = () => `${BASE_URL}/api/messages`;
export const updateMessageApi = (messageId: number) =>
  `${BASE_URL}/api/messages/${messageId}`;
export const deleteMessageApi = (messageId: number) =>
  `${BASE_URL}/api/messages/${messageId}`;
export const addReactionApi = () => `${BASE_URL}/api/messages/reactions`;
export const removeReactionApi = (messageId: number, userId: number) =>
  `${BASE_URL}/api/messages/${messageId}/reactions/${userId}`;
export const getReactionsForMessageApi = (messageId: number) =>
  `${BASE_URL}/api/messages/${messageId}/reactions`;
export const markMessageAsViewedApi = () => `${BASE_URL}/api/messages/views`;
export const getViewersForMessageApi = (messageId: number) =>
  `${BASE_URL}/api/messages/${messageId}/views`;
export const uploadFileApi = () => `${BASE_URL}/api/messages/upload`;
export const uploadVoiceNoteApi = () => `${BASE_URL}/api/messages/upload/voice`;
