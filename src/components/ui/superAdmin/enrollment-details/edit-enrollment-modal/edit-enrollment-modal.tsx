import React, { useState, memo, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import classes from "./edit-enrollment-modal.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import { toast } from "react-toastify";
import {
  Curriculum_Type,
  Board_Type,
  Subject_Type,
  Grade_Type,
} from "@/services/dashboard/superAdmin/curriulums/curriulums.type";
import { User } from "@/services/dashboard/superAdmin/users/users.type";
import { colors } from "@mui/material";

interface BasicModalProps {
  data?: any;
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleEdit?: (data: any) => void;
  subject?: Subject_Type[];
  board?: Board_Type[];
  curriculum?: Curriculum_Type[];
  grades?: Grade_Type[];
  students?: User[];
  teachers?: User[];
  loading?: boolean;
}

const EditEnrollmentModal: React.FC<BasicModalProps> = ({
  data,
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleEdit,
  subject,
  curriculum,
  board,
  grades,
  teachers,
  students,
  loading,
}) => {
  // Initialize states based on existing data (pre-fetched values)
  // console.log(data);
  const [tutor, setTutor] = useState<any>(null);
  const [newStudentIds, setNewStudentIds] = useState<any>([]);
  const [removeStudentIds, setRemoveStudentIds] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState<any>(null);
  const [gradeId, setGradeId] = useState<any>(null);
  const [boardId, setBoardId] = useState<any>(null);
  const [curriculumId, setCurriculumId] = useState<any>(null);
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [tutorHourlyRate, setTutorHourlyRate] = useState<string>("");

  const handleFormSubmit = () => {
    // Form validation logic
    const validationError = !tutor
      ? "Teacher is required"
      : !subjectId
        ? "Subject is required"
        : !curriculumId
          ? "Curriculum is required"
          : !gradeId
            ? "Grade is required"
            : !boardId
              ? "Board is required"
              : Number(hourlyRate) === null || Number(hourlyRate) <= 0
                ? "Hourly Rate is required"
                : Number(tutorHourlyRate) === null ||
                    Number(tutorHourlyRate) <= 0
                  ? "Tutor Hourly Rate is required"
                  : null;

    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Preparing formData based on current state values
    const formData = {
      tutor_id: tutor?.id,
      status: true,
      subject_id: subjectId?.id,
      curriculum_id: curriculumId?.id,
      grade_id: gradeId?.id,
      board_id: boardId?.id,
      request_rate: "0",
      hourly_rate: Number(hourlyRate),
      tutor_hourly_rate: Number(tutorHourlyRate),
      student_ids:
        newStudentIds?.map((student: any) => student?.id)?.length === 0
          ? null
          : newStudentIds?.map((student: any) => student?.id),
      students_to_remove: removeStudentIds?.map((student) => student?.id) || [],
    };

    handleEdit?.(formData);
  };

  const handleStudentsChange = (event: any, selectedOptions: any[]) => {
    const previousStudentIds = newStudentIds?.map(
      (student: any) => student?.id,
    );
    const studentsToRemove = data?.studentsData?.filter(
      (student: any) => !selectedOptions?.some((s) => s.id === student.id),
    );

    setRemoveStudentIds(studentsToRemove || []);
    setNewStudentIds(selectedOptions);
  };

  useEffect(() => {
    // When data is updated, we can reset the state accordingly if needed.
    setTutor(data?.tutor || null);
    setNewStudentIds(data?.studentsData);
    setSubjectId(data?.subject || null);
    setGradeId(data?.grade || null);
    setBoardId(data?.board || null);
    setCurriculumId(data?.curriculum || null);
    setHourlyRate(data?.hourly_rate || "");
    setTutorHourlyRate(data?.tutor_hourly_rate || "");
  }, [data]);

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

        <div className={classes.section2}>
          <form className={classes.contentBox}>
            <div className={classes.fields}>
              <Typography variant="body2">Teacher</Typography>
              <DropDown
                placeholder="Select Teacher"
                data={teachers?.map((item) => JSON.stringify(item))}
                handleChange={(e: any) => setTutor(JSON.parse(e.target.value))}
                value={tutor && JSON.stringify(tutor)}
                inlineDropDownStyles={styles.dropDownStyles}
                preFetchValue={data?.tutor?.name}
              />
            </div>

            <div className={classes.fields}>
              <Typography variant="body2">Students</Typography>
              <MultiSelectDropDown
                placeholder="Select Students"
                data={students || []}
                handleChange={handleStudentsChange}
                value={(newStudentIds?.length > 0 && newStudentIds) || []}
                inlineDropDownStyles={{ ...styles.dropDownStyles }}
                preFetchValues={newStudentIds}
              />
            </div>

            <div className={classes.fields}>
              <Typography variant="body2">Subject</Typography>
              <DropDown
                placeholder="Select Subject"
                data={subject?.map((item) => JSON.stringify(item))}
                handleChange={(e: any) =>
                  setSubjectId(JSON.parse(e.target.value))
                }
                value={subjectId && JSON.stringify(subjectId)}
                inlineDropDownStyles={styles.dropDownStyles}
                preFetchValue={subjectId?.name}
              />
            </div>

            <div className={classes.fields}>
              <Typography variant="body2">Grade</Typography>
              <DropDown
                placeholder="Select Grade"
                data={grades?.map((item) => JSON.stringify(item))}
                handleChange={(e: any) =>
                  setGradeId(JSON.parse(e.target.value))
                }
                value={gradeId && JSON.stringify(gradeId)}
                inlineDropDownStyles={styles.dropDownStyles}
                preFetchValue={gradeId?.name}
              />
            </div>

            <div className={classes.fields}>
              <Typography variant="body2">Board</Typography>
              <DropDown
                placeholder="Select Board"
                data={board?.map((item) => JSON.stringify(item))}
                handleChange={(e: any) =>
                  setBoardId(JSON.parse(e.target.value))
                }
                value={boardId && JSON.stringify(boardId)}
                inlineDropDownStyles={styles.dropDownStyles}
                preFetchValue={boardId?.name}
              />
            </div>

            <div className={classes.fields}>
              <Typography variant="body2">Curriculum</Typography>
              <DropDown
                placeholder="Select Curriculum"
                data={curriculum?.map((item) => JSON.stringify(item))}
                handleChange={(e: any) =>
                  setCurriculumId(JSON.parse(e.target.value))
                }
                value={curriculumId && JSON.stringify(curriculumId)}
                inlineDropDownStyles={styles.dropDownStyles}
                preFetchValue={curriculumId?.name}
              />
            </div>

            <div className={classes.fields}>
              <Typography variant="body2">Session Hourly Rate</Typography>
              <InputField
                inputBoxStyles={styles.inputStyles}
                inputStyles={styles?.inputStyles?.textField}
                placeholder="Enter session hourly rate"
                value={hourlyRate}
                changeFunc={(e) => setHourlyRate(e.target.value)}
              />
            </div>

            <div className={classes.fields}>
              <Typography variant="body2">Tutor Hourly Rate</Typography>
              <InputField
                inputBoxStyles={styles.inputStyles}
                inputStyles={styles?.inputStyles?.textField}
                placeholder="Enter tutor hourly rate"
                value={tutorHourlyRate}
                changeFunc={(e) => setTutorHourlyRate(e.target.value)}
              />
            </div>
          </form>
          <Button
            inlineStyling={styles.buttonStyles}
            text="Save"
            clickFn={handleFormSubmit}
            loading={loading}
            disabled={loading}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(EditEnrollmentModal);

const styles = {
  buttonStyles: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    height: "10%",
    fill: "#38B6FF",
    filter: "drop-shadow(1px 5px 10px rgba(56, 182, 255, 0.40))",
  },
  inputStyles: {
    width: "100%",
    backgroundColor: "#FFF",
    height: "3vw",
    minHeight: "1vw",
    boxShadow: "none",
    fill: "#FFF",
    filter: "drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.08))",
    textField: {
      color: "var(--black-color)",
    },
  },
  dropDownStyles: {
    width: "100%",
    background: "var(--white-color) !important",
    height: "5.5vh",
    minHeight: "40px",
    boxShadow: "none !important",
    fill: "var(--white-color)",
    filter: "drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.08))",
  },
};
