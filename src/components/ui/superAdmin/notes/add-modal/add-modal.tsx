import React, { useState, useCallback, memo, useMemo, useEffect } from "react";
import { Box, Modal } from "@mui/material";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import TextBox from "@/components/global/text-box/text-box";
import FileUploader from "@/components/global/fileUploader/fileUploader";
import classes from "./add-modal.module.css";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { MyAxiosError } from "@/services/error.type";
import { getImageString } from "@/services/dashboard/upload-file/upload-file";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import LoadingBox from "@/components/global/loading-box/loading-box";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: FormState) => void;
  loading?: boolean;
  success?: boolean;
}

interface FormState {
  title: string;
  description: string;
  resourceLink: string;
}

const initialState: FormState = {
  title: "",
  description: "",
  resourceLink: "",
};

const AddNotesModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading = false,
  success,
}) => {
  const { token, user } = useAppSelector((state: any) => state?.user);
  const [formData, setFormData] = useState<FormState>(initialState);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const formatHeading = useMemo(() => {
    return heading.endsWith("s") ? heading.slice(0, -1) : heading;
  }, [heading]);

  const handleInputChange = useCallback(
    (field: keyof FormState, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const handleFile = useMutation({
    mutationFn: (payload: any) =>
      getImageString(
        {
          token,
          contentType: "multipart/form-data",
        },
        payload,
      ),
    onSuccess: (data: any) => {
      if (data) {
        setImageUrl(data.url);
        toast.success(data.message || "File uploaded successfully");
      } else {
        toast.error(data?.error || "File upload failed");
      }
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      toast.error(axiosError.response?.data?.error || axiosError.message);
    },
  });

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title.trim()) {
        toast.error("Please give a title to the resource");
        return;
      } else if (!formData.description.trim()) {
        toast.error("Please give a description to the resource");
        return;
      } else if (!imageUrl) {
        toast.error("Please upload a file");
        return;
      }
      const payload = {
        title: formData.title,
        description: formData.description,
        resourceLink: imageUrl,
      };
      handleAdd?.(payload);
    },
    [formData, handleAdd, imageUrl],
  );

  useEffect(() => {
    if (success) {
      setFormData(initialState);
      setImageUrl(null);
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
          {heading && <p>{formatHeading}</p>}
          {subHeading && <p>{subHeading}</p>}
        </div>

        <form className={classes.contentBox} onSubmit={handleFormSubmit}>
          <div className={classes.fields}>
            <p>Title</p>
            <InputField
              inputBoxStyles={styles.inputStyles}
              placeholder="Enter title"
              value={formData.title}
              changeFunc={(e) => handleInputChange("title", e.target.value)}
            />
          </div>
          {/* <div className={classes.fields}>
            <p>Description</p> */}
          <TextBox
            placeholder="Enter description..."
            value={formData.description}
            onChange={(value) => handleInputChange("description", value)}
            inlineTextAreaStyles={{
              boxShadow: styles?.inputStyles?.boxShadow,
            }}
            label="Description"
          />
          {/* </div> */}
          {handleFile.isPending ? (
            <LoadingBox
              loaderStyling={{
                width: "var(--regular22-)",
                height: "var(--regular22-)",
              }}
            />
          ) : (
            <FileUploader
              label="Upload Files & Videos"
              accept="image/*,video/*,.pdf,.doc,.docx"
              maxSizeMB={400}
              maxFiles={1}
              onChange={(files) => handleFile?.mutate(files[0])}
              placeholder="Drag & drop files here or click to browse"
              initialFileUrl={imageUrl || ""}
              initialFileName={imageUrl?.split("/").pop()}
            />
          )}

          <Button
            loading={loading}
            inlineStyling={{ width: "100%" }}
            text="Add"
            type="submit"
            disabled={loading}
          />
        </form>
      </Box>
    </Modal>
  );
};

export default memo(AddNotesModal);

const styles = {
  inputStyles: {
    width: "100%",
    background: "var(--main-white-color)",
    boxShadow: "var(--main-inner-boxShadow-color) ",
  },
};
