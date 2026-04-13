import { useState, useCallback } from "react";
import { MessageData } from "@/types/chat/messages.types";

export const useChat = (initialMessages: MessageData[]) => {
  const [messages, setMessages] = useState(initialMessages);
  const [replyingTo, setReplyingTo] = useState<MessageData | null>(null);
  const [viewingThread, setViewingThread] = useState<MessageData | null>(null);

  const addMessage = useCallback((newMessage: MessageData) => {
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const addReaction = useCallback(
    (messageId: number, reaction: string, userId: number) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const existingReactionIndex = msg.reactions.findIndex(
              (r) => r.user.id === userId
            );

            if (existingReactionIndex >= 0) {
              const updatedReactions = [...msg.reactions];
              updatedReactions[existingReactionIndex] = {
                ...updatedReactions[existingReactionIndex],
                reaction_type: reaction,
              };
              return { ...msg, reactions: updatedReactions };
            } else {
              return {
                ...msg,
                reactions: [
                  ...msg.reactions,
                  {
                    id: Math.random(),
                    reaction_type: reaction,
                    user: { id: userId, name: "John Doe" },
                  },
                ],
              };
            }
          }
          return msg;
        })
      );
    },
    []
  );

  return {
    messages,
    addMessage,
    addReaction,
    replyingTo,
    setReplyingTo,
    viewingThread,
    setViewingThread,
  };
};
