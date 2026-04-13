import React, { useEffect, useState } from "react";
import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";

interface DragAndDropUploadProps {
  width?: string;
  height?: string;
  children: React.ReactNode;
  accept: string;
  type: "image" | "video" | "document";
  isError: boolean;
  setSelectedFile: (file: File | null) => void;
  selectedFile: File | null;
  value?: string;
  onChangeData: (key: string, value: string) => void;
}

const DragAndDropUpload: React.FC<DragAndDropUploadProps> = ({
  width,
  height,
  children,
  accept,
  type,
  isError,
  setSelectedFile,
  selectedFile,
  value,
  onChangeData,
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (preview || selectedFile) {
      setPreview(null);
      setSelectedFile(null);
    }
    if (file) {
      try {
        let finalFile = file;

        if (file.size > 5 * 1024 * 1024) {
          finalFile = await compressImage(file);
        }

        if (finalFile.size > 5 * 1024 * 1024) {
          toast.error("File size after compression must be less than 5MB");
        } else {
          setSelectedFile(finalFile);
          setPreview(URL.createObjectURL(finalFile));
        }
      } catch (error) {
        toast.error("Failed to compress the file");
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (preview || selectedFile) {
      setPreview(null);
      setSelectedFile(null);
    }
    if (file) {
      try {
        let finalFile = file;

        if (file.size > 5 * 1024 * 1024) {
          finalFile = await compressImage(file);
        }

        if (finalFile.size > 5 * 1024 * 1024) {
          toast.error("File size after compression must be less than 5MB");
        } else {
          setSelectedFile(finalFile);
          setPreview(URL.createObjectURL(finalFile));
        }
      } catch (error) {
        toast.error("Failed to compress the file");
      }
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      throw new Error("Compression failed");
    }
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (type === "image") onChangeData("profileImage", "");
    if (type === "video") onChangeData("video", "");
    if (type === "document") onChangeData("document", "");
    setPreview(null);
  };

  useEffect(() => {
    console.log(preview);
  }, [preview]);

  const renderPreview = () => {
    if (type === "image" && (preview || value)) {
      return (
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
          <img
            src={preview || value || ""}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
          <IconButton
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              color: "#37b6ff",
              zIndex: 10,
            }}
            onClick={handleRemove}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      );
    }
    if (type === "video" && (preview || value)) {
      return (
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
          <video
            src={preview || value || ""}
            style={{ maxWidth: "100%", maxHeight: "100%" }}
            controls
          />
          <IconButton
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              color: "#37b6ff",
              zIndex: 10,
            }}
            onClick={handleRemove}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      );
    }
    if (type === "document" && (preview || value)) {
      return (
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
          <iframe
            src={preview || value || ""}
            style={{ width: "50%", height: "100%", objectFit: "contain" }}
            title="Document Preview"
          />
          <IconButton
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              color: "#37b6ff",
              zIndex: 10,
            }}
            onClick={handleRemove}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      );
    }
    return <>{children}</>;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
      <Box
        sx={{
          width: width || "12vw",
          height: height || "12vh",
          border: isError ? "1px dashed red" : "1px dashed rgba(86, 86, 86, 1)",
          borderRadius: "10px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          cursor: "pointer",
          flexDirection: "column",
          mb: 2,
          position: "relative",
          padding: "calc(0.5vh + 0.5vw)",
          backgroundColor: "white",
          "&:hover": {
            backgroundColor: "#e4f5ff",
          },
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {renderPreview()}
        {!preview && !selectedFile && (
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default DragAndDropUpload;
