import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Button from "@/components/global/button/button";
import classes from "./feedBackReport-modal.module.css";
import { Create_New_Billing_Payload_Type } from "@/services/dashboard/superAdmin/billing/billing.types";
import RadioButton from "@/components/global/radio-button/radio-button";
import TextArea from "@/components/global/text-box/text-box";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

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
        <div className={classes.contentBox}>
          <div className={classes.infoBox}>
            <div className={classes.infoBoxFields}>
              <p>Student</p>
              <p>Rahul Sharma</p>
            </div>
            <div className={classes.infoBoxFields}>
              <p>Teacher</p>
              <p>John Doe</p>
            </div>{" "}
            <div className={classes.infoBoxFields}>
              <p>Subject</p>
              <p>Mathematics</p>
            </div>{" "}
            <div className={classes.infoBoxFields}>
              <p>Demo Date</p>
              <p>2024-01-15</p>
            </div>{" "}
            <div className={classes.infoBoxFields}>
              <p>Topic Covered</p>
              <p>Quadratic Equations</p>
            </div>{" "}
          </div>
          {/* performance summary */}
          <div className={classes.performanceSummary}>
            <p className={classes.performanceSummaryTitle}>
              Performance Summary
            </p>
            <div className={classes.performanceFieldsBox}>
              <div
                className={classes.performanceFields}
                style={{
                  backgroundColor: "rgba(219, 234, 254,1)",
                  color: "rgba(30, 64, 175, 1)",
                }}
              >
                <p>Concept Clarity</p>
                <span>Good</span>
              </div>
              <div
                className={classes.performanceFields}
                style={{
                  backgroundColor: "rgba(220, 252, 231, 1)",
                  color: "rgba(22, 101, 52, 1)",
                }}
              >
                <p>Confidence Level</p>
                <span>High</span>
              </div>{" "}
              <div
                className={classes.performanceFields}
                style={{
                  backgroundColor: "rgba(255, 252, 222, 1)",
                  color: "rgba(133, 77, 14, 1)",
                }}
              >
                <p>Engagement</p>
                <span>Very High</span>
              </div>
              <div
                className={classes.performanceFields}
                style={{ backgroundColor: "rgba(219, 234, 254,1)" }}
              >
                <p>Learning Style</p>
                <span>Visual</span>
              </div>
            </div>
          </div>
          <div className={classes.performanceSummary}>
            <p className={classes.performanceSummaryTitle}>
              Detailed Assessment{" "}
            </p>
            <div className={classes.assessmentFieldsBox}>
              <div className={classes.assessmentFields}>
                <p>Communication & Expression</p>
                <span
                  style={{
                    backgroundColor: "rgba(219, 234, 254,1)",
                  }}
                >
                  Clear and articulate{" "}
                </span>
              </div>
              <div className={classes.assessmentFields}>
                <p>Communication & Expression</p>
                <span
                  style={{
                    backgroundColor: "rgba(255, 252, 222, 1)",
                  }}
                >
                  Clear and articulate{" "}
                </span>
              </div>
              <div className={classes.assessmentFields}>
                <p>Key Strengths</p>
                <span
                  style={{
                    backgroundColor: "rgba(220, 252, 231, 1)",
                  }}
                >
                  Strong analytical thinking, quick to grasp new concepts, asks
                  relevant questions{" "}
                </span>
              </div>
              <div className={classes.assessmentFields}>
                <p>Teacher Recommendations</p>
                <span
                  style={{
                    backgroundColor: "rgba(219, 234, 254,1)",
                  }}
                >
                  Recommend advanced problem-solving sessions. Student shows
                  potential for competitive mathematics.{" "}
                </span>
              </div>
            </div>
          </div>
          <div className={classes.assessmentFields}>
            <div className={classes.footerBox}>
              <span>
                Recommend advanced problem-solving sessions. Student shows
                potential for competitive mathematics.{" "}
              </span>
              <span>Status: Submitted</span>
            </div>
          </div>

          <div className={classes.buttonBox}>
            <Button
              loading={loading}
              disabled={loading}
              inlineStyling={{
                ...styles.buttonStyles,
                backgroundColor: "transparent",
                color: "var(--black-color)",
                border: "1px solid var(--black-color)",
              }}
              text={"Close"}
              clickFn={() => {}}
              type="submit"
            />
            <Button
              loading={loading}
              disabled={loading}
              inlineStyling={{
                ...styles.buttonStyles,
                backgroundColor: "transparent",
                color: "var(--black-color)",
                border: "1px solid var(--black-color)",
              }}
              text={"Download PDF"}
              clickFn={() => {}}
              type="submit"
              icon={<FileDownloadOutlinedIcon />}
            />
            <Button
              loading={loading}
              disabled={loading}
              inlineStyling={styles.buttonStyles}
              text={loading ? "Sharing..." : "Share with Parent"}
              clickFn={() => {}}
              type="submit"
              icon={<FileUploadOutlinedIcon />}
            />
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default memo(FeedBackModal);

const styles = {
  buttonStyles: {
    width: "max-content",
  },
};
