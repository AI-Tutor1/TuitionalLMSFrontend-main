import { useState, useCallback } from "react";

export const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setSelectedFile(e.target.files[0]);
      }
    },
    []
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return {
    selectedFile,
    handleFileUpload,
    clearFile,
  };
};
