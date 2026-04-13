"use client";
import React, {
  FC,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import classes from "./right.module.css";
import { EmojiClickData } from "emoji-picker-react";
import { toast } from "react-toastify";

// Custom hooks and components
import { useRecording } from "@/utils/hooks/useRecording";
import { useFileUpload } from "@/utils/hooks/useFileUpload";
import { useSocket } from "@/utils/hooks/useSocket";
import {
  useSendMessage,
  useAddReaction,
  useDeleteMessage,
  useRemoveReaction,
  useUploadFile,
  useUploadVoiceNote,
  chatKeys,
} from "@/services/chat/chat.hooks";

import { ChatHeader } from "@/components/ui/superAdmin/chat/right/components/chatHeader/chatHeader";
import { MessagesList } from "@/components/ui/superAdmin/chat/right/components/messageList/messageList";
import { MessageInput } from "@/components/ui/superAdmin/chat/right/components/messageInput/messageInput";
import { ReactionsPicker } from "@/components/ui/superAdmin/chat/right/components/reactionPicker/reactionPicker";
import { MessageViewers } from "@/components/ui/superAdmin/chat/right/components/messageViewers/messageViewers";
import { MessageActionsMenu } from "@/components/ui/superAdmin/chat/right/components/messageActionsMenu/messageActionsMenu";
import { MessageData } from "@/types/chat/messages.types";
import { configDataType } from "@/services/config";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { useQuery } from "@tanstack/react-query";
import { getMessagesForRoom, getResourcesForRoom } from "@/services/chat/chat";
import ErrorBox from "@/components/global/error-box/error-box";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { Room } from "@/types/rooms/getRooms.types";
import { FileText, File, ImageIcon, Video, Download } from "lucide-react";
import { fi } from "date-fns/locale";
import ResourceList from "./components/resourceList/resourceList";

interface RightProps {
  room?: Room | null;
}

const Right: FC<RightProps> = ({ room }) => {
  const { token, user } = useAppSelector((state) => state.user);
  const [tab, setTab] = useState("Chat"); // API configuration

  const config: configDataType = {
    token,
    contentType: "application/json",
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "doc":
        return <File className="w-8 h-8 text-blue-500" />;
      case "image":
        return <ImageIcon className="w-8 h-8 text-green-500" />;
      case "video":
        return <Video className="w-8 h-8 text-purple-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const {
    data: messagesData,
    isLoading: getMessagesLoading,
    error: getMessagesError,
  } = useQuery({
    queryKey: chatKeys.messagesForRoom(room?.id!),
    queryFn: () => getMessagesForRoom({ token }, room?.id!),
    enabled: !!room?.id && !!token,
  });
  const {
    data: resources,
    isLoading: getResourcesLoading,
    error: getResourcesError,
  } = useQuery({
    queryKey: ["roomResources", room?.id],
    queryFn: () => getResourcesForRoom({ token }, room?.id!),
    enabled: !!room?.id && !!token,
  });

  const sendMessageMutation = useSendMessage(config);
  const addReactionMutation = useAddReaction(config);
  const removeReactionMutation = useRemoveReaction(config);
  const deleteMessageMutation = useDeleteMessage(config);
  const uploadFileMutation = useUploadFile(config);
  const uploadVoiceNoteMutation = useUploadVoiceNote(config);

  // Socket connection
  const {
    isConnected,
    sendMessage: socketSendMessage,
    socket,
  } = useSocket({
    userId: user?.id!,
    token,
    roomId: room?.id!,
    enabled: true,
    registerListeners: false,
  });

  // Other hooks
  const {
    isRecording,
    recordingTime,
    recordedBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useRecording();
  const { selectedFile, handleFileUpload, clearFile } = useFileUpload();

  // Local state
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(
    null,
  );
  const [showViewers, setShowViewers] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [replyingTo, setReplyingTo] = useState<MessageData | null>(null);
  // const [viewingThread, setViewingThread] = useState<MessageData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoized filtered messages
  // const filteredMessages = useMemo(() => {
  //   return messages.filter((msg: MessageData) => {
  //     if (viewingThread) {
  //       return (
  //         msg.parent_id === viewingThread.id || msg.id === viewingThread.id
  //       );
  //     }
  //     return !msg.parent_id;
  //   });
  // }, [messages, viewingThread]);

  useEffect(() => {
    if (recordingError) {
      toast.error(recordingError);
    }
  }, [recordingError]);

  // Scroll to bottom when messages change or room changes
  useEffect(() => {
    if (messagesData && messagesData.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); // Small delay to ensure DOM is updated
    }
  }, [messagesData, room?.id]);

  // Handle file upload before sending message
  const handleFileUploadAndSend = useCallback(
    async (file: File) => {
      try {
        const uploadResult = await uploadFileMutation.mutateAsync(file);
        return uploadResult?.filePath || uploadResult.url;
      } catch (error) {
        console.error("File upload failed:", error);
        return null;
      }
    },
    [uploadFileMutation],
  );

  // Handle voice note upload
  const handleVoiceUploadAndSend = useCallback(
    async (file: File | Blob, duration: number) => {
      try {
        const uploadResult = await uploadVoiceNoteMutation.mutateAsync({
          file,
          duration,
        });
        return uploadResult?.filePath || uploadResult.url;
      } catch (error) {
        console.error("Voice upload failed:", error);
        return null;
      }
    },
    [uploadVoiceNoteMutation],
  );

  // Send message handler
  const handleSendMessage = useCallback(async () => {
    if (messageText.trim() === "" && !selectedFile && !recordedBlob) return;

    let mediaUrl = "";
    let voiceUrl = "";

    // Upload file if selected
    if (selectedFile) {
      if (selectedFile.type.startsWith("audio/")) {
        voiceUrl = (await handleVoiceUploadAndSend(selectedFile, 0)) || "";
      } else {
        mediaUrl = (await handleFileUploadAndSend(selectedFile)) || "";
      }
    }

    // Upload voice note if recorded
    if (recordedBlob) {
      voiceUrl =
        (await handleVoiceUploadAndSend(recordedBlob, recordingTime)) || "";
    }

    const messageData = {
      room_id: room?.id!,
      sender_id: user?.id!,
      message_content: messageText,
      message_type: recordedBlob ? "voice" : selectedFile ? "media" : "text",
      // parent_id: viewingThread?.id,
      replied_to_id: replyingTo?.id,
      media_url: mediaUrl,
      audio_url: voiceUrl,
      duration_seconds: recordedBlob ? recordingTime : undefined,
      repliedToMessage: replyingTo,
    };
    console.log("Sending message:", messageData);
    try {
      // Send via API
      // await sendMessageMutation.mutateAsync(messageData);
      // Also send via socket for real-time updates
      socketSendMessage({
        room_id: room?.id!,
        sender_id: user?.id!,
        message: messageText,
        messageType: messageData.message_type,
        replied_to_id: replyingTo?.id,
        mediaUrl,
        audioUrl: voiceUrl,
        duration: messageData.duration_seconds,
        repliedToMessage: replyingTo || undefined,
      });
      // Clear form
      setMessageText("");
      setReplyingTo(null);
      clearFile();
      clearRecording();
      if (fileInputRef.current) {
        fileInputRef.current.files = null as unknown as FileList;
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [
    messageText,
    selectedFile,
    room?.id,
    user?.id,
    // viewingThread,
    replyingTo,
    sendMessageMutation,
    socketSendMessage,
    handleFileUploadAndSend,
    handleVoiceUploadAndSend,
    clearFile,
  ]);
  const downloadResource = useCallback((url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const handleDeleteMessage = useCallback(
    async (message: MessageData) => {
      try {
        await deleteMessageMutation.mutateAsync(message.id);
        // Also notify via socket
        if (socket) {
          socket.emit("delete_message", {
            messageId: message.id,
            roomId: room?.id,
          });
        }
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    },
    [deleteMessageMutation, socket, room?.id],
  );

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    setMessageText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleReply = useCallback((message: MessageData) => {
    setReplyingTo(message);
    setAnchorEl(null);
  }, []);

  // const handleOpenThread = useCallback((message: MessageData) => {
  //   setViewingThread(message);
  //   setAnchorEl(null);
  // }, []);

  const handleAddReaction = useCallback(
    async (message: MessageData, reaction: string) => {
      const existingReaction = message?.reactions?.find(
        (r: any) => r.user_id === user?.id && r.reaction_type === reaction,
      );

      try {
        if (existingReaction) {
          // If the user already reacted with this emoji, remove it
          await removeReactionMutation.mutateAsync({
            messageId: message.id,
            userId: user?.id!,
          });
        } else {
          // Otherwise add or update to this emoji
          await addReactionMutation.mutateAsync({
            message_id: message.id,
            user_id: user?.id!,
            reaction_type: reaction,
          });
        }
        setShowReactions(false);
      } catch (error) {
        console.error("Failed to handle reaction:", error);
      }
    },
    [addReactionMutation, removeReactionMutation, user?.id],
  );

  const handleRemoveReaction = useCallback(
    async (message: MessageData) => {
      try {
        await removeReactionMutation.mutateAsync({
          messageId: message.id,
          userId: user?.id!,
        });
      } catch (error) {
        console.error("Failed to remove reaction:", error);
      }
    },
    [removeReactionMutation, user?.id],
  );

  const handleMessageSelect = useCallback(
    (message: MessageData, element: HTMLElement) => {
      setSelectedMessage(message);
      setAnchorEl(element);
    },
    [],
  );

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleShowReactions = useCallback((message: MessageData) => {
    setSelectedMessage(message);
    setShowReactions(true);
  }, []);

  const handleShowViewers = useCallback((message: MessageData) => {
    setSelectedMessage(message);
    setShowViewers(true);
  }, []);
  return (
    <div className={classes.chatContainer}>
      {getMessagesLoading ? (
        <LoadingBox />
      ) : (
        <>
          <ChatHeader
            viewingThread={null}
            onCloseThread={() => {}}
            userStatus={room?.status}
            userName={room?.room_name}
            changeTab={(value: string) => setTab(value)}
            tab={tab}
          />
          {tab === "Chat" ? (
            getMessagesError || messagesData?.length === 0 ? (
              <ErrorBox
                message="No Message Found!"
                inlineStyling={{ flex: 1 }}
              />
            ) : (
              <MessagesList
                messages={Array.isArray(messagesData) ? messagesData : []}
                currentUserId={user?.id!}
                onMessageSelect={handleMessageSelect}
                onReply={handleReply}
                onShowReactions={handleShowReactions}
                onRemoveReaction={handleRemoveReaction}
                onShowViewers={handleShowViewers}
                messagesEndRef={messagesEndRef}
              />
            )
          ) : (
            // Resources tab content
            <div className={classes.resourcesContainer}>
              <div className={classes.resourcesHeader}>
                <h3 className={classes.resourcesTitle}>Shared Resources</h3>
                <p className={classes.resourcesDescription}>
                  Administrative documents and files
                </p>
              </div>

              <div className={classes.resourcesList}>
                <ResourceList resources={resources} />
              </div>
            </div>
          )}

          {/* Remove the separate Resources rendering block since it's now included above */}

          <MessageInput
            messageText={messageText}
            setMessageText={setMessageText}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            selectedFile={selectedFile}
            onClearFile={clearFile}
            showEmojiPicker={showEmojiPicker}
            onToggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
            onEmojiClick={handleEmojiClick}
            onFileUpload={handleFileUpload}
            fileInputRef={fileInputRef}
            isRecording={isRecording}
            recordingTime={recordingTime}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />

          <MessageActionsMenu
            anchorEl={anchorEl}
            selectedMessage={selectedMessage}
            onClose={handleCloseMenu}
            onReply={handleReply}
            onShowReactions={() => {
              setShowReactions(true);
              setAnchorEl(null);
            }}
            onOpenThread={() => {}}
            onDelete={handleDeleteMessage}
            currentUserId={user?.id!}
          />

          {showReactions && selectedMessage && (
            <ReactionsPicker
              message={selectedMessage}
              onAddReaction={handleAddReaction}
              onClose={() => setShowReactions(false)}
            />
          )}

          {showViewers && selectedMessage && (
            <MessageViewers
              message={selectedMessage}
              onClose={() => setShowViewers(false)}
            />
          )}

          {/* Connection status indicator */}
          {!isConnected && (
            <div className={classes.connectionStatus}>Reconnecting...</div>
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(Right);
