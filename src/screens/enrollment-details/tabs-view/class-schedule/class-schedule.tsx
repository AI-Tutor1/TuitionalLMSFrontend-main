import React, { useMemo, useCallback, memo } from "react";
import { Box } from "@mui/material";
import moment from "moment";
import Image from "next/image";
import classes from "./class-schedule.module.css";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const ClassSchedule = React.memo(
  ({
    transformedSchedules,
    rescheduleRequestData = [],
    data = {},
    setConfirmSlotModal,
    setDeleteSlotModal,
    setRemoveAvailableSlot,
    id,
  }: any) => {
    // console.log("manzar", rescheduleRequestData);
    const today = useMemo(() => moment(), []);

    const requestRescheduleSlots = useCallback(
      (scheduleItem: any, date: string) => {
        if (rescheduleRequestData?.length > 0) {
          return rescheduleRequestData?.some(
            (item: any) =>
              item?.class_status === "CANCELLED" &&
              item?.class_schedule_id === scheduleItem?.id &&
              moment.utc(item?.DateTime).local().format("YYYY-MM-DD") === date,
          );
        }
        return false;
      },
      [rescheduleRequestData],
    );

    // Delete click handler
    const handleDeleteClick = useCallback(
      (
        e: React.MouseEvent<HTMLSpanElement>,
        scheduleItem: any,
        name: string,
        formattedStartTime: string,
        formattedEndTime: string,
      ) => {
        e.stopPropagation();
        setRemoveAvailableSlot({
          open: true,
          id: String(scheduleItem?.teacher_schedule?.id),
          day: name,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
        });
      },
      [],
    );

    // Memoize the `handleSlotClick` to avoid recreating it unnecessarily
    const handleSlotClick = useCallback(
      (
        scheduleItem: any,
        name: string,
        formattedStartTime: string,
        formattedEndTime: string,
      ) => {
        const isCurrentEnrollment = scheduleItem?.enrollment_id === Number(id);
        const isOtherBooked =
          scheduleItem?.enrollment_id === null &&
          scheduleItem?.teacher_schedule.is_booked;

        if (isCurrentEnrollment) {
          // console.log(scheduleItem?.id);
          setDeleteSlotModal({
            open: true,
            day: name,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            ids: [scheduleItem?.id],
          });
        } else if (!isOtherBooked) {
          setConfirmSlotModal({
            open: true,
            day: name,
            teacher_schedule_id: scheduleItem?.teacher_schedule.id,
            enrollment_id: data?.id,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
          });
        }
      },
      [id, setConfirmSlotModal, setDeleteSlotModal, data],
    );

    // Memoize the `renderSlot` function to avoid recreating it on every render
    const renderSlot = useCallback(
      (scheduleItem: any, name: string, date: string, indx: number) => {
        const startTime = moment.utc(
          scheduleItem?.teacher_schedule?.start_time,
          "HH:mm:ss",
        );
        const endTime = startTime
          .clone()
          .add(scheduleItem?.teacher_schedule.session_duration, "minutes");
        const formattedStartTime = startTime?.format("hh:mm A");
        const formattedEndTime = endTime?.format("hh:mm A");
        const isCurrentEnrollment = scheduleItem?.enrollment_id === Number(id);
        const isOtherBooked =
          scheduleItem?.enrollment_id === null &&
          scheduleItem?.teacher_schedule.is_booked;

        return (
          <div
            key={indx}
            className={
              isCurrentEnrollment
                ? classes.bookedBox
                : isOtherBooked
                  ? classes.nullBox
                  : classes.availableBox
            }
            onClick={() =>
              handleSlotClick(
                scheduleItem,
                name,
                formattedStartTime,
                formattedEndTime,
              )
            }
            style={{
              cursor:
                !isOtherBooked && !isCurrentEnrollment ? "pointer" : "default",
            }}
          >
            {isCurrentEnrollment ? (
              <>
                <div className={classes.timeBox}>
                  <p>{`${scheduleItem?.teacher_schedule?.session_duration}m`}</p>
                  <p>{formattedStartTime}</p>
                </div>
                <div className={classes.facultyInfoBox}>
                  <ImageBox
                    imageUrl1={
                      data?.tutor?.profileImageUrl ||
                      "/assets/images/static/demmyPic/png"
                    }
                    alt={"Teacher"}
                    name1={data?.tutor?.name || "Unknown"}
                  />
                  <ImageBox
                    imageUrl1={
                      data?.studentsData[0]?.profileImageUrl ||
                      "/assets/images/static/demmyPic.png"
                    }
                    imageUrl2={
                      data?.studentsData[1]?.profileImageUrl ||
                      "/assets/images/static/demmyPic.png"
                    }
                    alt={"Student"}
                    name1={data?.studentsData[0]?.name || "Unknown"}
                    name2={data?.studentsData[1]?.name || ""}
                    studentArrSize={
                      data?.studentsData?.length > 2
                        ? data?.studentsData?.length - 2
                        : null
                    }
                  />
                </div>
                {requestRescheduleSlots(scheduleItem, date) && <p>Cancelled</p>}
              </>
            ) : isOtherBooked ? (
              <>
                <p>Booked</p>
                <p>{`${formattedStartTime} - ${formattedEndTime}`}</p>
              </>
            ) : (
              <div className={classes.availableBox}>
                <div className={classes.actionButtonsBox}>
                  <div className={classes.iconBox}>
                    <DeleteOutlineIcon
                      onClick={(e: any) =>
                        handleDeleteClick(
                          e,
                          scheduleItem,
                          name,
                          formattedStartTime,
                          formattedEndTime,
                        )
                      }
                    />
                  </div>
                </div>
                <p>Available</p>
                <p>{`${formattedStartTime} - ${formattedEndTime}`}</p>
              </div>
            )}
          </div>
        );
      },
      [id, handleSlotClick, handleDeleteClick, data],
    );

    return (
      <Box className={classes.classScheduleBox}>
        {transformedSchedules?.length > 0 ? (
          transformedSchedules?.map(
            ({ name, slotsArr, date }: any, indx: number) => {
              const isToday = moment(date).isSame(
                today.format("YYYY-MM-DD"),
                "day",
              );
              return (
                <Box key={indx} className={classes.daysBox}>
                  <div
                    className={classes.daysNameBox}
                    style={{
                      backgroundColor: isToday
                        ? "var(--main-blue-color)"
                        : "#f1faff",
                    }}
                  >
                    <span
                      style={{
                        color: isToday
                          ? "var(--pure-white-color)"
                          : "var(--pure-black-color)",
                      }}
                    >
                      {name}
                    </span>
                    <span>{moment(date).format("Do")}</span>
                  </div>
                  {slotsArr?.length > 0 ? (
                    <Box className={classes.slotsBox}>
                      {slotsArr?.map((scheduleItem: any, childIndx: number) =>
                        renderSlot(scheduleItem, name, date, childIndx),
                      )}
                    </Box>
                  ) : (
                    <div className={classes.emptyBox}>
                      <p>No slots available!</p>
                    </div>
                  )}
                </Box>
              );
            },
          )
        ) : (
          <h1>No Data Found!</h1>
        )}
      </Box>
    );
  },
);

export default memo(ClassSchedule);

// Memoized ImageBox component
const ImageBox = React.memo(
  ({
    imageUrl1,
    imageUrl2,
    name1,
    name2,
    alt,
    studentArrSize,
  }: {
    imageUrl1?: string;
    imageUrl2?: string;
    name1: string;
    name2?: string;
    alt: string;
    studentArrSize?: number | null;
  }) => (
    <div className={classes.imageNameBox}>
      <div className={classes.imageContainer}>
        <div className={classes.imageBox}>
          <Image
            src={imageUrl1 || "/assets/images/static/demmyPic.png"}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        {name2 && (
          <div className={classes.imageBox}>
            <Image
              src={imageUrl2 || "/assets/images/static/demmyPic.png"}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
      </div>
      <p>
        {name1}
        {name2 && `, ${name2}`}
        {studentArrSize && <span>{` +${studentArrSize} more`}</span>}
      </p>
    </div>
  ),
);
