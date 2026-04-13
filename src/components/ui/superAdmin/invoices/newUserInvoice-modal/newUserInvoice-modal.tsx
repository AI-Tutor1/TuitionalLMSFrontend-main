import React, { memo, useCallback, useMemo, useEffect } from "react";
import moment from "moment";
import Image from "next/image";
import classes from "./newUserInvoice-modal.module.css";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import CustomPhoneInput from "@/components/global/phone-number/phone-number";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";
import DatePicker from "@/components/global/date-picker/date-picker";
import { Country } from "country-state-city";
import { GenerateNewUserInvoice_Api_Payload_Type } from "@/types/leads/leads.type";
import { emailRegex } from "@/utils/helpers/regex";

// Types
interface ResourceItem {
  id: string | number;
  name: string;
}

interface EnrollmentItem {
  enrollmentName: string;
  subject: ResourceItem;
  grade: ResourceItem;
  curriculum: ResourceItem | null;
  board: ResourceItem | null;
  board_id: string | number;
  curriculum_id: string | number | null;
  subject_id: string | number;
  grade_id: string | number;
  hourly_rate: number;
  no_of_classes: number;
}

interface FormData {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentGender: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  parentGender: string;
  lmsFees: string;
  registrationFees: string;
  due_date: moment.Moment | null;
  country: string;
  // Current enrollment fields
  subjectId: ResourceItem | null;
  gradeId: ResourceItem | null;
  boardId: ResourceItem | null;
  curriculumId: ResourceItem | null;
  hourlyRate: string;
  numberOfClasses: string;
  // Array of enrollments
  enrollments: EnrollmentItem[];
}

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: GenerateNewUserInvoice_Api_Payload_Type) => void;
  loading?: boolean;
  success?: boolean;
}

// Constants
const GENDER_OPTIONS = ["Male", "Female"] as const;

const NewUserInvoiceModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading = false,
  success,
}) => {
  const { subject, curriculum, board, grades } = useAppSelector(
    (state) => state.resources,
  );

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onSubmit",
    defaultValues: {
      studentName: "",
      studentEmail: "",
      studentPhone: "",
      studentGender: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      parentGender: "",
      registrationFees: "",
      due_date: null,
      country: "",
      subjectId: null,
      gradeId: null,
      boardId: null,
      curriculumId: null,
      hourlyRate: "",
      numberOfClasses: "",
      enrollments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "enrollments",
  });

  const dropdownData = useMemo(
    () => ({
      subject: subject?.map((item) => JSON.stringify(item)) || [],
      grades: grades?.map((item) => JSON.stringify(item)) || [],
      board: board?.map((item) => JSON.stringify(item)) || [],
      curriculum: curriculum?.map((item) => JSON.stringify(item)) || [],
      country: Country.getAllCountries()?.map((item) => item?.name) || [],
    }),
    [subject, grades, board, curriculum],
  );

  const todoListHeadData = ["Enrollment", "Hourly Rate", "Classes", "Action"];
  // Add enrollment handler
  const handleAddEnrollment = useCallback(() => {
    const values = getValues();

    // Validate enrollment fields
    const validationErrors: string[] = [];

    if (!values.subjectId) validationErrors.push("Subject");
    if (!values.gradeId) validationErrors.push("Grade");
    if (!values.boardId) validationErrors.push("Board");
    if (!values.curriculumId) validationErrors.push("Curriculum");
    if (!values.hourlyRate?.trim()) validationErrors.push("Hourly rate");
    if (!values.numberOfClasses?.trim())
      validationErrors.push("Number of classes");

    if (validationErrors.length > 0) {
      toast.error(`Please fill in: ${validationErrors.join(", ")}`);
      return;
    }

    // Validate numeric values
    const hourlyRateNum = parseFloat(values.hourlyRate);
    const numberOfClassesNum = parseInt(values.numberOfClasses);

    if (isNaN(hourlyRateNum) || hourlyRateNum <= 0) {
      toast.error("Please enter a valid hourly rate");
      return;
    }
    if (isNaN(numberOfClassesNum) || numberOfClassesNum <= 0) {
      toast.error("Please enter a valid number of classes");
      return;
    }

    const newEnrollment: EnrollmentItem = {
      enrollmentName: `${values.subjectId?.name} - ${values.gradeId?.name} - ${values.curriculumId?.name} - ${values.boardId?.name}`,
      subject: values.subjectId!,
      grade: values.gradeId!,
      curriculum: values.curriculumId!,
      board: values.boardId!,
      board_id: values.boardId?.id || "",
      curriculum_id: values.curriculumId?.id || null,
      subject_id: values.subjectId!.id,
      grade_id: values.gradeId!.id,
      hourly_rate: hourlyRateNum,
      no_of_classes: numberOfClassesNum,
    };

    append(newEnrollment);

    // Reset only enrollment-specific fields
    setValue("subjectId", null);
    setValue("gradeId", null);
    setValue("boardId", null);
    setValue("curriculumId", null);
    setValue("hourlyRate", "");
    setValue("numberOfClasses", "");

    toast.success("Enrollment added successfully!");
  }, [append, getValues, setValue]);

  // Form submit handler
  const onSubmit = useCallback(
    (data: FormData) => {
      // Create payload
      const payload: GenerateNewUserInvoice_Api_Payload_Type = {
        student_name: data.studentName,
        parent_name: data.parentName,
        student_contact: data.studentPhone,
        parent_contact: data.parentPhone,
        student_email: data.studentEmail,
        parent_email: data.parentEmail,
        student_gender: data.studentGender,
        parent_gender: data.parentGender,
        lms_fee: Number(data.lmsFees),
        registration_fee: Number(data.registrationFees),
        due_date: moment(data.due_date).utc().format("YYYY-MM-DD") || "",
        country: data.country,
        enrollments: data.enrollments?.map((enrollment) => ({
          subject_id: Number(enrollment.subject_id),
          hourly_rate: Number(enrollment.hourly_rate),
          board_id: Number(enrollment.board_id),
          curriculum_id: Number(enrollment.curriculum_id),
          grade_id: Number(enrollment.grade_id),
          no_of_classes: Number(enrollment.no_of_classes),
        })),
      };
      try {
        // console.log(payload);
        handleAdd?.(payload);
      } catch (error) {
        toast.error("Failed to generate invoice");
      }
    },
    [handleAdd],
  );

  const onError = useCallback((errors: any) => {
    const error =
      errors.studentName ||
      errors.studentEmail ||
      errors.studentPhone ||
      errors.studentGender ||
      errors.parentName ||
      errors.parentEmail ||
      errors.parentPhone ||
      errors.parentGender ||
      errors.due_date ||
      errors.registrationFees ||
      errors.lmsFees ||
      errors.country;

    if (error) {
      toast.error(error.message);
    } else {
      return;
    }
  }, []);

  useEffect(() => {
    if (success) {
      reset();
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
          {heading && <p>{heading}</p>}
          {subHeading && <p>{subHeading}</p>}
        </div>
        <form
          className={classes.contentBox}
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          <div className={classes.roleContainer}>
            <div className={classes.fields}>
              <Typography variant="body2">Student Name *</Typography>
              <Controller
                name="studentName"
                control={control}
                rules={{
                  required: "Student name is required",
                  minLength: {
                    value: 2,
                    message: "Student name must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <InputField
                    inputBoxStyles={styles.fieldStyles}
                    placeholder="Enter student name"
                    value={field.value}
                    changeFunc={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Student Email *</Typography>
              <Controller
                name="studentEmail"
                control={control}
                rules={{
                  required: "Student email is required",
                  pattern: {
                    value: emailRegex,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <InputField
                    inputBoxStyles={styles.fieldStyles}
                    placeholder="Enter student email"
                    value={field.value}
                    changeFunc={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Student Phone Number *</Typography>
              <Controller
                name="studentPhone"
                control={control}
                rules={{
                  required: "Student name is required",
                  minLength: {
                    value: 2,
                    message: "Student name must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <CustomPhoneInput
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Student Gender *</Typography>
              <Controller
                name="studentGender"
                control={control}
                rules={{
                  required: "Student gender is required",
                }}
                render={({ field }) => (
                  <DropDownSimple
                    placeholder="Select Gender"
                    data={GENDER_OPTIONS as unknown as string[]}
                    handleChange={field.onChange}
                    value={field.value}
                    externalStyles={styles.fieldStyles}
                  />
                )}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Parent Name *</Typography>
              <Controller
                name="parentName"
                control={control}
                rules={{
                  required: "Parent name is required",
                  minLength: {
                    value: 2,
                    message: "Parent name must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <InputField
                    inputBoxStyles={styles.fieldStyles}
                    placeholder="Enter parent name"
                    value={field.value}
                    changeFunc={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Parent Email *</Typography>
              <Controller
                name="parentEmail"
                control={control}
                rules={{
                  required: "Parent email is required",
                  pattern: {
                    value: emailRegex,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <InputField
                    inputBoxStyles={styles.fieldStyles}
                    placeholder="Enter parent email"
                    value={field.value}
                    changeFunc={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Parent Phone Number *</Typography>
              <Controller
                name="parentPhone"
                control={control}
                rules={{
                  required: "Parent phone number is required",
                }}
                render={({ field }) => (
                  <CustomPhoneInput
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Parent Gender *</Typography>
              <Controller
                name="parentGender"
                control={control}
                rules={{
                  required: "Parent gender is required",
                }}
                render={({ field }) => (
                  <DropDownSimple
                    placeholder="Select gender"
                    data={GENDER_OPTIONS as unknown as string[]}
                    handleChange={field.onChange}
                    value={field.value}
                    externalStyles={styles.fieldStyles}
                  />
                )}
              />
            </div>
          </div>
          <div className={classes.resourcesBox}>
            <div className={classes.subFields}>
              <Typography variant="body2">Subject *</Typography>
              <Controller
                name="subjectId"
                control={control}
                render={({ field }) => (
                  <DropDown
                    placeholder="Select subject"
                    data={dropdownData.subject}
                    handleChange={(e: any) => {
                      const value = e.target.value
                        ? JSON.parse(e.target.value)
                        : null;
                      field.onChange(value);
                    }}
                    value={field.value ? JSON.stringify(field.value) : ""}
                    inlineDropDownStyles={styles.fieldStyles}
                  />
                )}
              />
            </div>
            <div className={classes.subFields}>
              <Typography variant="body2">Grade *</Typography>
              <Controller
                name="gradeId"
                control={control}
                render={({ field }) => (
                  <DropDown
                    placeholder="Select grade"
                    data={dropdownData.grades}
                    handleChange={(e: any) => {
                      const value = e.target.value
                        ? JSON.parse(e.target.value)
                        : null;
                      field.onChange(value);
                    }}
                    value={field.value ? JSON.stringify(field.value) : ""}
                    inlineDropDownStyles={styles.fieldStyles}
                  />
                )}
              />
            </div>
            <div className={classes.subFields}>
              <Typography variant="body2">Board *</Typography>
              <Controller
                name="boardId"
                control={control}
                render={({ field }) => (
                  <DropDown
                    placeholder="Select board"
                    data={dropdownData.board}
                    handleChange={(e: any) => {
                      const value = e.target.value
                        ? JSON.parse(e.target.value)
                        : null;
                      field.onChange(value);
                    }}
                    value={field.value ? JSON.stringify(field.value) : ""}
                    inlineDropDownStyles={styles.fieldStyles}
                  />
                )}
              />
            </div>
            <div className={classes.subFields}>
              <Typography variant="body2">Curriculum *</Typography>
              <Controller
                name="curriculumId"
                control={control}
                render={({ field }) => (
                  <DropDown
                    placeholder="Select curriculum"
                    data={dropdownData.curriculum}
                    handleChange={(e: any) => {
                      const value = e.target.value
                        ? JSON.parse(e.target.value)
                        : null;
                      field.onChange(value);
                    }}
                    value={field.value ? JSON.stringify(field.value) : ""}
                    inlineDropDownStyles={styles.fieldStyles}
                  />
                )}
              />
            </div>
            <div className={classes.subFields}>
              <Typography variant="body2">Hourly Rate *</Typography>
              <Controller
                name="hourlyRate"
                control={control}
                render={({ field }) => (
                  <InputField
                    inputBoxStyles={styles.fieldStyles}
                    placeholder="Enter hourly rate"
                    value={field.value}
                    changeFunc={(e) => field.onChange(e.target.value)}
                    type="number"
                  />
                )}
              />
            </div>
            <div className={classes.subFields}>
              <Typography variant="body2">No of Classes *</Typography>
              <Controller
                name="numberOfClasses"
                control={control}
                render={({ field }) => (
                  <InputField
                    inputBoxStyles={styles.fieldStyles}
                    placeholder="Enter no of classes"
                    value={field.value}
                    changeFunc={(e) => field.onChange(e.target.value)}
                    type="number"
                  />
                )}
              />
            </div>
            <div className={classes.addButtonBox}>
              <Tooltip title="Add enrollment to list">
                <span
                  className={classes.addButton}
                  onClick={handleAddEnrollment}
                >
                  <AddOutlinedIcon
                    sx={{
                      height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                      width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                    }}
                  />
                </span>
              </Tooltip>
            </div>
          </div>
          <div className={classes.todoList}>
            <div className={classes.todoListHead}>
              {todoListHeadData?.map((item, index) => (
                <p
                  key={index}
                  className={classes.todoListHeadColumn}
                  style={{ width: index === 0 ? "40%" : "20%" }}
                >
                  {item}
                </p>
              ))}
            </div>
            <div className={classes.todoBody}>
              {fields?.map((enrollment, enrollmentIndex) => (
                <div
                  key={enrollment.id}
                  className={classes.todoListEnrollmentRow}
                >
                  <p
                    className={classes.todoListRowColumn}
                    style={{ width: "40%" }}
                  >
                    {enrollment?.enrollmentName}
                  </p>
                  <p className={classes.todoListRowColumn}>
                    AED {enrollment?.hourly_rate}
                  </p>
                  <p className={classes.todoListRowColumn}>
                    {enrollment?.no_of_classes}
                  </p>
                  <p className={classes.todoListRowColumn}>
                    <span
                      className={classes.iconBox}
                      onClick={() => {
                        remove(enrollmentIndex);
                        toast.success("Enrollment deleted successfully!");
                      }}
                    >
                      <Image
                        src="/assets/svgs/delete.svg"
                        alt="delete"
                        width={0}
                        height={0}
                        style={{
                          width: "var(--regular18-)",
                          height: "var(--regular18-)",
                        }}
                      />
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className={classes.afterFields}>
            <div className={classes.subFields}>
              <Typography variant="body2">Registration Fees *</Typography>
              <Controller
                name="registrationFees"
                control={control}
                rules={{
                  required: "Registration fees is required",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Please enter a valid number",
                  },
                }}
                render={({ field }) => (
                  <InputField
                    inputBoxStyles={styles.fieldStyles}
                    placeholder="Enter registration fees"
                    value={field.value}
                    changeFunc={(e) => field.onChange(e.target.value)}
                    type="number"
                  />
                )}
              />
            </div>
            <div className={classes.subFields}>
              <Typography variant="body2">LMS Fees *</Typography>
              <Controller
                name="lmsFees"
                control={control}
                rules={{
                  required: "LMS fees is required",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Please enter a valid number",
                  },
                }}
                render={({ field }) => (
                  <InputField
                    inputBoxStyles={styles.fieldStyles}
                    placeholder="Enter LMS fees"
                    value={field.value}
                    changeFunc={(e) => field.onChange(e.target.value)}
                    type="number"
                  />
                )}
              />
            </div>
            <div className={classes.subFields}>
              <Typography variant="body2">Due Date *</Typography>
              <Controller
                name="due_date"
                control={control}
                rules={{
                  required: "Due date is required",
                  pattern: {
                    value:
                      /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
                    message: "Please enter a valid date",
                  },
                }}
                render={({ field }) => (
                  <DatePicker
                    width="100%"
                    value={field.value ? String(field.value) : null}
                    changeFn={(e) => {
                      field.onChange(e ? moment(e).format("YYYY-MM-DD") : null);
                    }}
                    background={styles?.fieldStyles?.background}
                    boxShadow={styles?.fieldStyles?.boxShadow}
                  />
                )}
              />
            </div>
            <div className={classes.subFields}>
              <Typography variant="body2">Country *</Typography>
              <Controller
                name="country"
                control={control}
                rules={{
                  required: "Country is required",
                  minLength: {
                    value: 3,
                    message: "Country must be at least 3 characters",
                  },
                }}
                render={({ field }) => (
                  <DropDownSimple
                    placeholder="Select country"
                    data={dropdownData.country}
                    handleChange={field.onChange}
                    value={field.value}
                    externalStyles={styles.fieldStyles}
                  />
                )}
              />
            </div>
          </div>
          <Button
            inlineStyling={{
              ...styles.buttonStyles,
              width: styles.fieldStyles.width,
            }}
            text="Generate Invoice"
            type="submit"
            loading={loading}
            disabled={loading}
          />
        </form>
      </Box>
    </Modal>
  );
};

export default memo(NewUserInvoiceModal);

const styles = {
  buttonStyles: {
    position: "relative" as const,
    zIndex: 2,
  },
  fieldStyles: {
    width: "100%",
    background: "var(--main-white-color) !important",
    boxShadow: "var(--main-inner-boxShadow-color) !important",
  },
} as const;
