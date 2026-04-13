import React, { CSSProperties } from "react";
import classes from "./dotted-loader.module.css";

interface DottedLoaderProps {
  dotCount?: number;
  size?: number | string;
  gap?: number | string;
  speed?: number; // animation duration in seconds
  color?: string;
  activeColor?: string;
  className?: string;
  dotClassName?: string;
  style?: CSSProperties;
  dotStyle?: CSSProperties;
}

const DottedLoader: React.FC<DottedLoaderProps> = ({
  dotCount = 5,
  size = 10,
  gap = 8,
  speed = 1.2,
  color,
  activeColor,
  className = "",
  dotClassName = "",
  style,
  dotStyle,
}) => {
  const resolvedSize = typeof size === "number" ? `${size}px` : size;
  const resolvedGap = typeof gap === "number" ? `${gap}px` : gap;

  return (
    <div
      className={`${classes.wrapper} ${className}`}
      style={{ gap: resolvedGap, ...style }}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: dotCount }).map((_, i) => (
        <span
          key={i}
          className={`${classes.dot} ${dotClassName}`}
          style={{
            display: "inline-block", // guarantees width/height apply
            width: resolvedSize,
            height: resolvedSize,
            backgroundColor: color,
            animationDuration: `${speed}s`,
            animationDelay: `${(i * speed) / dotCount}s`,
            ...(activeColor && { ["--dot-active-color" as any]: activeColor }),
            ...dotStyle,
          }}
        />
      ))}
    </div>
  );
};

export default DottedLoader;
