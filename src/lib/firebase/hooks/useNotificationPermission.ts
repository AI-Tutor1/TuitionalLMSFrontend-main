"use client";
import { useEffect, useState } from "react";

const useNotificationPermission = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && !("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      setPermission("denied");
      return;
    }

    const handler = () => setPermission(Notification.permission);
    handler();
    if (Notification.permission === "default") {
      Notification.requestPermission().then(handler);
    }
    try {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions
          .query({ name: "notifications" as PermissionName })
          .then((notificationPerm) => {
            notificationPerm.onchange = handler;
          });
      }
    } catch (error) {
      console.error("Error setting up permission watcher:", error);
    }
  }, []);

  return permission;
};

export default useNotificationPermission;
