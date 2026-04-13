"use client";
import { useTheme } from "next-themes";
import { useEffect, useState, CSSProperties } from "react";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import classes from "./theme-toggle.module.css";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={classes.themeToggleContainer} data-theme={theme}>
      <button
        onClick={() => setTheme("light")}
        aria-label="Light mode"
        className={classes.themeButton}
      >
        <LightModeOutlinedIcon className={classes.icon} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
        className={classes.themeButton}
      >
        <DarkModeOutlinedIcon className={classes.icon} />
      </button>
    </div>
  );
};
