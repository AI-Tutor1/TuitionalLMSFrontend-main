"use client";
import { aboutTabArr } from "@/const/dashboard/tutor-Profile/tutor-profile-tabsData";
import { Box, CardMedia, Typography } from "@mui/material";
import React, { useMemo, memo } from "react";
import { AboutEducationComponent } from "../../aboutEducation-tab-component/aboutEducation-component";
import styles from "./about.module.css";

interface TabItem {
  icon: React.ReactNode;
  title: string;
  value?: string;
}

interface AboutTabProps {
  video?: string;
  gender?: string;
  country?: string;
  availability?: string;
  date?: string;
}

const AboutTab: React.FC<AboutTabProps> = ({
  video,
  gender,
  country,
  date,
  availability,
}) => {
  const propsArray = useMemo(
    () => [date, country, availability, gender],
    [date, country, availability, gender]
  );

  const data = useMemo(
    () =>
      aboutTabArr?.map((item, indx) => ({
        ...item,
        value: propsArray[indx],
      })),
    [propsArray]
  );

  const allowedDomains = useMemo(
    () => ["https://dev.tuitionaledu.com", "http://91.108.112.253:4000"],
    []
  );

  const isAllowedDomain = useMemo(() => {
    return (url: string | undefined) => {
      if (!url) return false;
      return allowedDomains.some((domain) => url.startsWith(domain));
    };
  }, [allowedDomains]);

  return (
    <Box className={styles.container}>
      <div className={styles.section1}>
        About
        <div className={styles.components}>
          {data?.map((item: TabItem, indx) => (
            <AboutEducationComponent
              key={indx}
              icon={item.icon}
              title={item.title}
              value={item.value}
            />
          ))}
        </div>
      </div>
      <div className={styles.section2}>
        Video
        <div className={styles.videoBox}>
          {video && isAllowedDomain(video) ? (
            <div className={styles.wrapper}>
              <CardMedia
                component="iframe"
                src={video}
                sx={{ height: "100%", width: "100%", border: "1px solid #aaa" }}
              />{" "}
            </div>
          ) : video ? (
            <div className={styles.externalLink}>
              <a href={video} target="_blank" rel="noopener noreferrer">
                Click here to view the video
              </a>
            </div>
          ) : (
            <h1>No video available!</h1>
          )}
        </div>
      </div>
    </Box>
  );
};

export default memo(AboutTab);
