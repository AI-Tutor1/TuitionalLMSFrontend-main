import React, {
  useState,
  useCallback,
  useEffect,
  memo,
  CSSProperties,
  useMemo,
} from "react";
import { Typography, Modal } from "@mui/material";
import Button from "@/components/global/button/button";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";
import classes from "./teacherSchedule-add-modal.module.css";
import moment from "moment";
import DropDownEnrollmentSchedule from "@/components/global/dropDown-simple/dropDown-enrolment-schedule";
import { useParams } from "next/navigation";
import generateTimeSlots from "@/const/dashboard/time-slots";

interface BasicModalProps {
  heading: string;
  subHeading?: string;
  modalOpen: { open: boolean; id: string; transformedSchedulesArr: any[] };
  handleClose: () => void;
  loading: boolean;
  success?: boolean;
  handleAdd?: (data: any) => void;
}

const initialState = {
  day_of_week: "",
  start_time: "",
  end_time: "",
  session_duration: null,
  slots: "",
  tutor_id: null,
};

const dayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Time slot configurations
const SLOT_INTERVAL = 15;
const AFTER_MIDNIGHT_SLOTS = [
  "12:00 AM",
  "12:15 AM",
  "12:30 AM",
  "12:45 AM",
  "01:00 AM",
  "01:15 AM",
  "01:30 AM",
  "01:45 AM",
  "02:00 AM",
  "02:15 AM",
  "02:30 AM",
  "02:45 AM",
  "03:00 AM",
];

const TIME_CATEGORIES = [
  { name: "morning", start: "06:00:00", end: "12:00:00" },
  { name: "afternoon", start: "12:00:00", end: "15:00:00" },
  { name: "evening", start: "15:00:00", end: "19:00:00" },
  { name: "night", start: "19:00:00", end: "23:00:00" },
  { name: "midnight", start: "23:00:00", end: "06:00:00" },
];

const TeacherSceduleAddModal: React.FC<BasicModalProps> = ({
  heading,
  subHeading,
  modalOpen,
  handleClose,
  loading,
  success,
  handleAdd,
}) => {
  const params = useParams();
  const [formData, setFormData] = useState(initialState);

  const handleInputChange = useCallback((name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Reset form when day changes
  const resetTimeFields = useCallback(() => {
    setFormData((prev) => ({ ...prev, start_time: "", end_time: "" }));
  }, []);

  // Get filtered start times based on booked slots
  const filteredStartTimes = useMemo(() => {
    if (!formData.day_of_week || !modalOpen?.transformedSchedulesArr) {
      return [];
    }

    resetTimeFields();

    const daySchedule = modalOpen?.transformedSchedulesArr?.find(
      (item) => item.name === formData.day_of_week,
    );

    if (!daySchedule) return [];

    const bookedTimes = daySchedule?.slotsArr?.map((slot: any) => {
      const startTime = moment(slot?.teacher_schedule?.start_time, "HH:mm:ss");
      return {
        startTime: startTime.format("HH:mm:ss"),
        endTime: startTime
          .clone()
          .add(slot?.teacher_schedule.session_duration, "minutes")
          .format("HH:mm:ss"),
      };
    });

    return generateTimeSlots(SLOT_INTERVAL)?.map((time) => {
      const format = "HH:mm:ss";
      const timeObj = moment(time, format);
      const formattedTime = timeObj.format("h:mm A");

      const isBooked = bookedTimes.some(
        (slot: any) =>
          time === slot.startTime ||
          timeObj.isBetween(
            moment(slot.startTime, format),
            moment(slot.endTime, format),
          ),
      );

      return isBooked ? `${formattedTime} (Booked slot)` : formattedTime;
    });
  }, [
    formData.day_of_week,
    modalOpen?.transformedSchedulesArr,
    resetTimeFields,
  ]);

  const filteredEndTimes = useMemo(() => {
    if (!formData?.start_time || !filteredStartTimes.length) return [];

    const startTimeMoment = moment(formData.start_time, "HH:mm:ss");
    const allSlots = generateTimeSlots(SLOT_INTERVAL);
    const startIndex = allSlots.findIndex((slot) =>
      moment(slot, "HH:mm:ss").isSame(startTimeMoment),
    );

    if (startIndex === -1) return [];

    // Find the next booked slot after our selected start time
    const nextBookedIndex = filteredStartTimes.findIndex(
      (time, index) => index > startIndex && time.includes("(Booked slot)"),
    );

    // Get available slots between start time and next booked slot
    const availableSlots =
      nextBookedIndex === -1
        ? allSlots.slice(startIndex + 1)
        : allSlots.slice(startIndex + 1, nextBookedIndex + 1);

    // Format the available times
    const endTimes = availableSlots.map((time) =>
      moment(time, "HH:mm:ss").format("h:mm A"),
    );

    // Special case for 11:00 PM start (show after-midnight slots)
    if (formData.start_time === "23:00:00") {
      return [...endTimes, ...AFTER_MIDNIGHT_SLOTS];
    }

    const shouldAddMidnight =
      endTimes.length > 0 &&
      nextBookedIndex === -1 &&
      !filteredStartTimes.includes("12:00 AM (Booked slot)");

    return shouldAddMidnight ? [...endTimes, "12:00 AM"] : endTimes;
  }, [formData?.start_time, filteredStartTimes]);

  // Get slot category based on start time
  const getSlotCategory = useCallback((startTime: moment.Moment) => {
    const timeStr = startTime.format("HH:mm:ss");
    const timeObj = moment(timeStr, "HH:mm:ss");

    const category = TIME_CATEGORIES.find(({ start, end }) => {
      const startMoment = moment(start, "HH:mm:ss");
      const endMoment = moment(end, "HH:mm:ss");

      if (start >= end) {
        // Handles categories that cross midnight
        return timeObj.isAfter(startMoment) || timeObj.isBefore(endMoment);
      }

      return timeObj.isBetween(startMoment, endMoment, null, "[)");
    });

    return category?.name || "";
  }, []);

  // Form Submit handler
  const handleFormSubmit = useCallback(
    (e: any) => {
      e.preventDefault();

      // Convert string times to moment objects
      const startTime = moment(formData.start_time, "HH:mm:ss");
      const endTime = moment(formData.end_time, "HH:mm:ss");

      // Calculate session duration accounting for midnight crossing
      const session_duration = endTime.isBefore(startTime)
        ? moment
            .duration(moment(endTime).add(1, "days").diff(startTime))
            .asMinutes()
        : moment.duration(endTime.diff(startTime)).asMinutes();

      // Create local datetime objects
      const startTimeLocal = moment(
        `${formData.day_of_week} ${formData.start_time}`,
        "dddd HH:mm:ss",
      );

      const endTimeLocal = moment(
        `${formData.day_of_week} ${formData.end_time}`,
        "dddd HH:mm:ss",
      );

      // Handle midnight crossing
      if (endTime.isBefore(startTime)) {
        endTimeLocal.add(1, "days");
      }

      // Convert to UTC
      const startTimeUTC = startTimeLocal.clone().utc();
      const endTimeUTC = endTimeLocal.clone().utc();

      // Handle day shift in UTC
      const localDayOfWeek = startTimeLocal.format("dddd");
      const utcDayOfWeek = startTimeUTC.format("dddd");
      const finalDayOfWeek =
        utcDayOfWeek !== localDayOfWeek ? utcDayOfWeek : localDayOfWeek;

      const payload = {
        start_time: startTimeUTC.format("HH:mm"),
        day_of_week: finalDayOfWeek.substring(0, 3),
        session_duration,
        tutor_id: modalOpen?.id,
        slots: getSlotCategory(startTimeUTC),
        enrollment_id: Number(params?.id),
      };

      // console.log(payload);
      if (handleAdd) {
        handleAdd(payload);
      }
    },
    [formData, modalOpen?.id, params?.id, getSlotCategory, handleAdd],
  );

  // Reset form when success
  useEffect(() => {
    if (success) {
      setFormData(initialState);
    }
  }, [success]);

  return (
    <Modal
      open={modalOpen.open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className={classes.mainBox}>
        <div className={classes.headingBox}>
          {heading && <p>{heading}</p>}
          {subHeading && <p>{subHeading}</p>}
        </div>

        <form className={classes.contentBox} onSubmit={handleFormSubmit}>
          <div className={classes.mainContent}>
            <div className={classes.fields}>
              Day of the Week
              <DropDownSimple
                placeholder="Select day"
                data={dayOrder}
                handleChange={(value: string) =>
                  handleInputChange("day_of_week", value)
                }
                value={formData.day_of_week}
                externalStyles={styles.dropDownStyles}
              />
            </div>

            <div className={classes.fields}>
              Time
              <div className={classes.multipleFields}>
                <DropDownEnrollmentSchedule
                  placeholder="Start time"
                  data={filteredStartTimes}
                  handleChange={(value: string) => {
                    handleInputChange("start_time", value);
                  }}
                  value={formData.start_time}
                  disable="(Booked slot)"
                  externalStyles={styles.dropDownStyles}
                />
                -
                <DropDownEnrollmentSchedule
                  placeholder="End time"
                  data={filteredEndTimes}
                  handleChange={(value: string) =>
                    handleInputChange("end_time", value)
                  }
                  value={formData.end_time}
                  externalStyles={styles.dropDownStyles}
                />
              </div>
            </div>
          </div>
          <Button
            loading={loading}
            disabled={loading}
            inlineStyling={styles?.buttonStyles}
            text="Add"
            clickFn={handleFormSubmit}
          />
        </form>
      </div>
    </Modal>
  );
};

export default memo(TeacherSceduleAddModal);

const styles = {
  dropDownStyles: {
    width: "100%",
    backgroundColor: "var(--main-white-color) !important",
    boxShadow: "var(--main-inner-boxShadow-color) !important",
  },
  buttonStyles: {
    width: "100%",
  },
} as CSSProperties | any;
