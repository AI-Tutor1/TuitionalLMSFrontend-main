export const getConclusionTypeStyles = (
  conclusionType: string,
  fontSize?: string,
) => {
  const baseStyles = {
    width: "fit-content",
    padding: "5px",
    borderRadius: "4px",
    fontSize: fontSize || "var(--regular14-)",
    lineHeight: fontSize || "var(--regular14-)",
    fontFamily: "var(--leagueSpartan-medium-500)",
    letterSpacing: "1px",
  };

  let colorStyles = {};

  switch (conclusionType) {
    case "Cancelled":
      colorStyles = {
        color: "var(--red-text-color1)",
        backgroundColor: "var(--red-background-color2)",
      };
      break;
    case "Conducted":
      colorStyles = {
        color: "var(--green-text-color3)",
        backgroundColor: "var(--green-background-color4)",
      };
      break;
    case "Student Absent":
      colorStyles = {
        color: "var(--blue-text-color1)",
        backgroundColor: "var(--blue-background-color1)",
      };
      break;
    case "Teacher Absent":
      colorStyles = {
        color: "var(--purple-text-color1)",
        backgroundColor: "var(--purple-background-color1)",
      };
      break;
    default: // No Show or any other
      colorStyles = {
        color: "var(--orange-text-color1)",
        backgroundColor: "var(--orange-background-color1)",
      };
  }

  return { ...baseStyles, ...colorStyles };
};

export const getTagTypeStyles = (tag: string, fontSize?: string) => {
  const baseStyles = {
    padding: "5px",
    borderRadius: "4px",
    fontFamily: "var(--leagueSpartan-regular-400)",
    fontSize: fontSize || "var(--regular14-)",
    lineHeight: fontSize || "var(--regular14-)",
    width: "max-content",
    letterSpacing: "1px",
  };

  let colorStyles = {};

  switch (tag) {
    case "External":
      colorStyles = {
        color: "var(--red-color2)",
        backgroundColor: "var(--red-background-color2)",
      };
      break;
    case "Normal":
      colorStyles = {
        color: "var(--green-text-color1)",
        backgroundColor: "var(--green-background-color4)",
      };
      break;
    case "Extra":
      colorStyles = {
        color: "var(--blue-text-color1)",
        backgroundColor: "var(--blue-background-color1)",
      };
      break;
    case "Manual":
      colorStyles = {
        color: "var(--orange-text-color1)",
        backgroundColor: "var(--orange-background-color1)",
      };
      break;
    default: // No Show or any other
      colorStyles = {
        color: "var(--main-white-color)",
        backgroundColor: "var(--darkGrey-color)",
      };
  }

  return { ...baseStyles, ...colorStyles };
};
