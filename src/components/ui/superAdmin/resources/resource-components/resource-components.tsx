import React from "react";
import styles from "./resource-component.module.css";
import Image from "next/image";

interface ResourcesComponentsProps {
  id: number;
  name: string;
  createdAt: string;
  deleteModalToggle: (id: number) => void;
  updateModalToggle: (id: number) => void;
}

const ResourcesComponents: React.FC<ResourcesComponentsProps> = ({
  id,
  name,
  createdAt,
  deleteModalToggle,
  updateModalToggle,
}) => {
  const date = new Date(createdAt);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  const handleDeleteClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    deleteModalToggle(id);
  };

  return (
    <main
      className={styles.container}
      onClick={() => {
        console.log(id);
        updateModalToggle(id);
      }}
    >
      <div className={styles.textIconBox}>
        <p className={styles.heading}>{name}</p>
        <span className={styles.iconBox} onClick={handleDeleteClick}>
          <Image
            src="/assets/svgs/delete.svg"
            alt="delete"
            width={0}
            height={0}
            style={{
              width: "var(--regular18-)",
              height: "var(--regular18-)",
            }}
          />
        </span>
      </div>

      <div>
        <div className={styles.dateBox}>
          <div>
            <span>Day</span>
            <span>{day}</span>
          </div>
          <div>
            <span>Month</span>
            <span>{month}</span>
          </div>
          <div>
            <span>Year</span>
            <span>{year}</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResourcesComponents;
