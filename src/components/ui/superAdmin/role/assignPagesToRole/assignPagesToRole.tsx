import React, { useState, memo, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import classes from "./assignPagesToRole.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import { toast } from "react-toastify";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import { GetAllPages_Api_Response_Type } from "@/types/pages/getAllPages.types";

interface PageItem {
  id: number;
  name: string;
  route: string;
  icon: string;
}

interface BasicModalProps {
  modalOpen?: boolean;
  handleClose: any;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  loading?: boolean | any;
  success?: any;
  pagesData?: GetAllPages_Api_Response_Type;
}

const AssignPagesToRole: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading,
  success,
  pagesData,
}) => {
  const [roleName, setRoleName] = useState<string>("");
  const [selectedPageIds, setSelectedPageIds] = useState<number[]>([]);

  const handleFormSubmit = () => {
    if (selectedPageIds.length === 0) {
      toast.error("Please select at least one page");
      return;
    }

    // Prepare data

    // Submit the form
    handleAdd?.({
      pageIds: [...selectedPageIds],
    });
  };

  const handlePageSelection = (event: any, selectedOptions: PageItem[]) => {
    const pageIds = selectedOptions?.map((page) => page?.id) || [];
    setSelectedPageIds(pageIds);
  };

  useEffect(() => {
    if (success) {
      setRoleName("");
      setSelectedPageIds([]);
    }
  }, [success]);

  return (
    <Modal
      open={modalOpen || false}
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
              <Typography variant="body2">Pages</Typography>
              <MultiSelectDropDown
                placeholder="Select Pages"
                data={pagesData ? pagesData.pages : []}
                handleChange={handlePageSelection}
                // value={
                //   pagesData?.pages.filter((page) =>
                //     selectedPageIds.includes(page?.id)
                //   ) || []
                // }
                inlineDropDownStyles={{ backgroundColor: "#ffff" }}
              />
            </div>
          </form>

          <Button
            inlineStyling={styles.buttonStyles}
            text="Assign Pages"
            clickFn={handleFormSubmit}
            loading={loading}
            disabled={loading}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(AssignPagesToRole);

const styles = {
  buttonStyles: {
    position: "relative" as const,
    zIndex: 2,
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
