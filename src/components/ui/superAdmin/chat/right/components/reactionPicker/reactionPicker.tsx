import React from "react";
import { IconButton, Paper, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import classes from "./reactionPicker.module.css";
import { MessageData } from "@/types/chat/messages.types";

interface ReactionsPickerProps {
  message: MessageData;
  onAddReaction: (message: MessageData, reaction: string) => void;
  onClose: () => void;
}

const COMMON_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "👏", "🔥", "💯"];

export const ReactionsPicker: React.FC<ReactionsPickerProps> = React.memo(
  ({ message, onAddReaction, onClose }) => {
    const handleReactionClick = (reaction: string) => {
      onAddReaction(message, reaction);
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
      onAddReaction(message, emojiData.emoji);
    };

    return (
      <div className={classes.overlay}>
        <Paper className={classes.reactionsPickerContainer} elevation={8}>
          {/* Header */}
          <div className={classes.reactionsPickerHeader}>
            <Typography variant="h6" className={classes.title}>
              Add Reaction
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </div>

          {/* Common Reactions */}
          <div className={classes.commonReactions}>
            <Typography variant="subtitle2" className={classes.sectionTitle}>
              Quick Reactions
            </Typography>
            <div className={classes.commonReactionsGrid}>
              {COMMON_REACTIONS.map((reaction) => (
                <button
                  key={reaction}
                  className={classes.reactionButton}
                  onClick={() => handleReactionClick(reaction)}
                  title={`React with ${reaction}`}
                >
                  {reaction}
                </button>
              ))}
            </div>
          </div>

          {/* Emoji Picker */}
          <div className={classes.emojiPickerWrapper}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width="100%"
              height={300}
              previewConfig={{
                showPreview: false,
              }}
            />
          </div>
        </Paper>
      </div>
    );
  }
);

ReactionsPicker.displayName = "ReactionsPicker";
