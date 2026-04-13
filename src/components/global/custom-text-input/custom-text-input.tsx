import { TextField, TextFieldProps, Typography } from "@mui/material";
import { forwardRef, ChangeEvent } from "react";

type CustomInputProps = Omit<TextFieldProps, "onChange"> & {
  value?: string | number | readonly string[];
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (props, ref) => {
    const { value, onChange, ...rest } = props;

    return (
      <TextField
        inputRef={ref}
        value={value}
        sx={{}}
        onChange={(e) => onChange?.(e)}
        fullWidth
        InputProps={{
          sx: {
            fontSize: "1.9vh",
            fontWeight: 400,
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          },
        }}
        {...rest}
        label={<Typography sx={styles.lable}>Phone</Typography>}
        variant="outlined"
      />
    );
  },
);
CustomInput.displayName = "CustomInput";
export default CustomInput;

const styles = {
  lable: {
    fontSize: "1.7vh",
    fontWeight: 400,
    color: "rgba(0,0,0,0.77)",
  },
};
