const calculateDuration = (start: string, end: string): string => {
  const [startHour, startMinute] = start?.split(/[: ]/);
  const [endHour, endMinute] = end?.split(/[: ]/);

  let startSeconds = Number(startHour) * 60 * 60 + Number(startMinute) * 60;
  let endSeconds = Number(endHour) * 60 * 60 + Number(endMinute) * 60;

  let diff = endSeconds - startSeconds;
  let hours = diff / 3600;
  let minutes = (diff / 60) % 60;
  return `${hours >= 1 ? `${hours}h ` : ""}${
    minutes >= 1 ? `${minutes}m ` : ""
  }`;
};

export default calculateDuration;
