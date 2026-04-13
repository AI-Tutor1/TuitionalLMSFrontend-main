import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { SxProps, Theme } from "@mui/material/styles";

interface DropDownProps {
  placeholder: string;
  data: string[] | any;
  handleChange: any;
  handleOnInputChange?: (e: React.ChangeEvent<{}>) => void;
  value?: string;
  labelExternalStyles?: SxProps<Theme>;
  inlineDropDownStyles?: any;
  preFetchValue?: any;
  background?: string;
  loading?: boolean;
  fontSize?: string; // New prop for external fontSize control
}

const DropDownObjects: React.FC<DropDownProps> = ({
  placeholder,
  data = [],
  handleChange,
  handleOnInputChange,
  value,
  inlineDropDownStyles,
  preFetchValue,
  background,
  loading,
  fontSize = "clamp(0.875rem, 0.804rem + 0.357vw, 1.125rem)", // Default fontSize value
}) => {
  const safelyParseJSON = (jsonString: string) => {
    if (jsonString) {
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        // console.error("Failed to parse JSON:", error);
        return null;
      }
    }
    return null;
  };

  const imageUrl = (url: string) => {
    if (
      url &&
      url.trim() !== "" &&
      (url.startsWith("http://") || url.startsWith("https://"))
    ) {
      return url;
    }
    return "/assets/images/static/demmyPic.png";
  };

  return (
    <>
      <style>{`
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

`}</style>

      <Autocomplete
        disablePortal
        options={data}
        loadingText="Loading Data..."
        loading={loading}
        getOptionLabel={(option) => {
          const parsedOption = safelyParseJSON(option);
          return parsedOption ? parsedOption?.name : "";
        }}
        getOptionKey={(option) =>
          JSON.parse(option)?.id || JSON.parse(option)?.name
        }
        value={value}
        onChange={(event, newValue) =>
          handleChange({ target: { value: newValue } })
        }
        onInputChange={handleOnInputChange}
        sx={[
          {
            maxHeight: "50px",
            height: "5.5vh !important",
            minHeight: "45px",
            width: "100%",
            padding: "10px",
            zIndex: "0 !important",
            fontFamily: "var(--leagueSpartan-regular-400)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "var(--regular18-)",
            ...inlineDropDownStyles,
            "& .MuiAutocomplete-loading": {
              color: "var(--black-color) !important",
            },
          },
          {
            ...styles.input,
            fontSize: fontSize ? fontSize : "var(--regular18-)", // Apply external fontSize to input styles
          },
        ]}
        slotProps={{
          paper: {
            sx: {
              "& .MuiAutocomplete-option": {
                fontFamily: "var(--leagueSpartan-regular-400)",
                backgroundColor: "transparent",
                color: "var(--black-color)",
                fontSize: "var(--regular18-)", // Apply external fontSize to options
                "&[aria-selected='true']": {
                  backgroundColor: "transparent",
                  color: "var(--black-color)",
                },
                "&:hover": {
                  background: "var(--main-blue-color)",
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
              color: "var(--black-color) !important",
              "& .MuiPaper-rounded": {
                backgroundColor: "var(--main-white-color) !important",
                color: "var(--black-color) !important",
                backdropFilter: "blur(50px)",
                fontFamily: "var(--leagueSpartan-regular-400)",
              },
            },
          },
        }}
        renderOption={(props, option, { selected }) => {
          const parsedOption = safelyParseJSON(option);
          const image = parsedOption?.hasOwnProperty("profileImageUrl");
          const isMatchedWithPreFetch = parsedOption?.name === preFetchValue;
          const { key, ...restProps } = props;
          return (
            <Box
              component="li"
              {...restProps}
              key={parsedOption?.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: selected
                  ? "var(--white-color) !important"
                  : isMatchedWithPreFetch
                    ? "var(--white-color) !important" // Apply white color if matched with preFetch
                    : "var(--black-color)", // Black color otherwise
                backgroundColor: selected
                  ? "var(--main-color) !important" // Apply main color if selected
                  : isMatchedWithPreFetch
                    ? "var(--main-color) !important" // Apply main color if matched with preFetch
                    : "transparent", // Transparent otherwise
                "&:hover": {
                  backgroundColor: "var(--main-blue-color) !important",
                },
              }}
            >
              <>
                {image && (
                  <Image
                    src={imageUrl(
                      parsedOption?.profileImageUrl ||
                        "/assets/images/static/demmyPic.png",
                    )}
                    alt={parsedOption?.name || "No Show"}
                    width={30}
                    height={30}
                    style={{
                      width: "var(--sub-heading)",
                      height: "var(--sub-heading)",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                )}
                <Typography
                  sx={{
                    fontFamily: "var(--leagueSpartan-regular-400)",
                    fontSize: "var(--regular18-)", // Apply external fontSize to typography
                    color: "var(--black-color) !important",
                  }}
                >
                  {parsedOption?.name}
                </Typography>
              </>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            placeholder={placeholder}
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
                fontSize: "var(--regular18-)",
                lineHeight: "var(--regular18-)", // Apply external fontSize to placeholder
                // color: "var(--text-grey)",
              },
              "& .MuiInputBase-input": {
                color: "var(--black-color) !important",
                fontFamily: "var(--leagueSpartan-regular-400)",
                fontSize: "var(--regular18-)", // Apply external fontSize to input
                lineHeight: "var(--regular18-)",
              },
              ":focus-visible": {
                border: "1px solid white",
              },
              ":focus": {
                border: "1px solid white",
              },
            }}
          />
        )}
      />
    </>
  );
};

export default React.memo(DropDownObjects);

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
  },
};
