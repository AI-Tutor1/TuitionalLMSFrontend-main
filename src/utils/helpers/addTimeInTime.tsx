/**
 * Function to add hours and minutes to a time string in AM/PM format.
 *
 * @param timeString - Time string in AM/PM format (e.g., "9:15 PM").
 * @param addHours - Number of hours to add.
 * @param addMinutes - Number of minutes to add.
 * @returns - Updated time string in AM/PM format.
 */
const addTime = (
  timeString: string,
  addHours: number,
  addMinutes: number
): string => {
  const [timePart, period] = timeString.split(" ");
  const [hours, minutes] = timePart.split(":").map(Number);

  // Convert hours to 24-hour format
  const hoursIn24Format = period === "PM" ? (hours % 12) + 12 : hours % 12;

  // Calculate new time in minutes
  let totalMinutes = hoursIn24Format * 60 + minutes;
  totalMinutes += addHours * 60 + addMinutes;

  // Convert back to hours and minutes
  const newHoursIn24Format = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  // Determine AM/PM period
  const newPeriod = newHoursIn24Format >= 12 ? "PM" : "AM";
  const newHours = newHoursIn24Format % 12 || 12;

  // Format time string
  return `${newHours}:${newMinutes.toString().padStart(2, "0")} ${newPeriod}`;
};

const useAddTime = (
  timeString: string,
  addHours: number,
  addMinutes: number
): string => {
  return addTime(timeString, addHours, addMinutes);
};

export default useAddTime;
