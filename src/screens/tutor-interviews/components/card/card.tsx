import React, { FC, useCallback } from "react";
import styles from "./card.module.css";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/global/button/button";

interface CardProps {
  time: string; // ISO or custom format for the time the class started
  name: string; // Name of the teacher/student
  profileImageUrl?: string; // Optional URL for the profile image; defaults provided
  meet_link?: string;
}

const Card: FC<CardProps> = ({ time, name, profileImageUrl, meet_link }) => {
  return (
    <div className={styles.cardBox}>
      <div className={styles.firstBox}>
        <p>Start at</p>
        <p>{moment.utc(time).local().format("hh:mm A ") || "No Show"}</p>
        <p>{moment.utc(time).local().format("Do-MM-YYYY") || "No Show"}</p>
      </div>
      <div className={styles.secondBox}>
        <div className={styles.infoBox}>
          <div className={styles.nameImageSubjectBox}>
            <div className={styles.nameImageBox}>
              <div className={styles.imageBox}>
                <Image
                  src={profileImageUrl || "/assets/images/dummyPic.png"}
                  alt="Profile image"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <p>{name.split(" ").join(" ") || "No Show"}</p>
            </div>
          </div>
        </div>

        <div className={styles.actionsBox}>
          <Link
            href={meet_link || ""}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.button}
          >
            {"Meet Link"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
