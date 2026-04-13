"use client";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import classes from "./calendar-integration.module.css";
import { BASE_URL } from "@/services/config";

interface CalendarIntegrationProps {
  userId: number;
  onStatusChange?: (enabled: boolean) => void;
}

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  userId,
  onStatusChange,
}) => {
  const { token, user } = useAppSelector((state) => state.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);

  // Get calendar integration status
  const {
    data: calendarStatus,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["calendarStatus", userId],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_URL}/api/calendar/status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch calendar status");
      }
      return response.json();
    },
    enabled: !!token && !!userId,
  });

  // Check for OAuth callback parameters
  useEffect(() => {
    const calendarConnected = searchParams?.get("calendar_connected");
    const calendarError = searchParams?.get("calendar_error");

    if (calendarConnected === "true") {
      toast.success("Google Calendar connected successfully!");
      onStatusChange?.(true);
      refetch();
      // Clean up URL parameters
      router.replace(`/${user?.role.name}/profile`, { scroll: false });
    } else if (calendarError === "true") {
      toast.error("Failed to connect Google Calendar. Please try again.");
      // Clean up URL parameters
      router.replace(`/${user?.role.name}/profile`, { scroll: false });
    }
  }, [searchParams, onStatusChange, router, refetch]);

  // Connect Google Calendar mutation
  const connectCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${BASE_URL}/api/calendar/auth-url?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to get auth URL");
      }
      const data = await response.json();
      return data.authUrl;
    },
    onSuccess: (authUrl) => {
      setIsConnecting(true);
      // Redirect to Google OAuth in same window
      window.location.href = authUrl;
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      toast.error(axiosError?.message || "Failed to connect Google Calendar");
    },
  });

  // Disconnect Calendar mutation
  const disconnectCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${BASE_URL}/api/calendar/disconnect/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to disconnect calendar");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Calendar integration disconnected successfully");
      refetch();
      onStatusChange?.(false);
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      toast.error(
        axiosError?.message || "Failed to disconnect Google Calendar",
      );
    },
  });

  // Sync existing classes mutation
  const syncClassesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${BASE_URL}/api/calendar/sync/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to sync classes");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Classes synced successfully");
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      toast.error(axiosError?.message || "Failed to sync classes");
    },
  });

  // Listen for OAuth completion (you might need to implement a message listener)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== BASE_URL) return;

      if (event.data?.type === "CALENDAR_CONNECTED") {
        setIsConnecting(false);
        toast.success("Google Calendar connected successfully!");
        refetch();
        onStatusChange?.(true);
      }
    };

    if (isConnecting) {
      window.addEventListener("message", handleMessage);

      // Auto-check status after 5 seconds (fallback)
      const timeout = setTimeout(() => {
        setIsConnecting(false);
        refetch();
      }, 5000);

      return () => {
        window.removeEventListener("message", handleMessage);
        clearTimeout(timeout);
      };
    }
  }, [isConnecting, refetch, onStatusChange]);

  if (isLoading) {
    return (
      <div className={classes.container}>
        <div className={classes.loadingSpinner}>Loading...</div>
      </div>
    );
  }

  const isConnected = calendarStatus?.calendarEnabled;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.titleRow}>
          <Image
            src="/assets/svgs/calendar.svg"
            alt="Calendar"
            width={24}
            height={24}
          />
          <h3>Google Calendar Integration</h3>
        </div>
        <div className={classes.statusBadge}>
          <span
            className={`${classes.statusIndicator} ${
              isConnected ? classes.connected : classes.disconnected
            }`}
          ></span>
          {isConnected ? "Connected" : "Not Connected"}
        </div>
      </div>

      <div className={classes.content}>
        <p className={classes.description}>
          {isConnected
            ? "Your teaching schedule is automatically synced to your Google Calendar. Weekly recurring events are created for all your classes."
            : "Connect your Google Calendar to automatically sync your teaching schedule. This will create weekly recurring events for all your classes."}
        </p>

        {isConnected && calendarStatus?.connectedAt && (
          <p className={classes.connectedDate}>
            <span>Connected on:</span>{" "}
            {new Date(calendarStatus.connectedAt).toLocaleDateString()}
          </p>
        )}

        <div className={classes.actions}>
          {!isConnected ? (
            <button
              className={`${classes.button} ${classes.connectButton}`}
              onClick={() => connectCalendarMutation.mutate()}
              disabled={connectCalendarMutation.isPending || isConnecting}
            >
              {isConnecting
                ? "Connecting..."
                : connectCalendarMutation.isPending
                  ? "Getting Auth URL..."
                  : "Connect Google Calendar"}
            </button>
          ) : (
            <div className={classes.connectedActions}>
              <button
                className={`${classes.button} ${classes.syncButton}`}
                onClick={() => syncClassesMutation.mutate()}
                disabled={syncClassesMutation.isPending}
              >
                {syncClassesMutation.isPending
                  ? "Syncing..."
                  : "Sync Existing Classes"}
              </button>
              <button
                className={`${classes.button} ${classes.disconnectButton}`}
                onClick={() => disconnectCalendarMutation.mutate()}
                disabled={disconnectCalendarMutation.isPending}
              >
                {disconnectCalendarMutation.isPending
                  ? "Disconnecting..."
                  : "Disconnect"}
              </button>
            </div>
          )}
        </div>

        {isConnected && (
          <div className={classes.features}>
            <h4>Features:</h4>
            <ul>
              <li>
                ✅ Automatic weekly recurring events for all scheduled classes
              </li>
              <li>
                ✅ Meet links added to calendar events before class starts
              </li>
              <li>✅ Student names and subject details included</li>
              <li>✅ Email and popup reminders (15 min before class)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarIntegration;
