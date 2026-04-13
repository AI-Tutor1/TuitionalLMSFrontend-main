"use client";
import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import moment from "moment";

interface DropDownProps {
  placeholder: string;
  data: any;
  handleChange: (value: any) => void;
  value?: string;
  isError?: boolean;
  className?: string;
  externalStyles?: any;
  disable?: string | undefined | any;
  margin?: string;
  height?: string;
  width?: string | number;
  background?: string;
}

const DropDownEnrollmentSchedule = ({
  placeholder,
  data,
  handleChange,
  value,
  externalStyles,
  disable,
  background = "transparent",
}: DropDownProps) => {
  const formattedValue = React.useMemo(
    () => (value ? moment(value, "HH:mm:ss").format("h:mm A") : ""),
    [value],
  );
  const handleValueChange = React.useCallback(
    (_event: React.SyntheticEvent, newValue: string | null) => {
      handleChange(
        newValue ? moment(newValue, "h:mm A").format("HH:mm:ss") : "",
      );
    },
    [handleChange],
  );
  const isOptionDisabled = React.useCallback(
    (option: string) => (disable ? option.includes(disable) : false),
    [disable],
  );
  return (
    <>
      <Autocomplete
        disablePortal
        options={data}
        value={formattedValue}
        onChange={handleValueChange}
        getOptionDisabled={isOptionDisabled}
        sx={[
          {
            maxHeight: "50px",
            height: "5.5vh !important",
            minHeight: "45px",
            width: "100%",
            padding: "10px",
            zIndex: "0 !important",
            color: "var(--black-color)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "var(--cards--boxShadow-color)",
            backgroundColor: "transparent",
            position: "relative",
            borderRadius: "10px",
            fontFamily: "var(--leagueSpartan-regular-400)",
            fontSize: "var(--regular18-)",
            lineHeight: "var(--regular18-)",
            ...externalStyles,
            "& .MuiOutlinedInput-root": {
              padding: 0,
              height: "100%",
              background: "transparent",
            },
            "& .MuiAutocomplete-input": {
              padding: "0 !important",
              height: "100%",
              background: "transparent",
            },
            "& .MuiAutocomplete-popupIndicator": {
              color: "var(--black-color)",
              marginRight: "-10px",
            },
            "& .MuiAutocomplete-clearIndicator": {
              display: "none",
            },
          },
        ]}
        slotProps={{
          paper: {
            sx: {
              "& .MuiAutocomplete-noOptions": {
                color: "var(--black-color)",
                fontFamily: "var(--leagueSpartan-regular-400)",
                fontSize: "var(--regular18-)",
              },
              "& .MuiAutocomplete-option": {
                fontFamily: "var(--leagueSpartan-regular-400)",
                color: "var(--black-color)",
                fontSize: "var(--regular18-)",
                lineHeight: "var(--regular18-)",
                "&[aria-selected='true']": {
                  backgroundColor: "var(--main-blue-color)",
                  color: "var(--black-color)",
                },
                "&:hover": {
                  backgroundColor: "var(--main-blue-color) !important",
                },
                "& .MuiAutocomplete-loading": {
                  color: "var(--black-color)",
                },
              },
            },
          },
          popper: {
            sx: {
              "& .MuiPaper-rounded": {
                backgroundColor: "var(--main-white-color)",
                color: "var(--black-color)",
              },
            },
          },
        }}
        renderInput={(params: any) => (
          <TextField
            {...params}
            placeholder={placeholder}
            fullWidth
            sx={{
              background,
              fontFamily: "var(--leagueSpartan-regular-400)",
              fontSize: "var(--regular18-)",
              height: "100%",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "var(--black-color)",
              },
              "& .MuiInputBase-input": {
                color: "var(--black-color)",
                fontFamily: "var(--leagueSpartan-regular-400)",
                fontSize: "var(--regular18-)",
              },
            }}
          />
        )}
      />
    </>
  );
};

export default DropDownEnrollmentSchedule;
