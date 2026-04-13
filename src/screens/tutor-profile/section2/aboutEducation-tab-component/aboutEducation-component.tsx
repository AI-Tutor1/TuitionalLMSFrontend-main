import React from "react";
import styles from "./tabs-component.module.css";

interface TabsComponentProps {
  icon: React.ReactNode;
  title: string;
  value?: string | number;
}

export const AboutEducationComponent: React.FC<TabsComponentProps> = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className={styles.container}>
      {icon}
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  );
};
