import React, { useState, memo, useMemo, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import classes from "./add-modal.module.css";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";
import DatePicker from "@/components/global/date-picker/date-picker";
import { getAllEnrollments } from "@/services/dashboard/superAdmin/enrollments/enrollments";
import generateTimeSlots from "@/const/dashboard/time-slots";
import useDebounce from "@/utils/helpers/useDebounce";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  loading?: boolean;
  isSuccess?: boolean;
}

// Define the initial state for the form
interface FormState {
  enrollment: null | any;
  date: string | null;
  time: string;
  duration: string;
  conclusionType: string;
}

const initialState: FormState = {
  enrollment: null,
  date: null,
  time: "",
  duration: "",
  conclusionType: "",
};

const AddModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading,
  isSuccess,
}) => {
  const { token } = useAppSelector((state) => state?.user);
  const [formState, setFormState] = useState<FormState>(initialState);
  const [name, setName] = useState("");
  const debouncedSearch = useDebounce(name, 1500);

  const { data, isLoading } = useQuery({
    queryKey: [
      "getAllEnrollments",
      debouncedSearch?.length >= 3 && debouncedSearch,
    ],
    queryFn: () =>
      getAllEnrollments(
        {
          limit: 500,
          page: 1,
          ...(debouncedSearch.length >= 3 && { name: debouncedSearch }),
          on_break: "",
          is_permanent: "",
        },
        {
          token,
        },
      ),
    enabled: !!token,
  });

  // Memoize enrollment data to avoid recalculating on every render
  const stringifyEnrollmentData = useMemo(() => {
    return data?.data?.map((item: any) => JSON.stringify(item));
  }, [data]);

  // Memoize time slots to avoid recalculating on every render
  const timeSlots = useMemo(() => generateTimeSlots(15, "12hr"), []);

  // Memoize the handleFormSubmit function
  const handleFormSubmit = useCallback(() => {
    const { enrollment, date, time, duration, conclusionType } = formState;

    const validationError = !enrollment?.id
      ? "Enrollment is required"
      : !conclusionType
        ? "Conclusion Type is required"
        : !date
          ? "Date is required"
          : !duration
            ? "Duration is required"
            : null;

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const dateTimeString = `${moment.utc(date).format("YYYY-MM-DD")} ${time}`;
    const classTime = moment(dateTimeString, "YYYY-MM-DD hh:mm A")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss[Z]");

    const payload = {
      tutor_class_time: Number(duration),
      conclusion_type: conclusionType,
      tutor_scaled_class_time: Number(duration),
      duration: Number(duration),
      enrollment_id: enrollment?.id,
      created_at: classTime,
    };

    handleAdd?.(payload);
  }, [formState, handleAdd]);

  const handleOnInputChange = useCallback((e: React.ChangeEvent<any>) => {
    setName(e?.target?.value);
  }, []);

  const handleEnrollmentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedEnrollment: any = JSON.parse(e.target.value);
      setFormState((prev) => ({ ...prev, enrollment: selectedEnrollment }));
    },
    [],
  );

  const handleDateChange = useCallback((value: string | null | undefined) => {
    setFormState((prev) => ({
      ...prev,
      date: value
        ? moment(value)
            .set({ hour: 7, minute: 0, second: 0, millisecond: 0 })
            .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
        : null,
    }));
  }, []);

  const handleTimeChange = useCallback((value: any) => {
    setFormState((prev) => ({ ...prev, time: value }));
  }, []);

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, duration: e.target.value }));
    },
    [],
  );

  const handleConclusionTypeChange = useCallback((value: any) => {
    setFormState((prev) => ({ ...prev, conclusionType: value }));
  }, []);

  // Reset all states when isSuccess is true
  useEffect(() => {
    if (isSuccess) {
      setFormState(initialState);
    }
  }, [isSuccess]);

  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ background: "rgba(0, 0, 0, 0.5" }}
    >
      <Box className={classes.mainBox}>
        <div className={classes.headingBox}>
          {heading && (
            <p>{heading.endsWith("s") ? heading.slice(0, -1) : heading}</p>
          )}
          {subHeading && <p>{subHeading}</p>}
        </div>
        <div className={classes.section2}>
          <form className={classes.contentBox}>
            <div className={classes.fields} style={{ width: "100%" }}>
              <p>Enrollment</p>
              <DropDown
                placeholder="Select enrollment"
                data={stringifyEnrollmentData || []}
                handleChange={handleEnrollmentChange}
                handleOnInputChange={handleOnInputChange}
                value={
                  formState.enrollment
                    ? JSON.stringify(formState.enrollment)
                    : ""
                }
                inlineDropDownStyles={styles?.dropDownStyles}
                loading={isLoading}
              />
            </div>
            <div className={classes.otherFields}>
              <div className={classes.fields}>
                <p>Date</p>
                <DatePicker
                  width="100%"
                  height="5.5vh"
                  minHeight="45px"
                  value={formState.date}
                  changeFn={handleDateChange}
                  background="var(--main-white-color)"
                  boxShadow="var(--main-inner-boxShadow-color)"
                />
              </div>
              <div className={classes.fields}>
                <p>Time</p>
                <DropDownSimple
                  placeholder="Select time"
                  data={timeSlots || []}
                  handleChange={handleTimeChange}
                  value={formState.time}
                  externalStyles={styles?.dropDownStyles}
                />
              </div>
              <div className={classes.fields}>
                <p>Session Duration</p>
                <InputField
                  inputBoxStyles={styles?.inputStyles}
                  placeholder="Enter session duration minutes"
                  value={formState.duration}
                  changeFunc={handleDurationChange}
                />
              </div>
              <div className={classes.fields}>
                <p>Conclusion Type</p>
                <DropDownSimple
                  placeholder="Select session type"
                  data={[
                    "Conducted",
                    "Cancelled",
                    "Teacher Absent",
                    "Student Absent",
                    "No Show",
                  ]}
                  handleChange={handleConclusionTypeChange}
                  value={formState.conclusionType}
                  externalStyles={styles?.dropDownStyles}
                />
              </div>
            </div>
          </form>
          <Button
            text="Add"
            clickFn={handleFormSubmit}
            loading={loading}
            disabled={loading}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(AddModal);

const styles = {
  inputStyles: {
    width: "100%",
    background: "var(--main-white-color)",
    boxShadow: "var(--main-inner-boxShadow-color) ",
  },
  dropDownStyles: {
    width: "100%",
    backgroundColor: "var(--main-white-color) !important",
    boxShadow: "var(--main-inner-boxShadow-color) !important",
  },
};
