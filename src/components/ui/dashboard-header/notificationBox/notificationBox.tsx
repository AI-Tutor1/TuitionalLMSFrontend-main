import React, { useCallback, useState, useEffect, useMemo } from "react";
import classes from "./notificationBox.module.css";
import Image from "next/image";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { User_Type } from "@/services/auth/auth.types";
import NotificationsModal from "@/components/global/notifications-modal/notifications-modal";
import {
  markNotificationAsRead,
  getNotificationsForUser,
  markAllNotificationsAsRead,
} from "@/services/dashboard/superAdmin/notifications/notifications";

const PAGE_SIZE = 10;

const NotificationBox: React.FC = () => {
  const { token, user } = useAppSelector((state: any) => state?.user);
  const [notificationsModal, setNotificationsModal] = useState(false);

  const handleNotificationsModalOpen = useCallback(() => {
    setNotificationsModal(true);
  }, []);
  const handleNotificationsModalClose = useCallback(() => {
    setNotificationsModal(false);
  }, []);

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["getAllNotifications", user?.id],
    queryFn: ({ pageParam = 1 }) =>
      getNotificationsForUser(
        user?.id,
        { token },
        { page: pageParam, limit: PAGE_SIZE },
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 300000,
    refetchInterval: 300000,
    enabled: !!token && !!user?.id,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Flatten pages into a single shape the modal expects
  const flattenedData = useMemo(() => {
    if (!data?.pages?.length) return undefined;
    const firstPage = data.pages[0];
    const allNotifications = data.pages.flatMap((p) => p?.data ?? []);
    return {
      ...firstPage,
      data: allNotifications,
      hasUnread: data.pages[data.pages.length - 1]?.hasUnread ?? 0,
    };
  }, [data]);

  const totalCount = data?.pages?.[0]?.totalCount ?? 0;

  const markAllNotifications = useMutation({
    mutationFn: () => markAllNotificationsAsRead(user?.id, { token }),
    onSuccess: () => {
      // toast.success("All notifications marked as read successfully");
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message ??
            axiosError?.response?.data?.error ??
            `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const markOneNotification = useMutation({
    mutationFn: (notificationId: number) =>
      markNotificationAsRead(notificationId, { token }),
    onSuccess: () => {
      // toast.success("Notification marked as read successfully");
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message ??
            axiosError?.response?.data?.error ??
            `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  useEffect(() => {
    if (error) {
      const axiosError = error as MyAxiosError;
      toast.error(
        axiosError?.response?.data?.message ||
          axiosError?.response?.data?.error ||
          `${axiosError?.response?.status} ${axiosError?.response?.statusText}` ||
          "An unexpected error occurred",
      );
    }
  }, [error]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={classes.mainConatiner}>
      <div
        className={classes.notificationsIcon}
        onClick={handleNotificationsModalOpen}
      >
        <Image
          src={"/assets/svgs/notificationIcon.svg"}
          alt={(user as User_Type)?.name || ""}
          width={0}
          height={0}
          style={{ width: "55%", height: "55%" }}
        />
        <div className={classes.number}>
          <p>{totalCount}</p>
        </div>
      </div>
      <NotificationsModal
        modalOpen={notificationsModal}
        handleClose={handleNotificationsModalClose}
        data={flattenedData}
        handleMarkAllNotifications={() => markAllNotifications.mutate()}
        markAllNotificationsLoading={markAllNotifications.isPending}
        markOneNotificationLoading={markOneNotification.isPending}
        handleMarkOneNotification={(notificationId: number) =>
          markOneNotification.mutate(notificationId)
        }
        onLoadMore={handleLoadMore}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isInitialLoading={isLoading}
      />
    </div>
  );
};

export default NotificationBox;
