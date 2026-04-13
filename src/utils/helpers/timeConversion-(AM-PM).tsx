const useConvertTimeToAMPM = (timeString: string): string => {
  const convertTime = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);

    // Convert hours to 12-hour format
    const isPM = hours >= 12;
    const adjustedHours = hours % 12 || 12;

    // Format time string
    return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${
      isPM ? "PM" : "AM"
    }`;
  };

  return convertTime(timeString);
};

export default useConvertTimeToAMPM;
