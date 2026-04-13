import React, { ChangeEvent } from "react";
import styles from "./checkbox.module.css";

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  name?: string;
  value?: string;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label = "",
  checked = false,
  onChange,
  disabled = false,
  name = "",
  value = "",
  className = "",
}) => {
  return (
    <div className={`${styles.checkboxWrapper} ${className}`}>
      <label
        className={`${styles.checkboxLabel} ${disabled ? styles.disabled : ""}`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          name={name}
          value={value}
          className={styles.checkboxInput}
        />
        <span
          className={`${styles.checkboxCustom} ${
            checked ? styles.checked : ""
          } ${disabled ? styles.disabled : ""}`}
        ></span>
        {label && <span className={styles.labelText}>{label}</span>}
      </label>
    </div>
  );
};

export default Checkbox;
