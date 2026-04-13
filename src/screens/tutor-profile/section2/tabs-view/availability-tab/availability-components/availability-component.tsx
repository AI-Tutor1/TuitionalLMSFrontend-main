import { Box, SxProps, Theme } from "@mui/material";
import Image from "next/image";
import calculateDuration from "@/utils/helpers/timeDuration";

interface AvailabilityComponentProps {
  duration?: string;
  stime: string;
  etime: string;
}

const AvailabilityComponent: React.FC<AvailabilityComponentProps> = ({
  stime,
  etime,
}) => {
  const duration = calculateDuration(stime, etime);
  return (
    <Box sx={styles.container}>
      <div style={styles.textBox}>
        <p style={styles.duration}>{duration}</p>
        <p style={styles.time}>{`${stime}-${etime}`}</p>
      </div>
      <div style={styles.imageBox}>
        <Image
          src={"/assets/svgs/sun.svg"}
          alt="sun icon"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </Box>
  );
};

export default AvailabilityComponent;

const styles: {
  container: SxProps<Theme>;
  textBox: React.CSSProperties;
  imageBox: React.CSSProperties;
  duration: React.CSSProperties;
  time: React.CSSProperties;
} = {
  container: {
    flex: "0 1 31%",
    height: "64px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1vw",
    position: "relative",
    overflow: "hidden",
    padding: "10px",
    background: "#ade0fe",
    borderRadius: "10px",
  },
  textBox: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  duration: {
    fontFamily: "var(--leagueSpartan-semiBold-600)",
    fontSize: "1.042vw",
  },
  time: {
    fontFamily: "var(--leagueSpartan-semiBold-400)",
    fontSize: "0.729vw",
    color: "#848484",
  },
  imageBox: {
    position: "relative",
    width: "1.615vw",
    height: "1.615vw",
    borderRadius: "100%",
  },
};
