import React, { useState, ChangeEvent } from "react";
import classes from "./text-box.module.css";

interface TextBoxProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  rows?: number;
  cols?: number;
  maxLength?: number;
  error?: boolean;
  helperText?: string;
  label?: string;
  required?: boolean;
  className?: string;
  inputBoxStyles?: React.CSSProperties;
  inlineTextAreaStyles?: React.CSSProperties;
}

const TextBox: React.FC<TextBoxProps> = ({
  placeholder = "Enter your text here...",
  value,
  onChange,
  disabled = false,
  rows = 4,
  cols,
  maxLength,
  error = false,
  helperText,
  label,
  required = false,
  className,
  inputBoxStyles,
  inlineTextAreaStyles,
}) => {
  const [internalValue, setInternalValue] = useState(value || "");

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (maxLength && newValue.length > maxLength) {
      return;
    }

    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const textareaClass = `${classes.textarea} ${error ? classes.error : ""} ${
    disabled ? classes.disabled : ""
  } ${className || ""}`;

  return (
    <div className={classes.container} style={inputBoxStyles}>
      {label && (
        <label className={classes.label}>
          {label}
          {required && <span className={classes.required}>*</span>}
        </label>
      )}

      <div className={classes.textareaWrapper}>
        <textarea
          className={textareaClass}
          placeholder={placeholder}
          value={value !== undefined ? value : internalValue}
          onChange={handleChange}
          disabled={disabled}
          rows={rows}
          cols={cols}
          maxLength={maxLength}
          style={inlineTextAreaStyles}
        />

        {maxLength && (
          <div className={classes.characterCount}>
            {(value !== undefined ? value : internalValue).length}/{maxLength}
          </div>
        )}
      </div>

      {helperText && (
        <div
          className={`${classes.helperText} ${error ? classes.errorText : ""}`}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

export default TextBox;
