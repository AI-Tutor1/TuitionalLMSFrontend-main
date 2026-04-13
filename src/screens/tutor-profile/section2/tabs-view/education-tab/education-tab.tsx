import React from "react";
import { Box, Typography } from "@mui/material";
import { educationTabArr } from "@/const/dashboard/tutor-Profile/tutor-profile-tabsData";
import styles from "./education-tab.module.css";
import Button from "@/components/global/button/button";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { AboutEducationComponent } from "../../aboutEducation-tab-component/aboutEducation-component";

interface TabItem {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

interface EducationTabProps {
  cv: string;
  university: string;
  degree: string;
  degreeType: string;
  year: number;
  firstName?: string;
  lastName?: string;
}

const EducationTab: React.FC<EducationTabProps> = ({
  cv,
  university,
  degree,
  degreeType,
  year,
  firstName,
  lastName,
}) => {
  const propsArray = [university, degree, degreeType, year];
  const data = educationTabArr?.map((item, indx) => ({
    ...item,
    value: propsArray[indx],
  }));

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = cv;
    link.download = "Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box className={styles.container}>
      <div className={styles.section1}>
        <Typography className={styles.heading}>Education</Typography>
        <div className={styles.components}>
          {data?.map((item: TabItem, indx) => (
            <AboutEducationComponent
              key={indx}
              icon={item?.icon}
              title={item?.title}
              value={item?.value}
            />
          ))}
        </div>
      </div>
      <div className={styles.section2}>
        <Typography className={styles.heading}>Resume</Typography>
        <div className={styles.wrapper}>
          <div className={styles.pdfContainer}>
            <iframe
              src={cv}
              width="100%"
              height="100%"
              title="PDF Viewer"
              className={styles.iframe}
            >
              <a href={cv}>Download PDF</a>.
            </iframe>
          </div>
          <div className={styles.downloadBox}>
            <p>{`${firstName} ${lastName}`}’s CV</p>
            <Button
              text="Download CV"
              icon={<FileDownloadOutlinedIcon />}
              clickFn={downloadFile}
              inlineStyling={{ width: "40%", height: "100%", padding: "10px" }}
            />
          </div>
        </div>
      </div>
    </Box>
  );
};

export default EducationTab;
