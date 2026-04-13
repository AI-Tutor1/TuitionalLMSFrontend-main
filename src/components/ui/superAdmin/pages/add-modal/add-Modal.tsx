import React, { useState, memo, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import classes from "./add-modal.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import { toast } from "react-toastify";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: any;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  loading?: boolean | any;
  success?: any;
}

const AddModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading,
  success,
}) => {
  const [pageName, setPageName] = useState<string>("");
  const [pageRoute, setPageRoute] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [pageOrder, setPageOrder] = useState<string>("");
  const [icon, setIcon] = useState<File | null>(null);
  const [iconFileName, setIconFileName] = useState<string>("");

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIcon(file);
      setIconFileName(file.name);
    } else {
      // Handle cancel - when user cancels file selection, files array will be empty
      // Keep the previous file if it exists, or clear if no file was previously selected
      if (!icon) {
        setIcon(null);
        setIconFileName("");
      }
    }
  };

  const handleRemoveFile = () => {
    setIcon(null);
    setIconFileName("");

    // Reset file input
    const fileInput = document.getElementById(
      "icon-file-upload",
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleFormSubmit = () => {
    // Validation
    if (!pageName.trim()) {
      toast.error("Page name is required");
      return;
    }
    if (!pageRoute.trim()) {
      toast.error("Page route is required");
      return;
    }
    if (!category.trim()) {
      toast.error("Category is required");
      return;
    }
    if (!pageOrder.trim()) {
      toast.error("Page order is required");
      return;
    }
    if (isNaN(Number(pageOrder))) {
      toast.error("Page order must be a number");
      return;
    }
    if (Number(pageOrder) < 0) {
      toast.error("Page order cannot be negative");
      return;
    }
    if (!icon) {
      toast.error("Icon is required");
      return;
    }

    // Prepare data as object
    const formData = {
      name: pageName.trim(),
      route: pageRoute.trim(),
      category: category.trim(),
      order: Number(pageOrder),
      icon: icon,
    };

    // Submit the form
    handleAdd?.(formData);
  };

  useEffect(() => {
    if (success) {
      setPageName("");
      setPageRoute("");
      setCategory("");
      setPageOrder("");
      setIcon(null);
      setIconFileName("");

      // Reset file input
      const fileInput = document.getElementById(
        "icon-file-upload",
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
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
        <div className={classes.section2}>
          <form className={classes.contentBox}>
            <div className={classes.fields}>
              <Typography variant="body2">Page Name</Typography>
              <InputField
                inputBoxStyles={styles.inputStyles}
                placeholder="Enter page name"
                value={pageName}
                changeFunc={(e) => setPageName(e.target.value)}
              />
            </div>

            <div className={classes.fields}>
              <Typography variant="body2">Page Route</Typography>
              <InputField
                inputBoxStyles={styles.inputStyles}
                placeholder="Enter page route"
                value={pageRoute}
                changeFunc={(e) => setPageRoute(e.target.value)}
              />
            </div>

            <div className={classes.fields}>
              <Typography variant="body2">Category</Typography>
              <InputField
                inputBoxStyles={styles.inputStyles}
                placeholder="Enter category"
                value={category}
                changeFunc={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className={classes.fields}>
              <Typography variant="body2">Page Order</Typography>
              <InputField
                inputBoxStyles={styles.inputStyles}
                placeholder="Enter page order"
                value={pageOrder}
                changeFunc={(e) => setPageOrder(e.target.value)}
                type="number"
              />
            </div>

            <div className={classes.fields}>
              <Typography variant="body2">Icon</Typography>
              <div style={styles.fileContainer}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  style={styles.hiddenFileInput}
                  id="icon-file-upload"
                />
                <label htmlFor="icon-file-upload" style={styles.fileLabel}>
                  {iconFileName ? iconFileName : "Choose file"}
                </label>
                {iconFileName && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    style={styles.removeButton}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </form>

          <Button
            inlineStyling={styles.buttonStyles}
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
  buttonStyles: {
    position: "relative" as const,
    zIndex: 2,
    width: "100%",
  },
  inputStyles: {
    width: "100%",
    background: "var(--main-white-color)",
    boxShadow: "var(--main-inner-boxShadow-color) ",
  },
  fileContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  hiddenFileInput: {
    display: "none",
  },
  fileLabel: {
    width: "max-content",
    padding: "5px 10px",
    backgroundColor: "var(--main-blue-color)",
    color: "var(--pure-white-color)",
    borderRadius: "5px",
    cursor: "pointer",
    border: "none",
    transition: "background-color 0.3s ease",
    fontFamily: "var(--leagueSpartan-medium-500)",
    fontSize: "var(--regular18-)",
  },
  removeButton: {
    backgroundColor: "var(--red-color1)",
    color: "var(--pure-white-color)",
    border: "none",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.3s ease",
    fontFamily: "var(--leagueSpartan-medium-500)",
    fontSize: "var(--regular18-)",
  },
};
