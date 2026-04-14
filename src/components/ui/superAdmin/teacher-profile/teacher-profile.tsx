import { memo } from "react";
import Image from "next/image";
import classes from "./teacher-profile.module.css";
const DEFAULT_PROFILE_IMAGE = "/assets/images/dummyPic.png";

interface TutorDisplayProps {
  tutor: {
    profileImageUrl?: string;
    name?: string;
  } | null;
}

const TeacherProfile = memo(({ tutor }: TutorDisplayProps) => {
  const tutorName = tutor?.name?.trim() || "No Show";
  const tutorImage = tutor?.profileImageUrl || DEFAULT_PROFILE_IMAGE;

  return (
    <div className={classes.tutorProfileContent}>
      <span className={classes.imageBox}>
        <Image
          src={tutorImage}
          alt={tutorName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </span>
      <p className={classes.ellipsisCol}>{tutorName}</p>
    </div>
  );
});

TeacherProfile.displayName = "TeacherProfile";
export default TeacherProfile;
