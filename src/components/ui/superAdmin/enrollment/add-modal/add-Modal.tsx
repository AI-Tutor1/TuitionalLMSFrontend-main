import React, { useState, memo, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./add-modal.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import { toast } from "react-toastify";
import Typography from "@mui/material/Typography";
import {
  Curriculum_Type,
  Board_Type,
  Subject_Type,
  Grade_Type,
} from "@/services/dashboard/superAdmin/curriulums/curriulums.type";
import { User } from "@/services/dashboard/superAdmin/uers/users.type";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: any;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  subject?: Subject_Type[];
  board?: Board_Type[];
  curriculum?: Curriculum_Type[];
  grades?: Grade_Type[];
  students?: User[];
  teachers?: User[];
  loading?: boolean | any;
  success?: any;
}

const AddModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  subject,
  curriculum,
  board,
  grades,
  teachers,
  students,
  loading,
  success,
}) => {
  const [tutorId, setTutorId] = useState<User | null>(null);
  const [studentIds, setStudentIds] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState<Subject_Type | null>(null);
  const [gradeId, setGradeId] = useState<Grade_Type | null>(null);
  const [boardId, setBoardId] = useState<Board_Type | null>(null);
  const [curriculumId, setCurriculumId] = useState<Curriculum_Type | null>(
    null
  );
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [tutorHourlyRate, setTutorHourlyRate] = useState<string>("");
  const [leadGenerator, setLeadGenerator] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  const handleFormSubmit = () => {
    const validationError = !tutorId
      ? "Teacher is required"
      : !subjectId
      ? "Subject is required"
      : !curriculumId
      ? "Curriculum is required"
      : !gradeId
      ? "Grade is required"
      : !boardId
      ? "Board is required"
      : Number(hourlyRate) <= 0
      ? "Hourly Rate is required"
      : Number(tutorHourlyRate) <= 0
      ? "Tutor Hourly Rate is required"
      : null;

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const formData = {
      tutor_id: tutorId?.id,
      subject_id: subjectId?.id,
      on_break: false,
      hourly_rate: Number(hourlyRate),
      request_rate: "0",
      tutor_hourly_rate: Number(tutorHourlyRate),
      curriculum_id: curriculumId?.id,
      grade_id: gradeId?.id,
      board_id: boardId?.id,
      student_ids: studentIds,
      lead_generator: leadGenerator,
      priority: priority,
    };
    // Submit the form
    handleAdd?.(formData);
  };

  useEffect(() => {
    if (success) {
      setTutorId(null);
      setStudentIds([]);
      setSubjectId(null);
      setGradeId(null);
      setBoardId(null);
      setCurriculumId(null);
      setHourlyRate("");
      setTutorHourlyRate("");
    }
  }, [success]);

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
            <p>{heading.endsWith("s") ? heading.slice(0, -1) : heading}</p>
          )}
          {subHeading && <p>{subHeading}</p>}
        </div>
        <div className={classes.section2}>
          <form className={classes.contentBox}>
            <div className={classes.fields}>
              <Typography variant="body2">Teacher</Typography>
              <DropDown
                placeholder="Select teacher"
                data={teachers?.map((item) => JSON.stringify(item))}
                handleChange={(e: any) =>
                  setTutorId(JSON.parse(e.target.value))
                }
                value={JSON.stringify(tutorId) || ""}
                inlineDropDownStyles={styles?.dropDownStyles}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Students</Typography>
              <MultiSelectDropDown
                placeholder="Select students"
                data={students || []}
                handleChange={(event: any, selectedOptions: any[]) =>
                  setStudentIds(selectedOptions?.map((student) => student?.id))
                }
                value={students?.filter((student) =>
                  studentIds.includes(student?.id)
                )}
                inlineDropDownStyles={{
                  ...styles?.dropDownStyles,
                  overflowX: "auto",
                }}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Subject</Typography>
              <DropDown
                placeholder="Select subject"
                data={subject?.map((item) => JSON.stringify(item))}
                handleChange={(e: any) =>
                  setSubjectId(JSON.parse(e.target.value))
                }
                value={JSON.stringify(subjectId) || ""}
                inlineDropDownStyles={styles?.dropDownStyles}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Grade</Typography>
              <DropDown
                placeholder="Select grade"
                data={grades?.map((item) => JSON.stringify(item))}
                handleChange={(e: any) =>
                  setGradeId(JSON.parse(e.target.value))
                }
                value={JSON.stringify(gradeId) || ""}
                inlineDropDownStyles={styles?.dropDownStyles}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Board</Typography>
              <DropDown
                placeholder="Select board"
                data={board?.map((item) => JSON.stringify(item))}
                handleChange={(e: any) =>
                  setBoardId(JSON.parse(e.target.value))
                }
                value={JSON.stringify(boardId) || ""}
                inlineDropDownStyles={styles?.dropDownStyles}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Curriculum</Typography>
              <DropDown
                placeholder="Select curriculum"
                data={curriculum?.map((item) => JSON.stringify(item))}
                handleChange={(e: any) =>
                  setCurriculumId(JSON.parse(e.target.value))
                }
                value={JSON.stringify(curriculumId) || ""}
                inlineDropDownStyles={styles?.dropDownStyles}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Session Hourly Rate</Typography>
              <InputField
                inputBoxStyles={styles?.inputStyles}
                placeholder="Enter session hourly rate"
                value={hourlyRate.toString()}
                changeFunc={(e) => setHourlyRate(e.target.value)}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Tutor Hourly Rate</Typography>
              <InputField
                inputBoxStyles={styles?.inputStyles}
                placeholder="Enter tutor hourly rate"
                value={tutorHourlyRate.toString()}
                changeFunc={(e) => setTutorHourlyRate(e.target.value)}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Lead Generator</Typography>
              <InputField
                inputBoxStyles={styles?.inputStyles}
                placeholder="Enter lead generator"
                value={leadGenerator}
                changeFunc={(e) => setLeadGenerator(e.target.value)}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Priority</Typography>
              <DropDownSimple
                placeholder="Select priority"
                data={["Low", "Moderate", "High"]}
                handleChange={(value: string) => setPriority(value)}
                value={priority || ""}
                externalStyles={styles?.dropDownStyles}
              />
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
