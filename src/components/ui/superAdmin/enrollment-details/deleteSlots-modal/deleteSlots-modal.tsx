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
import classes from "./deleteSlots-modal.module.css";
import Button from "@/components/global/button/button";
import Image from "next/image";
import RadioButton from "@/components/global/radio-button/radio-button";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";
import moment from "moment";
import { validateHeaderValue } from "http";
import { toast } from "react-toastify";

type DropdownItem = {
  text: string;
  dropDown: React.ReactNode;
};

interface BasicModalProps {
  loading: boolean;
  modalOpen: any;
  handleDelete?: any;
  dayDeletion?: any;
  weekDeletion?: any;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  modalArr?: DropdownItem[];
  inlineDropDownBox?: CSSProperties | undefined;
}

const DeleteSlotsModal: React.FC<BasicModalProps> = ({
  loading,
  modalOpen,
  handleClose,
  handleDelete,
  dayDeletion,
  weekDeletion,
  heading,
  subHeading,
  inlineDropDownBox,
}) => {
  const [radioValue, setRadioValue] = useState("Remove permanent");
  const [selectDay, setSelectDay] = useState("");
  const [selectRole, setSelectRole] = useState("");

  // Memoized function to handle radio button changes
  const handleRadio = useCallback((e: any) => {
    setRadioValue(e.target.value);
  }, []);

  const handleRoleChange = useCallback((value: string) => {
    setSelectRole(value);
  }, []);

  const getNextFourWeekdays = useMemo(() => {
    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const inputDay = heading?.toLowerCase() || "";
    const inputDayIndex = daysOfWeek.indexOf(inputDay);
    if (inputDayIndex === -1) {
      return [];
    }
    const today = moment();
    const currentDayIndex = today.day();
    // Calculate the current week's input day
    const daysUntilThisWeek = (inputDayIndex - currentDayIndex + 7) % 7;
    const currentWeekInputDay = today.clone().add(daysUntilThisWeek, "days");
    // If the current week's input day is *before today*, start from the next week
    const startDate = currentWeekInputDay.isAfter(today)
      ? currentWeekInputDay
      : currentWeekInputDay.clone().add(7, "days");
    // Generate the next 4 occurrences starting from the calculated start date
    const result = [];
    for (let i = 0; i < 4; i++) {
      const nextDay = startDate.clone().add(i * 7, "days");
      result.push(nextDay.format("dddd DD-MMM-YYYY"));
    }
    return result;
  }, [heading]);

  //  Memoized function for permanent deletion
  const parmanentDeletion = useCallback(() => {
    const payload = { ids: [...modalOpen?.ids] };
    if (handleDelete) {
      handleDelete(payload);
    }
  }, [modalOpen?.ids, handleDelete]);

  //  Memoized function for particular day deletion
  const deleteForParticularDay = useCallback(() => {
    if (!selectDay) {
      return toast.error("Please select day");
    }
    if (!selectRole) {
      return toast.error("Please select role");
    }
    const dateOnly = selectDay.split(" ").slice(1).join(" ");
    if (dayDeletion && dateOnly) {
      dayDeletion({ day: dateOnly, selectRole: selectRole });
    }
  }, [selectDay, dayDeletion, selectRole]);

  // Memoized function for week deletion
  const deleteForWeek = useCallback(() => {
    const currentDate = moment();
    const startOfWeek = currentDate.clone().startOf("week");
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayIndex = daysOfWeek.indexOf(heading);
    if (dayIndex === -1) {
      console.error("Invalid day name provided!");
      return;
    }
    if (!selectRole) {
      return toast.error("Please select role");
    }
    const desiredDate = startOfWeek.clone().add(dayIndex, "days");
    if (weekDeletion) {
      weekDeletion({
        day: desiredDate.format("YYYY-MM-DD"),
        selectRole: selectRole,
      });
    }
  }, [heading, weekDeletion, selectRole]);

  useEffect(() => {
    setRadioValue("Remove permanent");
    setSelectDay("");
    setSelectRole("");
  }, [modalOpen?.open]);

  return (
    <Modal
      open={modalOpen?.open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.mainBox}>
        {/* Delete Icon */}
        <div className={classes.deleteLogoBox}>
          <Image
            src="/assets/svgs/deleteModal.svg"
            layout="fill"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt="deleteLogo"
          />
        </div>

        {/* Heading and Subheading */}
        <div className={classes.headingBox}>
          <p>{heading || "No Show"}</p>
          <p>{subHeading || "No Show"}</p>
        </div>

        {/* Radio Buttons */}
        <div className={classes.radioButtonsBox}>
          <RadioButton
            label1={"Remove permanent"}
            label2={"Just for this week"}
            label3={"Delete for particular day"}
            value1={"Remove permanent"}
            value2={"Just for this week"}
            value3={"Delete for particular day"}
            radioValue={radioValue}
            handleChange={handleRadio}
          />

          {radioValue === "Delete for particular day" && (
            <div className={classes.dropDownBox}>
              <DropDownSimple
                data={getNextFourWeekdays || []}
                placeholder="Select day"
                value={selectDay}
                handleChange={(newValue) => {
                  setSelectDay(newValue);
                }}
              />
            </div>
          )}
          {(radioValue === "Delete for particular day" ||
            radioValue === "Just for this week") && (
            <div
              className={classes.dropDownBox}
              style={{
                justifySelf: "center",
                width: "320px",
                marginTop: "10px",
              }}
            >
              <DropDownSimple
                data={["Student", "Teacher"]}
                placeholder="Who is cancelling this class?"
                value={selectRole}
                handleChange={handleRoleChange}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className={classes.buttonBox}>
          <Button
            inlineStyling={styles?.buttonStyles1}
            text="Cancel"
            clickFn={handleClose}
          />
          <Button
            loading={loading}
            disabled={loading}
            inlineStyling={styles?.buttonStyles2}
            text="Confirm"
            clickFn={
              radioValue === "Delete for particular day"
                ? deleteForParticularDay
                : radioValue === "Just for this week"
                  ? deleteForWeek
                  : parmanentDeletion
            }
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(DeleteSlotsModal);

const styles = {
  buttonStyles1: {
    width: "100%",
    backgroundColor: "transparent",
    color: "var(--main-blue-color) !important",
    border: "1px solid var(--main-blue-color)",
  },
  buttonStyles2: {
    width: "100%",
  },
};
