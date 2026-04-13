"use client";
import React, { FC, useEffect, useState } from "react";
import classes from "./chat.module.css";
import Left from "@/components/ui/superAdmin/chat/left/left";
import Right from "@/components/ui/superAdmin/chat/right/right";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getRooms } from "@/services/chat-rooms/rooms/rooms";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { MyAxiosError } from "@/services/error.type";
import { EmptyState } from "@/components/ui/superAdmin/chat/right/components/emptyState/emptyState";
import { Room } from "@/types/rooms/getRooms.types";
import { chatKeys } from "@/services/chat/chat.hooks";
import { useSocket } from "@/utils/hooks/useSocket";

const Chat: FC = () => {
  const { token, user } = useAppSelector((state) => state.user);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useSocket({
    userId: user?.id!,
    token: token!,
    enabled: !!user?.id && !!token,
  });

  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      ...(user?.role.name === "Super Admin"
        ? chatKeys.rooms()
        : chatKeys.roomsForUser(user?.id!)),
      debouncedSearch,
    ],
    queryFn: ({ pageParam = 0 }) =>
      getRooms(
        {
          userId: user?.role.name === "Super Admin" ? undefined : user?.id,
          limit: 50,
          offset: pageParam,
          search: debouncedSearch,
        },
        { token },
      ),
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      if (lastPage.length < 50) return undefined;
      return allPages.flat().length;
    },
    initialPageParam: 0,
    staleTime: 60000,
    enabled: !!token,
  });

  const roomsData = data?.pages.flat() || [];

  useEffect(() => {
    if (error) {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error(axiosError.message);
      }
    }
  }, [error]);

  const room = (item: Room) => {
    setSelectedRoom(item);
    return;
  };

  return (
    <main className={classes.main}>
      <Left
        data={roomsData}
        loading={isLoading}
        error={error}
        room={room}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onSearch={setSearch}
        searchValue={search}
      />
      {selectedRoom === null ? <EmptyState /> : <Right room={selectedRoom} />}
    </main>
  );
};

export default Chat;
