import React, { useMemo } from "react";
import { MessageItem } from "./component/messageItem";
import classes from "./messageList.module.css";
import { MessageData } from "@/types/chat/messages.types";

interface MessagesListProps {
  messages: MessageData[];
  currentUserId: number;
  onMessageSelect: (message: MessageData, element: HTMLElement) => void;
  onReply: (message: MessageData) => void;
  // onOpenThread: (message: MessageData) => void;
  onShowReactions: (message: MessageData) => void;
  onRemoveReaction: (message: MessageData) => void;
  onShowViewers: (message: MessageData) => void;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}
export const MessagesList: React.FC<MessagesListProps> = React.memo(
  ({
    messages,
    currentUserId,
    onMessageSelect,
    onReply,
    // onOpenThread,
    onShowReactions,
    onRemoveReaction,
    onShowViewers,
    messagesEndRef,
  }) => {
    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

    return (
      <div className={classes.messagesContainer}>
        {reversedMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            onMessageSelect={onMessageSelect}
            onReply={onReply}
            // onOpenThread={onOpenThread}
            onShowReactions={onShowReactions}
            onRemoveReaction={onRemoveReaction}
            onShowViewers={onShowViewers}
          />
        ))}
      </div>
    );
  }
);

MessagesList.displayName = "MessagesList";
