import React, {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./weekDelete-extraSchedule-modal.module.css";
import Button from "@/components/global/button/button";
import Image from "next/image";
import moment from "moment";
import DatePicker from "@/components/global/date-picker/date-picker";
import DropDownEnrollmentSchedule from "@/components/global/dropDown-simple/dropDown-enrolment-schedule";
import { toast } from "react-toastify";
import generateTimeSlots from "@/const/dashboard/time-slots";

type DropdownItem = {
  text: string;
  dropDown: React.ReactNode;
};

interface BasicModalProps {
  loading: boolean;
  modalOpen: any;
  handleClose: () => void;
  handleWeekDelete: (
    day:
      | string
      | {
          dateTime: string;
          duration: number;
        }
  ) => void;
  heading: string;
  subHeading?: string;
  modalArr?: DropdownItem[];
  success?: boolean;
  classSchedule?: any[];
}

const initialState = {
  duration: "" as string,
  start_time: "" as string,
  end_time: "" as string,
  day_of_week: null,
};

const WeekDelete_ExtraSchedule_Modal: React.FC<BasicModalProps> = ({
  loading,
  modalOpen,
  handleClose,
  handleWeekDelete,
  heading,
  subHeading,
  success,
  classSchedule,
}) => {
  const [formData, setFormData] = useState(initialState);

  const handleInputChange = useCallback((name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const filteredStartTimes = useMemo(() => {
    if (
      !formData.day_of_week ||
      formData.day_of_week === "Invalid date" ||
      !classSchedule ||
      classSchedule.length === 0
    )
      return [];

    const daySchedule = classSchedule.find(
      (item) => item.day === moment(formData.day_of_week).format("dddd")
    );

    if (!daySchedule) return [];

    const bookedTimes = daySchedule.slots.map((slot: any) => ({
      startTime: moment(slot.teacherSchedule.start_time, "HH:mm:ss").format(
        "HH:mm:ss"
      ),
      endTime: moment(slot.teacherSchedule.start_time, "HH:mm:ss")
        .add(slot.teacherSchedule.session_duration, "minutes")
        .format("HH:mm:ss"),
    }));

    return generateTimeSlots(15)?.map((time) => {
      const format = "HH:mm:ss";
      let returnTime = moment(time, "HH:mm:ss").format("h:mm A");

      for (const bookedTime of bookedTimes) {
        if (
          time === bookedTime.startTime ||
          moment(time, format).isBetween(
            moment(bookedTime.startTime, format),
            moment(bookedTime.endTime, format),
            null,
            "[]"
          )
        ) {
          returnTime = `${moment(time, "HH:mm:ss").format(
            "h:mm A"
          )} (Booked slot)`;
          break;
        }
      }

      return returnTime;
    });
  }, [formData.day_of_week, classSchedule]);

  const filteredEndTimes = useMemo(() => {
    const startIndex = filteredStartTimes.indexOf(
      moment(formData.start_time, "HH:mm:ss").format("h:mm A")
    );

    if (startIndex === -1) return [];

    const endIndex = filteredStartTimes
      .slice(startIndex + 1)
      .findIndex((item: any) => item.includes("(Booked slot)"));

    const endTimes =
      endIndex === -1
        ? generateTimeSlots(15).slice(startIndex + 1)
        : generateTimeSlots(15).slice(
            startIndex + 1,
            startIndex + 1 + endIndex + 1
          );

    return endTimes.map((time) => moment(time, "HH:mm").format("hh:mm A"));
  }, [formData.start_time, filteredStartTimes]);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (moment(formData.day_of_week).isBefore(moment(), "day")) {
        setFormData(initialState);
        toast.error("You cannot select a date before today.");
        return;
      }

      const start = moment(formData.start_time, "HH:mm:ss");
      const end = moment(formData.end_time, "HH:mm:ss");

      const duration = moment.duration(end.diff(start)).asMinutes();

      if (duration <= 0) {
        toast.error("End time must be after start time.");
        return;
      }

      const dateTime = moment(
        `${formData.day_of_week} ${formData.start_time}`,
        "YYYY-MM-DD h:mm A"
      );

      if (!dateTime.isValid()) {
        toast.error("Please provide a valid date and start time.");
        return;
      }

      const payload = {
        dateTime: dateTime.utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
        duration: duration,
      };

      if (handleWeekDelete) {
        handleWeekDelete(payload);
      }
    },
    [formData, handleWeekDelete]
  );

  const resetFormState = useCallback(() => {
    setFormData(initialState);
  }, []);

  useEffect(() => {
    if (success) {
      resetFormState();
    }
  }, [success, resetFormState]);

  return (
    <Modal
      open={modalOpen?.open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.mainBox}>
        <div className={classes.deleteLogoBox}>
          <Image
            src="/assets/svgs/deleteModal.svg"
            layout="fill"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt="deleteLogo"
          />
        </div>

        <div className={classes.headingBox}>
          <p>{heading || "No Show"}</p>
          <p>{subHeading || "No Show"}</p>
        </div>

        <form className={classes.contentBox} onSubmit={handleFormSubmit}>
          <div className={classes.fields}>
            Reschedule it to
            <DatePicker
              width="100%"
              height="5.5vh"
              value={formData.day_of_week}
              changeFn={(value: string | null | undefined) =>
                handleInputChange(
                  "day_of_week",
                  value
                    ? moment(value)
                        .set({ hour: 7, minute: 0, second: 0, millisecond: 0 })
                        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
                    : null
                )
              }
              background="#fff"
              boxShadow="0px 1px 4px rgba(0, 0, 0, 0.08)"
              previousDatesDisbaled={true}
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

              <DropDownEnrollmentSchedule
                placeholder="End time"
                data={formData.start_time ? filteredEndTimes : []}
                handleChange={(value: string) => {
                  handleInputChange("end_time", value);
                }}
                value={formData.end_time}
                externalStyles={styles.dropDownStyles}
              />
            </div>
          </div>
        </form>

        <div className={classes.buttonBox}>
          <Button
            inlineStyling={styles.buttonStyles1}
            text="Cancel"
            clickFn={handleClose}
          />
          <Button
            loading={loading}
            disabled={loading}
            inlineStyling={styles.buttonStyles2}
            text="Confirm"
            clickFn={handleFormSubmit}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(WeekDelete_ExtraSchedule_Modal);

const styles = {
  buttonStyles1: {
    width: "100%",
    height: "5.3vh",
    backgroundColor: "transparent",
    color: "var(--main-color)",
    border: "1px solid var(--main-color)",
    filter: "drop-shadow(1px 15px 34px rgba(56, 182, 255, 0.40))",
  },
  buttonStyles2: {
    width: "100%",
    height: "5.3vh",
    backgroundColor: "var(--main-color)",
    color: "#fff",
    border: "1px solid var(--main-color)",
    filter: "drop-shadow(1px 15px 34px rgba(56, 182, 255, 0.40))",
  },
  dropDownStyles: {
    background: "var(--white-color) !important",
    height: "5.5vh !important",
  },
};
