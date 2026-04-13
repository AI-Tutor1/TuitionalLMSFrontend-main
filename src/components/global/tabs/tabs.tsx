import { CSSProperties, memo } from "react";
import Button from "@/components/global/button/button";
import classes from "./tabs.module.css";

interface TabItem {
  text: string;
  icon: React.ReactNode;
}

interface TabsProps {
  tabsArray: string[] | TabItem[];
  activeTab: string;
  handleTabChange: (tab: string) => void;
  inlineTabsStyles?: CSSProperties;
  buttonHeight?: string;
  buttonWidth?: string;
  buttonPadding?: string;
  borderRadius?: string;
  textAlign?: string;
  fontSize?: string;
  activeBackgroundColor?: string;
  border?: string;
  activeButtonColor?: string;
  icon?: boolean; // Change to boolean to indicate if tabsArray contains icons
}

const Tabs: React.FC<TabsProps> = ({
  tabsArray = [],
  activeTab,
  handleTabChange,
  inlineTabsStyles,
  buttonHeight = "100%",
  buttonWidth = "100%",
  buttonPadding,
  activeBackgroundColor = "var(--main-blue-color)",
  borderRadius = "10px",
  border,
  textAlign = "center",
  fontSize = "var(--regular18-)",
  activeButtonColor = "var(--pure-white-color)",
  icon,
}) => {
  const getButtonStyle = (isActive: boolean): CSSProperties => ({
    height: buttonHeight,
    width: buttonWidth,
    borderRadius: isActive && borderRadius ? borderRadius : undefined,
    borderBottom: isActive && border ? border : undefined,
    fontSize,
    lineHeight: fontSize,
    fontFamily: "var(--leagueSpartan-medium-500)",
    padding: buttonPadding ? buttonPadding : "10px",
    textAlign: textAlign as CSSProperties["textAlign"],
    backgroundColor: isActive ? activeBackgroundColor : "transparent",
    color: isActive
      ? activeButtonColor
      : (inlineTabsStyles?.color ?? "var(--black-color)"),
  });

  return (
    <div className={classes.tabs} style={inlineTabsStyles}>
      {icon
        ? (tabsArray as TabItem[])?.map((item) => (
            <button
              key={item.text}
              style={getButtonStyle(activeTab === item.text)}
              onClick={() => handleTabChange(item.text)}
            >
              {item.icon}
            </button>
          ))
        : (tabsArray as string[])?.map((item) => (
            <Button
              key={item}
              text={item}
              inlineStyling={getButtonStyle(activeTab === item)}
              clickFn={() => handleTabChange(item)}
            />
          ))}
    </div>
  );
};

export default memo(Tabs);
