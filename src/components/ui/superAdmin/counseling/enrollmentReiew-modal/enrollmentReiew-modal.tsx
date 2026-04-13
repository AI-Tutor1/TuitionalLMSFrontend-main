import React from "react";
import { Modal, Box } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import Button from "@/components/global/button/button";
import TextBox from "@/components/global/text-box/text-box";
import classes from "./enrollmentReiew-modal.module.css";

interface EnrollmenReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: { review: string }) => void;
  loading?: boolean;
  success?: boolean;
}

interface FormData {
  review: string;
}

const EnrollmenReviewModal: React.FC<EnrollmenReviewModalProps> = ({
  isOpen,
  onClose,
  heading,
  subHeading,
  handleAdd,
  loading,
  success,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      review: "",
    },
  });

  const onSubmit = (data: FormData) => {
    if (handleAdd) {
      handleAdd(data);
      reset();
    }
  };
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="review-modal-title"
      aria-describedby="review-modal-description"
    >
      <Box className={classes.mainBox}>
        <div className={classes.headingBox}>
          {heading && (
            <p>{heading.endsWith("s") ? heading.slice(0, -1) : heading}</p>
          )}
          {subHeading && <p>{subHeading}</p>}
        </div>

        <div className={classes.section2}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={classes.contentBox}
          >
            <div className={classes.fields}>
              <p>Review *</p>
              <Controller
                control={control}
                name="review"
                rules={{ required: "Review is required" }}
                render={({ field }) => (
                  <TextBox
                    placeholder="Enter your teacher review here..."
                    className={classes.noFocus}
                    {...field}
                  />
                )}
              />
              {errors.review && (
                <span style={{ color: "red", fontSize: "0.8rem" }}>
                  {errors.review.message}
                </span>
              )}
            </div>

            <Button
              loading={loading}
              disabled={loading}
              inlineStyling={styles.buttonStyles}
              text="Submit Review"
              type="submit"
            />
          </form>
        </div>
      </Box>
    </Modal>
  );
};

export default EnrollmenReviewModal;

const styles = {
  dropDownStyles: {
    width: "100%",
    background: "var(--white-color) !important",
    boxShadow: "none !important",
    filter: "drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.08))",
  },
  buttonStyles: {
    width: "100%",
    filter: "drop-shadow(1px 5px 10px rgba(56, 182, 255, 0.40))",
  },
  inputStyles: {
    width: "100%",
    backgroundColor: "var(--white-color)",
    boxShadow: "none",
    filter: "drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.08))",
  },
};
