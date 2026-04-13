import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MicIcon from "@mui/icons-material/Mic";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import CloseIcon from "@mui/icons-material/Close";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import classes from "./messageInput.module.css";
import { MessageData } from "@/types/chat/messages.types";

interface MessageInputProps {
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  replyingTo: MessageData | null;
  onCancelReply: () => void;
  selectedFile: File | null;
  onClearFile: () => void;
  showEmojiPicker: boolean;
  onToggleEmojiPicker: () => void;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = React.memo(
  ({
    messageText,
    setMessageText,
    onSendMessage,
    onKeyPress,
    replyingTo,
    onCancelReply,
    selectedFile,
    onClearFile,
    showEmojiPicker,
    onToggleEmojiPicker,
    onEmojiClick,
    onFileUpload,
    fileInputRef,
    isRecording,
    recordingTime,
    onStartRecording,
    onStopRecording,
  }) => {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
      <div className={classes.inputContainer}>
        {/* Reply Preview */}
        {replyingTo && (
          <div className={classes.replyingToContainer}>
            <div className={classes.replyingToContent}>
              <span className={classes.replyingToSender}>
                Replying to {replyingTo.sender.name}
              </span>
              <p className={classes.replyingToText}>
                {replyingTo.message_content}
              </p>
              {replyingTo.media_url && (
                <div className={classes.replyingToMedia}>
                  <img
                    src={replyingTo.media_url}
                    alt="Media"
                    className={classes.replyingToImage}
                  />
                </div>
              )}
            </div>
            <IconButton
              size="small"
              onClick={onCancelReply}
              className={classes.closeButton}
            >
              <CloseIcon
                sx={{ height: "var(--regular18-)", width: "var(--regular18-)" }}
              />
            </IconButton>
          </div>
        )}

        {/* File Preview */}
        {selectedFile && (
          <div className={classes.selectedFileContainer}>
            <div className={classes.selectedFileContent}>
              <span className={classes.fileName}>{selectedFile.name}</span>
              <p className={classes.fileSize}>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <IconButton
              size="small"
              onClick={onClearFile}
              className={classes.closeButton}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        )}

        {/* Main Input Area */}
        <div className={classes.inputWrapper}>
          {/* Emoji Picker Button */}
          <Tooltip title="Add emoji">
            <IconButton
              onClick={onToggleEmojiPicker}
              className={classes.inputButton}
            >
              <InsertEmoticonIcon
                style={{
                  height: "var(--regular22-)",
                  width: "var(--regular22-)",
                }}
              />
            </IconButton>
          </Tooltip>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className={classes.emojiPickerContainer}>
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                style={{
                  height: "var(--regular16-)",
                  width: "var(--regular16-)",
                }}
              />
            </div>
          )}

          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={onFileUpload}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />

          {/* File Upload Button */}
          <Tooltip title="Attach file">
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              className={classes.inputButton}
            >
              <AttachFileIcon
                style={{
                  height: "var(--regular22-)",
                  width: "var(--regular22-)",
                }}
              />
            </IconButton>
          </Tooltip>

          {/* Recording Section */}
          {isRecording ? (
            <div className={classes.recordingContainer}>
              <div className={classes.recordingIndicator} />
              <span className={classes.recordingTime}>
                {formatTime(recordingTime)}
              </span>
              <Tooltip title="Stop recording">
                <IconButton
                  onClick={onStopRecording}
                  className={classes.inputButton}
                >
                  <CloseIcon
                    style={{
                      height: "var(--regular22-)",
                      width: "var(--regular22-)",
                    }}
                  />
                </IconButton>
              </Tooltip>
            </div>
          ) : (
            <Tooltip title="Voice message">
              <IconButton
                onClick={onStartRecording}
                className={classes.inputButton}
              >
                <MicIcon
                  style={{
                    height: "var(--regular22-)",
                    width: "var(--regular22-)",
                  }}
                />
              </IconButton>
            </Tooltip>
          )}

          {/* Text Input */}
          <textarea
            className={classes.messageInput}
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={onKeyPress}
            disabled={isRecording}
            rows={1}
          />

          {/* Send Button */}
          <Tooltip title="Send message">
            <IconButton
              onClick={onSendMessage}
              disabled={
                isRecording || (messageText.trim() === "" && !selectedFile)
              }
              className={`${classes.sendButton} ${
                messageText.trim() !== "" || selectedFile
                  ? classes.sendButtonActive
                  : ""
              }`}
            >
              <SendIcon
                style={{
                  height: "var(--regular22-)",
                  width: "var(--regular22-)",
                }}
              />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    );
  },
);

MessageInput.displayName = "MessageInput";
