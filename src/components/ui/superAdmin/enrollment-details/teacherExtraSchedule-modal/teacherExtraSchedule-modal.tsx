import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  CSSProperties,
} from "react";
import { Modal } from "@mui/material";
import Button from "@/components/global/button/button";
import DropDownEnrollmentSchedule from "@/components/global/dropDown-simple/dropDown-enrolment-schedule";
import moment from "moment";
import classes from "./teacherExtraSchedule-modal.module.css";
import DatePicker from "@/components/global/date-picker/date-picker";
import generateTimeSlots from "@/const/dashboard/time-slots";

// Constants moved outside component for better performance
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

const initialState = {
  duration: "",
  start_time: "",
  end_time: "",
  day_of_week: null,
};

interface TeacherExtraScheduleAddModalProps {
  loading: boolean;
  modalOpen: { open: boolean; transformedSchedulesArr: any[] };
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  success?: boolean;
  rescheduleRequestData?: any[];
}

const TeacherExtraScheduleAddModal: React.FC<
  TeacherExtraScheduleAddModalProps
> = ({
  loading,
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  success,
}) => {
  const [formData, setFormData] = useState(initialState);

  // Single handler for all form inputs
  const handleInputChange = useCallback((name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Reset form on success
  useEffect(() => {
    if (success) {
      setFormData(initialState);
    }
  }, [success]);

  // Get available start times based on selected day
  const filteredStartTimes = useMemo(() => {
    if (!formData.day_of_week || !modalOpen?.transformedSchedulesArr?.length) {
      return [];
    }

    // Reset time selections when day changes
    if (formData.start_time) {
      handleInputChange("start_time", "");
      handleInputChange("end_time", "");
    }

    const selectedDay = moment(formData.day_of_week).format("dddd");
    const daySchedule = modalOpen.transformedSchedulesArr.find(
      (item) => item.name === selectedDay,
    );

    if (!daySchedule) return [];

    // Map booked time slots
    const bookedTimes = daySchedule.slotsArr?.map((slot: any) => {
      const startTime = moment(slot?.teacher_schedule?.start_time, "HH:mm:ss");
      return {
        startTime: startTime.format("HH:mm:ss"),
        endTime: startTime
          .clone()
          .add(slot?.teacher_schedule.session_duration, "minutes")
          .format("HH:mm:ss"),
      };
    });

    // Generate all time slots and mark booked ones
    return generateTimeSlots(SLOT_INTERVAL).map((time) => {
      const format = "HH:mm:ss";
      const timeFormatted = moment(time, "HH:mm:ss").format("h:mm A");

      const isBooked = bookedTimes.some(
        (bookedTime: any) =>
          time === bookedTime.startTime ||
          moment(time, format).isBetween(
            moment(bookedTime.startTime, format),
            moment(bookedTime.endTime, format),
          ),
      );

      return isBooked ? `${timeFormatted} (Booked slot)` : timeFormatted;
    });
  }, [
    formData.day_of_week,
    modalOpen?.transformedSchedulesArr,
    handleInputChange,
  ]);

  // Get available end times based on selected start time
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

  // Form submission handler
  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.day_of_week || !formData.start_time || !formData.end_time) {
        return;
      }

      const start = moment(formData.start_time, "HH:mm:ss");
      const end = moment(formData.end_time, "HH:mm:ss");

      // Calculate duration accounting for overnight schedules
      const duration = end.isBefore(start)
        ? moment.duration(moment(end).add(1, "days").diff(start)).asMinutes()
        : moment.duration(end.diff(start)).asMinutes();

      const payload = {
        dateTime: moment(
          `${formData.day_of_week} ${formData.start_time}`,
          "YYYY-MM-DD h:mm A",
        )
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss[Z]"),
        duration,
      };

      // console.log("payload", payload);
      if (handleAdd) {
        handleAdd(payload);
      }
    },
    [formData, handleAdd],
  );

  return (
    <Modal
      open={modalOpen?.open || false}
      onClose={handleClose}
      aria-labelledby="schedule-modal-title"
      aria-describedby="schedule-modal-description"
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
              <DatePicker
                width="100%"
                value={formData.day_of_week}
                changeFn={(value: string | null) =>
                  handleInputChange(
                    "day_of_week",
                    value
                      ? moment(value)
                          .set({
                            hour: 7,
                            minute: 0,
                            second: 0,
                            millisecond: 0,
                          })
                          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
                      : null,
                  )
                }
                background={styles?.dropDownStyles?.backgroundColor}
                boxShadow={styles?.dropDownStyles?.boxShadow}
              />
            </div>
            <div className={classes.fields}>
              Time
              <div className={classes.multipleFields}>
                <DropDownEnrollmentSchedule
                  placeholder="Start time"
                  data={filteredStartTimes}
                  handleChange={(value: string) =>
                    handleInputChange("start_time", value)
                  }
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

export default React.memo(TeacherExtraScheduleAddModal);

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
