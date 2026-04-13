import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import SocketManager from "@/utils/socket/socket";
import { chatKeys } from "@/services/chat/chat.hooks";
import { MessageData } from "@/types/chat/messages.types";

interface UseSocketProps {
  userId: number;
  token?: string;
  roomId?: number;
  enabled?: boolean;
  sender_id?: number;
  registerListeners?: boolean;
}

export const useSocket = ({
  userId,
  token,
  roomId,
  enabled = true,
  sender_id,
  registerListeners = true,
}: UseSocketProps) => {
  const queryClient = useQueryClient();
  const socketManager = useRef<SocketManager>(SocketManager.getInstance());
  const currentRoomId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !userId) return;

    // Connect to socket
    const socket = socketManager.current.connect(userId, token);

    console.log("Socket connected:", socket.id);
    console.log(
      "Socket connection status:",
      socketManager.current.isConnected(),
    );
    // Join room if roomId is provided
    if (roomId && roomId !== currentRoomId.current) {
      // Leave previous room if exists
      if (currentRoomId.current) {
        socketManager.current.leaveRoom(currentRoomId.current);
      }

      // Join new room
      socketManager.current.joinRoom(roomId);
      currentRoomId.current = roomId;
    }

    if (!registerListeners) return;

    // Set up event listeners
    const handleNewMessage = (data: any) => {
      const targetRoomId = Number(data.room_id || data.roomId || roomId);
      if (!targetRoomId) return;

      const messageData: MessageData = {
        id: data.id || Date.now(),
        room_id: targetRoomId,
        message_content: data.message || data.message_content || "",
        sender_id: data.sender_id || data.senderId,
        message_type: data.messageType || data.message_type || "text",
        createdAt: data.createdAt || new Date().toISOString(),
        sender: data.sender || {
          id: data.sender_id || data.senderId,
          name: "User",
        },
        reactions: data.reactions || [],
        views: data.views || [],
        replied_to_id: data.replied_to_id || data.repliedToId,
        repliedToMessage: data.repliedToMessage,
        media_url: data.mediaUrl || data.media_url,
        thumbnail_url: data.thumbnailUrl || data.thumbnail_url,
        audio_url: data.audioUrl || data.audio_url,
        duration_seconds: data.duration || data.duration_seconds,
        transcript: data.transcript,
        waveform_data: data.waveformData || data.waveform_data,
      };

      queryClient.setQueryData(
        chatKeys.messagesForRoom(targetRoomId),
        (oldData: MessageData[] | undefined) => {
          if (!oldData) return [messageData];

          // Avoid duplicates
          const exists = oldData.some((msg) => msg.id === messageData.id);
          if (exists) return oldData;

          return [...oldData, messageData];
        },
      );

      // --- NEW: Update Rooms List Cache ---
      queryClient.setQueriesData(
        { queryKey: chatKeys.rooms() },
        (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;

          let roomToUpdate: any = null;
          const updatedPages = oldData.pages.map((page: any[]) => {
            const index = page.findIndex((r) => r.id === targetRoomId);
            if (index !== -1) {
              roomToUpdate = {
                ...page[index],
                lastMessage: messageData,
                updatedAt: messageData.createdAt,
              };
              return page.filter((_, i) => i !== index);
            }
            return page;
          });

          // If room exists in cache, put it at the very top of page 0
          if (roomToUpdate) {
            updatedPages[0] = [roomToUpdate, ...updatedPages[0]];
          }

          return { ...oldData, pages: updatedPages };
        },
      );
    };

    const handleMessageUpdate = (data: MessageData) => {
      const targetRoomId = data.room_id || roomId;
      if (!targetRoomId) return;

      queryClient.setQueryData(
        chatKeys.messagesForRoom(targetRoomId),
        (oldData: MessageData[] | undefined) => {
          if (!oldData) return [];
          return oldData.map((msg) =>
            msg.id === data.id ? { ...msg, ...data } : msg,
          );
        },
      );
    };

    const handleMessageDelete = (data: {
      messageId: number;
      roomId: number;
    }) => {
      const targetRoomId = data.roomId || roomId;
      if (!targetRoomId) return;

      queryClient.setQueryData(
        chatKeys.messagesForRoom(targetRoomId),
        (oldData: MessageData[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter((msg) => msg.id !== data.messageId);
        },
      );
    };

    const handleReactionAdded = (data: {
      messageId: number;
      reaction: any;
      roomId: number;
    }) => {
      const targetRoomId = data.roomId || roomId;
      if (!targetRoomId) return;

      queryClient.setQueryData(
        chatKeys.messagesForRoom(targetRoomId),
        (oldData: MessageData[] | undefined) => {
          if (!oldData) return [];
          return oldData.map((msg) =>
            msg.id === data.messageId
              ? {
                  ...msg,
                  reactions: [...(msg.reactions || []), data.reaction],
                }
              : msg,
          );
        },
      );

      queryClient.invalidateQueries({
        queryKey: chatKeys.reactionsForMessage(data.messageId),
      });
    };

    const handleReactionRemoved = (data: {
      messageId: number;
      userId: number;
      roomId: number;
    }) => {
      const targetRoomId = data.roomId || roomId;
      if (!targetRoomId) return;

      queryClient.setQueryData(
        chatKeys.messagesForRoom(targetRoomId),
        (oldData: MessageData[] | undefined) => {
          if (!oldData) return [];
          return oldData.map((msg) =>
            msg.id === data.messageId
              ? {
                  ...msg,
                  reactions:
                    msg.reactions?.filter(
                      (reaction) => reaction.user.id !== data.userId,
                    ) || [],
                }
              : msg,
          );
        },
      );

      queryClient.invalidateQueries({
        queryKey: chatKeys.reactionsForMessage(data.messageId),
      });
    };

    // Register event listeners
    socketManager.current.onNewMessage(handleNewMessage);
    socketManager.current.onMessageUpdate(handleMessageUpdate);
    socketManager.current.onMessageDelete(handleMessageDelete);
    socketManager.current.onReactionAdded(handleReactionAdded);
    socketManager.current.onReactionRemoved(handleReactionRemoved);

    // Cleanup function
    return () => {
      // Remove event listeners
      socketManager.current.removeListeners("new_message");
      socketManager.current.removeListeners("message_updated");
      socketManager.current.removeListeners("message_deleted");
      socketManager.current.removeListeners("reaction_added");
      socketManager.current.removeListeners("reaction_removed");

      // Leave room if exists
      if (currentRoomId.current) {
        socketManager.current.leaveRoom(currentRoomId.current);
        currentRoomId.current = null;
      }
    };
  }, [userId, token, roomId, enabled, queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketManager.current.disconnect();
    };
  }, []);

  return {
    socket: socketManager.current.getSocket(),
    isConnected: socketManager.current.isConnected(),
    sendMessage: (data: {
      room_id: number;
      message: string;
      messageType?: string;
      replied_to_id?: number;
      mediaUrl?: string;
      audioUrl?: string;
      duration?: number;
      sender_id: number;
      repliedToMessage?: MessageData;
      reactions?: any[];
      views?: any[];
    }) => socketManager.current.sendMessage(data),
    emitTyping: (roomId: number) => socketManager.current.emitTyping(roomId),
    emitStoppedTyping: (roomId: number) =>
      socketManager.current.emitStoppedTyping(roomId),
    joinRoom: (roomId: number) => socketManager.current.joinRoom(roomId),
    leaveRoom: (roomId: number) => socketManager.current.leaveRoom(roomId),
  };
};
