import React from "react";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import classes from "./chatHeader.module.css";
import { MessageData } from "@/types/chat/messages.types";
import Tabs from "@/components/global/tabs/tabs";

interface ChatHeaderProps {
  viewingThread: MessageData | null;
  onCloseThread: () => void;
  onMenuClick?: () => void;
  userName?: string;
  userAvatar?: string;
  userStatus?: boolean;
  changeTab?: (tab: string) => void;
  tab?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = React.memo(
  ({
    viewingThread,
    onCloseThread,
    onMenuClick,
    userName,
    userAvatar,
    userStatus,
    changeTab,
    tab,
  }) => {
    // Safe handlers
    const handleCloseThread = () => {
      if (onCloseThread) {
        onCloseThread();
      }
    };

    const handleMenuClick = () => {
      if (onMenuClick) {
        onMenuClick();
      }
    };

    return (
      <div className={classes.chatHeader}>
        <div>
          <div className={classes.chatHeaderLeft}>
            {viewingThread ? (
              <>
                <Tooltip title="Close thread">
                  <IconButton
                    onClick={handleCloseThread}
                    aria-label="Close thread"
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
                <div className={classes.threadInfo}>
                  <span className={classes.threadLabel}>Thread</span>
                  {viewingThread.sender?.name && (
                    <span className={classes.threadSubtitle}>
                      Started by {viewingThread.sender.name}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <Avatar
                  src={userAvatar}
                  alt={userName}
                  className={classes.avatar}
                />
                <h3 className={classes.userName}>{userName}</h3>
              </>
            )}
            <div className={classes.chatHeaderRight}>
              <Tooltip title="More options">
                <IconButton onClick={handleMenuClick} aria-label="More options">
                  <MoreVertIcon sx={{ height: "3vh" }} />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
        <Tabs
          tabsArray={["Chat", "Resources "]}
          handleTabChange={(value) => {
            changeTab && changeTab(value);
          }}
          activeTab={tab || "Chat"}
          inlineTabsStyles={{
            width: "max-content",
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
          activeBackgroundColor="transparent"
          border="1px solid var(--main-color)"
          borderRadius="0px"
          activeButtonColor="var(--main-color)"
        />
      </div>
    );
  }
);

ChatHeader.displayName = "ChatHeader";
