import React from "react";
import classes from "./html-reviewer.module.css";
import { sanitizeHTML } from "@/utils/helpers/sanitize-html";

interface HtmlReviewerProps {
  children: string;
}

const HtmlReviewer: React.FC<HtmlReviewerProps> = ({ children }) => {
  return (
    <div
      className={classes.container}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(children || "") }}
    />
  );
};

export default HtmlReviewer;
