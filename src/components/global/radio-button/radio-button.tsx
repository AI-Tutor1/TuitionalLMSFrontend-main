import React, { FC, CSSProperties } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

interface RadioButtonProps {
  label1: string;
  label2?: string;
  label3?: string;
  value1: string;
  value2?: string;
  value3?: string;
  radioValue: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inlineStyles?: CSSProperties;
}

const RadioButton: FC<RadioButtonProps> = ({
  label1,
  label2,
  label3,
  value1,
  value2,
  value3,
  radioValue,
  handleChange,
  inlineStyles,
}) => {
  return (
    <FormControl>
      <RadioGroup
        aria-labelledby="demo-controlled-radio-buttons-group"
        name="controlled-radio-buttons-group"
        value={radioValue}
        onChange={handleChange}
        sx={{ display: "flex", ...inlineStyles }}
      >
        <FormControlLabel
          sx={{
            "& .MuiSvgIcon-root": {
              fontFamily: "var(--leagueSpartan-medium-500)",
              fontSize: "var(--regular18-)",
              lineHeight: "var(--regular18-)",
              color: "var(--black-color)",
            },
            "& .MuiFormControlLabel-label": {
              fontFamily: "var(--leagueSpartan-medium-500)",
              fontSize: "var(--regular18-)",
              lineHeight: "var(--regular18-)",
              color: "var(--black-color)",
            },
          }}
          value={value1}
          control={<Radio />}
          label={label1}
        />
        {label2 && (
          <FormControlLabel
            sx={{
              "& .MuiSvgIcon-root": {
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "var(--regular18-)",
                lineHeight: "var(--regular18-)",
                color: "var(--black-color)",
              },
              "& .MuiFormControlLabel-label": {
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "var(--regular18-)",
                lineHeight: "var(--regular18-)",
                color: "var(--black-color)",
              },
            }}
            value={value2}
            control={<Radio />}
            label={label2}
          />
        )}
        {label3 && (
          <FormControlLabel
            sx={{
              "& .MuiSvgIcon-root": {
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "var(--regular18-)",
                lineHeight: "var(--regular18-)",
                color: "var(--black-color)",
              },
              "& .MuiFormControlLabel-label": {
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "var(--regular18-)",
                lineHeight: "var(--regular18-)",
                color: "var(--black-color)",
              },
            }}
            value={value3}
            control={<Radio />}
            label={label3}
          />
        )}
      </RadioGroup>
    </FormControl>
  );
};

export default React.memo(RadioButton);
