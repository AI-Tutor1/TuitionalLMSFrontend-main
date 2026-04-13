import React, { FC, useCallback } from "react";
import classes from "./card.module.css";
import Image from "next/image";
import Link from "next/link";
import moment from "moment";

interface CardProps {
  time: string; // ISO or custom format for the time the class started
  date?: string; // Optional date, if not provided, will use current date
  name: string; // Name of the teacher/student
  profileImageUrl?: string; // Optional URL for the profile image; defaults provided
  student?: any[];
  meet_link?: string;
  duration: number;
  subject?: string;
  grade?: string;
  curriculum?: string;
}

const Card: FC<CardProps> = ({
  time,
  date,
  name,
  profileImageUrl,
  meet_link,
  student,
  duration,
  subject,
  grade,
  curriculum,
}) => {
  return (
    <div className={classes.cardBox}>
      <div className={classes.firstBox}>
        <p className={classes.rescheduled}>Demo</p>
        <p>Started at</p>
        <p>
          {moment.utc(time, "HH:mm:ss").local().format("hh:mm A") || "No Show"}
        </p>
        <p>
          {moment.utc(date, "YYYY-MM-DD").local().format("Do-MMMM-YYYY") ||
            "No Show"}
        </p>
      </div>
      <div className={classes.secondBox}>
        <div className={classes.infoBox}>
          <div className={classes.nameImageBox}>
            <div className={classes.imageBox}>
              <Image
                src={profileImageUrl || "/assets/images/demmyPic.png"}
                alt="Profile image"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <p>{name || "No Show"}</p>
          </div>
          <div className={classes.studentsBox}>
            <div className={classes.imagesBox}>
              <div className={classes.imageBox}>
                <Image
                  src={"/assets/images/demmyPic.png"}
                  alt={"Student"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
            <p>{student || "No Show"}</p>
          </div>
          <div className={classes.bottomBox}>
            <p>{subject || "No Show"}</p>
            <p>{grade || "No Show"}</p>
            <p>{curriculum || "No Show"}</p>
          </div>
        </div>

        <Link
          href={meet_link || ""}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.button}
        >
          {"Join Now"}
        </Link>
      </div>
    </div>
  );
};

export default Card;
