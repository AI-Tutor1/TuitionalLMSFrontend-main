import { memo } from "react";
import Image from "next/image";
import classes from "./student-profile.module.css";

const DEFAULT_PROFILE_IMAGE = "/assets/images/dummyPic.png";

interface StudentDisplayProps {
  studentsArray: any[];
}

const StudentDisplay = memo(({ studentsArray }: StudentDisplayProps) => {
  if (!studentsArray?.length) {
    return <span>No Show</span>;
  }

  const firstStudent = studentsArray[0];
  const firstStudentName = firstStudent?.user?.name?.trim() || "No Show";
  const firstStudentImage =
    firstStudent?.user?.profileImageUrl || DEFAULT_PROFILE_IMAGE;

  const hasSecondStudent = studentsArray.length > 1;
  const secondStudent = hasSecondStudent ? studentsArray[1] : null;
  const secondStudentImage =
    secondStudent?.user?.profileImageUrl || DEFAULT_PROFILE_IMAGE;
  const secondStudentName = secondStudent?.user?.name || "No Show";

  return (
    <div className={classes.studentsBox}>
      <div className={classes.imagesBox}>
        <span className={classes.imageBox}>
          <Image
            src={firstStudentImage}
            alt={firstStudentName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </span>

        {hasSecondStudent && (
          <span className={classes.imageBox}>
            <Image
              src={secondStudentImage}
              alt={secondStudentName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </span>
        )}
      </div>
      <p className={classes.ellipsisCol}>{firstStudentName}</p>
      {studentsArray.length === 2 && (
        <p className={classes.ellipsisCol}>{secondStudentName}</p>
      )}
      {studentsArray.length > 2 && (
        <p className={classes.ellipsisCol}>+{studentsArray.length - 2} more</p>
      )}
    </div>
  );
});

StudentDisplay.displayName = "StudentDisplay";
export default StudentDisplay;
