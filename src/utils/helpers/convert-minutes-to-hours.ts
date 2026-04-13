import React from "react";
import moment from "moment";

// Utility function to format duration
export const MinutesToHours = (durationInMinutes: number) => {
  if (typeof durationInMinutes === "number") {
    // Create a duration object from the minutes
    const duration = moment.duration(durationInMinutes, "minutes");

    // Extract hours and minutes
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    // Conditional formatting based on duration
    if (durationInMinutes < 60) {
      return `${minutes} m`; // Show only minutes
    } else {
      return `${hours} hr ${minutes > 0 ? `${minutes} m` : ""}`.trim(); // Show hours and minutes
    }
  } else {
    return "Invalid duration"; // Handle invalid duration
  }
};
