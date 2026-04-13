import React from "react";
import classes from "./page.module.css";

const Page = () => {
  return (
    <div className={classes.container}>
      <div className={classes.message}>No Permissions Granted 🔒</div>
    </div>
  );
};

export default Page;
