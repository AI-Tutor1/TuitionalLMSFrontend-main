import React, { FC, useEffect, useRef } from "react";
import classes from "./left.module.css";
import SearchBox from "@/components/global/search-box/search-box";
import Button from "@/components/global/button/button";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { Room } from "@/types/rooms/getRooms.types";
import UserCard from "./userCard/userCard";
import ErrorBox from "@/components/global/error-box/error-box";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { useDeleteRoom } from "@/services/chat-rooms/rooms/rooms";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { toast } from "react-toastify";

interface LeftProps {
  data: Room[];
  loading: boolean;
  error: any;
  room: (item: Room) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onSearch: (value: string) => void;
  searchValue: string;
}

const Left: FC<LeftProps> = ({
  data,
  loading,
  error,
  room,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  onSearch,
  searchValue,
}) => {
  const { token, user } = useAppSelector((state) => state.user);
  const deleteRoomMutation = useDeleteRoom({ token });
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const isAdmin =
    user?.role?.name?.toLowerCase() === "admin" ||
    user?.role?.name?.toLowerCase() === "super admin";

  const handleDelete = async (id: number) => {
    if (!isAdmin) {
      toast.error("You don't have permission to delete this room");
      return;
    }
    try {
      await deleteRoomMutation.mutateAsync(id);
      toast.success("Room deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete room");
    }
  };

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={classes.container}>
      <div className={classes.searchContainer}>
        <SearchBox
          inlineStyles={{ width: "100%" }}
          placeholder="Search any chat"
          value={searchValue}
          changeFn={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className={classes.usersContainer}>
        {loading && data.length === 0 ? (
          <LoadingBox />
        ) : data.length === 0 ? (
          <ErrorBox inlineStyling={{ flex: 1 }} />
        ) : (
          <>
            {data.map((item) => (
              <UserCard
                item={item}
                room={room}
                key={item.id}
                onDelete={isAdmin ? handleDelete : undefined}
              />
            ))}

            <div ref={loadMoreRef} className={classes.loadMoreTrigger}>
              {isFetchingNextPage ? (
                <p className={classes.statusText}>Loading more...</p>
              ) : hasNextPage ? (
                <p className={classes.statusText}>Scroll for more</p>
              ) : (
                <p className={classes.statusText}>No more chats</p>
              )}
            </div>
          </>
        )}
      </div>
      <div className={classes.newChatContainer}>
        <Button
          text={"Start New Chat"}
          inlineStyling={{ width: "100%" }}
          icon={<AddOutlinedIcon />}
        />
      </div>
    </div>
  );
};

export default Left;
