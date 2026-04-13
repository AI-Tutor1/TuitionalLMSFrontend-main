import React, { useState, memo, useEffect, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import classes from "./demoUpdate-modal.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import { toast } from "react-toastify";
import moment from "moment";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import generateTimeSlots from "@/const/dashboard/time-slots";
import DatePicker from "@/components/global/date-picker/date-picker";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";

// Define proper TypeScript interface
interface FormData {
  id?: number;
  tutorId: number | null | Record<string, any>;
  subjectId: number | null | Record<string, any>;
  gradeId: number | null | Record<string, any>;
  curriculumId: number | null | Record<string, any>;
  studentName: string;
  parentName: string | Record<string, any>;
  date: string;
  time: string;
  duration: string;
}

interface Resource {
  id: number;
  name: string;
}

const emptyState: FormData = {
  tutorId: null,
  subjectId: null,
  gradeId: null,
  curriculumId: null,
  studentName: "",
  parentName: "",
  date: "",
  time: "",
  duration: "",
};

interface BasicModalProps {
  data?: any;
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleUpdate?: (data: any) => void;
  loading?: boolean;
}

const UpdateDemoModal: React.FC<BasicModalProps> = ({
  data,
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleUpdate,
  loading,
}) => {
  const { token } = useAppSelector((state) => state?.user);
  const { teachers, parents } = useAppSelector((state) => state?.usersByGroup);
  const { subject, curriculum, grades } = useAppSelector(
    (state) => state?.resources
  );
  const [formData, setFormData] = useState<FormData>(emptyState);

  const getDropdownData = useMemo(() => {
    return (type: string): string[] => {
      switch (type) {
        case "teachers":
          return (
            teachers?.users?.map((item: Resource) => JSON.stringify(item)) || []
          );
        case "parents":
          return (
            parents?.users?.map((item: Resource) => JSON.stringify(item)) || []
          );
        case "subjects":
          return subject?.map((item: Resource) => JSON.stringify(item)) || [];
        case "grades":
          return grades?.map((item: Resource) => JSON.stringify(item)) || [];
        case "curriculum":
          return (
            curriculum?.map((item: Resource) => JSON.stringify(item)) || []
          );
        default:
          return [];
      }
    };
  }, [teachers?.users, parents?.users, subject, grades, curriculum]);

  // Fixed: Proper type-safe field change handler
  const handleFieldChange = useCallback(
    <K extends keyof FormData>(field: K, value: string | number) => {
      setFormData((prevState) => ({
        ...prevState,
        [field]: value,
      }));
    },
    []
  );

  // Form validation
  const isFormValid = useMemo(() => {
    return (
      formData.tutorId !== null &&
      formData.subjectId !== null &&
      formData.gradeId !== null &&
      formData.curriculumId !== null &&
      formData.studentName !== "" &&
      formData.parentName !== "" &&
      formData.date !== "" &&
      formData.time !== "" &&
      formData.duration !== ""
    );
  }, [formData]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!isFormValid) {
        toast.error("Form is not valid. Please fill all required fields.");
        return;
      }

      if (!formData.id) {
        toast.error("Demo ID is missing. Cannot update demo.");
        return;
      }

      const payload = {
        ...formData,
        time: moment(formData.time, "HH:mm").utc().format("HH:mm:ss"),
        date: moment.utc(formData.date, "YYYY-MM-DD").format("YYYY-MM-DD"),
        tutorId: (formData.tutorId as any)?.id,
        studentName: formData.studentName.trim(),
        parentName: (formData.parentName as any)?.name || formData.parentName,
        subjectId: (formData.subjectId as any)?.id,
        gradeId: (formData.gradeId as any)?.id,
        curriculumId: (formData.curriculumId as any)?.id,
      };

      handleUpdate?.({ ...payload });
    },
    [formData, isFormValid, handleUpdate]
  );

  // Populate form with existing data when modal opens or data changes
  useEffect(() => {
    if (data && modalOpen) {
      setFormData({
        id: data.id,
        tutorId: data.demoTutor || null,
        subjectId: data.demoSubject || null,
        gradeId: data.demoGrade || null,
        curriculumId: data.demoCurriculum || null,
        studentName: data.studentName || "",
        parentName: { name: data.parentName || "" },
        date: data.date || "",
        time: data.time ? moment(data.time, "HH:mm:ss").format("HH:mm") : "",
        duration: data.duration ? data.duration.toString() : "",
      });
    } else if (!modalOpen) {
      // Reset form when modal closes
      setFormData(emptyState);
    }
  }, [data, modalOpen]);

  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.mainBox}>
        <div className={classes.headingBox}>
          {heading && (
            <Typography variant="h6">
              {heading.endsWith("s") ? heading.slice(0, -1) : heading}
            </Typography>
          )}
          {subHeading && (
            <Typography variant="subtitle1">{subHeading}</Typography>
          )}
        </div>
        <form className={classes.contentBox} onSubmit={handleSubmit}>
          <div className={classes.fields}>
            <Typography variant="body2">Teacher *</Typography>
            <DropDown
              placeholder="Select Teacher"
              data={getDropdownData("teachers")}
              handleChange={(e: React.ChangeEvent<{ value: string }>) =>
                handleFieldChange("tutorId", JSON.parse(e.target.value))
              }
              value={formData.tutorId ? JSON.stringify(formData.tutorId) : ""}
              inlineDropDownStyles={styles.fieldStyles}
            />
          </div>

          <div className={classes.fields}>
            <Typography variant="body2">Subject *</Typography>
            <DropDown
              placeholder="Select Subject"
              data={getDropdownData("subjects")}
              handleChange={(e: React.ChangeEvent<{ value: string }>) =>
                handleFieldChange("subjectId", JSON.parse(e.target.value))
              }
              value={
                formData.subjectId ? JSON.stringify(formData.subjectId) : ""
              }
              inlineDropDownStyles={styles.fieldStyles}
            />
          </div>

          <div className={classes.fields}>
            <Typography variant="body2">Grade *</Typography>
            <DropDown
              placeholder="Select Grade"
              data={getDropdownData("grades")}
              handleChange={(e: React.ChangeEvent<{ value: string }>) =>
                handleFieldChange("gradeId", JSON.parse(e.target.value))
              }
              value={formData.gradeId ? JSON.stringify(formData.gradeId) : ""}
              inlineDropDownStyles={styles.fieldStyles}
            />
          </div>

          <div className={classes.fields}>
            <Typography variant="body2">Curriculum *</Typography>
            <DropDown
              placeholder="Select Curriculum"
              data={getDropdownData("curriculum")}
              handleChange={(e: React.ChangeEvent<{ value: string }>) =>
                handleFieldChange("curriculumId", JSON.parse(e.target.value))
              }
              value={
                formData.curriculumId
                  ? JSON.stringify(formData.curriculumId)
                  : ""
              }
              inlineDropDownStyles={styles.fieldStyles}
            />
          </div>

          <div className={classes.fields}>
            <Typography variant="body2">Student Name *</Typography>
            <InputField
              placeholder="Enter Student Name"
              value={formData.studentName}
              changeFunc={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFieldChange("studentName", e.target.value)
              }
              inputBoxStyles={styles.fieldStyles}
            />
          </div>

          <div className={classes.fields}>
            <Typography variant="body2">Parent Name *</Typography>
            <DropDown
              placeholder="Select Parent"
              data={getDropdownData("parents")}
              handleChange={(e: React.ChangeEvent<{ value: string }>) =>
                handleFieldChange("parentName", JSON.parse(e.target.value))
              }
              value={
                formData.parentName ? JSON.stringify(formData.parentName) : ""
              }
              inlineDropDownStyles={styles.fieldStyles}
            />
          </div>

          <div className={classes.fields}>
            <Typography variant="body2">Demo Duration (minutes) *</Typography>
            <InputField
              placeholder="Enter demo duration (e.g., 30, 45, 60)"
              value={formData.duration}
              type="number"
              changeFunc={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFieldChange("duration", e.target.value)
              }
              inputBoxStyles={styles.fieldStyles}
            />
          </div>

          <div className={classes.fields}>
            <Typography variant="body2">Time *</Typography>
            <DropDownSimple
              placeholder="Select Time"
              data={generateTimeSlots(15, "12hr")}
              handleChange={(value: string) =>
                handleFieldChange(
                  "time",
                  moment(value, "hh:mm A").format("HH:mm")
                )
              }
              value={
                formData.time
                  ? moment(formData.time, "HH:mm").format("hh:mm A")
                  : ""
              }
              externalStyles={styles.fieldStyles}
            />
          </div>

          <div className={classes.fields}>
            <Typography variant="body2">Date *</Typography>
            <DatePicker
              placeholder="Select Date and Time"
              changeFn={(value: string | null) =>
                handleFieldChange("date", value || "")
              }
              value={formData.date}
              boxShadow="0px 1px 4px rgba(0, 0, 0, 0.08)"
              height="5.5vh"
              maxHeight="50px"
              minHeight="35px"
              background="var(--white-color)"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            text="Update Demo"
          />
        </form>
      </Box>
    </Modal>
  );
};

export default memo(UpdateDemoModal);

const styles = {
  fieldStyles: {
    backgroundColor: "var(--white-color) !important",
  },
};
