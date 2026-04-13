import React from "react";
import classes from "./demoCard.module.css";

const DemoCard: React.FC<{
  heading: string;
  number: number;
  icon: React.ReactNode;
  text: string;
}> = ({ heading, number, icon, text }) => {
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <p>{heading}</p>
        <span>{icon}</span>
      </div>
      <p className={classes.number}>{number}</p>
      <p className={classes.text}>{text}</p>
    </div>
  );
};

export default DemoCard;
