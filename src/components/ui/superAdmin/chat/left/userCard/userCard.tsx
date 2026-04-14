import React, { FC } from "react";
import classes from "./userCard.module.css";
import Image from "next/image";
import { Room } from "@/types/rooms/getRooms.types";
import moment from "moment";
import { Paperclip, Image as ImageIcon, FileText, Trash2 } from "lucide-react";

interface UserCardProps {
  item: Room;
  room: (item: Room) => void;
  onDelete?: (id: number) => void;
}

const UserCard: FC<UserCardProps> = ({ item, room, onDelete }) => {
  return (
    <div
      className={classes.container}
      onClick={() => {
        if (item) {
          room(item);
        }
      }}
    >
      <span className={classes.imageBox}>
        <Image
          src={"/assets/images/dummyPic.png"}
          alt={"User"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </span>
      <div className={classes.contentBox}>
        <div>
          <p>
            {item?.room_name.split("|")[0].split("-")[0] +
              "|" +
              item?.room_name.split("|")[item?.room_name.split("|").length - 1]}
          </p>
          <p>
            {(() => {
              const date = item?.lastMessage?.createdAt;
              if (!date) return "";
              const momentDate = moment.utc(date);
              return momentDate.isValid()
                ? momentDate.local().format("HH:mm A")
                : "";
            })()}
          </p>
        </div>
        <div className={classes.messageContainer}>
          {item?.lastMessage && (
            <div className={classes.messagePreview}>
              {item.lastMessage.message_type === "html" ||
              item.lastMessage.message_type === "media" ? (
                <span className={classes.iconContainer}>
                  <Paperclip size={14} />
                  <span>Attachment</span>
                </span>
              ) : (
                item.lastMessage.message_content
              )}
            </div>
          )}
          <span className={classes.newChatSign}> </span>
        </div>
      </div>
      {onDelete && (
        <button
          className={classes.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Are you sure you want to delete this room?")) {
              onDelete(item.id);
            }
          }}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default UserCard;
