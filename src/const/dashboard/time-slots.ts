import moment from "moment";

const generateTimeSlots = (interval = 15, format = "24hr") => {
  const timeSlots = [];
  let hours = 0;
  let minutes = 0;

  while (hours < 24) {
    // Create a moment object for the current time
    const time = moment().hour(hours).minute(minutes).second(0);

    // Format the time based on the specified format
    let formattedTime;
    if (format === "12hr") {
      formattedTime = time.format("hh:mm A"); // 12-hour format with AM/PM
    } else {
      formattedTime = time.format("HH:mm:ss"); // 24-hour format
    }

    timeSlots.push(formattedTime);

    // Increment minutes
    minutes += interval;
    if (minutes === 60) {
      minutes = 0;
      hours++;
    }
  }

  return timeSlots;
};

export default generateTimeSlots;
