import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";
import classes from "./feedBack-modal.module.css";
import { Create_New_Billing_Payload_Type } from "@/services/dashboard/superAdmin/billing/billing.types";
import RadioButton from "@/components/global/radio-button/radio-button";
import TextArea from "@/components/global/text-box/text-box";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: Create_New_Billing_Payload_Type) => void;
  loading?: boolean;
  success?: boolean;
}

const FeedBackModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading = false,
  success = false,
}) => {
  const handleFormSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
    },
    [handleAdd, handleClose]
  );

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
        <form className={classes.contentBox} onSubmit={handleFormSubmit}>
          <div className={classes.fields}>
            <p>
              1. On a scale of 1-10, how would you rate your overall experience
              during this session?
            </p>
            <div className={classes.checkBoxWrapper}>
              {Array.from({ length: 10 }, (_, index) => {
                const number = index + 1;
                return (
                  <div key={number} className={classes.checkBoxItem}>
                    <RadioButton
                      radioValue={""}
                      handleChange={() => {}}
                      label1={number.toString()}
                      value1=""
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className={classes.line}></div>
          <div className={classes.fields}>
            <p>
              2. Did the tutor effectively explain the topic or concept during
              the session? (Scale of 1-10)
            </p>
            <div className={classes.checkBoxWrapper}>
              {Array.from({ length: 10 }, (_, index) => {
                const number = index + 1;
                return (
                  <div key={number} className={classes.checkBoxItem}>
                    <RadioButton
                      value1=""
                      radioValue={""}
                      handleChange={() => {}}
                      label1={number.toString()}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className={classes.line}></div>
          <div className={classes.fields}>
            <p>
              3. Were you able to actively participate and ask questions during
              the session?
            </p>
            <TextArea />
          </div>
          <div className={classes.line}></div>
          <div className={classes.fields}>
            <p>
              4. Were there any moments during the session when you felt
              confused or lost? If yes, please describe.
            </p>
            <TextArea />
          </div>
          <div className={classes.line}></div>
          <div className={classes.fields}>
            <p>
              5. Any moments where you felt uncomfortable during the session?
            </p>
            <TextArea />
          </div>
          <div className={classes.line}></div>
          <div className={classes.fields}>
            <p>6. Was the teacher's camera on during the session?</p>
            <div className={classes.checkBoxWrapper}>
              {["Yes", "No"].map((option) => (
                <div key={option} className={classes.checkBoxItem}>
                  <RadioButton
                    value1=""
                    radioValue={""}
                    handleChange={() => {}}
                    label1={option}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className={classes.line}></div>
          <div className={classes.fields}>
            <p>
              7. Did the student/parent decide to enroll after this demo
              session?
            </p>
            <div className={classes.checkBoxWrapper}>
              {["Student Enrolled", "Not Enrolled", "Pending Decision"].map(
                (option) => (
                  <div key={option} className={classes.checkBoxItem}>
                    <RadioButton
                      radioValue={""}
                      handleChange={() => {}}
                      label1={option}
                      value1=""
                    />
                  </div>
                )
              )}
            </div>
          </div>
          <div className={classes.line}></div>
          <div className={classes.fields}>
            <p>
              8. Do you have any suggestions for improvement or specific
              feedback for the tutor or the platform?
            </p>
            <TextArea />
          </div>
          <Button
            loading={loading}
            disabled={loading}
            inlineStyling={styles.buttonStyles}
            text={loading ? "Submitting..." : "Submit Feedback"}
            clickFn={handleFormSubmit}
            type="submit"
          />
        </form>
      </Box>
    </Modal>
  );
};

export default memo(FeedBackModal);

const styles = {
  buttonStyles: {
    width: "100%",
  },
};
