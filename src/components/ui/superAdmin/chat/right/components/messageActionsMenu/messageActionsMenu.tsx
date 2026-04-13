import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import ForumIcon from "@mui/icons-material/Forum";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { MessageData } from "@/types/chat/messages.types";

interface MessageActionsMenuProps {
  anchorEl: HTMLElement | null;
  selectedMessage: MessageData | null;
  onClose: () => void;
  onReply: (message: MessageData) => void;
  onShowReactions: () => void;
  onOpenThread: (message: MessageData) => void;
  onDelete: (message: MessageData) => void;
  currentUserId: number;
}

export const MessageActionsMenu: React.FC<MessageActionsMenuProps> = React.memo(
  ({
    anchorEl,
    selectedMessage,
    onClose,
    onReply,
    onShowReactions,
    onOpenThread,
    onDelete,
    currentUserId,
  }) => {
    if (!selectedMessage) return null;

    const handleCopyMessage = () => {
      navigator.clipboard.writeText(selectedMessage.message_content);
      onClose();
    };

    const handleEditMessage = () => {
      // TODO: Implement edit functionality
      console.log("Edit message:", selectedMessage.id);
      onClose();
    };

    const handleDeleteMessage = () => {
      if (selectedMessage) {
        onDelete(selectedMessage);
      }
      onClose();
    };

    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            minWidth: 180,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px",
          },
        }}
      >
        <MenuItem onClick={() => onReply(selectedMessage)}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reply</ListItemText>
        </MenuItem>

        <MenuItem onClick={onShowReactions}>
          <ListItemIcon>
            <InsertEmoticonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Reaction</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => onOpenThread(selectedMessage)}>
          <ListItemIcon>
            <ForumIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open Thread</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleCopyMessage}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Text</ListItemText>
        </MenuItem>

        {selectedMessage.sender_id === currentUserId && (
          <div>
            <MenuItem onClick={handleEditMessage}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleDeleteMessage}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
            </MenuItem>
          </div>
        )}
      </Menu>
    );
  },
);

MessageActionsMenu.displayName = "MessageActionsMenu";
