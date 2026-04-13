import React from "react";
import classes from "./html-reviewer.module.css";

interface HtmlReviewerProps {
  children: string;
}

const HtmlReviewer: React.FC<HtmlReviewerProps> = ({ children }) => {
  return (
    <div
      className={classes.container}
      dangerouslySetInnerHTML={{ __html: children || "" }}
    />
  );
};

export default HtmlReviewer;
