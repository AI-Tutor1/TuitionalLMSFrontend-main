import React, {
  CSSProperties,
  memo,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styles from "./deactivate-modal.module.css";
import Button from "@/components/global/button/button";
import RadioButton from "@/components/global/radio-button/radio-button";
import TextBox from "@/components/global/text-box/text-box";
import { toast } from "react-toastify";

// Types with proper typing
type DropdownItem = {
  text: string;
  dropDown: React.ReactNode;
};

interface Profile {
  status: boolean;
  [key: string]: any;
}

interface BasicModalProps {
  modalOpen: {
    open: boolean;
    profile: Profile;
  };
  handleDeactivate: (payload: {
    id: string;
    status: boolean;
    permanent: string;
    message: string;
  }) => void;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  modalArr?: DropdownItem[];
  inlineDropDownBox?: CSSProperties;
  loading?: boolean;
  isSuccess?: boolean;
}

// Constants defined outside component to prevent recreation
const BUTTON_STYLES = {
  cancel: {
    width: "100%",
    backgroundColor: "transparent",
    border: "1px solid var(--main-blue-color)",
    color: "var(--main-blue-color) !important",
  } as const,
};

const RADIO_STYLE = { width: "max-content", alignSelf: "center" } as const;

const initialState = {
  permanent: "",
  reason: "",
};

const DeactivateModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  handleDeactivate,
  heading,
  subHeading,
  loading = false,
  isSuccess,
}) => {
  // Better initial state - should probably be "permanently" or "temporarily"
  const [formData, setFormData] = useState(initialState);

  const handleChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Memoized action button text
  const actionButtonText = useMemo(
    () => (modalOpen?.profile?.status === true ? "Deactivate" : "Activate"),
    [modalOpen?.profile?.status],
  );

  // Handle form submission with validation
  const handleSubmit = useCallback(() => {
    if (formData.reason === "") {
      toast.error("Reason is required");
      return;
    }
    const payload = {
      id: modalOpen?.profile?.id,
      status: modalOpen?.profile?.status === true ? false : true,
      permanent: formData.permanent,
      message: formData.reason.trim(),
    };
    // console.log(payload);
    handleDeactivate(payload);
  }, [handleDeactivate, formData]);

  // Handle modal close with cleanup
  const handleModalClose = useCallback(() => {
    handleClose();
    setFormData(initialState);
  }, [handleClose]);

  useEffect(() => {
    if (isSuccess) {
      setFormData(initialState);
    }
  }, [isSuccess]);

  // Early return if modal is not open
  if (!modalOpen?.open) return null;

  return (
    <Modal
      open={modalOpen.open}
      onClose={handleModalClose}
      aria-labelledby="deactivate-modal-title"
      aria-describedby="deactivate-modal-description"
    >
      <Box className={styles.mainBox}>
        <div className={styles.headingBox}>
          <p id="deactivate-modal-title">{heading}</p>
          {subHeading && <p id="deactivate-modal-description">{subHeading}</p>}
        </div>
        <div className={styles.section2}>
          <div className={styles.contentBox}>
            {modalOpen?.profile?.status === true && (
              <RadioButton
                label1="Permanently"
                value1="permanently"
                label2="Temporarily"
                value2="temporarily"
                radioValue={formData.permanent}
                handleChange={(e) => handleChange("permanent", e.target.value)}
                inlineStyles={RADIO_STYLE}
              />
            )}
            <TextBox
              inlineTextAreaStyles={{
                boxShadow: "var(--main-inner-boxShadow-color)",
              }}
              placeholder="Reason..."
              value={formData.reason}
              onChange={(value) => handleChange("reason", value)}
              aria-label="Deactivation reason"
            />
          </div>
          <div className={styles.buttonBox}>
            <Button
              inlineStyling={BUTTON_STYLES.cancel}
              text="Cancel"
              clickFn={handleModalClose}
              disabled={loading}
            />
            <Button
              inlineStyling={{ width: "100%" }}
              text={actionButtonText}
              clickFn={handleSubmit}
              loading={loading}
              disabled={loading}
            />
          </div>
        </div>
      </Box>
    </Modal>
  );
};

// Memoize with custom comparison function for better performance
export default memo(DeactivateModal, (prevProps, nextProps) => {
  return (
    prevProps.modalOpen.open === nextProps.modalOpen.open &&
    prevProps.modalOpen.profile?.status ===
      nextProps.modalOpen.profile?.status &&
    prevProps.loading === nextProps.loading &&
    prevProps.heading === nextProps.heading &&
    prevProps.subHeading === nextProps.subHeading
  );
});
