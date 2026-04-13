import React, { useState, memo, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import classes from "./newPolicy-Modal.module.css";
import Button from "@/components/global/button/button";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";
import InputField from "@/components/global/input-field/input-field";
import { toast } from "react-toastify";
import Quill from "@/components/global/quill/quill";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: any;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  loading?: boolean | any;
  success?: any;
}

const categories = [
  "Professional Standards",
  "Academic Policies",
  "Safety & Security",
  "Technology",
  "Communication",
  "HR Policies",
  "Student Affairs",
  "Finance",
] as const;

const NewPolicyModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading,
  success,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [policyTitle, setPolicyTitle] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [policyContent, setPolicyContent] = useState<string>("");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    if (!policyTitle.trim()) {
      toast.error("Please enter a policy title");
      return;
    }
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }
    if (!policyContent.trim() || policyContent === "<p><br></p>") {
      toast.error("Please enter policy content");
      return;
    }

    const formData = {
      assigned_to: selectedRole,
      title: policyTitle,
      category: selectedCategory,
      content: policyContent,
    };

    handleAdd?.(formData);
  };

  useEffect(() => {
    if (success) {
      setSelectedRole("");
      setPolicyTitle("");
      setSelectedCategory("");
      setPolicyContent("");
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            borderBottom: "1px solid #e2e2e2",
          }}
        >
          <div className={classes.headingBox}>
            {heading && (
              <p>{heading.endsWith("s") ? heading.slice(0, -1) : heading}</p>
            )}
            {subHeading && <p>{subHeading}</p>}
          </div>
        </div>
        <form className={classes.contentBox} onSubmit={handleFormSubmit}>
          <div className={classes.fields}>
            <Typography variant="body2">Policy Title</Typography>
            <InputField
              value={policyTitle}
              changeFunc={(e: any) => setPolicyTitle(e.target.value)}
              placeholder="Policy title"
              inputBoxStyles={styles?.dropDownInputStyles}
            />
          </div>
          <div className={classes.fields}>
            <Typography variant="body2">Select Role</Typography>
            <DropDownSimple
              placeholder="Select role"
              data={["Teacher", "Student", "Parent"]}
              handleChange={(value: string) => setSelectedRole(value)}
              value={selectedRole}
              externalStyles={styles?.dropDownInputStyles}
            />
          </div>
          <div className={classes.fields}>
            <Typography variant="body2">Category</Typography>
            <DropDownSimple
              placeholder="Select category"
              data={categories}
              handleChange={(value: string) => setSelectedCategory(value)}
              value={selectedCategory}
              externalStyles={styles?.dropDownInputStyles}
            />
          </div>
          <div className={classes.fields}>
            <Typography variant="body2">Policy Content</Typography>
            <Quill
              value={policyContent}
              onChange={(value: string) => setPolicyContent(value)}
              placeholder="Enter your policy content here..."
              height="300px"
            />
          </div>
          <Button
            inlineStyling={styles?.buttonStyles}
            text="Create"
            type="submit"
            loading={loading}
            disabled={loading}
          />
        </form>
      </Box>
    </Modal>
  );
};

export default memo(NewPolicyModal);

const styles = {
  buttonStyles: {
    width: "100%",
  },
  dropDownInputStyles: {
    width: "100%",
    boxShadow: "var(--main-inner-boxShadow-color) !important",
    background: "var(--main-white-color) !important",
  },
  quillEditorStyles: {
    height: "300px",
  },
};
