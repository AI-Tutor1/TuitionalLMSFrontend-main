import classes from "./input-field.module.css";
import { forwardRef, memo, ChangeEvent, FocusEvent, MouseEvent } from "react";

interface InputFieldProps {
  name?: string;
  value?: string;
  type?: string;
  placeholder?: string;
  icon1?: React.ReactNode;
  icon2?: React.ReactNode;
  hide?: boolean;
  inputBoxStyles?: React.CSSProperties;
  inputStyles?: React.CSSProperties;
  customIconStyles?: React.CSSProperties;
  changeFunc?: (event: ChangeEvent<HTMLInputElement>) => void;
  handlePasswordDisability?: (event: MouseEvent<HTMLSpanElement>) => void;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      name,
      type = "text",
      value,
      placeholder = "",
      icon1,
      icon2,
      changeFunc,
      onChange,
      onBlur,
      handlePasswordDisability,
      hide = false,
      inputBoxStyles,
      inputStyles,
      customIconStyles,
      required = false,
      disabled = false,
      autoComplete = "off",
      ...rest
    },
    ref,
  ) => {
    const resolvedType = hide ? "password" : type;
    const handleChange = onChange || changeFunc;

    return (
      <div className={classes.inputBox} style={inputBoxStyles}>
        {icon1 && <span className={classes.icon}>{icon1}</span>}
        <input
          ref={ref}
          name={name}
          className={classes.input}
          type={resolvedType}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          onBlur={onBlur}
          onChange={handleChange}
          {...(value !== undefined && { value })}
          {...rest}
          style={inputStyles}
        />
        {icon2 && (
          <span
            className={classes.icon}
            style={customIconStyles}
            onClick={handlePasswordDisability}
          >
            {icon2}
          </span>
        )}
      </div>
    );
  },
);

InputField.displayName = "InputField";

export default memo(InputField);
