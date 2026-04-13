"use client";
import { FC } from "react";
import Marquee from "react-fast-marquee";
import { useAppSelector } from "@/lib/store/hooks/hooks";

const CustomMarquee: FC = () => {
  const { user } = useAppSelector((state) => state.user);
  return (
    <Marquee
      play={true}
      direction="right"
      speed={50}
      gradient={true}
      gradientColor="var(--grey-color1)"
      pauseOnHover={true}
      autoFill={true}
      style={{
        color: "var(--pure-white-color)",
        backgroundColor: "var(--darkGrey-color)",
        fontFamily: "var(--leagueSpartan-semiBold-600)",
        fontSize: "var(--regular18-)",
        height: "max-content",
      }}
    >
      {user?.roleId === 1 || user?.roleId === 2
        ? ""
        : user?.roleId === 3
          ? "Student policy has been updated.\u00A0\u00A0\u00A0\u00A0"
          : user?.roleId === 4
            ? "Student policy has been updated.\u00A0\u00A0\u00A0\u00A0"
            : user?.roleId === 5
              ? "Verify earnings and report issues by the 2nd — no changes after settlement!\u00A0\u00A0\u00A0\u00A0"
              : ""}
    </Marquee>
  );
};

export default CustomMarquee;
