import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";

const DatePickerOriginal = ({
  value,
  handleInputChange,
  boxShadow,
  placeholder,
  width,
  flex,
  minWidth,
}: {
  value: moment.Moment | null;
  handleInputChange: (value: moment.Moment | null) => void;
  boxShadow?: string;
  placeholder?: string;
  width?: string;
  flex?: number | string;
  minWidth?: string;
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        value={value}
        onChange={handleInputChange}
        slotProps={{
          textField: {
            placeholder: placeholder ? placeholder : "Enter due date",
            InputLabelProps: {
              shrink: false,
            },
          },
          day: {
            sx: {
              fontFamily: "var(--leagueSpartan-regular-400) !important",
              color: "var(--black-color)",
              fontSize: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
              lineHeight: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
              "&.Mui-selected": {
                backgroundColor: "var(--main-color) !important",
                color: "white !important",
              },
              "&.MuiPickersDay-today:not(.Mui-selected)": {
                border: "1px solid var(--main-color) !important",
              },
            },
          },
          calendarHeader: {
            sx: {
              fontFamily: "var(--leagueSpartan-regular-400) !important",
              color: "var(--black-color)",
              fontSize: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
              lineHeight: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
            },
          },
          // Target the popup container
          desktopPaper: {
            sx: {
              "& .MuiPickersCalendarHeader-labelContainer": {
                fontFamily: "var(--leagueSpartan-regular-400) !important",
                fontSize:
                  "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem) !important",
                color: "var(--black-color) !important",
              },
              "& .MuiPickersCalendarHeader-label": {
                fontFamily: "var(--leagueSpartan-regular-400) !important",
                fontSize:
                  "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem) !important",
                color: "var(--black-color) !important",
              },
              "& .MuiDayCalendar-weekDayLabel": {
                fontFamily: "var(--leagueSpartan-regular-400) !important",
                fontSize: "1.6vh !important",
                color: "var(--black-color) !important",
              },
              // Target the specific generated class pattern
              "& [class*='MuiPickersCalendarHeader-labelContainer']": {
                fontFamily: "var(--leagueSpartan-regular-400) !important",
                fontSize:
                  "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem) !important",
                color: "var(--black-color) !important",
              },
            },
          },
        }}
        sx={{
          "&[class*='MuiFormControl']": {
            width: width ? width : "100%",
            flex: flex ? flex : undefined,
            minWidth: minWidth ? minWidth : undefined,
            height: "5.5vh !important",
            maxHeight: "50px",
            minHeight: "45px",
          },
          "& .MuiInputBase-root": {
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: "10px",
            justifyContent: "space-between !important",
            backgroundColor: "var(--white-color)",
            boxShadow: boxShadow
              ? boxShadow
              : "0px 1px 4px rgba(0, 0, 0, 0.08) !important",
            borderRadius: "10px",
            height: "5.5vh !important",
            maxHeight: "50px",
            minHeight: "45px",
            overflow: "hidden",
            color: "var(--black-color)",
            fontSize: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
            lineHeight: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
            fontFamily: "var(--leagueSpartan-regular-400)",
            padding: "10px !important",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "& .MuiInputBase-input": {
            color: "var(--black-color)",
            fontSize: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
            lineHeight: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
            fontFamily: "var(--leagueSpartan-regular-400)",
            padding: "0px !important",
          },
          "& .MuiInputLabel-root": {
            color: "var(--black-color)",
            fontSize: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
            fontFamily: "var(--leagueSpartan-regular-400)",
            position: "static",
            transform: "none",
            "&.Mui-focused": {
              transform: "none",
            },
            "&.MuiFormLabel-filled": {
              transform: "none",
            },
          },
          "& .MuiInputAdornment-root": {
            color: "var(--main-color)",
            marginLeft: "0px !important",
            marginRight: "10px !important",
            // height: "2.5vh !important",
            // width: "2.5vh !important",
          },
          "& .MuiIconButton-root": {
            color: "var(--main-color)",
            padding: "0px !important",
          },
          "& .MuiSvgIcon-root": {
            // height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
            // width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
            color: "var(--main-color)",
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerOriginal;
