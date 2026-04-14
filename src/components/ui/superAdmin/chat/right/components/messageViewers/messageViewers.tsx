import React from "react";
import {
  Avatar,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import classes from "./messageViewers.module.css";
import { MessageData } from "@/types/chat/messages.types";

interface MessageViewersProps {
  message: MessageData;
  onClose: () => void;
}

export const MessageViewers: React.FC<MessageViewersProps> = React.memo(
  ({ message, onClose }) => {
    const formatViewTime = (timestamp?: string) => {
      if (!timestamp) return "Just now";
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <div className={classes.overlay}>
        <Paper className={classes.viewersContainer} elevation={8}>
          {/* Header */}
          <div className={classes.viewersHeader}>
            <Typography variant="h6" className={classes.title}>
              Seen by {message.views.length}{" "}
              {message.views.length === 1 ? "person" : "people"}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </div>

          {/* Viewers List */}
          <div className={classes.viewersContent}>
            {message.views.length > 0 ? (
              <List className={classes.viewersList}>
                {message.views.map((view) => (
                  <ListItem key={view.id} className={classes.viewerItem}>
                    <ListItemAvatar>
                      <Avatar
                        src={
                          view.user.profileImageUrl ||
                          "/assets/images/dummyPic.png"
                        }
                        alt={view.user.name}
                        className={classes.viewerAvatar}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          className={classes.viewerName}
                        >
                          {view.user.name}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          className={classes.viewTime}
                        >
                          Seen at {formatViewTime()}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <div className={classes.noViewers}>
                <Typography variant="body1" color="textSecondary">
                  No one has seen this message yet
                </Typography>
              </div>
            )}
          </div>
        </Paper>
      </div>
    );
  }
);

MessageViewers.displayName = "MessageViewers";
