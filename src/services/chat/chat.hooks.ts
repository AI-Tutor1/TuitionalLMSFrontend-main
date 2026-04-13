import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { configDataType } from "@/services/config";
import {
  getRoomsForUser,
  createRoom,
  sendMessage,
  updateMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  getReactionsForMessage,
  markMessageAsViewed,
  getViewersForMessage,
  uploadFile,
  uploadVoiceNote,
} from "./chat";

// Query keys
export const chatKeys = {
  all: ["chat"] as const,
  rooms: () => [...chatKeys.all, "rooms"] as const,
  roomsForUser: (userId: number) => [...chatKeys.rooms(), userId] as const,
  messages: () => [...chatKeys.all, "messages"] as const,
  messagesForRoom: (roomId: number, threadId?: number) =>
    [...chatKeys.messages(), roomId, threadId] as const,
  reactions: () => [...chatKeys.all, "reactions"] as const,
  reactionsForMessage: (messageId: number) =>
    [...chatKeys.reactions(), messageId] as const,
  views: () => [...chatKeys.all, "views"] as const,
  viewsForMessage: (messageId: number) =>
    [...chatKeys.views(), messageId] as const,
};

// Room hooks
export const useGetRoomsForUser = (config: configDataType, userId: number) => {
  return useQuery({
    queryKey: chatKeys.roomsForUser(userId),
    queryFn: () => getRoomsForUser(config, userId),
    enabled: !!userId,
  });
};

export const useCreateRoom = (config: configDataType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; users: number[] }) =>
      createRoom(config, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    },
  });
};

// Message hooks

export const useSendMessage = (config: configDataType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      room_id: number;
      sender_id: number;
      message_content: string;
      message_type?: string;
      parent_id?: number;
      replied_to_id?: number;
      media_url?: string;
      thumbnail_url?: string;
    }) => sendMessage(config, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messagesForRoom(variables.room_id),
      });
    },
  });
};

export const useUpdateMessage = (config: configDataType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      data,
    }: {
      messageId: number;
      data: {
        message_content?: string;
        message_type?: string;
        media_url?: string;
        thumbnail_url?: string;
        parent_id?: number;
        replied_to_id?: number;
      };
    }) => updateMessage(config, messageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages() });
    },
  });
};

export const useDeleteMessage = (config: configDataType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: number) => deleteMessage(config, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages() });
    },
  });
};

// Reaction hooks
export const useGetReactionsForMessage = (
  config: configDataType,
  messageId: number
) => {
  return useQuery({
    queryKey: chatKeys.reactionsForMessage(messageId),
    queryFn: () => getReactionsForMessage(config, messageId),
    enabled: !!messageId,
  });
};

export const useAddReaction = (config: configDataType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      message_id: number;
      user_id: number;
      reaction_type: string;
    }) => addReaction(config, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.reactionsForMessage(variables.message_id),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.messages() });
    },
  });
};

export const useRemoveReaction = (config: configDataType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      userId,
    }: {
      messageId: number;
      userId: number;
    }) => removeReaction(config, messageId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.reactionsForMessage(variables.messageId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.messages() });
    },
  });
};

// View hooks
export const useGetViewersForMessage = (
  config: configDataType,
  messageId: number
) => {
  return useQuery({
    queryKey: chatKeys.viewsForMessage(messageId),
    queryFn: () => getViewersForMessage(config, messageId),
    enabled: !!messageId,
  });
};

export const useMarkMessageAsViewed = (config: configDataType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { message_id: number; user_id: number }) =>
      markMessageAsViewed(config, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.viewsForMessage(variables.message_id),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.messages() });
    },
  });
};

// Upload hooks
export const useUploadFile = (config: configDataType) => {
  return useMutation({
    mutationFn: (file: File) => uploadFile(config, file),
  });
};

export const useUploadVoiceNote = (config: configDataType) => {
  return useMutation({
    mutationFn: (data: { file: File | Blob; duration: number }) =>
      uploadVoiceNote(config, data),
  });
};
