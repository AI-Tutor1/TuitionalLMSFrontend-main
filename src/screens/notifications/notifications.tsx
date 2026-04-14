"use client";

import { useState, useMemo, useEffect } from "react";
import classes from "./notifications.module.css";
import { IconButton } from "@mui/material";
import {
  Archive as ArchiveIcon,
  Notifications as BellIcon,
  ChatBubbleOutline as MessageSquareIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as EyeIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import SearchBox from "@/components/global/search-box/search-box";
import Button from "@/components/global/button/button";
import Tabs from "@/components/global/tabs/tabs";
import moment from "moment";
import StatCard from "@/components/ui/teacher/dashboard-card/dashboard-card";
import ErrorBox from "@/components/global/error-box/error-box";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { useQuery } from "@tanstack/react-query";
import { getNotificationsForUser } from "@/services/dashboard/superAdmin/notifications/notifications";
import { useAppSelector } from "@/lib/store/hooks/hooks";

// Types
interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationResponse {
  success: boolean;
  message: string;
  data: Notification[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "assignment":
      return <MessageSquareIcon sx={{ fontSize: 20 }} />;
    case "system":
      return <SettingsIcon sx={{ fontSize: 20 }} />;
    case "submission":
      return <CheckCircleIcon sx={{ fontSize: 20 }} />;
    case "report":
      return <InfoIcon sx={{ fontSize: 20 }} />;
    case "feature":
      return <BellIcon sx={{ fontSize: 20 }} />;
    default:
      return <BellIcon sx={{ fontSize: 20 }} />;
  }
};

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case "assignment":
      return classes.typeAssignment;
    case "system":
      return classes.typeSystem;
    case "submission":
      return classes.typeSubmission;
    case "report":
      return classes.typeReport;
    case "feature":
      return classes.typeFeature;
    default:
      return classes.typeDefault;
  }
};

const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case "high":
      return classes.priorityHigh;
    case "medium":
      return classes.priorityMedium;
    case "low":
      return classes.priorityLow;
    default:
      return classes.priorityDefault;
  }
};

export default function NotificationsPage() {
  const { token, user } = useAppSelector((state) => state?.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<boolean>(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    number | null
  >(null);

  const { data, error, isLoading, refetch } = useQuery<NotificationResponse>({
    queryKey: ["getNotificationsForUser", user?.id],
    queryFn: () =>
      getNotificationsForUser(
        user?.id || null,
        {
          token,
        },
        { page: 1, limit: 10 },
      ),
    staleTime: 30000,
    enabled: !!token && !!user?.id,
    refetchOnWindowFocus: false,
  });

  // Update notifications state when data is fetched
  useEffect(() => {
    if (data?.success && data?.data) {
      setNotifications(data.data);
    }
  }, [data]);

  // Filter notifications based on active tab and search query
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab === "Unread") {
      filtered = filtered.filter((n) => !n.is_read);
    } else if (activeTab === "Read") {
      filtered = filtered.filter((n) => n.is_read);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [notifications, activeTab, searchQuery]);

  // Calculate stats
  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount = notifications.filter((n) => n.is_read).length;

  // Handlers
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    // TODO: Call API to mark all as read
    // Example: await markAllNotificationsAsRead(user?.id, { token });
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    handleCloseMenu();
    // TODO: Call API to mark as read
    // Example: await markNotificationAsRead(id, { token });
  };

  const archiveNotification = (id: number) => {
    // TODO: Implement archive logic with API call
    console.log("Archive notification:", id);
    handleCloseMenu();
    // Example: await archiveNotification(id, { token });
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    handleCloseMenu();
    // TODO: Call API to delete notification
    // Example: await deleteNotification(id, { token });
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: number) => {
    event.stopPropagation();
    setAnchorEl(true);
    setSelectedNotificationId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(false);
    setSelectedNotificationId(null);
  };

  const formatTimestamp = (timestamp: string) => {
    return moment(timestamp).fromNow();
  };

  return (
    <div className={classes.container}>
      {/* Search and Actions */}
      <div className={classes.searchActionsContainer}>
        <SearchBox
          placeholder="Search notifications..."
          value={searchQuery}
          changeFn={(e) => setSearchQuery(e.target.value)}
          inlineStyles={{ flex: 1 }}
        />
        {/* {unreadCount > 0 && ( */}
        <Button text="Mark all as read" clickFn={markAllAsRead} />
        {/* )} */}
      </div>

      {/* Notification Stats */}
      <div className={classes.statsGrid}>
        <StatCard
          text={`All Notifications (${totalCount})`}
          inlineStyling={{ minWidth: "250px", flex: 1 }}
        />
        <StatCard
          text={`Read (${readCount})`}
          inlineStyling={{ minWidth: "250px", flex: 1 }}
        />
        <StatCard
          text={`Unread (${unreadCount})`}
          inlineStyling={{ minWidth: "250px", flex: 1 }}
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabsArray={["All", "Unread", "Read"]}
        activeTab={activeTab}
        handleTabChange={setActiveTab}
        inlineTabsStyles={{ width: "max-content", alignSelf: "flex-end" }}
      />

      {/* Notifications List */}
      <div className={classes.notificationsList}>
        {isLoading ? (
          <LoadingBox />
        ) : filteredNotifications.length === 0 || error ? (
          <ErrorBox
            message={
              activeTab === "All"
                ? "No notifications yet!"
                : `No ${activeTab.toLowerCase()} notifications!`
            }
          />
        ) : (
          filteredNotifications?.map((notification) => (
            <div
              onClick={() => handleCloseMenu()}
              key={notification.id}
              className={`${classes.notificationCard} ${
                !notification.is_read ? classes.notificationCardUnread : ""
              }`}
            >
              {/* Icon */}
              <div
                className={`${classes.iconBox} ${getTypeBadgeClass("default")}`}
              >
                {getTypeIcon("feature")}
              </div>

              {/* Content */}
              <div className={classes.contentWrapper}>
                <p className={classes.notificationTitle}>
                  {notification.title}
                </p>
                <p className={classes.notificationMessage}>
                  {notification.message}
                </p>
                <div className={classes.notificationMeta}>
                  {notification.link && (
                    <a
                      href={notification.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.notificationLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details
                    </a>
                  )}
                  <span className={classes.timestamp}>
                    <AccessTimeIcon className={classes.clockIcon} />
                    {formatTimestamp(notification.created_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className={classes.actionsWrapper}>
                <IconButton
                  onClick={(e) => handleOpenMenu(e, notification.id)}
                  size="small"
                >
                  <MoreVertIcon />
                </IconButton>
                {Boolean(anchorEl) &&
                  selectedNotificationId === notification.id && (
                    <div className={classes.menu}>
                      {!notification.is_read && (
                        <div
                          className={classes.menuItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(selectedNotificationId);
                          }}
                        >
                          <EyeIcon className={classes.menuIcon} />
                          Mark as read
                        </div>
                      )}
                      <div
                        className={classes.menuItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveNotification(selectedNotificationId!);
                        }}
                      >
                        <ArchiveIcon className={classes.menuIcon} />
                        Archive
                      </div>
                      <div
                        className={`${classes.menuItem} ${classes.deleteMenuItem}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(selectedNotificationId!);
                        }}
                      >
                        <DeleteIcon className={classes.menuIcon} />
                        Delete
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
