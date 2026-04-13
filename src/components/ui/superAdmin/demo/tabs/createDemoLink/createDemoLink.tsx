import React, { useReducer, useCallback, useMemo, useEffect } from "react";
import classes from "./createDemoLink.module.css";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import Typography from "@mui/material/Typography";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import InputField from "@/components/global/input-field/input-field";
import Button from "@/components/global/button/button";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import VideoCameraFrontOutlinedIcon from "@mui/icons-material/VideoCameraFrontOutlined";
import moment from "moment";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { MyAxiosError } from "@/services/error.type";
import { createNewDemo } from "@/services/dashboard/superAdmin/demo/demo";
import { Create_Demo_Payload_Type } from "@/types/demo/createDemo.types";
import generateTimeSlots from "@/const/dashboard/time-slots";
import DatePicker from "@/components/global/date-picker/date-picker";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";

// Define proper TypeScript interface
interface FormData {
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

// Define action types
type FormAction =
  | {
      type: "SET_FIELD";
      field: keyof FormData;
      value: string | number | Record<string, any> | null;
    }
  | { type: "RESET_FORM" };

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

// Reducer function
const formReducer = (state: FormData, action: FormAction): FormData => {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "RESET_FORM":
      return emptyState;
    default:
      return state;
  }
};

const CreateDemoLink = () => {
  const { token } = useAppSelector((state) => state?.user);
  const { teachers, parents } = useAppSelector((state) => state?.usersByGroup);
  const { subject, curriculum, grades } = useAppSelector(
    (state) => state?.resources
  );

  // Replace useState with useReducer
  const [formData, dispatch] = useReducer(formReducer, emptyState);

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

  // Updated field change handler to use dispatch
  const handleFieldChange = useCallback(
    <K extends keyof FormData>(
      field: K,
      value: string | number | Record<string, any> | null
    ) => {
      dispatch({ type: "SET_FIELD", field, value });
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

  const handleCreateDemo = useMutation({
    mutationFn: (payload: Create_Demo_Payload_Type) =>
      createNewDemo(payload, {
        token,
      }),
    onSuccess: (data: any) => {
      if (data.message) {
        return toast.success(data.message);
      }
      toast.success("Demo Created Successfully");
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message
            ? `${axiosError?.response?.data?.message}`
            : axiosError?.response?.data?.error
            ? `${axiosError?.response?.data?.error}`
            : `${axiosError?.response?.status} ${axiosError?.response?.statusText}`
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!isFormValid) {
        toast.error("Form is not valid. Please fill all required fields.");
        return;
      }

      const payload = {
        ...formData,
        time: moment(formData.time, "HH:mm").utc().format("HH:mm:ss"),
        date: moment(formData.date, "YYYY-MM-DD").utc().format("YYYY-MM-DD"),
        tutorId: (formData.tutorId as any)?.id,
        studentName: formData.studentName.trim(),
        parentName: (formData.parentName as any)?.name,
        subjectId: (formData.subjectId as any)?.id,
        gradeId: (formData.gradeId as any)?.id,
        curriculumId: (formData.curriculumId as any)?.id,
      };

      handleCreateDemo.mutate({ ...payload });
    },
    [formData, isFormValid]
  );

  useEffect(() => {
    if (handleCreateDemo?.isSuccess) {
      // Reset form using dispatch instead of setFormData
      dispatch({ type: "RESET_FORM" });
    }
  }, [handleCreateDemo?.isSuccess]);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div>
          <AddOutlinedIcon sx={{ width: "2rem", height: "2rem" }} />
          <p>Create Demo Link</p>
        </div>
        <p>
          Generate a new Google Meet demo session link for one-on-one student
          sessions
        </p>
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
            value={formData.subjectId ? JSON.stringify(formData.subjectId) : ""}
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
              formData.curriculumId ? JSON.stringify(formData.curriculumId) : ""
            }
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
            value={formData.time || ""}
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
          />
        </div>
      </form>

      <Button
        inlineStyling={{
          width: "100%",
          borderRadius: "7.5px",
        }}
        text="Generate Google Meet Demo Link"
        icon={<VideoCameraFrontOutlinedIcon />}
        clickFn={handleSubmit}
        disabled={handleCreateDemo.isPending}
        loading={handleCreateDemo.isPending}
      />
    </div>
  );
};

export default CreateDemoLink;
