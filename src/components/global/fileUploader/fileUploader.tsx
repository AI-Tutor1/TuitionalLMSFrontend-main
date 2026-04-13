// components/global/file-uploader/file-uploader.tsx
import React, { useCallback, useRef, useState, memo, useEffect } from "react";
import classes from "./fileUploader.module.css";
import {
  CloudUpload,
  Close,
  InsertDriveFile,
  VideoFile,
  Image,
} from "@mui/icons-material";

interface FileItem {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "video" | "document";
  isExisting?: boolean;
  existingUrl?: string;
}

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  onChange?: (files: FileItem[]) => void;
  label?: string;
  placeholder?: string;
  initialFileUrl?: string;
  initialFileName?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept = "image/*,video/*,.pdf,.doc,.docx",
  multiple = true,
  maxFiles = 5,
  maxSizeMB = 10,
  onChange,
  label,
  placeholder = "Drag & drop files here or click to browse",
  initialFileUrl,
  initialFileName,
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): "image" | "video" | "document" => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "document";
  };

  const getFileTypeFromUrl = (url: string): "image" | "video" | "document" => {
    const extension = url.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || ""))
      return "image";
    if (["mp4", "webm", "ogg", "mov"].includes(extension || "")) return "video";
    return "document";
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Handle initial file URL
  useEffect(() => {
    if (initialFileUrl && files.length === 0) {
      const fileName =
        initialFileName || initialFileUrl.split("/").pop() || "existing-file";
      const fileType = getFileTypeFromUrl(initialFileUrl);

      // Create a placeholder file item for the existing file
      const existingFileItem: FileItem = {
        id: "existing-file",
        file: new File([], fileName, { type: "application/octet-stream" }),
        type: fileType,
        preview: fileType === "image" ? initialFileUrl : undefined,
        isExisting: true,
        existingUrl: initialFileUrl,
      };

      setFiles([existingFileItem]);
    }
  }, [initialFileUrl, initialFileName]);

  const processFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const fileArray = Array.from(newFiles);
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      const validFiles = fileArray.filter((file) => {
        if (file.size > maxSizeBytes) {
          alert(`${file.name} exceeds ${maxSizeMB}MB limit`);
          return false;
        }
        return true;
      });

      const remainingSlots = maxFiles - files.length;
      const filesToAdd = validFiles.slice(0, remainingSlots);

      const newFileItems: FileItem[] = filesToAdd.map((file) => {
        const fileType = getFileType(file);
        const fileItem: FileItem = {
          id: generateId(),
          file,
          type: fileType,
          isExisting: false,
        };

        if (fileType === "image") {
          fileItem.preview = URL.createObjectURL(file);
        }

        return fileItem;
      });

      const updatedFiles = [...files, ...newFileItems];
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [files, maxFiles, maxSizeMB, onChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      e.target.value = "";
    },
    [processFiles],
  );

  const handleRemoveFile = useCallback(
    (id: string) => {
      const fileToRemove = files.find((f) => f.id === id);
      if (fileToRemove?.preview && !fileToRemove.isExisting) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const updatedFiles = files.filter((f) => f.id !== id);
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [files, onChange],
  );

  const renderFileIcon = (type: "image" | "video" | "document") => {
    switch (type) {
      case "image":
        return <Image className={classes.fileIcon} />;
      case "video":
        return <VideoFile className={classes.fileIcon} />;
      default:
        return <InsertDriveFile className={classes.fileIcon} />;
    }
  };

  return (
    <div className={classes.container}>
      {label && <label className={classes.label}>{label}</label>}
      <div
        className={`${classes.dropzone} ${isDragging ? classes.dragging : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className={classes.hiddenInput}
        />

        <CloudUpload className={classes.uploadIcon} />
        <p className={classes.placeholder}>{placeholder}</p>
        <span className={classes.hint}>
          Max {maxFiles} files, up to {maxSizeMB}MB {multiple && "each"}
        </span>
      </div>

      {files.length > 0 && (
        <div className={classes.fileList}>
          {files.map((fileItem) => (
            <div key={fileItem.id} className={classes.fileItem}>
              <div className={classes.filePreview}>
                {fileItem.type === "image" && fileItem.preview ? (
                  <img src={fileItem.preview} alt={fileItem.file.name} />
                ) : (
                  renderFileIcon(fileItem.type)
                )}
              </div>

              <div className={classes.fileInfo}>
                <span className={classes.fileName}>
                  {fileItem.isExisting
                    ? fileItem.existingUrl?.split("/").pop()
                    : fileItem.file.name}
                </span>
                <span className={classes.fileSize}>
                  {fileItem.isExisting
                    ? "Existing file"
                    : `${(fileItem.file.size / 1024 / 1024).toFixed(2)} MB`}
                </span>
              </div>

              <button
                type="button"
                className={classes.removeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(fileItem.id);
                }}
              >
                <Close />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(FileUploader);
