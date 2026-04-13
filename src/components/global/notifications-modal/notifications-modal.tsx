import React, { memo, useCallback, useRef } from "react";
import Modal from "@mui/material/Modal";
import classes from "./notifications-modal.module.css";
import Image from "next/image";
import { Notification_Types } from "@/types/notifications/notifications.types";
import ErrorBox from "@/components/global/error-box/error-box";
import CloseIcon from "@mui/icons-material/Close";
import { getNotificationsForUser_Response_Types } from "@/types/notifications/notifications.types";
import DottedLoader from "../dotted-loader/dotted-loader";

const notificationPic = "/assets/svgs/notificationPic.svg";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  data?: getNotificationsForUser_Response_Types;
  handleMarkAllNotifications: () => void;
  markAllNotificationsLoading: boolean;
  markOneNotificationLoading: boolean;
  handleMarkOneNotification: (notificationId: number) => void;
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isInitialLoading: boolean;
}

const SCROLL_THRESHOLD = 80; // px from bottom

const NotificationsModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  data,
  handleMarkAllNotifications,
  markAllNotificationsLoading,
  markOneNotificationLoading,
  handleMarkOneNotification,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  isInitialLoading,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = target;
      if (
        scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        onLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore],
  );

  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(8px)" }}
    >
      <div className={classes.mainBox}>
        <div className={classes.headerWrapper}>
          <header className={classes.header}>
            <p>Notifications</p>
            <p>Stay updated with your latest notifications</p>
          </header>
          <CloseIcon
            sx={{
              width: "var(--regular22-) !important",
              height: "var(--regular22-) !important",
              cursor: "pointer",
              "&:hover": { cursor: "pointer", transform: "scale(1.1)" },
            }}
            onClick={handleClose}
          />
        </div>

        <div
          className={classes.section2}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {markAllNotificationsLoading ||
          isInitialLoading ||
          markOneNotificationLoading ? (
            <DottedLoader style={{ height: "100%", width: "100%" }} size={16} />
          ) : data?.data?.length === 0 ? (
            <ErrorBox message="No notifications!" />
          ) : (
            <>
              {data?.data?.map((notification: Notification_Types) => (
                <div
                  key={notification.id}
                  className={`${classes.contentBox} ${
                    !notification.is_read ? classes.unread : ""
                  }`}
                  onClick={
                    notification.is_read
                      ? undefined
                      : () => {
                          handleMarkOneNotification(notification.id);
                        }
                  }
                >
                  <div className={classes.notificationIconBox}>
                    <Image
                      alt="notification icon"
                      src={notificationPic}
                      width={0}
                      height={0}
                      style={{
                        width: "var(--regular16-)",
                        height: "var(--regular16-)",
                      }}
                    />
                  </div>
                  <div className={classes.notificationTextBox}>
                    <p>{notification.message}</p>
                    <p>{notification.created_at}</p>
                  </div>
                  {!notification.is_read && (
                    <div className={classes.redDotWrapper}>
                      <div className={classes.redDot}></div>
                    </div>
                  )}
                </div>
              ))}

              {isFetchingNextPage && (
                <p className={classes.loadingMore}>Loading more...</p>
              )}
            </>
          )}
        </div>
        {data?.hasUnread !== 0 && (
          <div className={classes.markAllRead}>
            <button
              className={classes.markAllReadBtn}
              onClick={handleMarkAllNotifications}
              disabled={markAllNotificationsLoading}
            >
              {markAllNotificationsLoading
                ? "Marking all as read..."
                : "Mark all as read"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default memo(NotificationsModal);
