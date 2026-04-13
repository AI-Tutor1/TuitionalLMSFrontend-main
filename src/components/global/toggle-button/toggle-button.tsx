import * as React from "react";
import Switch from "@mui/material/Switch";

interface BasicSwitchesProps {
  handleToggle?: any;
  value?: boolean;
  background?: string;
}

const BasicSwitches: React.FC<BasicSwitchesProps> = ({
  handleToggle,
  value,
  background,
}) => {
  return (
    <Switch
      checked={value}
      onClick={handleToggle}
      sx={{
        width: 50,
        // Track (background) color when unchecked
        "& .MuiSwitch-track": {
          backgroundColor: "var(--text-grey)",
          opacity: 1,
        },
        // Thumb (circle) color when checked
        "& .MuiSwitch-switchBase.Mui-checked": {
          color: background || "var(--main-blue-color)",
        },
        // Track (background) color when checked
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
          backgroundColor: background || "var(--main-blue-color)",
          opacity: 0.5,
        },
        "& .MuiSwitch-thumb": {
          width: 19,
          height: 19,
        },
      }}
    />
  );
};

export default BasicSwitches;
