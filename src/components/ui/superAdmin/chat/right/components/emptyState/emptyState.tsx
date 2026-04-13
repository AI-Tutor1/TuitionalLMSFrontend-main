import React from "react";
import Image from "next/image";
import classes from "./emptyState.module.css";

export const EmptyState: React.FC = React.memo(() => (
  <div className={classes.container}>
    <span className={classes.imageBox}>
      <Image
        src="/assets/svgs/message.svg"
        alt="messages"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </span>
    <p>No message selected</p>
    <p>Please select any message from the chats sidebar</p>
  </div>
));

EmptyState.displayName = "EmptyState";
