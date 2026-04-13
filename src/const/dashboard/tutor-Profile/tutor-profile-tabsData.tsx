import Image from "next/image";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import AccessTimeFilledOutlinedIcon from "@mui/icons-material/AccessTimeFilledOutlined";
import TransgenderOutlinedIcon from "@mui/icons-material/TransgenderOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";

interface TabItem {
  icon: React.ReactNode;
  title: string;
}

export const aboutTabArr: TabItem[] = [
  {
    icon: <CalendarTodayIcon />,
    title: "Date Submitted",
  },
  {
    icon: <PublicOutlinedIcon />,
    title: "Country",
  },
  {
    icon: <AccessTimeFilledOutlinedIcon />,
    title: "Availability",
  },
  {
    icon: <TransgenderOutlinedIcon />,
    title: "Gender",
  },
];

export const educationTabArr: TabItem[] = [
  {
    icon: (
      <div style={{ width: "1.2vw", height: "1.2vw", position: "relative" }}>
        <Image
          src={"/assets/svgs/university.svg"}
          alt="university"
          layout="fill"
          objectFit="cover"
        />
      </div>
    ),
    title: "University",
  },
  {
    icon: <SchoolIcon />,
    title: "Degree",
  },
  {
    icon: <SchoolIcon />,
    title: "Deegre Type",
  },
  {
    icon: (
      <div style={{ width: "1.2vw", height: "1.2vw", position: "relative" }}>
        <Image
          src={"/assets/svgs/year.svg"}
          alt="university"
          layout="fill"
          objectFit="cover"
        />
      </div>
    ),
    title: "Year",
  },
];
