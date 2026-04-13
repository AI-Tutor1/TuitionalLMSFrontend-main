import React, { memo, SyntheticEvent, CSSProperties } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { SxProps, Theme } from "@mui/material/styles";
import classes from "./multi-select-dropDown.module.css";

interface MultiSelectDropDownProps {
  placeholder: string;
  data: any[];
  handleChange: (event: SyntheticEvent<Element, Event>, value: any[]) => void;
  value?: any[];
  labelExternalStyles?: SxProps<Theme>;
  inlineDropDownStyles?: any;
  preFetchValues?: any[];
  margin?: string;
  width?: string | number;
  height?: string;
  background?: string;
  inlineBoxStyles?: any;
  icon?: boolean;
  loading?: boolean;
  innerBoxShadow?: string;
  inputStyles?: CSSProperties;
}

const MultiSelectDropDown: React.FC<MultiSelectDropDownProps> = ({
  placeholder,
  data = [],
  handleChange,
  value,
  labelExternalStyles,
  inlineDropDownStyles,
  preFetchValues = [],
  width,
  margin,
  height,
  background,
  inlineBoxStyles,
  icon,
  loading,
  innerBoxShadow,
  inputStyles,
}) => {
  // Check if the option is pre-fetched (if any preFetchValues are provided)
  const isPreFetched = (option: any) => {
    return preFetchValues?.some(
      (preFetchValue: any) => preFetchValue?.id === option?.id,
    );
  };

  const imageUrl = (url: string) => {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      return url;
    } else {
      return "/assets/images/static/demmyPic.png";
    }
  };

  return (
    <>
      <style>
        {`
          .MuiFormControl-root {
            height: 100% !important;
            background: transparent;
          }
          .MuiOutlinedInput-root {
            padding: 0px !important;
            height: 100% !important;
            background: transparent;
          }
          .MuiAutocomplete-input {
            padding: 0px !important;
            background: transparent;
            height: 100% !important;
          }
          .MuiAutocomplete-inputRoot {
            display: flex;
            align-items: center;
            gap: 2px;
            flex-wrap: nowrap;
            overflow-x: auto !important; 
            outline: none;
            border:none;
          }
          .MuiAutocomplete-tag {
            background-color: var(--main-color);
            color: var(--pure-white-color);
            font-family: var(--leagueSpartan-regular-400);
            font-size: var(--regular18-) !important;
            line-height: var(--regular18-) !important;
            width: max-content;
            height: max-content;
            margin: 0px 3px 0px 0px !important;
            padding: 0px;
          }   
          .MuiAutocomplete-tag > span{
          padding: 5px 8px;
          }  
          .MuiChip-deleteIcon {
            font-size: var(--regular18-) !important;
            color: var(--pure-white-color) !important;
          }
          .MuiAutocomplete-popper .MuiPaper-root {
            max-height: clamp(200px, 40vh, 400px) !important;
          }
          .MuiAutocomplete-listbox {
            max-height: clamp(200px, 40vh, 400px) !important;
          }
        `}
      </style>

      <div className={classes.subWrapper} style={{ ...inlineBoxStyles }}>
        {icon && (
          <div className={classes.imageBox}>
            <Image
              src="/assets/svgs/filterSvg.svg"
              alt="filter"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <Autocomplete
          style={{ ...inlineDropDownStyles }}
          multiple
          disablePortal
          options={data}
          loadingText="Loading Data..."
          loading={loading}
          getOptionLabel={(option) =>
            option?.name || option?.reason || option?.question || ""
          }
          getOptionKey={(option) =>
            option?.id ||
            option?.name ||
            option?.reason ||
            option?.question ||
            ""
          }
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          value={value || []}
          onChange={handleChange}
          sx={[
            {
              maxHeight: "50px",
              height: "5.5vh !important",
              minHeight: "45px",
              width: "100%",
              // padding: "10px",
              fontFamily: "var(--leagueSpartan-regular-400)",
              display: "flex",
              alignItems: "center",
              ...inlineDropDownStyles,
              "& .MuiAutocomplete-loading": {
                color: "var(--black-color)",
              },
              "& .MuiAutocomplete-popupIndicator": {
                color: "var(--black-color)",
              },
            },
            {
              backgroundColor: "transparent",
              height: "100%",
              position: "relative",
              zIndex: 2,
              color: "var(--black-color)",
              borderRadius: "10px",
              fontSize: "var(--regular18-)",
              lineHeight: "var(--regular18-)",
              fontFamily: "var(--leagueSpartan-regular-400)",
              boxShadow: icon
                ? "none"
                : innerBoxShadow || "var(--cards--boxShadow-color)",
            },
          ]}
          slotProps={{
            paper: {
              sx: {
                maxHeight: "clamp(200px, 40vh, 400px) !important",
                "& .MuiAutocomplete-option": {
                  fontFamily: "var(--leagueSpartan-regular-400)",
                  backgroundColor: "transparent",
                  color: "var(--black-color)",
                  fontSize: "var(--regular18-)",
                  lineHeight: "var(--regular18-)",
                  padding: "8px 12px",
                  "&[aria-selected='true']": {
                    backgroundColor: "var(--main-blue-color) !important",
                    color: "var(--main-white-color) !important",
                  },
                  "&:hover": {
                    backgroundColor: "var(--main-blue-color) !important",
                    color: "var(--main-white-color) !important",
                  },
                  "& .MuiAutocomplete-loading": {
                    color: "var(--black-color)",
                  },
                },
                "& .MuiAutocomplete-listbox": {
                  maxHeight: "clamp(200px, 40vh, 400px) !important",
                  padding: 0,
                },
              },
            },
            popper: {
              sx: {
                backgroundColor: "transparent",
                color: "var(--black-color) !important",
                "& .MuiPaper-root": {
                  backgroundColor: "var(--main-white-color) !important",
                  color: "var(--black-color) !important",
                  fontFamily: "var(--leagueSpartan-regular-400)",
                  borderRadius: "8px",
                  maxHeight: "clamp(200px, 40vh, 400px) !important",
                },
              },
            },
          }}
          renderOption={(props, option, { selected }) => {
            const image = option?.hasOwnProperty("profileImageUrl");
            const isMatchedWithPreFetch = isPreFetched(option);
            const isHighlighted = selected || isMatchedWithPreFetch;
            const { key, ...otherProps } = props;

            return (
              <Box
                component="li"
                key={key}
                {...otherProps}
                sx={{
                  display: "flex !important",
                  alignItems: "center",
                  gap: 1,
                  padding: "8px 12px",
                  color: isHighlighted
                    ? "var(--main-white-color) !important"
                    : "var(--black-color)",
                  backgroundColor: isHighlighted
                    ? "var(--main-blue-color) !important"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: "var(--main-blue-color) !important",
                    color: "var(--main-white-color) !important",
                  },
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                {image && (
                  <Image
                    src={imageUrl(option?.profileImageUrl)}
                    alt={
                      option?.name ||
                      option?.reason ||
                      option?.question ||
                      "User"
                    }
                    width={30}
                    height={30}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "var(--leagueSpartan-regular-400)",
                    fontSize: "var(--regular18-)",
                    lineHeight: "var(--regular18-)",
                    color: "inherit",
                  }}
                >
                  {option?.name ||
                    option?.reason ||
                    option?.question ||
                    "No Name"}
                </Typography>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholder}
              fullWidth
              sx={{
                background: background || "transparent",
                borderRadius: "10px",
                fontFamily: "var(--leagueSpartan-regular-400)",
                fontSize: "var(--regular18-)",
                lineHeight: "var(--regular18-)",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                  outline: "none",
                },
                "& .MuiInputBase-input::placeholder": {
                  fontFamily: "var(--leagueSpartan-regular-400) !important",
                  fontSize: "var(--regular18-) !important",
                  lineHeight: "var(--regular18-) !important",
                  letterSpacing: "1px",
                },
                "& .MuiInputBase-input": {
                  color: "var(--black-color) !important",
                  fontFamily: "var(--leagueSpartan-regular-400)",
                  fontSize: "var(--regular18-)",
                  lineHeight: "var(--regular18-)",
                  letterSpacing: "1px",
                },
                color: "var(--black-color)",
                padding: "10px",
                ...inputStyles,
              }}
            />
          )}
        />
      </div>
    </>
  );
};

export default memo(MultiSelectDropDown);
