import { TextField, Typography } from "@mui/material";
import { forwardRef } from "react";

const CustomInput = forwardRef((props, ref) => {
  const { value, onChange, ...rest } = props;

  return (
    <TextField
      inputRef={ref}
      value={value}
      sx={{}}
      onChange={(e) => onChange(e)}
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
});
CustomInput.displayName = "CustomInput";
export default CustomInput;

const styles = {
  lable: {
    fontSize: "1.7vh",
    fontWeight: 400,
    color: "rgba(0,0,0,0.77)",
    // minHeight: "5.5vh",
  },
};
