"use client";
import React, { memo, useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import classes from "./quill.module.css";

// Dynamically import ReactQuill with no SSR to prevent 'document is not defined' error
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: "300px", background: "#f5f5f5", borderRadius: "4px" }}
    >
      Loading editor...
    </div>
  ),
});

interface QuillProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

// Move modules and formats outside component to prevent recreation on each render
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const QUILL_FORMATS = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "list",
  "bullet",
  "check",
  "indent",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
  "video",
];

const Quill = memo<QuillProps>(
  ({
    value,
    onChange,
    placeholder = "Enter your content here...",
    height = "300px",
  }) => {
    // Memoize the style object to prevent unnecessary re-renders
    const editorStyle = useMemo(
      () => ({
        height,
        marginBottom: "50px",
      }),
      [height]
    );

    return (
      <div className={classes.quillWrapper}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          placeholder={placeholder}
          style={editorStyle}
        />
      </div>
    );
  }
);

export default Quill;
