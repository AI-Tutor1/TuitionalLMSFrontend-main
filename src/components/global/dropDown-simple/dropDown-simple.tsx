"use client";
import * as React from "react";
import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

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

const DropDownSimple = ({
  placeholder,
  data,
  handleChange,
  value,
  externalStyles,
  disable,
  background,
}: DropDownProps) => {
  return (
    <>
      <style>
        {`
          .MuiFormControl-root {
            height: 100% !important;
          
          }
          .MuiOutlinedInput-root {
            padding: 0px !important;
            height: 100% !important;
          }

          .MuiAutocomplete-input {
            padding: 0px !important;
            height: 100% !important;
          }
          .css-qzbt6i-MuiButtonBase-root-MuiIconButton-root-MuiAutocomplete-popupIndicator{
            margin-right: -10px !important;
          }
          .css-1umw9bq-MuiSvgIcon-root {
            font-size: var(--regular18-);
            color: var(--black-color);
          }
          .css-120dh41-MuiSvgIcon-root{
            display:none;
          }   
        `}
      </style>
      <Autocomplete
        disablePortal
        options={data}
        loadingText={"Loading Data..."}
        value={value || null}
        onChange={(event, newValue) => handleChange(newValue)}
        getOptionKey={(option) => option}
        sx={[
          {
            boxShadow: "var(--main-inner-boxShadow-color)",
            maxHeight: "50px",
            height: "5.5vh",
            minHeight: "45px",
            background: "var(--main-white-color)",
            width: "100%",
            padding: "10px",
            zIndex: "0",
            fontFamily: "var(--leagueSpartan-regular-400)",
            color: "var(--black-color)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            ...externalStyles,
            "& .MuiAutocomplete-loading": {
              color: "var(--black-color)",
            },
          },
          {
            ...styles.input,
          },
        ]}
        slotProps={{
          paper: {
            sx: {
              "& .MuiAutocomplete-option": {
                fontFamily: "var(--leagueSpartan-regular-400)",
                // backgroundColor: "var(--main-white-color)",
                color: "var(--black-color)",
                fontSize: "var(--regular18-)",
                "&[aria-selected='true']": {
                  backgroundColor: "var(--main-white-color)",
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
              backgroundColor: "var(--main-white-color)",
              color: "var(--black-color)",
              "& .MuiPaper-rounded": {
                backgroundColor: "var(--main-white-color)",
                color: "var(--black-color)",
                backdropFilter: "blur(50px)",
                fontFamily: "var(--leagueSpartan-regular-400)",
              },
            },
          },
        }}
        // className={`${classes.dropdownContainer}`}
        renderOption={(props, option) => {
          const show = disable ? option?.includes(disable) : false;
          return (
            <li {...props} key={props.key} aria-disabled={show}>
              {option as unknown as string}
            </li>
          );
        }}
        renderInput={(params: any) => (
          <TextField
            {...params}
            placeholder={placeholder}
            fullWidth
            sx={{
              background: background ? background : "transparent",
              borderRadius: "10px",
              fontFamily: "var(--leagueSpartan-regular-400)",
              fontSize: "var(--regular18-)", // Apply external fontSize to TextField
              color: "var(--black-color)",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "& .MuiInputBase-input::placeholder": {
                fontFamily: "var(--leagueSpartan-regular-400)",
                fontSize: "var(--regular18-)", // Apply external fontSize to placeholder
                lineHeight: "var(--regular18-)",
              },
              "& .MuiInputBase-input": {
                color: "var(--black-color)",
                fontFamily: "var(--leagueSpartan-regular-400)",
                fontSize: "var(--regular18-)", // Apply external fontSize to input
                lineHeight: "var(--regular18-)",
              },
              ":focus-visible": {
                border: "1px solid var(--main-white-color)",
              },
              ":focus": {
                border: "1px solid var(--main-white-color)",
              },
            }}
          />
        )}
      />
    </>
  );
};

export default DropDownSimple;

const styles = {
  input: {
    boxShadow: "var(--cards--boxShadow-color)",
    backgroundColor: "transparent",
    height: "100%",
    position: "relative",
    zIndex: 2,
    color: "var(--black-color)",
    borderRadius: "10px",
    fontFamily: "var(--leagueSpartan-regular-400)",
    // fontSize removed from here as it will be applied dynamically
  },
};
