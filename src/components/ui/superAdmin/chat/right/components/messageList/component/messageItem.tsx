import React, { useCallback } from "react";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import Image from "next/image";
import ReplyIcon from "@mui/icons-material/Reply";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import ForumIcon from "@mui/icons-material/Forum";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import { Modal, Box } from "@mui/material";
import classes from "./messageItem.module.css";
import { MessageData } from "@/types/chat/messages.types";
import { useState } from "react";
import { VoicePlayer } from "../../voicePlayer/voicePlayer";
import { sanitizeHTML } from "@/utils/helpers/sanitize-html";

interface MessageItemProps {
  message: MessageData;
  currentUserId: number;
  onMessageSelect: (message: MessageData, element: HTMLElement) => void;
  onReply: (message: MessageData) => void;
  onShowReactions: (message: MessageData) => void;
  onRemoveReaction: (message: MessageData) => void;
  onShowViewers: (message: MessageData) => void;
}

const linkifyHTML = (html: string) => {
  if (!html) return "";

  // 1. Temporarily extract existing HTML tags to avoid linkifying their attributes or content
  const tags: string[] = [];
  let tagCount = 0;
  const withPlaceholders = html.replace(/<[^>]+>/g, (tag) => {
    tags.push(tag);
    return `___TAG_PH_${tagCount++}___`;
  });

  // 2. Robust URL regex for linkification
  const urlRegex = /((?:https?:\/\/|www\.)[^\s<]+)/gi;

  const linkified = withPlaceholders.replace(urlRegex, (url) => {
    const href = url.toLowerCase().startsWith("www.") ? `http://${url}` : url;
    // Note: onclick is used for native event propagation control in raw HTML
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="${classes.messageLink}" onclick="event.stopPropagation()">${url}</a>`;
  });

  // 3. Restore original HTML tags
  return linkified.replace(/___TAG_PH_(\d+)___/g, (_, i) => tags[parseInt(i)]);
};

function renderMedia(
  url: string,
  onOpen: (url: string) => void,
  className?: string,
  size: { width?: number; height?: number } = {},
) {
  // Extract file extension
  const ext = url.split(".").pop()?.split("?")[0]?.toLowerCase() || "";
  const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen(url);
  };

  if (isImage) {
    return (
      <div
        onClick={handleOpen}
        style={{ cursor: "pointer" }}
        className={className}
      >
        <Image
          src={url}
          alt="Media"
          width={size.width || 200}
          height={size.height || 150}
          style={{ objectFit: "cover", borderRadius: "8px" }}
        />
      </div>
    );
  }

  // Default: show file icon for non-image formats
  return (
    <div onClick={handleOpen} className={classes.fileLink}>
      <InsertDriveFileIcon />
      <span>{url.split("/").pop() || "View File"}</span>
    </div>
  );
}

export const MessageItem: React.FC<MessageItemProps> = React.memo(
  ({
    message,
    currentUserId,
    onMessageSelect,
    onReply,
    onShowReactions,
    onRemoveReaction,
    onShowViewers,
  }) => {
    const isOwnMessage = message?.sender_id === currentUserId;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalUrl, setModalUrl] = useState("");

    const handleOpenModal = useCallback((url: string) => {
      setModalUrl(url);
      setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
      setIsModalOpen(false);
    }, []);

    const handleMessageClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        onMessageSelect(message, element);
      },
      [message, onMessageSelect],
    );

    const handleReply = useCallback(() => {
      onReply(message);
    }, [message, onReply]);

    const handleShowReactions = useCallback(() => {
      onShowReactions(message);
    }, [message, onShowReactions]);

    const handleShowViewers = useCallback(() => {
      onShowViewers(message);
    }, [message, onShowViewers]);

    const handleReactionClick = useCallback(
      (reactionUserId: number) => {
        if (reactionUserId === currentUserId) {
          onRemoveReaction(message);
        }
      },
      [currentUserId, message, onRemoveReaction],
    );

    const formatTime = (dateString: string) => {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <div
        className={`${classes.messageWrapper} ${
          isOwnMessage ? classes.ownMessage : ""
        }`}
      >
        {!isOwnMessage && (
          <Avatar
            src={message.sender.profileImageUrl}
            alt={message.sender.name}
            className={classes.messageAvatar}
          />
        )}

        <div className={classes.messageContent}>
          {/* Replied Message Display */}
          {message.repliedToMessage && (
            <div className={classes.repliedMessage}>
              <div className={classes.repliedMessageContent}>
                <span className={classes.repliedMessageSender}>
                  {message.repliedToMessage.sender?.name || "Unknown"}
                </span>
                <p
                  className={classes.repliedMessageText}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(
                      linkifyHTML(
                        message.repliedToMessage.message_content || "",
                      ),
                    ),
                  }}
                ></p>
                {message.repliedToMessage.media_url && (
                  <div className={classes.repliedMessageMedia}>
                    {renderMedia(
                      message.repliedToMessage.media_url,
                      handleOpenModal,
                      classes.mediaImage,
                      { width: 50, height: 50 },
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Message Bubble */}
          <div
            className={`${classes.messageBubble} ${
              isOwnMessage ? classes.ownBubble : ""
            }`}
            onClick={handleMessageClick}
            id={`msg-${message.id}`}
          >
            <div className={classes.messageHeader}>
              {!isOwnMessage && (
                <span className={classes.messageSender}>
                  {message.sender.name}
                </span>
              )}
              <span className={classes.messageTime}>
                {formatTime(message.createdAt)}
              </span>
            </div>

            <div
              className={classes.messageText}
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(linkifyHTML(message.message_content)),
              }}
            ></div>

            {/* Media Display */}
            {message.media_url && (
              <div className={classes.messageMedia}>
                {renderMedia(
                  message.media_url,
                  handleOpenModal,
                  classes.mediaImage,
                )}
              </div>
            )}

            {/* Voice Note Display */}
            {message.message_type === "voice" && message.audio_url && (
              <VoicePlayer
                url={message.audio_url}
                duration={message.duration_seconds}
                isOwnMessage={isOwnMessage}
              />
            )}

            {/* Reactions Display */}
            {message?.reactions?.length > 0 && (
              <div className={classes.reactionsContainer}>
                {message.reactions.map((reaction: any, index) => (
                  <Tooltip
                    key={index}
                    title={`${reaction.user.name}: ${reaction.reaction_type}`}
                  >
                    <span
                      className={`${classes.reaction} ${
                        reaction?.user_id === currentUserId
                          ? classes.ownReaction
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReactionClick(reaction.user_id);
                      }}
                    >
                      {reaction.reaction_type}
                    </span>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>

          {/* Message Actions */}
          <div className={classes.messageActions}>
            <Tooltip title="Add reaction">
              <IconButton
                size="small"
                onClick={handleShowReactions}
                className={classes.actionButton}
              >
                <InsertEmoticonIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Reply">
              <IconButton
                size="small"
                onClick={handleReply}
                className={classes.actionButton}
              >
                <ReplyIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* <Tooltip title="Open thread">
              <IconButton
                size="small"
                onClick={handleOpenThread}
                className={classes.actionButton}
              >
                <ForumIcon fontSize="small" />
              </IconButton>
            </Tooltip> */}

            <Tooltip title="View readers">
              <IconButton
                size="small"
                onClick={handleShowViewers}
                className={classes.actionButton}
              >
                <VisibilityIcon fontSize="small" />
                {message?.views?.length > 0 && (
                  <span className={classes.viewCount}>
                    {message.views.length}
                  </span>
                )}
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Media Modal */}
        <Modal
          open={isModalOpen}
          onClose={handleCloseModal}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(5px)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              maxWidth: "100vw",
              maxHeight: "100vh",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 1,
              borderRadius: 2,
              outline: "none",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "white",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                zIndex: 1,
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {modalUrl.split(".").pop()?.split("?")[0]?.toLowerCase() &&
            ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
              modalUrl.split(".").pop()?.split("?")[0]?.toLowerCase() || "",
            ) ? (
              <img
                src={modalUrl}
                alt="Full View"
                style={{
                  maxWidth: "100%",
                  maxHeight: "calc(90vh - 20px)",
                  objectFit: "contain",
                }}
              />
            ) : (
              <iframe
                src={modalUrl}
                title="File Viewer"
                style={{
                  width: "100vw",
                  height: "100vh",
                  border: "none",
                }}
              />
            )}
          </Box>
        </Modal>
      </div>
    );
  },
);

MessageItem.displayName = "MessageItem";
