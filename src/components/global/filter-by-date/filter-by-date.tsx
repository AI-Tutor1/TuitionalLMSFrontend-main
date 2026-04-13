"use client";
import React, { memo, useState, useEffect } from "react";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import moment from "moment";
import { useMediaQuery } from "react-responsive";

interface FilterProps {
  changeFn?: (value: any) => void;
  inlineStyling?: React.CSSProperties;
  value?: string[] | any;
  width?: string;
  minWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  flex?: number;
  background?: string;
  placeholder?: string;
}

const FilterByDate: React.FC<FilterProps> = memo(
  ({
    changeFn,
    width,
    value,
    inlineStyling,
    flex,
    minWidth,
    maxHeight,
    background,
    minHeight,
    placeholder,
  }) => {
    const mobileViewport = useMediaQuery({ maxWidth: 767 });
    const [open, setOpen] = useState<boolean>(false);

    const handleChange = (value: any) => {
      if (value === null || value.length !== 2 || value[1] === null) {
        changeFn?.(value);
      } else {
        const datesOnly = value?.map((date: Date) => date.toDateString());
        const utcFormattedDates = datesOnly?.map((date: Date) =>
          moment.utc(date).format("YYYY-MM-DDTHH:mm:ss[Z]"),
        );
        changeFn?.(utcFormattedDates);
      }
    };

    return (
      <>
        <style>
          {`
    .rs-picker-toggle-wrapper {
      background: ${background ? background : "var(--main-white-color)"};
      box-shadow: var(--main-inner-boxShadow-color);
      border-radius: 10px;
      overflow: hidden;
      width: ${width ? width : "100%"};
      min-width: ${minWidth ? minWidth : undefined};
      height: 5.5vh !important;
      max-height: 50px;
      min-height: ${minHeight ? minHeight : "45px"};
      max-height: ${maxHeight ? maxHeight : "50px"};
      flex: ${flex ? `${flex} !important` : undefined};
      padding: 5px;
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
      align-items: center;
      gap: 5px;
      background: transparent;
      align-items: center;
    }
    .rs-input-group.rs-input-group-inside > input {
      background: transparent;
      font-family: var(--leagueSpartan-regular-400);
      font-size: var(--regular18-);
      line-height: var(--regular18-);
      color: var(--black-color);
      height: 100% !important;
    }
    .rs-input-group.rs-input-group-inside > input::placeholder {
     font-family: var(--leagueSpartan-regular-400);
     font-size: var(--regular18-);
     line-height: var(--regular18-);
     color: var(--text-grey);
    }
    .rs-input-group-lg.rs-input-group > .rs-input, 
    .rs-input-group-lg.rs-input-group > .rs-input-group-addon {
      height: 100%;
    }
    .rs-input-group-lg > .rs-input {
      padding: 0px !important;
      border: none;
    }
    .rs-input-group.rs-input-group-lg > .rs-input-group-addon {
      padding: 0px;
      min-width: 0;
    }
    .rs-input-group.rs-input-group-inside > span {
      height: 100%;
      background: transparent;
      padding: 0px !important;
    }
    .rs-input-group.rs-input-group-inside > span > svg {
      color: var(--main-color);
      font-size: var(--regular18-) !important;
      line-height: var(--regular18-); 
    }
    .rs-picker-popup.rs-picker-popup-daterange {
      z-index: 1400;
      background: var(--main-white-color);
    }
    .rs-btn-close{
      display:flex;
      justify-content:center;
      align-items:center;
    }
    .rs-btn-close > svg {
      font-size: var(--regular16-) !important;
      line-height: var(--regular16-) !important; 
    }

    /* Responsive fixes for mobile screens */
    @media (max-width: 767px) {
      .rs-picker-popup.rs-picker-popup-daterange {
        left: 50% !important;
        transform: translateX(-50%) !important;
        max-width: 95vw !important;
        width: auto !important;
      }
      .rs-picker-popup.rs-picker-popup-daterange .rs-picker-daterange-panel {
        width: auto !important;
        max-width: 95vw !important;
      }
      .rs-picker-popup.rs-picker-popup-daterange .rs-picker-daterange-content,
      .rs-picker-popup.rs-picker-popup-daterange .rs-picker-daterange-calendar-group {
        width: auto !important;
        min-width: 0 !important;
      }
      .rs-picker-popup.rs-picker-popup-daterange .rs-calendar {
        width: 100% !important;
        min-width: 0 !important;
      }
      .rs-picker-popup.rs-picker-popup-daterange .rs-picker-toolbar {
        flex-wrap: wrap;
        gap: 8px;
      }
      .rs-picker-daterange-header {
        line-height: var(--regular14-);
        font-size: var(--regular14-);
      }
    }
  `}
        </style>
        <DateRangePicker
          calendarSnapping
          format="dd.MM.yyyy"
          showHeader={false}
          showOneCalendar={mobileViewport}
          size="lg"
          placeholder={placeholder ? placeholder : "Filter date"}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => {
            setOpen(false);
          }}
          onChange={handleChange}
          style={{
            color: "var(--black-color)",
            fontSize: "var(--regular18-)",
            fontFamily: "var(--leagueSpartan-regular-400)",
            ...inlineStyling,
          }}
          {...(value && value.length === 2
            ? {
                value: [
                  moment.utc(value[0]).local().toDate(),
                  moment.utc(value[1]).local().toDate(),
                ],
              }
            : { value: null })}
        />
      </>
    );
  },
);

FilterByDate.displayName = "FilterByDate";

export default FilterByDate;
