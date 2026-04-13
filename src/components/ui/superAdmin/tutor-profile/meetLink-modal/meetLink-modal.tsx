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
import classes from "./meetLink-modal.module.css";
import Button from "@/components/global/button/button";
import Image from "next/image";
import moment from "moment";
import DatePicker from "@/components/global/date-picker/date-picker";
import DropDown from "@/components/global/dropDown-simple/dropDown-enrolment-schedule";
import { toast } from "react-toastify";
import generateTimeSlots from "@/const/dashboard/time-slots";

type DropdownItem = {
  text: string;
  dropDown: React.ReactNode;
};

interface BasicModalProps {
  loading: boolean;
  modalOpen: boolean;
  handleClose: () => void;
  handleGenerateLink: (data: { interviewDate: string }) => void;
  heading: string;
  subHeading?: string;
  modalArr?: DropdownItem[];
  success?: boolean;
}

interface FormData {
  start_time: string;
  day_of_week: string | null;
}

const INITIAL_STATE: FormData = {
  start_time: "",
  day_of_week: null,
};

// Memoized constants
const TIME_SLOTS = generateTimeSlots(15, "12hr") || [];
const IMAGE_STYLE = { filter: "brightness(0) invert(1)" } as const;
const DATETIME_FORMAT = "YYYY-MM-DD h:mm A";
const DATE_FORMAT = "YYYY-MM-DD";

const GenerateMeetLink: React.FC<BasicModalProps> = memo(
  ({
    loading,
    modalOpen,
    handleClose,
    handleGenerateLink,
    heading,
    subHeading,
    success,
  }) => {
    const [formData, setFormData] = useState<FormData>(INITIAL_STATE);

    // Memoized values
    const displayHeading = useMemo(
      () => heading || "Generate Meeting Link",
      [heading]
    );

    const displaySubHeading = useMemo(
      () => subHeading || "Select date and time for the meeting",
      [subHeading]
    );

    const currentMoment = useMemo(() => moment(), []);

    // Optimized input change handler with proper typing
    const handleInputChange = useCallback(
      (name: keyof FormData, value: string | null) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
      },
      []
    );

    // Memoized date change handler
    const handleDateChange = useCallback(
      (value: string | null | undefined) => {
        handleInputChange("day_of_week", value || null);
      },
      [handleInputChange]
    );

    // Memoized time change handler
    const handleTimeChange = useCallback(
      (value: string) => {
        handleInputChange("start_time", value);
      },
      [handleInputChange]
    );

    // Optimized form validation
    const validateForm = useCallback(() => {
      if (!formData.day_of_week || !formData.start_time) {
        toast.error("Please select both date and time.");
        return false;
      }

      if (moment(formData.day_of_week).isBefore(currentMoment, "day")) {
        toast.error("You cannot select a date before today.");
        return false;
      }

      return true;
    }, [formData.day_of_week, formData.start_time, currentMoment]);

    // Optimized datetime creation
    const createDateTime = useCallback(() => {
      const dateTime = moment(
        `${moment(formData.day_of_week).format(DATE_FORMAT)} ${
          formData.start_time
        }`,
        DATETIME_FORMAT
      );

      if (!dateTime.isValid()) {
        toast.error("Please provide a valid date and start time.");
        return null;
      }

      return dateTime;
    }, [formData.day_of_week, formData.start_time]);

    // Optimized form submit handler
    const handleFormSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
          return;
        }

        const dateTime = createDateTime();
        if (!dateTime) {
          return;
        }

        const payload = {
          interviewDate: dateTime.toISOString(),
        };

        handleGenerateLink(payload);
      },
      [validateForm, createDateTime, handleGenerateLink]
    );

    // Memoized reset function
    const resetFormState = useCallback(() => {
      setFormData(INITIAL_STATE);
    }, []);

    // Effect for success state
    useEffect(() => {
      if (success) {
        resetFormState();
      }
    }, [success, resetFormState]);

    // Memoized form validation state
    const isFormValid = useMemo(() => {
      return Boolean(formData.day_of_week && formData.start_time);
    }, [formData.day_of_week, formData.start_time]);

    return (
      <Modal
        open={modalOpen}
        onClose={handleClose}
        aria-labelledby="generate-meeting-link-title"
        aria-describedby="generate-meeting-link-description"
      >
        <Box className={classes.mainBox}>
          <div className={classes.logoBox}>
            <div className={classes.deleteLogoBox}>
              <Image
                src="/assets/svgs/camera.svg"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                alt="camera"
                style={IMAGE_STYLE}
              />
            </div>
          </div>

          <div className={classes.headingBox}>
            <p id="generate-meeting-link-title">{displayHeading}</p>
            <p id="generate-meeting-link-description">{displaySubHeading}</p>
          </div>

          <form className={classes.contentBox} onSubmit={handleFormSubmit}>
            <div className={classes.fields}>
              <label htmlFor="date-picker">Date</label>
              <DatePicker
                width="100%"
                height="5.5vh"
                value={formData.day_of_week}
                changeFn={handleDateChange}
                background="#fff"
                boxShadow="0px 1px 4px rgba(0, 0, 0, 0.08)"
                previousDatesDisbaled={true}
              />
            </div>

            <div className={classes.fields}>
              <label htmlFor="time-picker">Time</label>
              <div className={classes.multipleFields}>
                <DropDown
                  placeholder="Start time"
                  data={TIME_SLOTS}
                  handleChange={handleTimeChange}
                  value={formData.start_time}
                  disable="(Booked slot)"
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
              disabled={loading || !isFormValid}
              inlineStyling={styles.buttonStyles2}
              text="Confirm"
              clickFn={handleFormSubmit}
            />
          </div>
        </Box>
      </Modal>
    );
  }
);

GenerateMeetLink.displayName = "GenerateMeetLink";

export default GenerateMeetLink;

// Memoized styles object
const styles = {
  buttonStyles1: {
    width: "50%",
    backgroundColor: "transparent",
    color: "var(--main-color)",
    border: "1px solid var(--main-color)",
    filter: "drop-shadow(1px 15px 34px rgba(56, 182, 255, 0.40))",
  } as CSSProperties,
  buttonStyles2: {
    width: "50%",
    backgroundColor: "var(--main-color)",
    color: "#fff",
    border: "1px solid var(--main-color)",
    filter: "drop-shadow(1px 15px 34px rgba(56, 182, 255, 0.40))",
  } as CSSProperties,
  dropDownStyles: {
    background: "var(--white-color) !important",
  } as CSSProperties,
} as const;
