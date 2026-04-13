import React, { FC, memo, useState, useCallback } from "react";
import { DatePicker as RSuiteDatePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import moment from "moment";

interface DatePickerProps {
  changeFn?: (value: string | null) => void;
  width?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  boxShadow?: string;
  background?: string;
  value: string | null;
  placeholder?: string;
  previousDatesDisbaled?: boolean;
}

const DatePicker: FC<DatePickerProps> = ({
  width = "100%",
  maxHeight = "50px",
  height = "5.5vh !important",
  minHeight = "45px",
  boxShadow = "0px -1px 10px 0px rgba(56, 182, 255, 0.3) inset",
  background = "transparent",
  changeFn,
  value,
  placeholder = "Select date",
  previousDatesDisbaled,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  // Memoize handlers to prevent unnecessary re-renders
  const handleChange = useCallback(
    (date: Date | null) => {
      if (!changeFn) return;

      if (date === null) {
        changeFn(null);
      } else {
        const utcFormattedDate = moment(date)
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss[Z]");

        changeFn(utcFormattedDate);
        setOpen(false);
      }
    },
    [changeFn, setOpen],
  );

  const handleClean = useCallback(() => {
    if (changeFn) {
      changeFn(null);
    }
  }, [changeFn]);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  // Function to disable past dates - fixed typing to match RSuite's expected signature
  const shouldDisableDate = useCallback((date?: Date): boolean => {
    if (!date) return false;

    // Get the start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Return true if the date is before today (to disable it)
    return date < today;
  }, []);

  const customStyles = `
  .rs-picker-toggle-wrapper {
    border-radius: 10px;
    background: ${background};
    overflow: hidden;
    width: ${width};
    height: ${height ? height : "5.5vh"};
    min-height: ${minHeight ? minHeight : "45px"};
    max-height: ${maxHeight ? maxHeight : "50px"};
    box-shadow: ${boxShadow};
    position: relative;
  }
  
  .rs-picker.rs-picker-focused, 
  .rs-picker:not(.rs-picker-disabled):hover {
    border-color: var(--main-blue-color) !important;
  }
  
  .rs-input-group {
    border: none;
  }
  
  .rs-input-group.rs-input-group-inside {
    height: 100%;
    display: flex;
    flex-direction: row-reverse;
    background: transparent;
    align-items: center;
  }
  
  .rs-input-group.rs-input-group-inside > input {
    letter-spacing: 1px !important;
    background: transparent;
    font-family: var(--leagueSpartan-regular-400);
    font-size: var(--regular18-) !important;
    color: var(--black-color) !important;
    height: 100% !important;
    padding: 10px 10px 10px 0px !important;
  }
  
  .rs-input-group-lg.rs-input-group > .rs-input, 
  .rs-input-group-lg.rs-input-group > .rs-input-group-addon {
    height: 100%;
  }
  
  .rs-input-group-lg > .rs-input {
    padding: 5px 10px;
    border: none;
  }
  
  .rs-input-group.rs-input-group-lg > .rs-input-group-addon {
    padding: 10px;
    min-width: 0;
  }
  
  .rs-input-group.rs-input-group-inside > span {
    height: 100%;
    background: transparent;
  }
  
  .rs-input-group.rs-input-group-inside > span > svg {
    color: var(--main-blue-color);
    font-size: var(--regular18-) !important;
  }
  
  .rs-picker-popup {
    border: 1px solid var(--color-dashboard-border);
    z-index: 1400 !important;
    top: 275px !important;
    background-color: var(--main-white-color) !important;
    color: var(--black-color) !important;
  }

  .rs-calendar-header-title {
    color: var(--black-color);
  }

  .rs-btn-icon.rs-btn-xs {
    color: var(--black-color);
  }

  .rs-stack {
    overflow: hidden;
    height: max-content;
    padding-top: 5px;
  } 

  .rs-stack-item {
    overflow: hidden;
    height: max-content;
  }
  
  .rs-calendar {
    min-height: max-content !important;
    padding: 0px !important;
    height: fit-content !important;
  }
  
  .rs-calendar-body {
    padding: 0px 15px !important;
    height: max-content !important;
  }

  .rs-calendar-table-header-cell-content {
    font-family: var(--leagueSpartan-regular-400) !important;
    font-size: var(--regular18-);
  }

  .rs-calendar-table-cell-content {
    font-family: var(--leagueSpartan-regular-400) !important;
    font-size: var(--regular18-);
  }

  .rs-calendar-table-cell-selected .rs-calendar-table-cell-content {
    background: var(--main-blue-color) !important;
    color: white !important;
    border-radius: 4px;
  }

  .rs-calendar-table-cell-selected.rs-calendar-table-cell-today .rs-calendar-table-cell-content {
    background: var(--main-blue-color) !important;
    color: white !important;
  }
  
  .rs-calendar-table-cell-disabled .rs-calendar-table-cell-content {
    color: var(--pure-black-color) !important;
    background: none !important;
    cursor: not-allowed;
  }

  .css-qct7wd-MuiButtonBase-root-MuiPickersDay-root:not(.Mui-selected) {
    border: 1px solid var(--main-blue-color) !important;
  }
`;

  return (
    <>
      <style>{customStyles}</style>
      <RSuiteDatePicker
        format="dd.MM.yyyy"
        onChange={handleChange}
        open={open}
        onOpen={handleOpen}
        onClean={handleClean}
        onClose={handleClose}
        {...(previousDatesDisbaled ? { shouldDisableDate } : {})}
        value={
          value && value !== "null"
            ? moment(value).utc().local().toDate()
            : null
        }
        placeholder={placeholder}
      />
    </>
  );
};

export default memo(DatePicker);
